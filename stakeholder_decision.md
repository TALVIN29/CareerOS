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
[2–3 sentences explaining the situation. Enough that the person you are asking understands it without reading the whole PRD.]

**The question:**
[One clear, specific question. If there are multiple options, list them.]

**Options being considered:**
- Option A: [description]
- Option B: [description]

**What happens if we do not get an answer by the deadline:**
[What the team will default to if no response received]

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

## Example Entry (For Reference)

```
### SDR001 — Clarify Whether University Tab Counts as a Separate Module
**Date raised:** 2026-06-20
**Status:** ANSWERED
**Asking:** Talentbank team (Ben Ho / Lee Sheng Chun)
**Asked by:** Talvin
**Channel:** In-person at Kickoff session
**Decision needed by:** 2026-06-20

**Context:**
Our PRD includes a University tab in the prototype but scopes it as "prototype only — not built in 28 days." 
We want to know if showing the university concept without a working build hurts our completeness score.

**The question:**
Does including a non-functional University tab in the prototype count against us on the Completeness criterion (20%), or is a conceptual prototype sufficient for that stakeholder group?

**Options being considered:**
- Option A: Keep University tab as static concept — no build effort spent
- Option B: Build a basic working University module in Week 3 if ahead of schedule

**What happens if we do not get an answer by the deadline:**
Default to Option A — keep as static concept.

**Outcome:**
Ben Ho confirmed that depth on two modules beats shallow coverage of three. University concept tab is acceptable. Focus on making Career Path Navigator and Smart Talent Matching excellent.

**Decision logged in decision_log.md:** Yes — D009
```

---

*Last updated: 2026-06-02*
*Next update: After Kickoff on 20 June 2026*
