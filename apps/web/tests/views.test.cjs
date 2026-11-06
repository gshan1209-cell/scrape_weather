require('./register.cjs');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {MapFloatingAdvice} = require('../components/map/MapFloatingAdvice.tsx');
const {SummarySidebar} = require('../components/layout/SummarySidebar.tsx');
const {FarmerAdviceCard} = require('../components/farmer/FarmerAdviceCard.tsx');
const {CurrentWeatherCard} = require('../components/weather/CurrentWeatherCard.tsx');
const {getWeatherState} = require('../lib/weather-state.ts');
const {ApiClientError} = require('../lib/api-client.ts');
const render = (Component,props) => renderToStaticMarkup(React.createElement(Component,props));
const failed={kind:'error',title:'載入失敗',message:'資料無法取得，請稍後重試。',showData:false,isSynced:false,tone:'warning'};
const stale={...failed,kind:'stale',title:'資料已過期',message:'預報已過期，暫不提供農事建議。'};
const empty={...failed,kind:'empty',title:'尚無資料',message:'所選城市尚無預報資料。'};
const advisory={city:'臺北市',riskLevel:'normal',summary:'Synthetic normal advice',suggestions:['Synthetic suggestion'],alerts:[]};
test('map advice shows failed state instead of loading or previous normal advice', () => {
  const html=render(MapFloatingAdvice,{advisory,crop:'水稻',state:failed});
  assert.match(html,/載入失敗/);
  assert.doesNotMatch(html,/載入中|正在載入|Synthetic normal advice/);
});
test('empty/stale summary cannot show normal or synchronized labels', () => {
  for(const weatherState of [stale,empty]) {
    const html=render(SummarySidebar,{city:'臺北市',crop:'水稻',loading:false,advisory,day:{date:'2001-01-01',weather:'Synthetic'},days:[],weatherState,adviceState:weatherState,mapMode:'Leaflet 模擬',healthLoading:false});
    assert.match(html,new RegExp(weatherState.title));
    assert.doesNotMatch(html,/田間條件穩定|>正常<|已同步|Synthetic normal advice/);
  }
});
test('advisory card does not show stale normal risk', () => {
  const html=render(FarmerAdviceCard,{advisory,loading:false,state:stale});
  assert.match(html,/資料已過期/);
  assert.doesNotMatch(html,/>正常<|Synthetic normal advice/);
});
test('weather card shows stale explanation instead of old weather values', () => {
  const html=render(CurrentWeatherCard,{day:{date:'2001-01-01',weather:'Synthetic old weather',minTemp:20,maxTemp:28},loading:false,source:'CWA OpenData',state:stale});
  assert.match(html,/資料已過期/);
  assert.doesNotMatch(html,/Synthetic old weather/);
});

test('invalid API configuration explains missing production backend without showing old advice', () => {
  const config = getWeatherState({city:'台北市',loading:false,error:new ApiClientError('API_NOT_CONFIGURED','configuration invalid')});
  const html=render(SummarySidebar,{city:'台北市',crop:'水稻',loading:false,advisory,days:[],weatherState:config,adviceState:config,mapMode:'Leaflet 模擬',healthLoading:false});
  assert.match(html,/正式天氣後端/);
  assert.doesNotMatch(html,/Synthetic normal advice|已同步|API 在線/);
});
