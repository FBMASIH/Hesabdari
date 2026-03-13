---
name: quality-review
description: Run a comprehensive backend code quality review against CLAUDE.md standards. Checks type safety, clean architecture, multi-tenancy, schema alignment, financial rules, security, and code quality.
user_invocable: true
---

Run the `backend-quality-reviewer` agent to perform a comprehensive code quality audit of the Hesabdari backend.

Scope: If the user specifies modules (e.g., `/quality-review treasury`), review only those modules. Otherwise, review ALL backend modules under `apps/api/src/modules/` and the platform layer under `apps/api/src/platform/`.

After the review, generate a quality scorecard and fix all critical/high issues found.
