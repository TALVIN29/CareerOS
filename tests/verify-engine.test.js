import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadUmd(file) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'), { module, console, globalThis: {} }, { filename: file });
  return module.exports;
}

const Engine = loadUmd('verify-engine.js');
const Seeds = loadUmd('verify-seeds.js');
const clone = value => JSON.parse(JSON.stringify(value));
const recruiter = { id: 'user-recruiter-alicia', userId: 'user-recruiter-alicia', name: 'Alicia Tan', role: 'recruiter' };
const manager = { id: 'user-manager-daniel', userId: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' };
let passed = 0;
function test(name, fn) { fn(); passed += 1; console.log(`PASS: ${name}`); }

test('integrity score is the transparent sum of 35/20/20/15/10 factors', () => {
  const result = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.green, { now: '2026-07-17' });
  assert.deepEqual(JSON.parse(JSON.stringify(result.factors)), { approvalEvidence: 35, completeness: 20, requirementRealism: 20, internalConsistency: 15, marketComparison: 10 });
  assert.equal(result.score, 100);
});

test('calculation is deterministic apart from its timestamp', () => {
  const first = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.amber, { now: '2026-07-17' });
  const second = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.amber, { now: '2026-07-17' });
  assert.deepEqual(first, second);
});

test('Green route is ready for direct publication', () => {
  const result = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.green, { now: '2026-07-17' });
  assert.equal(result.riskLevel, 'green');
  assert.equal(result.recommendedAction, 'publish');
  assert.equal(result.hardBlockers.length, 0);
});

test('Amber route exposes only actionable quick fixes', () => {
  const result = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.amber, { now: '2026-07-17' });
  assert.equal(result.riskLevel, 'amber');
  assert.equal(result.recommendedAction, 'resolve_issues');
  assert.deepEqual(JSON.parse(JSON.stringify(result.topReasons.map(item => item.id))), ['short-description', 'entry-overexperience', 'too-many-skills']);
  assert.ok(result.topReasons.length <= 3);
});

test('hard blockers keep the displayed score inside the Red band', () => {
  const result = Engine.calculatePostingIntegrity(Seeds.DEMO_DRAFTS.red, { now: '2026-07-17' });
  assert.ok(result.score < 60);
  assert.equal(result.riskLevel, 'red');
  assert.ok(result.hardBlockers.some(item => item.id === 'missing-approval-evidence'));
});

test('missing manager, title, description, contradictions and unsafe content are hard blockers', () => {
  const base = clone(Seeds.DEMO_DRAFTS.green);
  const cases = [
    [{ hiringManagerId: '' }, 'missing-hiring-manager'],
    [{ title: '' }, 'missing-title'],
    [{ summary: '' }, 'missing-description'],
    [{ salaryMin: 9000, salaryMax: 5000 }, 'salary-conflict'],
    [{ summary: 'Candidates must pay a processing fee before interview.' }, 'candidate-payment-requested']
  ];
  cases.forEach(([change, id]) => assert.ok(Engine.calculatePostingIntegrity({ ...base, ...change }).hardBlockers.some(item => item.id === id), id));
});

test('limited market comparison never blocks an otherwise complete specialised role', () => {
  const role = { ...clone(Seeds.DEMO_DRAFTS.green), title: 'Quantum Workforce Architect', responsibilities: ['Design quantum workforce architecture', 'Maintain architecture controls', 'Partner with research teams on delivery'] };
  const result = Engine.calculatePostingIntegrity(role, { now: '2026-07-17' });
  assert.equal(result.riskLevel, 'green');
  assert.ok(result.warnings.some(item => item.id === 'limited-market-evidence' && item.severity === 'supporting'));
});

