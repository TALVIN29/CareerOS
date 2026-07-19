// Signal Path Verify — demo seed data. Pure data, no dependencies.
// Coherent scenarios exercise the automatic Green, Amber, and Red paths,
// manager-confirmed publication, reconfirmation, and stale automation.

(function (root) {
  const PERSONAS = [
    { id: 'user-recruiter-alicia', name: 'Alicia Tan', role: 'recruiter' },
    { id: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' },
    { id: 'user-admin-mei', name: 'Mei Wong', role: 'hr_admin' }
  ];

  const JOBS = [
    // Green fast path: complete approved requisition, ready to publish directly.
    {
      id: 'job_backend_engineer',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'draft',
      employerVerified: true, requisitionId: 'REQ-2201', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-07-01',
      department: 'Engineering',
      vacancies: 1,
      hiringManagerId: 'user-manager-daniel',
      recruiterId: 'user-recruiter-alicia',
      targetStartDate: '2026-09-01',
      headcountApproved: true,
      budgetApproved: true,
      approvalEvidenceSource: 'Vertex ATS · approved requisition',
      approvalEvidenceDate: '2026-07-01',
      justification: 'Backfill for departing engineer, approved in Q3 planning.',
      title: 'Backend Engineer',
      location: 'Kuala Lumpur',
      workplace: 'hybrid',
      employmentType: 'full-time',
      seniority: 'mid',
      salaryMin: 6000,
      salaryMax: 9000,
      salaryVisible: true,
      reportingLine: 'Engineering Lead',
      summary: 'Build reliable backend services and APIs that support employer verification, candidate trust, and scalable labour-demand products.',
      responsibilities: [
        'Design and build backend services for CareerOS products',
        'Maintain secure APIs, data models, and automated tests',
        'Partner with product and platform engineers on reliable delivery'
      ],
      requirements: [
        { name: 'Node.js', type: 'skill', required: true },
        { name: 'SQL', type: 'skill', required: true },
        { name: 'REST APIs', type: 'skill', required: true },
        { name: 'Git', type: 'skill', required: true },
        { name: 'Docker', type: 'skill', required: true },
        { name: 'AWS', type: 'skill', required: true },
        { name: 'System Design', type: 'skill', required: true },
        { name: 'Backend Experience', type: 'experience', required: true, yearsExperience: 3, justification: 'Mid-level service ownership' }
      ],
      validation: null,
      approval: null
    },

    // Amber quick-fix path: approved role with a few recruiter-resolvable details.
    {
      id: 'job_graduate_data_analyst',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'needs_changes',
      employerVerified: true, requisitionId: 'REQ-2205', approvalEvidenceSource: 'Workforce plan', approvalEvidenceDate: '2026-07-01',
      department: 'Analytics',
      vacancies: 1,
      hiringManagerId: 'user-manager-daniel',
      recruiterId: 'user-recruiter-alicia',
      targetStartDate: '',
      headcountApproved: true,
      budgetApproved: true,
      approvalEvidenceSource: 'Vertex ATS · graduate programme requisition',
      approvalEvidenceDate: '2026-07-01',
      justification: 'Approved graduate intake role.',
      title: 'Graduate Data Analyst',
      location: 'Penang',
      workplace: 'onsite',
      employmentType: 'full-time',
      seniority: 'entry',
      salaryMin: 0,
      salaryMax: 0,
      salaryVisible: true,
      reportingLine: 'Analytics Team Lead',
      summary: 'Support the analytics team by preparing trusted reports, investigating employer trends, and communicating clear findings to internal stakeholders.',
      responsibilities: [
        'Analyse employer and vacancy performance data',
        'Build recurring reports and data-quality checks',
        'Present analysis clearly to product and operations teams'
      ],
      requirements: [
        { name: 'SQL', type: 'skill', required: true },
        { name: 'Excel', type: 'skill', required: true },
        { name: 'Python', type: 'skill', required: true },
        { name: 'Data Visualization', type: 'skill', required: true },
        { name: 'Statistics', type: 'skill', required: true },
        { name: 'Relevant Experience', type: 'experience', required: true, yearsExperience: 4, justification: '' }
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
      employerVerified: true, requisitionId: 'REQ-2210', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-07-01',
      department: 'Design',
      vacancies: 1,
      hiringManagerId: 'user-manager-daniel',
      recruiterId: 'user-recruiter-alicia',
      targetStartDate: '2026-08-01',
      headcountApproved: true,
      budgetApproved: true,
      approvalEvidenceSource: 'Vertex ATS · funded backfill',
      approvalEvidenceDate: '2026-07-03',
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
        approverId: 'user-manager-daniel',
        attestation: true,
        reasonCategory: null,
        comments: 'Confirmed funded and needed — approved.',
        ts: '2026-07-04T09:30:00.000Z'
      }
    },

    // Red accountability path: manager confirmation requested because approved
    // headcount evidence is missing.
    {
      id: 'job_marketing_intern',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'pending_approval',
      employerVerified: true, requisitionId: 'REQ-2215', approvalEvidenceSource: 'ATS draft requisition', approvalEvidenceDate: '2026-07-01',
      department: 'Marketing',
      vacancies: 2,
      hiringManagerId: 'user-manager-daniel',
      recruiterId: 'user-recruiter-alicia',
      targetStartDate: '2026-08-10',
      headcountApproved: false,
      budgetApproved: true,
      approvalEvidenceSource: 'Vertex ATS · provisional internship request',
      approvalEvidenceDate: '2026-07-01',
      submittedAt: '2026-07-02T10:00:00.000Z',
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

    // Additional Amber quick-fix example with unrealistic entry requirements.
    {
      id: 'job_cybersecurity_specialist',
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T10:00:00.000Z',
      status: 'needs_changes',
      employerVerified: true, requisitionId: 'REQ-2220', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-07-01',
      department: 'IT Security',
      vacancies: 1,
      hiringManagerId: 'user-manager-daniel',
      recruiterId: 'user-recruiter-alicia',
      targetStartDate: '2026-09-15',
      headcountApproved: true,
      budgetApproved: true,
      approvalEvidenceSource: 'Vertex ATS · security expansion',
      approvalEvidenceDate: '2026-07-01',
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
    },

    // Connected lifecycle histories used by freshness governance and EIR.
    {
      id: 'job_platform_engineer_active', createdAt: '2026-05-20T08:00:00.000Z', updatedAt: '2026-07-12T08:00:00.000Z', status: 'published',
      organisationId: 'vertex-digital', employerVerified: true, requisitionId: 'REQ-2225', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-05-20', department: 'Engineering', departmentId: 'technology', vacancies: 1,
      hiringManagerId: 'user-manager-daniel', recruiterId: 'user-recruiter-alicia', targetStartDate: '2026-08-01', headcountApproved: true, budgetApproved: true,
      title: 'Software Engineer', location: 'Kuala Lumpur', workplace: 'hybrid', employmentType: 'full-time', seniority: 'mid', salaryMin: 6500, salaryMax: 8500, salaryVisible: true,
      reportingLine: 'Engineering Lead', summary: 'Build reliable platform services for employer and candidate products across the Talentbank network.',
      responsibilities: ['Build software services and APIs', 'Improve automated test coverage', 'Partner with product and platform teams'],
      requirements: [{ name: 'Git', type: 'skill', required: true }, { name: 'SQL', type: 'skill', required: true }, { name: 'Testing', type: 'skill', required: true }],
      submittedAt: '2026-05-21T08:00:00.000Z', publishedAt: '2026-05-23T08:00:00.000Z', lastConfirmedAt: '2026-07-12T08:00:00.000Z', confirmationDueAt: '2026-08-11T08:00:00.000Z',
      confirmations: [{ confirmedAt: '2026-06-12T08:00:00.000Z', dueAt: '2026-06-22T08:00:00.000Z' }, { confirmedAt: '2026-07-12T08:00:00.000Z', dueAt: '2026-07-12T08:00:00.000Z' }],
      validation: null, approval: { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, comments: 'Funded platform role.', ts: '2026-05-22T08:00:00.000Z' }
    },
    {
      id: 'job_operations_confirmation', createdAt: '2026-05-10T08:00:00.000Z', updatedAt: '2026-07-16T08:00:00.000Z', status: 'confirmation_due',
      organisationId: 'vertex-digital', employerVerified: true, requisitionId: 'REQ-2226', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-05-10', department: 'Technology Operations', departmentId: 'technology', vacancies: 1,
      hiringManagerId: 'user-manager-daniel', recruiterId: 'user-recruiter-alicia', targetStartDate: '2026-07-15', headcountApproved: true, budgetApproved: true,
      title: 'Operations Analyst', location: 'Kuala Lumpur', workplace: 'hybrid', employmentType: 'full-time', seniority: 'mid', salaryMin: 5000, salaryMax: 7000, salaryVisible: true,
      reportingLine: 'Operations Director', summary: 'Improve technology operations reporting and service reliability across employer-facing products.',
      responsibilities: ['Analyse operational performance', 'Maintain service dashboards', 'Coordinate improvement actions'],
      requirements: [{ name: 'Excel', type: 'skill', required: true }, { name: 'SQL', type: 'skill', required: true }, { name: 'Data Visualization', type: 'skill', required: true }],
      submittedAt: '2026-05-11T08:00:00.000Z', publishedAt: '2026-05-13T08:00:00.000Z', lastConfirmedAt: '2026-06-13T08:00:00.000Z', confirmationDueAt: '2026-07-13T08:00:00.000Z', confirmations: [{ confirmedAt: '2026-06-13T08:00:00.000Z', dueAt: '2026-06-12T08:00:00.000Z' }],
      validation: null, approval: { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, comments: 'Approved operations vacancy.', ts: '2026-05-12T08:00:00.000Z' }
    },
    {
      id: 'job_ai_product_stale', createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-07-10T08:00:00.000Z', status: 'paused_stale',
      organisationId: 'vertex-digital', employerVerified: true, requisitionId: 'REQ-2227', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-04-01', department: 'Product', departmentId: 'technology', vacancies: 1,
      hiringManagerId: 'user-manager-daniel', recruiterId: 'user-recruiter-alicia', targetStartDate: '2026-06-01', headcountApproved: true, budgetApproved: true,
      title: 'AI Product Manager', location: 'Kuala Lumpur', workplace: 'remote', employmentType: 'full-time', seniority: 'senior', salaryMin: 11000, salaryMax: 15000, salaryVisible: true,
      reportingLine: 'VP Product', summary: 'Lead responsible AI product strategy and measurable employer outcomes across the CareerOS platform.',
      responsibilities: ['Set AI product strategy', 'Define outcome metrics', 'Coordinate data and engineering delivery'],
      requirements: [{ name: 'Product Strategy', type: 'skill', required: true }, { name: 'Data Analysis', type: 'skill', required: true }, { name: 'AI Governance', type: 'skill', required: true }],
      submittedAt: '2026-04-02T08:00:00.000Z', publishedAt: '2026-04-05T08:00:00.000Z', lastConfirmedAt: '2026-05-05T08:00:00.000Z', confirmationDueAt: '2026-06-04T08:00:00.000Z', pausedAt: '2026-06-11T08:00:00.000Z', pausedAutomatically: true, confirmations: [],
      validation: null, approval: { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, comments: 'Approved strategic hire.', ts: '2026-04-04T08:00:00.000Z' }
    },
    {
      id: 'job_support_filled', createdAt: '2026-03-01T08:00:00.000Z', updatedAt: '2026-06-15T08:00:00.000Z', status: 'filled',
      organisationId: 'vertex-digital', employerVerified: true, requisitionId: 'REQ-2228', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-03-01', department: 'Technology', departmentId: 'technology', vacancies: 1,
      hiringManagerId: 'user-manager-daniel', recruiterId: 'user-recruiter-alicia', targetStartDate: '2026-06-15', headcountApproved: true, budgetApproved: true,
      title: 'Technical Support Specialist', location: 'Kuala Lumpur', workplace: 'hybrid', employmentType: 'full-time', seniority: 'entry', salaryMin: 3500, salaryMax: 4800, salaryVisible: true,
      reportingLine: 'Support Manager', summary: 'Support employer customers and improve resolution quality across the CareerOS platform.',
      responsibilities: ['Resolve technical support cases', 'Document recurring issues', 'Partner with engineering on fixes'],
      requirements: [{ name: 'Communication', type: 'skill', required: true }, { name: 'Troubleshooting', type: 'skill', required: true }, { name: 'SQL', type: 'skill', required: false }],
      submittedAt: '2026-03-02T08:00:00.000Z', publishedAt: '2026-03-05T08:00:00.000Z', lastConfirmedAt: '2026-05-05T08:00:00.000Z', confirmationDueAt: '2026-06-04T08:00:00.000Z', filledAt: '2026-06-15T08:00:00.000Z', confirmations: [{ confirmedAt: '2026-05-05T08:00:00.000Z', dueAt: '2026-05-05T08:00:00.000Z' }],
      validation: null, approval: { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, comments: 'Approved support hire.', ts: '2026-03-04T08:00:00.000Z' }
    },
    {
      id: 'job_legacy_closed', createdAt: '2026-02-01T08:00:00.000Z', updatedAt: '2026-05-10T08:00:00.000Z', status: 'closed',
      organisationId: 'vertex-digital', employerVerified: true, requisitionId: 'REQ-2229', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-02-01', department: 'Technology', departmentId: 'technology', vacancies: 1,
      hiringManagerId: 'user-manager-daniel', recruiterId: 'user-recruiter-alicia', targetStartDate: '2026-05-01', headcountApproved: true, budgetApproved: true,
      title: 'Data Analyst', location: 'Kuala Lumpur', workplace: 'hybrid', employmentType: 'full-time', seniority: 'mid', salaryMin: 4500, salaryMax: 6000, salaryVisible: true,
      reportingLine: 'Analytics Lead', summary: 'Analyse employer performance and build trusted labour-demand reporting for Talentbank partners.',
      responsibilities: ['Analyse labour-demand data', 'Build verified reporting', 'Present findings to stakeholders'],
      requirements: [{ name: 'SQL', type: 'skill', required: true }, { name: 'Python', type: 'skill', required: true }, { name: 'Statistics', type: 'skill', required: true }],
      submittedAt: '2026-02-02T08:00:00.000Z', publishedAt: '2026-02-06T08:00:00.000Z', lastConfirmedAt: '2026-03-06T08:00:00.000Z', confirmationDueAt: '2026-04-05T08:00:00.000Z', closedAt: '2026-05-10T08:00:00.000Z', confirmations: [],
      validation: null, approval: { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, comments: 'Approved analytics role.', ts: '2026-02-05T08:00:00.000Z' }
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
    employerVerified: true, requisitionId: 'REQ-2299', approvalEvidenceSource: 'ATS requisition record', approvalEvidenceDate: '2026-07-15',
    department: 'Engineering',
    vacancies: 1,
    hiringManagerId: 'user-manager-daniel',
    recruiterId: 'user-recruiter-alicia',
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

  const DEMO_DRAFTS = {
    green: {
      ...DEMO_DRAFT, id: 'demo_green_backend', status: 'draft', validation: null, approval: null,
      createdAt: '2026-07-17T08:00:00.000Z', updatedAt: '2026-07-17T08:00:00.000Z',
      title: 'Backend Engineer', seniority: 'mid',
      summary: 'Build reliable backend services and APIs for employer products, improving performance, observability, and delivery quality across the CareerOS platform.',
      responsibilities: ['Build backend services and APIs', 'Improve service reliability and automated testing', 'Collaborate with product and platform engineers'],
      requirements: [
        { name: 'Node.js', type: 'skill', required: true },
        { name: 'SQL', type: 'skill', required: true },
        { name: 'REST APIs', type: 'skill', required: true },
        { name: 'Git', type: 'skill', required: true },
        { name: 'Backend Experience', type: 'experience', required: true, yearsExperience: 3, justification: 'Needed for independent service ownership' }
      ]
    },
    amber: DEMO_DRAFT,
    red: {
      ...DEMO_DRAFT,
      id: 'demo_red_marketing', status: 'draft', validation: null, approval: null,
      title: 'Marketing Intern', department: 'Marketing', seniority: 'intern', employmentType: 'internship',
      salaryMin: 1200, salaryMax: 1800, targetStartDate: '2026-09-01', headcountApproved: false,
      approvalEvidenceSource: 'Vertex ATS · provisional request', approvalEvidenceDate: '2026-07-17',
      summary: 'Support campaign delivery, content production, and performance reporting while learning from the regional marketing team.',
      responsibilities: ['Support marketing campaign delivery', 'Prepare content and performance reports', 'Coordinate campaign assets with the marketing team'],
      requirements: [{ name: 'Communication', type: 'skill', required: true }, { name: 'Canva', type: 'skill', required: true }]
    }
  };

  const PEER_ORGS = [
    { id: 'vertex-digital', perceptionScore: 78, name: 'Vertex Digital', jobs: JOBS },
    { id: 'meridian-labs', perceptionScore: 80, name: 'Meridian Labs', jobs: [
      { id: 'ml-1', status: 'published', employerVerified: true, publishedAt: '2026-05-01', submittedAt: '2026-04-27', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-04-28' }, requirements: [{ name: 'SQL', type: 'skill', required: true }, { name: 'Python', type: 'skill', required: true }] },
      { id: 'ml-2', status: 'filled', employerVerified: true, publishedAt: '2026-03-01', submittedAt: '2026-02-25', filledAt: '2026-06-01', approval: { ts: '2026-02-27' }, requirements: [{ name: 'Data Visualization', type: 'skill', required: true }] },
      { id: 'ml-3', status: 'published', employerVerified: true, publishedAt: '2026-06-01', submittedAt: '2026-05-28', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-05-29' }, requirements: [{ name: 'AI Governance', type: 'skill', required: true }] },
      { id: 'ml-4', status: 'closed', employerVerified: true, publishedAt: '2026-02-01', submittedAt: '2026-01-27', closedAt: '2026-05-01', approval: { ts: '2026-01-30' }, requirements: [{ name: 'Python', type: 'skill', required: true }] }
    ] },
    { id: 'northstar-tech', perceptionScore: 94, name: 'Northstar Tech', jobs: [
      { id: 'nt-1', status: 'published', employerVerified: true, publishedAt: '2026-05-01', submittedAt: '2026-04-20', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-04-26' }, requirements: [{ name: 'Node.js', type: 'skill', required: true }, { name: 'SQL', type: 'skill', required: true }] },
      { id: 'nt-2', status: 'paused_stale', employerVerified: true, publishedAt: '2026-03-01', submittedAt: '2026-02-20', confirmationDueAt: '2026-05-01', approval: { ts: '2026-02-28' }, requirements: [{ name: 'React', type: 'skill', required: true }] },
      { id: 'nt-3', status: 'closed', employerVerified: true, publishedAt: '2026-02-01', submittedAt: '2026-01-20', closedAt: '2026-04-01', approval: { ts: '2026-01-30' }, requirements: [{ name: 'Cloud Security', type: 'skill', required: true }] }
    ] },
    { id: 'apex-commerce', perceptionScore: 72, name: 'Apex Commerce', jobs: [
      { id: 'ac-1', status: 'published', employerVerified: true, publishedAt: '2026-06-01', submittedAt: '2026-05-30', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-05-31' }, requirements: [{ name: 'Product Strategy', type: 'skill', required: true }] },
      { id: 'ac-2', status: 'filled', employerVerified: true, publishedAt: '2026-03-01', submittedAt: '2026-02-26', filledAt: '2026-06-01', approval: { ts: '2026-02-28' }, requirements: [{ name: 'Figma', type: 'skill', required: true }] },
      { id: 'ac-3', status: 'published', employerVerified: true, publishedAt: '2026-05-15', submittedAt: '2026-05-10', confirmationDueAt: '2026-08-15', lastConfirmedAt: '2026-07-15', approval: { ts: '2026-05-12' }, requirements: [{ name: 'SQL', type: 'skill', required: true }] }
    ] },
    { id: 'cobalt-systems', perceptionScore: 88, name: 'Cobalt Systems', jobs: [
      { id: 'cs-1', status: 'paused_stale', employerVerified: true, publishedAt: '2026-03-01', submittedAt: '2026-02-20', confirmationDueAt: '2026-04-01', approval: { ts: '2026-02-28' }, requirements: [{ name: 'Node.js', type: 'skill', required: true }] },
      { id: 'cs-2', status: 'closed', employerVerified: true, publishedAt: '2026-02-01', submittedAt: '2026-01-20', closedAt: '2026-04-01', approval: { ts: '2026-01-31' }, requirements: [{ name: 'Python', type: 'skill', required: true }] },
      { id: 'cs-3', status: 'published', employerVerified: false, publishedAt: '2026-06-01', submittedAt: '2026-05-20', confirmationDueAt: '2026-07-01', approval: { ts: '2026-05-30' }, requirements: [{ name: 'AI Governance', type: 'skill', required: true }] }
    ] },
    { id: 'harbour-analytics', perceptionScore: 68, name: 'Harbour Analytics', jobs: [
      { id: 'ha-1', status: 'published', employerVerified: true, publishedAt: '2026-06-01', submittedAt: '2026-05-29', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-05-30' }, requirements: [{ name: 'SQL', type: 'skill', required: true }, { name: 'Statistics', type: 'skill', required: true }] },
      { id: 'ha-2', status: 'filled', employerVerified: true, publishedAt: '2026-03-01', submittedAt: '2026-02-27', filledAt: '2026-06-01', approval: { ts: '2026-02-28' }, requirements: [{ name: 'Data Visualization', type: 'skill', required: true }] },
      { id: 'ha-3', status: 'published', employerVerified: true, publishedAt: '2026-05-01', submittedAt: '2026-04-28', confirmationDueAt: '2026-08-01', lastConfirmedAt: '2026-07-01', approval: { ts: '2026-04-29' }, requirements: [{ name: 'Python', type: 'skill', required: true }] }
    ] }
  ];

  // --- Historical outcome corpus ---------------------------------------------
  // GENERATED DEMONSTRATION DATA. These are not real requisitions and none of
  // these hires happened. The deliverable is the method and the pipeline; this
  // corpus exists only so the survival curves have enough rows to separate.
  // Replace wholesale with real requisitions once postings flow through the rail.
  //
  // Generative rule, stated so the shape of the result is never mistaken for a
  // finding:
  //   1. Time-to-fill rises with the number of required skills and with years
  //      of experience demanded.
  //   2. Abandonment risk rises with the same two factors and only bites after
  //      roughly 45 days on the board.
  //   3. A third of requisitions have one to three "hype" skills bolted on
  //      regardless of the role. Each one over-specifies the requisition, so it
  //      pushes the same two hazards up. This is what makes a skill advertised
  //      often and hired rarely - phantom demand is a by-product of the rule,
  //      not a number typed in by hand.
  const HISTORY_SEED = 20260719;
  const HISTORY_WINDOW_DAYS = 540;
  const HISTORY_END = new Date('2026-07-19T00:00:00.000Z').getTime();
  const UNIVERSITIES = ['Universiti Malaya', 'Universiti Teknologi Malaysia', 'Universiti Kebangsaan Malaysia', 'Taylor’s University', 'Sunway University', 'Universiti Sains Malaysia', 'APU', 'Multimedia University'];
  const HISTORY_ROLES = [
    { title: 'Backend Engineer', seniority: 'mid', skills: ['Node.js', 'SQL', 'REST APIs', 'Git', 'Docker', 'AWS', 'System Design', 'Kubernetes', 'GraphQL', 'Terraform'] },
    { title: 'Data Analyst', seniority: 'entry', skills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics', 'Power BI', 'dbt', 'Machine Learning'] },
    { title: 'Product Designer', seniority: 'mid', skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Accessibility', 'Motion Design', 'Design Ops', 'Front-end Basics', 'Service Design'] },
    { title: 'Cybersecurity Specialist', seniority: 'senior', skills: ['SIEM', 'Network Security', 'ISO 27001', 'Incident Response', 'Cloud Security', 'AI Governance', 'Threat Modelling', 'Zero Trust', 'Kubernetes'] },
    { title: 'Software Engineer', seniority: 'mid', skills: ['Git', 'SQL', 'System Design', 'Testing', 'React', 'TypeScript', 'Kubernetes', 'AI Governance', 'GraphQL', 'Terraform'] },
    { title: 'Sales Executive', seniority: 'entry', skills: ['CRM', 'Negotiation', 'Lead Generation', 'Communication', 'Account Planning', 'Forecasting', 'Salesforce', 'Bid Writing'] }
  ];
  const HISTORY_LOCATIONS = ['Kuala Lumpur', 'Penang', 'Johor Bahru'];
  // Fashionable requirements that get attached to requisitions of any shape.
  const HYPE_SKILLS = ['AI Governance', 'Machine Learning', 'MLOps', 'Prompt Engineering', 'Blockchain', 'Generative AI'];

  function generateHistory(orgId, count, bias, seed) {
    // Deterministic LCG so every run, browser and test produces the same corpus.
    let state = seed >>> 0;
    const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
    const pick = list => list[Math.floor(rand() * list.length)];
    const iso = ms => new Date(ms).toISOString();
    const jobs = [];
    for (let index = 0; index < count; index += 1) {
      const role = pick(HISTORY_ROLES);
      const skillCount = 4 + Math.floor(rand() * (role.skills.length - 3));
      const years = Math.floor(rand() * 10);
      const publishedAt = HISTORY_END - Math.floor(rand() * HISTORY_WINDOW_DAYS) * 86400000;
      const ageDays = Math.round((HISTORY_END - publishedAt) / 86400000);
      const hypeCount = rand() < 0.35 ? 1 + Math.floor(rand() * 3) : 0;
      const hypeOffset = Math.floor(rand() * HYPE_SKILLS.length);
      const hype = Array.from({ length: hypeCount }, (unused, slot) => HYPE_SKILLS[(hypeOffset + slot) % HYPE_SKILLS.length]);
      const strain = Math.max(0, skillCount - 4) + Math.max(0, years - 3) + hype.length * 1.6;
      const fillDays = Math.round((16 + strain * 5) * (0.6 + rand() * 0.9));
      const abandonRisk = Math.min(0.78, 0.08 + strain * 0.055 + bias);
      const requirements = [...role.skills.slice(0, skillCount), ...hype].map(name => ({ name, type: 'skill', required: true }));
      if (years > 0) requirements.push({ type: 'experience', required: true, yearsExperience: years, justification: 'Seeded historical requisition' });
      const job = {
        id: `${orgId}-h${index}`, employerVerified: true, title: role.title, seniority: role.seniority,
        location: pick(HISTORY_LOCATIONS), requirements, publishedAt: iso(publishedAt),
        submittedAt: iso(publishedAt - 4 * 86400000), approval: { ts: iso(publishedAt - 2 * 86400000) }, generated: true
      };
      const abandonDay = 45 + Math.floor(rand() * 40);
      if (rand() < abandonRisk && ageDays > abandonDay) {
        jobs.push({ ...job, status: 'paused_stale', pausedAt: iso(publishedAt + abandonDay * 86400000) });
      } else if (fillDays <= ageDays) {
        jobs.push({ ...job, status: 'filled', filledAt: iso(publishedAt + fillDays * 86400000), hireUniversity: pick(UNIVERSITIES) });
      } else {
        jobs.push({ ...job, status: 'published', confirmationDueAt: iso(HISTORY_END + 20 * 86400000), lastConfirmedAt: iso(HISTORY_END - 5 * 86400000) });
      }
    }
    return jobs;
  }

  // Vertex carries the largest history because the recruiter's autopsy reads
  // from it; peers carry enough to make the rating leaderboard non-degenerate.
  const HISTORY = {
    'vertex-digital': generateHistory('vertex-digital', 260, 0.00, HISTORY_SEED),
    'meridian-labs': generateHistory('meridian-labs', 70, 0.04, HISTORY_SEED + 7),
    'northstar-tech': generateHistory('northstar-tech', 64, 0.12, HISTORY_SEED + 13),
    'apex-commerce': generateHistory('apex-commerce', 58, 0.02, HISTORY_SEED + 29),
    'cobalt-systems': generateHistory('cobalt-systems', 54, 0.18, HISTORY_SEED + 41),
    'harbour-analytics': generateHistory('harbour-analytics', 60, 0.01, HISTORY_SEED + 53)
  };
  PEER_ORGS.forEach(org => { org.history = HISTORY[org.id] || []; });
  // The national corpus the Realised Demand Index reads from.
  const DEMAND_CORPUS = PEER_ORGS.flatMap(org => org.history);

  const VerifySeeds = { PERSONAS, JOBS, DEMO_DRAFT, DEMO_DRAFTS, PEER_ORGS, HISTORY, DEMAND_CORPUS, UNIVERSITIES };

  if (typeof window !== 'undefined') window.VerifySeeds = VerifySeeds;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifySeeds;
})(typeof globalThis !== 'undefined' ? globalThis : this);
