#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
};

/// On-chain spending caps mirror off-chain `daily_cap` / `max_per_tx`.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Policy {
    pub daily_limit: i128,
    pub max_single_tx: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct WalletDay {
    pub wallet_id: String,
    pub day: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Spent(WalletDay),
    Admin,
    WalletPolicy(String),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PolicyError {
    OverSingleTxLimit = 1,
    OverDailyLimit = 2,
    NegativeAmount = 3,
    NotAuthorized = 4,
    InvalidPolicy = 5,
}

#[contract]
pub struct SpendingPolicy;

#[contractimpl]
impl SpendingPolicy {
    /// One-time admin bootstrap (first caller wins).
    pub fn init_admin(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            return;
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.events()
            .publish((symbol_short!("admin"),), admin);
    }

    /// Store a per-wallet policy override (admin-gated when admin is set).
    pub fn set_wallet_policy(
        env: Env,
        wallet_id: String,
        policy: Policy,
    ) -> Result<(), PolicyError> {
        if policy.daily_limit <= 0 || policy.max_single_tx <= 0 {
            return Err(PolicyError::InvalidPolicy);
        }
        if policy.max_single_tx > policy.daily_limit {
            return Err(PolicyError::InvalidPolicy);
        }
        Self::require_admin(&env)?;
        env.storage()
            .instance()
            .set(&DataKey::WalletPolicy(wallet_id.clone()), &policy);
        env.events().publish(
            (symbol_short!("setpol"), wallet_id),
            (policy.daily_limit, policy.max_single_tx),
        );
        Ok(())
    }

    pub fn get_wallet_policy(env: Env, wallet_id: String) -> Option<Policy> {
        env.storage()
            .instance()
            .get(&DataKey::WalletPolicy(wallet_id))
    }

    /// Read persisted on-chain spend for wallet + UTC day index.
    pub fn get_spent(env: Env, wallet_id: String, day: u32) -> i128 {
        let key = DataKey::Spent(WalletDay { wallet_id, day });
        env.storage().instance().get(&key).unwrap_or(0)
    }

    /// Validate and persist spend atomically (authoritative on-chain daily total).
    /// Stored wallet policy overrides the call-site `policy` when present.
    pub fn try_spend(
        env: Env,
        wallet_id: String,
        policy: Policy,
        amount: i128,
        day: u32,
    ) -> Result<(), PolicyError> {
        if amount <= 0 {
            return Err(PolicyError::NegativeAmount);
        }

        let effective = env
            .storage()
            .instance()
            .get(&DataKey::WalletPolicy(wallet_id.clone()))
            .unwrap_or(policy);

        if amount > effective.max_single_tx {
            return Err(PolicyError::OverSingleTxLimit);
        }

        let key = DataKey::Spent(WalletDay {
            wallet_id: wallet_id.clone(),
            day,
        });
        let spent: i128 = env.storage().instance().get(&key).unwrap_or(0);

        if spent.saturating_add(amount) > effective.daily_limit {
            return Err(PolicyError::OverDailyLimit);
        }

        let new_spent = spent + amount;
        env.storage().instance().set(&key, &new_spent);
        env.events().publish(
            (symbol_short!("spend"), wallet_id, day),
            (amount, new_spent, effective.daily_limit),
        );
        Ok(())
    }

    /// Stateless check (legacy / simulate-only). Prefer `try_spend` for authoritative ledger.
    pub fn check_spend(
        env: Env,
        policy: Policy,
        amount: i128,
        spent_today: i128,
    ) -> Result<(), PolicyError> {
        let _ = env;
        if amount <= 0 {
            return Err(PolicyError::NegativeAmount);
        }
        if amount > policy.max_single_tx {
            return Err(PolicyError::OverSingleTxLimit);
        }
        if spent_today.saturating_add(amount) > policy.daily_limit {
            return Err(PolicyError::OverDailyLimit);
        }
        Ok(())
    }

    fn require_admin(env: &Env) -> Result<(), PolicyError> {
        let admin: Option<Address> = env.storage().instance().get(&DataKey::Admin);
        match admin {
            Some(a) => {
                a.require_auth();
                Ok(())
            }
            None => Ok(()),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, String};

    fn policy() -> Policy {
        Policy {
            daily_limit: 1_000,
            max_single_tx: 200,
        }
    }

    #[test]
    fn try_spend_persists_daily_total() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(SpendingPolicy, ());
        let client = SpendingPolicyClient::new(&env, &contract_id);
        let wallet = String::from_str(&env, "wallet-1");
        let day = 20_000u32;

        client.try_spend(&wallet, &policy(), &50, &day);
        client.try_spend(&wallet, &policy(), &100, &day);
        assert_eq!(client.get_spent(&wallet, &day), 150);
    }

    #[test]
    fn try_spend_rejects_over_daily() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(SpendingPolicy, ());
        let client = SpendingPolicyClient::new(&env, &contract_id);
        let wallet = String::from_str(&env, "wallet-2");
        let day = 20_001u32;

        // Max single tx is 200 — fill daily with legal chunks, then overflow.
        client.try_spend(&wallet, &policy(), &200, &day);
        client.try_spend(&wallet, &policy(), &200, &day);
        client.try_spend(&wallet, &policy(), &200, &day);
        client.try_spend(&wallet, &policy(), &200, &day);
        client.try_spend(&wallet, &policy(), &200, &day); // 1000 / 1000
        let res = client.try_try_spend(&wallet, &policy(), &1, &day);
        assert!(res.is_err(), "expected over-daily deny, got {:?}", res);
    }

    #[test]
    fn stored_policy_overrides_call_site() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(SpendingPolicy, ());
        let client = SpendingPolicyClient::new(&env, &contract_id);
        let wallet = String::from_str(&env, "wallet-3");
        let day = 20_002u32;
        let tight = Policy {
            daily_limit: 100,
            max_single_tx: 50,
        };
        client.set_wallet_policy(&wallet, &tight);
        let over = client.try_try_spend(&wallet, &policy(), &60, &day);
        assert!(over.is_err(), "expected over-single deny, got {:?}", over);
        client.try_spend(&wallet, &policy(), &40, &day);
        assert_eq!(client.get_spent(&wallet, &day), 40);
    }

    #[test]
    fn check_spend_stateless_still_works() {
        let env = Env::default();
        assert!(SpendingPolicy::check_spend(env, policy(), 50, 100).is_ok());
    }
}
