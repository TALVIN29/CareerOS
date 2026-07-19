# Signal Path Verify — Product, Integration, and Implementation Specification

> Consolidated from the CareerOS product-planning discussion on 15 July 2026.

## Executive summary

Signal Path Verify is an employer-side job-posting integrity and approval module for CareerOS. It introduces a mandatory checkpoint between creating a job advertisement and publishing it to candidates.

The system combines deterministic validation rules, market comparison, explainable AI assistance, hiring-manager approval, controlled publication, and an audit trail. Its purpose is not to claim that AI can prove whether a vacancy is genuine. Its purpose is to ensure that each vacancy is internally authorised, materially accurate, reasonably consistent, and reviewed by an accountable human before it goes live.

**Primary tagline:** Publish roles people can trust.

**Core proposition:** AI checks the posting. Managers confirm the vacancy. Candidates see opportunities they can trust.

## Reference-system observation

The CareerOS reference employer flow includes employer registration, a hiring dashboard, job creation, candidate matching, and a recruitment pipeline. In the reference job-posting screen, the employer can publish a completed role immediately.

The current Signal Path prototype at <https://careerosdemo.netlify.app/> instead presents a broad career-intelligence platform for job seekers, employers, and universities. Its current employer workspace focuses on competitor hiring signals, workforce skills, and market scanning. It does not yet provide job authoring, internal authorisation, validation, approval routing, publishing controls, or an audit trail.

The proposed module fills this missing pre-publication governance stage without replacing the existing CareerOS candidate-matching or recruitment-pipeline features.

## Problem statement

### Formal version

Employers often lack a structured validation and approval process before job advertisements are published. Recruiters may unintentionally publish vacancies that are not yet authorised, funded, or aligned with the hiring manager's actual expectations. Job descriptions may also contain unrealistic experience requirements, mismatched salaries, unclear responsibilities, excessive skills, or inaccurate seniority expectations. This produces unsuitable applications, wasted recruitment effort, delayed hiring, employer-brand damage, and false expectations among job seekers.

### Short presentation version

Employers can publish job advertisements before confirming that the vacancy and its requirements are accurate, approved, and realistic. This creates inefficient hiring and false expectations for candidates.

### Design question

> How might we help employers ensure that every job advertisement is approved, realistic, and trustworthy before it is published?

## Solution statement

Signal Path Verify is an employer-side job validation and approval platform that checks every job advertisement before publication. It compares the proposed title, seniority, experience, skills, and salary against approved internal hiring information and comparable market postings. It generates an explainable Job Integrity Score, flags inconsistencies, and sends the posting to the correct hiring manager for approval. A job can only be published after critical issues are resolved and human approval is recorded.

The AI never publishes, approves, or permanently rejects a job by itself. It provides evidence and recommendations. The hiring manager remains accountable for the decision.

## CareerOS module classification

This product belongs under:

**02 · Employers — Your Own Track (Wildcard)**

Recommended module name:

**Signal Path Verify — Job Posting Integrity & Approval Engine**

The closest supplied module is Smart Talent Matching, but that module asks which candidate best matches an existing vacancy. Signal Path Verify addresses an earlier question: whether the vacancy itself is accurate, authorised, and suitable to publish. It improves the input quality for later talent matching but should be presented as a self-developed employer product.

## CareerOS integration

### Existing flow

Recruiter creates job → job is published → candidates are matched → applications enter the pipeline.

### Improved flow

Recruiter creates draft → integrity validation → recruiter resolves issues → hiring-manager approval → publication → matching and candidate pipeline.

The current CareerOS dashboard, candidate matching, and recruitment pipeline can remain. Signal Path Verify is inserted between the job form and publication.

### Required employer navigation

- Overview
- Create Job
- Approvals
- Job Listings
- Candidate Pipeline
- Audit Log
- Settings

### Replace immediate publication

Replace the existing `Publish role` action with `Validate and Continue`.

The job is saved as a Draft. It cannot be published until it has passed critical checks and received manager approval.

### Job statuses

| Status | Meaning |
|---|---|
| Draft | Recruiter is preparing the job |
| Validating | Automated checks are running |
| Needs Changes | Unresolved blockers or warnings require attention |
| Pending Approval | Waiting for a hiring-manager decision |
| Approved | Manager approved; ready for publication |
| Published | Visible to candidates |
| Rejected | Manager rejected the vacancy |
| Closed | Vacancy is no longer active |

## User roles

### Recruiter

