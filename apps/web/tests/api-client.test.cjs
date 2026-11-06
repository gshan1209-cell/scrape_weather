require('./register.cjs');
const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const originalFetch = global.fetch;
const originalWindow = global.window;
const originalConfig = process.env.NEXT_PUBLIC_API_BASE_URL;
const originalMode = process.env.NODE_ENV;
const modulePath = require.resolve('../lib/api-client.ts');
function api(config, hostname = 'scrape-weather-nine.vercel.app', mode = 'production') {
  if (config === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = config;
  if (mode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = mode;
  global.window = {location: {hostname, protocol: hostname === 'localhost' ? 'http:' : 'https:'}};
  delete require.cache[modulePath];
  return require(modulePath);
}
afterEach(() => {
  global.fetch = originalFetch;
  global.window = originalWindow;
  if (originalConfig === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = originalConfig;
  if (originalMode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalMode;
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
  await api(undefined, 'localhost', 'development').apiGet('/health');
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

for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
  for (const config of [undefined, '', '   ', 'http://localhost:8000/api/v1', 'https://127.0.0.1:8000/api/v1']) {
    test(`production page at ${hostname} rejects local/unconfigured API ${JSON.stringify(config)} before fetch`, async () => {
      let calls = 0;
      global.fetch = async () => {calls++; return new Response('{}');};
      await assert.rejects(api(config, hostname, 'production').apiGet('/health'), error => error.code === 'API_NOT_CONFIGURED');
      assert.equal(calls, 0);
    });
  }
}

const unsafeUrls = [
  'https://LOCALHOST./api/v1', 'https://weather.localhost/api/v1',
  'https://%6cocalhost/api/v1', 'https://localhost\u3002/api/v1',
  'https://127.1/api/v1', 'https://2130706433/api/v1', 'https://0x7f000001/api/v1',
  'https://0177.0.0.1/api/v1', 'https://127.255.255.255/api/v1',
  'https://[0:0:0:0:0:0:0:1]/api/v1', 'https://[::ffff:7f00:1]/api/v1',
  'https://[::127.0.0.1]/api/v1', 'https://[::ffff:127.255.255.255]/api/v1',
  'https://[::]/api/v1', 'https://[::ffff:0.0.0.0]/api/v1', 'https://0/api/v1',
  'http://api.example.test/api/v1', '/api/v1', 'not-a-url', 'file:///api/v1',
  'https://api.example.test@localhost/api/v1', 'https://localhost@api.example.test/api/v1',
  'https://api.example.test/api/v1?token=synthetic', 'https://api.example.test/api/v1#fragment',
  'https://api.example.test/api/v1?', 'https://api.example.test/api/v1#', 'https://api.example.test/api/v1?#',
];
for (const config of unsafeUrls) {
  test(`production canonical URL rejects ${config} before fetch`, async () => {
    let calls = 0;
    global.fetch = async () => {calls++; return new Response('{}');};
    await assert.rejects(api(config).apiGet('/health'), error => error.code === 'API_NOT_CONFIGURED');
    assert.equal(calls, 0);
  });
}

test('test and unspecified modes cannot enable localhost fallback', async () => {
  let calls = 0;
  global.fetch = async () => {calls++; return new Response('{}');};
  for (const mode of ['test', 'staging', undefined]) {
    // Passing undefined uses the helper default; explicitly unset the mode after module loading.
    const client = api(undefined, 'localhost', mode);
    if (mode === undefined) delete process.env.NODE_ENV;
    await assert.rejects(client.apiGet('/health'), error => error.code === 'API_NOT_CONFIGURED');
  }
  assert.equal(calls, 0);
});

test('development on a public page cannot request visitors localhost', async () => {
  let calls = 0;
  global.fetch = async () => {calls++; return new Response('{}');};
  await assert.rejects(api(undefined, 'weather.example.test', 'development').apiGet('/health'), error => error.code === 'API_NOT_CONFIGURED');
  assert.equal(calls, 0);
});

test('explicit local development accepts its configured HTTP API', async () => {
  let requested;
  global.fetch = async url => {requested = url; return new Response('{}');};
  await api('http://127.0.0.1:8000/api/v1', 'localhost', 'development').apiGet('/health');
  assert.equal(requested, 'http://127.0.0.1:8000/api/v1/health');
});

test('production on localhost still accepts a valid configured HTTPS API', async () => {
  let requested;
  global.fetch = async url => {requested = url; return new Response('{}');};
  await api('https://api.example.test/api/v1', 'localhost', 'production').apiGet('/health');
  assert.equal(requested, 'https://api.example.test/api/v1/health');
});

test('encoded query and fragment characters inside the path remain usable', async () => {
  let requested;
  global.fetch = async url => {requested = url; return new Response('{}');};
  await api('https://api.example.test/api%3Fv1%23prefix').apiGet('/health');
  assert.equal(requested, 'https://api.example.test/api%3Fv1%23prefix/health');
});
