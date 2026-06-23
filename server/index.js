import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = Number(process.env.PORT || 3000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const DATABASE_PATH = process.env.DATABASE_PATH || "./data/careeros.sqlite";
const APP_API_SECRET = process.env.APP_API_SECRET || "";
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || "";
const BRIGHTDATA_SEARCH_URL = process.env.BRIGHTDATA_SEARCH_URL || "";
const BRIGHTDATA_API_KEY = process.env.BRIGHTDATA_API_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS gaps_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT,
    location TEXT,
    skill TEXT NOT NULL,
    demand_score REAL DEFAULT 0,
    source TEXT DEFAULT 'search',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_gaps_ledger_skill ON gaps_ledger(skill);
  CREATE INDEX IF NOT EXISTS idx_gaps_ledger_created_at ON gaps_ledger(created_at);
`);

app.use((req, res, next) => {
  if (!APP_API_SECRET) return next();

  const bearer = req.get("Authorization")?.replace(/^Bearer\s+/i, "");
  const demoSecret = req.get("X-Demo-Secret");
  if (bearer === APP_API_SECRET || demoSecret === APP_API_SECRET) return next();

  return res.status(401).json({
    status: "error",
    message: "Unauthorized.",
  });
});

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

const skillResources = {
  dbt: "https://www.getdbt.com/resources",
  Snowflake: "https://learn.snowflake.com",
  Airflow: "https://airflow.apache.org/docs/",
  Experimentation: "https://www.coursera.org/learn/ab-testing",
  "Stakeholder storytelling": "https://www.tableau.com/learn/training",
  SQL: "https://mode.com/sql-tutorial/",
  Python: "https://docs.python.org/3/tutorial/",
  Tableau: "https://www.tableau.com/learn/training",
  "machine learning": "https://developers.google.com/machine-learning/crash-course",
  MLOps: "https://madewithml.com/",
  "data governance": "https://www.databricks.com/glossary/data-governance",
};

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

function clampScore(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0.1, Math.min(0.99, n));
}

function normalizeSkillName(skill) {
  const cleaned = String(skill || "").trim().replace(/\s+/g, " ");
  const known = Object.keys(skillResources).find(item => item.toLowerCase() === cleaned.toLowerCase());
  return known || cleaned.replace(/^./, char => char.toUpperCase());
}

function storeSearchGaps({ sessionId, role, location, gapList, source }) {
  if (!Array.isArray(gapList) || !gapList.length) return;

  const insert = db.prepare(`
    INSERT INTO gaps_ledger (session_id, role, location, skill, demand_score, source)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const write = db.transaction(() => {
    for (const gap of gapList) {
      const skill = normalizeSkillName(gap.skill);
      if (!skill) continue;
      insert.run(
        sessionId,
        role,
        location,
        skill,
        clampScore(gap.demand_score, 0),
        source || "search",
      );
    }
  });

  write();
}

function getUniversityMetrics() {
  const rows = db.prepare(`
    SELECT
      skill,
      COUNT(*) AS frequency,
      AVG(demand_score) AS avg_demand
    FROM gaps_ledger
    GROUP BY LOWER(skill)
    ORDER BY frequency DESC, avg_demand DESC
    LIMIT 5
  `).all();

  const fallbackRows = gaps.slice(0, 5).map((gap, index) => ({
    skill: gap.skill,
    frequency: Math.max(1, 5 - index),
    avg_demand: gap.demand_score,
  }));

  const sourceRows = rows.length ? rows : fallbackRows;
  const top_gaps = sourceRows.map(row => ({
    skill: normalizeSkillName(row.skill),
    frequency: Number(row.frequency || 0),
    demand_score: clampScore(row.avg_demand, 0.6),
    demand: Math.round(clampScore(row.avg_demand, 0.6) * 100),
  }));

  const total_records = Number(db.prepare("SELECT COUNT(*) AS count FROM gaps_ledger").get().count || 0);
  const maxFrequency = Math.max(...top_gaps.map(gap => gap.frequency), 1);
  const weightedCoverage = top_gaps.reduce((sum, gap) => sum + gap.demand_score * (gap.frequency / maxFrequency), 0);
  const benchmark = Math.max(35, Math.min(92, Math.round((weightedCoverage / Math.max(1, top_gaps.length)) * 100)));

  return {
    status: "ok",
    top_gaps,
    benchmark,
    total_records,
    source: rows.length ? "gaps_ledger" : "fallback",
  };
}