- Creates and edits the job advertisement.
- Adds a requisition, headcount, budget, and hiring manager.
- Reviews validation feedback.
- Resolves or acknowledges warnings.
- Submits eligible jobs for approval.
- Cannot approve their own submission.

### Hiring manager

- Confirms the vacancy is approved, funded, and intended to be filled.
- Reviews requirements, salary, validation evidence, and recruiter comments.
- Approves, rejects, or requests changes.

### HR administrator

- Verifies employer and policy settings.
- Monitors unresolved risks and overdue approvals.
- Reviews audit history.
- Configures validation thresholds and critical policies.

## Core user journey

1. The recruiter starts a job draft.
2. Vacancy authorisation information is entered.
3. Role details, salary, responsibilities, and requirements are entered.
4. Deterministic checks validate mandatory information.
5. Market evidence and AI-assisted analysis identify inconsistencies.
6. An explainable Job Integrity Score is calculated.
7. The recruiter resolves blockers and reviews warnings.
8. An eligible job is submitted to the assigned hiring manager.
9. The manager reviews the posting and attests that the vacancy is genuine and funded.
10. The manager approves, rejects, or requests changes.
11. An approved job can be published or scheduled.
12. Every material action is written to the audit log.

## Job Integrity Score

The score should be described as:

> The estimated confidence that a posting is internally authorised, materially accurate, reasonably consistent with the market, and sufficiently transparent for publication.

It must not be described as the probability that a job is real. Public data cannot prove a company's internal intent to hire.

### Weighted formula

\[
JIS = 0.30A + 0.20V + 0.20R + 0.15M + 0.10C + 0.05Q - P
\]

Where:

- `A` = internal authorisation
- `V` = employer verification
- `R` = requirement plausibility
- `M` = external market consistency
- `C` = compensation consistency
- `Q` = description quality
- `P` = penalties for critical contradictions or risk signals

| Component | Weight | Evidence |
|---|---:|---|
| Internal authorisation | 30% | Approved headcount, budget, requisition, manager, hiring date |
| Employer verification | 20% | Verified organisation, domain, account, and authorised users |
| Requirement plausibility | 20% | Relationship among title, seniority, duties, education, skills, and experience |
| Market consistency | 15% | Comparable roles by title, seniority, industry, location, and employment type |
| Compensation consistency | 10% | Salary relationship to seniority, market, location, and required skills |
| Description quality | 5% | Responsibilities, reporting line, location, type, clarity, and completeness |

### Thresholds

| Score | Result |
|---:|---|
| 80–100 | Ready for manager approval |
| 60–79 | Review recommended; warnings require acknowledgement |
| Below 60 | Changes required |
| Any critical blocker | Submission blocked regardless of total score |

These are prototype thresholds. Production thresholds must be calibrated against historical HR decisions using risky-post recall, false-flag rate, precision, score calibration, and review workload.

### Per-requirement analysis

Each requirement should be extracted into structured data:

- Requirement name
- Type: skill, experience, education, certification, or language
- Required or preferred
- Years of experience where applicable
- Internal justification
- Evidence sources
- Confidence
- Plain-language explanation

An uncommon requirement is not automatically invalid. If public evidence is limited, show `Limited comparable market evidence — manager justification required` rather than accusing the employer of publishing a false role.

## Critical blockers

Critical blockers prevent submission for manager approval:

- Missing hiring manager
- Missing requisition ID
- Headcount not approved
- Budget not approved
- Unverified employer
- Minimum salary above maximum salary
- Missing employment type
- Missing location or remote status
- No responsibilities
- No approval route
- Candidate payment requested
- Unnecessary banking or sensitive identity information requested
- Discriminatory or unlawful requirements
- Material copying or impersonation risk requiring human escalation

## Non-critical warnings

- Entry-level role requesting more than three years of experience
- Internship requesting more than two years of experience
- Senior role with unusually low demonstrated salary
- Excessively wide salary range
- More than eight required skills
- Responsibilities inconsistent with the title
- Education requirement without justification
- Very short or vague description
- Duplicate or contradictory requirements
- Salary omitted from the candidate view
- Limited comparable-market evidence
- Market benchmark differs materially from the proposal

Warnings should be explainable, editable, and capable of being acknowledged by authorised users. They should not be treated as proof of fraud.

## Hiring-manager attestation

Approval requires the manager to confirm:

> I confirm that this vacancy is currently approved, funded, and intended to be filled, and that the advertised responsibilities and requirements reflect the department's actual needs.

