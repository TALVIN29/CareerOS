# CareerOS Verify

**Verified labour demand, not another job board.**

CareerOS Verify is a static employer-governance prototype that turns internal
hiring evidence into a trustworthy vacancy signal. Recruiters validate a job,
the accountable Hiring Manager approves it, and the employer must keep
confirming that hiring is active after publication.

The result is a closed, auditable vacancy lifecycle rather than a one-time
"verified" badge.

## Product Positioning

Most labour-market products analyse what employers publish. CareerOS improves
the source signal before it reaches candidates, universities, workforce
planners, or downstream AI systems.

It demonstrates three connected controls:

1. **Automated Validation** checks authorisation evidence, requirement
   plausibility, salary consistency, and description quality.
2. **Human Manager Approval** confirms that the role is funded, intended to be
   filled, and accurately represented.
3. **Active Vacancy Assurance** requires periodic reconfirmation and visibly
   pauses stale vacancies instead of allowing abandoned demand to remain live.

CareerOS does not claim that software can prove employer intent. It records the
evidence, accountable decision, and subsequent behaviour that make a vacancy
more trustworthy.

## Demo Roles

The login screen provides three seeded accounts. All use `demo123`.

| Persona | Email | Responsibility |
|---|---|---|
| Alicia Tan, Recruiter | `recruiter@careeros.demo` | Draft, validate, submit, publish, and reconfirm vacancies |
| Daniel Lee, Hiring Manager | `manager@careeros.demo` | Review assigned submissions and make attested decisions |
| Mei Wong, HR Administrator | `admin@careeros.demo` | Monitor governance, integrity, freshness, policy, and audit evidence |

Role separation is enforced in both navigation and record-level actions. The
recruiter cannot approve their own submission, the manager cannot rewrite the
recruiter's vacancy, and the administrator cannot silently bypass the decision
workflow.

## Recommended Walkthrough

1. Log in as **Alicia Tan** and open **Create Job**.
2. Load the demo draft, review the vacancy evidence, and run **Automated
   Validation**. The D3 gauge and weighted component bars explain the Job
   Integrity Score.
3. Acknowledge any warnings and submit the validated vacancy to Daniel Lee.
4. Log in as **Daniel Lee**, open **Approval Queue**, inspect the evidence and
   audit history, accept the attestation, and approve or request changes in the
   in-app decision dialog.
5. Return as Alicia to publish the approved vacancy and inspect the
   candidate-safe verification preview.
6. Log in as **Mei Wong** and open **Network Impact** to review the Employer
   Integrity Rating, peer leaderboard, and verified-demand divergence.
7. Review **Audit Log** and **Governance Settings** to see the evidence trail and
   configurable confirmation policy.

## Deterministic Integrity Engine

The Job Integrity Score is calculated locally with no LLM call:

```text
JIS = 0.30A + 0.20V + 0.20R + 0.15M + 0.10C + 0.05Q - P
```

| Component | Weight | Evidence |
|---|---:|---|
| A: Internal authorisation | 30% | Requisition, headcount, budget, manager, and hire date |
| V: Employer verification | 20% | Seeded verified-organisation evidence |
| R: Requirement plausibility | 20% | Seniority, experience, education, and skill consistency |
| M: Market consistency | 15% | Clearly labelled demonstration benchmark data |
| C: Compensation consistency | 10% | Salary range and seniority alignment |
| Q: Description quality | 5% | Responsibilities, location, type, and clarity |
| P: Critical penalties | Deduction | Applied independently of the weighted score |

Any critical blocker prevents submission regardless of score. Scores from 60
to 79 require explicit warning acknowledgement, while scores of 80 or more are
ready for Manager Approval.

## Vacancy Lifecycle

```text
draft -> pending_approval -> approved -> published
  ^            |               |           |
  |            v               |           v
  +------ needs_changes         |     confirmation_due
  |                            |           |
  +--------- controlled edit --+           v
                                      paused_stale

published / confirmation_due / paused_stale -> reconfirmed, filled, or closed
```

Every transition passes through `VerifyEngine.applyTransition`. Material edits
clear prior validation and approval evidence. Publication records the approver,
and freshness actions preserve who acted, when they acted, and why.

## Employer Integrity Rating

The EIR is an explainable behavioural score based on completed vacancy history:

| Component | Weight |
|---|---:|
| Reconfirmed on time | 35% |
| Ghost-vacancy avoidance | 30% |
| Decision speed | 20% |
| Stale-vacancy avoidance | 15% |

The UI shows **Insufficient evidence** below the minimum sample instead of
manufacturing a precise score. The seeded peer leaderboard is demonstration
data and is labelled accordingly.

## Verified-Demand Divergence

The Network Impact view compares skill frequency in all visible postings with
skill frequency in currently active, verified vacancies. This illustrates how
unverified or stale postings can distort downstream curriculum and workforce
decisions. The chart is a prototype model over seeded records, not live labour
market research.

## Architecture

| File | Responsibility |
|---|---|
| `verify-engine.js` | Pure rules, scoring, lifecycle transitions, EIR, divergence, and audit-event construction |
| `verify-seeds.js` | Canonical demo personas, pinned vacancy examples, lifecycle history, and peer organisations |
| `verify-store.js` | Browser persistence and the only application mutation gateway into the engine |
| `permissions.js` | Role navigation, action permissions, record scope, and separation of duties |
| `viz.js` | D3 score gauges, weighted component bars, and demand-divergence rendering |
| `app.js` | Alpine application state and user-facing workflow orchestration |
| `index.html` | Static shell, landing page, role workspaces, tables, dialogs, and script wiring |
| `styles.css` | Responsive visual system and chart presentation |

The browser dependency order is intentional:

```text
verify-engine -> verify-seeds -> verify-store -> permissions -> D3 -> viz -> app -> Alpine
```

Application data is stored under `spv.*` localStorage keys. The active identity
uses `careeros-session`. **Reset Demo Data** reseeds vacancies and audit history
without inventing a server-side security boundary.

## Runtime Boundary

The current product experience is intentionally static and browser-based. It
does **not** call the Express server, scrape job boards, use SQLite, parse
resumes, or invoke an LLM.

The existing `server/` directory and backend dependencies are retained, at the
project owner's request, as dormant material for possible future enhancement.
They are not loaded by `index.html` and are not part of the CareerOS Verify demo
runtime. Production enforcement would move `VerifyEngine` and persistence to a
trusted backend while preserving the deterministic policy contract.

## Run Locally

Serve the repository as static files:

```bash
python3 -m http.server 5189
```

Then open <http://localhost:5189>.

## Verification

```bash
npm test
npm run build
```

`npm test` runs:

- Engine tests for scoring, blockers, all legal and illegal transitions,
  freshness, audit evidence, EIR, divergence, and seed-score regressions.
- Permission tests for route and record-level boundaries.
- Wiring tests that prevent the duplicate app model from returning and verify
  that the canonical scripts load in the required order.

`npm run build` syntax-checks every browser module and the retained dormant
server entry point.

## Prototype Limits

- Seeded organisations, jobs, benchmarks, and peer ratings are demonstration
  evidence, not live employer or market data.
- Browser permissions improve demo fidelity but are not a production security
  boundary.
- Employer verification is represented by seed data.
- Production deployment requires authenticated server-side enforcement,
  durable storage, calibrated thresholds, and authorised market-data sources.

## AI Provenance

AI-assisted coding supported implementation and review. The runtime itself is
deterministic: no model chooses a score, approval, lifecycle state, EIR, or
demand-divergence result. Those outcomes are produced by inspectable rules and
seeded evidence.