test('Green vacancy publishes without a separate validation or manager step', () => {
  const job = { ...clone(Seeds.DEMO_DRAFTS.green), status: 'draft' };
  assert.equal(Engine.canPublish(job), true);
  const result = Engine.applyTransition(job, 'publish', recruiter, { now: '2026-07-17', confirmationDays: 30 });
  assert.equal(result.job.status, 'published');
  assert.equal(result.auditEvent.fromStatus, 'draft');
  assert.match(result.job.confirmationDueAt, /^2026-08-16/);
});

test('Amber vacancy cannot publish or enter manager confirmation', () => {
  const job = { ...clone(Seeds.DEMO_DRAFTS.amber), status: 'needs_changes' };
  assert.equal(Engine.canPublish(job), false);
  assert.equal(Engine.canRequestConfirmation(job), false);
  assert.throws(() => Engine.applyTransition(job, 'publish', recruiter), /not ready/i);
  assert.throws(() => Engine.applyTransition(job, 'submit', recruiter), /not eligible/i);
});

test('Red vacancy with a valid route can be sent for Manager Confirmation', () => {
  const job = { ...clone(Seeds.DEMO_DRAFTS.red), status: 'draft' };
  assert.equal(Engine.canRequestConfirmation(job), true);
  const result = Engine.applyTransition(job, 'submit', recruiter, { now: '2026-07-17' });
  assert.equal(result.job.status, 'pending_approval');
  assert.equal(result.auditEvent.toStatus, 'pending_approval');
});

test('manager confirmation requires attestation and assignment', () => {
  const pending = Engine.applyTransition({ ...clone(Seeds.DEMO_DRAFTS.red), status: 'draft' }, 'submit', recruiter).job;
  assert.throws(() => Engine.applyTransition(pending, 'approve', manager, {}), /attestation/i);
  assert.throws(() => Engine.applyTransition(pending, 'approve', { ...manager, id: 'other-manager' }, { attestation: true }), /assigned/i);
  assert.doesNotThrow(() => Engine.applyTransition(pending, 'approve', manager, { attestation: true }));
});

test('job creator cannot confirm their own job', () => {
  const pending = { ...clone(Seeds.DEMO_DRAFTS.red), status: 'pending_approval', hiringManagerId: recruiter.id };
  assert.equal(Engine.canApprove(pending, recruiter.id).ok, false);
  assert.throws(() => Engine.applyTransition(pending, 'approve', recruiter, { attestation: true }), /cannot confirm/i);
});

test('manager-confirmed Red vacancy becomes publishable by its recruiter', () => {
  const pending = Engine.applyTransition({ ...clone(Seeds.DEMO_DRAFTS.red), status: 'draft' }, 'submit', recruiter).job;
  const approved = Engine.applyTransition(pending, 'approve', manager, { attestation: true }).job;
  assert.equal(approved.status, 'approved');
  assert.equal(Engine.canPublish(approved), true);
  assert.equal(Engine.applyTransition(approved, 'publish', recruiter).job.status, 'published');
});

test('editing a manager-confirmed job clears its confirmation', () => {
  const approved = { ...clone(Seeds.JOBS.find(job => job.id === 'job_product_designer')) };
  const edited = Engine.applyTransition(approved, 'edit', recruiter).job;
  assert.equal(edited.status, 'draft');
  assert.equal(edited.approval, null);
});

test('request changes and reject require the pending confirmation state', () => {
  const pending = { ...clone(Seeds.DEMO_DRAFTS.red), status: 'pending_approval' };
  assert.equal(Engine.applyTransition(pending, 'request_changes', manager, { comment: 'Clarify funding.' }).job.status, 'needs_changes');
  assert.equal(Engine.applyTransition(pending, 'reject', manager, { comment: 'Role is no longer required.' }).job.status, 'rejected');
  assert.throws(() => Engine.applyTransition({ ...pending, status: 'draft' }, 'reject', manager), /Illegal transition/);
});