The attestation, decision, user identity, comments, and timestamp must be recorded.

## Viability assessment

| Feature | Viability | Notes |
|---|---|---|
| Draft and approval workflow | Very high | Standard application functionality |
| Manager attestation | Very high | Straightforward role-based workflow |
| Fixed validation rules | Very high | Reliable, explainable, and easy to demonstrate |
| Explainable weighted scoring | High | Deterministic formula avoids invented percentages |
| AI requirement analysis | High | Useful when paired with rules and human review |
| Public job comparison | Medium | Depends on lawful data access, freshness, and quality |
| AI proving a job is genuine | Low | Internal hiring intent cannot be proven externally |
| Preventing unauthorised publication | High | Enforced through approval and server-side controls |

The solution is viable when positioned as an AI-assisted, human-controlled job-integrity system. Its strongest evidence is internal: requisition, approved headcount, budget, assigned manager, intended hiring date, and attestation.

The main production risk is external market data. Scraping third-party job sites may face access restrictions, terms-of-service limitations, duplicated advertisements, inconsistent titles, and outdated postings. The hackathon prototype should use a clearly labelled demonstration benchmark. Production should use licensed labour-market data, official APIs, an approved data provider, or employer-owned historical postings.

## Technical architecture

| Layer | Responsibility |
|---|---|
| Job form | Collects vacancy, salary, requirements, authorisation, and approval route |
| Validation service | Runs deterministic and AI-assisted checks |
| Market-data service | Supplies comparable-job evidence |
| Scoring engine | Calculates the deterministic Job Integrity Score |
| Approval service | Routes jobs and records decisions |
| Publishing service | Enforces approval and blocker rules before publication |
| Audit service | Records important events and state transitions |

### Suggested entities

#### Jobs

- ID and organisation ID
- Recruiter and hiring-manager IDs
- Requisition ID
- Department and business justification
- Headcount and budget approval
- Role, location, type, seniority, salary, responsibilities, and requirements
- Integrity score and status
- Created, updated, approved, published, and closed timestamps

#### Validation results

- Job ID
- Overall and component scores
- Critical blockers
- Warnings
- Passed checks
- Evidence
- Recommendations
- Model/rules version
- Validation timestamp

#### Approvals

- Job and approver IDs
- Decision
- Attestation
- Reason category
- Comments
- Timestamp

#### Audit events

- Job, user, and role
- Action
- Previous and new states
- Comment
- Timestamp

### Suggested API surface

```text
POST   /api/jobs
PUT    /api/jobs/:jobId
POST   /api/jobs/:jobId/validate
GET    /api/jobs/:jobId/validation
POST   /api/jobs/:jobId/submit-for-approval
POST   /api/jobs/:jobId/request-changes
POST   /api/jobs/:jobId/approve
POST   /api/jobs/:jobId/reject
POST   /api/jobs/:jobId/publish
GET    /api/employer/approvals
GET    /api/jobs/:jobId/audit-log
```

The backend, not only the frontend, must enforce:

- Status is `APPROVED` before publication.
- No critical blocker remains.
- A valid manager approval exists.
- The approver is not the originating recruiter.
- The approval has not been invalidated by material edits.

## Prototype scope

The first end-to-end demonstration should show:

1. A recruiter creates a Backend Engineer job.
2. Validation identifies three issues.
3. The recruiter fixes an unrealistic experience requirement.
4. The score improves.
5. The job is submitted for approval.
6. The demo switches to Hiring Manager mode.
7. The manager reviews the evidence and approves it.
8. The job becomes publishable.
9. The publication and all prior actions appear in the audit log.

Use at least five seeded jobs:

- Backend Engineer — 86/100 — Pending Approval
- Graduate Data Analyst — 58/100 — Needs Changes
- Product Designer — 93/100 — Approved
- Marketing Intern — Blocked — Missing Headcount Approval
- Cybersecurity Specialist — 76/100 — Manager Review

If no backend is available, use a typed mock service layer and `localStorage`, keep business rules outside UI components, and include a Reset Demo Data action. Clearly label market evidence as `Demonstration market benchmark` and do not claim that mock information is live.

## UX and redesign brief

Reposition the existing broad Signal Path site around employers and job integrity.

### Public landing page

