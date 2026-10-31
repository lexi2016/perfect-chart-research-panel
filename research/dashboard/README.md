# Registered research dashboard: local export and review navigation

This is the **source-only, configurable integration edition**, not a copy of the data-bearing running workbench. It contains no real market bars, company research, source/admission checksums, private filesystem locations, account information, or upload destinations. An empty configuration cannot export real stocks.

## Included functionality
- Exact registered date and ordered symbol scope; selected subset or registered Top200.
- SHA-checked local source JSON or a registered Python/Node reader (fixed symbol/date arguments, no shell or request-supplied filesystem path).
- Existing drawing implementation: price/volume/KDJ and the reviewed display-sidecar MACD variant. The display-only drawing projection is preserved; no stock-selection formula runs here. No missing indicator is invented.
- Content-addressed local jobs, duplicate-click serialization, sequential stock processing, isolated failures, cancellation retaining completed results, restart reuse with output SHA checks, and pinned reusable images.
- Existing company-material snapshots split into earlier-publication/late-collection, post-cutoff, and unknown-time lists. These are **not automatically certified historical blind inputs**. Missing companies retain a row.
- Serve-only integration, local ZIP download, and a host authorization callback. Drive uploads are intentionally separate and absent.
- Fixed-rank group navigation, previous/next, identity-based saved position, success-only save-next with date/group/symbol/source race protection; UNKNOWN/test records are not completed formal reviews.
- Append-only manual review revisions with actual-view and rank binding. A host must supply the actual-view verification callback; this package does not manufacture one.

## Dependencies and synthetic verification
Node 22+, the existing `@napi-rs/canvas` 0.1.100 runtime, and a CJK font at the standard Linux Noto location are used for PNG rendering. The optional serve-only ZIP endpoint also requires the normal `zip` executable. There is no package installation, network call, or browser-control code in the test runner.

```
npm test
node examples/make-synthetic.mjs .test-output
node bin/export.mjs .test-output/runtime.local.json 20990120 top200
```

The example generates **fabricated** bars and materials for two synthetic identities. They are only a functional test of PNG/job/source-binding behavior, not a market dataset or reader admission. The default tests create temporary synthetic files and do not access real project data.

## Local runtime configuration (never commit)
Start from `examples/runtime.example.json` and keep the populated file named `runtime.local.json` outside version control. Paths are relative to the local configuration/workspace root; absolute paths, traversal and symlink sources are rejected.

Each `dates[YYYYMMDD]` registration supplies:
- `order`: exact unique symbols in original rank order;
- `stocks[symbol]`: name, qualification, optional `narrow`, and either a pinned `source_json` or an explicitly registered reader;
- `reader`: `{ executable: "python" | "node", script: {path, bytes, sha256}, source_pins: [...] }`. The reader receives only `SYMBOL DATE DATE`, must validate its own source lineage, and returns the original JSON rows;
- `source_pins`: optional per-stock dependencies checked before the read;
- `formula_sha256`: the locally admitted formula identity used for existing display guards, not a formula recalculation authorization;
- optional `company_catalog` pin;
- optional `indicators` pin with `source_sha256` bound to the exact returned source JSON bytes, and optional `encoding: "gzip"`;
- optional `reusable_images.overview/near120`: pinned PNG references with exact source and indicator checksums. A mismatch fails closed, it does not silently substitute an old image.

`source_date` is not assumed to mean an actual last bar. This current-date exporter requires the last actual row to equal the requested cutoff; historical-only objects must be a separate explicitly named registration, not silently relabeled.

Real input review, vintage, admission and source lineage remain responsibilities of the registered reader/operator. This code does not create production, trading or PIT eligibility. It does not grant access to arbitrary workspace files.

## Host integration (no new standalone dashboard)
`lib/serve-plugin.mjs` exports `serveOnlyExportPlugin({root, configFile, authorize})` for the existing Vite development host. It uses `apply: "serve"`; it is not a production Worker endpoint. `authorize(req)` must preserve the host's existing authentication/permission contract. Local host/origin checks remain additional restrictions, not a substitute for host authorization.

Mount `web/export-controls.mjs` into the existing materials/review panel with `getDate()` and `getSelected()` callbacks. Mount `web/navigation-controls.mjs` with existing chart selection, source identity, save and review-list callbacks. Selection groups are view filters only; they do not rewrite ranking, original labels, formula outputs or scores. Search is cleared when changing groups and does not constrain group-order navigation.

`lib/review-store.mjs` requires the host's exact rank scope and `assertViewed` callback. It serializes append operations, rejects stale revision/source bindings, and reads saved revisions after restart. The UI does not advance when a different selection/group/source/date became current during an asynchronous save.

## Scope and limitations
This publishes reusable program logic and synthetic tests, **not a ready-to-run copy of the private runtime**. Real registries/readers/reviews and market/research data are deliberately external. A production deployment, real source configuration, external upload, or new date's data admission is not performed by this package. No credentials or security settings are created or changed.
