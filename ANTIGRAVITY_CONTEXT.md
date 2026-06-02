# ANTIGRAVITY_CONTEXT.md — CareerOS Project Context for Antigravity IDE
**Version:** 1.0 | **Last updated:** 2026-06-02
**Tool:** Antigravity IDE

---

## HOW TO LOAD THIS CONTEXT IN ANTIGRAVITY IDE

At the start of every session, paste the contents of this file into your Antigravity project instructions or context panel. Then also read `SKILL.md` for the full operating manual.

**Step-by-step:**
1. Open Antigravity IDE
2. Open project instructions / context / system prompt panel
3. Paste the full contents of this file
4. Then tell the AI: "Also read SKILL.md in this project for full coding rules"
5. Begin your task

---

## Project in 30 Seconds

**What:** CareerOS — a two-sided APAC career marketplace for the Talentbank Tech Hackathon 2026.

**Three modules:**
- Career Path Navigator (candidate) — AI shows 3 realistic career paths with scores and skill gaps
- Smart Talent Matching (employer) — AI ranks candidates by trajectory, not keywords
- Fair Pay Engine (candidate) — AI shows salary percentile and skills that increase pay

**Who is building:** Talvin (Claude Code) + Partner (Antigravity IDE). Both Business Analytics students, Sunway University.

**Deadlines:**
- 15 June 2026 — Intent Form: live prototype + concept brief
- 26 July 2026 — Final production build

**Repo:** https://github.com/TALVIN29/CareerOS

---

## Current State of the Project

**What exists right now:**
- `index.html` — Phase 1 static prototype (Alpine.js + Tailwind CSS + mock data)
- `demo-api.js` — mock API interceptor for the prototype
- `PRD.md` — full product requirements (read this before coding)
- `SKILL.md` — full operating manual (read this every session)
- `progress_plan.md` — task tracker (check this for what to work on)
- `decision_log.md` — all project decisions (update this when decisions are made)

**What does NOT exist yet:**
- Real backend (no server, no database)
- Next.js app folder (Phase 2, starts 29 June)
- Supabase setup (Phase 2)
- Real Claude API integration (Phase 2)

---

## Phase 2 Tech Stack

```
Framework:    Next.js 14 (App Router) + TypeScript
Database:     Supabase (PostgreSQL + Auth) — free tier
UI:           Tailwind CSS + shadcn/ui
AI:           Claude API
              - claude-haiku-4-5 for extraction
              - claude-sonnet-4-6 for trajectory synthesis
Deploy:       Vercel free tier
```

---

## Partner's Primary Responsibilities (This Role)

The Partner using Antigravity IDE owns:
- Concept brief (Phase 1, due 15 June) — written document for intent form submission
- Documentation (`/docs` folder in Phase 2)
- Pitch deck and demo script (Phase 4)
- UI component work in Week 3 of build sprint (if time allows)
- Q&A preparation for Grand Finale

**Talvin (Claude Code) owns:** All backend logic, AI integration, database setup, deployment.

---

## Critical Rules — Read Before Every Task

1. **Read `SKILL.md` and `progress_plan.md` before starting any work.**
2. **Read `stakeholder_decision.md` at session start.** If any entry has Status: OPEN, surface it to the user with the full impact and opportunity cost breakdown BEFORE doing anything else.
2. **Do not add features not in `PRD.md`.** If unsure, check PRD Section 6 (Out of Scope).
3. **Never touch the GapHunter repo** (`TALVIN29/GapHunter`). It is under separate hackathon judging.
4. **Never commit `.env` files or API keys** to git.
5. **Update `decision_log.md` immediately** whenever any decision is made — do not wait to be asked.
6. **Update `progress_plan.md`** at the end of every session.
7. **Ask before changing scope.** If something seems worth adding, log it as a Pending Decision in `decision_log.md` and ask Talvin.
8. **When unsure — halt and ask.** Do not assume. Do not guess.

---

## File Structure Quick Reference

```
SKILL.md                    ← Full operating manual (read every session)
PRD.md                      ← Locked product scope
progress_plan.md            ← Task tracker (update every session)
decision_log.md             ← Decision log (auto-update on every decision)
stakeholder_decision.md     ← Template for external decision requests
ANTIGRAVITY_CONTEXT.md      ← This file
index.html                  ← Phase 1 prototype only
```

---

## Commit Message Format

```
[p1] task-1.7: complete concept brief draft
[p2] task-3.18: ui polish — candidate profile page
```

---

## Environment Variables (Never Commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

These go in `.env.local` only. Never in any committed file.

---

## Concept Brief Structure (Partner's Phase 1 Deliverable)

The concept brief is what gets the team shortlisted. Five sections:

**A — The Problem** (half page): Why APAC professionals navigate careers without real data. Specific, factual, no fluff.

**B — What CareerOS Does** (half page): Three stakeholders. Three modules. Two sentences per module max.

**C — The AI Layer** (half page): What Claude does that keyword search cannot. Trajectory synthesis vs. keyword matching.

**D — Why This Panel Will Care** (half page): One paragraph each for HR leaders, university career offices, Talentbank CEO. Be specific to their role.

**E — Module Preferences** (bullet list):
- Compulsory: Career OS / Career Marketplace
- Optional 1: Career Path Navigator (Candidates, Module 01)
- Optional 2: Smart Talent Matching (Employers, Module 01)
- Optional 3: Fair Pay Engine (Candidates, Module 04)

**Done when:** Clean PDF or Google Doc, ready to attach to the Talentbank Intent Form by 15 June 2026.

---

*Full coding standards, demo path, and session protocol: read `SKILL.md`.*
*This file should be updated after the Kickoff on 20 June 2026.*
