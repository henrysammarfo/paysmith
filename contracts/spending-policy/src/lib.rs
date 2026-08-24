#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Env, String};

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
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum PolicyError {
    OverSingleTxLimit = 1,
    OverDailyLimit = 2,
    NegativeAmount = 3,
}

#[contract]
pub struct SpendingPolicy;

#[contractimpl]
impl SpendingPolicy {
    /// Read persisted on-chain spend for wallet + UTC day index.
    pub fn get_spent(env: Env, wallet_id: String, day: u32) -> i128 {
        let key = DataKey::Spent(WalletDay { wallet_id, day });
        env.storage().instance().get(&key).unwrap_or(0)
    }

    /// Validate and persist spend atomically (authoritative on-chain daily total).
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
        if amount > policy.max_single_tx {
            return Err(PolicyError::OverSingleTxLimit);
        }

        let key = DataKey::Spent(WalletDay {
            wallet_id: wallet_id.clone(),
            day,
        });
        let spent: i128 = env.storage().instance().get(&key).unwrap_or(0);

        if spent.saturating_add(amount) > policy.daily_limit {
            return Err(PolicyError::OverDailyLimit);
        }

        env.storage().instance().set(&key, &(spent + amount));
        env.events().publish(
            (symbol_short!("spend"), wallet_id, day),
            (amount, spent + amount),
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

        client.try_spend(&wallet, &policy(), &900, &day);
        assert_eq!(
            client.try_spend(&wallet, &policy(), &101, &day),
            Err(PolicyError::OverDailyLimit)
        );
    }

    #[test]
    fn check_spend_stateless_still_works() {
        let env = Env::default();
        assert!(SpendingPolicy::check_spend(env, policy(), 50, 100).is_ok());
    }
}
