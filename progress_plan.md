# Progress Plan: CareerOS
## Status: IN_PROGRESS
## Talvin Principle: HITL (Human In The Loop — both team members approve before code changes)
## Knowledge Tier: 3 (Domain-specific — APAC career market + HR enterprise software)
## Progress: 1/28 tasks = 4%
## Last checkpoint: PRD written, all planning documents created
## Next action: Talvin approves index.html change list → partner writes concept brief → prototype built
## Blockers: PRD not yet locked. No code changes until Talvin says "PRD locked."

---

## Plain English Overview

This document tracks every task we need to complete to win the Talentbank Tech Hackathon 2026.

Think of it like a project checklist. Every time a task is done, we mark it complete. Every time something is blocking us, we write it down here so we do not forget.

There are 5 phases:
- **Phase 1** — Get shortlisted (most urgent, due 15 June)
- **Phase 2** — Prepare to build (16–28 June)
- **Phase 3** — Build the real product (29 June – 26 July)
- **Phase 4** — Prepare for judging (3–16 August)
- **Phase 5** — Grand Finale (29 August)

We only get to Phase 3 if we pass Phase 1. **Right now, Phase 1 is the only thing that matters.**

---

## Phase 1: Get Shortlisted
**Deadline: 15 June 2026 (13 days from today)**
**Goal: Submit a clickable prototype + concept brief via the Intent Form**

### What "shortlisted" means
The Talentbank team reads our concept brief and looks at our live prototype. If they like what they see, they invite us to the Kickoff on 20 June. If we do not get shortlisted, there is no Phase 2.

---

### Phase 1 Tasks

#### Task 1.1 — Approve index.html Change List
**Status:** PENDING
**Who:** Talvin
**What this means in plain English:** Before we touch any code, Talvin reads the list of 6 changes planned for `index.html` and says yes or no to each one. No code gets changed without this approval.
**Done when:** Talvin writes "approved" on the change list in this session
**Estimated time:** 15 minutes

---

#### Task 1.2 — Add Employer Tab to index.html
**Status:** PENDING
**Who:** Talvin (using Claude Code)
**What this means in plain English:** Right now the demo only shows the candidate side (job search, gap analysis) and an HR intelligence side. We need to add a proper employer portal that shows Smart Talent Matching — where an employer posts a job and sees candidates ranked by trajectory, not just keywords.
**What specifically gets added:**
- New "Employers" tab in the navigation
- A form where employer inputs: job title, required skills, seniority level
- A results panel showing ranked candidates with trajectory scores
- Mock data wired up so the demo works without a real backend
**Done when:** Employer tab works in browser with no errors, shows realistic-looking candidate matches
**Estimated time:** 3–4 hours of AI-assisted coding
**Depends on:** Task 1.1 approved

---

#### Task 1.3 — Rebrand index.html from GapHunter to CareerOS
**Status:** PENDING
**Who:** Talvin (using Claude Code)
**What this means in plain English:** The current file says "GapHunter" everywhere — the title bar, the logo text, the headings. We change all of these to "CareerOS" so the prototype does not look like a different product.
**What specifically changes:**
- Browser tab title: GapHunter → CareerOS
- Logo / hero text
- Meta description tag
- Any visible headings that say GapHunter
**Done when:** Open the page in browser — nowhere does it say "GapHunter"
**Estimated time:** 30 minutes
**Depends on:** Task 1.1 approved

---

#### Task 1.4 — Update Career Path Navigator to 3-Path Structure
**Status:** PENDING
**Who:** Talvin (using Claude Code)
**What this means in plain English:** The current Career Path Navigator in the demo is basic. It needs to show three distinct paths: Apply Now (jobs you can get today), Stretch (jobs that need 1–3 skill upgrades), and Pivot (completely different career using transferable skills). Each path needs a match score, salary range, and skill gap list.
**Done when:** Career Path Navigator section shows 3 clearly labelled paths with realistic mock data
**Estimated time:** 2–3 hours
**Depends on:** Task 1.1 approved

---

#### Task 1.5 — Update demo-api.js with Employer Endpoints
**Status:** PENDING
**Who:** Talvin (using Claude Code)
**What this means in plain English:** The mock API (demo-api.js) needs 2 new fake endpoints so the employer tab has data to display. Think of it like adding fake database records — the page calls the endpoint, the endpoint returns made-up but realistic data.
**New endpoints needed:**
- `/api/employer/post-role` — accepts job details, returns confirmation
- `/api/employer/match-candidates` — accepts job details, returns ranked candidate list with trajectory scores
**Done when:** Employer tab in browser shows candidate matches with no console errors
**Estimated time:** 1–2 hours
**Depends on:** Task 1.2

