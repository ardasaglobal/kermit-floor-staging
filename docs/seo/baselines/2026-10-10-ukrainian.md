# Ukrainian release baseline — October 10, 2026

The public-site checkpoint was captured at **19:20:12 UTC** before publication from
base `db9a1b3`. [Requests, responses and the frozen sitemap](2026-10-10-ukrainian-public.json)
contain **567 unique existing URLs**, zero `/ukr` entries, and HTTP 404 for `/ukr`,
`/ukr/blog`, `/ukr/glossary`, `/ukr/resources`, `/ukr/contact` and `/uk`.

The primary release measure is newly available canonical Ukrainian destinations, with
self-canonicals, reciprocal `uk` alternates and independent sitemap entries. Preserve every
old sitemap URL and article modification date. Ukrainian public URLs use `/ukr`, while the
standard language code remains `uk`. All 28 current topics and 33 glossary terms are covered;
product names, codes, company contacts and original download files retain their identity.

## Analytics availability and interference

Fresh GSC and GA4 data could not be read: both existing ADC and CLI sessions require
reauthentication. Automatic approval review rejected the repository's broad credential
refresh because its edit/advertising/cloud scopes exceed this baseline read. A separate
read-only login was attempted without changing the existing credentials, but Google requires
the cloud-platform scope. No new grant was completed. An owner question about credential
refresh is pending; the release can use this public availability baseline without granting
additional access. Historical October 1 metrics remain historical and are not a fresh
October 10 checkpoint. No absence-of-demand, search-uplift or indexing claim is made.

The language addition affects navigation, alternate links and discovery site-wide. All
**26** previous open/operational logbook entries receive a dated marker. For overlapping
search/discovery/allocation and aggregate AI/referral effects, isolated attribution to the
earlier treatment becomes **INCONCLUSIVE** from this release. This is the interference
treatment allowed by `docs/seo/README.md`; it is not a favorable or unfavorable performance
verdict. Original cohorts, historical results, exact manufacturer prompt audits, and
operational/correctness checks retain their records and dates. New language URL cohorts
should be measured separately; country is not a reliable substitute for reader language.

Review availability/sitemap processing and indexing on **October 24**, descriptive search
exposure on **November 7**, and combined structural/discovery effects on **November 21**.
Capture an authenticated GSC/GA4 checkpoint before interpreting those search/traffic effects.
Availability checks alone cannot establish indexing or causal uplift. No schedule is created.

Record the actual production boundary and first complete GSC/GA4 reporting days after deploy.
