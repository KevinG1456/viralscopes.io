# Phase Implementation Workflow
**Engineering Process Standard · v2.0**

> This document defines the mandatory process for all phase-scoped implementation work. Every step must be completed in order. No code may be written until Step 7 approval is received.

---

## Workflow at a Glance

| Phase | Purpose | Gate |
|---|---|---|
| Step 1 | Read all project documentation | Required |
| Step 2 | Determine current project state | Required |
| Step 3 | Review the requested phase in detail | Required |
| Step 4 | Validate scope — confirm phase boundaries | Required |
| Step 5 | Produce implementation plan | Required |
| Step 6 | Identify risks and mitigations | Required |
| **Step 7** | **⏸ APPROVAL GATE — wait for explicit sign-off** | **GATE** |
| Post-approval | Begin implementation | After approval only |

---

## 1 · Read Project Documentation

Before making any decision, read and fully understand each of the following documents. Do not proceed to Step 2 until all applicable documents have been reviewed.

**Core documents (always required)**

- `PROJECT_RULES.md`
- `ROADMAP.md`
- `PROJECT_STATUS.md`
- `CHANGELOG.md`
- `README.md`

**Supplementary documents (review when applicable)**

- `PRD.md`
- `Database_Schema.md`
- `Security_Architecture.md`
- `URL_&_API_Structure.md`
- `REPOSITORY_STRUCTURE.md`
- Infrastructure, Monitoring, Deployment, AI Strategy, and Pricing documentation referenced by `ROADMAP.md`

**Documentation consistency checks**

- Identify contradictions between documents
- Identify outdated or stale specifications
- Identify missing specifications required for this phase
- Recommend documentation corrections before any planning begins

> ⚠ **Do not skip this step or proceed on assumptions. If documentation is absent or contradictory, raise it explicitly before continuing.**

---

## 2 · Determine Current Project State

Establish a clear baseline before scoping any new work.

**Assume the following**

- All phases prior to the requested phase are complete and production-ready
- Existing functionality has been tested and is considered stable
- Existing architecture is the authoritative baseline
- Existing coding standards and `PROJECT_RULES.md` must be respected throughout

**Identify and document**

- The current completed phase
- The requested implementation phase and its position in the roadmap
- Dependencies inherited from previous phases
- Required deliverables for this phase
- Existing components, services, and modules that will be reused

**Dependency analysis**

- Dependencies on previous phases — are all required outputs available?
- Dependencies on future phases — does this phase expose interfaces for later work?
- External service dependencies — third-party APIs, auth providers, storage, etc.
- Infrastructure dependencies — environment configuration, secrets, compute requirements

Report any unresolved dependency risks before moving to Step 3.

---

## 3 · Review the Requested Phase

Open `ROADMAP.md` and study the requested phase in full. Determine each of the following before writing any plan.

**Phase definition**

- Objectives — what this phase is intended to achieve
- Scope — explicit boundaries of included work
- Deliverables — concrete outputs that must be produced
- Dependencies — inputs from prior phases or external systems
- Acceptance criteria — conditions that must be true for the phase to be considered done

**Technical considerations**

- Required integrations with existing or external systems
- Testing requirements — unit, integration, API, database, UI
- Documentation that must be updated as part of this phase

**Risk identification (preliminary)**

- Risks associated with the phase scope
- Potential regressions to existing functionality

> _If the roadmap is ambiguous on any point, document the ambiguity explicitly. Do not assume. Do not fill gaps silently._

---

## 4 · Validate the Scope

Before planning, verify that the proposed work is correctly scoped.

**Confirm the work**

- Belongs only to the requested phase
- Does not accidentally include features from future phases
- Does not remove or degrade completed functionality
- Does not introduce unnecessary refactoring
- Does not alter project architecture without justification

**Scope creep prevention**

Do not implement any of the following unless explicitly approved:

- Features scheduled for a later phase
- Nice-to-have improvements not in the roadmap
- Refactoring of unrelated code
- Architecture redesigns or technology substitutions

> ⚠ **If a task belongs to a later phase, explicitly identify it and defer it. Do not proceed silently.**

---

## 5 · Produce the Implementation Plan

After reviewing all documentation and validating scope, produce a complete implementation plan. This is the primary artefact reviewed at the approval gate.

### 5.1 Phase Summary

- Objectives
- Deliverables
- Features explicitly included
- Features explicitly excluded
- Acceptance criteria — the phase is complete only when every item on this list is verified

### 5.2 Technical Plan

**Files**
- Files that will be created (with purpose)
- Files that will be modified (with description of changes)

**Data**
- Database schema changes
- Required migrations
- Rollback strategy for data changes

**APIs and services**
- New endpoints or service methods
- Modified endpoints or service methods
- Backward compatibility considerations

**Infrastructure and configuration**
- Environment variable or secret changes
- Infrastructure provisioning or configuration changes
- CI/CD pipeline changes

**UI**
- New screens, components, or routes
- Modified UI behaviour or interactions

**Testing strategy**
- Unit tests — scope and coverage targets
- Integration tests — key flows to cover
- API tests — endpoints to validate
- Database tests — migration and data integrity checks
- UI tests — critical paths to automate
- Confirmation that all existing tests will continue to pass

### 5.3 Impact Analysis

For every area below, describe the impact of this phase or explicitly state "None".

- Files affected
- Services affected
- APIs affected
- Database impact
- Infrastructure impact
- Security impact
- Performance impact

