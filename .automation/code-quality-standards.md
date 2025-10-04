# Code Quality Standards

## Guiding Principles

- **SOLID first** ? prioritise Single Responsibility, Open/Closed, and Dependency Inversion when shaping services and processors.
- **Design patterns by intent** ? select patterns that express the responsibility (Strategy for interchangeable behaviour, Template Method for staged workflows, Facade for simplified APIs, etc.).
- **Generics over duplication** ? prefer type-safe generics for reusable structures (e.g., processing pipelines, mapping utilities).
- **Prefer composition** ? depend on abstractions defined in `src/types` and inject collaborators rather than instantiating concrete classes inside services.
- **Observability as a feature** ? leverage `Logger` and structured context on every externally observable workflow step.

## File & Type Organisation

- Scope files by feature and responsibility. Keep services under `src/services`, processors under `src/core`, configs under `src/config`, and shared types inside `src/types/<feature>`.
- Co-locate new type definitions next to their feature (avoid sprawling ?misc? files). Export through the nearest `index.ts` for consistency.
- Favour small, focused files. Split classes or utilities when they exceed ~200 lines or mix concerns.

## Naming & Documentation

- Use descriptive names that reveal intent (e.g., `RateLimitedFileMappingService` instead of `BaseService`).
- Every function, including `private` and `protected`, must have JSDoc comments summarising purpose, parameters, and return values.
- Keep comments high-signal: explain *why* decisions were made, not obvious ?what? statements.

## Error Handling & Logging

- Guard public APIs with contextual logging on success and failure.
- Fail fast with clear, user-facing error messages; rethrow or wrap exceptions instead of returning sentinel values.
- Ensure rate-limited or batch operations continue to surface individual failures (no silent swallow).

## Dependency Management

- Always depend on interfaces exported from `src/types`. If a capability is missing, add a new interface rather than importing a concrete implementation.
- Provide optional dependency injection points (e.g., constructor parameters) so collaborators can be swapped in tests and alternative runtimes.

## Testing Expectations

- Maintain or add unit tests whenever behaviour changes. Use mocks around rate limiters, I/O, and network clients.
- Keep jest suites fast; prefer deterministic fixtures over real network or filesystem access.

## Formatting & Tooling

- Honour existing ESLint, Prettier, and TypeScript settings. Run `npm run lint` and `npm run build` before opening a PR.
- Use ASCII characters unless the impacted file already uses Unicode.

## Documentation & Communication

- Update README or feature docs when workflows change.
- Capture architectural decisions in commit messages or `/docs` as appropriate to leave a traceable history.
