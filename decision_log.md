# CareerOS — Decision Log

**Project:** CareerOS / Talentbank Tech Hackathon 2026
**Purpose:** Every significant decision made during this project is recorded here. This prevents the team from relitigating settled decisions, ensures both AI tools stay aligned, and creates an audit trail for the panel review.

**How to use this file:**
- Every time a major decision is made, add a new entry using the template below
- Date format: YYYY-MM-DD
- Status: PROPOSED → ACCEPTED or REJECTED
- Never delete rejected decisions — mark them REJECTED and write why

---

## Decision Template

```
### D[number] — [Short Title]
**Date:** YYYY-MM-DD
**Status:** PROPOSED | ACCEPTED | REJECTED
**Decision:** [What was decided in one sentence]
**Why:** [The reason — constraint, deadline, stakeholder ask, or evidence]
**Alternatives considered:** [What else was considered and why rejected]
**Impact:** [What changes as a result of this decision]
**Decided by:** [Talvin | Partner | Both | PM recommendation]
**PRD reference:** [PRD section number if applicable]
```

---

## Decisions

---

### D001 — Build on Existing index.html for Phase 1 Prototype
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Enhance the existing `index.html` and `demo-api.js` for the Intent Form prototype instead of rebuilding from scratch.
**Why:** Intent Form deadline is 15 June (13 days). Rebuilding in React/Next.js would take 2+ weeks and leave no time for the concept brief. The existing file already has Career Path Navigator, Fair Pay Engine, and University tab sketched. It just needs an employer tab and rebrand.
**Alternatives considered:**
- Build a Figma prototype instead of code → Rejected: code prototype is more impressive and already exists
- Rebuild in Next.js from day one → Rejected: too slow for the 13-day deadline
**Impact:** Phase 1 prototype is static HTML with mock data. No real auth or backend needed until Phase 2.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 8, Phase 1

---

### D002 — Module Selection: Career Path Navigator + Smart Talent Matching + Fair Pay Engine
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Build 3 modules: Career Path Navigator (candidate), Smart Talent Matching (employer), Fair Pay Engine (candidate). University side is prototype-only.
**Why:** These 3 modules cover all judging criteria: Product & UX (30%), System Design (25%), Completeness (20%). Career Path Navigator and Smart Talent Matching together tell a complete two-sided marketplace story. Fair Pay Engine is low effort relative to impact since it is already partially built.
**Alternatives considered:**
- Build all 5 candidate modules → Rejected: overscoping, would result in 5 half-built modules instead of 3 complete ones
- Focus only on candidate side → Rejected: compulsory module requires both candidate AND employer sides
- Add AI Career Coach as module 3 → Rejected: higher build effort, less emotionally resonant with the panel than salary data
**Impact:** All other modules from the 18-module list are out of scope. Do not build them without a PRD amendment.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 5, Section 6

---

### D003 — Tech Stack for Phase 2: Next.js + Supabase + Claude API + Vercel
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Use Next.js 14 (App Router) + Supabase + Tailwind CSS + shadcn/ui + Claude API + Vercel for the production build.
**Why:** Two BA students using AI coding tools. AI code generation (Claude Code, Codex) produces the best output for Next.js and Tailwind. Supabase provides database + auth in one platform with a 15-minute setup and free tier. Vercel deploys Next.js with one command. No CORS issues with API routes inside Next.js.
**Alternatives considered:**
- FastAPI backend (like GapHunter) → Rejected: separate frontend + backend = more complexity, more debugging, more CORS issues for non-expert team
- Firebase instead of Supabase → Rejected: Supabase gives SQL database which is better for structured career data; Supabase also has better free tier for this use case
- React without Next.js → Rejected: Next.js gives API routes (serverless functions) which removes the need for a separate backend
**Impact:** All Phase 2 code is written in Next.js. Partner's AI tools (Codex/Antigravity) must work with the same Next.js codebase.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 8, Phase 2

---

### D004 — Data Approach: Curated Malaysian Dataset, Not Live Scraping
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Use a manually curated Malaysian/APAC job market dataset instead of live job scraping (Bright Data or similar paid APIs).
**Why:** Bright Data costs money and requires active API management. For a hackathon demo with ~1000 API calls total, the AI reasoning quality matters far more than data freshness. A well-curated static dataset with Claude doing trajectory analysis will impress the judges more than live scraped data with poor AI outputs. Dataset usage will be disclosed in the submission as required.
**Alternatives considered:**
- Use Bright Data like GapHunter → Rejected: costs money, adds complexity, GapHunter repo cannot be touched
- Scrape LinkedIn manually for demo data → Rejected: violates terms of service, risk of demo breaking if blocked
- Use DOSM (Malaysia open data) → Partially accepted: DOSM data can supplement the curated dataset for salary benchmarks
**Impact:** No paid data API needed. Saves approximately RM 50–200 in data costs.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 10, Assumption 3

