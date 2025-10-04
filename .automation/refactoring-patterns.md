# Refactoring Patterns Playbook

Use this playbook to select the right refactoring or pattern when tightening the codebase. Apply the steps iteratively and keep tests green between moves.

## Core Refactorings

- **Extract Function / Class** ? carve complex blocks into named units when a method exceeds ~20 lines or mixes responsibilities.
- **Replace Temp with Query** ? compute values through helper functions so state remains immutable.
- **Introduce Parameter Object** ? group related parameters (e.g., rate limit settings) into cohesive value objects.
- **Encapsulate Field / Collection** ? never expose raw mutable collections; provide intent-revealing APIs.
- **Replace Nested Conditionals with Guards** ? exit early to keep happy-path logic straight-line.
- **Rename for intention** ? prefer nouns for objects, verbs for commands, and adjectives for decorators.

## Refactoring to Patterns

- **Template Method** ? when multiple workflows share sequencing but differ in a step (e.g., rate-limited file mapping). Extract shared orchestration into an abstract base with overridable hooks.
- **Strategy** ? encapsulate algorithms that vary (hashing algorithms, CID generation, upload transports). Inject strategies via constructor to preserve DIP.
- **Factory Method / Abstract Factory** ? centralize creation of services that require configuration (Pinata clients, loggers).
- **Command** ? model CLI sub-commands as first-class command objects to simplify orchestration and testing.
- **Adapter** ? wrap third-party SDKs (Pinata, fs-extra) with project-specific interfaces.
- **Facade** ? expose simplified entry points for complex workflows (e.g., orchestrating upload + hashing from processors).

## Behavioural Safeguards

- **State / Strategy** ? swap behaviors without `switch` statements by exchanging collaborators.
- **Observer** ? prefer event emitters or callbacks when multiple subsystems need updates (e.g., progress trackers).
- **Memento** ? when adding undo/rollback behaviors, capture snapshots rather than mutating shared state.

## Decision Checklist

1. Identify the smell (duplication, divergence, shotgun surgery).
2. Choose the smallest refactoring that removes the smell while honouring SOLID.
3. Select a pattern only if it clarifies responsibilities?avoid pattern cargo-culting.
4. Add or update unit tests before and after risky moves.
5. Document the change in the relevant `.automation` file when introducing a new recurring practice.

## Anti-Patterns to Avoid

- Massive constructors that new-up all dependencies (use factories or DI instead).
- Boolean flags that change method behavior?split into separate specialized implementations.
- God objects with broad responsibilities?split into cohesive services that compose via interfaces.
- Hidden side effects in getters or computed properties?keep queries pure.
