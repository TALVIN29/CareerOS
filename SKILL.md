# SKILL.md — CareerOS Project AI Operating Instructions
**Version:** 1.0 | **Last updated:** 2026-06-02
**Project:** CareerOS / Talentbank Tech Hackathon 2026

---

## HOW TO USE THIS FILE

This file is the single source of truth for any AI tool working on this project.

| AI Tool | How to load this file |
|---|---|
| **Claude Code** | Add `@SKILL.md` to your `CLAUDE.md`, or paste this file content at the start of a session |
| **Codex (OpenAI)** | Rename this file to `AGENTS.md` in the repo root, or paste content as the system prompt at session start |
| **Antigravity IDE** | Paste this file content into the project instructions / context panel at the start of every session |
| **Any other AI** | Paste the entire content of this file as your first message before asking for help |

**Rule:** Every session starts by reading this file. Every session ends by updating `progress_plan.md`.

---

## 1. Project Identity

**What we are building:** CareerOS — a two-sided career marketplace for Asia Pacific.

**Three stakeholders:**
- **Candidates** — professionals who want to know their next career move, skill gaps, and fair salary
- **Employers** — hiring companies who want to match talent by trajectory, not keywords
- **Universities** — institutions that want curriculum aligned to live market demand *(prototype only — not built in 28-day sprint)*

**One-line pitch:** CareerOS is the career co-pilot Asia never had.

**Competition context:** Talentbank Tech Hackathon 2026. Required module: Career OS / Career Marketplace (covers both candidate and employer sides). Champion prize: RM 10,000 + 12-month adoption partnership with Talentbank.

---

## 2. Team

| Person | Role | AI Tool |
|---|---|---|
| Talvin | Technical build (coding, APIs, deployment) | Claude Code |
| Partner | Writing and research (concept brief, docs, pitch deck) | Codex or Antigravity IDE |

**Background:** Both are Business Analytics students at Sunway University. Comfortable with AI-assisted development, API calls, and data concepts. Not deep software engineers — AI tools do the heavy lifting.

---

## 3. Current State (as of 2026-06-02)

**What exists:**
- `index.html` — static frontend demo (GapHunter-derived, Alpine.js + Tailwind CSS)
- `demo-api.js` — mock API that intercepts `fetch()` calls and returns hardcoded data
- `PRD.md` — product requirements (status: DRAFT, awaiting lock)
- `progress_plan.md` — detailed task plan
- `decision_log.md` — all project decisions
- `SKILL.md` — this file

**What does NOT exist yet:**
- Real backend (no server, no database)
- Real AI integration (all data is mock/hardcoded)
- Employer portal (employer Smart Talent Matching not yet built)
- User authentication
- Next.js project (Phase 2)
- Supabase setup (Phase 2)

**Phase 1 goal (by 15 June 2026):** Enhance `index.html` for Intent Form submission. No new tech stack needed.
**Phase 2 goal (29 June – 26 July 2026):** Full production build in Next.js with real Claude API and Supabase.

---

## 4. Three Modules We Are Building

### Module 1 — Career Path Navigator (Candidate)
AI shows candidate 3 realistic career paths from their current position:
- **Apply Now Path:** roles achievable today with current skills
- **Stretch Path:** higher-paying roles needing 1–3 skill upgrades
- **Pivot Path:** different career direction using transferable skills

Each path returns: trajectory match score (0–100), salary range, skill gap list, learning resources.

### Module 2 — Smart Talent Matching (Employer)
Employer posts a job role. AI ranks candidates by trajectory score — where they are heading — not just past job titles.
- Input: job title, required skills, seniority level
- Output: ranked candidate list with trajectory score, skill gap, and "time to ready" estimate

### Module 3 — Fair Pay Engine (Candidate)
AI tells candidate whether their salary is fair for their role, skills, and location.
- Input: current salary, job title, skills, years of experience, location
- Output: salary percentile position, skills that increase pay, negotiation readiness score

---

## 5. What We Are NOT Building

Do not build these. If asked to add them, refer to `PRD.md` Section 6 and ask the user to confirm a PRD amendment first.

- Talent Retention Signals
- Onboarding Success Predictor
- Talent Re-Engagement
- Lifelong Outcome Loop
- Live Internship Marketplace
- Lifelong Learning Wallet
- AI Career Coach (only after all 3 modules are complete in Week 4)
- Mobile app
- Payment processing
- Multi-language support
- Live job scraping (use curated dataset only)

---

