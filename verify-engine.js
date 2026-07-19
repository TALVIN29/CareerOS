// CareerOS Verify deterministic posting-integrity and vacancy-lifecycle engine.
// Pure module: no DOM, Alpine, storage, network, or hidden AI decisions.
(function (root) {
  const RULES_VERSION = 'v3-risk-paths';
  const DAY = 86400000;
  const STATUSES = ['draft', 'needs_changes', 'pending_approval', 'approved', 'published', 'confirmation_due', 'paused_stale', 'filled', 'rejected', 'closed'];
  const TRANSITIONS = {
    draft: ['recalculate', 'validate', 'publish', 'submit', 'edit'],
    needs_changes: ['recalculate', 'validate', 'publish', 'submit', 'edit'],
    pending_approval: ['approve', 'request_changes', 'reject', 'withdraw'],
    approved: ['publish', 'edit', 'close'],
    published: ['reconfirm', 'mark_confirmation_due', 'pause_stale', 'mark_filled', 'close'],
    confirmation_due: ['reconfirm', 'pause_stale', 'auto_pause_stale', 'mark_filled', 'close'],
    paused_stale: ['reconfirm', 'mark_filled', 'close'],
    filled: [], rejected: ['edit'], closed: []
  };

  const BENCHMARKS = {
    'backend engineer': { medianSalaryMin: 6000, medianSalaryMax: 9000, typicalSkills: ['Node.js', 'SQL', 'REST APIs', 'Git', 'Docker', 'AWS'] },
    'data analyst': { medianSalaryMin: 3500, medianSalaryMax: 5500, typicalSkills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'] },
    'product designer': { medianSalaryMin: 5500, medianSalaryMax: 8500, typicalSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'] },
    'marketing intern': { medianSalaryMin: 1200, medianSalaryMax: 2000, typicalSkills: ['Social Media', 'Content Writing', 'Canva', 'Analytics'] },
    'cybersecurity specialist': { medianSalaryMin: 7000, medianSalaryMax: 11000, typicalSkills: ['SIEM', 'Network Security', 'ISO 27001', 'Incident Response'] },
    'software engineer': { medianSalaryMin: 5500, medianSalaryMax: 9000, typicalSkills: ['Git', 'SQL', 'System Design', 'Testing'] },
    'sales executive': { medianSalaryMin: 3000, medianSalaryMax: 5000, typicalSkills: ['CRM', 'Negotiation', 'Lead Generation'] }
  };
  // Production boundary: replace seeded benchmarks with authorised market or
  // AI evidence, while keeping this deterministic policy as the final arbiter.
  const PAYMENT_KEYWORDS = ['registration fee', 'processing fee', 'pay a fee', 'deposit required', 'training fee', 'pay to apply', 'application fee'];
  const BANKING_KEYWORDS = ['bank account number', 'bank statement', 'ic number', 'passport number', 'credit card number', 'online banking login'];
  const DISCRIMINATORY_KEYWORDS = ['must be male', 'must be female', 'no disabilities', 'single status only', 'age below 30 only', 'malay only', 'chinese only', 'indian only'];

  const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
  const issue = (id, message, field, severity = 'attention') => ({ id, message, field, severity, acknowledged: false });
  const nowIso = opts => new Date(opts?.now || Date.now()).toISOString();
  function findBenchmark(title) {
    const text = String(title || '').toLowerCase();
    return Object.entries(BENCHMARKS).find(([key]) => text.includes(key))?.[1] || null;
  }
  function jobText(job) {
    return [job.title, job.summary, ...(job.responsibilities || []), ...(job.requirements || []).flatMap(req => [req.name, req.justification])]
      .filter(Boolean).join(' ').toLowerCase();
  }
  function hasAny(text, keywords) { return keywords.some(keyword => text.includes(keyword)); }
  function maxExperience(job) {
    return (job.requirements || []).filter(req => req.type === 'experience' && req.required)
      .reduce((max, req) => Math.max(max, Number(req.yearsExperience) || 0), 0);
  }
  function titleMismatch(job) {
    if (!job.title || !(job.responsibilities || []).length) return false;
    const words = job.title.toLowerCase().split(/\W+/).filter(word => word.length > 3);
    const duties = job.responsibilities.join(' ').toLowerCase();
    return words.length > 0 && !words.some(word => duties.includes(word));
  }
  function salaryPresent(job) { return Number(job.salaryMin) > 0 && Number(job.salaryMax) > 0; }
  function salaryConflict(job) { return salaryPresent(job) && Number(job.salaryMin) > Number(job.salaryMax); }
  function evidenceIsRecent(job, nowValue) {
    if (!job.approvalEvidenceDate) return false;
    const age = new Date(nowValue || Date.now()).getTime() - new Date(job.approvalEvidenceDate).getTime();
    return Number.isFinite(age) && age >= -DAY && age <= 180 * DAY;
  }

  function calculatePostingIntegrity(job, options = {}) {
    job = job || {};
    const benchmark = findBenchmark(job.title);
    const text = jobText(job);
    const hardBlockers = [];
    const warnings = [];
    const passedChecks = [];
    const addBlocker = (id, message, field) => hardBlockers.push(issue(id, message, field, 'material'));
    const addWarning = (id, message, field, severity) => warnings.push(issue(id, message, field, severity));
    const pass = (id, message) => passedChecks.push({ id, message });

    if (!job.title?.trim()) addBlocker('missing-title', 'Add a clear job title.', 'title'); else pass('title-present', 'Job title is present.');
    if (!job.summary?.trim()) addBlocker('missing-description', 'Add a job description before this vacancy can move forward.', 'summary');
    if (!job.hiringManagerId) addBlocker('missing-hiring-manager', 'Assign the accountable Hiring Manager.', 'hiringManagerId'); else pass('manager-assigned', 'Hiring Manager is assigned.');
    if (!job.requisitionId || job.headcountApproved !== true) addBlocker('missing-approval-evidence', 'Link an approved requisition or headcount reference.', 'requisitionId'); else pass('approval-linked', 'Approved requisition and headcount evidence are linked.');
    if (salaryConflict(job)) addBlocker('salary-conflict', 'Minimum salary cannot be higher than maximum salary.', 'salaryMin');
    if (job.seriousDuplicateRisk === true) addBlocker('serious-duplicate-risk', 'A serious duplicate or impersonation risk requires confirmation.', 'title');
    if (job.republishRequested && job.previousStatus === 'paused_stale') addBlocker('stale-republish', 'A previously stale vacancy requires fresh manager confirmation.', 'requisitionId');
    if (hasAny(text, PAYMENT_KEYWORDS)) addBlocker('candidate-payment-requested', 'Remove the request for candidate payment.', 'summary');
    if (hasAny(text, BANKING_KEYWORDS)) addBlocker('sensitive-id-requested', 'Remove requests for banking or sensitive identity information.', 'summary');
    if (hasAny(text, DISCRIMINATORY_KEYWORDS)) addBlocker('discriminatory-requirement', 'Remove the discriminatory or unlawful requirement.', 'requirements');

    if (!salaryPresent(job)) addWarning('missing-salary', 'Add a salary range or explain why it is unavailable.', 'salaryMin');
    if (!job.employmentType) addWarning('missing-employment-type', 'Select an employment type.', 'employmentType');
    if (!job.targetStartDate) addWarning('missing-hiring-timeline', 'Add the intended hiring timeline.', 'targetStartDate');
    if (!job.location && job.workplace !== 'remote') addWarning('unclear-location', 'Clarify the location or remote arrangement.', 'location');
    if (job.summary && job.summary.trim().length < 80) addWarning('short-description', 'Expand the job description with the role’s purpose and outcomes.', 'summary');
    const experience = maxExperience(job);
    if (job.seniority === 'entry' && experience > 3) addWarning('entry-overexperience', 'Experience requirement is high for an Entry-level role.', 'requirements');
    if (job.seniority === 'intern' && experience > 2) addWarning('intern-overexperience', 'Experience requirement is high for an Internship.', 'requirements');
    const requiredSkills = (job.requirements || []).filter(req => req.type === 'skill' && req.required);
    if (requiredSkills.length > 8) addWarning('too-many-skills', 'Reduce the required skills to the genuine essentials.', 'requirements');
    const names = (job.requirements || []).map(req => String(req.name || '').trim().toLowerCase()).filter(Boolean);
    if (new Set(names).size !== names.length) addWarning('duplicate-requirements', 'Remove duplicate requirements.', 'requirements');
    if (titleMismatch(job)) addWarning('title-responsibility-mismatch', 'Align the responsibilities with the job title.', 'responsibilities');
    if (job.salaryVisible === false) addWarning('salary-hidden', 'Salary is hidden from candidates.', 'salaryVisible');
    if (!job.approvalEvidenceSource) addWarning('missing-evidence-source', 'Identify the ATS or approval source for this requisition.', 'approvalEvidenceSource');
    if (!evidenceIsRecent(job, options.now)) addWarning('stale-evidence-date', 'Add a recent approval-evidence date.', 'approvalEvidenceDate');

    let approval = 0;
    if (job.requisitionId) approval += 7;
    if (job.headcountApproved === true) approval += 8;
    if (job.budgetApproved === true) approval += 5;
    if (job.hiringManagerId) approval += 7;
    if (job.approvalEvidenceSource) approval += 4;
    if (evidenceIsRecent(job, options.now)) approval += 4;

    let completeness = 0;
    if (job.title?.trim()) completeness += 2;
    if (job.summary?.trim()?.length >= 80) completeness += 4;
    if (job.location || job.workplace === 'remote') completeness += 2;
    if (job.employmentType) completeness += 2;
    if (job.seniority) completeness += 2;
    if (salaryPresent(job) && !salaryConflict(job)) completeness += 3;
    if (job.targetStartDate) completeness += 3;
    if ((job.responsibilities || []).length >= 2) completeness += 2;

    let realism = 20;
    if (warnings.some(item => ['entry-overexperience', 'intern-overexperience'].includes(item.id))) realism -= 7;
    if (warnings.some(item => item.id === 'too-many-skills')) realism -= 5;
    if (warnings.some(item => item.id === 'duplicate-requirements')) realism -= 4;
    if (!(job.requirements || []).some(req => req.name?.trim())) realism -= 4;
    realism = Math.max(0, realism);

    let consistency = 15;
    if (salaryConflict(job)) consistency = 0;
    else {
      if (warnings.some(item => item.id === 'title-responsibility-mismatch')) consistency -= 6;
      if (warnings.some(item => item.id === 'duplicate-requirements')) consistency -= 3;
      if (!job.workplace) consistency -= 2;
    }
    consistency = Math.max(0, consistency);

    let market = 6;
    if (benchmark && salaryPresent(job) && !salaryConflict(job)) {
      const overlaps = Number(job.salaryMin) <= benchmark.medianSalaryMax && Number(job.salaryMax) >= benchmark.medianSalaryMin;
      const within = Number(job.salaryMin) >= benchmark.medianSalaryMin * 0.8 && Number(job.salaryMax) <= benchmark.medianSalaryMax * 1.2;
      market = within ? 10 : overlaps ? 8 : 4;
      if (!overlaps) addWarning('market-deviation', 'Salary differs from the demonstration market range; review the context.', 'salaryMax', 'supporting');
    } else if (!benchmark) {
      addWarning('limited-market-evidence', 'Comparable market evidence is limited; this does not block the role.', 'title', 'supporting');
    }

    const factors = { approvalEvidence: approval, completeness, requirementRealism: realism, internalConsistency: consistency, marketComparison: market };
    const rawScore = clamp(Object.values(factors).reduce((sum, value) => sum + value, 0));
    const actionableWarnings = warnings.filter(item => item.severity !== 'supporting');
    const redThreshold = Number(options.minimumScore) || 60;
    const score = hardBlockers.length
      ? Math.min(rawScore, redThreshold - 1)
      : (actionableWarnings.length ? Math.min(rawScore, 79) : rawScore);
    const riskLevel = hardBlockers.length || score < redThreshold ? 'red' : (score < 80 || actionableWarnings.length ? 'amber' : 'green');
    const recommendedAction = riskLevel === 'green' ? 'publish' : riskLevel === 'amber' ? 'resolve_issues' : 'manager_confirmation';
    const topReasons = [...hardBlockers, ...actionableWarnings, ...warnings.filter(item => item.severity === 'supporting')].slice(0, 3);
    const components = {
      approvalEvidence: Math.round(approval / 35 * 100), completeness: completeness * 5,
      requirementRealism: realism * 5, internalConsistency: Math.round(consistency / 15 * 100), marketComparison: market * 10
    };
    return {
      score, riskLevel, hardBlockers, blockers: hardBlockers, warnings, passedChecks, passed: passedChecks,
      topReasons, recommendedAction, factors, components, thresholds: { redBelow: redThreshold, greenAt: 80 }, validatedAt: nowIso(options), rulesVersion: RULES_VERSION
    };
  }

  const validateJob = calculatePostingIntegrity;
  const findBlockers = job => calculatePostingIntegrity(job).hardBlockers;
  const findWarnings = job => calculatePostingIntegrity(job).warnings;
  const scoreComponents = job => calculatePostingIntegrity(job).components;
  const computeScore = components => {
    if ('approvalEvidence' in components) return clamp(components.approvalEvidence + components.completeness + components.requirementRealism + components.internalConsistency + components.marketComparison);
    return clamp(0.35 * (components.A || 0) + 0.20 * (components.P || components.V || 0) + 0.20 * (components.R || 0) + 0.15 * (components.C || components.M || 0) + 0.10 * (components.M || components.Q || 0));
  };
  function canRequestConfirmation(job, options) {
    const result = calculatePostingIntegrity(job, options);
    const unsafe = result.hardBlockers.some(item => ['missing-title', 'missing-description', 'missing-hiring-manager', 'salary-conflict', 'candidate-payment-requested', 'sensitive-id-requested', 'discriminatory-requirement'].includes(item.id));
    return result.riskLevel === 'red' && !unsafe && Boolean(job.recruiterId);
  }
  const canSubmit = canRequestConfirmation;
  function canApprove(job, userId) {
    if (job.status !== 'pending_approval') return { ok: false, reason: 'Job is not awaiting manager confirmation.' };
    if (!userId || userId !== job.hiringManagerId) return { ok: false, reason: 'Only the assigned Hiring Manager can confirm this vacancy.' };
    if (userId === job.recruiterId) return { ok: false, reason: 'A job creator cannot confirm their own vacancy.' };
    return { ok: true, reason: null };
  }
  function canPublish(job, options) {
    const integrity = calculatePostingIntegrity(job, options);
    const direct = ['draft', 'needs_changes'].includes(job.status) && integrity.riskLevel === 'green';
    const confirmed = job.status === 'approved' && job.approval?.decision === 'approved' && job.approval.approverId !== job.recruiterId;
    const unsafe = integrity.hardBlockers.some(item => ['missing-title', 'missing-description', 'missing-hiring-manager', 'salary-conflict', 'candidate-payment-requested', 'sensitive-id-requested', 'discriminatory-requirement'].includes(item.id));
    return (direct || confirmed) && !unsafe;
  }

  function median(values) {
    if (!values.length) return null;
    const ordered = values.slice().sort((a, b) => a - b); const middle = Math.floor(ordered.length / 2);
    return ordered.length % 2 ? ordered[middle] : (ordered[middle - 1] + ordered[middle]) / 2;
  }
  // --- Vacancy outcome analysis ---------------------------------------------
  // A published requisition ends filled (the event), abandoned (paused stale or
  // closed with no hire), or is still open. Still-open rows are RIGHT-CENSORED:
  // they have survived at least this long and nothing more is known. Deleting
  // them biases every median downward, because the long-running open roles are
  // exactly the ones most likely to become ghosts. So time-to-fill is estimated
  // with Kaplan-Meier rather than averaged.
  //
  // ponytail: abandonment is treated as censoring for the fill curve and
  // reported separately as a rate. That is informative censoring - roles are
  // abandoned precisely because they are hard to fill - so the curve reads
  // slightly optimistic. Read it as "days to fill among roles still being
  // pursued". A Fine-Gray competing-risks model is the upgrade path if the
  // abandonment rate ever climbs high enough for the bias to matter.
  const MIN_COHORT = 8;
  const bandYears = years => years <= 2 ? '0-2' : years <= 4 ? '3-4' : years <= 6 ? '5-6' : '7+';
  const bandSkills = count => count <= 4 ? '1-4' : count <= 7 ? '5-7' : '8+';
  function requiredSkillCount(job) { return (job.requirements || []).filter(req => req.type === 'skill' && req.required).length; }

  function vacancyOutcome(job, nowValue) {
    const nowMs = new Date(nowValue || Date.now()).getTime();
    const start = job.publishedAt ? new Date(job.publishedAt).getTime() : NaN;
    if (!Number.isFinite(start)) return null;
    const daysFrom = end => Math.max(0, Math.round((new Date(end).getTime() - start) / DAY));
    if (job.status === 'filled' && job.filledAt) return { days: daysFrom(job.filledAt), outcome: 'filled' };
    if (job.status === 'paused_stale') return { days: daysFrom(job.pausedAt || job.updatedAt || nowMs), outcome: 'abandoned' };
    if (job.status === 'closed' && !job.filledAt) return { days: daysFrom(job.closedAt || job.updatedAt || nowMs), outcome: 'abandoned' };
    if (['published', 'confirmation_due'].includes(job.status)) return { days: daysFrom(nowMs), outcome: 'censored' };
    return null;
  }

  function survivalCurve(jobs, nowValue) {
    const rows = (jobs || []).map(job => vacancyOutcome(job, nowValue)).filter(Boolean);
    const sampleSize = rows.length;
    if (sampleSize < MIN_COHORT) return { points: [], medianDays: null, sampleSize, sufficient: false };
    const eventDays = [...new Set(rows.filter(row => row.outcome === 'filled').map(row => row.days))].sort((a, b) => a - b);
    const points = [{ day: 0, survival: 1, atRisk: sampleSize, events: 0 }];
    let survival = 1;
    eventDays.forEach(day => {
      const atRisk = rows.filter(row => row.days >= day).length;
      if (!atRisk) return;
      const events = rows.filter(row => row.outcome === 'filled' && row.days === day).length;
      survival *= 1 - events / atRisk;
      points.push({ day, survival, atRisk, events });
    });
    // Median is the first time the curve drops to or below 0.5. If it never
    // does, the median is NOT REACHED - report null, never extrapolate.
    const crossing = points.find(point => point.survival <= 0.5);
    return { points, medianDays: crossing ? crossing.day : null, sampleSize, sufficient: true };
  }

  function abandonmentRate(jobs, nowValue) {
    const settled = (jobs || []).map(job => vacancyOutcome(job, nowValue)).filter(row => row && row.outcome !== 'censored');
    if (!settled.length) return null;
    return Math.round(100 * settled.filter(row => row.outcome === 'abandoned').length / settled.length);
  }

  function cohortSpec(job) {
    return { seniority: job.seniority || null, yearsBand: bandYears(maxExperience(job)), skillBand: bandSkills(requiredSkillCount(job)) };
  }
  // ponytail: the cohort key is seniority + years band + required-skill band.
  // Location and salary are deliberately excluded - each extra dimension
  // multiplies the number of cells, and at demo volume a five-dimension key
  // returns "insufficient evidence" almost everywhere. Years and skill count
  // earn their place because they are the two levers the recruiter can
  // actually pull. Add location back when volume supports it.
  function cohort(jobs, spec = {}) {
    return (jobs || []).filter(job => (!spec.seniority || job.seniority === spec.seniority)
      && (!spec.yearsBand || bandYears(maxExperience(job)) === spec.yearsBand)
      && (!spec.skillBand || bandSkills(requiredSkillCount(job)) === spec.skillBand));
  }

  function cohortStats(jobs, nowValue) {
    const curve = survivalCurve(jobs, nowValue);
    return { medianDays: curve.medianDays, sampleSize: curve.sampleSize, sufficient: curve.sufficient, abandonment: abandonmentRate(jobs, nowValue), points: curve.points };
  }

  // Greedy, one factor at a time: re-run the cohort with a single requirement
  // relaxed and keep whichever change moves the median most. Not a model.
  function requirementAutopsy(job, corpus, nowValue) {
    const spec = cohortSpec(job);
    const base = cohortStats(cohort(corpus, spec), nowValue);
    const years = maxExperience(job);
    const skills = requiredSkillCount(job);
    const variants = [];
    if (years > 2) {
      const relaxed = Math.max(0, years - 3);
      variants.push({ field: 'experience', change: `Ask ${relaxed} years of experience instead of ${years}`, ...cohortStats(cohort(corpus, { ...spec, yearsBand: bandYears(relaxed) }), nowValue) });
    }
    if (skills > 4) {
      variants.push({ field: 'requirements', change: `Mark 4 skills as required instead of ${skills}`, ...cohortStats(cohort(corpus, { ...spec, skillBand: bandSkills(4) }), nowValue) });
    }
    const improved = variants.filter(variant => variant.sufficient && variant.medianDays != null
      && (base.medianDays == null || variant.medianDays < base.medianDays));
    return { base, variants, best: improved.sort((a, b) => a.medianDays - b.medianDays)[0] || null };
  }

  // The honest denominator: how often a skill appears in postings that actually
  // produced a hire, against how often it is advertised. A hire is an event
  // outside this system, so unlike "verified" it cannot measure our own reach.
  // minAdvertised keeps one-off skills out of the ranking: a skill advertised
  // twice and hired zero times is 0% conversion and means nothing.
  function realisedDemand(jobs, minAdvertised = 5) {
    const countSkills = source => source.reduce((totals, job) => {
      (job.requirements || []).filter(req => req.type === 'skill' && req.required).forEach(req => { if (req.name) totals[req.name] = (totals[req.name] || 0) + 1; });
      return totals;
    }, {});
    const posted = (jobs || []).filter(job => job.publishedAt);
    const hired = posted.filter(job => job.status === 'filled' && job.filledAt);
    const advertised = countSkills(posted);
    const realised = countSkills(hired);
    const rows = Object.keys(advertised).filter(skill => advertised[skill] >= minAdvertised).map(skill => {
      const ads = advertised[skill];
      const hires = realised[skill] || 0;
      return { skill, advertised: ads, hired: hires, conversion: Math.round(100 * hires / ads), phantom: ads - hires };
    }).sort((a, b) => a.conversion - b.conversion || b.advertised - a.advertised);
    return { rows, totalPostings: posted.length, totalHires: hired.length, sufficient: posted.length >= MIN_COHORT };
  }

  // Award standing: what a student-voted employer award looks like once part of
  // it is behavioural rather than purely perceptual.
  //
  // Today the award ranks employers on what students believe about them. Adding
  // the employer's observed vacancy behaviour is what makes honest posting
  // self-enforcing: employers already compete for the award, so compliance stops
  // being a cost they resent.
  //
  // BEHAVIOUR_WEIGHT is a placeholder. How much behaviour should count is the
  // award owner's policy decision, not this engine's - the mechanism is the
  // proposal, the number is not.
  const BEHAVIOUR_WEIGHT = 0.4;
  function computeAwardStanding(orgs, behaviourWeight = BEHAVIOUR_WEIGHT) {
    const scored = (orgs || []).map(org => {
      const perception = Number(org.perceptionScore) || 0;
      const behaviour = org.rating == null ? null : Number(org.rating);
      // An employer with no behavioural sample keeps their perception score
      // rather than being penalised for absence of evidence.
      const combined = behaviour == null ? perception : Math.round(perception * (1 - behaviourWeight) + behaviour * behaviourWeight);
      return { ...org, perception, behaviour, combined };
    });
    const rank = (list, key) => list.slice().sort((a, b) => b[key] - a[key]).map((item, index) => [item.id, index + 1]);
    const perceptionRanks = new Map(rank(scored, 'perception'));
    const combinedRanks = new Map(rank(scored, 'combined'));
    return scored.map(org => ({
      ...org,
      perceptionRank: perceptionRanks.get(org.id),
      combinedRank: combinedRanks.get(org.id),
      movement: perceptionRanks.get(org.id) - combinedRanks.get(org.id)
    })).sort((a, b) => a.combinedRank - b.combinedRank);
  }

  function computeEmployerRating(jobs, nowValue) {
    const nowMs = new Date(nowValue || Date.now()).getTime();
    const published = (jobs || []).filter(job => job.publishedAt || ['published', 'confirmation_due', 'paused_stale', 'filled', 'closed'].includes(job.status));
    const sampleSize = published.length;
    if (sampleSize < 3) return { rating: null, band: 'Insufficient evidence', sampleSize, components: null };
    const dueChecks = [];
    published.forEach(job => {
      (job.confirmations || []).forEach(item => item.dueAt && dueChecks.push(new Date(item.confirmedAt) <= new Date(item.dueAt)));
      if (!(job.confirmations || []).length && job.confirmationDueAt && new Date(job.confirmationDueAt).getTime() <= nowMs) dueChecks.push(Boolean(job.lastConfirmedAt) && new Date(job.lastConfirmedAt) <= new Date(job.confirmationDueAt));
    });
    const reconfirmOnTime = dueChecks.length ? Math.round(100 * dueChecks.filter(Boolean).length / dueChecks.length) : 100;
    const completed = published.filter(job => ['closed', 'filled'].includes(job.status));
    const ghostAvoidance = completed.length ? Math.round(100 * (1 - completed.filter(job => job.status === 'closed' && !job.filledAt).length / completed.length)) : 100;
    const latencies = published.filter(job => job.submittedAt && job.approval?.ts).map(job => (new Date(job.approval.ts) - new Date(job.submittedAt)) / DAY).filter(value => value >= 0);
    const medianDecisionDays = median(latencies);
    const decisionSpeed = medianDecisionDays == null ? 70 : clamp(120 - medianDecisionDays * 20);
    const staleAvoidance = Math.round(100 * (1 - published.filter(job => job.status === 'paused_stale').length / sampleSize));
    const components = { reconfirmOnTime, ghostAvoidance, decisionSpeed, staleAvoidance, medianDecisionDays };
    const rating = Math.round(.35 * reconfirmOnTime + .30 * ghostAvoidance + .20 * decisionSpeed + .15 * staleAvoidance);
    return { rating, band: rating >= 85 ? 'Leading' : rating >= 70 ? 'Trusted' : rating >= 55 ? 'Developing' : 'At risk', sampleSize, components };
  }

  let auditSeq = 0;
  function makeAuditEvent(job, actor, action, fromStatus, toStatus, comment, opts) {
    return { id: `audit_${Date.now()}_${++auditSeq}`, jobId: job.id, actorName: actor?.name, actorRole: actor?.role, action, fromStatus, toStatus, comment: comment || null, ts: nowIso(opts) };
  }
  function applyTransition(job, action, actor, opts = {}) {
    const fromStatus = job.status;
    if (!(TRANSITIONS[fromStatus] || []).includes(action)) throw new Error(`Illegal transition: cannot "${action}" from status "${fromStatus}".`);
    const timestamp = nowIso(opts); let toStatus = fromStatus; let extra = {};
    if (['recalculate', 'validate'].includes(action)) {
      const validation = calculatePostingIntegrity(job, opts);
      toStatus = validation.riskLevel === 'green' ? 'draft' : 'needs_changes'; extra.validation = validation;
    } else if (action === 'submit') {
      if (!canRequestConfirmation(job, opts)) throw new Error('This vacancy is not eligible for Manager Confirmation. Resolve the highlighted routing issues first.');
      toStatus = 'pending_approval'; extra = { submittedAt: timestamp, validation: calculatePostingIntegrity(job, opts) };
    } else if (action === 'approve') {
      if (opts.attestation !== true) throw new Error('Manager Confirmation requires the attestation.');
      const check = canApprove(job, actor?.id || actor?.userId); if (!check.ok) throw new Error(check.reason);
      toStatus = 'approved'; extra.approval = { decision: 'approved', approverId: actor.id || actor.userId, attestation: true, reasonCategory: null, comments: opts.comment || null, ts: timestamp };
    } else if (action === 'request_changes') {
      toStatus = 'needs_changes'; extra.approval = { decision: 'changes_requested', approverId: actor?.id || actor?.userId, attestation: false, reasonCategory: opts.reasonCategory || null, comments: opts.comment, ts: timestamp };
    } else if (action === 'reject') {
      toStatus = 'rejected'; extra.approval = { decision: 'rejected', approverId: actor?.id || actor?.userId, attestation: false, reasonCategory: opts.reasonCategory || null, comments: opts.comment, ts: timestamp };
    } else if (action === 'publish') {
      if (!canPublish(job, opts)) throw new Error('This vacancy is not ready to publish. Follow the Posting Integrity recommendation.');
      const confirmationDays = Number(opts.confirmationDays) || 30;
      toStatus = 'published'; extra = { publishedAt: timestamp, lastConfirmedAt: timestamp, confirmationDueAt: new Date(new Date(timestamp).getTime() + confirmationDays * DAY).toISOString(), validation: calculatePostingIntegrity(job, opts), confirmations: [...(job.confirmations || []), { confirmedAt: timestamp, dueAt: null, actorId: actor?.id || actor?.userId, action: 'published' }] };
    } else if (action === 'withdraw') { toStatus = 'draft'; extra.submittedAt = null; }
    else if (action === 'reconfirm') {
      const confirmationDays = Number(opts.confirmationDays) || 30; toStatus = 'published';
      extra = { lastConfirmedAt: timestamp, confirmationDueAt: new Date(new Date(timestamp).getTime() + confirmationDays * DAY).toISOString(), pausedAt: null, confirmations: [...(job.confirmations || []), { confirmedAt: timestamp, dueAt: job.confirmationDueAt || null, actorId: actor?.id || actor?.userId, action: 'reconfirmed' }] };
    } else if (action === 'mark_confirmation_due') toStatus = 'confirmation_due';
    else if (['pause_stale', 'auto_pause_stale'].includes(action)) { toStatus = 'paused_stale'; extra.pausedAt = timestamp; if (action === 'auto_pause_stale') extra.pausedAutomatically = true; }
    // The hire's university closes the loop: it is what turns an advertised
    // skill into a realised one, and it is already collected annually today.
    else if (action === 'mark_filled') { toStatus = 'filled'; extra.filledAt = timestamp; if (opts.hireUniversity) extra.hireUniversity = opts.hireUniversity; }
    else if (action === 'close') { toStatus = 'closed'; extra.closedAt = timestamp; }
    else if (action === 'edit') { toStatus = ['approved', 'rejected'].includes(fromStatus) ? 'draft' : fromStatus; extra.approval = fromStatus === 'approved' ? null : job.approval; }
    const newJob = { ...job, ...extra, status: toStatus };
    return { job: newJob, auditEvent: makeAuditEvent(job, actor, action, fromStatus, toStatus, opts.comment, opts) };
  }
  function applyFreshnessPolicy(jobs, policy = {}, nowValue) {
    const now = new Date(nowValue || Date.now()); const graceDays = Number(policy.graceDays) || 7; const events = [];
    const system = { id: 'system-policy', name: 'CareerOS Policy Engine', role: 'system' };
    const updatedJobs = (jobs || []).map(original => {
      let job = original;
      if (job.status === 'published' && job.confirmationDueAt && new Date(job.confirmationDueAt) <= now) {
        const result = applyTransition(job, 'mark_confirmation_due', system, { now, comment: 'Active-hiring confirmation is now due.' }); job = result.job; events.push(result.auditEvent);
      }
      if (job.status === 'confirmation_due' && job.confirmationDueAt && new Date(job.confirmationDueAt).getTime() + graceDays * DAY <= now.getTime()) {
        const result = applyTransition(job, 'auto_pause_stale', system, { now, comment: 'Automatically paused after the confirmation grace period expired.' }); job = result.job; events.push(result.auditEvent);
      }
      return job;
    });
    return { jobs: updatedJobs, auditEvents: events };
  }

  const VerifyEngine = { RULES_VERSION, STATUSES, TRANSITIONS, BENCHMARKS, findBenchmark, calculatePostingIntegrity, validateJob, findBlockers, findWarnings, scoreComponents, computeScore, canRequestConfirmation, canSubmit, canApprove, canPublish, computeEmployerRating, computeAwardStanding, BEHAVIOUR_WEIGHT, applyTransition, applyFreshnessPolicy,
    MIN_COHORT, vacancyOutcome, survivalCurve, abandonmentRate, cohort, cohortSpec, cohortStats, requirementAutopsy, realisedDemand };
  if (typeof window !== 'undefined') window.VerifyEngine = VerifyEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = VerifyEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
