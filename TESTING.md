# Testing report (automated only; no browser run)
PASSED (`node test.mjs`, 12 pages): one H1 per page; unique titles; canonical present; no hash links; all internal links resolve; sitemap matches pages; form function: honeypot rejected (400), missing field/consent rejected (422), unconfigured returns 503, provider failure returns 502, success only on provider OK (mocked provider).
NOT TESTED: real email delivery; mobile/tablet/desktop rendering, mobile menu, keyboard use, form UI in a real browser; Lighthouse; structured-data validator; real photos and company profile PDF (not built).
Known limits: header dropdown and footer lists are filled by JavaScript, so main-content links carry the crawl paths.
