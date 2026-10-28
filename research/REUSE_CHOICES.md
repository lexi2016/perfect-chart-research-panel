# Reuse choices and archived versions

The existing source archive is commit `3c9a53b54d3a382efa416fe5eddb74c17db92d8c`. This additive branch preserves it; no force updates or history deletion are used.

- Reuse `site/chart85.js` for the existing shared chart, missing-value gaps and date/viewport controls rather than building a duplicate renderer.
- Reuse `site/related-reports.js` for request cancellation, selection identity checks and snapshot-consistent pagination. Partial results remain explicitly partial.
- Retain the archived state-consumer code under `history/state-engine-2026-10-27/` for its documented candidate scope. A display reader does not replace producer reuse or grant broader runtime permission.

These choices come from reading the actual archived source, not assuming that file names imply working integration. Public source availability does not demonstrate that a backend endpoint is deployed or that data is current. No new license is granted.

This batch synchronizes documentation only. The proposed duplicate portable reader template is deferred. Market data, permission files, internal runtime configuration, report originals and credentials are excluded. Future code updates should be necessary, stable differences in this repository, with remote content verification; unfinished candidates must remain separately labeled.