---

#### Task 1.6 — Host Prototype on Netlify
**Status:** PENDING
**Who:** Talvin
**What this means in plain English:** The demo currently only runs on a laptop. We need to publish it to Netlify so anyone can click a link and see it working. Talvin already has a Netlify account so this is a drag-and-drop deployment.
**Steps:**
1. Open Netlify dashboard
2. Drag the CareerOS folder onto the Netlify deploy area
3. Copy the generated URL (e.g. `https://careeros-demo.netlify.app`)
**Done when:** URL is live and accessible from a phone on a different network
**Estimated time:** 20 minutes
**Depends on:** Tasks 1.2, 1.3, 1.4, 1.5 complete

---

#### Task 1.7 — Write Concept Brief (5 sections, max 1 page per section)
**Status:** PENDING
**Who:** Partner (research and writing strength)
**What this means in plain English:** The concept brief is the written document we submit alongside the prototype. It tells the shortlisting panel who we are, what we are building, and why they should invite us to the Kickoff. This is the most important thing Partner will produce before 15 June.

**Five sections to write:**

**Section A — The Problem (half page)**
Write about why APAC professionals navigate careers without real data. Mention that employers hire based on keywords not trajectories. Keep it factual and specific — no fluff.

**Section B — What CareerOS Does (half page)**
Describe the product in plain English. Three stakeholders (candidates, employers, universities). Three modules (Career Path Navigator, Smart Talent Matching, Fair Pay Engine). Two sentences per module maximum.

**Section C — The AI Layer (half page)**
Explain how AI is used — specifically Claude Haiku for fast data extraction and Claude Sonnet for trajectory synthesis. Do not just say "we use AI." Explain what it does that a keyword search cannot do.

**Section D — Why This Panel Will Care (half page)**
One paragraph for each of the three panel groups: HR leaders, university career offices, Talentbank CEO. For HR leaders: trajectory matching solves a real hiring problem they face. For university offices: Future-State Curriculum Engine shows them where their courses are falling behind. For Talentbank: describe one paragraph on how CareerOS could slot into their existing platform.

**Section E — Module Preferences (bullet list)**
List:
- Compulsory: Career OS / Career Marketplace
- Optional 1: Career Path Navigator (Module 01, Candidates)
- Optional 2: Smart Talent Matching (Module 01, Employers)
- Optional 3: Fair Pay Engine (Module 04, Candidates)

**Done when:** Concept brief is a clean, well-written PDF or Google Doc, ready to attach to the Intent Form
**Estimated time:** 5–7 hours of writing (partner can spread across 3 days)
**Depends on:** Nothing — can start immediately

---

#### Task 1.8 — Submit Intent Form
**Status:** PENDING
**Who:** Talvin (submitter)
**What this means in plain English:** Go to the Talentbank hackathon website and fill in the Intent Form before 15 June. Attach the live Netlify URL, the concept brief, and our module preferences.
**Done when:** Confirmation email received from Talentbank
**Estimated time:** 30 minutes
**Depends on:** Tasks 1.6 and 1.7 complete
**Hard deadline:** 15 June 2026, 11:59 PM

---

### Phase 1 Progress Summary
- [ ] 1.1 Approve change list
- [ ] 1.2 Add employer tab
- [ ] 1.3 Rebrand to CareerOS
- [ ] 1.4 Update Career Path Navigator
- [ ] 1.5 Update demo-api.js
- [ ] 1.6 Host on Netlify
- [ ] 1.7 Write concept brief
- [ ] 1.8 Submit intent form

**Phase 1 complete when:** Confirmation email from Talentbank received.

---

## Phase 2: Prepare to Build
**Dates: 16–28 June 2026 (after shortlisting, before build sprint)**
**Goal: Everything set up so we hit the ground running on 29 June**

### What this phase is for
After getting shortlisted, we attend the Kickoff on 20 June. Talentbank will share their Reference Build (their own prototype). We use the remaining days to set up our tech stack so we are not wasting build-sprint time on boilerplate setup.

---

### Phase 2 Tasks

#### Task 2.1 — Attend Kickoff (20 June)
**Who:** Both
**What to extract:** How their Reference Build is structured. What they consider "production-ready." Any specific technical requirements not in the public brief.
**Done when:** Notes written and saved to decision_log.md