---

### D005 — Do Not Touch GapHunter Repository
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** The GapHunter GitHub repository will not be modified, committed to, or used as a base branch during the CareerOS hackathon build period.
**Why:** GapHunter is currently under judging in a separate hackathon. Any code changes risk disqualification from that competition. The CareerOS repo (`TALVIN29/CareerOS`) is the sole working repository for this project.
**Alternatives considered:**
- Fork GapHunter as the CareerOS base → Rejected: creates dependency on a repo under active judging
- Copy GapHunter code files into CareerOS → Accepted with caution: copying reference architecture patterns is fine, but we do not fork or branch from the GapHunter repo
**Impact:** CareerOS is built independently. GapHunter serves as architectural inspiration only — we can study its patterns (FastAPI, Claude integration, security layer) but replicate, not copy.
**Decided by:** Talvin (explicit instruction)
**PRD reference:** PRD Section 11, Risk table

---

### D006 — Work Division: Talvin on Technical Build, Partner on Writing and Research
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Talvin leads all technical tasks (coding, deployment, API integration). Partner leads all writing and research tasks (concept brief, documentation, pitch deck, Q&A prep).
**Why:** Talvin is comfortable with full-stack development and API calls. Partner's strength is research and writing (evidenced by capstone project group leader role). This division avoids both people working on the same file simultaneously and maximises each person's natural strength.
**Alternatives considered:**
- Both code together → Rejected: risk of merge conflicts, redundant effort, and partner's writing strength underused
- Partner also codes → Accepted as secondary: Partner can use Codex/Antigravity to handle well-scoped frontend UI tasks in Week 3 if bandwidth allows
**Impact:** For Phase 1, Partner owns concept brief independently. For Phase 2, Talvin owns all code. Partner owns documentation, pitch deck, and demo script.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 10, Assumption 4

---

### D007 — PRD Lock Required Before Phase 2 Code
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** No Phase 2 code (Next.js build) starts until Talvin explicitly says "PRD locked" in a chat session.
**Why:** Both team members using different AI tools risks scope drift if the PRD is not confirmed. Once PRD is locked, the AI tools are bounded to what is in the document. Changes require a PRD amendment, not ad-hoc addition.
**Alternatives considered:**
- Start coding immediately and update PRD as we go → Rejected: leads to scope creep, wasted effort, and team misalignment
**Impact:** Phase 2 setup tasks (Task 2.2–2.5) can proceed but no module code until PRD is locked.
**Decided by:** PM recommendation, Talvin to confirm
**PRD reference:** PRD Section 13

---

### D008 — AI Must Auto-Update Decision Log Without Being Asked
**Date:** 2026-06-02
**Status:** ACCEPTED
**Decision:** Any AI tool working on this project (Claude Code, Codex, Antigravity) must update `decision_log.md` immediately whenever any decision is made — whether the human explicitly requested the update or not.
**Why:** Human team members should not have to remember to log decisions. The decision log only has value if it is complete and up to date in real time. A missed decision entry = context drift between the two AI tools on this project.
**Alternatives considered:**
- Human manually logs decisions → Rejected: human will forget, log becomes stale
- Log only at end of session → Rejected: decisions made mid-session get lost
**Impact:** Every AI session must treat decision_log.md as a live document. Whenever a scope, tech, design, process, or priority decision is made, the AI writes the entry immediately using the template at the top of this file.
**Decided by:** Talvin (explicit instruction)
**PRD reference:** N/A — process rule, not product rule

---

## Rejected Approaches

*(None yet — this section grows as we revisit decisions)*

---

## Pending Decisions

| # | Question | Due | Who decides |
|---|---|---|---|
| PD001 | Confirm all D001–D007 → say "PRD locked" | Before Task 1.2 starts | Talvin |
| PD002 | University tab: static concept only OR interactive demo? | Before Task 1.2 starts | Talvin |
| PD003 | Kickoff findings: any PRD amendments needed after 20 June? | 21 June | Both |

---

*Last updated: 2026-06-02*
*Next update: After PRD is locked*
