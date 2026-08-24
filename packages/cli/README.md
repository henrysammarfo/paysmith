# @paysmithhq/cli

```bash
npm i -g @paysmithhq/cli
export PAYSMITH_API_KEY=ps_test_…
paysmith create --name bot --country GH --currency GHS --methods mobile_money
paysmith wallets
paysmith balance --wallet <uuid>
paysmith pay --wallet <uuid> --to 0551234987 --amount 1 --currency GHS --method mobile_money --bank-code MTN
```
