// Plain node:assert tests. Run: node tests/verify-engine.test.js
// verify-engine.js / verify-seeds.js are classic UMD-style scripts (window.X
// in the browser, module.exports in Node). The repo's package.json sets
// "type": "module" for the Express server, so plain `require()` of a .js
// sibling isn't available here — instead we run the scripts in a vm
// sandbox that provides a `module` object, exactly like Node's own CJS
// loader would, without touching package.json.
import assert from 'node:assert';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadUmd(file) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const sandboxModule = { exports: {} };
  const context = vm.createContext({ module: sandboxModule, console });
  vm.runInContext(code, context, { filename: file });
  return sandboxModule.exports;
}

const Engine = loadUmd('verify-engine.js');
const Seeds = loadUmd('verify-seeds.js');

let passCount = 0;
function test(name, fn) {
  fn();
  passCount += 1;
  console.log(`PASS: ${name}`);
}

function findJob(id) {
  const job = Seeds.JOBS.find(j => j.id === id);
  assert.ok(job, `seed job ${id} should exist`);
  return job;
}

// --- Weighted score math on a hand-computed job ---------------------------
test('computeScore applies the weighted JIS formula', () => {
  const components = { A: 100, V: 100, R: 100, M: 100, C: 100, Q: 100, P: 0 };
  assert.strictEqual(Engine.computeScore(components), 100);
  const partial = { A: 100, V: 100, R: 40, M: 100, C: 100, Q: 60, P: 0 };
  // 0.3*100+0.2*100+0.2*40+0.15*100+0.1*100+0.05*60 = 30+20+8+15+10+3 = 86
  assert.strictEqual(Engine.computeScore(partial), 86);
});

test('computeScore clamps to 0-100 and applies penalties', () => {
  const heavyPenalty = { A: 100, V: 100, R: 100, M: 100, C: 100, Q: 100, P: 120 };
  assert.strictEqual(Engine.computeScore(heavyPenalty), 0);
});

// --- Each blocker fires individually ---------------------------------------
test('each critical blocker fires individually', () => {
  const base = {
    hiringManagerId: 'user-manager-daniel', requisitionId: 'REQ-1', headcountApproved: true,
    budgetApproved: true, employerVerified: true, salaryMin: 3000, salaryMax: 5000,
    employmentType: 'full-time', location: 'KL', recruiterId: 'user-recruiter-alicia',
    responsibilities: ['Do the work'], title: 'Some Role', summary: 'A role.'
  };
  const cases = [
    [{ hiringManagerId: null }, 'missing-hiring-manager'],
    [{ requisitionId: null }, 'missing-requisition'],
    [{ headcountApproved: false }, 'headcount-not-approved'],
    [{ budgetApproved: false }, 'budget-not-approved'],
    [{ employerVerified: false }, 'unverified-employer'],
    [{ salaryMin: 6000, salaryMax: 5000 }, 'salary-min-above-max'],
    [{ employmentType: null }, 'missing-employment-type'],
    [{ location: null, workplace: 'onsite' }, 'missing-location'],
    [{ responsibilities: [] }, 'no-responsibilities'],
    [{ recruiterId: null }, 'no-approval-route'],
    [{ summary: 'Please pay a processing fee to proceed with your application.' }, 'candidate-payment-requested'],
    [{ summary: 'Please provide your bank account number for verification.' }, 'sensitive-id-requested'],
    [{ summary: 'Applicants must be male, single status only, age below 30 only.' }, 'discriminatory-requirement']
  ];
  for (const [overrides, expectedId] of cases) {
    const job = { ...base, ...overrides };
    const blockers = Engine.findBlockers(job);
    assert.ok(blockers.some(b => b.id === expectedId), `expected blocker ${expectedId} for ${JSON.stringify(overrides)}`);
  }
});

// --- Entry/intern experience warnings ---------------------------------------
test('entry-level and intern experience warnings fire correctly', () => {
  const entryJob = {
    title: 'Junior Analyst', seniority: 'entry', responsibilities: ['Analyse things'],
    requirements: [{ name: 'Experience', type: 'experience', required: true, yearsExperience: 5 }]
  };
  assert.ok(Engine.findWarnings(entryJob, null).some(w => w.id === 'entry-overexperience'));

  const internJob = {
    title: 'Intern', seniority: 'intern', responsibilities: ['Assist team'],
    requirements: [{ name: 'Experience', type: 'experience', required: true, yearsExperience: 3 }]
  };
  assert.ok(Engine.findWarnings(internJob, null).some(w => w.id === 'intern-overexperience'));

  const fineJob = {
    title: 'Junior Analyst', seniority: 'entry', responsibilities: ['Analyse things'],
    requirements: [{ name: 'Experience', type: 'experience', required: true, yearsExperience: 2 }]
  };
  assert.ok(!Engine.findWarnings(fineJob, null).some(w => w.id === 'entry-overexperience'));
});

