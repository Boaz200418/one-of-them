# Netlify migration preparation

This guide prepares the repository for a future migration. It does not authorize or perform a deploy, GitHub push, DNS edit, nameserver change, or AWS change.

## Current state

- The repository is configured to build with `node build.mjs` into `dist` and to publish the function in `netlify/functions`.
- `SITE_URL` is the public canonical URL `https://oneofthem-group.com`.
- The build creates 18 public pages, `sitemap.xml`, `robots.txt`, `favicon.svg`, the social image, and `docs/one-of-them-group-company-profile.pdf`.
- The enquiry function is a Netlify JavaScript ES module with the route `/api/enquiry`. Its source is outside `dist`, so it is packaged as a function rather than published as a file.
- No `package.json` is present. The build and function use Node built-ins and the built-in Fetch API; no npm install step or Resend SDK is needed.
- Public DNS currently delegates to Cloudflare (`anton.ns.cloudflare.com` and `serena.ns.cloudflare.com`). The live site has been observed on AWS S3/CloudFront. Keep that live setup until a separately approved migration.

## Build and route configuration

The repository-root `netlify.toml` declares:

```toml
[build]
  command = "node build.mjs"
  publish = "dist"

[build.environment]
  SITE_URL = "https://oneofthem-group.com"

[build.processing.html]
  pretty_urls = true

[functions]
  directory = "netlify/functions"
```

