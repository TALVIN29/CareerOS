import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const requiredScripts = ['verify-engine.js', 'verify-seeds.js', 'verify-store.js', 'permissions.js', 'viz.js', 'app.js'];

for (const script of requiredScripts) {
  assert.match(html, new RegExp(`<script[^>]+src=["']\\./${script.replace('.', '\\.')}["']`), `${script} must be loaded by index.html`);
}

const positions = requiredScripts.map(script => html.indexOf(`./${script}`));
assert.deepEqual(positions, positions.slice().sort((a, b) => a - b), 'runtime modules must load in dependency order');
assert.match(app, /VerifyEngine/, 'app.js must consume the verification engine');
assert.match(app, /VerifyStore/, 'app.js must consume the verification store');
assert.match(app, /calculatePostingIntegrity/, 'app.js must use the central live integrity calculation');
assert.doesNotMatch(app, /100\s*-\s*blockers\.length/, 'app.js must not reimplement the integrity score');
assert.doesNotMatch(app, /careeros-role-workspace/, 'app.js must not maintain a second job store');
assert.match(html, /Posting Integrity · Live|Live background check/, 'the recruiter form must expose live Posting Integrity guidance');
assert.match(app, /Publish Verified Job/, 'the Green fast-path CTA must be present');
assert.match(app, /Send for Manager Confirmation/, 'the Red accountability CTA must be present');
assert.doesNotMatch(html, /Run Automated Validation/, 'manual validation must not remain a required posting step');

// The outcome loop: advertised-vs-hired must not regress to advertised-vs-verified,
// which measured our own coverage rather than anything about the posting.
assert.match(app, /realisedDemand/, 'app.js must expose the Realised Demand Index');
assert.match(app, /requirementAutopsy/, 'app.js must expose the Requirement Autopsy');
assert.match(html, /realised-demand-chart/, 'the network view must render advertised vs hired');
assert.match(html, /autopsy-survival-chart/, 'the posting form must render the survival curve');
assert.doesNotMatch(html, /demand-divergence-chart/, 'the circular advertised-vs-verified proof must not return');
assert.match(html, /x-model="fillUniversity"/, 'marking a vacancy filled must capture the hire university');

console.log('wiring.test.js: all assertions passed');