- Headline: `Publish roles people can trust.`
- Supporting copy: `Validate every job advertisement, resolve unrealistic requirements, and obtain hiring-manager approval before the opportunity reaches candidates.`
- Primary action: `Create a Job Draft`
- Secondary action: `View Approval Workflow`
- Show one focused product preview with an integrity score, pending approval, resolved warnings, and audit history.
- Follow with the problem, Validate/Approve/Publish workflow, score explanation, human accountability, product preview, and final call to action.

### Employer dashboard

- Greeting and attention summary
- Create Job primary action
- Counts for Drafts, Needs Changes, Pending Approval, Approved, and Published
- Action Required section
- Recent jobs table with role, department, recruiter, manager, score, status, update time, and action
- Avoid generic charts and excessive cards

### Create-job wizard

1. Vacancy Approval: requisition, department, vacancies, manager, recruiter, target date, headcount, budget, justification.
2. Role Details: title, location, workplace arrangement, type, seniority, salary, reporting line, summary, responsibilities.
3. Requirements: structured requirement builder with required/preferred designation and justification.
4. Review and Validate: preview, completeness, score, blockers, warnings, evidence, recommended corrections, and submission.

### Validation results

- Overall score and component breakdown
- Critical Blockers, Warnings, and Passed Checks
- Each issue shows why it matters, evidence, recommended change, and Edit Relevant Field action
- AI-assisted label and last-validation timestamp
- Persistent human-accountability statement

### Approval page

- Full vacancy and internal authorisation
- Score and remaining warnings
- Market comparison and change history
- Recruiter comments
- Required manager attestation
- Approve, Request Changes, and Reject actions

### Approvals, listings, and audit

- Approvals tabs: Awaiting My Approval, Changes Requested, Approved, Rejected
- Filters by department, recruiter, risk, score, and date
- Job management actions appropriate to each status
- Searchable audit table or timeline recording creation, validation, edits, submission, decisions, publication, and closure

## Visual direction

- Professional, calm, transparent enterprise SaaS
- White or very light cool-grey background
- Deep navy text, cobalt-blue primary accent
- Emerald success, amber warning, restrained red blockers
- Subtle blue-grey borders and restrained shadows
- Inter, Manrope, or the project's existing quality sans-serif
- Proper icon library such as Lucide; no raw icon Unicode strings
- Strong typography and whitespace
- Desktop-first but fully usable at 1440, 1280, 1024, 768, and 390 pixels
- Avoid generic purple AI gradients, neon colours, glassmorphism, decorative dashboards, and excessive animations

## Accessibility and quality

- WCAG 2.1 AA target
- Semantic landmarks, labels, heading hierarchy, keyboard operation, visible focus, error summaries, associated inline errors, and reduced motion
- Status meaning must not rely only on colour
- Responsive navigation and readable mobile alternatives for tables
- Working form persistence, validation, role switching, approval decisions, audit log, filters, and reset function

Add tests for weighted scoring, penalties, thresholds, blockers, experience warnings, salary validation, submission prevention, approval transitions, separation of duties, and audit-event creation. Run linting, type checks, tests, production build, end-to-end recruiter and manager journeys, responsive checks, and console-error inspection.

## Recommended implementation order

1. Preserve the current repository and identify reusable employer components.
2. Narrow the product story to Signal Path Verify.
3. Implement types, state machine, seed data, and persistence.
4. Implement the manual draft and approval workflow.
5. Add deterministic validation and scoring.
6. Add market benchmark abstraction and demonstration data.
7. Add explainable AI assistance behind a replaceable service interface.
8. Implement audit history and server-side publication enforcement.
9. Test with approved, warning, blocked, rejected, and published scenarios.

## Product language guardrails

Use:

- Critical blocker
- Warning
- Needs clarification
- Limited evidence
- Requires manager confirmation
- Ready for manager review

Avoid:

- Definitely fake
- Fraudulent, unless independently confirmed
- Guaranteed genuine
- AI approved
- 100% verified

The final demonstration story is:

> A recruiter cannot publish a questionable job immediately. Signal Path Verify checks the advertisement, explains its concerns, requires hiring-manager accountability, and keeps an auditable record before the role reaches candidates.

## Final viability verdict

Signal Path Verify is viable as a CareerOS employer module and particularly strong as a hackathon prototype. The manual approval workflow and deterministic checks are highly feasible. Explainable AI analysis is useful but must remain decision support. Public-job comparison is feasible only with appropriate data access and should use labelled demonstration data for the prototype.

The approval workflow—not the percentage alone—is the product's centre. The score makes the system intelligent; mandatory human accountability makes it credible.