Netlify’s `pretty_urls` setting matches the generated directory structure and trailing-slash canonicals. Each page is written as `dist/<route>/index.html`; the root page is `dist/index.html`. The build also writes a branded `404.html`. No catch-all SPA rewrite is needed or recommended: it could hide broken paths or interfere with `/api/enquiry`. The function’s explicit `config.path` handles that endpoint. Netlify documents the default function directory, custom function paths, and Pretty URLs in its [function configuration](https://docs.netlify.com/build/functions/configuration/) and [routing documentation](https://docs.netlify.com/manage/routing/redirects/redirect-options/).

The built static routes and assets are:

- The 18 public pages listed in `dist/sitemap.xml`, with canonical URLs based on `SITE_URL`.
- `/sitemap.xml` and `/robots.txt` at the publish root.
- `/favicon.svg` and `/img/one-of-them-group-social-card.png`.
- Service/gallery images under `/img/`.
- `/docs/one-of-them-group-company-profile.pdf`, linked from the Documents page.
- `/api/enquiry`, served by the Netlify Function rather than a static file.

## Enquiry function and email settings

`netlify/functions/enquiry.mjs` uses Netlify’s supported Fetch `Request`/`Response` function format and exports the custom path `/api/enquiry`. It accepts POST only, validates the form type and required fields, rejects the honeypot, enforces privacy consent and validates email addresses. It sends mail through the Resend HTTP API using server-side `fetch`. Missing configuration returns 503; provider or network failures return a generic 502. No provider key or mail configuration is embedded in browser code.

Set these values in Netlify’s site environment settings. Do not put secrets in `netlify.toml`, source files, or the browser. For function runtime variables, include the **Functions** scope; Netlify notes that variables declared in `netlify.toml` are not available to serverless functions ([environment variable guidance](https://docs.netlify.com/build/functions/environment-variables/)).

| Variable | Configuration |
| --- | --- |
| `SITE_URL` | `https://oneofthem-group.com`; already set in `netlify.toml` for the build. It is public and is used for canonical URLs, the sitemap and robots file. It is not needed by the function. |
| `RESEND_API_KEY` | Secret API key from the company’s Resend account. Add it only in Netlify’s UI/API with Functions scope. It is not present in this repository. Use a separate restricted/test key for a Deploy Preview if available. |
| `MAIL_TO` | The company-approved mailbox that should receive form enquiries. No destination is selected in the code. The owner must confirm the receiving inbox; do not guess one. |
| `MAIL_FROM` | The exact sender address already verified in the company’s Resend account. No verified sender address is identified in this repository or DNS lookup, so obtain it from that account before enabling delivery. Do not invent an address. |

Environment values are applied to a deploy. Redeploy after changing a value. For previews, use a controlled internal test inbox and preview-only credentials. If those are not approved, leave email delivery unconfigured; the function should return 503 rather than send mail. Existing automated tests mock Resend and send no email.

The function currently has a honeypot but no rate limiting or CAPTCHA. Review abuse protection before accepting public production traffic.

## Future Netlify import and Deploy Preview

After the repository changes have been reviewed and are available on GitHub:

1. In Netlify, select **Add new project → Import an existing project**, authorize the correct GitHub account, and select this repository and the intended production branch.
2. Keep the base directory at the repository root. Confirm the settings from `netlify.toml`: build command `node build.mjs`, publish directory `dist`, functions directory `netlify/functions`.
3. Confirm the production build context uses `SITE_URL=https://oneofthem-group.com`. Do not add Resend values to the repository.
4. Configure the approved production `MAIL_TO` and Resend-verified `MAIL_FROM`, plus the secret `RESEND_API_KEY`, only when the sender and recipient have been confirmed. Configure separate controlled values for Deploy Previews if testing successful email delivery.
5. Create a Deploy Preview and verify all 18 routes, the 404 page, sitemap, robots file, favicon, images, and profile download. Confirm preview canonicals still point to the production domain unless an explicit preview SEO policy is chosen.
6. Verify `/api/enquiry` on the preview. A GET should return 405; malformed or invalid POST requests should return 400/422 and must not send mail. To verify successful delivery, use only an explicitly controlled test inbox and approved test credentials. Do not use a customer enquiry as a test.
7. Open the Documents page, download the PDF, and confirm it opens and contains `+27 61 687 8497` and `+27 60 111 0724`.

Netlify’s Git import process and build settings are documented in [Deploy from a repository](https://docs.netlify.com/start/quickstarts/deploy-from-repository/) and [Build configuration](https://docs.netlify.com/build/configure-builds/overview/).

## Cloudflare DNS records to preserve

The following public DNS records were observed on 2026-11-16. Re-check them in Cloudflare immediately before any future DNS work because records can change. This preparation did not edit DNS.

- Keep the current Cloudflare nameservers; do not delegate to Netlify nameservers.
- Preserve all three inbound mail MX records:
  - preference 33: `route2.mx.cloudflare.net`
  - preference 79: `route1.mx.cloudflare.net`
  - preference 81: `route3.mx.cloudflare.net`
- Preserve the existing root SPF TXT value: `v=spf1 include:_spf.mx.cloudflare.net ~all`. Do not create a second SPF record. If Resend later requires SPF authorization, have the DNS owner review and merge the provider include into the existing SPF policy without removing the Cloudflare mail-routing include.
- Preserve the existing `_dmarc` TXT value: `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`.
- Preserve the root Google site-verification TXT and Brevo verification TXT records, and every existing DKIM selector TXT/CNAME and other mail-related record. Do not replace or delete these while changing web hosting.
- Preserve all other DNS records except the specific web-host records deliberately changed during an approved cutover.

Only after the Netlify site and Deploy Preview are accepted should the owner plan the domain cutover as a separate step. First add the domain to the Netlify site; then use the exact, site-specific apex and `www` records shown in Netlify’s **Pending DNS verification** instructions. Do not copy generic IPs from this file or guess a Netlify hostname. In Cloudflare, change only the web records that currently route the apex/`www` to AWS, and leave mail, verification, DKIM, MX, SPF and DMARC records intact. Keep Cloudflare as the DNS provider and do not change nameservers. Netlify’s [external DNS guide](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) explains that the domain must first be assigned to the Netlify site and that its DNS instructions depend on the site.

Do not remove the existing AWS origin or CloudFront configuration as part of DNS preparation. Keep it available for rollback until the new host, HTTPS certificate, routes, API and email delivery have been verified and the owner approves the final cutover.

## Readiness gates

Before production cutover, the owner must provide/confirm the Resend-verified `MAIL_FROM`, the approved `MAIL_TO`, the preview email-testing plan, and approval for the separate DNS migration. A Netlify Deploy Preview and real Resend delivery have not been run in this local preparation. The live AWS site, CloudFront distribution, Cloudflare DNS, nameservers, and email DNS have not been changed.
