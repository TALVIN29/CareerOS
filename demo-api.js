(() => {
  const API_BASE = window.__API_URL__ || "https://gaphunter-demo.local";
  const nativeFetch = window.fetch.bind(window);

  const locations = {
    default: "Kuala Lumpur, Malaysia",
    remote: "Remote",
    singapore: "Singapore",
  };

  const baseJobs = [
    {
      company: "Airbnb",
      location: locations.remote,
      url: "https://www.linkedin.com/jobs/view/4109248101",
      relevance_pct: 82,
      is_remote: true,
      seniority: "mid",
      salary: "$95,000-$125,000/yr",
      source: "LinkedIn Dataset",
      date_posted: "2026-05-29",
      company_industry: "Travel technology",
      company_size: "6,000+",
      company_description: "A global marketplace team using experimentation and analytics to improve host and guest journeys.",
      skills_match: ["SQL", "Python", "Tableau", "A/B testing", "stakeholder storytelling"],
    },
    {
      company: "Grab",
      location: locations.default,
      url: "https://www.linkedin.com/jobs/view/4109248102",
      relevance_pct: 76,
      is_remote: false,
      seniority: "senior",
      salary: "MYR 150,000-MYR 210,000/yr",
      source: "LinkedIn Dataset",
      date_posted: "2026-05-28",
      company_industry: "Super app",
      company_size: "10,000+",
      company_description: "Regional product and marketplace teams building operational intelligence across mobility, delivery, and financial services.",
      skills_match: ["SQL", "Python", "dbt", "Snowflake", "Looker"],
    },
    {
      company: "Wise",
      location: locations.singapore,
      url: "https://www.linkedin.com/jobs/view/4109248103",
      relevance_pct: 68,
      is_remote: true,
      seniority: "mid",
      salary: "SGD 115,000-SGD 155,000/yr",
      source: "SERP API",
      date_posted: "2026-05-27",
      company_industry: "Fintech",
      company_size: "5,000+",
      company_description: "Payments platform with data teams focused on risk, growth, compliance, and customer operations.",
      skills_match: ["SQL", "Python", "risk analytics", "statistics", "experimentation"],
    },
    {
      company: "Canva",
      location: locations.remote,
      url: "https://www.linkedin.com/jobs/view/4109248104",
      relevance_pct: 61,
      is_remote: true,
      seniority: "mid",
      salary: "$110,000-$145,000/yr",
      source: "Web Unlocker",
      date_posted: "2026-05-25",
      company_industry: "Design software",
      company_size: "4,000+",
      company_description: "Creative software company hiring analytics talent for lifecycle, marketplace, and AI product areas.",
      skills_match: ["SQL", "Python", "product analytics", "Amplitude", "stakeholder storytelling"],
    },
    {
      company: "ShopBack",
      location: locations.singapore,
      url: "https://www.linkedin.com/jobs/view/4109248105",
      relevance_pct: 54,
      is_remote: false,
      seniority: "mid",
      salary: "SGD 95,000-SGD 125,000/yr",
      source: "SERP API",
      date_posted: "2026-05-23",
      company_industry: "Commerce",
      company_size: "1,000+",
      company_description: "Consumer growth team turning promotions, merchant data, and user behavior into revenue experiments.",
      skills_match: ["SQL", "Tableau", "Python", "cohort analysis", "growth analytics"],
    },
  ];

  const gaps = [
    { skill: "dbt", demand_score: 0.822, urls: ["https://www.getdbt.com/resources"] },
    { skill: "Snowflake", demand_score: 0.736, urls: ["https://learn.snowflake.com"] },
    { skill: "Airflow", demand_score: 0.684, urls: ["https://airflow.apache.org/docs/"] },
    { skill: "Experimentation", demand_score: 0.641, urls: ["https://www.coursera.org/learn/ab-testing"] },
    { skill: "Stakeholder storytelling", demand_score: 0.593, urls: ["https://www.tableau.com/learn/training"] },
  ];

  const roadmaps = {
    dbt: {
      why_it_matters: "Analytics teams are moving transformation logic out of spreadsheets and notebooks into tested, versioned dbt models.",
      estimated_total: "3-4 weeks",
      steps: [
        { action: "Complete dbt Fundamentals and build three source-to-mart models", duration: "4 days", resource_url: "https://courses.getdbt.com/courses/fundamentals" },
        { action: "Add tests, documentation, and exposures to an analytics project", duration: "1 week", resource_url: "https://docs.getdbt.com/docs/build/data-tests" },
        { action: "Publish a portfolio case study showing model lineage and business metrics", duration: "1 week", resource_url: "https://docs.getdbt.com/docs/collaborate/documentation" },
      ],
    },
    Snowflake: {
      why_it_matters: "Cloud data warehouse experience is showing up across data, product, and operations analyst postings.",
      estimated_total: "2-3 weeks",
      steps: [
        { action: "Learn warehouses, stages, roles, and basic cost controls", duration: "3 days", resource_url: "https://learn.snowflake.com" },
        { action: "Load sample product data and optimize common analytical queries", duration: "1 week", resource_url: "https://docs.snowflake.com/en/user-guide/tutorials" },
        { action: "Document a dashboard-ready data mart and access pattern", duration: "1 week", resource_url: "https://docs.snowflake.com/en/user-guide/views-introduction" },
      ],
    },
    Airflow: {
      why_it_matters: "Hiring teams want analysts who understand how recurring data workflows reach production.",
      estimated_total: "2 weeks",
      steps: [
        { action: "Create a daily DAG that validates and exports metrics", duration: "3 days", resource_url: "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/index.html" },
        { action: "Add retries, alerts, backfills, and task dependencies", duration: "4 days", resource_url: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html" },
        { action: "Explain the workflow in business terms for interview stories", duration: "2 days", resource_url: "https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html" },
      ],
    },
    Experimentation: {
      why_it_matters: "Product teams are screening for analysts who can design reliable tests and explain tradeoffs.",
      estimated_total: "10 days",
      steps: [
        { action: "Review hypothesis design, sample size, power, and guardrail metrics", duration: "3 days", resource_url: "https://www.coursera.org/learn/ab-testing" },
        { action: "Analyze a simulated A/B test in SQL and Python", duration: "4 days", resource_url: "https://www.kaggle.com/datasets" },
        { action: "Create a one-page decision memo with confidence intervals", duration: "3 days", resource_url: "https://www.evanmiller.org/ab-testing/" },
      ],
    },
    "Stakeholder storytelling": {
      why_it_matters: "Senior analyst roles increasingly expect clear narratives, not only charts and queries.",
      estimated_total: "1-2 weeks",
      steps: [
        { action: "Rewrite three dashboard findings as executive-ready recommendations", duration: "2 days", resource_url: "https://www.tableau.com/learn/articles/data-storytelling" },
        { action: "Practice before/after narratives for ambiguous metrics", duration: "3 days", resource_url: "https://www.storytellingwithdata.com/" },
        { action: "Prepare two STAR stories around influence without authority", duration: "3 days", resource_url: "https://www.themuse.com/advice/star-interview-method" },
      ],
    },
  };

  const companyProfiles = {
    Airbnb: {
      overall_rating: 4.4,
      glassdoor_rating: 4.3,
      indeed_rating: 4.2,
      recommend_pct: 87,
      ceo_approval_pct: 91,
      review_count: 2830,
      culture_summary: "Strong product culture, high autonomy, and data-driven teams. Interviews tend to probe experimentation judgement and communication under ambiguity.",
      employee_reviews: [
        { text: "Great mission and unusually strong cross-functional collaboration.", rating: 5, source: "glassdoor" },
        { text: "Fast pace, but analysts get real ownership over product decisions.", rating: 4, source: "indeed" },
      ],
      pros: ["High autonomy", "Strong design and data partnership", "Remote-friendly teams"],
      cons: ["High bar for written communication", "Ambiguous product problems"],
    },
    Grab: {
      overall_rating: 4.1,
      glassdoor_rating: 4.0,
      indeed_rating: 4.1,
      recommend_pct: 79,
      ceo_approval_pct: 86,
      review_count: 3910,
      culture_summary: "Regional scale, dense marketplace problems, and strong appetite for analytics that links operations to product strategy.",
      employee_reviews: [
        { text: "Good exposure to complex Southeast Asia marketplace problems.", rating: 4, source: "glassdoor" },
        { text: "Fast moving teams and lots of ownership if you can navigate ambiguity.", rating: 4, source: "indeed" },
      ],
      pros: ["Regional impact", "Rich operational data", "Clear growth paths"],
      cons: ["Many stakeholders", "Frequent priority shifts"],
    },
    Wise: {
      overall_rating: 4.2,
      glassdoor_rating: 4.1,
      indeed_rating: 4.0,
      recommend_pct: 82,
      ceo_approval_pct: 88,
      review_count: 2140,
      culture_summary: "Mission-led fintech culture with high expectations for compliance-aware product analytics and clean decision writing.",
      employee_reviews: [
        { text: "Transparent culture and very analytical product discussions.", rating: 4, source: "glassdoor" },
        { text: "Great learning curve, especially around risk and payments.", rating: 4, source: "indeed" },
      ],
      pros: ["Transparent culture", "Strong analytics craft", "Global mobility"],
      cons: ["Regulatory complexity", "High documentation standards"],
    },
  };

  const defaultProfile = {
    overall_rating: 4.0,
    glassdoor_rating: 4.0,
    indeed_rating: 3.9,
    recommend_pct: 78,
    ceo_approval_pct: 84,
    review_count: 1180,
    culture_summary: "Modern product organization with strong demand for data fluency, commercial thinking, and communication.",
    employee_reviews: [
      { text: "Good learning environment with plenty of data problems to solve.", rating: 4, source: "glassdoor" },
      { text: "Teams value practical analysis and clear recommendations.", rating: 4, source: "indeed" },
    ],
    pros: ["Learning culture", "Practical analytics work", "Cross-functional exposure"],
    cons: ["Busy release cycles", "Changing priorities"],
  };

  const salaryIntel = {
    currency: "USD",
    currency_symbol: "$",
    market_min: 85000,
    market_median: 118000,
    market_max: 165000,
    market_context: "Roles with analytics engineering, experimentation, and stakeholder storytelling sit above the median because they reduce handoffs between data, product, and engineering.",
    increase_tips: [
      { action: "Add dbt and Snowflake examples to your portfolio.", impact: "+8-12% range lift", timeframe: "2-4 weeks" },
      { action: "Frame Python work as production-quality analysis, not notebook exploration.", impact: "+5-9% range lift", timeframe: "1 week" },
      { action: "Prepare one metrics decision memo for interviews.", impact: "Senior-signal boost", timeframe: "2 days" },
    ],
  };

  const hrSkills = [
    { skill: "machine learning", score: 0.418 },
    { skill: "MLOps", score: 0.371 },
    { skill: "feature store", score: 0.342 },
    { skill: "real-time analytics", score: 0.319 },
    { skill: "data governance", score: 0.284 },
    { skill: "Snowflake", score: 0.261 },
    { skill: "dbt", score: 0.248 },
  ];

  const hrPostingUrls = [
    "https://www.linkedin.com/jobs/view/4110001001",
    "https://www.linkedin.com/jobs/view/4110001002",
    "https://www.linkedin.com/jobs/view/4110001003",
    "https://www.linkedin.com/jobs/view/4110001004",
    "https://www.linkedin.com/jobs/view/4110001005",
  ];

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  async function readBody(init) {
    const body = init?.body;
    if (!body || body instanceof FormData) return {};
    if (typeof body === "string") {
      try { return JSON.parse(body); } catch { return {}; }
    }
    return {};
  }

  function titleCase(value) {
    return String(value || "Data Analyst")
      .trim()
      .split(/\s+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function jobsForRole(role, location) {
    const cleanRole = titleCase(role);
    const loc = location?.trim();
    const titles = [
      `Senior ${cleanRole}`,
      `${cleanRole} - Marketplace Intelligence`,
      `${cleanRole} - Risk and Growth`,
      `Product ${cleanRole}`,
      `${cleanRole} - Commercial Analytics`,
    ];
    return baseJobs.map((job, index) => ({
      ...job,
      title: titles[index],
      location: loc || job.location,
      relevance_pct: Math.max(48, job.relevance_pct - (index * 2)),
    }));
  }

  function analyseJob(body) {
    const userSkills = String(body.user_skills || "")
      .split(",")
      .map(skill => skill.trim())
      .filter(Boolean);

    if (!userSkills.length) {
      return { status: "no_skills", message: "Upload your CV or enter your skills to see your personal skill gaps." };
    }

    const highlight = userSkills.slice(0, 4);
    const matched = body.skills_match || [];
    const missing = gaps
      .map(gap => gap.skill)
      .filter(skill => !userSkills.some(userSkill => userSkill.toLowerCase() === skill.toLowerCase()))
      .slice(0, 4);

    return {
      status: "ok",
      analysis: {
        highlight_skills: highlight.length ? highlight : matched.slice(0, 3),
        gap_skills: missing.length ? missing : ["dbt", "Snowflake"],
        application_tip: `Lead with the ${highlight[0] || "SQL"} work you have already done, then position ${missing[0] || "dbt"} as your immediate learning plan for this role.`,
      },
    };
  }

  function detectCompetitor(body) {
    const company = titleCase(body.your_company || "Maybank");
    const map = {
      Maybank: "CIMB",
      Cimb: "Maybank",
      Axiata: "Maxis",
      Maxis: "CelcomDigi",
      Grab: "AirAsia MOVE",
      Airasia: "Grab",
      Shopee: "Lazada",
      Lazada: "Shopee",
    };
    const competitor = map[company] || "Grab";
    return {
      status: "ok",
      competitor,
      detected_role: body.role?.trim() || "Data Engineer",
      reason: `${competitor} is hiring into adjacent data and AI roles that expose where ${company} may need deeper technical capability.`,
      news_snippets: `${competitor} announced new AI-led customer, risk, and personalization initiatives in the region.`,
    };
  }

  function trainingRoadmap() {
    return [
      {
        skill: "machine learning",
        timeline: "6 weeks",
        why: "Competitor postings emphasize model ownership beyond dashboard analytics.",
        steps: ["Run an applied ML foundations sprint", "Pair analysts with engineering mentors", "Ship one churn or risk model prototype"],
        resource: "Google ML Crash Course",
        link: "https://developers.google.com/machine-learning/crash-course",
      },
      {
        skill: "MLOps",
        timeline: "8 weeks",
        why: "Hiring language suggests models are moving toward production operations.",
        steps: ["Create model deployment playbooks", "Train on monitoring and drift", "Define handoff standards with platform teams"],
        resource: "Made With ML",
        link: "https://madewithml.com/",
      },
      {
        skill: "real-time analytics",
        timeline: "5 weeks",
        why: "Live decisioning appears across fraud, offers, and operational intelligence roles.",
        steps: ["Audit current batch-only dashboards", "Pilot streaming metrics for one journey", "Set alert ownership and response rules"],
        resource: "Confluent Developer",
        link: "https://developer.confluent.io/",
      },
    ];
  }

  function personas(role, location) {
    const encodedRole = encodeURIComponent(role || "Data Engineer");
    const encodedLocation = encodeURIComponent(location || "Kuala Lumpur");
    return [
      {
        title: "Analytics Engineer moving toward ML platforms",
        background: "4-6 years in fintech or marketplace data teams",
        leaving_signal: "Likely blocked by limited production ML scope in their current analytics role.",
        likely_at: ["Fintech scaleups", "Marketplace platforms", "Digital banks"],
        profile_urls: ["https://www.linkedin.com/in/demo-analytics-engineer"],
        linkedin_search_url: `https://www.linkedin.com/search/results/people/?keywords=${encodedRole}%20${encodedLocation}%20open%20to%20work`,
        outreach: "Hi, I noticed your analytics engineering background and the mix of data modeling plus product impact. We are building a team that is moving into ML-enabled decisioning, and your profile looks unusually relevant. Would you be open to a short chat this week?",
      },
      {
        title: "Data engineer with governance and warehouse depth",
        background: "Cloud data warehouse, dbt, and platform reliability",
        leaving_signal: "May be ready for broader ownership after maintaining mature data pipelines.",
        likely_at: ["Banks", "Insurance platforms", "Regional SaaS"],
        profile_urls: ["https://www.linkedin.com/in/demo-data-platform-lead"],
        linkedin_search_url: `https://www.linkedin.com/search/results/people/?keywords=dbt%20Snowflake%20${encodedLocation}`,
        outreach: "Hi, your data platform work caught my eye, especially the warehouse and governance angle. We are prioritizing real-time analytics and production data quality this quarter. Would it be worth comparing notes on what you want next?",
      },
      {
        title: "Product analyst with experimentation strength",
        background: "Growth, lifecycle, and A/B testing across consumer products",
        leaving_signal: "Often open to roles where analysis has more direct product influence.",
        likely_at: ["E-commerce", "Travel tech", "Consumer apps"],
        profile_urls: [],
        linkedin_search_url: `https://www.linkedin.com/search/results/people/?keywords=experimentation%20product%20analyst%20${encodedLocation}`,
        outreach: "Hi, I saw your product analytics and experimentation background. We are hiring for a role where the analyst owns decision quality, not just reporting. If that sounds interesting, I would enjoy sharing what the team is building.",
      },
    ];
  }

  async function route(url, init) {
    const body = await readBody(init);
    const parsed = new URL(url);
    const path = parsed.pathname;

    if (path === "/api/search") {
      await sleep(700);
      const role = body.role || "Data Analyst";
      const location = body.location || "Kuala Lumpur";
      return jsonResponse({
        status: "ok",
        jobs: jobsForRole(role, location),
        gaps,
        session_id: "demo-static",
        total_postings: 47,
        circuit_open: true,
        data_source: "fallback",
        location_searched: location,
      });
    }

    if (path === "/api/analyse") {
      await sleep(250);
      return jsonResponse(analyseJob(body));
    }

    if (path === "/api/company") {
      await sleep(250);
      const name = body.company_name || "Company";
      const profile = companyProfiles[name] || defaultProfile;
      return jsonResponse({
        status: "ok",
        profile,
        glassdoor_url: `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(name)}`,
        indeed_url: `https://www.indeed.com/cmp/${encodeURIComponent(name)}`,
        sources_used: ["Bright Data Web Unlocker", "Google SERP", "Claude AI"],
      });
    }

    if (path === "/api/salary") {
      await sleep(200);
      return jsonResponse({ status: "ok", intel: salaryIntel });
    }

    if (path === "/api/interview") {
      await sleep(250);
      return jsonResponse({
        status: "ok",
        questions: [
          { type: "technical", question: "How would you define a trustworthy north-star metric for this role?", tip: "Name the metric, guardrails, and one failure mode." },
          { type: "situational", question: "A stakeholder wants a launch decision before the data is mature. What do you do?", tip: "Show how you separate risk, reversibility, and evidence quality." },
          { type: "technical", question: "Walk through a SQL or Python project where your analysis changed a product decision.", tip: "Use business impact as the ending, not the tooling." },
          { type: "behavioural", question: "Tell me about a time your recommendation was challenged.", tip: "Emphasize listening, reframing, and the final decision." },
        ],
      });
    }

    if (path === "/api/tailorman") {
      await sleep(250);
      return jsonResponse({
        status: "ok",
        tailored: {
          tailored_summary: `Data professional with hands-on ${body.user_skills || "SQL and Python"} experience, positioned for ${body.job_title || "this role"} by connecting analysis to product and commercial decisions.`,
          skills_to_emphasise: ["SQL", "Python", "stakeholder storytelling", "experimentation"],
          cover_letter_opening: `I am excited about ${body.job_company || "your team"} because the role sits exactly where data, product judgement, and business action meet.`,
          gap_framing: "Acknowledge the new tools directly, then point to your active roadmap and similar work you have already shipped.",
          interview_talking_points: [
            { point: "Metrics to decisions", why: "Shows you can move beyond reporting." },
            { point: "Learning velocity", why: "Turns skill gaps into a practical plan." },
            { point: "Cross-functional clarity", why: "Matches the communication-heavy parts of the role." },
          ],
        },
      });
    }

    if (path === "/api/resume") {
      await sleep(650);
      return jsonResponse({
        status: "ok",
        skills: ["SQL", "Python", "Tableau", "Excel", "stakeholder storytelling"],
        inferred_role: "Data Analyst",
      });
    }

    if (path.startsWith("/api/roadmap/")) {
      await sleep(150);
      const skill = decodeURIComponent(path.split("/").pop() || "");
      return jsonResponse({
        status: "ready",
        roadmap: roadmaps[skill] || roadmaps[Object.keys(roadmaps)[0]],
      });
    }

    if (path === "/api/hr/detect-competitor") {
      await sleep(300);
      return jsonResponse(detectCompetitor(body));
    }

    if (path === "/api/hr/competitors") {
      await sleep(550);
      return jsonResponse({
        status: "ok",
        top_skills: hrSkills,
        postings_analysed: 23,
        posting_urls: hrPostingUrls,
        data_scope: "company",
      });
    }

    if (path === "/api/hr/intelligence") {
      await sleep(300);
      return jsonResponse({
        status: "ok",
        urgency: "High",
        urgency_reason: "The competitor is hiring for production ML and real-time data capabilities while the current team profile is still strongest in reporting and BI.",
        building: ["Production ML decisioning", "Real-time customer risk scoring", "Shared data product platform"],
        gap: ["Limited MLOps ownership", "Batch analytics dependence", "Thin feature engineering bench"],
        action: ["Start a 90-day ML enablement squad", "Hire one senior data platform lead", "Upskill analysts on experimentation and feature pipelines"],
      });
    }

    if (path === "/api/hr/recommendations") {
      await sleep(450);
      return jsonResponse({ status: "ok", training_roadmap: trainingRoadmap() });
    }

    if (path === "/api/hr/talent-hunt") {
      await sleep(450);
      return jsonResponse({
        status: "ok",
        personas: personas(body.role, body.location),
      });
    }

    if (path === "/api/hr/outreach") {
      return jsonResponse({
        status: "ok",
        message: "Hi, your work sits right at the intersection of data platforms and business impact. We are building a team around the same problems and I would enjoy comparing notes if you are open to a quick chat.",
      });
    }

    return jsonResponse({ status: "error", message: "Demo endpoint not implemented." }, 404);
  }

  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    if (typeof url === "string" && url.startsWith(API_BASE)) {
      return route(url, init);
    }
    return nativeFetch(input, init);
  };
})();
