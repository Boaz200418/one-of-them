# ONE OF THEM GROUP (Pty) Ltd website

Static site generated from `src/index.html`. `node build.mjs` writes crawlable pages to `dist/`, including canonicals, Open Graph and Twitter cards, Organization/WebSite/WebPage/Service/BreadcrumbList JSON-LD, sitemap.xml, robots.txt and 404.html. The build defaults to the canonical domain `https://oneofthem-group.com`; set `SITE_URL` only for another environment. Form delivery is `netlify/functions/enquiry.mjs`.

## Run, test, build
PowerShell:

    node build.mjs
    node test.mjs                                        # structure + form-function checks

To build for staging, set `$env:SITE_URL` before running `node build.mjs`. Unset it for the production domain. The sitemap and robots.txt are generated from the same route list.
Preview with any static server pointed at `dist/` (the form API needs Netlify: `npx netlify dev`).

## Update contact details / content
Edit the `SITE` block at the top of `src/index.html` (emails, phone numbers, WhatsApp, registeredAddress, areas and images), then rebuild. The registered street address stays blank because none has been supplied. Replace `src/docs/one-of-them-group-company-profile.pdf` to publish a revised profile.

## Connect email delivery (Resend)
1. Create a Resend account, verify your sending domain, create an API key.
2. In Netlify, set env vars: `RESEND_API_KEY`, `MAIL_TO` (inbox), `MAIL_FROM` (verified sender), `SITE_URL`.
3. Deploy (connect repo or `netlify deploy --prod`), submit both forms, confirm the emails arrive. Until then the site says the enquiry was NOT sent and offers a pre-filled email.
Recommended before launch: add Cloudflare Turnstile or rate limiting (only a honeypot is in place).

## Photos and social sharing
Service photos are copied from `src/img/` during the build; image filenames must also have a matching source name in `pictures/`. Add the matching normalized filename under `SITE.images`, keyed by the exact service title. If a service has no matching photo, the page omits that image until a licensed photo is added. Gallery captions describe the pictured scenes and do not present them as completed company projects.

## Google Search Console
Add a Domain property, verify via DNS TXT, submit `https://oneofthem-group.com/sitemap.xml`, then use URL Inspection on key pages. Rankings and indexing are not guaranteed.

## Still needed before launch
Review the supplied company profile PDF for current contact details (it currently includes only the +27 61 number), licensed project photography, POPIA review of the privacy policy and live email delivery. The website lists both confirmed phone numbers.
