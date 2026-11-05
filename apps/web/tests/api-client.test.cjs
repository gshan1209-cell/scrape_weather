require('./register.cjs');
const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const originalFetch = global.fetch;
const originalWindow = global.window;
const originalConfig = process.env.NEXT_PUBLIC_API_BASE_URL;
const modulePath = require.resolve('../lib/api-client.ts');
function api(config, hostname = 'scrape-weather-nine.vercel.app') {
  if (config === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = config;
  global.window = {location: {hostname, protocol: hostname === 'localhost' ? 'http:' : 'https:'}};
  delete require.cache[modulePath];
  return require(modulePath);
}
afterEach(() => {
  global.fetch = originalFetch;
  global.window = originalWindow;
  if (originalConfig === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalConfig;
});
for (const config of [undefined, '', '   ', 'http://localhost:8000/api/v1', 'http://127.0.0.1:8000/api/v1', 'http://[::1]:8000/api/v1', 'http://0.0.0.0:8000/api/v1', 'https://localhost.:8000/api/v1', 'https://[::ffff:127.0.0.1]:8000/api/v1']) {
  test(`public page never fetches with unsafe/unconfigured API ${JSON.stringify(config)}`, async () => {
    let calls = 0;
    global.fetch = async () => {calls++; return new Response('{}');};
    await assert.rejects(api(config).apiGet('/health'), error => error.code === 'API_NOT_CONFIGURED');
    assert.equal(calls, 0);
  });
}
test('configured public HTTPS API is used without modifying its path', async () => {
  let requested;
  global.fetch = async url => {requested = url; return new Response('{"status":"ok"}');};
  assert.deepEqual(await api('https://api.example.test/api/v1/').apiGet('/health'), {status:'ok'});
  assert.equal(requested, 'https://api.example.test/api/v1/health');
});
test('localhost development retains explicit local fallback', async () => {
  let requested;
  global.fetch = async url => {requested = url; return new Response('{}');};
  await api(undefined, 'localhost').apiGet('/health');
  assert.equal(requested, 'http://localhost:8000/api/v1/health');
});
test('a pending request becomes a timeout instead of staying in loading', async () => {
  let signal;
  global.fetch = (_url, options) => {signal = options.signal; return new Promise(() => {});};
  const request = api('https://api.example.test/api/v1').apiGet('/health', 5).catch(error => error);
  const result = await Promise.race([request, new Promise(resolve => setTimeout(() => resolve(null), 100))]);
  assert.equal(result?.code, 'API_TIMEOUT');
  assert.equal(signal.aborted, true);
});
test('non-success HTTP response is an explicit failure', async () => {
  global.fetch = async () => new Response('{}', {status:503});
  await assert.rejects(api('https://api.example.test/api/v1').apiGet('/health'), error => error.code === 'HTTP_ERROR');
});
