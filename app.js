function app() {
  const { DEMO_USERS, NAVIGATION, hasPermission, canAccessRoute, canAccessJob, canUser } = globalThis.CareerOSAuth;
  const day = 86400000;
  const now = () => new Date();
  const isoDays = (days) => new Date(Date.now() + days * day).toISOString();
  const uid = (prefix = 'job') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const recruiter = DEMO_USERS.find((user) => user.role === 'recruiter');
  const manager = DEMO_USERS.find((user) => user.role === 'hiring_manager');

  const makeJob = (data) => ({
    id: data.id,
    title: data.title,
    department: data.department || 'Technology',
    departmentId: data.departmentId || 'technology',
    createdByUserId: data.createdByUserId || recruiter.userId,
    recruiterId: data.recruiterId || recruiter.userId,
    recruiter: data.recruiter || recruiter.name,
    assignedManagerId: data.assignedManagerId || manager.userId,
    hiringManager: data.hiringManager || manager.name,
    requisitionId: data.requisitionId || `REQ-2026-${data.id.toUpperCase()}`,
    headcountApproved: data.headcountApproved ?? true,
    budgetApproved: data.budgetApproved ?? true,
    employerVerified: true,
    location: data.location || 'Kuala Lumpur, Malaysia',
    workplace: data.workplace || 'Hybrid',
    employmentType: data.employmentType || 'Full-time',
    seniority: data.seniority || 'Mid level',
    salaryMin: data.salaryMin || 72000,
    salaryMax: data.salaryMax || 98000,
    currency: 'MYR',
    salaryVisible: data.salaryVisible ?? true,
    summary: data.summary || `Join Vertex Digital as a ${data.title} and deliver measurable outcomes with the Technology team.`,
    responsibilities: data.responsibilities || 'Partner with cross-functional teams, deliver measurable outcomes, document decisions, and improve the reliability of our customer-facing services.',
    requirements: data.requirements || [{ name: 'Stakeholder communication', type: 'Soft skill', required: true, years: 2, justification: 'Cross-functional delivery' }],
    status: data.status,
    validationScore: data.validationScore ?? data.score ?? 86,
    score: data.validationScore ?? data.score ?? 86,
    validationWarnings: data.validationWarnings || data.warnings || [],
    warnings: data.validationWarnings || data.warnings || [],
    blockers: data.blockers || [],
    passed: data.passed || ['Assigned manager confirmed', 'Headcount and budget approved'],
    recruiterExplanations: data.recruiterExplanations || [],
    comments: data.comments || [],
    managerDecision: data.managerDecision || null,
    submittedAt: data.submittedAt || null,
    approvalTimestamp: data.approvalTimestamp || null,
    approvedAt: data.approvalTimestamp || null,
    publishedTimestamp: data.publishedTimestamp || null,
    publishedAt: data.publishedTimestamp || null,
    confirmationDueDate: data.confirmationDueDate || null,
    confirmationDueAt: data.confirmationDueDate || null,
    lastConfirmedAt: data.lastConfirmedAt || null,
    freshnessStatus: data.freshnessStatus || 'Not published',
    confirmationHistory: data.confirmationHistory || [],
    ...data,
  });

  const initialJobs = [
    makeJob({ id: 'marketing-intern', title: 'Marketing Intern', department: 'Technology', status: 'Draft', requisitionId: '', headcountApproved: false, budgetApproved: false, assignedManagerId: manager.userId, hiringManager: manager.name, location: '', seniority: 'Internship', salaryMin: 0, salaryMax: 0, salaryVisible: false, score: 28, blockers: ['Requisition ID is missing.', 'Headcount approval is required.', 'Budget approval is required.'], warnings: ['Responsibilities need clearer outcomes.', 'Internship experience requirement is unrealistic.'], requirements: [{ name: 'Campaign analytics', type: 'Technical', required: true, years: 4, justification: '' }] }),
    makeJob({ id: 'graduate-analyst', title: 'Graduate Data Analyst', status: 'Needs Changes', score: 58, warnings: ['Entry-level role requests excessive experience.'], recruiterExplanations: ['SQL is required, but the experience threshold will be reduced.'], comments: [{ by: manager.name, userId: manager.userId, at: isoDays(-2), text: 'Reduce the required years and clarify which dashboard outcomes matter.' }], requirements: [{ name: 'SQL', type: 'Technical', required: true, years: 7, justification: 'Reporting ownership' }, { name: 'Python', type: 'Technical', required: false, years: 1, justification: 'Automation' }] }),
    makeJob({ id: 'product-designer', title: 'Product Designer', status: 'Pending Approval', submittedAt: isoDays(-1), score: 87, recruiterExplanations: ['The salary band follows the current Technology hiring framework.'], requirements: [{ name: 'Figma', type: 'Technical', required: true, years: 3, justification: 'Design workflow' }, { name: 'Product discovery', type: 'Technical', required: true, years: 2, justification: 'Core role scope' }] }),
    makeJob({ id: 'cybersecurity', title: 'Cybersecurity Specialist', status: 'Approved', score: 91, approvalTimestamp: isoDays(-1), managerDecision: { managerUserId: manager.userId, managerName: manager.name, decision: 'Approved', timestamp: isoDays(-1), attestation: true, comment: 'Approved for publication.' }, requirements: [{ name: 'Cloud security', type: 'Technical', required: true, years: 5, justification: 'Core scope' }] }),
    makeJob({ id: 'backend', title: 'Backend Engineer', status: 'Published', score: 92, publishedTimestamp: isoDays(-8), lastConfirmedAt: isoDays(-8), confirmationDueDate: isoDays(22), freshnessStatus: 'Active and Confirmed', requirements: [{ name: 'Node.js', type: 'Technical', required: true, years: 3, justification: 'Core API stack' }, { name: 'SQL', type: 'Technical', required: true, years: 3, justification: 'Data services' }] }),
    makeJob({ id: 'operations', title: 'Operations Executive', status: 'Confirmation Due', score: 90, publishedTimestamp: isoDays(-31), lastConfirmedAt: isoDays(-31), confirmationDueDate: isoDays(-1), freshnessStatus: 'Confirmation Due' }),
    makeJob({ id: 'ai-product', title: 'AI Product Manager', status: 'Paused as Stale', score: 89, publishedTimestamp: isoDays(-42), lastConfirmedAt: isoDays(-42), confirmationDueDate: isoDays(-12), freshnessStatus: 'Paused as Stale', pausedAt: isoDays(-5), requirements: [{ name: 'Product strategy', type: 'Technical', required: true, years: 5, justification: 'Leadership scope' }] }),
    makeJob({ id: 'platform-filled', title: 'Platform Engineer', status: 'Position Filled', score: 88, publishedTimestamp: isoDays(-48), approvalTimestamp: isoDays(-51), filledAt: isoDays(-3), freshnessStatus: 'Position Filled' }),
  ];

  const initialAudit = [
    { id: 'audit-filled', at: isoDays(-3), actorId: manager.userId, actor: manager.name, actorRole: manager.roleLabel, action: 'Job marked filled', jobId: 'platform-filled', job: 'Platform Engineer', from: 'Published', to: 'Position Filled', comment: 'Candidate accepted the offer.' },
    { id: 'audit-paused', at: isoDays(-5), actorId: 'system', actor: 'CareerOS Policy Engine', actorRole: 'System', action: 'Vacancy automatically paused', jobId: 'ai-product', job: 'AI Product Manager', from: 'Confirmation Due', to: 'Paused as Stale', comment: 'No active-hiring confirmation within the grace period.' },
    { id: 'audit-approved', at: isoDays(-1), actorId: manager.userId, actor: manager.name, actorRole: manager.roleLabel, action: 'Manager approval recorded', jobId: 'cybersecurity', job: 'Cybersecurity Specialist', from: 'Pending Approval', to: 'Approved', comment: 'Approved, funded, and intended to be filled.' },
    { id: 'audit-submitted', at: isoDays(-1), actorId: recruiter.userId, actor: recruiter.name, actorRole: recruiter.roleLabel, action: 'Submitted for Manager Approval', jobId: 'product-designer', job: 'Product Designer', from: 'Ready to Submit', to: 'Pending Approval', comment: `Submitted to ${manager.name}.` },
    { id: 'audit-returned', at: isoDays(-2), actorId: manager.userId, actor: manager.name, actorRole: manager.roleLabel, action: 'Changes requested', jobId: 'graduate-analyst', job: 'Graduate Data Analyst', from: 'Pending Approval', to: 'Needs Changes', comment: 'Reduce the required years and clarify dashboard outcomes.' },
  ];

  const defaultDraft = () => makeJob({
    id: '', title: '', status: 'Draft', requisitionId: '', headcountApproved: false, budgetApproved: false,
    location: 'Kuala Lumpur, Malaysia', seniority: 'Entry level', salaryMin: '', salaryMax: '', score: 0,
    summary: '', responsibilities: '', warnings: [], blockers: [], passed: [],
    requirements: [{ name: '', type: 'Technical', required: true, years: 0, justification: '' }],
  });

  const load = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  };
  const savedSession = load('careeros-session', null);
  const savedState = load('careeros-role-workspace', null);
  const sessionUser = (user) => {
    const { password, ...safeUser } = user;
    return clone(safeUser);
  };

  return {
    screen: savedSession ? 'employer' : 'home',
    currentUser: savedSession,
    workspacePage: 'overview',
    mobileMenuOpen: false,
    jobs: savedState?.jobs || initialJobs,
    audit: savedState?.audit || initialAudit,
    policy: savedState?.policy || { confirmationDays: 30, graceDays: 7, approvalSlaDays: 3, minimumValidationScore: 60 },
    draft: defaultDraft(),
    wizardStep: 1,
    activeJobId: null,
    candidatePreviewJobId: null,
    freshnessJobId: null,
    validationRan: false,
    managerAttests: false,
    toast: '',
    loginEmail: 'recruiter@careeros.demo',
    loginPassword: 'demo123',
    authError: '',

    init() {
      if (this.currentUser) {
        const storedUser = DEMO_USERS.find((user) => user.userId === this.currentUser.userId);
        this.currentUser = storedUser ? sessionUser(storedUser) : null;
        if (!this.currentUser) this.signOut();
      }
      const requested = location.hash.match(/^#\/workspace\/([a-z-]+)$/)?.[1];
      if (this.currentUser && requested) this.setPage(requested, false);
      else if (!this.currentUser && requested) {
        this.screen = 'login';
        this.notify('Sign in to access the Employer Workspace.');
      }
      window.addEventListener('hashchange', () => {
        const route = location.hash.match(/^#\/workspace\/([a-z-]+)$/)?.[1];
        if (route) this.setPage(route, false);
      });
      this.persist();
    },

    persist() {
      localStorage.setItem('careeros-role-workspace', JSON.stringify({ jobs: this.jobs, audit: this.audit, policy: this.policy }));
      if (this.currentUser) localStorage.setItem('careeros-session', JSON.stringify(this.currentUser));
    },

    navigate(screen) {
      if (screen === 'employer' && !this.currentUser) screen = 'login';
      this.screen = screen;
      this.mobileMenuOpen = false;
      if (screen !== 'employer') history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    chooseDemo(user) {
      this.loginEmail = user.email;
      this.loginPassword = user.password;
      this.authError = '';
    },

    login() {
      const user = DEMO_USERS.find((candidate) => candidate.email.toLowerCase() === this.loginEmail.trim().toLowerCase() && candidate.password === this.loginPassword);
      if (!user) {
        this.authError = 'Those demonstration credentials do not match. Choose a demo account below or try again.';
        return;
      }
      this.currentUser = sessionUser(user);
      this.authError = '';
      this.screen = 'employer';
      this.workspacePage = 'overview';
      this.persist();
      history.replaceState(null, '', '#/workspace/overview');
      this.notify(`Signed in as ${user.name}.`);
    },

    signOut() {
      localStorage.removeItem('careeros-session');
      this.currentUser = null;
      this.screen = 'login';
      this.workspacePage = 'overview';
      this.activeJobId = null;
      this.loginEmail = 'recruiter@careeros.demo';
      this.loginPassword = 'demo123';
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    navItems() { return this.currentUser ? NAVIGATION[this.currentUser.role] : []; },
    has(permission) { return hasPermission(this.currentUser, permission); },
    can(action, job = null) { return canUser(this.currentUser, action, job); },

    setPage(page, updateHash = true) {
      if (!this.currentUser) {
        this.screen = 'login';
        this.notify('Sign in to access the Employer Workspace.');
        return;
      }
      if (!canAccessRoute(this.currentUser, page)) {
        this.workspacePage = 'overview';
        this.notify('You do not have permission to access that area.');
        history.replaceState(null, '', '#/workspace/overview');
        return;
      }
      this.workspacePage = page;
      this.activeJobId = null;
      this.candidatePreviewJobId = null;
      this.freshnessJobId = null;
      if (updateHash) history.replaceState(null, '', `#/workspace/${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    notify(message) {
      this.toast = message;
      setTimeout(() => { this.toast = ''; }, 3200);
    },

    addAudit(action, job, from = '', to = '', comment = '') {
      const actor = this.currentUser || { userId: 'system', name: 'CareerOS Policy Engine', roleLabel: 'System' };
      this.audit.unshift({ id: uid('audit'), at: now().toISOString(), actorId: actor.userId, actor: actor.name, actorRole: actor.roleLabel, action, jobId: job?.id || '', job: job?.title || 'Workspace', from, to, comment });
      this.persist();
    },

    visibleJobs() { return this.jobs.filter((job) => canAccessJob(this.currentUser, job)); },
    approvalJobs() {
      const statuses = ['Pending Approval', 'Needs Changes', 'Approved', 'Rejected'];
      return this.visibleJobs().filter((job) => statuses.includes(job.status));
    },
    scopedAudit() {
      if (this.currentUser?.role === 'hr_admin') return this.audit;
      const ids = new Set(this.visibleJobs().map((job) => job.id));
      return this.audit.filter((event) => ids.has(event.jobId));
    },
    job(id) { return this.jobs.find((item) => item.id === id); },
    counts(source = this.visibleJobs()) {
      return source.reduce((result, job) => { result[job.status] = (result[job.status] || 0) + 1; return result; }, {});
    },

    overviewCards() {
      const counts = this.counts();
      if (this.currentUser.role === 'recruiter') return [
        ['My Drafts', counts.Draft || 0], ['Needs Changes', counts['Needs Changes'] || 0], ['Validation Warnings', this.visibleJobs().reduce((sum, job) => sum + job.warnings.length, 0)], ['Awaiting Manager Approval', counts['Pending Approval'] || 0], ['Approved — Ready to Publish', counts.Approved || 0], ['Published Jobs', counts.Published || 0],
      ];
      if (this.currentUser.role === 'hiring_manager') return [
        ['Awaiting My Approval', counts['Pending Approval'] || 0], ['Changes Requested', counts['Needs Changes'] || 0], ['Confirmation Due', counts['Confirmation Due'] || 0], ['Active Team Vacancies', counts.Published || 0], ['Stale Vacancy Risk', counts['Paused as Stale'] || 0],
      ];
      const all = this.counts(this.jobs);
      return [
        ['Total Active Vacancies', (all.Published || 0) + (all['Confirmation Due'] || 0)], ['Overdue Approvals', this.jobs.filter((job) => job.status === 'Pending Approval' && this.daysAgo(job.submittedAt) > this.policy.approvalSlaDays).length], ['Stale Vacancies', all['Paused as Stale'] || 0], ['Policy Warnings', this.jobs.reduce((sum, job) => sum + job.warnings.length + job.blockers.length, 0)], ['Recent Overrides', this.audit.filter((event) => event.action.includes('Administrator')).length], ['Average Approval Time', '1.8d'],
      ];
    },

    dashboardCopy() {
      if (this.currentUser.role === 'recruiter') return { title: 'Prepare accurate vacancies and keep every submission moving.', action: 'Create Job' };
      if (this.currentUser.role === 'hiring_manager') return { title: 'Review the vacancies that require your decision.', action: 'Review Approval Queue' };
      return { title: 'Protect hiring integrity across the organisation.', action: 'Review Governance Alerts' };
    },

    actionJobs() {
      if (this.currentUser.role === 'recruiter') return this.visibleJobs().filter((job) => ['Needs Changes', 'Approved', 'Draft'].includes(job.status));
      if (this.currentUser.role === 'hiring_manager') return this.visibleJobs().filter((job) => ['Pending Approval', 'Confirmation Due', 'Paused as Stale'].includes(job.status));
      return this.jobs.filter((job) => job.blockers.length || job.warnings.length || ['Pending Approval', 'Confirmation Due', 'Paused as Stale'].includes(job.status));
    },

    nextAction(job) {
      if (this.currentUser.role === 'hr_admin') {
        if (job.blockers.length) return 'Review policy blockers';
        if (job.warnings.length) return 'Review validation warnings';
        if (job.status === 'Pending Approval') return 'Review approval delay';
        if (job.status === 'Confirmation Due') return 'Review confirmation risk';
        if (job.status === 'Paused as Stale') return 'Review stale-vacancy event';
      }
      if (job.status === 'Needs Changes') return 'Resolve manager feedback';
      if (job.status === 'Approved') return 'Publish approved vacancy';
      if (job.status === 'Draft') return 'Run Automated Validation';
      if (job.status === 'Pending Approval') return 'Review submission';
      if (job.status === 'Confirmation Due') return 'Confirm active hiring';
      if (job.status === 'Paused as Stale') return 'Review stale vacancy';
      return 'Review job';
    },

    openAction(job) {
      if (this.currentUser.role === 'hr_admin') return this.setPage('listings');
      if (this.currentUser.role === 'recruiter' && ['Draft', 'Needs Changes'].includes(job.status)) return this.startJob(job);
      if (job.status === 'Approved' && this.can('publish_approved_job', job)) return this.setPage('listings');
      if (job.status === 'Pending Approval') { this.setPage('approvals'); this.activeJobId = job.id; return; }
      if (['Confirmation Due', 'Paused as Stale'].includes(job.status)) { this.setPage('listings'); this.freshnessJobId = job.id; return; }
      this.setPage('listings');
    },

    statusClass(status) { return ({ Draft: 'status-slate', 'Needs Changes': 'status-amber', 'Pending Approval': 'status-blue', Approved: 'status-green', Published: 'status-green', 'Confirmation Due': 'status-amber', 'Paused as Stale': 'status-red', Rejected: 'status-red', 'Position Filled': 'status-slate', Closed: 'status-slate' })[status] || 'status-slate'; },
    scoreClass(score) { return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-300' : 'text-red-400'; },
    formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not recorded'; },
    formatDateTime(value) { return value ? new Date(value).toLocaleString() : 'Not recorded'; },
    daysAgo(value) { return value ? Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / day)) : 0; },

    startJob(job = null) {
      if (!this.has('create_job')) return this.notify('You do not have permission to create jobs.');
      if (job && !this.can('edit_own_job', job)) return this.notify('This job cannot be edited in its current state.');
      this.draft = job ? clone(job) : defaultDraft();
      this.draft.recruiterId = this.currentUser.userId;
      this.draft.createdByUserId ||= this.currentUser.userId;
      this.draft.recruiter = this.currentUser.name;
      this.draft.assignedManagerId ||= manager.userId;
      this.draft.hiringManager ||= manager.name;
      this.wizardStep = 1;
      this.validationRan = false;
      this.setPage('create');
    },

    addRequirement() { this.draft.requirements.push({ name: '', type: 'Technical', required: true, years: 0, justification: '' }); },
    removeRequirement(index) { this.draft.requirements.splice(index, 1); },

    validate(job = this.draft) {
      if (!this.can('run_validation', job)) return this.notify('You do not have permission to run Automated Validation.');
      const blockers = [], warnings = [], passed = [];
      if (!job.assignedManagerId) blockers.push('Assigned Hiring Manager is missing.'); else passed.push('Assigned Hiring Manager confirmed');
      if (!job.requisitionId) blockers.push('Requisition ID is missing.'); else passed.push('Requisition ID is present');
      if (!job.headcountApproved) blockers.push('Headcount approval is required.'); else passed.push('Headcount is approved');
      if (!job.budgetApproved) blockers.push('Budget approval is required.'); else passed.push('Budget is approved');
      if (!job.location) warnings.push('Location is missing.');
      if (!job.responsibilities || job.responsibilities.length < 55) warnings.push('Responsibilities are short or vague.');
      if (!job.salaryVisible) warnings.push('Salary is hidden from candidates.');
      const required = job.requirements.filter((requirement) => requirement.required);
      if (required.length > 8) warnings.push('Too many skills are marked required.');
      if (['Entry level', 'Internship'].includes(job.seniority) && required.some((requirement) => Number(requirement.years) > 3)) warnings.push('Entry-level role requests excessive experience.');
      if (Number(job.salaryMin) && Number(job.salaryMax) && Number(job.salaryMin) > Number(job.salaryMax)) blockers.push('Minimum salary cannot exceed maximum salary.');
      const score = Math.max(0, Math.min(100, 100 - blockers.length * 22 - warnings.length * 7));
      Object.assign(job, { blockers, warnings, validationWarnings: warnings, passed, score, validationScore: score });
      this.validationRan = true;
      this.addAudit('Automated Validation run', job, job.status, job.status, `${blockers.length} blocker(s), ${warnings.length} warning(s), score ${score}.`);
      this.persist();
      return { blockers, warnings, passed, score };
    },

    saveDraft() {
      if (!this.has('create_job')) return this.notify('You do not have permission to save a job draft.');
      const existing = this.job(this.draft.id);
      if (existing && !this.can('edit_own_job', existing)) return this.notify('This job is locked. Start a controlled revision before editing.');
      if (!existing) {
        this.draft.id = uid();
        this.draft.status = 'Draft';
        this.jobs.unshift(clone(this.draft));
        this.addAudit('Draft created', this.draft, '', 'Draft');
      } else {
        Object.assign(existing, clone(this.draft));
        this.addAudit('Draft edited', existing, existing.status, existing.status);
      }
      this.persist();
      this.notify('Draft saved.');
    },

    submitForApproval() {
      if (!this.has('submit_for_approval')) return this.notify('You do not have permission to submit jobs.');
      const result = this.validate(this.draft);
      if (!result || result.blockers.length || result.score < this.policy.minimumValidationScore) return this.notify('Resolve critical blockers before submitting.');
      this.saveDraft();
      const job = this.job(this.draft.id);
      const from = job.status;
      job.status = 'Pending Approval';
      job.submittedAt = now().toISOString();
      this.addAudit('Submitted for Manager Approval', job, from, 'Pending Approval', `Submitted to ${manager.name} for approval.`);
      this.persist();
      this.notify(`Submitted to ${manager.name} for approval.`);
      this.setPage('approvals');
    },

    withdraw(job) {
      if (!this.can('withdraw_submission', job) || job.status !== 'Pending Approval') return this.notify('This submission cannot be withdrawn.');
      const from = job.status;
      job.status = 'Draft';
      job.submittedAt = null;
      this.addAudit('Submission withdrawn', job, from, 'Draft', 'Withdrawn by recruiter for revision.');
      this.persist();
    },

    approve(job) {
      if (!this.can('approve_assigned_job', job)) return this.notify('You cannot approve this submission.');
      if (!this.managerAttests) return this.notify('The Hiring Manager attestation is required.');
      const timestamp = now().toISOString();
      job.status = 'Approved';
      job.approvalTimestamp = timestamp;
      job.approvedAt = timestamp;
      job.managerDecision = { managerUserId: this.currentUser.userId, managerName: this.currentUser.name, decision: 'Approved', timestamp, attestation: true, comment: 'Approved for publication.' };
      this.addAudit('Manager approval recorded', job, 'Pending Approval', 'Approved', 'I confirm this vacancy is approved, funded, genuinely intended to be filled, and accurately represents my department’s needs.');
      this.managerAttests = false;
      this.persist();
      this.notify('Vacancy approved. Alicia Tan can now publish it.');
    },

    requestChanges(job) {
      if (!this.can('request_changes', job)) return this.notify('You cannot request changes for this submission.');
      const comment = prompt('Explain the changes required:');
      if (!comment?.trim()) return this.notify('A comment is required to request changes.');
      job.status = 'Needs Changes';
      job.comments.push({ by: this.currentUser.name, userId: this.currentUser.userId, at: now().toISOString(), text: comment.trim() });
      job.managerDecision = { managerUserId: this.currentUser.userId, managerName: this.currentUser.name, decision: 'Changes Requested', timestamp: now().toISOString(), attestation: false, comment: comment.trim() };
      this.addAudit('Changes requested', job, 'Pending Approval', 'Needs Changes', comment.trim());
      this.persist();
    },

    reject(job) {
      if (!this.can('reject_assigned_job', job)) return this.notify('You cannot reject this submission.');
      const reason = prompt('Provide a rejection reason:');
      if (!reason?.trim()) return this.notify('A reason is required to reject a job.');
      if (!confirm('Reject this job submission? This decision will be recorded in the audit log.')) return;
      job.status = 'Rejected';
      job.managerDecision = { managerUserId: this.currentUser.userId, managerName: this.currentUser.name, decision: 'Rejected', timestamp: now().toISOString(), attestation: false, comment: reason.trim() };
      this.addAudit('Job rejected', job, 'Pending Approval', 'Rejected', reason.trim());
      this.persist();
    },

    publish(job) {
      if (!this.can('publish_approved_job', job)) return this.notify('Only the assigned recruiter can publish an approved job.');
      const timestamp = now().toISOString();
      job.status = 'Published';
      job.publishedAt = timestamp;
      job.publishedTimestamp = timestamp;
      job.lastConfirmedAt = timestamp;
      job.confirmationDueAt = isoDays(this.policy.confirmationDays);
      job.confirmationDueDate = job.confirmationDueAt;
      job.freshnessStatus = 'Active and Confirmed';
      job.confirmationHistory.push({ at: timestamp, by: this.currentUser.name, action: 'Published' });
      this.addAudit('Job published', job, 'Approved', 'Published', 'Approved vacancy published to candidates.');
      this.persist();
      this.notify('CareerOS Verified Vacancy is now available.');
    },

    confirmHiring(job) {
      if (!this.can('reconfirm_active_vacancy', job)) return this.notify('Only the assigned Hiring Manager can reconfirm this vacancy.');
      const from = job.status;
      const timestamp = now().toISOString();
      job.status = 'Published';
      job.lastConfirmedAt = timestamp;
      job.confirmationDueAt = isoDays(this.policy.confirmationDays);
      job.confirmationDueDate = job.confirmationDueAt;
      job.freshnessStatus = 'Active and Confirmed';
      delete job.pausedAt;
      job.confirmationHistory.push({ at: timestamp, by: this.currentUser.name, action: 'Still Hiring' });
      this.addAudit('Hiring status reconfirmed', job, from, 'Published', `Confirmed for another ${this.policy.confirmationDays} days.`);
      this.freshnessJobId = null;
      this.persist();
    },

    setLifecycle(job, action) {
      const managerAction = this.can('mark_team_job_filled', job);
      const adminPause = action === 'pause' && this.can('pause_suspicious_job', job);
      if (!managerAction && !adminPause) return this.notify('You do not have permission for this lifecycle action.');
      let reason = '';
      if (this.currentUser.role === 'hr_admin') {
        reason = prompt('Provide the governance reason for this administrator action:') || '';
        if (!reason.trim()) return this.notify('An administrator reason is required.');
      }
      const from = job.status;
      if (action === 'pause') { job.status = 'Paused as Stale'; job.pausedAt = now().toISOString(); job.freshnessStatus = 'Paused as Stale'; }
      if (action === 'filled') { job.status = 'Position Filled'; job.filledAt = now().toISOString(); job.freshnessStatus = 'Position Filled'; }
      const label = this.currentUser.role === 'hr_admin' ? 'Administrator override: vacancy paused' : action === 'pause' ? 'Vacancy paused' : 'Job marked filled';
      this.addAudit(label, job, from, job.status, reason.trim() || (action === 'filled' ? 'Hiring process completed.' : 'Vacancy is no longer actively advertised.'));
      this.freshnessJobId = null;
      this.persist();
    },

    trustedJobs() { return this.jobs.filter((job) => ['Published', 'Confirmation Due'].includes(job.status) && job.freshnessStatus !== 'Paused as Stale'); },
    demandSkills() {
      const totals = {};
      this.trustedJobs().forEach((job) => job.requirements.filter((requirement) => requirement.required).forEach((requirement) => { if (requirement.name) totals[requirement.name] = (totals[requirement.name] || 0) + 1; }));
      return Object.entries(totals).sort((a, b) => b[1] - a[1]);
    },

    savePolicy() {
      if (!this.has('manage_policy_settings')) return this.notify('You do not have permission to change policy settings.');
      this.addAudit('Administrator policy update', null, '', '', `Confirmation ${this.policy.confirmationDays} days; approval SLA ${this.policy.approvalSlaDays} days; minimum score ${this.policy.minimumValidationScore}.`);
      this.persist();
      this.notify('Demonstration policy thresholds saved.');
    },

    resetDemo() {
      if (!this.has('manage_policy_settings')) return this.notify('Only an HR Administrator can reset demonstration data.');
      localStorage.removeItem('careeros-role-workspace');
      location.reload();
    },
  };
}