### 5.4 Dependency Review

- Existing modules that will be reused without modification
- Services that will be extended
- Interfaces that remain unchanged
- Backward compatibility requirements

### 5.5 Architecture Decisions

List every decision that affects backend, frontend, database, APIs, infrastructure, security, performance, or scalability.

**Decisions already defined by the project**
Cite the document and section that defines each.

**Decisions requiring approval**
List every open decision. Do not resolve these unilaterally.

> ⚠ **Do not make approval-required architectural decisions yourself. Present them at the approval gate.**

### 5.6 Rollback Plan

For every change in this phase, describe the rollback strategy:

- Which changes are fully reversible without data loss?
- Which changes require a migration to revert?
- Which changes cannot be safely reversed once deployed?
- Step-by-step instructions to revert this phase if needed

---

## 6 · Identify Risks and Mitigations

Produce a risk register covering all categories below. For each risk, provide a likelihood assessment, an impact assessment, and a mitigation strategy.

- Technical risks — complexity, unknown areas, third-party instability
- Regression risks — existing features that could be affected
- Performance risks — latency, throughput, resource consumption
- Security risks — authentication, authorisation, data exposure, injection
- Migration risks — data integrity, downtime, irreversibility
- Dependency risks — external APIs, libraries, infrastructure services

> _Risks identified here will be reviewed at the approval gate. Do not proceed if a high-severity risk lacks a mitigation._

---

## 7 · Approval Gate

> ### ⛔ STOP
> After completing Steps 1–6, halt all activity.
> **Do not write code. Do not modify files. Do not generate patches.**
> Wait for explicit approval.

**Your output at this gate must include:**

1. Current project assessment
2. Phase scope analysis
3. Dependency analysis
4. Impact analysis
5. Implementation plan (Sections 5.1–5.6)
6. Architecture decisions requiring approval
7. Risk register with mitigations
8. Any open questions that must be resolved before implementation begins

**Approval trigger**

> ✅ Implementation begins only after the explicit response: **"Approved. Begin implementation."**

---

## After Approval — Implementation Requirements

Once approval is received, begin implementation under the following constraints:

- Implement only the requested phase — no scope expansion
- Preserve all previous functionality without regression
- Maintain backward compatibility throughout
- Follow every rule in `PROJECT_RULES.md`
- Reuse existing architecture, libraries, and coding patterns wherever possible
- Keep the project consistent with patterns established in previous phases
- Avoid unnecessary refactoring of unrelated code
- Keep changes modular, testable, and maintainable
- Write production-quality code — no placeholders, no TODO comments, no debug artefacts

---

## Testing Requirements

Create comprehensive tests for all changed and new code. All test types below must be considered; implement those applicable to this phase:

- **Unit tests** — covering all new functions, methods, and edge cases
- **Integration tests** — covering interactions between modified modules
- **API tests** — covering all new and modified endpoints
- **Database tests** — covering migrations, constraints, and data integrity
- **UI tests** — covering critical user flows in affected screens

> ⚠ **All existing tests must continue to pass. No regression is acceptable.**

---

## Documentation Requirements

Update every document affected by changes in this phase. At minimum, review each item below and update if applicable:

- `README.md`
- `CHANGELOG.md`
- `PROJECT_STATUS.md`
- `ROADMAP.md` (if milestones or phase status changed)
- `REPOSITORY_STRUCTURE.md` (if new directories or files were added)
- `Database_Schema.md`
- `URL_&_API_Structure.md`
- `Security_Architecture.md`
- `Deployment_Guide.md`
- `Monitoring_&_Operations.md`
- Any other document referenced by the affected phase

> _Do not mark documentation as updated unless the content has been reviewed and confirmed current._

---

## Verification Checklist

Before declaring the phase complete, verify every item below. **The phase is not done until every box is checked.**

- [ ] Build passes with no errors or warnings
- [ ] Linter passes with no violations
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All API tests pass (if applicable)
- [ ] All database tests pass (if applicable)
- [ ] All UI tests pass (if applicable)
- [ ] All pre-existing tests continue to pass
- [ ] No TODO, FIXME, or placeholder comments remain in code
- [ ] No debug code, `console.log`, or development-only artefacts remain
- [ ] No known regressions introduced
- [ ] Acceptance criteria from Section 5.1 are fully met
- [ ] Rollback plan has been documented and verified
- [ ] `README.md` updated (if applicable)
- [ ] `CHANGELOG.md` updated
- [ ] `PROJECT_STATUS.md` updated
- [ ] All other affected documentation updated
- [ ] No new technical debt introduced without explicit documentation
- [ ] Security review completed for any authentication, authorisation, or data-handling changes
- [ ] Performance impact assessed and within acceptable bounds

---

## Implementation Report

After completing the phase, produce a closing report structured as follows:

### Completed Work
High-level summary of what was built and why each decision was made.

### Files Created
List every new file with a one-line description of its purpose.

### Files Modified
List every modified file with a summary of changes made.

### Tests Added
Test files added and the coverage they provide.

### Documentation Updated
Documents updated and a brief description of the changes made.

### Technical Debt
Any shortcuts taken, known limitations, or deferred improvements — each with a ticket reference or rationale.

### Remaining Risks
Any risks from the risk register that were not fully mitigated, and their current status.

### Recommended Next Steps
Recommendations for the next phase, informed by discoveries made during implementation.

---

*Phase Implementation Workflow · v2.0 · Engineering Process Standard*
