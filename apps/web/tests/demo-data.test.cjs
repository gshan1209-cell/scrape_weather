require('./register.cjs');
const {test,afterEach} = require('node:test');
const assert = require('node:assert/strict');
const {fetchWeeklyWeather,fetchStations} = require('../features/weather/api.ts');
const {fetchWeeklyAdvisory} = require('../features/advisory/api.ts');
const {fetchLocations} = require('../features/location/api.ts');
const {fetchHealth} = require('../features/system/api.ts');
const {getWeatherState,getAdviceState,getStationState} = require('../lib/weather-state.ts');
const {DEMO_SOURCE} = require('../lib/demo-data.ts');
const {DEMO_TIME_LABELS} = require('../lib/demo-data.ts');
const {isDemoMode} = require('../lib/weather-api.ts');
const {getWeatherMapConfig} = require('../features/weather-map/config.ts');
const original={fetch:global.fetch,window:global.window,config:process.env.NEXT_PUBLIC_API_BASE_URL,mode:process.env.NODE_ENV};
afterEach(()=>{global.fetch=original.fetch;global.window=original.window;for(const [key,value] of [['NEXT_PUBLIC_API_BASE_URL',original.config],['NODE_ENV',original.mode]]){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
function noApi(value){if(value===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=value;process.env.NODE_ENV='production';global.window={location:{hostname:'localhost'}};global.fetch=async()=>{throw Error('Demo must not fetch');};}

test('missing blank and empty API select fixed non-live demo without fetch',async()=>{
  for(const value of [undefined,'','   ']){noApi(value);const data=await fetchWeeklyWeather('臺北市','北投區');assert.equal(data.source,DEMO_SOURCE);assert.equal(data.updatedAt,null);assert.equal(data.days.length,7);assert.equal(data.days[0].date,'2024-01-01');const state=getWeatherState({data,loading:false,city:'臺北市',district:'北投區'});assert.equal(state.kind,'demo');assert.equal(state.isSynced,false);assert.equal(state.showData,true);}
});
test('map regions and existing crops return consistent demonstration selections',async()=>{
  noApi();const {locations}=await fetchLocations();assert.equal(locations.length,5);
  for(const {city,districts} of locations){assert.ok(districts.length>=2);for(const crop of ['水稻','葉菜','果樹','一般作物']){const data=await fetchWeeklyWeather(city,districts[0]),advice=await fetchWeeklyAdvisory(city,districts[0],crop);assert.equal(data.city,city);assert.equal(data.district,districts[0]);assert.equal(advice.crop,crop);assert.match(advice.summary,/非實際農事建議/);assert.ok(advice.summary.includes(crop));const weather=getWeatherState({data,loading:false,city,district:districts[0]});assert.equal(getAdviceState({weather,data:advice,loading:false}).kind,'demo');}}
});
test('returning to a city preserves fixed sample values and does not mutate previous data',async()=>{
  noApi();const original=await fetchWeeklyWeather('臺北市','北投區');await fetchWeeklyWeather('臺南市','安南區');assert.deepEqual(await fetchWeeklyWeather('臺北市','北投區'),original);assert.notDeepEqual((await fetchWeeklyWeather('臺南市','安南區')).days,original.days);
});
test('demo health and station empty state never claim API online or observations',async()=>{
  noApi();assert.equal((await fetchHealth()).status,'demo');const stations=await fetchStations();assert.equal(stations.updatedAt,null);assert.deepEqual(stations.stations,[]);const state=getStationState({data:stations,loading:false});assert.equal(state.kind,'empty');assert.match(state.message,/不提供真實測站觀測/);
});
test('unsupported demo selections return empty states',async()=>{
  noApi();const data=await fetchWeeklyWeather('Unknown','Unknown');assert.deepEqual(data.days,[]);assert.equal(getWeatherState({data,loading:false,city:'Unknown',district:'Unknown'}).kind,'empty');assert.equal((await fetchWeeklyAdvisory('臺北市','北投區','Unknown crop')).dataStatus,'empty');
});
test('configured unsafe API does not silently fall back to demo',async()=>{
  for(const value of ['http://localhost:8000/api/v1','https://127.1/api/v1','https://[::]/api/v1','https://api.example.test/api/v1?']){noApi(value);await assert.rejects(fetchWeeklyWeather('臺北市','北投區'),error=>error.code==='API_NOT_CONFIGURED');}
});
test('configured HTTPS succeeds or fails through the actual transport',async()=>{
  noApi('https://api.example.test/api/v1');let calls=0;global.fetch=async()=>{calls++;return new Response('{"synthetic":"https"}');};assert.deepEqual(await fetchWeeklyWeather('臺北市','北投區'),{synthetic:'https'});assert.equal(calls,1);global.fetch=async()=>{throw Error('Synthetic offline');};await assert.rejects(fetchWeeklyWeather('臺北市','北投區'),/Synthetic offline/);
});

test('demo identity and map timeline remain sample-based while resources reload',()=>{
  noApi();assert.equal(isDemoMode(),true);assert.equal(getWeatherState({loading:true,city:'臺北市'}).kind,'loading');assert.equal(isDemoMode(),true);
  assert.equal(DEMO_TIME_LABELS.length,10);assert.ok(DEMO_TIME_LABELS.every(label=>label.includes('示範影格')&&!/現在|小時|天/.test(label)));
  process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test/api/v1';assert.equal(isDemoMode(),false);
});
test('no-API demo cannot activate a keyed Windy provider',()=>{
  noApi();process.env.NEXT_PUBLIC_WEATHER_MAP_PROVIDER='windy';process.env.NEXT_PUBLIC_WINDY_API_KEY='synthetic-only';
  try{const config=getWeatherMapConfig();assert.equal(config.provider,'mock');assert.equal(config.windyApiKey,undefined);}finally{delete process.env.NEXT_PUBLIC_WEATHER_MAP_PROVIDER;delete process.env.NEXT_PUBLIC_WINDY_API_KEY;}
});
