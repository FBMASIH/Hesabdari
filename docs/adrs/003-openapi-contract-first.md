# ADR-003: OpenAPI Contract-First API

## Status

Accepted

## Context

The platform needs a stable API contract for:

- Frontend-backend communication
- Future mobile/desktop clients
- Third-party integrations
- API governance and versioning

## Decision

Use **REST + OpenAPI 3.2** as the primary API contract standard.

## Alternatives Rejected

### tRPC

- Too coupled to TypeScript ecosystem
- Weaker external interoperability
- Not suitable as a formal enterprise API boundary

### GraphQL

- Financial commands need deterministic, explicit write models
- Complex mutation policies are harder to govern
- REST endpoints are clearer for auditing and permission review

## Rationale

- OpenAPI provides language-agnostic contract documentation
- Typed client generation from the spec
- Clear versioning through URL prefixes (`/api/v1/`)
- Swagger UI for developer onboarding
- Explicit command endpoints for workflow transitions (e.g., `POST /journal-entries/:id/post`)

## Consequences

- Every endpoint must be documented in OpenAPI (via NestJS Swagger decorators)
- Frontend uses a generated or typed API client
- API changes require spec review
- Breaking changes require versioning
