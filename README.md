# Signal Path Verify

**Publish roles people can trust.**

Signal Path Verify is a job-posting integrity and approval engine built for
CareerOS's employer module. It inserts a mandatory checkpoint — validate,
attest, approve — between a recruiter drafting a vacancy and that vacancy
reaching candidates, so a job can no longer go live before it is internally
authorised, materially accurate, and signed off by an accountable human.

Built for the **Talentbank Tech Hackathon 2026**, module **02 · Employers —
Your Own Track**, as a self-developed product: **Signal Path Verify — Job
Posting Integrity & Approval Engine**.

**Live demo:** <https://careerosdemo.netlify.app>

---

## Problem

- Independent audits of job boards have found roughly **18–30% of postings
  are "ghost jobs"** — live adverts for roles that are not actually being
  actively filled (Greenhouse/employer-survey data cited in industry
  reporting on ghost-job prevalence).
- **LinkedIn** verifies the *employer's identity* (a verified company page),
  not whether the *vacancy* itself is currently funded, approved, or real.
- **JobStreet** and similar boards screen for scam postings (fake companies,
  fee-collection schemes) — not for legitimate employers publishing roles
  that were never actually authorised to be filled.
- Inside the ATS, whatever approval process exists — sign-off from a hiring
  manager, budget checks, requisition tracking — is invisible to the
  candidate and often not enforced by the software at all. Recruiters can
  publish a role the moment it's drafted.

The result: wasted applications, damaged employer brand, and candidates who
can't tell a real opening from a placeholder.

## Solution

Signal Path Verify sits between "create job" and "publish job." Every draft
is run through a deterministic rules engine that checks internal
authorisation, requirement plausibility, and market/compensation
consistency, producing an explainable **Job Integrity Score**. Blockers
must be resolved and a **hiring manager must attest and approve** before
publication is possible. Every state change — validation, edits,
submission, decision, publication — is written to an audit log.

The system does not claim to prove a job is real. It proves the posting is
*authorised, consistent, and reviewed* — and it says so explicitly in the
product copy.

---

## Live demo script

Open <https://careerosdemo.netlify.app>, go to **Employers**, and follow:

1. **Create Job → Load Demo Draft** — loads a seeded draft with realistic
   but flawed requirements.
2. **Validate and Continue** — runs the deterministic engine.
3. Validation surfaces **3 issues** (an unrealistic experience requirement
   plus warnings) with a Job Integrity Score below the approval threshold.
4. **Edit Relevant Field** jumps straight to the offending requirement;
   fix the experience requirement.
5. **Revalidate** — score improves, moving into the approval-ready band.
6. Acknowledge the remaining warnings, then **Submit for Approval**.
7. Switch role to **Hiring Manager** (role switcher, top of the workspace).
8. **Approvals → Review** the job, confirm the attestation sentence, and
   **Approve Job** — separation of duties prevents the same user who
   submitted it from approving it.
9. **Job Listings → Publish Job**.
10. **Audit Log** shows the complete trail: create → validate → edit →
    revalidate → submit → approve → publish, each with actor, role, and
    from→to status.

**Bonus:** switch to the **Job Seeker** tab — published Verify jobs show a
"Verified vacancy" badge with an integrity panel. Switch to **University**
and toggle "Verified roles only" to see the skill-demand benchmark restrict
to audited postings.

---

## Job Integrity Score (JIS)

> The estimated confidence that a posting is internally authorised,
> materially accurate, reasonably consistent with the market, and
> sufficiently transparent for publication — **not** the probability that
> the job itself is real. Public data cannot prove a company's internal
> intent to hire.

```
JIS = 0.30·A + 0.20·V + 0.20·R + 0.15·M + 0.10·C + 0.05·Q − P
```

| Component | Weight | Evidence |
|---|---:|---|
| **A** — Internal authorisation | 30% | Requisition ID, approved headcount, approved budget, assigned hiring manager, target hire date |
| **V** — Employer verification | 20% | Verified organisation account |
| **R** — Requirement plausibility | 20% | Consistency among title, seniority, responsibilities, education, skills, years of experience |
| **M** — Market consistency | 15% | Comparison against a demonstration benchmark table by title/seniority |
| **C** — Compensation consistency | 10% | Salary range vs. seniority-banded benchmark |
| **Q** — Description quality | 5% | Responsibilities, location, employment type, clarity/completeness |
| **P** — Penalties | subtracted | Applied per critical blocker, independent of the weighted total |

**Thresholds:**

| Score | Result |
|---:|---|
| 80–100 | Ready for manager approval |
| 60–79 | Review recommended — warnings require acknowledgement |
| < 60 | Changes required |
| Any critical blocker | Submission blocked regardless of score |

These are prototype thresholds; production thresholds require calibration
against historical HR decisions (recall on risky postings, false-flag rate,
review workload).

---

## Status machine

```
draft ──validate──> validating ──> needs_changes ──validate──> …
  │                                     │
  └──submit (if eligible)───────────────┘
                                         │
                                         v
                                pending_approval
                                    │        │
                              approve      request_changes / reject
                                    │              │
                                    v              v
                                approved        rejected ──edit──> draft
                                    │
                              publish / close
                                    │
                                    v
                               published ──close──> closed
```

**Governance rules enforced by the engine (not just the UI):**

- **Attestation gate** — approval requires the manager confirm, verbatim,
  that the vacancy is currently approved, funded, and intended to be filled.
