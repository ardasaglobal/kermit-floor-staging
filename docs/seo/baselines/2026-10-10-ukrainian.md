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
the cloud-platform scope. No new grant was completed. The release uses this public
availability baseline without granting additional access; a broader credential refresh
still requires the owner's response. Historical October 1 metrics remain historical and are not a fresh
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

## Publication boundary

[PR #10](https://github.com/kermit-floor/kermit-floor-staging/pull/10) merged as
`c9ebbeed56b8f7d3477724570224bba457c8b723` after independent Standards and Spec subagent
approvals and passing CI. Cloudflare published version
`b392715e-fd79-45bf-87c1-1f229403c564` at **2026-10-10 19:31:58.790570 UTC**;
the Workers Builds check completed successfully at **19:32:07 UTC**.

The [production verification](2026-10-10-ukrainian-production.json) confirms all **680**
sitemap destinations return HTTP 200 with correct language, direction and self-canonical
metadata. All **567** previous destinations and all **140** existing article modification
dates are preserved. There are **113** Ukrainian destinations, **336** static/article
sitemap entries with reciprocal six-language alternates, and all **27** existing PDFs
remain available. Availability is established; indexing and search effects remain pending.
All **13** localization browser checks also pass against production, including language
switching, glossary/schema parity, mobile layouts, PDF labels, technical diagrams and the
`/uk` redirect with query preservation. Ukrainian mobile homepage and glossary screenshots
were visually inspected. Third-party browser requests were blocked; no forms were submitted.

Exclude **October 10** as a partial release day. The first complete post-release reporting
day is **October 11** for both GSC (Pacific) and GA4 (the recorded Europe/Istanbul property
time zone). These are publication boundaries, not substitutes for fresh analytics data.
