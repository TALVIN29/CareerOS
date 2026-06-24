# Signal Path Demo: Current Understanding and Career OS Module Recommendations

Prepared: 1 June 2026

## 1. Current Site Understanding

The current demo is a self-contained version of Signal Path, a labor-market intelligence product that helps job seekers and employers understand live hiring demand.

The site is built around two main modes:

1. Individual / Job Seeker
2. Enterprise / Employer

The demo uses dummy data through a local mock API, but the product concept mirrors the original Signal Path direction: using job-market signals, skill extraction, salary intelligence, and AI-generated recommendations to help users make better career and hiring decisions.

## 2. Individual / Job Seeker Flow

The job seeker flow helps a candidate understand what stands between them and a target role.

Main capabilities:

- Search by job title, location, and current skills.
- Upload a CV to simulate skill extraction and role inference.
- Show matching job cards with relevance scores.
- Select a job and view role-specific analysis.
- Identify skills to highlight in an application.
- Identify missing or underdeveloped skills.
- View company profile information, including culture, reviews, ratings, pros, and cons.
- Verify job quality through a scam and posting-quality checklist.
- Generate interview prep questions.
- Generate tailored application material through the Tailorman tab.
- Show top market skill gaps.
- Show learning roadmaps for missing skills.
- Show salary intelligence and practical ways to increase earning potential.

This means the current product is strongest as a candidate-side decision tool: it does not only show jobs, it explains what the market is asking for and what the candidate should do next.

## 3. Enterprise / Employer Flow

The enterprise flow helps an employer understand competitor hiring signals and workforce capability gaps.

Main capabilities:

- Enter a company name, role, market, and current team skills.
- Auto-detect a competitor.
- Scan dummy competitor postings.
- Identify the top skill signals competitors are hiring for.
- Show an executive summary with urgency level.
- Show competitive intelligence:
  - what the competitor appears to be building,
  - where the user company may be behind,
  - what the team should do next.
- Show a skill priority map.
- Show source postings.
- Generate an internal training roadmap.
- Generate Talent Hunter candidate personas and outreach messages.

This means the current product already has a strong employer-side angle: it can be positioned as workforce intelligence, competitor benchmarking, and talent strategy support.

## 4. How This Relates to Career OS

The Talentbank hackathon frames Career OS as a navigation layer rather than a prediction engine. It should help people see realistic paths, trade-offs, market signals, and opportunities without pretending to predict an exact future.

Signal Path already fits this direction because it:

- uses labor-market demand as the grounding signal,
- shows skill gaps instead of generic advice,
- connects candidates and employers through shared skill intelligence,
- supports both personal growth and workforce planning,
- explains why recommendations make sense.

Leave the details to:
- "Here are the jobs and gaps."
into:
- "Here are the realistic next career paths, trade-offs, pay outcomes, and learning actions available to you."

## 5. Recommended Modules to Integrate

I recommend integrating three modules:

1. Career Path Navigator
2. Fair Pay Engine
3. Future-State Curriculum Engine

These modules fit the current demo best because they build directly on features that already exist, without forcing the product into a completely different direction.

## 6. Primary Recommendation: Career Path Navigator

### Why This Is the Best Fit

Career Path Navigator is the strongest module to integrate because Signal Path already has the raw ingredients:

- current skills,
- target role,
- job-market demand,
- skill gaps,
- learning roadmaps,
- salary intelligence,
- company and role context.

The missing layer is career pathing. Instead of only showing gaps for one searched role, the site should show multiple realistic routes the user could take.

### Suggested Integration

Add a new section or tab called:

> Career Paths

After the user runs a job search, show 3 recommended paths:

1. Apply Now Path
   - Roles the user is already close to qualified for.
   - Shortest path to interviews.
   - Smallest skill gap.

2. Stretch Path
   - Higher-value roles that require 1-3 key skill upgrades.
   - Includes a 4-8 week learning plan.
   - Shows expected pay upside.

3. Pivot Path
   - Adjacent career options based on transferable skills.
   - Useful for people switching fields or moving into higher-demand roles.
   - Explains trade-offs honestly.

### Example Output

For a user searching "Data Analyst" with SQL, Python, Tableau, and Excel:

- Apply Now Path: Product Analyst
- Stretch Path: Analytics Engineer
- Pivot Path: Data Product Manager

Each path should include:

- match score,
- missing skills,
- salary range,
- time-to-readiness,
- market demand,
- risk level,
- recommended next action.

### Why Judges Would Like This

This moves Signal Path closer to the Career OS brief because it helps users see the career landscape rather than a single job answer.

## 7. Secondary Recommendation: Fair Pay Engine

### Why This Fits

The current demo already includes Market Salary Intelligence. Fair Pay Engine is a natural extension of that feature.

Right now, the salary section shows:

