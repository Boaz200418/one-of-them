# ONE OF THEM GROUP (Pty) Ltd website

Static site generated from `src/index.html` (design, content and the `SITE` config at the top of its script are preserved). `node build.mjs` writes crawlable pages to `dist/` (one URL per page, canonical, Open Graph, breadcrumb JSON-LD, sitemap.xml, robots.txt, 404.html). Form delivery is `netlify/functions/enquiry.mjs`.

## Run, test, build
PowerShell:

    $env:SITE_URL = "https://your-domain.co.za"
    node build.mjs
    node test.mjs                                        # structure + form-function checks

`SITE_URL` should be set to the final canonical domain for a production build. The build defaults to `https://www.example.co.za` when it is unset.
Preview with any static server pointed at `dist/` (the form API needs Netlify: `npx netlify dev`).

## Update contact details / content
Edit the `SITE` block at the top of `src/index.html` (email, WhatsApp, phone, registeredAddress, areas, images), then rebuild. Phone/WhatsApp actions appear only when configured. The registered address stays blank until supplied. The current email and WhatsApp values are the contact details already present in the project; confirm they are current before launch.

## Connect email delivery (Resend)
1. Create a Resend account, verify your sending domain, create an API key.
2. In Netlify, set env vars: `RESEND_API_KEY`, `MAIL_TO` (inbox), `MAIL_FROM` (verified sender), `SITE_URL`.
3. Deploy (connect repo or `netlify deploy --prod`), submit both forms, confirm the emails arrive. Until then the site says the enquiry was NOT sent and offers a pre-filled email.
Recommended before launch: add Cloudflare Turnstile or rate limiting (only a honeypot is in place).

## Photos
Service photos are copied from `src/img/` during the build; image filenames must also have a matching source name in `pictures/`. Add the matching normalized filename under `SITE.images`, keyed by the exact service title. If a service has no matching photo, the page omits that image until a licensed photo is added. Gallery captions describe the pictured scenes and do not present them as completed company projects.

## Google Search Console
Add a Domain property, verify via DNS TXT, submit `https://your-domain.co.za/sitemap.xml`, then use URL Inspection on key pages. Rankings and indexing are not guaranteed.

## Still needed before launch
Domain + `SITE_URL`, registered office address, verified company profile PDF, licensed photos, POPIA review of the privacy policy, tested email delivery, optional phone number.