function inferHeuristicGaps(jobs) {
  const knownSkills = [
    "SQL",
    "Python",
    "Tableau",
    "Power BI",
    "dbt",
    "Snowflake",
    "Airflow",
    "Looker",
    "Experimentation",
    "A/B testing",
    "stakeholder storytelling",
    "machine learning",
    "MLOps",
    "data governance",
  ];

  const text = jobs
    .map(job => [job.title, job.company, job.description, ...(job.skills_match || [])].join(" "))
    .join(" ")
    .toLowerCase();

  const ranked = knownSkills
    .map(skill => ({
      skill,
      count: (text.match(new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item, index) => ({
      skill: item.skill,
      demand_score: clampScore(0.82 - index * 0.06, 0.6),
      urls: [skillResources[item.skill] || "https://www.coursera.org/career-academy"],
    }));

  return ranked.length ? ranked : gaps;
}

function normalizeJob(raw, index, role, location) {
  const extensions = raw.detected_extensions || {};
  const description = raw.description || raw.snippet || "";
  const salary = extensions.salary || raw.salary || raw.salary_range || "Market rate not listed";
  const posted = extensions.posted_at || raw.posted_at || raw.date || "";
  const company = raw.company_name || raw.company || "Company";
  const title = raw.title || `${titleCase(role)} role`;
  const jobLocation = raw.location || location || "Remote";
  const url = raw.share_link || raw.job_link || raw.link || raw.apply_options?.[0]?.link || `https://www.google.com/search?q=${encodeURIComponent(`${title} ${company}`)}`;

  return {
    title,
    company,
    location: jobLocation,
    url,
    relevance_pct: Math.max(52, 88 - index * 5),
    is_remote: /remote/i.test(`${title} ${jobLocation} ${description}`),
    seniority: /senior|lead|principal|manager/i.test(title) ? "senior" : "mid",
    salary,
    source: raw.source || raw.via || "Google Jobs",
    date_posted: posted,
    company_industry: raw.company_industry || "Not specified",
    company_size: raw.company_size || "",
    company_description: description || `${company} is hiring for ${title}.`,
    skills_match: inferHeuristicGaps([{ title, company, description }]).slice(0, 5).map(gap => gap.skill),
  };
}

async function fetchSerpApiJobs(role, location) {
  if (!SERPAPI_API_KEY) return null;

  const params = new URLSearchParams({
    engine: "google_jobs",
    q: `${role || "Data Analyst"} ${location || ""}`.trim(),
    api_key: SERPAPI_API_KEY,
  });
  if (location) params.set("location", location);

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) throw new Error(`SerpApi returned ${response.status}`);

  const payload = await response.json();
  const rawJobs = payload.jobs_results || [];
  if (!rawJobs.length) return null;

  return {
    jobs: rawJobs.slice(0, 8).map((job, index) => normalizeJob(job, index, role, location)),
    totalPostings: Number(payload.search_metadata?.total_results) || rawJobs.length,
    dataSource: "live",
  };
}

async function fetchBrightDataJobs(role, location) {
  if (!BRIGHTDATA_SEARCH_URL || !BRIGHTDATA_API_KEY) return null;

  const response = await fetch(BRIGHTDATA_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${BRIGHTDATA_API_KEY}`,
    },
    body: JSON.stringify({
      query: `${role || "Data Analyst"} jobs ${location || ""}`.trim(),
      role,
      location,
    }),
  });
  if (!response.ok) throw new Error(`Bright Data search returned ${response.status}`);

  const payload = await response.json();
  const rawJobs = payload.jobs || payload.results || payload.jobs_results || [];
  if (!Array.isArray(rawJobs) || !rawJobs.length) return null;

  return {
    jobs: rawJobs.slice(0, 8).map((job, index) => normalizeJob(job, index, role, location)),
    totalPostings: Number(payload.total_postings || payload.total || rawJobs.length),
    dataSource: "web_extracted",
  };
}

function extractOutputText(payload) {
  if (typeof payload.output_text === "string") return payload.output_text;
  const messages = payload.output || [];
  for (const item of messages) {
    for (const content of item.content || []) {
      if (content.text) return content.text;
    }
  }
  return "";
}

async function callOpenAIJson(prompt, fallback) {
  if (!OPENAI_API_KEY) return fallback;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
        text: { format: { type: "json_object" } },
        store: false,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
    const payload = await response.json();
    const text = extractOutputText(payload);
    return JSON.parse(text);
  } catch (error) {
    console.warn("LLM JSON extraction failed; using fallback.", error.message);
    return fallback;
  }
}

async function inferGapsWithLlm(jobs) {
  const fallback = inferHeuristicGaps(jobs);
  const jobContext = jobs
    .slice(0, 8)
    .map(job => `${job.title} at ${job.company}: ${job.company_description || ""} Skills: ${(job.skills_match || []).join(", ")}`)
    .join("\n");

  const result = await callOpenAIJson(
    `Return only JSON: {"gaps":[{"skill":"string","demand_score":0.75,"urls":["https://example.com"]}]}.
Analyze these active job listings and identify the top 5 capability gaps a candidate should close. Demand scores must be decimals between 0 and 1.

${jobContext}`,
    { gaps: fallback },
  );

  const llmGaps = Array.isArray(result.gaps) ? result.gaps : fallback;
  return llmGaps.slice(0, 5).map((gap, index) => {
    const skill = normalizeSkillName(gap.skill || fallback[index]?.skill || "SQL");
    return {
      skill,
      demand_score: clampScore(gap.demand_score, fallback[index]?.demand_score || 0.6),
      urls: Array.isArray(gap.urls) && gap.urls.length
        ? gap.urls
        : [skillResources[skill] || "https://www.coursera.org/career-academy"],
    };
  });
}

async function extractResumeText(file) {
  if (!file?.buffer) return "";
  const mime = file.mimetype || "";
  const name = file.originalname || "";

  if (mime.includes("pdf") || /\.pdf$/i.test(name)) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const parsed = await parser.getText();
      return parsed.text || "";
    } finally {
      await parser.destroy();
    }
  }

  if (mime.includes("word") || /\.docx$/i.test(name)) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return parsed.value || "";
  }

  return file.buffer.toString("utf8");
}

async function analyzeResume(file) {
  const fallback = {
    skills: ["SQL", "Python", "Tableau", "Excel", "stakeholder storytelling"],
    inferred_role: "Data Analyst",
  };

  try {
    const resumeText = (await extractResumeText(file)).slice(0, 12000);
    if (!resumeText.trim()) return fallback;

    const result = await callOpenAIJson(
      `Return only JSON: {"skills":["skill"],"inferred_role":"role"}.
Extract 5 to 10 important technical and soft skills from this resume text and infer the best target role. Keep skills concise.

Resume:
${resumeText}`,
      fallback,
    );

    return {
      skills: Array.isArray(result.skills) && result.skills.length ? result.skills.slice(0, 10) : fallback.skills,
      inferred_role: result.inferred_role || fallback.inferred_role,
    };
  } catch (error) {
    console.warn("Resume extraction failed; using fallback.", error.message);
    return fallback;
  }
}

function analyseJob(body) {
  const userSkills = String(body.user_skills || "")
    .split(",")
    .map(skill => skill.trim())
    .filter(Boolean);

  if (!userSkills.length) {
    return {
      status: "no_skills",
      message: "Upload your CV or enter your skills to see your personal skill gaps.",
    };
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

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/uni/metrics", (_req, res) => {
  res.json(getUniversityMetrics());
});

app.post("/api/search", async (req, res) => {
  const role = req.body.role || "Data Analyst";
  const location = req.body.location || "Kuala Lumpur";
  let jobResult = null;

  try {
    jobResult = await fetchSerpApiJobs(role, location);
    if (!jobResult) jobResult = await fetchBrightDataJobs(role, location);
  } catch (error) {
    console.warn("Live job search failed; using fallback jobs.", error.message);
  }

  const jobs = jobResult?.jobs?.length ? jobResult.jobs : jobsForRole(role, location);
  const inferredGaps = await inferGapsWithLlm(jobs);
  const sessionId = `search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  storeSearchGaps({
    sessionId,
    role,
    location,
    gapList: inferredGaps,
    source: jobResult?.dataSource || "fallback",
  });

  res.json({
    status: "ok",
    jobs,
    gaps: inferredGaps,
    session_id: sessionId,
    total_postings: jobResult?.totalPostings || 47,
    circuit_open: !jobResult,
    data_source: jobResult?.dataSource || "fallback",
    location_searched: location,
  });
});

app.post("/api/analyse", (req, res) => {
  res.json(analyseJob(req.body));
});

app.post("/api/company", (req, res) => {
  const name = req.body.company_name || "Company";
  const profile = companyProfiles[name] || defaultProfile;

  res.json({
    status: "ok",
    profile,
    glassdoor_url: `https://www.glassdoor.com/Search/results.htm?keyword=${encodeURIComponent(name)}`,
    indeed_url: `https://www.indeed.com/cmp/${encodeURIComponent(name)}`,
    sources_used: ["Bright Data Web Unlocker", "Google SERP", "Claude AI"],
  });
});

app.post("/api/salary", (_req, res) => {
  res.json({ status: "ok", intel: salaryIntel });
});

app.post("/api/interview", (_req, res) => {
  res.json({
    status: "ok",
    questions: [
      { type: "technical", question: "How would you define a trustworthy north-star metric for this role?", tip: "Name the metric, guardrails, and one failure mode." },
      { type: "situational", question: "A stakeholder wants a launch decision before the data is mature. What do you do?", tip: "Show how you separate risk, reversibility, and evidence quality." },
      { type: "technical", question: "Walk through a SQL or Python project where your analysis changed a product decision.", tip: "Use business impact as the ending, not the tooling." },
      { type: "behavioural", question: "Tell me about a time your recommendation was challenged.", tip: "Emphasize listening, reframing, and the final decision." },
    ],
  });
});

app.post("/api/tailorman", (req, res) => {
  res.json({
    status: "ok",
    tailored: {
      tailored_summary: `Data professional with hands-on ${req.body.user_skills || "SQL and Python"} experience, positioned for ${req.body.job_title || "this role"} by connecting analysis to product and commercial decisions.`,
      skills_to_emphasise: ["SQL", "Python", "stakeholder storytelling", "experimentation"],
      cover_letter_opening: `I am excited about ${req.body.job_company || "your team"} because the role sits exactly where data, product judgement, and business action meet.`,
      gap_framing: "Acknowledge the new tools directly, then point to your active roadmap and similar work you have already shipped.",
      interview_talking_points: [
        { point: "Metrics to decisions", why: "Shows you can move beyond reporting." },
        { point: "Learning velocity", why: "Turns skill gaps into a practical plan." },
        { point: "Cross-functional clarity", why: "Matches the communication-heavy parts of the role." },
      ],
    },
  });
});

app.post("/api/resume", upload.single("file"), async (req, res) => {
  const analysis = await analyzeResume(req.file);

  res.json({
    status: "ok",
    skills: analysis.skills,
    inferred_role: analysis.inferred_role,
  });
});

app.get("/api/roadmap/:skill", (req, res) => {
  const skill = decodeURIComponent(req.params.skill || "");
  res.json({
    status: "ready",
    roadmap: roadmaps[skill] || roadmaps[Object.keys(roadmaps)[0]],
  });
});

app.post("/api/hr/detect-competitor", (req, res) => {
  res.json(detectCompetitor(req.body));
});

app.post("/api/hr/competitors", (_req, res) => {
  res.json({
    status: "ok",
    top_skills: hrSkills,
    postings_analysed: 23,
    posting_urls: hrPostingUrls,
    data_scope: "company",
  });
});

app.post("/api/hr/intelligence", (_req, res) => {
  res.json({
    status: "ok",
    urgency: "High",
    urgency_reason: "The competitor is hiring for production ML and real-time data capabilities while the current team profile is still strongest in reporting and BI.",
    building: ["Production ML decisioning", "Real-time customer risk scoring", "Shared data product platform"],
    gap: ["Limited MLOps ownership", "Batch analytics dependence", "Thin feature engineering bench"],
    action: ["Start a 90-day ML enablement squad", "Hire one senior data platform lead", "Upskill analysts on experimentation and feature pipelines"],
  });
});

app.post("/api/hr/recommendations", (_req, res) => {
  res.json({ status: "ok", training_roadmap: trainingRoadmap() });
});

app.post("/api/hr/talent-hunt", (req, res) => {
  res.json({
    status: "ok",
    personas: personas(req.body.role, req.body.location),
  });
});

app.post("/api/hr/outreach", (_req, res) => {
  res.json({
    status: "ok",
    message: "Hi, your work sits right at the intersection of data platforms and business impact. We are building a team around the same problems and I would enjoy comparing notes if you are open to a quick chat.",
  });
});

app.use((_req, res) => {
  res.status(404).json({ status: "error", message: "Demo endpoint not implemented." });
});

app.listen(PORT, () => {
  console.log(`CareerOS API listening on http://localhost:${PORT}`);
});
