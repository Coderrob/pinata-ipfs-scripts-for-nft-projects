# Quality Checklist

Run this checklist before merging changes or issuing a release.

## Code Hygiene

- [ ] All functions (public/private) have meaningful JSDoc comments.
- [ ] Dependencies injected through interfaces; no new hidden singletons.
- [ ] Rate-limiters, strategies, and processors reuse shared abstractions (`RateLimitedFileMappingService`, etc.).
- [ ] No TODOs, commented-out blocks, or magic numbers remain.

## Build Health

- [ ] `npm run build` completes without TypeScript warnings.
- [ ] `npm run lint` passes or has documented waivers.
- [ ] Tests (`npm test` or focused suites) succeed locally.

## Documentation & Observability

- [ ] Logs capture success + failure pathways with contextual metadata.
- [ ] README or relevant docs updated to describe new workflows.
- [ ] `.automation` playbooks updated if new practices were introduced.

## Release Safety

- [ ] Breaking changes are flagged and communicated.
- [ ] Rollback strategy identified for risky deployments.
- [ ] Telemetry/metrics updated when behaviours change.
