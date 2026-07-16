function app() {
  const Engine = globalThis.VerifyEngine;
  const Seeds = globalThis.VerifySeeds;
  const Store = globalThis.VerifyStore;
  const Viz = globalThis.VerifyViz;
  const { DEMO_USERS, NAVIGATION, hasPermission, canAccessRoute, canAccessJob, canUser } = globalThis.CareerOSAuth;
  const clone = value => JSON.parse(JSON.stringify(value));
  const recruiter = DEMO_USERS.find(user => user.role === 'recruiter');
  const manager = DEMO_USERS.find(user => user.role === 'hiring_manager');
  const loadSession = () => {
    try { return JSON.parse(localStorage.getItem('careeros-session')) || null; } catch { return null; }
  };
  const sessionUser = user => {
    const { password, ...safeUser } = user;
    return clone(safeUser);
  };
  const blankValidation = () => ({ score: 0, components: { A: 0, V: 0, R: 0, M: 0, C: 0, Q: 0, P: 0 }, blockers: [], warnings: [], passed: [] });
  const defaultDraft = () => ({
    id: '', status: 'draft', employerVerified: true, requisitionId: '', department: 'Technology', departmentId: 'technology', vacancies: 1,
    hiringManagerId: manager.userId, recruiterId: recruiter.userId, targetStartDate: '', headcountApproved: false, budgetApproved: false,
    justification: '', title: '', location: 'Kuala Lumpur', workplace: 'hybrid', employmentType: 'full-time', seniority: 'entry',
    salaryMin: 0, salaryMax: 0, salaryVisible: true, reportingLine: '', summary: '', responsibilities: [],
    requirements: [{ name: '', type: 'skill', required: true, yearsExperience: 0, justification: '' }], validation: null, approval: null
  });

  return {
    screen: loadSession() ? 'employer' : 'home',
    currentUser: loadSession(),
    workspacePage: 'overview',
    mobileMenuOpen: false,
    jobs: [],
    audit: [],
    policy: { confirmationDays: 30, graceDays: 7, approvalSlaDays: 3, minimumValidationScore: 60 },
    draft: defaultDraft(),
    draftResponsibilities: '',
    wizardStep: 1,
    activeJobId: null,
    candidatePreviewJobId: null,
    freshnessJobId: null,
    validationRan: false,
    managerAttests: false,
    decisionModal: null,
    toast: '',
    loginEmail: 'recruiter@careeros.demo',
    loginPassword: 'demo123',
    authError: '',

    init() {
      Store.init();
      this.policy = Store.loadPolicy();
      if (this.currentUser) {
        const stored = DEMO_USERS.find(user => user.userId === this.currentUser.userId);
        this.currentUser = stored ? sessionUser(stored) : null;
      }
      Store.setCurrentUser(this.currentUser);
      this.refresh();
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
    },

    refresh() {
      this.jobs = Store.listJobs();
      this.audit = Store.listAudit();
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
      const user = DEMO_USERS.find(candidate => candidate.email.toLowerCase() === this.loginEmail.trim().toLowerCase() && candidate.password === this.loginPassword);
      if (!user) {
        this.authError = 'Those demonstration credentials do not match. Choose a demo account below or try again.';
        return;
      }
      this.currentUser = sessionUser(user);
      localStorage.setItem('careeros-session', JSON.stringify(this.currentUser));
      Store.setCurrentUser(this.currentUser);
      this.authError = '';
      this.screen = 'employer';
      this.workspacePage = 'overview';
      this.refresh();
      history.replaceState(null, '', '#/workspace/overview');
      this.notify(`Signed in as ${user.name}.`);
      setTimeout(() => this.renderGovernance(), 0);
    },

    signOut() {
      localStorage.removeItem('careeros-session');
      Store.setCurrentUser(null);
      this.currentUser = null;
      this.screen = 'login';
      this.workspacePage = 'overview';
      this.activeJobId = null;
      this.decisionModal = null;
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
      this.decisionModal = null;
      if (updateHash) history.replaceState(null, '', `#/workspace/${page}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (page === 'impact' || (page === 'overview' && this.currentUser.role === 'hr_admin')) setTimeout(() => this.renderGovernance(), 0);
    },

    notify(message) {
      this.toast = message;
      setTimeout(() => { this.toast = ''; }, 3200);
    },

    person(id) { return DEMO_USERS.find(user => user.userId === id); },
    personName(id) { return this.person(id)?.name || 'Unassigned'; },
    job(id) { return this.jobs.find(item => item.id === id); },
    validation(job) { return job?.validation || blankValidation(); },
    statusLabel(status) { return ({ draft: 'Draft', validating: 'Validating', needs_changes: 'Needs Changes', pending_approval: 'Pending Approval', approved: 'Approved', published: 'Published', confirmation_due: 'Confirmation Due', paused_stale: 'Paused as Stale', filled: 'Position Filled', rejected: 'Rejected', closed: 'Closed' })[status] || status; },
    statusClass(status) { return ({ draft: 'status-slate', needs_changes: 'status-amber', pending_approval: 'status-blue', approved: 'status-green', published: 'status-green', confirmation_due: 'status-amber', paused_stale: 'status-red', rejected: 'status-red', filled: 'status-slate', closed: 'status-slate' })[status] || 'status-slate'; },
    scoreClass(score) { return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-300' : 'text-red-400'; },
    formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not recorded'; },
    formatDateTime(value) { return value ? new Date(value).toLocaleString() : 'Not recorded'; },
    daysAgo(value) { return value ? Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000)) : 0; },
    salary(job = {}) { return `${job.currency || 'MYR'} ${Number(job.salaryMin || 0).toLocaleString()}–${Number(job.salaryMax || 0).toLocaleString()} / month`; },

    visibleJobs() { return this.jobs.filter(job => canAccessJob(this.currentUser, job)); },
    approvalJobs() { return this.visibleJobs().filter(job => ['pending_approval', 'needs_changes', 'approved', 'rejected'].includes(job.status)); },
    scopedAudit() {
      if (this.currentUser?.role === 'hr_admin') return this.audit;
      const ids = new Set(this.visibleJobs().map(job => job.id));
      return this.audit.filter(event => ids.has(event.jobId));
    },
    counts(source = this.visibleJobs()) { return source.reduce((result, job) => { result[job.status] = (result[job.status] || 0) + 1; return result; }, {}); },

    employerRating() { return Engine.computeEmployerRating(this.jobs, new Date()); },
    peerRatings() {
      return Seeds.PEER_ORGS.map(org => ({ id: org.id, name: org.name, ...Engine.computeEmployerRating(org.id === 'vertex-digital' ? this.jobs : org.jobs, new Date()) }))
        .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    },
    demandCorpus() { return Seeds.PEER_ORGS.flatMap(org => org.id === 'vertex-digital' ? this.jobs : org.jobs); },
    divergence() { return Engine.computeDemandDivergence(this.demandCorpus(), new Date()); },

    overviewCards() {
      const counts = this.counts();
      if (this.currentUser?.role === 'recruiter') return [
        ['My Drafts', counts.draft || 0], ['Needs Changes', counts.needs_changes || 0], ['Validation Warnings', this.visibleJobs().reduce((sum, job) => sum + this.validation(job).warnings.length, 0)], ['Awaiting Manager Approval', counts.pending_approval || 0], ['Approved — Ready to Publish', counts.approved || 0], ['Published Jobs', counts.published || 0]
      ];
      if (this.currentUser?.role === 'hiring_manager') return [
        ['Awaiting My Approval', counts.pending_approval || 0], ['Changes Requested', counts.needs_changes || 0], ['Confirmation Due', counts.confirmation_due || 0], ['Active Team Vacancies', counts.published || 0], ['Stale Vacancy Risk', counts.paused_stale || 0]
      ];
      const all = this.counts(this.jobs);
      const rating = this.employerRating();
      return [
        ['Employer Integrity Rating', rating.rating ?? 'N/A'], ['Active Verified Vacancies', all.published || 0], ['Overdue Approvals', this.jobs.filter(job => job.status === 'pending_approval' && this.daysAgo(job.submittedAt) > this.policy.approvalSlaDays).length], ['Stale Vacancies', all.paused_stale || 0], ['Policy Warnings', this.jobs.reduce((sum, job) => sum + this.validation(job).warnings.length + this.validation(job).blockers.length, 0)], ['Evidence Sample', `${rating.sampleSize} jobs`]
      ];
    },

    dashboardCopy() {
      if (this.currentUser?.role === 'recruiter') return { title: 'Prepare accurate vacancies and keep every submission moving.' };
      if (this.currentUser?.role === 'hiring_manager') return { title: 'Review the vacancies that require your decision.' };
      return { title: 'Protect the integrity of every labour-demand signal.' };
    },

    actionJobs() {
      if (this.currentUser?.role === 'recruiter') return this.visibleJobs().filter(job => ['needs_changes', 'approved', 'draft'].includes(job.status));
      if (this.currentUser?.role === 'hiring_manager') return this.visibleJobs().filter(job => ['pending_approval', 'confirmation_due', 'paused_stale'].includes(job.status));
      return this.jobs.filter(job => this.validation(job).blockers.length || this.validation(job).warnings.length || ['pending_approval', 'confirmation_due', 'paused_stale'].includes(job.status));
    },

    nextAction(job) {
      if (this.currentUser?.role === 'hr_admin') {
        if (this.validation(job).blockers.length) return 'Review policy blockers';
        if (this.validation(job).warnings.length) return 'Review validation warnings';
        if (job.status === 'pending_approval') return 'Review approval delay';
        if (job.status === 'confirmation_due') return 'Review confirmation risk';
        if (job.status === 'paused_stale') return 'Review stale-vacancy event';
      }
      return ({ needs_changes: 'Resolve manager feedback', approved: 'Publish approved vacancy', draft: 'Run Automated Validation', pending_approval: 'Review submission', confirmation_due: 'Confirm active hiring', paused_stale: 'Review stale vacancy' })[job.status] || 'Review job';
    },

    openAction(job) {
      if (this.currentUser?.role === 'hr_admin') return this.setPage('listings');
      if (this.currentUser?.role === 'recruiter' && ['draft', 'needs_changes', 'approved'].includes(job.status)) return this.startJob(job);
      if (job.status === 'pending_approval') { this.setPage('approvals'); this.openSubmission(job); return; }
      if (['confirmation_due', 'paused_stale'].includes(job.status)) { this.setPage('listings'); this.freshnessJobId = job.id; return; }
      this.setPage('listings');
    },

    startJob(job = null) {
      if (!this.has('create_job')) return this.notify('You do not have permission to create jobs.');
      if (job && !this.can('edit_own_job', job)) return this.notify('This job cannot be edited in its current state.');
      this.draft = job ? clone(job) : defaultDraft();
      this.draft.recruiterId = this.currentUser.userId;
      this.draft.hiringManagerId ||= manager.userId;
      this.draftResponsibilities = (this.draft.responsibilities || []).join('\n');
      this.wizardStep = 1;
      this.validationRan = Boolean(this.draft.validation);
      this.setPage('create');
    },

    loadDemoDraft() {
      this.draft = clone(Seeds.DEMO_DRAFT);
      this.draft.recruiterId = this.currentUser.userId;
      this.draft.hiringManagerId = manager.userId;
      this.draftResponsibilities = this.draft.responsibilities.join('\n');
      this.validationRan = false;
      this.wizardStep = 1;
      this.notify('Demonstration draft loaded.');
    },

    syncDraftFields() {
      this.draft.responsibilities = this.draftResponsibilities.split('\n').map(line => line.trim()).filter(Boolean);
      this.draft.salaryMin = Number(this.draft.salaryMin) || 0;
      this.draft.salaryMax = Number(this.draft.salaryMax) || 0;
      this.draft.requirements = this.draft.requirements.map(req => ({ ...req, yearsExperience: Number(req.yearsExperience) || 0 }));
    },

    addRequirement() { this.draft.requirements.push({ name: '', type: 'skill', required: true, yearsExperience: 0, justification: '' }); },
    removeRequirement(index) { this.draft.requirements.splice(index, 1); },

    saveDraft(silent = false) {
      if (!this.has('create_job')) return null;
      this.syncDraftFields();
      try {
        const fields = clone(this.draft);
        delete fields.id;
        delete fields.createdAt;
        delete fields.updatedAt;
        if (this.draft.id && this.job(this.draft.id)) this.draft = Store.updateJob(this.draft.id, fields);
        else this.draft = Store.createJob(fields);
        this.draftResponsibilities = (this.draft.responsibilities || []).join('\n');
        this.refresh();
        if (!silent) this.notify('Draft saved.');
        return this.draft;
      } catch (error) {
        this.notify(error.message);
        return null;
      }
    },

    validate(job = this.draft) {
      if (!this.can('run_validation', job)) return this.notify('You do not have permission to run Automated Validation.');
      let target = job;
      if (job === this.draft) {
        target = this.saveDraft(true);
        if (!target) return null;
      }
      try {
        const updated = Store.validate(target.id);
        if (!updated) throw new Error('The saved draft could not be found.');
        this.refresh();
        if (target.id === this.draft.id) {
          this.draft = clone(updated);
          this.draftResponsibilities = this.draft.responsibilities.join('\n');
        }
        this.validationRan = true;
        setTimeout(() => this.renderValidationCharts('wizard', updated), 0);
        this.notify(`Automated Validation complete: ${updated.validation.score}/100.`);
        return updated.validation;
      } catch (error) {
        this.notify(error.message);
        return null;
      }
    },

    acknowledgeWarning(job, warningId) {
      if (!this.can('resolve_validation_warning', job)) return;
      const updated = Store.acknowledgeWarning(job.id, warningId);
      this.refresh();
      if (this.draft.id === job.id) this.draft = clone(updated);
    },

    submitForApproval() {
      if (!this.has('submit_for_approval')) return this.notify('You do not have permission to submit jobs.');
      const saved = this.draft.id ? this.job(this.draft.id) : this.saveDraft(true);
      if (!saved) return;
      try {
        Store.transition(saved.id, 'submit', { comment: `Submitted to ${manager.name} for approval.` });
        this.refresh();
        this.notify(`Submitted to ${manager.name} for approval.`);
        this.setPage('approvals');
      } catch (error) { this.notify(error.message); }
    },

    withdraw(job) {
      if (!this.can('withdraw_submission', job)) return this.notify('This submission cannot be withdrawn.');
      try { Store.transition(job.id, 'withdraw', { comment: 'Withdrawn by recruiter for revision.' }); this.refresh(); }
      catch (error) { this.notify(error.message); }
    },

    openSubmission(job) {
      this.activeJobId = job.id;
      this.managerAttests = false;
      const jobId = job.id;
      setTimeout(() => {
        const currentJob = Store.getJob(jobId);
        if (currentJob) Viz.renderGauge('review-jis-gauge', currentJob.validation?.score || 0);
        if (currentJob?.validation) Viz.renderComponentBars('review-jis-components', currentJob.validation.components);
      }, 0);
    },

    approve(job) {
      if (!this.can('approve_assigned_job', job)) return this.notify('You cannot approve this submission.');
      try {
        Store.transition(job.id, 'approve', { attestation: this.managerAttests, comment: 'Approved for publication.' });
        this.managerAttests = false;
        this.refresh();
        this.openSubmission(this.job(job.id));
        this.notify('Vacancy approved. Alicia Tan can now publish it.');
      } catch (error) { this.notify(error.message); }
    },

    openDecision(job, action) {
      const labels = { request_changes: 'Request Changes', reject: 'Reject Submission', pause_stale: 'Pause Vacancy' };
      this.decisionModal = { jobId: job.id, action, title: labels[action], comment: '', reasonCategory: action === 'pause_stale' ? 'governance_risk' : 'requirements' };
    },

    confirmDecision() {
      const modal = this.decisionModal;
      const job = this.job(modal?.jobId);
      if (!job || !modal?.comment.trim()) return this.notify('A clear reason is required.');
      const permission = modal.action === 'request_changes' ? 'request_changes' : modal.action === 'reject' ? 'reject_assigned_job' : 'pause_suspicious_job';
      if (!this.can(permission, job)) return this.notify('You do not have permission for this decision.');
      try {
        Store.transition(job.id, modal.action, { comment: modal.comment.trim(), reasonCategory: modal.reasonCategory });
        this.decisionModal = null;
        this.refresh();
        if (this.activeJobId === job.id) this.openSubmission(this.job(job.id));
        this.notify('Decision recorded in the audit log.');
      } catch (error) { this.notify(error.message); }
    },

    publish(job) {
      if (!this.can('publish_approved_job', job)) return this.notify('Only the assigned recruiter can publish an approved job.');
      try {
        Store.transition(job.id, 'publish', { confirmationDays: this.policy.confirmationDays, comment: 'Approved vacancy published to candidates.' });
        this.refresh();
        this.notify('CareerOS Verified Vacancy is now available.');
      } catch (error) { this.notify(error.message); }
    },

    confirmHiring(job) {
      if (!this.can('reconfirm_active_vacancy', job)) return this.notify('Only the assigned Hiring Manager can reconfirm this vacancy.');
      try {
        Store.transition(job.id, 'reconfirm', { confirmationDays: this.policy.confirmationDays, comment: `Confirmed for another ${this.policy.confirmationDays} days.` });
        this.freshnessJobId = null;
        this.refresh();
      } catch (error) { this.notify(error.message); }
    },

    setLifecycle(job, action) {
      if (this.currentUser?.role === 'hr_admin' && action === 'pause_stale') return this.openDecision(job, action);
      const permission = action === 'mark_filled' || action === 'pause_stale' ? 'mark_team_job_filled' : '';
      if (!this.can(permission, job)) return this.notify('You do not have permission for this lifecycle action.');
      try {
        Store.transition(job.id, action, { comment: action === 'mark_filled' ? 'Hiring process completed.' : 'Vacancy paused by assigned manager.' });
        this.freshnessJobId = null;
        this.refresh();
      } catch (error) { this.notify(error.message); }
    },

    trustedJobs() { return this.jobs.filter(job => job.status === 'published' && job.employerVerified && (!job.confirmationDueAt || new Date(job.confirmationDueAt) >= new Date())); },
    demandSkills() { return Object.entries(Engine.computeDemandDivergence(this.jobs, new Date()).verified).sort((a, b) => b[1] - a[1]); },

    renderValidationCharts(prefix, job) {
      if (!job?.validation) return;
      Viz.renderGauge(`${prefix}-jis-gauge`, job.validation.score);
      Viz.renderComponentBars(`${prefix}-jis-components`, job.validation.components);
    },

    renderGovernance() {
      if (this.currentUser?.role !== 'hr_admin') return;
      const divergence = this.divergence();
      Viz.renderDemandDivergence?.('demand-divergence-chart', divergence);
    },

    savePolicy() {
      if (!this.has('manage_policy_settings')) return this.notify('You do not have permission to change policy settings.');
      Store.savePolicy(this.policy);
      Store.addAudit('', 'policy_update', null, null, `Confirmation ${this.policy.confirmationDays} days; approval SLA ${this.policy.approvalSlaDays} days; minimum score ${this.policy.minimumValidationScore}.`, this.currentUser);
      this.refresh();
      this.notify('Demonstration policy thresholds saved.');
    },

    resetDemo() {
      if (!this.has('manage_policy_settings')) return this.notify('Only an HR Administrator can reset demonstration data.');
      Store.reset();
      Store.setCurrentUser(this.currentUser);
      this.policy = Store.loadPolicy();
      this.refresh();
      this.setPage('overview');
      this.notify('Demonstration data restored.');
    }
  };
}
