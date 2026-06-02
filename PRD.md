# CareerOS — Product Requirements Document

**Version:** 1.0
**Status:** DRAFT — Awaiting PRD Lock (`Talvin says: "PRD locked"`)
**Created:** 2026-06-02
**Team:** Talvin + Partner
**Hackathon:** Talentbank Tech Hackathon 2026
**Goal:** Champion — RM 10,000 + Cohort 1 Adoption Partner

---

## 1. What Are We Building?

CareerOS is a two-sided career marketplace for Asia Pacific. It connects three groups:

- **Candidates** — students to senior professionals who want to know where their career is going and what it is worth
- **Employers** — hiring companies who want to find talent based on trajectory, not just past job titles
- **Universities** — institutions that want to ensure their curriculum matches what the market will actually pay for

The platform uses AI (Claude) to generate trajectory intelligence — realistic career move predictions, skill gap analysis, and salary positioning — instead of keyword matching.

**One-line pitch:** CareerOS is the career co-pilot Asia never had.

---

## 2. The Problem We Are Solving

Most professionals in Asia navigate their careers by guessing:

- They do not know what job they can realistically get next
- They do not know whether they are being paid fairly
- They do not know which skills to build before they need them

Most employers hire backwards — matching candidates to job descriptions using past titles and listed keywords. This misses candidates who are on the right growth trajectory but do not yet have the exact job title.

Universities design curricula for a market that existed 3–5 years ago.

**CareerOS closes all three gaps in one platform.**

---

## 3. The Three Stakeholders

### Stakeholder 1 — The Candidate
| | |
|---|---|
| **Who** | Fresh graduates, early-career professionals, mid-career switchers (age 18–55+) |
| **Core pain** | "I don't know what to apply for next, whether I'm underpaid, or what skills I'm missing" |
| **What they need** | A realistic map of their next 3 career moves with salary ranges and skill gaps |

### Stakeholder 2 — The Employer
| | |
|---|---|
| **Who** | HR managers and talent acquisition teams hiring in APAC |
| **Core pain** | "I get 200 CVs. Most don't fit. The ones that do, I can't find easily." |
| **What they need** | Candidates ranked by trajectory fit — not just keyword match to a job description |

### Stakeholder 3 — The University *(Intent Form prototype only — not built in 28-day sprint)*
| | |
|---|---|
| **Who** | Career offices and faculty at Malaysian and APAC universities |
| **Core pain** | "We don't know if our graduates are getting relevant jobs or if our curriculum is still current" |
| **What they need** | Graduate outcome tracking and curriculum gap analysis against live market demand |

---

## 4. Compulsory Module (Required by Hackathon)

**Career OS / Career Marketplace**

> Build the platform that connects employers and candidates across Asia. Cover both sides: how candidates discover and grow in careers, and how employers find and engage talent.

Every team must build this. We differentiate by building the trajectory-intelligence layer that keyword-matching platforms do not have.

---

## 5. Our Three Modules

### Module 1 — Career Path Navigator *(Candidate Side)*

**Plain English:** You tell CareerOS your current job and skills. It shows you three realistic paths forward — not generic advice, but trajectory predictions based on what people with similar backgrounds actually moved into.

**Three paths:**

| Path | What it means | AI output |
|---|---|---|
| **Apply Now** | Roles you can get today with current skills | Match score, salary range, application tips |
| **Stretch** | Higher-paying roles needing 1–3 skill upgrades | Skill gaps, 4–8 week learning plan, salary uplift estimate |
| **Pivot** | Different career direction using transferable skills | Transferability score, reskilling timeline, risk assessment |

**What the AI does:** Takes current skills and role → compares against curated APAC market data → generates trajectory scores, probability estimates, and learning roadmaps.

**Why judges will vote for this:** Every single person in the room has wondered "what is my next move?" It is personally relevant to every judge on the panel.

**KPIs for this module:**
- Trajectory score calculated and displayed (0–100)
- At least 3 paths generated per candidate profile
- Skill gap list returned with learning resources

---

### Module 2 — Smart Talent Matching *(Employer Side)*

