# ADR-001: Modular Monolith Architecture

## Status

Accepted

## Context

We need to choose an architectural style for an enterprise accounting platform. The options considered were:

1. Microservices
2. Modular Monolith
3. Traditional layered monolith

## Decision

We chose **Modular Monolith** with Clean Architecture (DDD-lite).

## Rationale

### Why not microservices?

- Distributed transaction complexity is dangerous for financial systems
- Duplicated domain logic across services
- Higher infrastructure overhead
- Harder local development and testing
- Premature for a new product

### Why not a traditional monolith?

- Lacks the internal boundary discipline needed for long-term maintainability
- Harder to evolve toward service decomposition if needed

### Why Modular Monolith?

- Single deployable unit with strict internal module boundaries
- ACID transactions across the entire domain
- Shared type system and tooling
- Each module owns its domain, application, infrastructure, and presentation layers
- Clear path to service extraction if scaling demands it
- Optimal for a team building a new product

## Consequences

- Modules communicate through application service calls and domain events
- No module may directly access another module's database tables
- Module boundaries must be enforced through code review and architecture tests
- If a module needs extraction, it already has clean boundaries
