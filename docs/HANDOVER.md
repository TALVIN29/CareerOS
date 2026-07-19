# HANDOVER — engine rewire + reposition

**Written:** 2026-07-17 · **For:** the Codex teammate · **Authority:** this file supersedes `SKILL.md`,
`PRD.md`, `progress_plan.md`, and `decision_log.md`, all of which describe a superseded product (see
"Stale docs" at the bottom).

Read the two findings before the phases. If you skip to Phase 0 without them it reads as arbitrary
refactoring and you will be tempted to skip it for the fun work. Don't — Phase 0 is the whole
foundation.

---

## Finding 1 — the last commit gutted the product, and the tests hide it

`1835c7d "Implement role-accountable employer workspace"` rewrote `app.js` with an inline
reimplementation and **orphaned every module that made the pitch real.**

`index.html` loads exactly three scripts: `permissions.js`, `app.js`, Alpine. Dead code, referenced by
nothing:

- `verify-engine.js` — 416 lines: weighted JIS, 13 blockers, market benchmark, transition guards
- `verify-seeds.js` — hand-tuned seed jobs pinned to exact scores
- `verify-store.js` — localStorage layer with corrupt-JSON self-heal
- `viz.js` — D3 gauge + component bars
- `api.js`, `config.js`, `demo-api.js`, `server/` — also unreferenced

What currently ships as the "integrity engine", in full:

```js
const score = Math.max(0, Math.min(100, 100 - blockers.length * 22 - warnings.length * 7));
```

**`npm test` is green and lying.** 16 `verify-engine.test.js` assertions pass against code the app
never loads. Nothing tests `app.js`. This is why the regression survived review — green tests, dead
subject.

**The README is now false on ~8 concrete claims.** It advertises
`JIS = 0.30·A + 0.20·V + 0.20·R + 0.15·M + 0.10·C + 0.05·Q − P`, a D3 gauge, a benchmark table, 5 seed
jobs at pinned scores, and `spv.*` storage keys. The app computes none of that. A judge with DevTools
open finds this in 60 seconds — criterion 5 (stability), lost on a technicality that is entirely
fixable, because **the good code already exists and already passes.**

## Finding 2 — the position is wrong for the brief

The commit traded *depth* for *RBAC*, and every ATS has a permission matrix. It wins nothing on
"innovation & differentiation."

Current category is **compliance gate**: the employer pays, the candidate benefits, so the payer is
buying friction. That is why nobody has built this. Worse, the README's Problem section compares the
product to LinkedIn and JobStreet — which files it *inside their category*, which is exactly what the
organisers warned against.

**The fix is a category change, not a copy change:** from *compliance gate* to **verified
labour-demand infrastructure**. The approval workflow is the collection mechanism, not the product.

- **Impact** — job-posting data is the input to nearly every career decision on earth. 18–30% of it is
  fiction. The world's career map is drawn on corrupted input and nobody has cleaned the source.
- **Opportunity cost** — a ghost job doesn't waste one application. It permanently miscalibrates
  everything downstream, because nobody ever corrects the record. Student picks a major on a 4-year lag
  against a signal that's a quarter noise. University delivers a cohort 3–4 years after reading it.
  Every labour model trains on it.
- **Moat** — LinkedIn/JobStreet monetise posting volume, so verification destroys their inventory:
  their P&L *forbids* this position. Talentbank monetises employer brand + graduate outcomes, so
  verification compounds them. **The defensible asset is the behaviour time series, not the
  algorithm** — the rules engine is copyable in a weekend; twelve months of who-reconfirms-and-who-
  ghosts is not.
- **The uncontested wedge** — the approval evidence already exists inside every ATS and *dies there*.
  Nobody carries it across the employer boundary into the public signal. Doing so needs a neutral party
  holding both employers and universities. That is one org in this market.
- **Employer's reason to say yes** — the Integrity Rating is a **graduate-talent distribution
  advantage**, not a tax. Plus the pain they already feel: HR cannot answer *"how many of our live ads
  are still real?"*
- **The EUREKA beat** — one screen. Skill demand from **all postings** vs **verified-only postings**.
  They diverge. *The delta is the lie.*

Scope settled with Talvin: full build, network view read-only inside HR Admin (stays within module
02 · Employers), full README rewrite.

---

## The core constraint: two incompatible job shapes

`verify-engine.js` and `app.js` disagree on nearly every field. Settle this before touching anything.

