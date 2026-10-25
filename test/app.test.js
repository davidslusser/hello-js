'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createServer, escapeHtml, formatUptime } = require('../app');

let server;
let baseUrl;

before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

test('GET / serves the JavaScript landing page', async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /Hello JavaScript!/);
  assert.match(html, /Hostname:/);
  assert.match(html, /Start Time:/);
  assert.match(html, /Uptime:/);
  assert.match(html, /Image Tag:/);
});

test('GET /api serves compatible container metadata', async () => {
  const response = await fetch(`${baseUrl}/api`);
  const info = await response.json();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(Object.keys(info), ['hostname', 'start_time', 'uptime', 'version']);
  assert.equal(typeof info.hostname, 'string');
  assert.match(info.start_time, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC$/);
  assert.match(info.uptime, /^(?:\d+d )?\d{2}h \d{2}m \d{2}s$/);
  assert.equal(info.version, process.env.IMAGE_TAG || 'unknown');
});

test('HEAD requests have no response body', async () => {
  const response = await fetch(`${baseUrl}/api`, { method: 'HEAD' });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('unknown paths and unsupported methods respond appropriately', async () => {
  assert.equal((await fetch(`${baseUrl}/not-found`)).status, 404);
  const response = await fetch(`${baseUrl}/api`, { method: 'POST' });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET, HEAD');
});

test('uptime formats elapsed seconds including days', () => {
  assert.equal(formatUptime(0), '00h 00m 00s');
  assert.equal(formatUptime(3661), '01h 01m 01s');
  assert.equal(formatUptime(90061), '1d 01h 01m 01s');
});

test('HTML escaping prevents injected markup', () => {
  assert.equal(escapeHtml('<script>"&\'</script>'), '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
});