## 6. Phase 2 Tech Stack (Production Build)

```
Frontend + Backend:   Next.js 14 (App Router)
Database + Auth:      Supabase (PostgreSQL + Supabase Auth)
UI components:        Tailwind CSS + shadcn/ui
AI:                   Claude API
                      - claude-haiku-4-5 for extraction and fast calls
                      - claude-sonnet-4-6 for trajectory synthesis
Data:                 Curated Malaysian/APAC market dataset (JSON files in /data)
Deployment:           Vercel (free tier)
Repo:                 https://github.com/TALVIN29/CareerOS
```

**Environment variables (never commit these to git):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

---

## 7. File and Folder Structure (Phase 2 Target)

```
CareerOS/
├── SKILL.md                    ← This file. Read at every session start.
├── PRD.md                      ← Product requirements. Locked before coding.
├── progress_plan.md            ← Task tracker. Update every session.
├── decision_log.md             ← All decisions. Never delete entries.
├── index.html                  ← Phase 1 prototype only. Do not use in Phase 2.
├── demo-api.js                 ← Phase 1 mock API only. Do not use in Phase 2.
│
├── app/                        ← Next.js App Router pages
│   ├── layout.tsx              ← Root layout (nav, footer)
│   ├── page.tsx                ← Homepage / landing
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── candidate/
│   │   ├── profile/page.tsx    ← Fill candidate profile
│   │   ├── paths/page.tsx      ← Career Path Navigator
│   │   └── salary/page.tsx     ← Fair Pay Engine
│   ├── employer/
│   │   ├── profile/page.tsx    ← Fill employer profile
│   │   ├── post/page.tsx       ← Post a job role
│   │   └── matches/page.tsx    ← Smart Talent Matching results
│   └── api/                    ← Next.js API routes (serverless)
│       ├── career-paths/route.ts    ← Calls Claude, returns 3 paths
│       ├── talent-match/route.ts    ← Calls Claude, returns ranked candidates
│       └── fair-pay/route.ts        ← Calls Claude, returns salary position
│
├── components/                 ← Reusable UI components
│   ├── ui/                     ← shadcn/ui components (auto-generated)
│   ├── PathCard.tsx            ← Career path display card
│   ├── CandidateCard.tsx       ← Candidate result card for employer
│   └── SalaryMeter.tsx         ← Salary percentile visual
│
├── lib/                        ← Utility functions
│   ├── claude.ts               ← Claude API call wrapper
│   ├── supabase.ts             ← Supabase client setup
│   └── prompts.ts              ← All Claude prompts in one place
│
├── data/                       ← Curated market dataset (JSON)
│   ├── roles.json              ← Malaysian/APAC job roles and salary ranges
│   ├── skills.json             ← Skills taxonomy and demand scores
│   └── trajectories.json       ← Common career progression paths
│
└── docs/
    ├── architecture.md         ← System design diagram + Talentbank integration
    ├── ai-disclosure.md        ← AI tools usage disclosure (required for submission)
    └── api-contract.md         ← One-page API contract for Talentbank integration
```

---

## 8. Coding Standards

### General
- Language: TypeScript for all `.ts` and `.tsx` files
- Formatting: Prettier defaults (2-space indent, single quotes, no semicolons in TS files)
- No comments unless the reason is non-obvious. Never comment what the code does — only comment WHY if surprising.
- No console.log in production code. Use `console.error` for caught errors only.

### Naming conventions
```
Pages:          PascalCase   → ProfilePage.tsx
Components:     PascalCase   → CandidateCard.tsx
API routes:     kebab-case   → career-paths/route.ts
Functions:      camelCase    → generateCareerPaths()
Variables:      camelCase    → trajectoryScore
Constants:      SCREAMING_SNAKE → CLAUDE_HAIKU_MODEL
Database tables: snake_case  → candidate_profiles
```

### Claude API calls
- All Claude calls go through `lib/claude.ts` — never call Anthropic SDK directly from a component or page
- All prompts stored in `lib/prompts.ts` — never hardcode prompts inline
- Always use Haiku for extraction and speed-sensitive calls
- Always use Sonnet for synthesis, trajectory scoring, and any output the user sees
- Every Claude call must have a defined output schema (return typed JSON, not free text)

### Supabase
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Server-side only.
- Row Level Security (RLS) must be enabled on all tables before demo
- Employers cannot query raw candidate personal data — only anonymised match results