| Concern | `verify-engine.js` (+ seeds, store, tests) | `app.js` (current) |
|---|---|---|
| status | `'draft'`, `'pending_approval'` | `'Draft'`, `'Pending Approval'` |
| manager | `hiringManagerId` | `assignedManagerId` |
| responsibilities | **array** | **string** |
| requirement type | `'skill'` / `'experience'` / `'education'` | `'Technical'` / `'Soft skill'` / `'Education'` |
| requirement years | `yearsExperience` | `years` |
| seniority | `'entry'` / `'mid'` / `'senior'` / `'intern'` | `'Entry level'` / `'Mid level'` / `'Internship'` |
| salary | monthly MYR (6000) | annual (72000) |
| approval | `job.approval` | `job.managerDecision` |
| validation | nested `job.validation` | flat `.score` / `.blockers` / `.warnings` |
| blockers | objects `{id, message, field}` | strings |

**Decision (settled — do not relitigate): the engine shape is canonical.** `app.js` adapts to it.
Delete `makeJob`, delete `validate()`, delete the hand-synced duplicate fields
(`score`/`validationScore`, `warnings`/`validationWarnings`, `approvalTimestamp`/`approvedAt`,
`publishedTimestamp`/`publishedAt`, `confirmationDueDate`/`confirmationDueAt`). Note `makeJob` spreads
`...data` **last**, so seed fields silently override normalised ones — that lands in the delete pile too.

**Rejected: an adapter mapping app-shape ↔ engine-shape.** Smaller diff, but it keeps two shapes
hand-synced forever — which is the exact rot already inside `makeJob` — and leaves the 16 tests still
not guarding what the UI renders.

`permissions.js` identities stay canonical (Alicia Tan / Daniel Lee / Mei Wong; `user-recruiter-alicia`
etc.). `verify-seeds.js` uses different personas (`u_aisyah` / `u_daniel` / `u_priya`) — re-id its jobs
to the `permissions.js` userIds. **Safe for the pinned-score tests:** scores depend on the *truthiness*
of `hiringManagerId`/`requisitionId` and on salary/requirements, never on the id value.

---

## Phase 0 — Rewire the engine (first; shippable alone)

Restores depth + differentiation, makes the 16 tests guard live code, and retroactively makes most
README claims true again.

**`index.html`** — restore the script tags dropped by `1835c7d`, in dependency order (`verify-store.js`
needs Engine + Seeds already global):

```html
<script src="./verify-engine.js"></script>
<script src="./verify-seeds.js"></script>
<script src="./verify-store.js"></script>
<script src="./permissions.js"></script>
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="./viz.js"></script>
<script src="./app.js"></script>
```

**`app.js`**
- Delete `makeJob`, `initialJobs`, `validate()` (~lines 11–66, 305–325) and the hand-rolled `persist()`.
- Source jobs/audit/persistence from `VerifyStore` (`loadJobs`/`saveJobs`/`loadAudit`/`addAudit`/`seed`/
  `reset`) instead of `careeros-role-workspace`.
- Route **every** mutation through `VerifyEngine.applyTransition(job, action, actor, opts)`. It already
  returns `{job, auditEvent}` and already throws on illegal transitions. This deletes the scattered
  per-handler status assignments in `approve()` / `reject()` / `requestChanges()` / `publish()` /
  `submitForApproval()` / `withdraw()`.
- Keep `permissions.js` gating **in front of** it: `canUser` answers *may this user*, the engine answers
  *is this transition legal*. Both, in that order. Lowercase the status strings inside `canUser`.
- Replace `prompt()` in `reject()` / `requestChanges()` with an inline textarea — a modal already exists
  for `freshnessJobId`, reuse that pattern.

**`viz.js`** — wire `renderGauge(elId, score)` + `renderComponentBars(elId, components)` into wizard
step 4 and the manager's submission-review panel. This is what makes "explainable score" *look*
explainable. A number on a card does not.

**Extend the engine with the freshness lifecycle.** `published → reconfirm | pause_stale | mark_filled`
are app-only statuses today, absent from `STATUSES`/`TRANSITIONS` — yet the reconfirm loop is the
strongest asset in the build *and* the raw material for Phase 1. Move it into the pure module so it is
tested and Phase 1 can compute from it. Add statuses `confirmation_due`, `paused_stale`, `filled`; add
the transitions; extend `applyTransition`.

**Free win while you're here:** "material edit invalidates approval" is advertised but unimplemented —
`canUser('edit_own_job')` merely excludes `Approved`, so approved jobs are locked, never reverted. The
engine already does it correctly (`applyTransition(job,'edit')` reverts `approved → draft` and clears
`approval`, `verify-engine.js:386–390`). Let `edit` through on `approved` and stop special-casing it in
`canUser`.

**Verify:** `npm test` passes, now against loaded code. Then drive the app (see Verification).

---

## Phase 1 — Employer Integrity Rating (the moat, made visible)

Scored from **hiring behaviour over time**, not one form's fields. That's the point: the JIS rates a
*posting*; the EIR rates an *employer*; only the second compounds.