#### Task 2.2 — Set Up Next.js Project
**Who:** Talvin (Claude Code)
**What this means:** Create a new Next.js 14 project with App Router, Tailwind CSS, and shadcn/ui installed. This is the real codebase that replaces the static index.html.
**Done when:** `npm run dev` works locally, homepage renders, no errors

#### Task 2.3 — Set Up Supabase Project
**Who:** Talvin
**What this means:** Create a free Supabase account and project. Set up the database tables for users, candidate profiles, employer profiles, and job postings. Supabase is like a free cloud database with built-in login.
**Database tables needed:**
- `users` (handled by Supabase Auth automatically)
- `candidate_profiles` (skills, role, salary, location)
- `employer_profiles` (company name, industry)
- `job_postings` (role, required skills, seniority, employer ID)
**Done when:** Tables created, Supabase project URL and API key saved securely

#### Task 2.4 — Set Up Claude API Access
**Who:** Talvin
**What this means:** Create an Anthropic account, add a payment method, set a spending cap of RM 50, and save the API key to the project environment variables. This is what powers the AI features.
**Done when:** Test API call returns a response. Spending cap confirmed active.

#### Task 2.5 — Set Up Vercel Deployment
**Who:** Talvin
**What this means:** Connect the CareerOS GitHub repo to Vercel. Every time we push code to GitHub, Vercel automatically deploys a new version live. Free tier handles this.
**Done when:** Push a test commit → live URL updates automatically

#### Task 2.6 — Write the SKILL.md Kickoff Update
**Who:** Both
**What this means:** After the Kickoff, update SKILL.md with any new information from Talentbank's Reference Build. This keeps both AIs aligned on any new requirements.
**Done when:** SKILL.md has a "Kickoff Notes" section with specific observations

---

## Phase 3: 28-Day Build Sprint
**Dates: 29 June – 26 July 2026**
**Goal: Production-ready CareerOS with 3 working modules, deployed on Vercel**

### How to use 2–3 hours a day effectively
Every session, start by reading `SKILL.md` to remind your AI tool of the project context. End every session by updating this progress plan with what got done and what is next.

---

### Week 1 (29 June – 5 July) — Foundation
**Goal:** Users can create accounts, fill profiles, and see the platform structure

| Task | Plain English | Done when |
|---|---|---|
| 3.1 Auth pages | Build login and sign-up pages for candidate and employer account types | Both account types can sign up and log in |
| 3.2 Candidate profile form | Build the form where candidates enter their current role, skills, salary, location | Profile saves to Supabase database |
| 3.3 Employer profile form | Build the form where employers enter company name, industry | Profile saves to Supabase database |
| 3.4 Job posting form | Build the form where employers post a job role with required skills and seniority | Job posting saves to Supabase database |
| 3.5 Navigation shell | Build the overall app layout with candidate and employer navigation | Clean navigation works with no broken links |

### Week 2 (6–12 July) — AI Core
**Goal:** Career Path Navigator and Smart Talent Matching produce real Claude API outputs

| Task | Plain English | Done when |
|---|---|---|
| 3.6 Claude API utility | Write the reusable function that calls Claude API from the Next.js backend | Test call returns structured JSON |
| 3.7 Candidate profile → trajectory prompt | Write the Claude prompt that takes candidate profile and returns 3 career paths | 3 paths with scores returned for a test profile |
| 3.8 Career Path Navigator UI | Build the page that displays the 3 paths with scores, salary ranges, skill gaps | Visually clean, no layout breaks |
| 3.9 Employer role → candidate matching prompt | Write the Claude prompt that takes a job posting and candidate list, returns ranked matches | Ranked list returned with trajectory scores |
| 3.10 Smart Talent Matching UI | Build the employer page showing ranked candidates | Employer sees candidates ranked by trajectory score |

### Week 3 (13–19 July) — Marketplace Loop + Fair Pay
**Goal:** Two-sided marketplace works end-to-end. Fair Pay Engine complete.

| Task | Plain English | Done when |
|---|---|---|
| 3.11 Candidate ↔ employer visibility | Candidate profiles are visible to employers in matching results (with privacy controls) | Employer sees anonymised candidate data |
| 3.12 Fair Pay Engine prompt | Write the Claude prompt that takes salary + skills + role + location, returns percentile position | Percentile score and 2 upgrade recommendations returned |
| 3.13 Fair Pay Engine UI | Build the candidate page showing salary position and upgrade recommendations | Clean display, no errors |
| 3.14 Demo data seeding | Load curated Malaysian market data into Supabase so the demo has realistic results | Demo shows APAC-relevant roles and salaries |
| 3.15 Talentbank integration one-pager | Write a 1-page API contract showing how CareerOS connects to Talentbank's platform | Document saved in repo |