test('reconfirmation is one transition and extends the deadline', () => {
  const due = { ...clone(Seeds.JOBS.find(job => job.id === 'job_operations_confirmation')), status: 'confirmation_due' };
  const result = Engine.applyTransition(due, 'reconfirm', manager, { now: '2026-07-17', confirmationDays: 30 });
  assert.equal(result.job.status, 'published');
  assert.match(result.job.confirmationDueAt, /^2026-08-16/);
  assert.equal(result.auditEvent.action, 'reconfirm');
});

test('confirmation choices can fill or pause without repeating approval', () => {
  const due = { ...clone(Seeds.JOBS.find(job => job.id === 'job_operations_confirmation')), status: 'confirmation_due' };
  assert.equal(Engine.applyTransition(due, 'mark_filled', manager).job.status, 'filled');
  assert.equal(Engine.applyTransition(due, 'pause_stale', manager).job.status, 'paused_stale');
});

test('freshness policy marks due jobs and automatically pauses after grace', () => {
  const base = { ...clone(Seeds.DEMO_DRAFTS.green), status: 'published', publishedAt: '2026-06-01', lastConfirmedAt: '2026-06-01' };
  const due = Engine.applyFreshnessPolicy([{ ...base, id: 'due', confirmationDueAt: '2026-07-15' }], { graceDays: 7 }, '2026-07-17');
  assert.equal(due.jobs[0].status, 'confirmation_due');
  const stale = Engine.applyFreshnessPolicy([{ ...base, id: 'stale', status: 'confirmation_due', confirmationDueAt: '2026-07-01' }], { graceDays: 7 }, '2026-07-17');
  assert.equal(stale.jobs[0].status, 'paused_stale');
  assert.equal(stale.jobs[0].pausedAutomatically, true);
  assert.equal(stale.auditEvents[0].action, 'auto_pause_stale');
});

test('Employer Integrity Rating retains a sample-size guard', () => {
  const result = Engine.computeEmployerRating([{ status: 'published', publishedAt: '2026-01-01' }], '2026-07-17');
  assert.equal(result.rating, null);
  assert.equal(result.band, 'Insufficient evidence');
});

test('seed data coherently demonstrates Green, Amber, Red, approved, due and stale', () => {
  const byId = id => Seeds.JOBS.find(job => job.id === id);
  assert.equal(Engine.calculatePostingIntegrity(byId('job_backend_engineer'), { now: '2026-07-17' }).riskLevel, 'green');
  assert.equal(Engine.calculatePostingIntegrity(byId('job_graduate_data_analyst'), { now: '2026-07-17' }).riskLevel, 'amber');
  assert.equal(Engine.calculatePostingIntegrity(byId('job_marketing_intern'), { now: '2026-07-17' }).riskLevel, 'red');
  assert.equal(byId('job_product_designer').status, 'approved');
  assert.equal(byId('job_operations_confirmation').status, 'confirmation_due');
  assert.equal(byId('job_ai_product_stale').status, 'paused_stale');
});

