# CareerOS Strategy Review — 2026-07-10

**Purpose:** Output of a GStack-style Socratic strategy session run against the existing PRD, decision log, and progress plan, plus a live check of the official Talentbank hackathon guideline page. Nothing in the actual PRD/decision_log/progress_plan has been changed yet — this file is the proposal for review before anything is applied.

**Why this session happened:** Team's stated risk is "building the wrong thing," not coding capability. PRD.md was still DRAFT (awaiting lock) and had a two-sided-marketplace framing that hadn't been stress-tested against a single sharpest decision, and its judging-criteria assumptions had never been checked against the actual guideline page.

---

## 1. What CareerOS sells

Current PRD pitch ("the career co-pilot Asia never had") is generic — could describe any AI career tool. Proposal: narrow it to name the specific decision the product wins on — which of your next 3 moves (Apply Now / Stretch / Pivot) is actually worth making.

## 2. Primary user

Candidate is the bet, via the Apply/Stretch/Pivot decision (Module 1 — Career Path Navigator). Employer (Module 2 — Smart Talent Matching) still gets a full build — it's compulsory and stays in scope — but its role in the demo is proof-of-loop, not the emotional lead.

## 3. The one demo journey

Single shared persona, three beats:
- Candidate deep dive: full Apply/Stretch/Pivot walkthrough (majority of the ~10 min video)
- Cut to employer view: same persona shows up ranked "ready soon" for a role — proves one shared trajectory engine serves both sides, not two disconnected features
- ~1 min on the University/Talentbank angle (see §4), carved out of the employer segment specifically
- AI Career Coach gets no demo slot, ever (see §4)

## 4. Features kept / cut

- **Fair Pay Engine** — stays in scope, AI reasoning simulated rather than live-called (same as other modules).
- **University tab** — gets brief real demo time, justified specifically by the PRD §12 Talentbank CEO adoption story (RM25k opportunity), not generic "show all 3 stakeholders" completeness. This reverses the default "cut it" instinct on purpose — the reasoning is entity-specific (a judge on the panel with adoption authority), not padding.
- **AI Career Coach** — stays as PRD's existing "conditional Week 4 stretch," explicitly documented as never receiving scripted demo time.

## 5. Fit to hackathon judging — critical finding

PRD §9's judging table (Product & UX 30% / System Design 25% / Completeness 20% / AI Craft 15% / Code Quality 10%) **does not match** the official guideline kit at techhackathon.com/guideline-kit#reference-build, which lists 5 different dimensions with no published weights: Product & UX Thinking, Functionality & Depth, Innovation & Differentiation, Career Impact, Impact & Sustainability.

The guideline also explicitly states:
> "Demonstrate your AI logic and sample responses through simulation... Don't spend tokens or credits on live API integration... Showing your thinking is enough."

And explicitly warns against breadth over depth: "a few strong modules score better than many weak ones."

**Resulting tech-stack proposal (reopens D003):** Hybrid. Keep Supabase + real auth + Next.js so accounts/profiles genuinely persist (a real product shell). AI reasoning itself (trajectory scores, matching, pay percentile) is simulated/canned, not live Claude API calls. This removes the RM50 Claude billing dependency and live-call error handling from the critical path without giving up a real deployable app.

## 6. What to validate with Moriah Lee

One sharp question, not a checklist — she's a working recruiter, a direct proxy for the HR-director judges the PRD already cites:

> "As a recruiter, would you actually shortlist a candidate who doesn't meet a role today but is trajectory-ranked to in 3–6 months — or does that sound good in a pitch but never survive real hiring pressure and deadlines?"

This tests the single biggest unproven assumption under the Employer module and the demo's "ready soon" proof-of-loop beat.

---

## Proposed file changes (not yet applied)

**PRD.md** — §1 pitch, §5 demo-narrative note, §6 AI Career Coach language, §7 University justification line, §8 simulated-AI + hybrid-stack language, §9 replace judging table with official criteria, §11 downgrade/remove the Claude-cost risk.

**decision_log.md** — D009 (judging-criteria correction), D010 (reopen/amend D003 to hybrid stack), D011 (demo narrative structure), D012 (University limited real demo time).

**progress_plan.md** — Task 2.4 (Claude API setup) downgraded to optional/deferred; Week 2 tasks (3.6–3.10) reframed from "real Claude API outputs" to "simulated AI reasoning, real Supabase-backed persistence"; Task 3.19 (AI disclosure doc) scope updated to disclose simulation approach.

**stakeholder_decision.md** — new SDR logging the Moriah Lee validation question, Status: OPEN until the conversation happens.

*Nothing above has been written to those files. This document is the review artifact — confirm before any of it gets applied.*
