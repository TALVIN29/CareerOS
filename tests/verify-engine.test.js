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

test('paused, filled and unverified jobs are excluded from verified demand', () => {
  const skill = [{ name: 'SQL', type: 'skill', required: true }];
  const jobs = [
    { status: 'published', employerVerified: true, lastConfirmedAt: '2026-07-01', confirmationDueAt: '2026-08-01', requirements: skill },
    { status: 'paused_stale', employerVerified: true, requirements: skill },
    { status: 'filled', employerVerified: true, requirements: skill }
  ];
  const result = Engine.computeDemandDivergence(jobs, '2026-07-17');
  assert.equal(result.verifiedJobs, 1);
  assert.equal(result.verified.SQL, 1);
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

console.log(`\n${passed} PASS`);