**Plain English:** An employer posts a job role. Instead of getting a pile of CVs sorted by keyword, they see candidates ranked by trajectory score — how well each person is growing toward this role — not just whether their last job title matches.

**How it works:**

1. Employer inputs: role title, required skills, seniority level, location
2. System returns: ranked candidate list with trajectory match score + skill gap + "time to ready" estimate
3. Employer sees two types of matches:
   - **Ready now** — candidate meets the role today
   - **Ready soon** — candidate is on the right growth path, will meet the role within 3–6 months

**What makes it different from LinkedIn:**
LinkedIn matches keywords. CareerOS matches trajectories. A Data Analyst who has been building Python and ML skills for 12 months is a better future Data Scientist than someone whose title already says "Junior Data Scientist" but shows no skill growth.

**Why judges will vote for this:** The three HR directors on the panel (Maybank, Standard Chartered, Dentsu) have been burned by keyword-only hiring. Showing trajectory matching will be immediately recognisable to them as solving a real problem.

**KPIs for this module:**
- Employer can post a role and receive ranked candidate results
- Each result shows trajectory score, skill gap, and ready-by estimate
- Employer can distinguish "ready now" from "ready soon" candidates

---

### Module 3 — Fair Pay Engine *(Candidate Side)*

**Plain English:** You tell CareerOS your current salary, job title, and skills. It tells you whether you are paid fairly compared to the market — and exactly which skills would move you into a higher pay band.

**Inputs:** Current salary, job title, skills, years of experience, location
**Outputs:**
- Your position on the market salary curve (e.g., bottom 30%, at median, top 20%)
- The specific skill additions that would push you to the next band
- Negotiation readiness score with talking points

**Why it is lower effort than other modules:** Already partially prototyped in the existing demo. Real AI reasoning needs to be layered on top.

**Why judges will vote for this:** Salary transparency is emotionally universal. It makes the product feel immediately useful to every candidate.

**KPIs for this module:**
- Salary percentile position calculated and displayed
- At least 2 specific skill upgrades recommended with estimated pay impact
- Negotiation readiness score generated

---

## 6. Out of Scope — Do Not Build These

The following are explicitly excluded from the 28-day build. **Do not add these without a PRD amendment and explicit team agreement.**

- Talent Retention Signals
- Onboarding Success Predictor
- Talent Re-Engagement
- Lifelong Outcome Loop
- Live Internship Marketplace
- Lifelong Learning Wallet
- AI Career Coach *(may be added as a simple chat surface in Week 4 only if all 3 modules are complete)*
- Mobile app
- Payment processing
- Real-time push notifications
- Multi-language support (English only for competition)
- Integration with real external job boards (curated dataset used instead, with disclosure)

---

## 7. User Flows

### Candidate Journey (5 steps)
1. Land on CareerOS homepage → clear value proposition visible within 5 seconds
2. Create account (email + password)
3. Fill profile: current role, skills, years of experience, current salary, location
4. View Career Path Navigator: 3 paths with match scores, salary ranges, skill gaps
5. View Fair Pay Engine: salary percentile + skills that would increase pay

### Employer Journey (4 steps)
1. Create company account (email + company name)
2. Post a job role: title, required skills, seniority level
3. View Smart Talent Matching results: candidate list ranked by trajectory score
4. Click a candidate to view profile: skills, trajectory score, skill gap, ready-by estimate

### University Journey *(Prototype only — no auth, no real data)*
1. View university tab showing Future-State Curriculum Engine concept
2. Static demo of skill gap analysis between current curriculum topics and live market demand

---

## 8. Technical Requirements

### Phase 1 — Intent Form Prototype (by 15 June 2026)
- Enhanced version of existing `index.html`
- Hosted live on Netlify (free tier)
- Shows all 3 stakeholder tabs
- Employer tab added showing Smart Talent Matching (mock data)
- Career Path Navigator updated to show 3-path structure
- No real auth or database required
- Mock data in `demo-api.js` sufficient

