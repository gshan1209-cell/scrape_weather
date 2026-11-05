require('./register.cjs');
const {test,afterEach}=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const Module=require('node:module');
const oldLoad=Module._load,oldFetch=global.fetch,oldWindow=global.window,oldFrame=global.requestAnimationFrame;
const oldConfig=process.env.NEXT_PUBLIC_API_BASE_URL;
const groups=[];
function shape(){const item={};for(const method of ['bindTooltip','on','bringToFront'])item[method]=()=>item;item.addTo=group=>{group.addLayer?.(item);return item};return item;}
const leaflet={map:()=>({createPane(){},getPane:()=>({style:{}}),on(){},invalidateSize(){},setView(){},remove(){}}),tileLayer:shape,circleMarker:shape,circle:shape,polyline:shape,
  layerGroup:()=>{const group={items:[],addTo(){return this},addLayer(item){this.items.push(item)},clearLayers(){this.items=[]}};groups.push(group);return group;}};
// Leaflet is an external DOM renderer; inspect the real component's layer lifecycle.
Module._load=function(name,...args){return name==='leaflet'?leaflet:oldLoad.call(this,name,...args)};
const {LeafletWeatherMap}=require('../components/map/LeafletWeatherMap.tsx');
let tree,calls;
const now=new Date().toISOString();
const stations={updatedAt:now,source:'CWA OpenData',dataStatus:'live',stations:[{stationId:'SYNTHETIC',stationName:'Synthetic',countyName:'臺北市',townName:'北投區',lat:25,lon:121,obsTime:now,airTemperature:28}]};
const ready={kind:'ready',title:'資料已同步',message:'Synthetic',showData:true,isSynced:true,tone:'info'};
const props={config:{provider:'mock',defaultLat:23.7,defaultLon:121,defaultZoom:7,defaultOverlay:'rain'},city:'臺北市',district:'北投區',stations,stationState:ready,adviceState:ready};
async function mount(){groups.length=0;calls=0;process.env.NEXT_PUBLIC_API_BASE_URL='https://api.example.test/api/v1';global.window={location:{hostname:'weather.example.test'},setInterval,clearInterval};global.requestAnimationFrame=fn=>fn();global.fetch=async()=>{calls++;return new Response(JSON.stringify(stations))};await act(async()=>{tree=create(React.createElement(LeafletWeatherMap,props),{createNodeMock:()=>({})})});assert.equal(groups.length,2);}
afterEach(()=>{if(tree)act(()=>tree.unmount());tree=undefined;global.fetch=oldFetch;global.window=oldWindow;global.requestAnimationFrame=oldFrame;if(oldConfig===undefined)delete process.env.NEXT_PUBLIC_API_BASE_URL;else process.env.NEXT_PUBLIC_API_BASE_URL=oldConfig;});
test('map clears current markers when parent changes to stale or loading',async()=>{
  await mount();assert.equal(groups[1].items.length,1);
  await act(async()=>{tree.update(React.createElement(LeafletWeatherMap,{...props,stationState:{...ready,kind:'stale',showData:false}}))});
  assert.equal(groups[1].items.length,0);
  await act(async()=>{tree.update(React.createElement(LeafletWeatherMap,{...props,stations:undefined,stationState:{...ready,kind:'loading',showData:false}}))});
  assert.equal(groups[1].items.length,0);
});
test('map consumes the parent station resource without a second request',async()=>{await mount();assert.equal(calls,0);});
