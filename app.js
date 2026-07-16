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
  const blankValidation = () => ({ score: 0, riskLevel: 'red', components: { approvalEvidence: 0, completeness: 0, requirementRealism: 0, internalConsistency: 0, marketComparison: 0 }, blockers: [], hardBlockers: [], warnings: [], passed: [], passedChecks: [], topReasons: [], recommendedAction: 'manager_confirmation' });
  const defaultDraft = () => ({
    id: '', status: 'draft', employerVerified: true, requisitionId: '', department: 'Technology', departmentId: 'technology', vacancies: 1,
    hiringManagerId: manager.userId, recruiterId: recruiter.userId, targetStartDate: '', headcountApproved: false, budgetApproved: false,
    approvalEvidenceSource: '', approvalEvidenceDate: '',
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
    activeJobId: null,
    candidatePreviewJobId: null,
    freshnessJobId: null,
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
    integrity(job) { return job ? (job.validation?.rulesVersion === Engine.RULES_VERSION ? job.validation : Engine.calculatePostingIntegrity(job)) : blankValidation(); },
    liveDraft() {
      const job = clone(this.draft);
      job.responsibilities = this.draftResponsibilities.split('\n').map(line => line.trim()).filter(Boolean);
      job.salaryMin = Number(job.salaryMin) || 0;
      job.salaryMax = Number(job.salaryMax) || 0;
      job.requirements = (job.requirements || []).map(req => ({ ...req, yearsExperience: Number(req.yearsExperience) || 0 }));
      return job;
    },
    draftIntegrity() { return Engine.calculatePostingIntegrity(this.liveDraft(), { minimumScore: this.policy.minimumValidationScore }); },
    riskLabel(risk) { return ({ green: 'Green · Ready to publish', amber: 'Amber · Needs attention', red: 'Red · Manager confirmation required' })[risk] || 'Not checked'; },
    riskClass(risk) { return `risk-${risk || 'red'}`; },
    factorLabel(key) { return ({ approvalEvidence: 'Approval evidence', completeness: 'Posting completeness', requirementRealism: 'Requirement realism', internalConsistency: 'Internal consistency', marketComparison: 'Market comparison' })[key] || key; },
    integrityMessage(result) {
      if (result.riskLevel === 'green') return 'Ready to publish. The vacancy has sufficient approval evidence and no material issues.';
      if (result.riskLevel === 'amber') return `${Math.min(3, result.topReasons.length)} detail${result.topReasons.length === 1 ? '' : 's'} need attention before this vacancy can be verified.`;
      return 'Manager confirmation is required before this vacancy can be published.';
    },
    canRouteDraft() { return Engine.canRequestConfirmation(this.liveDraft(), { minimumScore: this.policy.minimumValidationScore }); },
    postingCtaLabel() { return ({ green: 'Publish Verified Job', amber: 'Resolve Issues', red: 'Send for Manager Confirmation' })[this.draftIntegrity().riskLevel]; },
    statusLabel(status) { return ({ draft: 'Draft', needs_changes: 'Needs Attention', pending_approval: 'Awaiting Manager Confirmation', approved: 'Approved — Ready to Publish', published: 'Published — Verified', confirmation_due: 'Confirmation Due', paused_stale: 'Paused as Stale', filled: 'Filled', rejected: 'Rejected', closed: 'Closed' })[status] || status; },
    statusClass(status) { return ({ draft: 'status-slate', needs_changes: 'status-amber', pending_approval: 'status-blue', approved: 'status-green', published: 'status-green', confirmation_due: 'status-amber', paused_stale: 'status-red', rejected: 'status-red', filled: 'status-slate', closed: 'status-slate' })[status] || 'status-slate'; },
    scoreClass(score) { return score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-300' : 'text-red-400'; },
    formatDate(value) { return value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not recorded'; },
    formatDateTime(value) { return value ? new Date(value).toLocaleString() : 'Not recorded'; },
    daysAgo(value) { return value ? Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000)) : 0; },
    salary(job = {}) { return `${job.currency || 'MYR'} ${Number(job.salaryMin || 0).toLocaleString()}–${Number(job.salaryMax || 0).toLocaleString()} / month`; },

    visibleJobs() { return this.jobs.filter(job => canAccessJob(this.currentUser, job)); },
    approvalJobs() { return this.visibleJobs().filter(job => ['pending_approval', 'approved', 'rejected'].includes(job.status) || (job.status === 'needs_changes' && job.approval?.decision === 'changes_requested')); },
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
        ['Drafts', counts.draft || 0], ['Needs Attention', counts.needs_changes || 0], ['Awaiting Manager Confirmation', counts.pending_approval || 0], ['Ready to Publish', this.visibleJobs().filter(job => job.status === 'approved' || (['draft', 'needs_changes'].includes(job.status) && this.integrity(job).riskLevel === 'green')).length], ['Published — Verified', counts.published || 0], ['Confirmation Due', counts.confirmation_due || 0]
      ];
      if (this.currentUser?.role === 'hiring_manager') return [
        ['Awaiting My Confirmation', counts.pending_approval || 0], ['Changes Requested', this.visibleJobs().filter(job => job.status === 'needs_changes' && job.approval?.decision === 'changes_requested').length], ['Confirmation Due', counts.confirmation_due || 0], ['Active Team Vacancies', counts.published || 0]
      ];
      const risks = this.jobs.reduce((total, job) => { const risk = this.integrity(job).riskLevel; total[risk] = (total[risk] || 0) + 1; return total; }, {});
      const confirmationDays = this.jobs.filter(job => job.submittedAt && job.approval?.ts).map(job => Math.max(0, (new Date(job.approval.ts) - new Date(job.submittedAt)) / 86400000));
      return [
        ['Green / Amber / Red', `${risks.green || 0} / ${risks.amber || 0} / ${risks.red || 0}`], ['Overdue Manager Confirmations', this.jobs.filter(job => job.status === 'pending_approval' && this.daysAgo(job.submittedAt) > this.policy.approvalSlaDays).length], ['Stale Vacancies', this.jobs.filter(job => job.status === 'paused_stale').length], ['Jobs Paused Automatically', this.jobs.filter(job => job.pausedAutomatically).length], ['Recent Overrides', this.audit.filter(event => ['pause_stale', 'policy_update'].includes(event.action)).slice(0, 30).length], ['Avg. Manager Confirmation', confirmationDays.length ? `${(confirmationDays.reduce((sum, value) => sum + value, 0) / confirmationDays.length).toFixed(1)} days` : 'N/A']
      ];
    },

    dashboardCopy() {
      if (this.currentUser?.role === 'recruiter') return { title: 'Post with confidence. CareerOS handles the checks in the background.' };
      if (this.currentUser?.role === 'hiring_manager') return { title: 'Only decisions that need your accountability.' };
      return { title: 'Keep the organisation’s hiring signal trustworthy.' };
    },

    actionJobs() {
      if (this.currentUser?.role === 'recruiter') return this.visibleJobs().filter(job => ['needs_changes', 'approved', 'draft'].includes(job.status));
      if (this.currentUser?.role === 'hiring_manager') return this.visibleJobs().filter(job => ['pending_approval', 'confirmation_due', 'paused_stale'].includes(job.status));
      return this.jobs.filter(job => this.validation(job).blockers.length || this.validation(job).warnings.length || ['pending_approval', 'confirmation_due', 'paused_stale'].includes(job.status));
    },

    nextAction(job) {
      if (this.currentUser?.role === 'hr_admin') {
        if (this.integrity(job).hardBlockers.length) return 'Review material integrity risk';
        if (this.integrity(job).warnings.length) return 'Review posting integrity signal';
        if (job.status === 'pending_approval') return 'Review confirmation delay';
        if (job.status === 'confirmation_due') return 'Review confirmation risk';
        if (job.status === 'paused_stale') return 'Review stale-vacancy event';
      }
      if (['draft', 'needs_changes'].includes(job.status)) return this.integrity(job).riskLevel === 'green' ? 'Publish verified job' : 'Resolve posting integrity issues';
      return ({ approved: 'Publish manager-confirmed vacancy', pending_approval: 'Review manager confirmation', confirmation_due: 'Confirm active hiring', paused_stale: 'Review stale vacancy' })[job.status] || 'Review job';
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
      this.setPage('create');
    },

    loadDemoDraft(path = 'amber') {
      this.draft = clone(Seeds.DEMO_DRAFTS?.[path] || Seeds.DEMO_DRAFT);
      this.draft.recruiterId = this.currentUser.userId;
      this.draft.hiringManagerId = manager.userId;
      this.draftResponsibilities = this.draft.responsibilities.join('\n');
      this.notify(`${path[0].toUpperCase()}${path.slice(1)} demonstration scenario loaded.`);
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
        ['status', 'validation', 'approval', 'submittedAt', 'publishedAt', 'lastConfirmedAt', 'confirmationDueAt', 'pausedAt', 'filledAt', 'closedAt', 'confirmations'].forEach(field => delete fields[field]);
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
      if (!this.has('refresh_integrity_demo')) return this.notify('You do not have permission to refresh Posting Integrity.');
      let target = job;
      if (job === this.draft) {
        target = this.saveDraft(true);
        if (!target) return null;
      }
      try {
        const updated = Store.refreshIntegrity(target.id);
        if (!updated) throw new Error('The saved draft could not be found.');
        this.refresh();
        if (target.id === this.draft.id) {
          this.draft = clone(updated);
          this.draftResponsibilities = this.draft.responsibilities.join('\n');
        }
        this.notify(`Posting Integrity refreshed: ${updated.validation.score}/100 · ${updated.validation.riskLevel}.`);
        return updated.validation;
      } catch (error) {
        this.notify(error.message);
        return null;
      }
    },

    submitForApproval() {
      if (!this.has('submit_for_approval')) return this.notify('You do not have permission to submit jobs.');
      const saved = this.saveDraft(true);
      if (!saved) return;
      try {
        // Production boundary: dispatch this concise request through the ATS,
        // email, Teams, or Slack after server-side authorisation.
        Store.transition(saved.id, 'submit', { minimumScore: this.policy.minimumValidationScore, comment: `Manager Confirmation sent to ${manager.name}. Production delivery would use the ATS, email, Teams, or Slack.` });
        this.refresh();
        this.notify(`Sent to ${manager.name} for Manager Confirmation.`);
        this.setPage('approvals');
      } catch (error) { this.notify(error.message); }
    },

    handlePostingCta() {
      const result = this.draftIntegrity();
      if (result.riskLevel === 'amber') {
        this.notify(result.topReasons[0]?.message || 'Resolve the highlighted details before publishing.');
        return;
      }
      if (result.riskLevel === 'red') return this.submitForApproval();
      const saved = this.saveDraft(true);
      if (saved) this.publish(saved);
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
        Store.transition(job.id, 'approve', { attestation: this.managerAttests, comment: 'Manager confirmed funding, intent, and departmental accuracy.' });
        this.managerAttests = false;
        this.refresh();
        this.openSubmission(this.job(job.id));
        this.notify('Vacancy confirmed. Alicia Tan can now publish it.');
      } catch (error) { this.notify(error.message); }
    },

    openDecision(job, action) {
      const labels = { request_changes: 'Request Changes', reject: 'Reject Vacancy', pause_stale: 'Pause Vacancy' };
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
      if (!this.can('publish_verified_job', job)) return this.notify('Only the assigned recruiter can publish a Green or manager-confirmed vacancy.');
      try {
        const direct = job.status !== 'approved';
        Store.transition(job.id, 'publish', { minimumScore: this.policy.minimumValidationScore, confirmationDays: this.policy.confirmationDays, comment: direct ? 'Published through the Green fast path after automatic integrity checks.' : 'Manager-confirmed vacancy published to candidates.' });
        this.refresh();
        this.setPage('listings');
        this.notify('Published — Verified. CareerOS will monitor freshness in the background.');
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