### Phase 2 — Production Build (29 June – 26 July 2026)

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | Single repo, no CORS issues, best AI code generation support |
| Database + Auth | Supabase free tier | PostgreSQL + auth in one, 15-minute setup, free for demo scale |
| UI Components | Tailwind CSS + shadcn/ui | AI generates this reliably, clean output |
| AI | Claude API (Haiku 4.5 + Sonnet 4.6) | Same as GapHunter architecture — proven |
| Data | Curated Malaysian market dataset | Free, disclosed in submission, realistic |
| Deployment | Vercel free tier | One-command deploy, auto-deploys on git push |

**Minimum working requirements for submission:**
- [ ] Candidate can create account and log in
- [ ] Employer can create company account and log in
- [ ] Candidate fills profile and sees Career Path Navigator (real Claude API call)
- [ ] Employer posts role and sees trajectory-matched candidates (real Claude API call)
- [ ] Fair Pay Engine shows salary percentile and upgrade recommendations (real Claude API call)
- [ ] All three modules work on the demo path with zero errors
- [ ] Deployed live on Vercel with a stable public URL

---

## 9. Success Criteria

### Gate 1 — Shortlisting (15 June 2026)
- [ ] Live prototype URL working and submitted
- [ ] Concept brief submitted (1 page, 5 sections — see progress plan)
- [ ] Both candidate and employer sides visible in prototype
- [ ] AI integration story clearly described in brief

### Gate 2 — Champion (29 August 2026)

| Judging criterion | Weight | Our target |
|---|---|---|
| Product & UX Thinking | 30% | Flawless demo path for all 3 stakeholders, zero confusion, clean navigation |
| System Design & Integration | 25% | Architecture diagram + Talentbank integration story (one page API contract) |
| Completeness | 20% | All 3 modules working end-to-end, no broken flows on demo path |
| AI Craft | 15% | Real Claude API calls, visible AI reasoning in UI, AI disclosure document submitted |
| Code Quality | 10% | Clean Next.js structure, consistent naming, no console errors on demo path |

---

## 10. Assumptions

1. Claude API billing account is set up before Week 2 of build sprint
2. Supabase free tier (500MB, 50,000 monthly active users) is sufficient for demo scale
3. Curated Malaysian market dataset is acceptable as data source (will be disclosed)
4. Both team members have push access to the CareerOS GitHub repo
5. Netlify account active for prototype hosting
6. Vercel account will be set up before 29 June for production deployment

---

## 11. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Demo breaks on stage | Medium | Critical | Lock demo path by 20 July. Zero code changes after 23 July. |
| 28 days insufficient for 3 modules | Medium | High | Fair Pay Engine is the cut module. Career Path Navigator + Smart Talent Matching = champion without it. |
| Claude API costs exceed budget | Low | Medium | Use Haiku for all extraction calls. Set RM 50 spending cap on Anthropic dashboard. |
| Two AIs produce code that does not connect | Medium | Medium | SKILL.md ensures same file structure and naming conventions across both IDEs. |
| Intent form not shortlisted | Low | High | Concept brief quality is the differentiator. Partner owns this deliverable. |
| GapHunter repo affected accidentally | Low | High | CareerOS is a separate repo. Do not clone or commit to GapHunter during this period. |

---

## 12. Adoption Story (The RM 25,000 Opportunity)

The Talentbank CEO is on the panel. He is evaluating whether to integrate the winning code into his platform. Prepare a one-page API contract showing:

- Your three core endpoints (candidate trajectory, employer matching, salary positioning)
- What data inputs you need from Talentbank's existing system
- What data outputs you return
- How your system slots into their existing candidate and employer database

This is what separates champion from first runner-up.

---

## 13. PRD Lock Checklist

Before any Phase 2 code is written, both team members confirm:

- [ ] Module scope agreed: Career Path Navigator + Smart Talent Matching + Fair Pay Engine
- [ ] Tech stack agreed: Next.js + Supabase + Claude API + Vercel
- [ ] Out-of-scope list agreed
- [ ] Both team members have read this document

**Status: AWAITING LOCK**
When ready: Talvin writes `"PRD locked"` in the chat and we proceed to Phase 2 setup.

---

*Document owner: Talvin*
*Hackathon: Talentbank Tech Hackathon 2026*
*Last updated: 2026-06-02*
