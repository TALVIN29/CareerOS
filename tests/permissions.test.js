import assert from 'node:assert/strict';
import '../permissions.js';

const { DEMO_USERS, hasPermission, canAccessRoute, canUser } = globalThis.CareerOSAuth;
const [recruiter, manager, admin] = DEMO_USERS;
const pending = { id: 'pending', status: 'Pending Approval', createdByUserId: recruiter.userId, recruiterId: recruiter.userId, assignedManagerId: manager.userId, departmentId: 'technology' };
const approved = { ...pending, status: 'Approved' };
const selfAuthored = { ...pending, createdByUserId: manager.userId };

assert.equal(DEMO_USERS.length, 3);
assert.equal(hasPermission(recruiter, 'create_job'), true);
assert.equal(hasPermission(recruiter, 'approve_assigned_job'), false);
assert.equal(hasPermission(manager, 'publish_approved_job'), false);
assert.equal(hasPermission(admin, 'manage_policy_settings'), true);
assert.equal(canAccessRoute(recruiter, 'create'), true);
assert.equal(canAccessRoute(manager, 'create'), false);
assert.equal(canAccessRoute(admin, 'settings'), true);
assert.equal(canUser(manager, 'approve_assigned_job', pending), true);
assert.equal(canUser(manager, 'approve_assigned_job', selfAuthored), false);
assert.equal(canUser(recruiter, 'publish_approved_job', pending), false);
assert.equal(canUser(recruiter, 'publish_approved_job', approved), true);
assert.equal(canUser(admin, 'pause_suspicious_job', { ...pending, status: 'Published' }), true);

console.log('permissions.test.js: all assertions passed');
