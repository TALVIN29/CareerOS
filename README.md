# CareerOS Verify

CareerOS Verify is a static employer-side prototype for trustworthy vacancy signals. Employers post jobs through a familiar form while CareerOS checks approval evidence, completeness, realism, consistency, and supporting market context in the background.

The operating principle is simple:

> Post normally. CareerOS verifies the signal in the background. People step in only when a vacancy needs attention.

## Simplified Employer Journey

1. A Recruiter creates or edits a normal job posting.
2. Posting Integrity recalculates automatically from the current form values.
3. Green jobs can publish immediately as verified vacancies.
4. Amber jobs remain with the Recruiter and show only the top one to three fixes.
5. Red jobs are sent to the assigned Hiring Manager for a concise confirmation.
6. Published jobs are reconfirmed later with one click or automatically paused when stale.

No separate manual validation page is required. The **Refresh check** control exists only to make recalculation visible during the demonstration.

## Posting Integrity Rules

`calculatePostingIntegrity(job)` in `verify-engine.js` returns:

- `score`: deterministic score from 0 to 100
- `riskLevel`: `green`, `amber`, or `red`
- `hardBlockers`, `warnings`, and `passedChecks`
- `topReasons`: the most important one to three issues
- `recommendedAction`: publish, resolve issues, or request manager confirmation

The score uses five transparent factors:

| Factor | Points | Examples |
| --- | ---: | --- |
| Approval evidence | 35 | Requisition, approved headcount, budget, assigned manager, evidence source and recency |
| Posting completeness | 20 | Title, description, location, type, seniority, salary, timeline and responsibilities |
| Requirement realism | 20 | Experience and skills appropriate to the selected seniority |
| Internal consistency | 15 | Salary, title, responsibilities and work arrangement agree |
| Market comparison | 10 | Supporting demonstration benchmark only; never the sole blocker |

Default paths:

- **Green, 80–100:** ready for direct publication when no actionable issue remains.
- **Amber, 60–79 or minor actionable issues:** fix details in the same form.
- **Red, below 60 or material trust risk:** Manager Confirmation required.

Missing title or description, no assigned manager, serious unsafe content, and contradictory salary data must be corrected before routing. Missing approved headcount evidence is a Red accountability exception that an assigned manager can explicitly confirm.

## Roles

| Role | Demo email | Responsibility |
| --- | --- | --- |
| Alicia Tan, Recruiter | `recruiter@careeros.demo` | Create, edit, resolve issues, publish Green or manager-confirmed jobs |
| Daniel Lee, Hiring Manager | `manager@careeros.demo` | Confirm assigned Red exceptions and reconfirm active hiring |
| Mei Wong, HR Administrator | `admin@careeros.demo` | Monitor organisation-wide risk, stale jobs, overrides, policy and audit evidence |

All demonstration accounts use the password `demo123`. Role changes happen only through sign-out and the seeded login page.

## Judge Demo Script

1. **Green fast path:** Log in as Alicia, choose **Create Job**, load **Green**, and point out the live score and **Publish Verified Job** CTA. Publish it without visiting a separate validation page.
2. **Requirement Autopsy:** Create another job, load **Amber**, and read the autopsy panel: how long comparable requisitions take to fill, how many are abandoned, and the sample size. Lower the years of experience and watch both the survival curve and the recommendation move. This is where the gate becomes an advisor — the recruiter is told why the role will not fill, not that their posting is non-compliant.
3. **Red accountability path:** Load **Red**. Show the missing headcount evidence and use **Send for Manager Confirmation**.
4. **15-second manager decision:** Sign out, log in as Daniel, open **Confirmation Queue**, review the compact card, open the evidence, tick the single attestation, and approve.
5. **Recruiter publication:** Return as Alicia and publish the **Approved — Ready to Publish** job.
6. **Close the loop:** Return as Daniel, open **Team Vacancies**, and choose **Yes, Still Hiring**, **Position Filled**, or **Pause Vacancy**. When marking a role filled, record the hire's university — the field Talentbank already collects annually for Employers' Choice. Recording it per requisition is what turns an advertised skill into a realised one.
7. **Realised Demand Index:** Log in as Mei and show the Green/Amber/Red distribution, stale roles, audit log, Employer Integrity Rating, and finally **advertised demand vs realised demand** — how often a skill appears in postings against how often it appears in postings that produced a hire. A hire is an outcome outside CareerOS, so unlike a verification badge this gap measures the advertisement rather than our own coverage.