// --- min>max salary blocker ---------------------------------------------
test('salary min above max is a blocker', () => {
  const job = { salaryMin: 8000, salaryMax: 5000, responsibilities: ['x'] };
  assert.ok(Engine.findBlockers(job).some(b => b.id === 'salary-min-above-max'));
});

// --- Threshold boundaries 59/60/79/80 ---------------------------------------
test('canSubmit threshold boundaries (59/60/79/80)', () => {
  // score 59 -> blocked regardless of warnings
  assert.strictEqual(Engine.computeScore({ A: 0, V: 100, R: 100, M: 60, C: 100, Q: 0, P: 0 }), 59);
  // score 60 -> allowed only if warnings acknowledged
  assert.strictEqual(Engine.computeScore({ A: 0, V: 100, R: 60, M: 100, C: 100, Q: 60, P: 0 }), 60);
  // score 79 -> still requires acknowledgement
  assert.strictEqual(Engine.computeScore({ A: 40, V: 100, R: 100, M: 100, C: 70, Q: 100, P: 0 }), 79);
  // score 80 -> always eligible regardless of unacknowledged warnings
  assert.strictEqual(Engine.computeScore({ A: 40, V: 100, R: 100, M: 100, C: 100, Q: 60, P: 0 }), 80);

  // canSubmit: below 60 always false
  const below60 = { ...findJob('job_graduate_data_analyst') }; // score 58
  assert.strictEqual(Engine.canSubmit(below60), false);

  // 60-79 band job with unacknowledged warnings -> blocked; acknowledging
  // every warning (as stored in job.validation, the way the UI would after
  // the recruiter checks each box) flips it to submittable.
  const midJob = { ...findJob('job_cybersecurity_specialist') }; // score 76
  const freshValidation = Engine.validateJob(midJob);
  assert.ok(freshValidation.score >= 60 && freshValidation.score < 80, `expected 60-79 score, got ${freshValidation.score}`);
  assert.ok(freshValidation.warnings.length > 0, 'expected at least one warning in the 60-79 band');
  assert.strictEqual(Engine.canSubmit({ ...midJob, validation: freshValidation }), false, 'unacknowledged warnings should block submit in 60-79 band');

  const ackValidation = { ...freshValidation, warnings: freshValidation.warnings.map(w => ({ ...w, acknowledged: true })) };
  assert.strictEqual(Engine.canSubmit({ ...midJob, validation: ackValidation }), true, 'acknowledging all warnings should allow submit in 60-79 band');

  // score >= 80 bypasses acknowledgement entirely
  const highJob = { ...findJob('job_product_designer') }; // score 93
  const highValidation = Engine.validateJob(highJob);
  assert.ok(highValidation.score >= 80);
  assert.strictEqual(Engine.canSubmit({ ...highJob, validation: highValidation }), true);
});

// --- Blocker blocks submit regardless of score ---------------------------
test('a blocker blocks submission even with a high score', () => {
  const job = {
    title: 'Product Designer', seniority: 'senior', requisitionId: 'REQ-X', hiringManagerId: null, // blocker
    recruiterId: 'user-recruiter-alicia', headcountApproved: true, budgetApproved: true, employmentType: 'full-time',
    location: 'KL', salaryMin: 5500, salaryMax: 8500, salaryVisible: true,
    summary: 'A senior product design role partnering with research and engineering across the company.',
    responsibilities: ['Lead product design work', 'Partner with research', 'Mentor designers'],
    requirements: [{ name: 'Figma', type: 'skill', required: true }]
  };
  assert.ok(Engine.findBlockers(job).length > 0);
  assert.strictEqual(Engine.canSubmit(job), false);
});

