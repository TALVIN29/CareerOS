// Signal Path Verify — demo seed data. Pure data, no dependencies.
// Field values are hand-tuned so verify-engine.js computes EXACT scores:
// Backend Engineer 86 · Graduate Data Analyst 58 · Product Designer 93 ·
// Marketing Intern blocked · Cybersecurity Specialist 76.
// See tests/verify-engine.test.js for the exact-score assertions.

(function (root) {
  const PERSONAS = [
    { id: 'u_aisyah', name: 'Aisyah Rahman', role: 'recruiter' },
    { id: 'u_daniel', name: 'Daniel Lim', role: 'manager' },
    { id: 'u_priya', name: 'Priya Nair', role: 'hr_admin' }
  ];

  const JOBS = [
    // Backend Engineer — JIS 86, pending_approval.
    // A=100, R=40 (too-many-skills + duplicate-requirements + title-mismatch),
    // M=100/C=100 (salary fully within benchmark band), Q=60, P=0.
    {
      id: 'job_backend_engineer',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'pending_approval',
      employerVerified: true, requisitionId: 'REQ-2201',
      department: 'Engineering',
      vacancies: 1,
      hiringManagerId: 'u_daniel',
      recruiterId: 'u_aisyah',
      targetStartDate: '2026-09-01',
      headcountApproved: true,
      budgetApproved: true,
      justification: 'Backfill for departing engineer, approved in Q3 planning.',
      title: 'Backend Engineer',
      location: 'Kuala Lumpur',
      workplace: 'hybrid',
      employmentType: 'full-time',
      seniority: 'mid',
      salaryMin: 6000,
      salaryMax: 9000,
      salaryVisible: true,
      reportingLine: null,
      summary: 'Build backend systems.',
      responsibilities: [
        'Coordinate marketing campaigns across channels',
        'Prepare monthly budget reports for leadership',
        'Support customer onboarding calls'
      ],
      requirements: [
        { name: 'Node.js', type: 'skill', required: true },
        { name: 'SQL', type: 'skill', required: true },
        { name: 'REST APIs', type: 'skill', required: true },
        { name: 'Git', type: 'skill', required: true },
        { name: 'Docker', type: 'skill', required: true },
        { name: 'AWS', type: 'skill', required: true },
        { name: 'System Design', type: 'skill', required: true },
        { name: 'Java', type: 'skill', required: true },
        { name: 'SQL', type: 'skill', required: true }
      ],
      validation: null,
      approval: null
    },

    // Graduate Data Analyst — JIS 58, needs_changes (missing hiring manager,
    // headcount + budget not approved => blockers). A=40, R=20 (all four
    // applicable plausibility warnings fire), M=75/C=70 (partial salary
    // overlap), Q=80, P=0.
    {
      id: 'job_graduate_data_analyst',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'needs_changes',
      employerVerified: true, requisitionId: 'REQ-2205',
      department: 'Analytics',
      vacancies: 1,
      hiringManagerId: null,
      recruiterId: 'u_aisyah',
      targetStartDate: '2026-08-15',
      headcountApproved: false,
      budgetApproved: false,
      justification: 'Pending finance sign-off.',
      title: 'Graduate Data Analyst',
      location: 'Penang',
      workplace: 'onsite',
      employmentType: 'full-time',
      seniority: 'entry',
      salaryMin: 2000,
      salaryMax: 3600,
      salaryVisible: true,
      reportingLine: 'Analytics Team Lead',
      summary: 'Entry role.',
      responsibilities: [
        'Coordinate office supply orders',
        'Organise team building events',
        'Manage the front-desk visitor log'
      ],
      requirements: [
        { name: 'SQL', type: 'skill', required: true },
        { name: 'Excel', type: 'skill', required: true },
        { name: 'Python', type: 'skill', required: true },
        { name: 'Data Visualization', type: 'skill', required: true },
        { name: 'Statistics', type: 'skill', required: true },
        { name: 'Power BI', type: 'skill', required: true },
        { name: 'Tableau', type: 'skill', required: true },
        { name: 'R', type: 'skill', required: true },
        { name: 'SQL', type: 'skill', required: true },
        { name: 'Relevant Experience', type: 'experience', required: true, yearsExperience: 5, justification: '' }
      ],
      validation: null,
      approval: null
    },

    // Product Designer — JIS 93, approved with an approval record. A=100,
    // R=100 (no plausibility warnings), M=75/C=70 (salary slightly above
    // benchmark band), Q=100, P=0.
    {
      id: 'job_product_designer',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-03T11:00:00.000Z',
      status: 'approved',
      employerVerified: true, requisitionId: 'REQ-2210',
      department: 'Design',
      vacancies: 1,
      hiringManagerId: 'u_daniel',
      recruiterId: 'u_aisyah',
      targetStartDate: '2026-08-01',
      headcountApproved: true,
      budgetApproved: true,
      justification: 'Approved backfill, funded through FY26 design budget.',
      title: 'Product Designer',
      location: 'Kuala Lumpur',
      workplace: 'hybrid',
      employmentType: 'full-time',
      seniority: 'senior',
      salaryMin: 8000,
      salaryMax: 10000,
      salaryVisible: true,
      reportingLine: 'Head of Design',
      summary: 'We are looking for a senior product designer to lead end-to-end design for our core consumer app, partnering closely with engineering and research.',
      responsibilities: [
        'Lead end-to-end product design for core app flows',
        'Partner with research to validate design decisions',
        'Mentor junior designers and maintain design systems'
      ],
      requirements: [
        { name: 'Figma', type: 'skill', required: true },
        { name: 'User Research', type: 'skill', required: true },
        { name: 'Prototyping', type: 'skill', required: true },
        { name: 'Design Systems', type: 'skill', required: true },
        { name: 'UX Writing', type: 'skill', required: true },
        { name: 'Accessibility', type: 'skill', required: true }
      ],
      validation: null,
      approval: {
        decision: 'approved',
        approverId: 'u_daniel',
        attestation: true,
        reasonCategory: null,
        comments: 'Confirmed funded and needed — approved.',
        ts: '2026-07-04T09:30:00.000Z'
      }
    },

    // Marketing Intern — blocked. headcountApproved:false per spec (also
    // demonstrates the intern-overexperience warning).
    {
      id: 'job_marketing_intern',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'needs_changes',
      employerVerified: true, requisitionId: 'REQ-2215',
      department: 'Marketing',
      vacancies: 2,
      hiringManagerId: 'u_daniel',
      recruiterId: 'u_aisyah',
      targetStartDate: '2026-08-10',
      headcountApproved: false,
      budgetApproved: true,
      justification: 'Awaiting HR headcount sign-off.',
      title: 'Marketing Intern',
      location: 'Kuala Lumpur',
      workplace: 'onsite',
      employmentType: 'internship',
      seniority: 'intern',
      salaryMin: 800,
      salaryMax: 1200,
      salaryVisible: true,
      reportingLine: 'Marketing Manager',
      summary: 'Support the marketing team with content, social media, and campaign coordination tasks across channels.',
      responsibilities: [
        'Draft social media content calendars',
        'Assist with campaign performance reporting',
        'Support marketing events coordination'
      ],
      requirements: [
        { name: 'Social Media Tools', type: 'skill', required: true },
        { name: 'Communication', type: 'skill', required: true },
        { name: 'Prior Marketing Experience', type: 'experience', required: true, yearsExperience: 3, justification: '' }
      ],
      validation: null,
      approval: null
    },

    // Cybersecurity Specialist — JIS 76, pending_approval. A=100, R=40
    // (entry-overexperience + too-many-skills + duplicate-requirements),
    // M=75/C=40 (salary well above benchmark band, no overlap), Q=60, P=0.
    {
      id: 'job_cybersecurity_specialist',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'pending_approval',
      employerVerified: true, requisitionId: 'REQ-2220',
      department: 'IT Security',
      vacancies: 1,
      hiringManagerId: 'u_daniel',
      recruiterId: 'u_aisyah',
      targetStartDate: '2026-09-15',
      headcountApproved: true,
      budgetApproved: true,
      justification: 'Approved headcount for security team expansion.',
      title: 'Cybersecurity Specialist',
      location: 'Cyberjaya',
      workplace: 'onsite',
      employmentType: 'full-time',
      seniority: 'entry',
      salaryMin: 13000,
      salaryMax: 15000,
      salaryVisible: true,
      reportingLine: null,
      summary: 'Security role.',
      responsibilities: [
        'Monitor security incidents and respond to alerts',
        'Conduct vulnerability assessments across systems',
        'Support the cybersecurity incident response process'
      ],
      requirements: [
        { name: 'SIEM', type: 'skill', required: true },
        { name: 'Penetration Testing', type: 'skill', required: true },
        { name: 'Network Security', type: 'skill', required: true },
        { name: 'ISO 27001', type: 'skill', required: true },
        { name: 'Incident Response', type: 'skill', required: true },
        { name: 'Firewalls', type: 'skill', required: true },
        { name: 'SOC Operations', type: 'skill', required: true },
        { name: 'Threat Intelligence', type: 'skill', required: true },
        { name: 'SIEM', type: 'skill', required: true },
        { name: 'Security Experience', type: 'experience', required: true, yearsExperience: 6, justification: '' }
      ],
      validation: null,
      approval: null
    }
  ];

  // Wizard "Load Demo Draft" prefill — engineered to trigger EXACTLY 3
  // issues: entry seniority + 6yr experience requirement (entry-overexperience),
  // 9 required skills (too-many-skills), short summary (short-description).
  // Zero blockers, and no other warnings (unique skills, salary fully in
  // band, responsibilities match the title).
  const DEMO_DRAFT = {
    id: 'job_backend_engineer_draft',
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-15T09:00:00.000Z',
    status: 'draft',
    employerVerified: true, requisitionId: 'REQ-2299',
    department: 'Engineering',
    vacancies: 1,
    hiringManagerId: 'u_daniel',
    recruiterId: 'u_aisyah',
    targetStartDate: '2026-09-20',
    headcountApproved: true,
    budgetApproved: true,
    justification: 'Demo draft for the wizard walkthrough.',
    title: 'Backend Engineer',
    location: 'Kuala Lumpur',
    workplace: 'hybrid',
    employmentType: 'full-time',
    seniority: 'entry',
    salaryMin: 6000,
    salaryMax: 9000,
    salaryVisible: true,
    reportingLine: 'Engineering Lead',
    summary: 'Build stuff.',
    responsibilities: [
      'Design and build backend services',
      'Maintain APIs and databases',
      'Collaborate with the engineering team on system architecture'
    ],
    requirements: [
      { name: 'Node.js', type: 'skill', required: true },
      { name: 'SQL', type: 'skill', required: true },
      { name: 'REST APIs', type: 'skill', required: true },
      { name: 'Git', type: 'skill', required: true },
      { name: 'Docker', type: 'skill', required: true },
      { name: 'AWS', type: 'skill', required: true },
      { name: 'System Design', type: 'skill', required: true },
      { name: 'Java', type: 'skill', required: true },
      { name: 'TypeScript', type: 'skill', required: true },
      { name: 'Backend Experience', type: 'experience', required: true, yearsExperience: 6, justification: 'Standard for the role' }
    ],
    validation: null,
    approval: null
  };

  const VerifySeeds = { PERSONAS, JOBS, DEMO_DRAFT };

  if (typeof window !== 'undefined') window.VerifySeeds = VerifySeeds;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifySeeds;
})(typeof globalThis !== 'undefined' ? globalThis : this);