// --- Vacancy outcome analysis ------------------------------------------------
// Hand-computed Kaplan-Meier fixture. 10 published requisitions:
//   filled  at 10, 10, 20, 30, 60 days
//   open    at 15, 25, 40 days (right-censored)
//   abandoned at 35, 50 days (censored for the fill curve, counted separately)
//
//   t=10  at risk 10, events 2  S = 1 - 2/10          = 0.8
//   t=20  at risk  7, events 1  S = 0.8 * 6/7         = 0.6857142857...
//   t=30  at risk  5, events 1  S = 0.6857... * 4/5   = 0.5485714285...
//   t=60  at risk  1, events 1  S = 0.5485... * 0     = 0
// Median = first t where S <= 0.5, which is 60.
// Deleting the censored rows would give median(10,10,20,30,60) = 20.
const OUTCOME_START = '2026-01-01T00:00:00.000Z';
const addDays = days => new Date(new Date(OUTCOME_START).getTime() + days * 86400000).toISOString();
const OUTCOME_WINDOW = 90;
const outcomeJob = (id, days, kind) => {
  const job = { id, publishedAt: OUTCOME_START, seniority: 'mid', location: 'Kuala Lumpur', requirements: [{ name: 'SQL', type: 'skill', required: true }] };
  if (kind === 'filled') return { ...job, status: 'filled', filledAt: addDays(days) };
  if (kind === 'abandoned') return { ...job, status: 'paused_stale', pausedAt: addDays(days) };
  // A still-open vacancy is censored at "now", so its observed duration is set
  // by pushing publishedAt forward rather than by any field on the job.
  return { ...job, status: 'published', publishedAt: addDays(OUTCOME_WINDOW - days) };
};
const OUTCOME_CORPUS = [
  outcomeJob('f1', 10, 'filled'), outcomeJob('f2', 10, 'filled'), outcomeJob('f3', 20, 'filled'),
  outcomeJob('f4', 30, 'filled'), outcomeJob('f5', 60, 'filled'),
  outcomeJob('c1', 15, 'open'), outcomeJob('c2', 25, 'open'), outcomeJob('c3', 40, 'open'),
  outcomeJob('a1', 35, 'abandoned'), outcomeJob('a2', 50, 'abandoned')
];
const OUTCOME_NOW = addDays(OUTCOME_WINDOW);

test('Kaplan-Meier matches the hand-computed curve including censored rows', () => {
  const curve = Engine.survivalCurve(OUTCOME_CORPUS, OUTCOME_NOW);
  assert.equal(curve.sufficient, true);
  assert.equal(curve.sampleSize, 10);
  assert.deepEqual(clone(curve.points.map(point => point.day)), [0, 10, 20, 30, 60]);
  assert.deepEqual(clone(curve.points.map(point => point.atRisk)), [10, 10, 7, 5, 1]);
  const survival = clone(curve.points.map(point => Number(point.survival.toFixed(6))));
  assert.deepEqual(survival, [1, 0.8, 0.685714, 0.548571, 0]);
  assert.equal(curve.medianDays, 60);
});

test('censored rows raise the median rather than being silently deleted', () => {
  const naive = OUTCOME_CORPUS.filter(job => job.status === 'filled')
    .map(job => (new Date(job.filledAt) - new Date(job.publishedAt)) / 86400000).sort((a, b) => a - b);
  assert.equal(naive[Math.floor(naive.length / 2)], 20);
  assert.ok(Engine.survivalCurve(OUTCOME_CORPUS, OUTCOME_NOW).medianDays > 20);
});

test('a curve that never reaches 0.5 reports null instead of extrapolating', () => {
  const mostlyOpen = OUTCOME_CORPUS.map((job, index) => index === 0 ? job : outcomeJob(`o${index}`, 20 + index, 'open'));
  const curve = Engine.survivalCurve(mostlyOpen, OUTCOME_NOW);
  assert.ok(curve.points.every(point => point.survival > 0.5));
  assert.equal(curve.medianDays, null);
});

test('cohorts below the sample floor refuse to report a number', () => {
  const curve = Engine.survivalCurve(OUTCOME_CORPUS.slice(0, Engine.MIN_COHORT - 1), OUTCOME_NOW);
  assert.equal(curve.sufficient, false);
  assert.equal(curve.medianDays, null);
  assert.deepEqual(clone(curve.points), []);
});

test('abandonment is reported as a rate over settled vacancies only', () => {
  // 5 filled + 2 abandoned settled; the 3 still-open rows are excluded.
  assert.equal(Engine.abandonmentRate(OUTCOME_CORPUS, OUTCOME_NOW), 29);
  assert.equal(Engine.abandonmentRate([], OUTCOME_NOW), null);
});

