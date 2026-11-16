# Local quality assurance report

Date: 16 November 2026.

## Passed

- `node build.mjs` generated 18 public pages for `https://oneofthem-group.com`.
- `node test.mjs` passed metadata, canonical, structured data syntax, internal link, image, document-link and mocked enquiry checks.
- The local preview returned HTTP 200 for all 18 sitemap routes and for `robots.txt`, `favicon.svg`, the social image and the downloadable company profile.
- Generated pages include the mobile WhatsApp rule for widths up to 400 px: static document flow after the footer, at least 48 px tap height and safe-area bottom spacing. The automated check applies to all 18 generated pages.
- Enquiry tests use a mocked provider; no real messages were sent.
- Repository configuration indicates Netlify: `netlify.toml`, `netlify/functions/enquiry.mjs`, and README instructions. No Cloudflare Pages or Worker config, `package.json`, or deployment secrets were found in the repository.

## Failed or not completed

- The existing PDF still lists only +27 61 687 8497. A working DOCX copy with both website-confirmed numbers was prepared, but Word export was unavailable in this session; the published source PDF was left unchanged.
- The mobile CSS is covered by generated-file checks, but real browser viewport checks after the change were not completed. A prior browser check found the fixed WhatsApp button overlapping text; the new small-screen rule addresses this in CSS, pending visual verification.
- Lighthouse was not rerun after the favicon correction. The previous mobile run before that correction scored 98 Performance, 98 Accessibility, 96 Best Practices and 100 SEO. No desktop run was completed.
- Live production pages, external links, DNS and deployment target were not verified because outbound network access was unavailable. JSON-LD was syntax-checked locally, but no Google or Schema.org external validator was run.
- Real email delivery is unverified. Netlify needs `RESEND_API_KEY`, `MAIL_TO` and `MAIL_FROM` configured as environment variables.
