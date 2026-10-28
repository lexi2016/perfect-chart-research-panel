# Research source synchronization policy

User-designated long-term destination: https://github.com/lexi2016/perfect-chart-research-panel . Research panel, chart/filter and related verification source belongs here rather than new commits to the production V4 repository.

Preserve existing commits and snapshots. Use an additive research branch, never force-write main. Check content hashes before uploading and verify remote blob SHA/size after writes. Archive published site source separately from work-in-progress candidates; a source upload is not a website deployment or data certification.

Source allowlist: implementation, tests, schemas without real inputs, short workflow contracts and manifests. Exclude market histories and stock JSON datasets, state outputs, reports/PDFs/images, credentials, real permission/admission pins, deployment configuration and private machine settings. No automatic license grant.

Fixed display workflow: identity and data date → why watch / what to wait for / invalidation → distinct key-K high/body-low/low and original signals → full chart → history/price-position → industry/company/shareholder evidence with missing evidence explicit. Calendar groups daily research on one date page; do not silently change the display layout or selection formulas.

Current source baseline: Site published v20 commit 9e573d723a43dbfd37bc664b4d3961ac12787ffc. Later small-K UI candidates are not part of this snapshot. Existing main archive already holds prior D27 pipeline/state and site source; this batch adds documentation only; the original cloud-bound reader and any portable replacement remain unuploaded.

## Mac originals and cloud adaptations

The Mac-local source is a separate execution target. Preserve its original source, version manifest and existing main-branch history; this research branch does not rewrite those files or claim cloud compatibility for them.

Runtime root, input location, output location and relative-path base must be supplied through explicit environment-specific configuration. Do not copy a Mac-local address into a cloud job, infer a path from the other environment, or publish private machine paths. Resolve and validate paths against the authorized root before reading or writing; missing or mismatched configuration must stop the operation rather than silently selecting another directory.

Prefer an existing suitable implementation in this repository over a new duplicate. Any actual cloud adaptation needs a separate labeled source change and its own dependency, path, input, permission and output validation. Mac validation does not certify cloud execution, and cloud tests do not certify the Mac installation. Documentation or placeholder configuration is not a runnable delivery.

Use `research/reader-workflow-20261028` for these additive research notes. No main rewrite, force update, automatic merge, Mac task creation or runtime migration is performed by this documentation change.
