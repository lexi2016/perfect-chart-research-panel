# Configurable local daily completion consumer

Source-only adapter. No market data, credentials, real configuration, producer execution or automatic production publishing is included.

Run `npm test` (Node standard library only). All fixtures in `test-*` and `synthetic-fixture.mjs` are synthetic. The host supplies its own server-local source roots, pinned references, same-date independently approved rank registration, and original completion event. Paths never come from browser requests.

`createLocalCompletionRuntime({workspaceRoot,configPath,outputRoot,sourceRoots})` installs a serve-only same-origin GET plugin. Its private config supplies `request` (`historical-index-replay` with a pinned reference, or `live-completion-event` with a local tip path), SHA-preserving relocation aliases and approved per-date registrations. No trusted date is inferred automatically. A producer candidate list is not a full-universe gain ranking.

`createSuccessHook(...).afterProducerSuccess({result,eventReference})` runs **after an existing producer actually succeeds**. It verifies its unchanged return against the existing original completion event, then delegates full source/rank validation to the consumer. It never invokes or replaces the producer. Missing result/event returns WAITING_PRODUCER_COMPLETION. Historical replay is a separate API and never claims generation or natural scheduling.

The generic consumer is configurable; the included browser mount retains the existing three explicit historical lane routes (local-d28, local-d29, local-reference). This is not a universal future-date chart implementation. Future dates require their own approved reader/rank registration and compatible route. Export readiness is separately registered per single date.

Atomic local latest updates, immutable versions, same-event deduplication, event-identity conflicts, corrupt sources, partial completion, scoped denominators, historical-date preservation and origin/path confinement are tested. Errors retain prior successful state. Production import and scheduler activation are outside this package.

Integrate only into an isolated local preview, and provide private real configuration externally. Do not use synthetic test fixtures as approved research inputs.