**Where:** add to `verify-engine.js`. Same category (pure deterministic rules over jobs), no new file,
no new script tag. Unit of analysis differs, but the module contract — no DOM, no storage, identical in
Node and browser — holds.

```js
computeEmployerRating(jobs, now) -> { rating, band, components, sampleSize }
```

Components, all derivable from what Phase 0 puts in place:
- **reconfirm-on-time rate** — of published jobs whose `confirmationDueAt` has passed, % reconfirmed before due
- **ghost rate** — published roles closed with no hire (`closed`, `filledAt == null`) — the headline number
- **decision latency** — median days `submittedAt → approval.ts`
- **stale rate** — % of published currently `paused_stale`

Weighted, explainable, thresholded — same spirit and same honesty caveat as JIS (prototype weights,
production needs calibration). **Return and surface `sampleSize`:** a rating off 3 jobs is not a rating,
and saying so out loud is the credibility move.

**Peer leaderboard:** 5 peer orgs with pre-baked job histories → `verify-seeds.js` (its literal job — it
is already the seeds file). Vertex Digital ranked against them. Read-only, HR Admin only.

**Tests:** extend `tests/verify-engine.test.js` — each component in isolation, the weighting, band
boundaries, small-sample guard.

---

## Phase 2 — The divergence chart (the EUREKA beat)

**All postings vs verified-only postings, skill demand, side by side. The delta is the lie.**

- Corpus: the Phase 1 peer-org seed jobs. Reuse — no new data.
- Left: skill frequency across **all** jobs regardless of status/verification.
- Right: **published + employer-verified + reconfirmed-within-window** only.
- State the delta explicitly and quantified: *"X% of the demand signal for [skill] came from roles that
  were never authorised."*
- Replaces the current Network Impact page — 4 counters of the org's own jobs (`index.html:230`), which
  argues nothing.
- Read-only under HR Admin. `permissions.js` **already declares `view_network_impact` for `hr_admin`** —
  the permission exists, the payload doesn't. Stays inside module 02.

D3 is loaded by Phase 0 and `viz.js` is already the chart module. **No new dependency.** This is the one
screen the judges must not find ugly — give it the time.

---

## Phase 3 — Landing page + README rewrite

**`index.html` home section (~lines 34–87):**
- Hero: from *"Publish roles people can trust"* (employer-behaviour framing) to the corrupted-career-map
  framing.
- **Cut the LinkedIn/JobStreet comparison from the Problem section.** It files the product under their
  category. Replace with the ATS gap (Finding 2, "uncontested wedge").
- Add: opportunity cost, the incentive-alignment moat, and the divergence chart as the proof beat.

