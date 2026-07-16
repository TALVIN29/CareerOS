// Signal Path Verify — localStorage persistence layer.
// Browser-global window.VerifyStore. Depends on window.VerifyEngine +
// window.VerifySeeds (load both script tags before this one).
// Keys: spv.jobs, spv.audit, spv.role, spv.seedVersion.

(function (root) {
  const SEED_VERSION = 'v2'; // bump to force reseed on next load
  const JOBS_KEY = 'spv.jobs';
  const AUDIT_KEY = 'spv.audit';
  const ROLE_KEY = 'spv.role';
  const SEED_VERSION_KEY = 'spv.seedVersion';
  const POLICY_KEY = 'spv.policy';
  let activeUser = null;

  // Depends on VerifyEngine + VerifySeeds already loaded on window (browser)
  // or globalThis (Node/vm — e.g. a shared-context test harness).
  const Engine = (typeof window !== 'undefined' && window.VerifyEngine) || root.VerifyEngine;
  const Seeds = (typeof window !== 'undefined' && window.VerifySeeds) || root.VerifySeeds;

  function genId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function findPersona(id) {
    return Seeds.PERSONAS.find(p => p.id === id) || null;
  }

  function makeAuditEvent(jobId, actor, action, fromStatus, toStatus, ts, comment) {
    return {
      id: genId('audit'),
      jobId,
      actorName: actor && actor.name,
      actorRole: actor && actor.role,
      action,
      fromStatus,
      toStatus,
      comment: comment || null,
      ts: ts || new Date().toISOString()
    };
  }

  // Plausible audit history for a seed job, derived from its final status —
  // not a re-run of the engine (seeds are hand-tuned end states), just a
  // believable trail: create -> validate -> [submit] -> [approve] -> [publish].
  function seedAuditForJob(job) {
    const recruiter = findPersona(job.recruiterId) || { name: 'Recruiter', role: 'recruiter' };
    const manager = findPersona(job.hiringManagerId) || { name: 'Hiring Manager', role: 'manager' };
    const events = [];

    events.push(makeAuditEvent(job.id, recruiter, 'create', null, 'draft', job.createdAt));
    events.push(makeAuditEvent(job.id, recruiter, 'validate', 'draft',
      job.status === 'needs_changes' ? 'needs_changes' : 'draft', job.updatedAt));

    if (['pending_approval', 'approved', 'published', 'confirmation_due', 'paused_stale', 'filled', 'closed'].includes(job.status)) {
      events.push(makeAuditEvent(job.id, recruiter, 'submit', 'draft', 'pending_approval', job.updatedAt));
    }
    if (['approved', 'published', 'confirmation_due', 'paused_stale', 'filled', 'closed'].includes(job.status) && job.approval) {
      events.push(makeAuditEvent(job.id, manager, 'approve', 'pending_approval', 'approved',
        job.approval.ts, job.approval.comments));
    }
    if (['published', 'confirmation_due', 'paused_stale', 'filled', 'closed'].includes(job.status)) {
      events.push(makeAuditEvent(job.id, manager, 'publish', 'approved', 'published', job.updatedAt));
    }
    if (job.status === 'confirmation_due') events.push(makeAuditEvent(job.id, { name: 'CareerOS Policy Engine', role: 'system' }, 'mark_confirmation_due', 'published', 'confirmation_due', job.confirmationDueAt));
    if (job.status === 'paused_stale') events.push(makeAuditEvent(job.id, { name: 'CareerOS Policy Engine', role: 'system' }, 'pause_stale', 'confirmation_due', 'paused_stale', job.pausedAt));
    if (job.status === 'filled') events.push(makeAuditEvent(job.id, manager, 'mark_filled', 'published', 'filled', job.filledAt));
    if (job.status === 'closed') events.push(makeAuditEvent(job.id, manager, 'close', 'published', 'closed', job.closedAt));
    return events;
  }

  function seed() {
    const jobs = Seeds.JOBS.map(seedJob => {
      const job = JSON.parse(JSON.stringify(seedJob));
      job.validation = Engine.validateJob(job); // scores/badges render immediately
      return job;
    });
    const audit = [];
    jobs.forEach(job => audit.push(...seedAuditForJob(job)));

    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
    localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    if (!localStorage.getItem(ROLE_KEY)) localStorage.setItem(ROLE_KEY, 'recruiter');
  }

  function loadJobs() {
    try {
      const raw = localStorage.getItem(JOBS_KEY);
      if (!raw) { seed(); return loadJobs(); }
      return JSON.parse(raw);
    } catch (e) {
      seed(); // corrupt JSON -> reseed
      return JSON.parse(localStorage.getItem(JOBS_KEY));
    }
  }

  function saveJobs(jobs) { localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)); }

  function loadAudit() {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAudit(audit) { localStorage.setItem(AUDIT_KEY, JSON.stringify(audit)); }

  function addAudit(jobId, action, fromStatus, toStatus, comment, actor) {
    const audit = loadAudit();
    audit.push(makeAuditEvent(jobId, actor, action, fromStatus, toStatus, null, comment));
    saveAudit(audit);
  }

  const VerifyStore = {
    init() {
      const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
      let needsSeed = storedVersion !== SEED_VERSION || !localStorage.getItem(JOBS_KEY);
      if (!needsSeed) {
        try {
          JSON.parse(localStorage.getItem(JOBS_KEY));
          JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
        } catch (e) {
          needsSeed = true;
        }
      }
      if (needsSeed) seed();
    },

    listJobs() {
      return loadJobs();
    },

    getJob(id) {
      return loadJobs().find(j => j.id === id) || null;
    },

    createJob(fields) {
      const jobs = loadJobs();
      const now = new Date().toISOString();
      const job = Object.assign({
        id: genId('job'),
        createdAt: now,
        updatedAt: now,
        status: 'draft',
        validation: null,
        approval: null
      }, fields);
      jobs.push(job);
      saveJobs(jobs);
      addAudit(job.id, 'create', null, 'draft', null, this.currentUser());
      return job;
    },

    updateJob(id, fields) {
      const jobs = loadJobs();
      const idx = jobs.findIndex(j => j.id === id);
      if (idx === -1) return null;
      const before = jobs[idx];
      const result = Engine.applyTransition(before, 'edit', this.currentUser(), { comment: 'Material fields updated.' });
      const updated = Object.assign({}, result.job, fields, { updatedAt: new Date().toISOString() });
      jobs[idx] = updated;
      saveJobs(jobs);
      const audit = loadAudit();
      audit.push(result.auditEvent);
      saveAudit(audit);
      return updated;
    },

    deleteDraft(id) {
      const jobs = loadJobs();
      const job = jobs.find(j => j.id === id);
      if (!job || job.status !== 'draft') return false;
      saveJobs(jobs.filter(j => j.id !== id));
      return true;
    },

    validate(id) {
      const jobs = loadJobs();
      const idx = jobs.findIndex(j => j.id === id);
      if (idx === -1) return null;
      const result = Engine.applyTransition(jobs[idx], 'validate', this.currentUser(), {});
      result.job.updatedAt = new Date().toISOString();
      jobs[idx] = result.job;
      saveJobs(jobs);
      const audit = loadAudit();
      audit.push(result.auditEvent);
      saveAudit(audit);
      return result.job;
    },

    transition(id, action, opts) {
      const jobs = loadJobs();
      const idx = jobs.findIndex(j => j.id === id);
      if (idx === -1) throw new Error(`Job not found: ${id}`);
      const result = Engine.applyTransition(jobs[idx], action, this.currentUser(), opts || {});
      result.job.updatedAt = new Date().toISOString();
      jobs[idx] = result.job;
      saveJobs(jobs);
      const audit = loadAudit();
      audit.push(result.auditEvent);
      saveAudit(audit);
      return result.job;
    },

    acknowledgeWarning(id, warningId) {
      const jobs = loadJobs();
      const idx = jobs.findIndex(j => j.id === id);
      if (idx === -1 || !jobs[idx].validation) return null;
      const result = Engine.applyTransition(jobs[idx], 'acknowledge_warning', this.currentUser(), { warningId, comment: `Warning acknowledged: ${warningId}` });
      result.job.updatedAt = new Date().toISOString();
      jobs[idx] = result.job;
      saveJobs(jobs);
      const audit = loadAudit();
      audit.push(result.auditEvent);
      saveAudit(audit);
      return result.job;
    },

    listAudit(jobId) {
      const audit = loadAudit();
      const filtered = jobId ? audit.filter(a => a.jobId === jobId) : audit;
      // Stable ordering for same-millisecond events: insertion index breaks ties.
      return filtered
        .map((a, i) => ({ a, i }))
        .sort((x, y) => (new Date(y.a.ts) - new Date(x.a.ts)) || (y.i - x.i))
        .map(x => x.a);
    },

    getRole() {
      return localStorage.getItem(ROLE_KEY) || 'recruiter';
    },

    setRole(role) {
      localStorage.setItem(ROLE_KEY, role);
      return role;
    },

    currentUser() {
      if (activeUser) return activeUser;
      const role = this.getRole();
      return Seeds.PERSONAS.find(p => p.role === role) || Seeds.PERSONAS[0];
    },

    setCurrentUser(user) {
      activeUser = user ? { id: user.id || user.userId, userId: user.userId || user.id, name: user.name, role: user.role } : null;
      return activeUser;
    },

    loadPolicy() {
      try {
        return JSON.parse(localStorage.getItem(POLICY_KEY)) || { confirmationDays: 30, graceDays: 7, approvalSlaDays: 3, minimumValidationScore: 60 };
      } catch (e) {
        return { confirmationDays: 30, graceDays: 7, approvalSlaDays: 3, minimumValidationScore: 60 };
      }
    },

    savePolicy(policy) {
      localStorage.setItem(POLICY_KEY, JSON.stringify(policy));
      return policy;
    },

    addAudit,

    reset() {
      Object.keys(localStorage)
        .filter(k => k.startsWith('spv.'))
        .forEach(k => localStorage.removeItem(k));
      seed();
      return { jobs: this.listJobs(), audit: this.listAudit(), role: this.getRole() };
    }
  };

  if (typeof window !== 'undefined') window.VerifyStore = VerifyStore;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
