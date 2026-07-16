// Signal Path Verify — deterministic rules engine.
// Pure module: no DOM, no Alpine, no localStorage, no dependencies.
// Spec: signal-path-verify-product-spec.md (blockers 194-211, warnings 213-226,
// statuses 83-94, scoring 135-177).

(function (root) {
  const RULES_VERSION = 'v1';

  // Statuses table — spec lines 83-94.
  const STATUSES = [
    'draft', 'validating', 'needs_changes', 'pending_approval',
    'approved', 'published', 'confirmation_due', 'paused_stale',
    'filled', 'rejected', 'closed'
  ];

  // Legal (status -> allowed actions) map. 'validating' is a transient
  // automated-check state (spec: "Automated checks are running") — the
  // 'validate' action resolves straight through it to draft/needs_changes,
  // so it never appears as a from-state here.
  const TRANSITIONS = {
    draft: ['validate', 'submit', 'edit', 'acknowledge_warning'],
    validating: [],
    needs_changes: ['validate', 'submit', 'edit', 'acknowledge_warning'],
    pending_approval: ['approve', 'request_changes', 'reject', 'withdraw'],
    approved: ['publish', 'edit', 'close'],
    published: ['reconfirm', 'mark_confirmation_due', 'pause_stale', 'mark_filled', 'close'],
    confirmation_due: ['reconfirm', 'pause_stale', 'mark_filled', 'close'],
    paused_stale: ['reconfirm', 'mark_filled', 'close'],
    filled: [],
    rejected: ['edit'],
    closed: []
  };

  // Demonstration market benchmark table — labelled as demo data (RM0 budget,
  // no live market API). Keyed by title keyword, matched case-insensitively
  // against job.title. MYR ranges are illustrative Malaysia tech/entry ranges.
  const BENCHMARKS = {
    'backend engineer': {
      medianSalaryMin: 6000, medianSalaryMax: 9000,
      typicalSkills: ['Node.js', 'SQL', 'REST APIs', 'Git', 'Docker', 'AWS', 'System Design', 'Java'],
      seniorityBands: { entry: [3500, 5500], mid: [5500, 8500], senior: [8500, 14000] }
    },
    'data analyst': {
      medianSalaryMin: 3500, medianSalaryMax: 5500,
      typicalSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
      seniorityBands: { entry: [2800, 4000], mid: [4000, 6500], senior: [6500, 10000] }
    },
    'product designer': {
      medianSalaryMin: 5500, medianSalaryMax: 8500,
      typicalSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'UX Writing'],
      seniorityBands: { entry: [3500, 5000], mid: [5000, 8000], senior: [8000, 13000] }
    },
    'marketing intern': {
      medianSalaryMin: 1200, medianSalaryMax: 2000,
      typicalSkills: ['Social Media', 'Content Writing', 'Canva', 'Analytics'],
      seniorityBands: { intern: [800, 1500], entry: [1500, 2500] }
    },
    'cybersecurity specialist': {
      medianSalaryMin: 7000, medianSalaryMax: 11000,
      typicalSkills: ['SIEM', 'Penetration Testing', 'Network Security', 'ISO 27001', 'Incident Response'],
      seniorityBands: { entry: [5000, 7000], mid: [7000, 11000], senior: [11000, 17000] }
    },
    // A few generic fallbacks so the demo isn't limited to the 5 seed titles.
    'software engineer': {
      medianSalaryMin: 5500, medianSalaryMax: 9000,
      typicalSkills: ['Git', 'SQL', 'System Design', 'Testing'],
      seniorityBands: { entry: [3500, 5000], mid: [5000, 8500], senior: [8500, 14000] }
    },
    'sales executive': {
      medianSalaryMin: 3000, medianSalaryMax: 5000,
      typicalSkills: ['CRM', 'Negotiation', 'Lead Generation'],
      seniorityBands: { entry: [2200, 3200], mid: [3200, 5500], senior: [5500, 8500] }
    }
  };

  function findBenchmark(title) {
    if (!title) return null;
    const t = title.toLowerCase();
    for (const key of Object.keys(BENCHMARKS)) {
      if (t.includes(key)) return BENCHMARKS[key];
    }
    return null;
  }

  // Demonstration keyword lists for the three critical content categories
  // (spec 208-210). Real deployment would swap these for a classifier;
  // here it's a plain, auditable substring scan.
  const PAYMENT_KEYWORDS = ['registration fee', 'processing fee', 'pay a fee', 'deposit required', 'training fee', 'pay to apply', 'application fee'];
  const BANKING_KEYWORDS = ['bank account number', 'bank statement', 'ic number', 'identity card number', 'passport number', 'credit card number', 'online banking login'];
  const DISCRIMINATORY_KEYWORDS = ['must be male', 'must be female', 'no disabilities', 'single status only', 'age below 30 only', 'malay only', 'chinese only', 'indian only', 'no married candidates'];

  function jobText(job) {
    const parts = [
      job.title || '',
      job.summary || '',
      ...(job.responsibilities || []),
      ...((job.requirements || []).map(r => `${r.name || ''} ${r.justification || ''}`))
    ];
    return parts.join(' \n ').toLowerCase();
  }

  function hasAnyKeyword(text, keywords) {
    return keywords.some(k => text.includes(k));
  }

  // ---------------------------------------------------------------------
  // Blockers — spec 194-211. Omits "Material copying or impersonation risk
  // requiring human escalation" (needs human review, not a deterministic
  // rule) — documented as a spec deviation.
  // ---------------------------------------------------------------------
  function findBlockers(job) {
    const blockers = [];
    const push = (id, message, field) => blockers.push({ id, message, field });

    if (!job.hiringManagerId) push('missing-hiring-manager', 'No hiring manager assigned to this vacancy.', 'hiringManagerId');
    if (!job.requisitionId) push('missing-requisition', 'No requisition ID linked to this vacancy.', 'requisitionId');
    if (job.headcountApproved !== true) push('headcount-not-approved', 'Headcount has not been approved.', 'headcountApproved');
    if (job.budgetApproved !== true) push('budget-not-approved', 'Budget has not been approved.', 'budgetApproved');
    if (job.employerVerified !== true) push('unverified-employer', 'The employer account is not verified.', 'employerVerified');

    if (typeof job.salaryMin === 'number' && typeof job.salaryMax === 'number' && job.salaryMin > job.salaryMax) {
      push('salary-min-above-max', 'Minimum salary is above the maximum salary.', 'salaryMin');
    }
    if (!job.employmentType) push('missing-employment-type', 'Employment type is missing.', 'employmentType');
    if (!job.location && job.workplace !== 'remote') push('missing-location', 'Location or remote status is missing.', 'location');
    if (!job.responsibilities || job.responsibilities.length === 0) push('no-responsibilities', 'No responsibilities have been listed.', 'responsibilities');
    if (!job.recruiterId) push('no-approval-route', 'No recruiter is set, so there is no approval route for this job.', 'recruiterId');

    const text = jobText(job);
    if (hasAnyKeyword(text, PAYMENT_KEYWORDS)) push('candidate-payment-requested', 'The listing appears to request payment from candidates.', 'summary');
    if (hasAnyKeyword(text, BANKING_KEYWORDS)) push('sensitive-id-requested', 'The listing appears to request banking or sensitive ID information.', 'summary');
    if (hasAnyKeyword(text, DISCRIMINATORY_KEYWORDS)) push('discriminatory-requirement', 'The listing appears to contain a discriminatory or unlawful requirement.', 'requirements');

    return blockers;
  }

  // ---------------------------------------------------------------------
  // Warnings — spec 213-226.
  // ---------------------------------------------------------------------
  function findWarnings(job, benchmark) {
    benchmark = benchmark === undefined ? findBenchmark(job.title) : benchmark;
    const warnings = [];
    const push = (id, message, field) => warnings.push({ id, message, field, acknowledged: false });
    const reqs = job.requirements || [];

    const maxExperience = reqs
      .filter(r => r.type === 'experience' && r.required)
      .reduce((max, r) => Math.max(max, r.yearsExperience || 0), 0);

    if (job.seniority === 'entry' && maxExperience > 3) {
      push('entry-overexperience', 'Entry-level role requests more than three years of experience.', 'seniority');
    }
    if (job.seniority === 'intern' && maxExperience > 2) {
      push('intern-overexperience', 'Internship requests more than two years of experience.', 'seniority');
    }

    if (job.seniority === 'senior' && benchmark && typeof job.salaryMax === 'number' && job.salaryMax < benchmark.medianSalaryMin * 0.7) {
      push('senior-low-salary', 'Senior role shows an unusually low salary versus the market.', 'salaryMax');
    }
    if (typeof job.salaryMin === 'number' && typeof job.salaryMax === 'number' && job.salaryMin > 0 && (job.salaryMax - job.salaryMin) / job.salaryMin > 1) {
      push('wide-salary-range', 'The salary range is excessively wide.', 'salaryMax');
    }

    const requiredSkillCount = reqs.filter(r => r.type === 'skill' && r.required).length;
    if (requiredSkillCount > 8) {
      push('too-many-skills', 'More than eight required skills are listed.', 'requirements');
    }

    if (job.title && job.responsibilities && job.responsibilities.length > 0) {
      const titleWords = job.title.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const respText = job.responsibilities.join(' ').toLowerCase();
      if (titleWords.length > 0 && !titleWords.some(w => respText.includes(w))) {
        push('title-responsibility-mismatch', 'Responsibilities do not appear consistent with the job title.', 'responsibilities');
      }
    }

    if (reqs.some(r => r.type === 'education' && r.required && !r.justification)) {
      push('education-without-justification', 'An education requirement has no stated justification.', 'requirements');
    }

    if (!job.summary || job.summary.trim().length < 40) {
      push('short-description', 'The description is very short or vague.', 'summary');
    }

    const names = reqs.map(r => (r.name || '').trim().toLowerCase()).filter(Boolean);
    if (new Set(names).size !== names.length) {
      push('duplicate-requirements', 'Duplicate or contradictory requirements were found.', 'requirements');
    }

    if (job.salaryVisible === false) {
      push('salary-hidden', 'Salary is omitted from the candidate view.', 'salaryVisible');
    }

    if (!benchmark) {
      push('limited-market-evidence', 'Limited comparable market evidence — manager justification required.', 'title');
    } else if (typeof job.salaryMin === 'number' && typeof job.salaryMax === 'number') {
      const withinBand = job.salaryMin >= benchmark.medianSalaryMin * 0.85 && job.salaryMax <= benchmark.medianSalaryMax * 1.15;
      if (!withinBand) {
        push('benchmark-deviation', 'Market benchmark differs materially from the proposed salary.', 'salaryMax');
      }
    }

    return warnings;
  }

  // Plausibility warning ids feed the R component deduction (plan: R = 100
  // minus a deduction per plausibility warning).
  const PLAUSIBILITY_WARNING_IDS = ['entry-overexperience', 'intern-overexperience', 'too-many-skills', 'duplicate-requirements', 'title-responsibility-mismatch'];

  // ---------------------------------------------------------------------
  // Scoring — spec 135-177, plan "Scoring" section.
  // ---------------------------------------------------------------------
  function scoreA(job) {
    let a = 0;
    if (job.requisitionId) a += 20;
    if (job.headcountApproved === true) a += 20;
    if (job.budgetApproved === true) a += 20;
    if (job.hiringManagerId) a += 20;
    if (job.targetStartDate) a += 20;
    return a;
  }

  function salaryOverlap(job, benchmark) {
    if (typeof job.salaryMin !== 'number' || typeof job.salaryMax !== 'number') return 'none';
    const overlaps = job.salaryMin <= benchmark.medianSalaryMax && job.salaryMax >= benchmark.medianSalaryMin;
    if (!overlaps) return 'none';
    const fullyWithin = job.salaryMin >= benchmark.medianSalaryMin * 0.85 && job.salaryMax <= benchmark.medianSalaryMax * 1.15;
    return fullyWithin ? 'full' : 'partial';
  }

  function scoreComponents(job, benchmark) {
    benchmark = benchmark === undefined ? findBenchmark(job.title) : benchmark;
    const warnings = findWarnings(job, benchmark);

    const A = scoreA(job);
    const V = 100; // Employer verification: demo constant (documented — no live verification API).

    const plausibilityHits = warnings.filter(w => PLAUSIBILITY_WARNING_IDS.includes(w.id)).length;
    const R = Math.max(0, 100 - 20 * plausibilityHits);

    let M, C;
    if (!benchmark) {
      M = 60;
      C = 60;
    } else {
      const overlap = salaryOverlap(job, benchmark);
      if (overlap === 'full') { M = 100; C = 100; }
      else if (overlap === 'partial') { M = 75; C = 70; }
      else { M = 75; C = 40; }
    }

    let Q = 0;
    if (job.summary && job.summary.trim().length >= 40) Q += 20;
    if (job.responsibilities && job.responsibilities.length >= 3) Q += 20;
    if (job.reportingLine) Q += 20;
    if (job.location || job.workplace === 'remote') Q += 20;
    if (job.employmentType) Q += 20;

    const text = jobText(job);
    let P = 0;
    if (hasAnyKeyword(text, PAYMENT_KEYWORDS)) P += 40;
    if (hasAnyKeyword(text, BANKING_KEYWORDS)) P += 40;
    if (hasAnyKeyword(text, DISCRIMINATORY_KEYWORDS)) P += 40;

    return { A, V, R, M, C, Q, P };
  }

  function computeScore(components) {
    const raw = 0.30 * components.A + 0.20 * components.V + 0.20 * components.R
      + 0.15 * components.M + 0.10 * components.C + 0.05 * components.Q - components.P;
    return Math.round(Math.max(0, Math.min(100, raw)));
  }

  function validateJob(job) {
    const benchmark = findBenchmark(job.title);
    const blockers = findBlockers(job);
    const warnings = findWarnings(job, benchmark);
    const components = scoreComponents(job, benchmark);
    const score = computeScore(components);

    const passed = [];
    if (job.requisitionId) passed.push({ id: 'requisition-present', message: 'Requisition ID is present.' });
    if (job.headcountApproved === true) passed.push({ id: 'headcount-approved', message: 'Headcount is approved.' });
    if (job.budgetApproved === true) passed.push({ id: 'budget-approved', message: 'Budget is approved.' });
    if (job.hiringManagerId) passed.push({ id: 'hiring-manager-assigned', message: 'A hiring manager is assigned.' });
    if (job.employmentType) passed.push({ id: 'employment-type-set', message: 'Employment type is set.' });
    if (job.location || job.workplace === 'remote') passed.push({ id: 'location-set', message: 'Location or remote status is set.' });
    if (job.responsibilities && job.responsibilities.length > 0) passed.push({ id: 'responsibilities-present', message: 'Responsibilities are listed.' });

    return {
      score,
      components,
      blockers,
      warnings,
      passed,
      validatedAt: new Date().toISOString(),
      rulesVersion: RULES_VERSION
    };
  }

  // ---------------------------------------------------------------------
  // Submission / approval / publication gates — spec 168-177.
  // ---------------------------------------------------------------------
  function canSubmit(job) {
    // Prefer the job's stored validation (which carries recruiter
    // acknowledgements against each warning) over a fresh recompute, which
    // would always report every warning as unacknowledged.
    // Blockers and score must always reflect the CURRENT job — a stored
    // validation can be stale after edits. Only warning acknowledgements
    // (which live nowhere else) are read from the stored validation.
    const fresh = validateJob(job);
    if (fresh.blockers.length > 0) return false;
    if (fresh.score < 60) return false;
    if (fresh.score >= 80) return true;
    const stored = (job.validation && job.validation.rulesVersion === RULES_VERSION)
      ? job.validation
      : fresh;
    return stored.warnings.every(w => w.acknowledged);
  }

  function canApprove(job, userId) {
    if (job.status !== 'pending_approval') return { ok: false, reason: 'Job is not pending approval.' };
    if (userId === job.recruiterId) return { ok: false, reason: 'The recruiter who submitted this job cannot approve it.' };
    return { ok: true, reason: null };
  }

  function canPublish(job) {
    if (job.status !== 'approved') return false;
    if (!job.approval || job.approval.decision !== 'approved') return false;
    if (job.approval.approverId === job.recruiterId) return false;
    if (findBlockers(job).length > 0) return false;
    return true;
  }

  function median(values) {
    if (!values.length) return null;
    const ordered = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(ordered.length / 2);
    return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  }

  // Employer Integrity Rating (EIR): a deterministic behaviour score over
  // vacancy history. Prototype weights require calibration before production.
  function computeEmployerRating(jobs, nowValue) {
    const nowMs = new Date(nowValue || Date.now()).getTime();
    const published = (jobs || []).filter(job => job.publishedAt || ['published', 'confirmation_due', 'paused_stale', 'filled', 'closed'].includes(job.status));
    const sampleSize = published.length;
    if (sampleSize < 3) {
      return { rating: null, band: 'Insufficient evidence', sampleSize, components: null };
    }

    const dueChecks = [];
    published.forEach(job => {
      (job.confirmations || []).forEach(item => {
        if (item.dueAt) dueChecks.push(new Date(item.confirmedAt).getTime() <= new Date(item.dueAt).getTime());
      });
      if (!(job.confirmations || []).length && job.confirmationDueAt && new Date(job.confirmationDueAt).getTime() <= nowMs) {
        dueChecks.push(Boolean(job.lastConfirmedAt) && new Date(job.lastConfirmedAt).getTime() <= new Date(job.confirmationDueAt).getTime());
      }
    });
    const reconfirmOnTime = dueChecks.length ? Math.round(100 * dueChecks.filter(Boolean).length / dueChecks.length) : 100;

    const completed = published.filter(job => ['closed', 'filled'].includes(job.status));
    const ghosts = completed.filter(job => job.status === 'closed' && !job.filledAt).length;
    const ghostAvoidance = completed.length ? Math.round(100 * (1 - ghosts / completed.length)) : 100;

    const latencies = published
      .filter(job => job.submittedAt && job.approval && job.approval.ts)
      .map(job => (new Date(job.approval.ts) - new Date(job.submittedAt)) / 86400000)
      .filter(value => Number.isFinite(value) && value >= 0);
    const medianDecisionDays = median(latencies);
    const decisionSpeed = medianDecisionDays == null ? 70 : Math.round(Math.max(0, Math.min(100, 120 - medianDecisionDays * 20)));

    const staleCount = published.filter(job => job.status === 'paused_stale').length;
    const staleAvoidance = Math.round(100 * (1 - staleCount / sampleSize));
    const components = { reconfirmOnTime, ghostAvoidance, decisionSpeed, staleAvoidance, medianDecisionDays };
    const rating = Math.round(0.35 * reconfirmOnTime + 0.30 * ghostAvoidance + 0.20 * decisionSpeed + 0.15 * staleAvoidance);
    const band = rating >= 85 ? 'Leading' : rating >= 70 ? 'Trusted' : rating >= 55 ? 'Developing' : 'At risk';
    return { rating, band, sampleSize, components };
  }

  function computeDemandDivergence(jobs, nowValue) {
    const nowMs = new Date(nowValue || Date.now()).getTime();
    const countSkills = source => {
      const totals = {};
      source.forEach(job => (job.requirements || [])
        .filter(req => req.type === 'skill' && req.required)
        .forEach(req => { if (req.name) totals[req.name] = (totals[req.name] || 0) + 1; }));
      return totals;
    };
    const source = jobs || [];
    const verifiedJobs = source.filter(job => job.status === 'published'
      && job.employerVerified === true
      && job.lastConfirmedAt
      && (!job.confirmationDueAt || new Date(job.confirmationDueAt).getTime() >= nowMs));
    const all = countSkills(source);
    const verified = countSkills(verifiedJobs);
    const rows = Object.keys(all).map(skill => {
      const unverifiedCount = all[skill] - (verified[skill] || 0);
      return { skill, all: all[skill], verified: verified[skill] || 0, unverifiedCount, unverifiedShare: Math.round(100 * unverifiedCount / all[skill]) };
    }).sort((a, b) => b.unverifiedCount - a.unverifiedCount || b.all - a.all);
    return { all, verified, rows, totalJobs: source.length, verifiedJobs: verifiedJobs.length };
  }

  // ---------------------------------------------------------------------
  // Transitions + audit trail.
  // ---------------------------------------------------------------------
  let auditSeq = 0;
  function makeAuditEvent(job, actor, action, fromStatus, toStatus, comment) {
    auditSeq += 1;
    return {
      id: `audit_${Date.now()}_${auditSeq}`,
      jobId: job.id,
      actorName: actor && actor.name,
      actorRole: actor && actor.role,
      action,
      fromStatus,
      toStatus,
      comment: comment || null,
      ts: new Date().toISOString()
    };
  }

  function applyTransition(job, action, actor, opts) {
    opts = opts || {};
    const fromStatus = job.status;
    const allowed = TRANSITIONS[fromStatus] || [];
    if (!allowed.includes(action)) {
      throw new Error(`Illegal transition: cannot "${action}" from status "${fromStatus}".`);
    }

    let toStatus;
    let extra = {};

    if (action === 'validate') {
      const validation = validateJob(job);
      const jobWithValidation = { ...job, validation };
      toStatus = canSubmit(jobWithValidation) ? 'draft' : 'needs_changes';
      extra.validation = validation;
    } else if (action === 'submit') {
      if (!canSubmit(job)) throw new Error('Job is not eligible for submission (blockers, score, or unacknowledged warnings).');
      toStatus = 'pending_approval';
      extra.submittedAt = new Date().toISOString();
    } else if (action === 'approve') {
      if (opts.attestation !== true) throw new Error('Approval requires manager attestation.');
      const check = canApprove(job, actor && actor.id);
      if (!check.ok) throw new Error(check.reason);
      toStatus = 'approved';
      extra.approval = { decision: 'approved', approverId: actor.id, attestation: true, reasonCategory: null, comments: opts.comment || null, ts: new Date().toISOString() };
    } else if (action === 'request_changes') {
      toStatus = 'needs_changes';
      extra.approval = { decision: 'changes_requested', approverId: actor && actor.id, attestation: false, reasonCategory: opts.reasonCategory || null, comments: opts.comment || null, ts: new Date().toISOString() };
    } else if (action === 'reject') {
      toStatus = 'rejected';
      extra.approval = { decision: 'rejected', approverId: actor && actor.id, attestation: false, reasonCategory: opts.reasonCategory || null, comments: opts.comment || null, ts: new Date().toISOString() };
    } else if (action === 'publish') {
      if (!canPublish(job)) throw new Error('Job cannot be published (must be approved with no blockers).');
      toStatus = 'published';
      const publishedAt = new Date().toISOString();
      const confirmationDays = Number(opts.confirmationDays) || 30;
      extra.publishedAt = publishedAt;
      extra.lastConfirmedAt = publishedAt;
      extra.confirmationDueAt = new Date(new Date(publishedAt).getTime() + confirmationDays * 86400000).toISOString();
      extra.confirmations = [...(job.confirmations || []), { confirmedAt: publishedAt, dueAt: null, actorId: actor && actor.id, action: 'published' }];
    } else if (action === 'withdraw') {
      toStatus = 'draft';
      extra.submittedAt = null;
    } else if (action === 'reconfirm') {
      toStatus = 'published';
      const confirmedAt = new Date().toISOString();
      const confirmationDays = Number(opts.confirmationDays) || 30;
      extra.lastConfirmedAt = confirmedAt;
      extra.confirmationDueAt = new Date(new Date(confirmedAt).getTime() + confirmationDays * 86400000).toISOString();
      extra.pausedAt = null;
      extra.confirmations = [...(job.confirmations || []), { confirmedAt, dueAt: job.confirmationDueAt || null, actorId: actor && actor.id, action: 'reconfirmed' }];
    } else if (action === 'mark_confirmation_due') {
      toStatus = 'confirmation_due';
    } else if (action === 'pause_stale') {
      toStatus = 'paused_stale';
      extra.pausedAt = new Date().toISOString();
    } else if (action === 'mark_filled') {
      toStatus = 'filled';
      extra.filledAt = new Date().toISOString();
    } else if (action === 'close') {
      toStatus = 'closed';
      extra.closedAt = new Date().toISOString();
    } else if (action === 'edit') {
      // Material edit from approved (or rejected) reverts to draft and clears approval.
      toStatus = (fromStatus === 'approved' || fromStatus === 'rejected') ? 'draft' : fromStatus;
      extra.validation = null;
      if (fromStatus === 'approved') extra.approval = null;
    } else if (action === 'acknowledge_warning') {
      if (!job.validation) throw new Error('Run validation before acknowledging warnings.');
      toStatus = fromStatus;
      extra.validation = {
        ...job.validation,
        warnings: job.validation.warnings.map(warning => warning.id === opts.warningId ? { ...warning, acknowledged: true } : warning)
      };
    }

    const newJob = { ...job, ...extra, status: toStatus };
    const auditEvent = makeAuditEvent(job, actor, action, fromStatus, toStatus, opts.comment);
    return { job: newJob, auditEvent };
  }

  const VerifyEngine = {
    RULES_VERSION,
    STATUSES,
    TRANSITIONS,
    BENCHMARKS,
    findBenchmark,
    findBlockers,
    findWarnings,
    scoreComponents,
    computeScore,
    validateJob,
    canSubmit,
    canApprove,
    canPublish,
    computeEmployerRating,
    computeDemandDivergence,
    applyTransition
  };

  if (typeof window !== 'undefined') window.VerifyEngine = VerifyEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
