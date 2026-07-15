// Signal Path Verify — localStorage persistence layer.
// Browser-global window.VerifyStore. Depends on window.VerifyEngine +
// window.VerifySeeds (load both script tags before this one).
// Keys: spv.jobs, spv.audit, spv.role, spv.seedVersion.

(function (root) {
  const SEED_VERSION = 'v1'; // bump to force reseed on next load
  const JOBS_KEY = 'spv.jobs';
  const AUDIT_KEY = 'spv.audit';
  const ROLE_KEY = 'spv.role';
  const SEED_VERSION_KEY = 'spv.seedVersion';

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

    if (['pending_approval', 'approved', 'published'].includes(job.status)) {
      events.push(makeAuditEvent(job.id, recruiter, 'submit', 'draft', 'pending_approval', job.updatedAt));
    }
    if (['approved', 'published'].includes(job.status) && job.approval) {
      events.push(makeAuditEvent(job.id, manager, 'approve', 'pending_approval', 'approved',
        job.approval.ts, job.approval.comments));
    }
    if (job.status === 'published') {
      events.push(makeAuditEvent(job.id, manager, 'publish', 'approved', 'published', job.updatedAt));
    }
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
      const updated = Object.assign({}, before, fields, { updatedAt: new Date().toISOString() });
      jobs[idx] = updated;
      saveJobs(jobs);
      addAudit(id, 'edit', before.status, updated.status, null, this.currentUser());
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
      const job = jobs[idx];
      const validation = Engine.validateJob(job);
      const toStatus = (validation.blockers.length > 0 || validation.score < 60) ? 'needs_changes' : job.status;
      const updated = Object.assign({}, job, { validation, status: toStatus, updatedAt: new Date().toISOString() });
      jobs[idx] = updated;
      saveJobs(jobs);
      addAudit(id, 'validate', job.status, toStatus, null, this.currentUser());
      return updated;
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
      const job = jobs[idx];
      const validation = Object.assign({}, job.validation, {
        warnings: job.validation.warnings.map(w => w.id === warningId ? Object.assign({}, w, { acknowledged: true }) : w)
      });
      const updated = Object.assign({}, job, { validation, updatedAt: new Date().toISOString() });
      jobs[idx] = updated;
      saveJobs(jobs);
      return updated;
    },

    listAudit(jobId) {
      const audit = loadAudit();
      const filtered = jobId ? audit.filter(a => a.jobId === jobId) : audit;
      return filtered.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
    },

    getRole() {
      return localStorage.getItem(ROLE_KEY) || 'recruiter';
    },

    setRole(role) {
      localStorage.setItem(ROLE_KEY, role);
      return role;
    },

    currentUser() {
      const role = this.getRole();
      return Seeds.PERSONAS.find(p => p.role === role) || Seeds.PERSONAS[0];
    },

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
