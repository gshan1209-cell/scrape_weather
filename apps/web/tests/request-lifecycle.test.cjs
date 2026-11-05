require('./register.cjs');
const {test, afterEach} = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const {create, act} = require('react-test-renderer');
const {useWeeklyWeather} = require('../features/weather/hooks.ts');
const previousFetch = global.fetch;
const previousWindow = global.window;
const previousConfig = process.env.NEXT_PUBLIC_API_BASE_URL;
let renderer;
let requests=[];
let latest;
function Probe({city}) {latest=useWeeklyWeather(city,'Synthetic district');return null;}
function prepare() {
  requests=[];
  process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test/api/v1';
  global.window={location:{hostname:'weather.example.test'}};
  global.fetch=url=>new Promise(resolve=>requests.push({url,resolve}));
}
async function finish(request,city) {
  await act(async()=>{request.resolve(new Response(JSON.stringify({city,days:[],source:'Synthetic'})));});
}
afterEach(async()=>{
  if(renderer)act(()=>renderer.unmount());
  for(const request of requests)request.resolve(new Response('{}'));
  await new Promise(resolve=>setImmediate(resolve));
  renderer=undefined;
  global.fetch=previousFetch;global.window=previousWindow;
  if(previousConfig===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=previousConfig;
});
test('late previous-city response cannot overwrite the selected city',async()=>{
  prepare();
  await act(async()=>{renderer=create(React.createElement(Probe,{city:'臺北市'}));});
  const old=requests[0];
  await act(async()=>{renderer.update(React.createElement(Probe,{city:'臺南市'}));});
  await finish(requests[1],'臺南市');
  assert.equal(latest.data.city,'臺南市');
  await finish(old,'臺北市');
  assert.equal(latest.data.city,'臺南市');
});
test('refresh clears previous values until a new response succeeds',async()=>{
  prepare();
  await act(async()=>{renderer=create(React.createElement(Probe,{city:'臺北市'}));});
  await finish(requests[0],'臺北市');
  assert.equal(latest.data.city,'臺北市');
  await act(async()=>{latest.reload();});
  assert.equal(latest.loading,true);
  assert.equal(latest.data,undefined);
  await finish(requests[1],'臺北市');
});
