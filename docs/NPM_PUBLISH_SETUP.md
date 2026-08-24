# NPM org + token — step-by-step (for `@paysmithhq/sdk`)

**Note:** Org name `paysmith` is **taken** on npm. We use **`paysmithhq`** instead. Package: `@paysmithhq/sdk`.

Do this **once**. When finished, paste the **granular token** and say **“publish sdk”**.  
I will then run `npm publish` from `packages/sdk`. **Never commit the token to git.**

---

## A. Create an npm account (if you don’t have one)

1. Open https://www.npmjs.com/signup  
2. Create account with a work email.  
3. Verify the email.  
4. Enable **2FA** (Account → Two-Factor Authentication).

---

## B. Create the `paysmithhq` organization (**required before publish**)

Scoped packages under `@paysmithhq/*` **will not install** until this org exists. A publish without the org can leave a ghost `0.1.0` (CLI says “already published”, `npm view` still 404).

1. Open https://www.npmjs.com/org/create  
2. Organization name: **`paysmithhq`** (must match the package scope exactly).  
3. Choose **Unlimited** (free for public packages) or your preferred plan.  
4. Confirm you are an **Owner**.  
5. Verify: https://www.npmjs.com/org/paysmithhq opens (not 404).

Other free names if you prefer: `paysmith-ai`, `getpaysmith`, `paysmithdev` — tell me and I’ll rename the package.

---

## C. Confirm membership

1. https://www.npmjs.com/settings/paysmithhq/members  
2. Your user should be **Owner**.

---

## D. Create a publish token

1. Open https://www.npmjs.com/settings/**YOUR_USERNAME**/tokens  
2. **Generate New Token** → **Granular Access Token**  
3. Settings:
   - **Name:** `paysmithhq-cursor-publish`  
   - **Expiration:** 7–30 days  
   - **Packages and scopes:** Read and write → scope **`@paysmithhq`**  
   - **Organizations:** allow **`paysmithhq`** if prompted  
4. Generate → **copy once** (`npm_...`).

---

## E. Paste back here

```
NPM_TOKEN=npm_xxxxxxxxxxxxxxxx
NPM_ORG=paysmithhq
NPM_PACKAGE=@paysmithhq/sdk
```

Then say: **publish sdk**.

---

## F. What I run

```powershell
cd C:\Users\jessi\Desktop\paysmith\packages\sdk
$env:NODE_AUTH_TOKEN = "npm_..."   # session only
npm publish --access public
```

---

## G. After publish

1. Confirm: `npm view @paysmithhq/sdk version` and https://www.npmjs.com/package/@paysmithhq/sdk  
2. **Revoke** the token (especially if it was pasted in chat).  
3. Current target version in repo: **`0.1.1`** (skip `0.1.0` if it was ghost-blocked).  

---

## Security

| Do | Don’t |
|----|--------|
| Granular + short expiry | Commit `NPM_TOKEN` |
| Revoke after publish | Share classic tokens in public chat long-term |
