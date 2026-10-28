# Perfect charts and research panel source

Research-only website source and V4 integration candidates. This is not a trading signal.

- site/: the ten-chart study, October 27 archive, and October 28 observation page source.
- history/: the previously backed up October 27 website, research pipeline and state-engine source snapshots. Historical scripts retain their original paths, dates, hashes and input dependencies.
- v4-integration/: report UI code and candidate V4 backend patches. r5_api.patch and r1_scheduler.patch have different preimages, were checked separately, and must not be assumed compatible in a combined checkout. They are not deployed.
- MANIFEST.json: SHA-256 and Git blob SHA-1 for included files.

Daily research stock-list files, market and chart data, original images, PDFs, report texts, credentials, and deployment configuration are excluded. Page and historical test source retain case-analysis prose, stock names and codes, default ticker identifiers, and small hard-coded verification sample lists. Full restoration requires the separately backed-up data and images.

The report API returned HTTP 404 at the last local check on 2026-10-28; this cannot establish whether reports exist. Natural daily refresh, end-to-end V4 integration, and deployment require separate verification.

Publishing source does not automatically grant an open-source license. Third-party content remains subject to its rights holders.
