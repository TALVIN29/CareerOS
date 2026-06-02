# Stakeholder Decision Requests
**Project:** CareerOS / Talentbank Tech Hackathon 2026
**Purpose:** When the team needs a decision from someone outside the team — a mentor, advisor, judge, Talentbank, or another external party — log the request here. Track when it was raised, who is being asked, and what decision came back.

---

## Why This File Exists

Some decisions cannot be made by the team alone. Examples:
- Talentbank clarifying a technical requirement at Kickoff
- A mentor advising on which module to prioritise
- A judge giving feedback during the review phase
- An external expert being asked about the AI architecture

When you need an external decision:
1. Fill in the **Request Template** below and add it to this file
2. Send the request to the relevant person
3. When the answer comes back, fill in the **Outcome** field
4. Add the final decision to `decision_log.md` with reference to this file

---

## ⚠️ INSTRUCTION FOR AI TOOLS (Claude Code, Codex, Antigravity)

**At the start of every session, read the Open Requests section below.**
If any request has Status: OPEN, you must surface it to the user BEFORE starting any other work. Use this format:

```
⚠️ DECISION NEEDED — SDR[number]: [Title]
Deadline: [date or "no hard deadline"]
[Paste the full SDR entry]
Please make a decision before we proceed.
```

Do not skip OPEN requests. Do not proceed with coding or writing tasks until all OPEN requests with a passed deadline are resolved. For requests without a deadline, flag them once and let the user choose to defer.

---

## Request Template

```
### SDR[number] — [Short Title]
**Date raised:** YYYY-MM-DD
**Status:** OPEN | ANSWERED | ESCALATED
**Asking:** [Name / Organisation / Role of person being asked]
**Asked by:** [Talvin | Partner | Both]
**Channel:** [WhatsApp | Email | In-person at Kickoff | Slack | etc.]
**Decision needed by:** YYYY-MM-DD (leave blank if no hard deadline)

**Context:**
[2–3 sentences explaining the situation. Enough that the person you are asking understands without reading the whole PRD.]

**The question:**
[One clear, specific question.]

**Options:**

**Option A — [Name]**
- What it means: [Plain English. One sentence.]
- Analogy: [Optional. "This is like choosing to renovate your house before selling vs. selling as-is."]
- Impact if executed: [What happens if you choose this. Be specific. What gets built, what changes, what is affected downstream.]
- Opportunity cost: [What you give up by choosing A instead of B. What you cannot do as a result. What B would have given you that A does not.]

**Option B — [Name]**
- What it means: [Plain English. One sentence.]
- Analogy: [Optional.]
- Impact if executed: [Specific downstream effects.]
- Opportunity cost: [What you give up by choosing B instead of A.]

**Default if no answer received by deadline:**
[What the team does if the external party does not respond in time.]

**Outcome:**
[Fill this in when the answer comes back. Quote the person if possible.]

**Decision logged in decision_log.md:** [Yes / No — fill in after logging]
```

---

## Open Requests

*(None yet — add entries here as they arise)*

---

## Answered Requests

*(Entries move here once outcome is filled in)*

---

## Escalated Requests

*(Entries that could not be resolved at team level and need escalation to Talentbank or panel)*

---

## Guidance for Using This File

**When to raise a Stakeholder Decision Request:**
- You and the team genuinely cannot decide between two options without external input
- A hackathon requirement is ambiguous and needs official clarification from Talentbank
- A mentor or advisor has domain knowledge the team lacks
- A technical or product decision has significant risk and you want a second opinion

**When NOT to raise one:**
- The answer is in `PRD.md` — read the PRD first
- The answer is in `decision_log.md` — check decisions already made
- It is a minor implementation detail — just decide and log it in decision_log.md
- You are avoiding a decision because it is uncomfortable — make the call, log it, move on

**Who to ask for what:**

| Type of question | Who to ask | Channel |
|---|---|---|
| Hackathon rules / submission requirements | Talentbank team | Official hackathon contact |
| Technical architecture advice | Mentor / senior engineer | Kickoff networking |
| Product / UX feedback | University career office contacts | LinkedIn / email |
| AI strategy advice | AI practitioner in network | LinkedIn / email |
| Business viability | Startup founder in network | LinkedIn / coffee chat |

---

## Example Entry (For Reference — Shows Full Template In Use)

```
### SDR001 — Clarify Whether University Tab Counts as a Separate Module
**Date raised:** 2026-06-20
**Status:** ANSWERED
**Asking:** Talentbank team (Ben Ho / Lee Sheng Chun)
**Asked by:** Talvin
**Channel:** In-person at Kickoff session
**Decision needed by:** 2026-06-20

**Context:**
Our PRD scopes the University tab as "prototype only — not built in the 28-day sprint."
We want to know if showing a non-functional University tab hurts our Completeness score (20% of judging).

**The question:**
Should we build a working University module in Week 3, or keep it as a static concept only?

**Options:**

**Option A — Keep University tab as static concept only**
- What it means: Show a visual mockup of what the University module would do, but no real data or AI behind it.
- Analogy: Like showing a floor plan of a room you have not built yet. The judges can see the vision but cannot walk into it.
- Impact if executed: Saves approximately 15–20 hours of build time in Week 3. That time goes into polishing Career Path Navigator and Smart Talent Matching instead.
- Opportunity cost: University career office judges (Albert Quek, Raja Edriana, Pui Wah Loh) may score Completeness lower. We lose the ability to demonstrate the third stakeholder working end-to-end.

**Option B — Build a basic working University module in Week 3**
- What it means: Build a functional Future-State Curriculum Engine where a university staff member inputs a course and sees a market demand gap analysis.
- Analogy: Like finishing all three rooms of a house instead of two. The third room may not be fully furnished, but it has a floor and a roof.
- Impact if executed: Adds a third working stakeholder flow. University panel members have something real to interact with. Completeness score likely improves.
- Opportunity cost: 15–20 hours taken away from polishing Modules 1 and 2. Risk that all three modules are 80% finished instead of two being 100% finished. A half-working module on demo day is worse than a static concept.

**Default if no answer received by deadline:**
Default to Option A — keep as static concept. Depth over breadth.

**Outcome:**
Ben Ho confirmed that depth on two modules beats shallow coverage of three.
University concept tab is acceptable. Focus on making Career Path Navigator and Smart Talent Matching excellent.

**Decision logged in decision_log.md:** Yes — D009
```

---

*Last updated: 2026-06-02*
*Next update: After Kickoff on 20 June 2026*
