# AGENTS.md — CareerOS Project Context for Codex CLI
**Version:** 1.0 | **Last updated:** 2026-06-02
**Tool:** OpenAI Codex CLI

---

## IMPORTANT: Read This First

You are working on **CareerOS** — a hackathon project for the Talentbank Tech Hackathon 2026.

**Your first action every session:**
1. Read `SKILL.md` — full project context, coding standards, and AI rules
2. Read `progress_plan.md` — current task and what is done
3. Check `decision_log.md` — settled decisions you must not relitigate

This file (`AGENTS.md`) is your entry point. `SKILL.md` is the full operating manual.

---

## Project in 30 Seconds

**What:** Two-sided APAC career marketplace. Candidates discover career paths. Employers match talent by trajectory, not keywords.

**Who:** Two Business Analytics students (Sunway University) using AI-assisted development.

**Deadline:** Live prototype due 15 June 2026. Production build due 26 July 2026.

**Stack (Phase 2):** Next.js 14 + Supabase + Claude API + Vercel. All free tier.

**Repo:** https://github.com/TALVIN29/CareerOS

---

## Three Modules We Are Building

| Module | Side | What it does |
|---|---|---|
| Career Path Navigator | Candidate | AI shows 3 career paths (Apply Now / Stretch / Pivot) with scores and skill gaps |
| Smart Talent Matching | Employer | AI ranks candidates by trajectory, not keyword match |
| Fair Pay Engine | Candidate | AI shows salary percentile and which skills increase pay |

---

## Critical Rules for Codex

1. **Read `SKILL.md` before writing any code.** It has file structure, naming conventions, Claude API patterns, and Supabase setup.
2. **Read `stakeholder_decision.md` at session start.** If any entry has Status: OPEN, surface it to the user with the full impact and opportunity cost breakdown BEFORE doing anything else.
2. **Do not add features not in `PRD.md`.** Check PRD Section 6 (Out of Scope) before building anything new.
3. **Never touch the GapHunter repo** (`TALVIN29/GapHunter`). It is under separate hackathon judging.
4. **Never commit `.env` files or API keys** to git under any circumstances.
5. **Update `decision_log.md` immediately** whenever any decision is made — do not wait to be asked.
6. **Update `progress_plan.md`** at the end of every session — mark completed tasks, note blockers.
7. **Ask before scope changes.** If unsure whether something is in scope, check `PRD.md` first. If still unclear, add to `decision_log.md` as a Pending Decision and ask.
8. **Do not assume.** When requirements are ambiguous, write 2 options and ask which is correct.
9. **Keep the demo path working at all times.** Never break the primary user flows (see SKILL.md Section 12).
10. **Mock data only for Phase 1** (`index.html`). Real Claude API calls required for Phase 2 (`app/` directory).

---

## File Map (Quick Reference)

```
SKILL.md              ← Full operating manual. Read every session.
PRD.md                ← What we are building and why. Locked scope.
progress_plan.md      ← Task tracker. Update every session.
decision_log.md       ← All decisions. Auto-update when decisions are made.
stakeholder_decision.md  ← Template for requesting external decisions.
index.html            ← Phase 1 prototype only. Do not use for Phase 2.
demo-api.js           ← Phase 1 mock API only.
app/                  ← Phase 2 Next.js pages (create this in Phase 2)
lib/                  ← Phase 2 utilities: claude.ts, supabase.ts, prompts.ts
```

---

## Environment Variables (Never Commit These)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

Save these in `.env.local` — this file is gitignored.

---

## Commit Message Format

```
[p1] task-1.2: add employer Smart Talent Matching tab
[p2] task-3.6: add Claude API utility function
```

---

*For full context, coding standards, and demo path: read `SKILL.md`.*