test('cohort filtering is deterministic and order-independent', () => {
  const spec = Engine.cohortSpec(OUTCOME_CORPUS[0]);
  const forward = clone(Engine.cohort(OUTCOME_CORPUS, spec).map(job => job.id).sort());
  const reversed = clone(Engine.cohort(OUTCOME_CORPUS.slice().reverse(), spec).map(job => job.id).sort());
  assert.deepEqual(forward, reversed);
  assert.equal(forward.length, 10);
  assert.deepEqual(clone(Engine.cohort(OUTCOME_CORPUS, { ...spec, seniority: "senior" })), []);
});

test('realised demand counts hires, not verification coverage', () => {
  const demand = Engine.realisedDemand(OUTCOME_CORPUS);
  const sql = demand.rows.find(row => row.skill === 'SQL');
  assert.equal(demand.totalPostings, 10);
  assert.equal(demand.totalHires, 5);
  assert.equal(sql.advertised, 10);
  assert.equal(sql.hired, 5);
  assert.equal(sql.conversion, 50);
  assert.equal(sql.phantom, 5);
});

test('requirement autopsy only recommends a change the data supports', () => {
  const heavy = { seniority: 'mid', location: 'Kuala Lumpur', requirements: [{ type: 'experience', required: true, yearsExperience: 8 }] };
  const autopsy = Engine.requirementAutopsy(heavy, OUTCOME_CORPUS, OUTCOME_NOW);
  // The corpus holds no 7+ years cohort, so the base cannot report and no
  // recommendation may be invented from an empty comparison.
  assert.equal(autopsy.base.sufficient, false);
  assert.ok(autopsy.variants.some(variant => variant.field === 'experience'));
  assert.ok(autopsy.best === null || autopsy.best.sufficient);
});

test('marking a vacancy filled records the hire university that closes the loop', () => {
  const published = { ...clone(Seeds.DEMO_DRAFTS.green), status: 'published', publishedAt: OUTCOME_START };
  const filled = Engine.applyTransition(published, 'mark_filled', manager, { now: addDays(30), hireUniversity: 'Universiti Malaya' }).job;
  assert.equal(filled.status, 'filled');
  assert.equal(filled.hireUniversity, 'Universiti Malaya');
  // Recording it is optional; omitting it must not invent a university.
  assert.equal(Engine.applyTransition(published, 'mark_filled', manager, { now: addDays(30) }).job.hireUniversity, undefined);
});

test('the generated history corpus is deterministic and labelled as generated', () => {
  assert.ok(Seeds.DEMAND_CORPUS.length > 400);
  assert.ok(Seeds.DEMAND_CORPUS.every(job => job.generated === true));
  assert.equal(Seeds.DEMAND_CORPUS[0].id, loadUmd('verify-seeds.js').DEMAND_CORPUS[0].id);
  assert.equal(Seeds.DEMAND_CORPUS[100].filledAt, loadUmd('verify-seeds.js').DEMAND_CORPUS[100].filledAt);
});

test('a behavioural award component reorders employers who win on perception alone', () => {
  const orgs = [
    { id: 'brand-strong', perceptionScore: 94, rating: 52 },
    { id: 'behaviour-strong', perceptionScore: 72, rating: 92 }
  ];
  const standing = Engine.computeAwardStanding(orgs, 0.4);
  const brand = standing.find(org => org.id === 'brand-strong');
  const behaviour = standing.find(org => org.id === 'behaviour-strong');
  assert.equal(brand.perceptionRank, 1);
  assert.equal(brand.combined, Math.round(94 * 0.6 + 52 * 0.4));
  assert.equal(behaviour.combined, Math.round(72 * 0.6 + 92 * 0.4));
  assert.equal(behaviour.combinedRank, 1);
  assert.equal(brand.combinedRank, 2);
  assert.equal(brand.movement, -1);
});

test('an employer with no behavioural sample is not penalised for missing evidence', () => {
  const standing = Engine.computeAwardStanding([{ id: 'new-employer', perceptionScore: 80, rating: null }], 0.4);
  assert.equal(standing[0].behaviour, null);
  assert.equal(standing[0].combined, 80);
});

console.log(`\n${passed} PASS`);
