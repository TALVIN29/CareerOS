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
assert.doesNotMatch(app, /100\s*-\s*blockers\.length/, 'app.js must not reimplement the integrity score');
assert.doesNotMatch(app, /careeros-role-workspace/, 'app.js must not maintain a second job store');

console.log('wiring.test.js: all assertions passed');