**`README.md` — full rewrite** around the new position: impact, opportunity cost, value prop per side,
moat, competitive gap, eureka. Then a truth pass on what Phase 0 doesn't retroactively fix:
- seed counts/scores (README says 5 pinned; repo has 8 at different scores)
- storage keys (`spv.*` vs `careeros-*` — settle on whichever survives Phase 0)
- the demo script (personas re-id'd; Reset Demo is HR-admin/Settings-only, not "workspace button + footer link")
- the test list (now includes EIR + permissions + wiring)
- `package.json` identity — still `career-os-api`, *"Express API server for the GapHunter CareerOS demo"*,
  for what is a static frontend

**Honesty guardrails — keep, do not soften.** They are an asset with judges, not a weakness:
- JIS is *not* a claim the job is real — only that the posting is authorised, consistent, reviewed.
- The benchmark table is demo data, labelled as such.
- Zero runtime LLM calls; every score is auditable arithmetic.
- EIR weights are prototype, uncalibrated.
- `permissions.js:56` already says client checks are prototype-only and production must enforce
  server-side. Keep that comment.

---

## Phase 4 — Stability

- **The regression guard — the one that matters.** A test asserting `index.html` has a `<script>` tag
  for every module `app.js` depends on. Trivially cheap, and exactly the check that would have caught
  `1835c7d`. Skip it and this happens again.
- `npm run build` → add `node --check` for `verify-engine.js`, `verify-seeds.js`, `verify-store.js`,
  `viz.js`.
- **Decide the dead server story.** `api.js`, `config.js`, `demo-api.js`, `server/` are unreferenced, and
  the deps (`better-sqlite3`, `express`, `mammoth`, `multer`, `pdf-parse`) exist only for them. README
  still says to flip `USE_LOCAL_MOCKS` in `index.html` — an identifier that doesn't exist there. Either
  delete them, or keep `server/` explicitly as the documented production path (the README already makes
  that argument, and it's a good one — `verify-engine.js` is genuinely drop-in for it). Don't leave it
  ambiguous. **Ask Talvin before deleting.**

---

## Critical files

| File | Change |
|---|---|
| `index.html` | restore 5 script tags; rewrite home section; replace Network Impact page; textarea modal for reject/request-changes |
| `app.js` | delete `makeJob`/`initialJobs`/`validate()`/`persist()`; adopt engine shape; route mutations through `applyTransition`; source from `VerifyStore` |
| `verify-engine.js` | **revive**; add freshness lifecycle to `STATUSES`/`TRANSITIONS`/`applyTransition`; add `computeEmployerRating` |
| `verify-seeds.js` | **revive**; re-id personas to `permissions.js` userIds; add 5 peer orgs with histories |
| `verify-store.js` | **revive** as the persistence layer |
| `viz.js` | **revive** `renderGauge`/`renderComponentBars`; add divergence chart |
| `permissions.js` | lowercase status strings in `canUser`; stop special-casing edit-on-approved |
| `tests/verify-engine.test.js` | extend: lifecycle transitions, EIR components |
| `tests/permissions.test.js` | update status strings |
| `tests/wiring.test.js` | **new** — script-tag regression guard |
| `README.md` | full rewrite + truth pass |
| `package.json` | identity, `build` checks, test list |

## Reuse — already in the repo, do not rewrite

- `VerifyEngine.applyTransition` — transition guards + audit event shape. **Replaces** every hand-rolled status assignment in `app.js`.
- `VerifyEngine.canSubmit` — already recomputes blockers from current state; a stale validation cannot bypass a new blocker. Tested.
- `VerifyEngine.canApprove` — separation of duties, engine-side.
- `VerifyEngine.findBenchmark` — the documented swap point for licensed market data.
- `VerifyStore.*` — localStorage + corrupt-JSON self-heal + `reset()`.
- `VerifyViz.renderGauge` / `renderComponentBars` — written, animated, threshold-coloured, unused.
- `CareerOSAuth.canUser` / `canAccessJob` / `canAccessRoute` — keep as-is bar the status strings.

## Verification

**Tests alone cannot catch this class of bug** — the engine was fully green while disconnected. Drive
the app.

1. `npm test` — engine + EIR + permissions + wiring guard, all pass.
2. `npm run build` — `node --check` clean on every shipped module.
3. `python3 -m http.server 5189`, open `http://localhost:5189`, **DevTools console open** (a judge will):
   - Console clean; Network tab shows all 5 local modules **200, not 404**.
   - Recruiter (Alicia) → wizard → **Run Automated Validation** → gauge renders, component bars show
     A/V/R/M/C/Q. Confirm the score matches the weighted formula and **not**
     `100 − blockers*22 − warnings*7`.
   - Blocker present → submit refused **by the engine** (force an illegal transition from the console;
     `applyTransition` must throw).
   - Submit → sign out → Manager (Daniel) → approve **without** ticking attestation → refused. Tick → approves.
   - Self-approval: submit as Daniel, approve as Daniel → refused by `canApprove`.
   - Edit an approved job → reverts to `draft`, approval cleared (the README claim, now real).
   - Publish → reconfirm loop → let confirmation lapse → `paused_stale`.
   - HR Admin (Mei) → EIR + peer leaderboard render with `sampleSize` shown; divergence chart renders,
     both panels, delta stated.
   - Restricted `#/workspace/...` per role → redirects to that role's Overview.
   - Reload → localStorage state survives. **Reset Demo** → back to seeds.
4. Pinned-score regression: seed jobs still compute their documented scores after the re-id.
5. Re-read the README top to bottom against the running app. Every claim: verified, or cut.

---

## Stale docs — do not follow them

`AGENTS.md` and the docs it points at are dated **2026-06-02** and describe a **product that no longer
exists**: a two-sided APAC career marketplace on Next.js 14 + Supabase + Claude API, with three modules
(Career Path Navigator / Smart Talent Matching / Fair Pay Engine). None of that is in this repo. What
exists is Signal Path Verify: vanilla JS + Alpine, employer-only, static, zero LLM calls.

Specifically ignore, unless Talvin says otherwise:

- `SKILL.md` — Next.js/Supabase/Claude API structure and conventions. Wrong stack.
- `PRD.md` — the three-module marketplace scope. Wrong product. Still marked "Awaiting PRD Lock".
- `progress_plan.md` — *"1/28 tasks = 4%"*, *"Blockers: PRD not yet locked. No code changes until Talvin
  says 'PRD locked.'"* Six weeks stale; do not treat as a gate on this work.
- `decision_log.md` / `stakeholder_decision.md` — decisions about the superseded product.
- `AGENTS.md` rule 10 — *"Mock data only for Phase 1 / Real Claude API calls required for Phase 2"*. There
  is no Phase 2 and no API key. The engine is deterministic **by design**, and that is a selling point,
  not a gap.

**This file is the authority.** Reconciling or deleting the stale set is a decision for Talvin — flag it,
don't do it unasked.