- market minimum,
- median,
- maximum,
- context,
- ways to increase salary.

Fair Pay Engine would make this more personal and actionable.

### Suggested Integration

Add fields for:

- current salary,
- expected salary,
- years of experience,
- seniority level,
- location,
- remote or on-site preference.

Then show:

- whether the user appears underpaid,
- estimated percentile,
- fair salary range,
- pay gap amount,
- negotiation readiness,
- suggested negotiation script,
- timing advice.

### Example Output

> You appear to be 14% below the market median for Data Analyst roles in Kuala Lumpur with your skill profile.

Recommended action:

> Bring this up before your next review, anchored on your SQL, dashboarding, and stakeholder-facing project work. Ask for a range adjustment or a defined 90-day path to review.

### Why Judges Would Like This

It is practical, emotionally resonant, and directly tied to career agency. It also avoids vague AI coaching by grounding advice in market data.

## 8. Third Recommendation: Future-State Curriculum Engine

### Why This Fits

Signal Path already calculates skill demand from job postings and employer signals. That same data can serve universities.

This module would extend the site from a candidate/employer product into a broader Career OS ecosystem.

### Suggested Integration

Add a third mode:

> University

The University mode could let a faculty or career office user enter:

- institution name,
- program name,
- current curriculum topics,
- target graduate roles,
- market or region.

Then the system would show:

- skills currently demanded by employers,
- skills missing from the curriculum,
- skills likely to become more important,
- outdated or low-demand curriculum areas,
- suggested course updates,
- internship alignment recommendations.

### Example Output

For a Business Analytics program:

High-priority additions:

- dbt
- Snowflake
- experimentation design
- data storytelling
- AI-assisted analytics workflows

Suggested curriculum action:

> Add a 6-week applied analytics engineering module using dbt, warehouse modeling, and stakeholder reporting. Pair it with an employer-backed capstone brief.

### Why Judges Would Like This

It demonstrates system-level thinking. The product no longer serves only individuals; it helps universities close the gap before students graduate.

## 9. Modules Worth Considering Later

### Smart Talent Matching

This could fit the Enterprise side, especially Talent Hunter. It would turn Signal Path into a more complete two-sided marketplace.

Possible future feature:

- match candidates not only by current skills, but by trajectory and future role fit.

This is promising, but it may be too large for the next demo iteration unless the product is intentionally becoming a full marketplace.

### Living Portfolio

This could extend the CV upload and Tailorman features.

Possible future feature:

- users maintain a living record of projects, achievements, decisions, and proof-of-work.

This is useful, but it requires a persistent user profile and more data entry.

### AI Career Coach

This could work if it is not implemented as a generic chatbot.

Possible future feature:

- a quiet recommendation layer that notices underpayment, missing skills, better-fit roles, and timing opportunities.

This should be insight-driven, not chat-first.

## 10. Modules I Would Not Prioritize Now

I would not prioritize these modules for the current Signal Path demo:

- Talent Retention Signals
- Talent Re-Engagement
- Onboarding Success Predictor
- Workforce Resilience Planner
- Lifelong Outcome Loop
- Adaptive Readiness Profile
- Live Internship Marketplace
- Lifelong Learning Wallet
- Life Chapter Designer

Reasons:

- Some need proprietary employer or university data.
- Some require long-term user history.
- Some pull the product away from Signal Path's strongest market intelligence foundation.
- Some are too broad for a focused 28-day build.

## 11. Recommended Product Positioning

Recommended positioning:

> Signal Path is a Career OS intelligence layer that helps candidates, employers, and universities understand the real-time gap between current capability and market demand.

Candidate promise:

> See your realistic next moves, skill gaps, pay position, and learning path.

Employer promise:

> See what competitors are hiring for, where your team is behind, and who to hire or train next.

University promise:

> See whether your curriculum matches the market your graduates are entering.

## 12. Suggested Build Scope

For the next version, I would build in this order:

1. Career Path Navigator
   - Add a new pathing section to the candidate results page.
   - Use current skills, searched role, gaps, salary, and roadmaps.

2. Fair Pay Engine
   - Expand the existing salary card.
   - Add personal salary comparison and negotiation guidance.

3. Future-State Curriculum Engine
   - Add a lightweight University mode.
   - Reuse the existing skill gap and demand-score logic.

This gives the demo a stronger Career OS story while staying close to what already works.

## 13. Final Recommendation

The best module combination is:

> Career Path Navigator + Fair Pay Engine + Future-State Curriculum Engine

Career Path Navigator should be the primary module.

Fair Pay Engine should be integrated as a practical candidate-side extension.

Future-State Curriculum Engine should be added if you want the demo to stand out as a broader ecosystem product rather than only a candidate/employer tool.

Together, these modules make Signal Path feel like a genuine Career OS: not a job board, not a generic AI coach, but a market-grounded navigation system for careers.