// --- Legal / illegal transitions ---------------------------------------
test('every legal transition succeeds and illegal transitions throw', () => {
  const actor = { id: 'user-recruiter-alicia', name: 'Alicia Tan', role: 'recruiter' };
  const manager = { id: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' };

  for (const [status, actions] of Object.entries(Engine.TRANSITIONS)) {
    for (const action of actions) {
      const job = { ...findJob('job_backend_engineer'), status, recruiterId: 'user-recruiter-alicia', hiringManagerId: 'user-manager-daniel' };
      if (status === 'approved') {
        job.approval = { decision: 'approved', approverId: 'user-manager-daniel', attestation: true, reasonCategory: null, comments: null, ts: new Date().toISOString() };
      }
      if (action === 'acknowledge_warning') job.validation = Engine.validateJob(job);
      const opts = action === 'approve' ? { attestation: true } : action === 'acknowledge_warning' ? { warningId: job.validation.warnings[0]?.id || 'none' } : {};
      const approveActor = action === 'approve' || action === 'request_changes' || action === 'reject' ? manager : actor;
      assert.doesNotThrow(() => Engine.applyTransition(job, action, approveActor, opts), `${status} -> ${action} should be legal`);
    }
  }

  const draftJob = { ...findJob('job_backend_engineer'), status: 'draft' };
  assert.throws(() => Engine.applyTransition(draftJob, 'publish', actor, {}), /Illegal transition/);
  assert.throws(() => Engine.applyTransition(draftJob, 'approve', actor, { attestation: true }), /Illegal transition/);
});

// --- approve without attestation throws -------------------------------------
test('approve without attestation throws', () => {
  const job = { ...findJob('job_backend_engineer'), status: 'pending_approval', recruiterId: 'user-recruiter-alicia' };
  const manager = { id: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' };
  assert.throws(() => Engine.applyTransition(job, 'approve', manager, {}), /attestation/i);
});

// --- self-approval blocked -------------------------------------------------
test('self-approval is blocked', () => {
  const job = { ...findJob('job_backend_engineer'), status: 'pending_approval', recruiterId: 'user-recruiter-alicia' };
  const check = Engine.canApprove(job, 'user-recruiter-alicia');
  assert.strictEqual(check.ok, false);
  assert.throws(() => Engine.applyTransition(job, 'approve', { id: 'user-recruiter-alicia', name: 'Alicia Tan', role: 'recruiter' }, { attestation: true }));
});

// --- audit event emitted per transition -------------------------------------
test('audit event carries correct from/to status per transition', () => {
  const job = { ...findJob('job_backend_engineer'), status: 'pending_approval', recruiterId: 'user-recruiter-alicia' };
  const manager = { id: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' };
  const { job: approvedJob, auditEvent } = Engine.applyTransition(job, 'approve', manager, { attestation: true });
  assert.strictEqual(auditEvent.fromStatus, 'pending_approval');
  assert.strictEqual(auditEvent.toStatus, 'approved');
  assert.strictEqual(auditEvent.action, 'approve');
  assert.strictEqual(auditEvent.jobId, job.id);
  assert.strictEqual(approvedJob.status, 'approved');
});

// --- edit from approved reverts to draft + clears approval ------------------
test('editing an approved job reverts to draft and clears approval', () => {
  const job = { ...findJob('job_product_designer') }; // status approved, has approval
  assert.strictEqual(job.status, 'approved');
  assert.ok(job.approval);
  const { job: editedJob, auditEvent } = Engine.applyTransition(job, 'edit', { id: 'user-recruiter-alicia', name: 'Alicia Tan', role: 'recruiter' }, {});
  assert.strictEqual(editedJob.status, 'draft');
  assert.strictEqual(editedJob.approval, null);
  assert.strictEqual(auditEvent.fromStatus, 'approved');
  assert.strictEqual(auditEvent.toStatus, 'draft');
});

// --- all 5 seed scores EXACT -------------------------------------------
test('all 5 seed scores match exactly', () => {
  const expected = {
    job_backend_engineer: 86,
    job_graduate_data_analyst: 58,
    job_product_designer: 93,
    job_cybersecurity_specialist: 76
  };
  for (const [id, score] of Object.entries(expected)) {
    const job = findJob(id);
    const validation = Engine.validateJob(job);
    assert.strictEqual(validation.score, score, `${id} expected score ${score}, got ${validation.score}`);
  }
  // Marketing Intern: blocked, headcountApproved:false
  const intern = findJob('job_marketing_intern');
  assert.strictEqual(intern.headcountApproved, false);
  assert.ok(Engine.findBlockers(intern).some(b => b.id === 'headcount-not-approved'));
  assert.strictEqual(Engine.canSubmit(intern), false);
});

// --- Demo draft triggers exactly 3 issues -----------------------------------
test('demo draft triggers exactly 3 issues and zero blockers', () => {
  const draft = Seeds.DEMO_DRAFT;
  const blockers = Engine.findBlockers(draft);
  const warnings = Engine.findWarnings(draft, Engine.findBenchmark(draft.title));
  assert.strictEqual(blockers.length, 0, `expected 0 blockers, got ${blockers.map(b => b.id).join(', ')}`);
  assert.strictEqual(warnings.length, 3, `expected 3 warnings, got ${warnings.map(w => w.id).join(', ')}`);
  // vm sandboxing means arrays produced by Engine/Seeds live in a different
  // realm than this test file's array literals; JSON round-trip normalizes
  // both sides so deepStrictEqual isn't tripped up by cross-realm prototypes.
  const ids = JSON.parse(JSON.stringify(warnings.map(w => w.id).sort()));
  assert.deepStrictEqual(ids, ['entry-overexperience', 'short-description', 'too-many-skills']);
});

// --- validateJob is deterministic (two calls equal ignoring timestamp) -----
test('validateJob is deterministic', () => {
  const job = findJob('job_backend_engineer');
  const v1 = Engine.validateJob(job);
  const v2 = Engine.validateJob(job);
  const strip = v => { const { validatedAt, ...rest } = v; return rest; };
  assert.deepStrictEqual(strip(v1), strip(v2));
});

// --- Stale stored validation cannot smuggle a blocker past canSubmit -------
test('canSubmit recomputes blockers; stale validation cannot bypass', () => {
  const job = JSON.parse(JSON.stringify(findJob('job_backend_engineer')));
  job.validation = Engine.validateJob(job); // clean stored validation
  assert.strictEqual(Engine.canSubmit(job), true);
  job.hiringManagerId = null; // edit introduces a live blocker; stored validation is now stale
  assert.strictEqual(Engine.canSubmit(job), false);
});

test('freshness lifecycle transitions are engine-owned and audited', () => {
  const manager = { id: 'user-manager-daniel', name: 'Daniel Lee', role: 'hiring_manager' };
  const published = { ...findJob('job_product_designer'), status: 'published', publishedAt: '2026-06-01', confirmationDueAt: '2026-07-01' };
  const due = Engine.applyTransition(published, 'mark_confirmation_due', manager, {}).job;
  assert.strictEqual(due.status, 'confirmation_due');
  const paused = Engine.applyTransition(due, 'pause_stale', manager, {}).job;
  assert.strictEqual(paused.status, 'paused_stale');
  assert.ok(paused.pausedAt);
  const restored = Engine.applyTransition(paused, 'reconfirm', manager, { confirmationDays: 30 }).job;
  assert.strictEqual(restored.status, 'published');
  assert.ok(restored.lastConfirmedAt);
  assert.ok(restored.confirmationDueAt);
  const filled = Engine.applyTransition(restored, 'mark_filled', manager, {}).job;
  assert.strictEqual(filled.status, 'filled');
  assert.ok(filled.filledAt);
});

test('Employer Integrity Rating guards small samples', () => {
  const rating = Engine.computeEmployerRating([{ status: 'published', publishedAt: '2026-01-01' }], '2026-07-17');
  assert.strictEqual(rating.rating, null);
  assert.strictEqual(rating.band, 'Insufficient evidence');
  assert.strictEqual(rating.sampleSize, 1);
});

test('Employer Integrity Rating components and weighting are deterministic', () => {
  const jobs = [
    { status: 'published', publishedAt: '2026-01-01', submittedAt: '2025-12-28', confirmationDueAt: '2026-07-01', lastConfirmedAt: '2026-06-30', approval: { ts: '2025-12-30' }, confirmations: [{ confirmedAt: '2026-06-30', dueAt: '2026-07-01' }] },
    { status: 'filled', publishedAt: '2026-01-01', submittedAt: '2025-12-28', filledAt: '2026-04-01', approval: { ts: '2025-12-30' }, confirmations: [{ confirmedAt: '2026-03-01', dueAt: '2026-03-01' }] },
    { status: 'paused_stale', publishedAt: '2026-01-01', submittedAt: '2025-12-20', confirmationDueAt: '2026-03-01', approval: { ts: '2025-12-27' }, confirmations: [{ confirmedAt: '2026-03-05', dueAt: '2026-03-01' }] },
    { status: 'closed', publishedAt: '2026-01-01', submittedAt: '2025-12-20', closedAt: '2026-04-01', approval: { ts: '2025-12-27' }, confirmations: [] }
  ];
  const result = Engine.computeEmployerRating(jobs, '2026-07-17');
  assert.strictEqual(result.sampleSize, 4);
  assert.strictEqual(result.components.reconfirmOnTime, 67);
  assert.strictEqual(result.components.ghostAvoidance, 50);
  assert.strictEqual(result.components.staleAvoidance, 75);
  const expected = Math.round(.35 * 67 + .30 * 50 + .20 * result.components.decisionSpeed + .15 * 75);
  assert.strictEqual(result.rating, expected);
});

test('demand divergence excludes unverified and stale postings', () => {
  const jobs = [
    { status: 'published', employerVerified: true, lastConfirmedAt: '2026-07-01', confirmationDueAt: '2026-08-01', requirements: [{ name: 'SQL', type: 'skill', required: true }] },
    { status: 'paused_stale', employerVerified: true, requirements: [{ name: 'SQL', type: 'skill', required: true }] },
    { status: 'published', employerVerified: false, requirements: [{ name: 'Python', type: 'skill', required: true }] }
  ];
  const result = Engine.computeDemandDivergence(jobs, '2026-07-17');
  assert.strictEqual(result.all.SQL, 2);
  assert.strictEqual(result.verified.SQL, 1);
  assert.strictEqual(result.verified.Python || 0, 0);
  assert.strictEqual(result.rows.find(row => row.skill === 'Python').unverifiedShare, 100);
});

console.log(`\n${passCount} PASS`);
