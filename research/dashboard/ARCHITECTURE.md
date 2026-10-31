# Dependency and data boundary map

Existing panel -> web/export-controls -> host serve-only plugin -> service -> registered local source adapter -> existing reader / pinned JSON.
Service -> company snapshot contract; original/indicator renderer -> canvas engine -> local PNG.
Service -> sequential queue -> content-addressed local directory -> explicit ZIP download.
Existing panel -> navigation controls -> fixed-rank group helpers -> existing select/save callbacks.
Existing save callback -> append-only review store -> exact-view callback + external rank identity -> local JSONL.

Runtime configuration and material/data bodies are deliberately outside this repository. All paths received over HTTP are rejected; the request carries only a date, mode, symbols, job key or cancel action. The fixed endpoint never receives a module path, executable path or arbitrary output directory.

Published differences from the data-bearing runtime: real bindings are parameters rather than embedded constants; fixed-date validation is parameterized by an explicit registration; renderer source and formula display identity are supplied through code/config boundaries. The drawing math, field projection, source immutability checks, job state transitions and save-next race guard remain represented in this edition. Synthetic tests establish package behavior, not real-source qualification.
