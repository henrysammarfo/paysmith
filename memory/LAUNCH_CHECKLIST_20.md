# Website launch — 20-task checklist

**Date:** 2026-10-17 · Site: https://paysmith-eight.vercel.app

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Privacy policy | ✅ | `/privacy` |
| 2 | Terms & conditions | ✅ | `/terms` |
| 3 | Remove frontend secrets | ✅ | Client asserts no `service_role` / `sbp_` / `sk_` in Vite env |
| 4 | Enforce HTTPS | ✅ | Vercel TLS + HSTS header in `vercel.json` |
| 5 | Cookie consent banner | ✅ | `CookieConsent` — analytics gated |
| 6 | Meta titles/descriptions | ✅ | `index.html` + page document titles |
| 7 | Social preview image | ✅ | `/og-image.png` compressed (~62KB, 1200×630) |
| 8 | Favicon | ✅ | `/favicon.svg` + `/apple-touch-icon.png` |
| 9 | Sitemap and robots.txt | ✅ | `/sitemap.xml` + Sitemap line in robots |
| 10 | Image alt text | ✅ | Video `aria-label`; social icons labeled |
| 11 | Image compression | ✅ | OG 1.1MB → ~62KB |
| 12 | Page load speed check | ✅ | Font `display=swap` + async load; video `preload=metadata` + poster |
| 13 | Color contrast fixes | ✅ | Hero/CTA text bumped to `/85`–`/90` |
| 14 | Mobile responsiveness | ✅ | Existing responsive nav; menu `aria-*` |
| 15 | Custom 404 page | ✅ | Branded `NotFound` with home/docs/waitlist |
| 16 | Broken link fixes | ✅ | Footer Privacy/Terms live; removed dead About/Careers `#` |
| 17 | Form validation | ✅ | Email regex + corridor check + `aria-invalid` |
| 18 | Spam protection | ✅ | Honeypot + waitlist rate limit + silent bot OK |
| 19 | Analytics setup | ✅ | `@vercel/analytics` after consent |
| 20 | Single clear CTA | ✅ | Hero primary = Join waitlist only |

## Honest residuals
- Full Lighthouse CI not in gate — spot-check after deploy
- Cookie banner uses localStorage (not CMP for GDPR mega-markets)
- Publishable Supabase key remains in frontend by design (RLS + Edge auth)