## Architecture

The browser runtime loads modules in this order:

1. `verify-engine.js` — deterministic scoring, risk routing, lifecycle and freshness policy
2. `verify-seeds.js` — coherent Green, Amber, Red, approved, due and stale scenarios
3. `verify-store.js` — localStorage persistence and audit events
4. `permissions.js` — central role and record-level checks
5. `viz.js` — explainable factor and demand-divergence visualisations
6. `app.js` — Alpine.js presentation and interaction state

The prototype ships as static files and uses **zero npm packages at runtime** — Alpine, D3 and Font Awesome load from a CDN, and `npm install` installs nothing. The earlier Express server, its API routes, its SQLite code and its seven backend dependencies were deleted once it was clear none of them were reachable from the deployed site; they remain in git history if the production path is ever revived.

Production integration comments identify where ATS/requisition data, backend authorisation, notification delivery, and real market or AI services would connect. The interface does not claim those integrations are live.

## Run Locally

Serve the repository as static files:

```bash
npx serve . -l 5189
```

Then open [http://localhost:5189](http://localhost:5189).

## Verification

```bash
npm test
npm run build
```

The tests cover Green direct publishing, Amber quick fixes, Red routing, manager attestation and assignment, self-approval prevention, recruiter-only publication, one-click freshness actions, automatic stale pausing, permissions, and runtime wiring.

## Vacancy Outcomes

A published requisition ends in one of three states, and the third is why this is
estimation rather than counting:

- **Filled** — the event. Duration is `filledAt − publishedAt`.
- **Abandoned** — paused as stale, or closed with no hire. A competing risk, not a success.
- **Still open** — **right-censored**. It has survived at least this long and nothing more is known.

Deleting the still-open rows biases every median downward, because the long-running
open requisitions are exactly the ones most likely to become ghosts. So `survivalCurve()`
in `verify-engine.js` is a Kaplan–Meier estimator, `S(t) = Π(1 − dᵢ/nᵢ)`, and the median is
the first `t` where `S(t) ≤ 0.5` — or **"not reached"**, never extrapolated. Every cohort
carries its sample size and refuses to report below a floor of 8.

Abandonment is treated as censoring for the fill curve and reported separately as a rate.
That is informative censoring — roles are abandoned precisely because they are hard to
fill — so the curve reads slightly optimistic. Read it as *days to fill among roles still
being pursued*. The upgrade path is a competing-risks model, noted in the source.

The historical corpus in `verify-seeds.js` is **generated demonstration data**, produced by
a deterministic seeded generator from a stated rule: time-to-fill and abandonment both rise
with the number of required skills and years of experience demanded, and a third of
requisitions carry "hype" skills bolted on regardless of the role. Phantom demand is a
by-product of that rule, not a number typed in by hand. None of these hires happened.

## Prototype Limits

- Data persists in browser `localStorage` and is demonstration-only.
- Authentication and role enforcement are simulated in the browser.
- Market evidence and peer histories are seeded and explicitly labelled.
- The historical requisition corpus behind the survival curves and the Realised Demand Index is generated. The method and the pipeline are the deliverable; the numbers are not findings about the Malaysian labour market.
- Hire outcomes are self-reported by the employer and therefore gameable. In production they are auditable against the placement side, and misreporting would cost award standing.
- Scoring weights and Employer Integrity Rating require calibration before production use.
- No live ATS, email, Teams, Slack, AI, or market-data connection is active.