### Error handling
- API routes return `{ error: string }` with appropriate HTTP status on failure
- Never let a Claude API error crash the page — always show a user-friendly fallback
- Demo path must have hardcoded fallback data if Claude API is unavailable (circuit breaker pattern)

---

## 9. AI Behavior Rules (for AI tools reading this file)

These rules apply to any AI tool (Claude Code, Codex, Antigravity) working on this project.

### Always
- Read `progress_plan.md` at the start of every session to understand what is done and what is next
- Check `decision_log.md` before proposing anything that might conflict with an existing decision
- Refer to `PRD.md` Section 6 (Out of Scope) before adding any new feature
- Ask before touching `index.html` — all changes to Phase 1 prototype are approved by Talvin first
- Keep the demo path working at all times — never break the primary user flows
- Write code that Vercel can deploy without modification
- **Update `decision_log.md` immediately and automatically whenever any decision is made** — by the AI, by the human, or jointly. Do not wait to be asked. Every choice about scope, tech, design, or process is a decision. Log it with the full template the moment it is made. This is non-negotiable.

### Never
- Add features not in `PRD.md` without a PRD amendment
- Touch the GapHunter repository (`TALVIN29/GapHunter`) — it is under separate hackathon judging
- Commit secrets, API keys, or `.env` files to git
- Use a paid external API without confirming the cost with the team first
- Mock data for Phase 2 production build — real Claude API calls required
- Add complexity that two BA students cannot explain to a judge panel

### When unsure
- HALT and ask. Do not assume. Do not guess.
- If a requirement is ambiguous, write out 2 options and ask which is correct.
- If scope is unclear, reference the PRD. If the PRD does not cover it, add to `decision_log.md` as a Pending Decision.

---

## 10. Session Start Protocol

Every session (both Talvin with Claude Code and Partner with Codex/Antigravity) starts with:

1. Read this file (`SKILL.md`) — understand current state
2. Read `progress_plan.md` — know what is done and what is next
3. Check `decision_log.md` — ensure no pending decisions block work
4. State in one sentence what you will accomplish this session
5. Start the task

Every session ends with:
1. Update `progress_plan.md` — mark completed tasks, add new blockers
2. Add any new decisions to `decision_log.md`
3. Commit changes to GitHub with a clear commit message

---

## 11. Commit Message Format

```
[phase] task-number: short description

Examples:
[p1] task-1.2: add employer Smart Talent Matching tab
[p1] task-1.3: rebrand GapHunter to CareerOS
[p2] task-3.6: add Claude API utility function
[p2] task-3.7: candidate trajectory prompt working
```

---

## 12. Demo Path (Lock After 20 July — Do Not Break)

The demo must work flawlessly in this exact sequence:

**Candidate flow:**
1. Open CareerOS homepage → value proposition clear in 5 seconds
2. Sign up as candidate → fill profile (role: Data Analyst, skills: SQL/Python/Tableau, salary: MYR 5,500, location: KL)
3. View Career Path Navigator → 3 paths displayed with scores
4. View Fair Pay Engine → salary percentile shown

**Employer flow:**
1. Sign up as employer → fill company profile (company: TechCorp, industry: Financial Services)
2. Post a job role (role: Senior Data Analyst, required skills: SQL/Python/dbt, seniority: mid)
3. View Smart Talent Matching → ranked candidates visible

**Total demo time target: 8 minutes**

---

## 13. Key Deadlines

| Date | What is due |
|---|---|
| 15 June 2026 | Intent Form: live prototype URL + concept brief |
| 20 June 2026 | Kickoff session (shortlisted teams only) |
| 29 June 2026 | 28-day build sprint starts |
| 26 July 2026 | Final submission: code + docs + live demo |
| 3–16 August 2026 | Panel review |
| 29 August 2026 | Grand Finale |

---

## 14. What Good Looks Like (Judging Rubric)

| Criterion | Weight | What to aim for |
|---|---|---|
| Product & UX Thinking | 30% | Clean user journey, no confusion, clear value proposition within 5 seconds |
| System Design & Integration | 25% | Architecture diagram + Talentbank API contract in `/docs` folder |
| Completeness | 20% | All 3 modules work end-to-end, demo path has zero errors |
| AI Craft | 15% | Real Claude calls, visible reasoning in UI, AI disclosure submitted |
| Code Quality | 10% | Clean Next.js structure, TypeScript, no console errors on demo path |

---

*This file should be updated after the Kickoff on 20 June 2026 with Reference Build observations.*
*Owned by: Both team members*
*Do not delete this file. Do not rename this file.*