- **Separation of duties** — the user who submitted a job cannot approve it.
- **Blockers override score** — a single critical blocker blocks submission
  regardless of how high the weighted score is.
- **Material edit invalidates approval** — editing an approved job reverts
  it to `draft` and clears the prior approval; it must be revalidated and
  re-approved.
- **Audit everything** — every transition writes an audit event (actor,
  role, action, from→to status, comment, timestamp); nothing mutates state
  without going through it.

---

## Architecture

| File | Responsibility |
|---|---|
| `verify-engine.js` | Pure rules module (no DOM/Alpine/localStorage). Blockers, warnings, JIS scoring, status-transition guards, audit-event shape, demo benchmark table. Runs identically in Node (tests) and the browser. |
| `verify-seeds.js` | 5 seed jobs pinned to exact scores/statuses (Backend Engineer 86, Graduate Data Analyst 58, Product Designer 93, Marketing Intern blocked, Cybersecurity Specialist 76) + 3 demo personas + demo draft. |
| `verify-store.js` | localStorage persistence layer (`spv.jobs`, `spv.audit`, `spv.role`, `spv.seedVersion`). Seeds/validates on load, self-heals corrupt JSON, delegates all mutation to `engine.applyTransition`, exposes `reset()`. |
| `viz.js` | D3 radial score gauge + component weight bars (animated, colour-coded by threshold). |
| `app.js` | Alpine state/actions bridging the store to the UI: `initVerify`, `setVerifyRole`, `resetVerifyData`, status helpers, wizard/approval/listing/audit view logic. |
| `index.html` | Employer workspace (`hr` tab): role switcher, Overview, Create Job wizard, Approvals, Job Listings, Audit Log, plus the pre-existing Market Intel view. Seeker and University tabs read published Verify jobs for the "Verified vacancy" badge and the verified-only benchmark toggle. |
| `tests/verify-engine.test.js` | 16 `node:assert` groups exercising the engine in isolation. |

### Why client-side

This is a hackathon prototype on an RM0 budget: no backend, no API keys, no
database. `verify-engine.js` is deliberately framework-free so it is a
drop-in for a real backend rather than a throwaway. Persistence is
`localStorage` with an explicit **Reset Demo Data** action (workspace button
+ footer link) instead of a server, and the "market benchmark" is a small,
clearly labelled demonstration table rather than live market data.

### Production path

The `server/` Express app already in this repo can adopt
`verify-engine.js` unchanged — it has no DOM or storage dependency — for
server-side enforcement, the layer that actually matters for security
(status transitions, blocker checks, and approval rules must not be
client-trusted in production). The market-benchmark lookup (`findBenchmark`
in `verify-engine.js`) swaps out for licensed labour-market data or an
approved provider API behind the same function signature. The deterministic
engine remains the guardrail in every version; LLM-assisted requirement
analysis, if added, slots in behind the same service interface as an
additional evidence source — never as the approval decision-maker.

---

## Tests

```bash
npm test
```

Runs `tests/verify-engine.test.js` — 16 plain `node:assert` groups, no
framework, testing the engine in isolation:

- Weighted JIS formula correctness and clamping/penalty behaviour.
- Every one of the 13 critical blockers fires individually.
- Entry-level/internship experience-warning thresholds.
- Salary min-above-max as a blocker.
- Score-threshold boundaries (59/60/79/80).
- A blocker blocks submission even at a high score.
- Every legal status transition succeeds; every illegal one throws.
- Approval requires attestation; self-approval is rejected.
- Audit events carry the correct from/to status per transition.
- Editing an approved job reverts it to draft and clears the approval.
- All 5 seed jobs match their pinned scores exactly (regression pin).
- The bundled demo draft triggers exactly 3 issues and zero blockers.
- `validateJob` is deterministic (same input, same output).
- `canSubmit` recomputes blockers from current job state — a stale
  validation result cannot be used to bypass a newly-introduced blocker.

All 16 pass; `node --check` is clean on every module (`app.js`, `viz.js`,
`verify-engine.js`, `verify-seeds.js`, `verify-store.js`).

---

## AI provenance

This project was built with **Claude Code**. The engine and UI were
generated by AI under continuous human product direction: every business
rule (blockers, warnings, scoring weights, status machine, governance
rules) was human-specified first, in
[`signal-path-verify-product-spec.md`](signal-path-verify-product-spec.md),
before any code was written. A second model pass reviewed the engine for
correctness gaps (stale-validation submit bypass, publish-gate
self-approval recheck, fail-closed employer verification) before the
implementation was accepted.

- **The scoring and approval engine is deterministic** — `verify-engine.js`
  makes zero runtime AI calls and requires no API keys. Every score,
  blocker, and warning is produced by plain arithmetic and rule checks that
  can be read and audited line by line.
- Anywhere the UI says "AI-assisted," that refers to the explainable rule
  engine's evidence and recommendations, not a live model call — there is
  no LLM in the runtime path.
- The demonstration market-benchmark table is explicitly labelled as demo
  data throughout the UI and is not presented as live market intelligence.

---

## Running locally

```bash
python3 -m http.server 5189
```

Then open `http://localhost:5189`. The frontend uses `demo-api.js` for
local mock data by default (set `USE_LOCAL_MOCKS = false` in `index.html`
to call the Express API instead — see `server/index.js`, `npm run dev`).
Signal Path Verify itself needs no backend: it runs entirely on
`verify-engine.js` + `verify-store.js` + `localStorage`.