### Week 4 (20–26 July) — Polish and Lock
**Goal:** Demo path is flawless. Documentation complete. No new features.

| Task | Plain English | Done when |
|---|---|---|
| 3.16 Demo script written | Write the exact click-by-click sequence for the Grand Finale presentation | 8-minute demo script saved to repo |
| 3.17 Demo path testing | Run the demo script 5 times in a row with zero errors | 5/5 successful runs logged |
| 3.18 UI polish | Fix any rough edges in the visual design — padding, mobile responsiveness, loading states | Partner reviews and signs off |
| 3.19 AI disclosure document | Write the AI tools usage disclosure required by hackathon rules | Document lists all Claude API calls and what they do |
| 3.20 README and documentation | Write the technical README explaining how to run the project locally | Another person can clone and run in under 10 minutes |
| 3.21 Final Vercel deploy | Confirm production URL is stable and all environment variables are set | Live URL tested from two different devices |
| 3.22 Code freeze | **No new features or refactors after this task.** Bug fixes only. | Team agrees: code is locked |

---

## Phase 4: Panel Review Preparation
**Dates: 3–16 August 2026**
**Goal: Top 10 submission evaluated. Prepare for Grand Finale.**

| Task | Plain English | Done when |
|---|---|---|
| 4.1 Submit final build | Push final code, confirm live demo URL, submit documentation | Submission confirmed |
| 4.2 Prepare 8-minute pitch | Build pitch deck: problem → solution → demo → adoption story | Deck ready for rehearsal |
| 4.3 Rehearse demo | Practice the live demo 10 times | Demo runs without hesitation, under 8 minutes |
| 4.4 Prepare Q&A answers | Write answers to 10 likely judge questions (see below) | Written answers reviewed by both |

**10 likely judge questions:**
1. How is this different from LinkedIn?
2. What data does the trajectory score use?
3. How do you prevent bias in the matching algorithm?
4. How would this integrate with Talentbank's existing platform?
5. What happens when a candidate's data is stale?
6. How do you handle data privacy — can employers see candidate names?
7. What is the AI actually doing — is it just ChatGPT with a wrapper?
8. How does this scale beyond Malaysia?
9. What is the business model after the competition?
10. What would you build next if you had 12 months and Talentbank's data?

---

## Phase 5: Grand Finale
**Date: 29 August 2026**
**Goal: Champion**

| Task | Plain English | Done when |
|---|---|---|
| 5.1 Final demo rehearsal | Run demo end-to-end morning of the event | Zero errors on day |
| 5.2 Present | 8-minute presentation + demo | Done |
| 5.3 Q&A | Answer judge questions | Done |

---

## Decisions Log (Summary)
*(Full detail in decision_log.md)*

| # | Decision | Date |
|---|---|---|
| D001 | Build on existing index.html, not from scratch, for Phase 1 | 2026-06-02 |
| D002 | Module selection: Career Path Navigator + Smart Talent Matching + Fair Pay Engine | 2026-06-02 |
| D003 | Tech stack: Next.js + Supabase + Claude API + Vercel for Phase 2 | 2026-06-02 |
| D004 | Data approach: curated Malaysian dataset, not live scraping | 2026-06-02 |
| D005 | Do not touch GapHunter repo during hackathon build period | 2026-06-02 |
| D006 | Role split: Talvin on technical build, Partner on writing and research | 2026-06-02 |

---

## Blockers Log

| # | Blocker | Status | Resolution |
|---|---|---|---|
| B001 | PRD not yet locked — no Phase 2 code until Talvin says "PRD locked" | OPEN | Awaiting Talvin confirmation |
| B002 | Claude API account not yet set up | OPEN | Due before 29 June |
| B003 | index.html change list not yet approved | OPEN | Awaiting Talvin approval this session |

---

## Harness
```
Loop: 0
Tools: Claude Code (Talvin) / Codex or Antigravity (Partner)
Context: SKILL.md (read at session start)
Persist: progress_plan.md (update every session)
Verify: Manual demo run every Friday during build sprint
Constraints: Free tier only, curated data, no GapHunter repo access
```

## Agent Profile Used
Senior PM (HR enterprise software) + Senior Startup Venture Consultant

## CO-STAR Applied: 1

---

*Last updated: 2026-06-02*
*Next update due: After index.html changes approved*
