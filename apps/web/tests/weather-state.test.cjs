require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {getWeatherState, getAdviceState, getStationState, formatSourceTime, currentForecastDays, currentWeatherDay, currentStations} = require('../lib/weather-state.ts');
const now = Date.parse('2026-11-05T12:00:00+08:00');
const fresh = {city:'臺北市',district:'北投區',updatedAt:'2026-11-05T11:30:00+08:00',source:'CWA OpenData',dataStatus:'live',days:[{date:'2026-11-05',weather:'Synthetic'}]};
const state = (data, rest={}) => getWeatherState({data,city:'臺北市',district:'北投區',loading:false,now,...rest});
test('only a current matching official forecast is synchronized', () => {
  assert.equal(state(fresh).isSynced,true);
  assert.equal(state({...fresh,city:'臺南市'}).showData,false);
  assert.equal(state({...fresh,district:'安平區'}).showData,false);
});
test('expired forecast is never synchronized even if API calls it live', () => {
  const result=state({...fresh,updatedAt:'2001-01-01T00:00:00+08:00',days:[{date:'2001-01-01'}]});
  assert.equal(result.kind,'stale');
  assert.equal(result.isSynced,false);
  assert.equal(result.showData,false);
});
test('unknown, invalid and future timestamps cannot claim synchronization', () => {
  for(const updatedAt of [null,'invalid','2026-11-08T00:00:00+08:00']) {
    assert.equal(state({...fresh,updatedAt}).kind,'unknown');
    assert.equal(state({...fresh,updatedAt}).isSynced,false);
  }
});
test('legacy payload without explicit data status is not declared live', () => {
  assert.equal(state({...fresh,dataStatus:undefined}).kind,'unknown');
});
test('empty forecast and failed refresh do not retain a normal result', () => {
  assert.equal(state({...fresh,days:[]}).kind,'empty');
  assert.equal(state(fresh,{error:new Error('network')}).kind,'error');
  assert.equal(state(fresh,{loading:true}).showData,false);
});
test('mock provenance overrides a misleading live flag', () => {
  const result=state({...fresh,source:'模擬天氣資料'});
  assert.equal(result.kind,'mock');
  assert.equal(result.isSynced,false);
});
test('stale/empty forecast prevents normal advisory presentation', () => {
  for(const weather of [state({...fresh,days:[]}),state({...fresh,updatedAt:'2001-01-01T00:00:00+08:00'})]) {
    const result=getAdviceState({weather,data:{riskLevel:'normal',summary:'Synthetic'},loading:false});
    assert.equal(result.showData,false);
  }
});
test('unverified advice cannot inherit official provenance from weather', () => {
  const weather=state(fresh);
  assert.equal(getAdviceState({weather,data:{riskLevel:'normal',summary:'Legacy'},loading:false}).kind,'unknown');
  assert.equal(getAdviceState({weather,data:{riskLevel:'normal',summary:'Synthetic',source:'Mock Weather Data',dataStatus:'live'},loading:false}).kind,'mock');
});
test('current forecast excludes yesterday and today card never substitutes tomorrow', () => {
  const days=[{date:'2026-11-04',weather:'Yesterday'},{date:'2026-11-05',weather:'Today'},{date:'2026-11-06',weather:'Tomorrow'}];
  assert.deepEqual(currentForecastDays(days,now).map(d=>d.weather),['Today','Tomorrow']);
  assert.equal(currentWeatherDay(days,now).weather,'Today');
  assert.equal(currentWeatherDay([days[2]],now),undefined);
});
test('fresh aggregate cannot expose expired or undated station values', () => {
  const stations=[{stationId:'fresh',obsTime:'2026-11-05T11:30:00+08:00'},{stationId:'old',obsTime:'2001-01-01T00:00:00+08:00'},{stationId:'unknown',obsTime:null}];
  assert.deepEqual(currentStations(stations,now).map(s=>s.stationId),['fresh']);
});
test('station failure and empty live dataset remain distinguishable', () => {
  const failed=getStationState({data:{dataStatus:'error',reason:'upstream_tls_error',stations:[]},loading:false,now});
  const empty=getStationState({data:{dataStatus:'empty',reason:'empty_dataset',stations:[]},loading:false,now});
  assert.equal(failed.kind,'error');
  assert.equal(empty.kind,'empty');
  assert.notEqual(failed.message,empty.message);
});
test('source time includes year and explicit Taiwan timezone', () => {
  const value=formatSourceTime('2001-01-01T00:00:00+08:00');
  assert.match(value,/2001/);
  assert.match(value,/GMT\+8|UTC\+8|台北/);
  assert.equal(formatSourceTime(null),'時間未提供');
});
