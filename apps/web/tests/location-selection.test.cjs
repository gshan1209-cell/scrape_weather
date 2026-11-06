require('./register.cjs');
const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const {create, act} = require('react-test-renderer');
const Module = require('node:module');
const originalLoad = Module._load;
// The map owns an external DOM renderer; keep the real home/selectors/hooks.
Module._load = function(name, ...args) {
  return name === '@/components/map/WeatherMapShell'
    ? {WeatherMapShell: () => null}
    : originalLoad.call(this, name, ...args);
};
const HomePage = require('../app/page.tsx').default;
Module._load = originalLoad;
const previousFetch = global.fetch, previousWindow = global.window;
const previousConfig = process.env.NEXT_PUBLIC_API_BASE_URL;
let renderer, requests;
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
  renderer = undefined;
  global.fetch = previousFetch;
  global.window = previousWindow;
  if (previousConfig === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
  else process.env.NEXT_PUBLIC_API_BASE_URL = previousConfig;
});

test('city selection uses location API districts when station observations are unavailable', async () => {
  requests = [];
  process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test/api/v1';
  global.window = {location: {hostname: 'weather.example.test'}, setInterval, clearInterval};
  global.fetch = async input => {
    const url = new URL(input);
    requests.push(url);
    let payload = {city: url.searchParams.get('city'), district: url.searchParams.get('district'), days: [], stations: [], dataStatus: 'empty'};
    if (url.pathname.endsWith('/locations')) payload = {locations: [
      {city: '臺北市', districts: ['北投區']},
      {city: '臺南市', districts: ['安平區', '中西區']},
    ]};
    return new Response(JSON.stringify(payload));
  };
  await act(async () => {renderer = create(React.createElement(HomePage));});
  await act(async () => {
    renderer.root.findByProps({'aria-label': '縣市'}).props.onChange({target: {value: '臺南市'}});
  });
  const district = renderer.root.findByProps({'aria-label': '行政區'});
  assert.equal(district.props.value, '安平區');
  assert.deepEqual(district.findAllByType('option').map(option => option.props.value), ['安平區', '中西區']);
  const forecast = requests.filter(url => url.pathname.endsWith('/weather/weekly')).at(-1);
  assert.equal(forecast.searchParams.get('city'), '臺南市');
  assert.equal(forecast.searchParams.get('district'), '安平區');
});
