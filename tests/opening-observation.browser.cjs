'use strict';
// Fixture-only browser smoke. Requires Playwright and an explicitly chosen local Chromium.
// Does not load real market data or access the operator's existing services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES || '', 'playwright'));
const root = path.resolve(__dirname, '../site');
const context = {tradeDate:'2026-10-28',candidateSourceDate:'2026-10-27',chartSourceDate:'2026-10-27',revision:'fixture-r3',symbol:'301655.SZ',name:'SYNTHETIC FIXTURE',sources:[{id:'first',title:'原组一'},{id:'second',title:'原组二'}],candidateCount:23};
function fixture(symbol) {
  return {schema_version:'research.opening_observation.v1',trade_date:'2026-10-28',symbol,market:'A_SHARE',candidate_context:{source_date:'2026-10-27',authority:'CLIENT_CONTEXT_ONLY',stage_input_identity_verified:false},generated_at:'2026-10-28T10:00:00+08:00',status:'PARTIAL',write_performed:false,RESEARCH_ONLY:true,research_only:true,production_allowed:false,buy_gate_updated:false,orders_sent:false,
    stages:['STAGE_0925','STAGE_0930_0935','STAGE_0935_0940'].map(stage_id=>({stage_id,window:'fixture native window',cutoff_at:'09:25:05',availability:'AVAILABLE',source_status:'CANNOT_CONFIRM',observation_mode:'RETROSPECTIVE',temporal_state:'LATE',missing_reasons:['FIXTURE_ONLY'],raw:{source_rows:19,requested_rows:20,row_count:19,coverage_ratio:0.95,run_id:'fixture-run',captured_at:null,available_at:null},rows:[{symbol,source_symbol:symbol,native:{fixture:true},quote_time:'2026-10-28T09:25:00+08:00'}],selection:{coverage_scope:'STAGE_RECOMMENDATIONS_TOP10_ONLY',selected_symbol_present:false,raw_binding_matches:null,missing_reasons:[],envelope:{fixture:true}},metrics:{price:0,previous_close:10,change_pct:-100,volume:0,turnover:null,quote_time:'2026-10-28T09:25:00+08:00',price_basis:'SOURCE_REPORTED_UNVERIFIED',historical_support_comparison:'UNAVAILABLE_PRICE_BASIS_UNVERIFIED',historical_volume_ratio:null,historical_volume_ratio_reason:'COMPARABLE_HISTORICAL_WINDOW_UNAVAILABLE',missing_reasons:['TURNOVER_UNAVAILABLE']}}))};
}
let slow = false;
const server = http.createServer((req,res)=>{
  const url = new URL(req.url,'http://localhost');
  if(url.pathname==='/fixture.html') {res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/research-days.css"><link rel="stylesheet" href="/opening-observation.css"><main><p>SYNTHETIC FIXTURE — no live data</p><section id="openingObservation" class="card opening-observation"></section></main><script src="/opening-observation.js"></script>');return;}
  if(url.pathname==='/api/v3/research/opening-observation') {
    const symbol=url.searchParams.get('symbol');if(symbol==='300001.SZ'){res.writeHead(404);res.end('fixture failure');return;}
    const send=()=>{if(!res.destroyed){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(fixture(symbol)));}};
    if(slow&&symbol==='301655.SZ')setTimeout(send,80);else send();return;
  }
  const allowed = new Set(['daily.html','daily.js','research28-daily.js','related-reports.js','calendar.js','opening-observation.js','opening-observation.css','research-days.css']);
  const filename=url.pathname.slice(1);if(allowed.has(filename)){res.setHeader('Content-Type',filename.endsWith('.js')?'application/javascript':filename.endsWith('.css')?'text/css':'text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,filename)));return;}
  res.writeHead(404);res.end('fixture server intentionally has no production manifests/data');
});
(async()=>{
  let browser;
  try {
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({executablePath:process.env.OPENING_TEST_CHROMIUM || '/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
    const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/fixture.html');await page.evaluate(context=>window.OpeningObservation.select(context),context);
    let text=await page.locator('#openingObservation').innerText();for(const expected of ['价格：0','成交量：0','成交额：UNKNOWN','LATE','RETROSPECTIVE','原组一','原组二','19 / 20','不表示筛除'])assert.ok(text.includes(expected),expected);
    assert.equal(await page.locator('.opening-stage').count(),3);
    await page.setViewportSize({width:390,height:844});const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(x=>x.getBoundingClientRect().right>innerWidth||x.scrollWidth>x.clientWidth+1).map(x=>({tag:x.tagName,class:x.className,right:x.getBoundingClientRect().right,width:x.getBoundingClientRect().width})).slice(0,12)}));assert.equal(overflow.scroll<=overflow.width,true,'mobile viewport has horizontal overflow '+JSON.stringify(overflow));
    await page.locator('.opening-stage details').first().locator('summary').click();assert.ok((await page.locator('.opening-stage pre').first().innerText()).includes('fixture-run'));
    await page.screenshot({path:'/tmp/opening-observation-fixture-mobile.png',fullPage:true});
    await page.evaluate(context=>window.OpeningObservation.select({...context,symbol:'300001.SZ'}),context);text=await page.locator('#openingObservation').innerText();assert.ok(text.includes('HTTP 404'));assert.ok(!text.includes('价格：0'));
    slow=true;await page.evaluate(context=>{void window.OpeningObservation.select(context);void window.OpeningObservation.select({...context,symbol:'600000.SH'});},context);
    await page.waitForFunction(()=>document.getElementById('openingObservation').textContent.includes('价格：0'));text=await page.locator('#openingObservation').innerText();assert.ok(text.includes('600000.SH'));assert.ok(!text.includes('301655.SZ'));
    await page.evaluate(context=>{void window.OpeningObservation.select(context);window.OpeningObservation.clear();},context);assert.ok((await page.locator('#openingObservation').innerText()).includes('等待选择'));
    await page.goto(origin+'/daily.html?date=2026-10-27');await page.waitForFunction(()=>document.getElementById('error').textContent.includes('归档索引无法读取'));
    assert.equal(await page.locator('#content').isHidden(),true);assert.equal(await page.locator('nav a[href="archive/2026-10-27/index.html"]').count(),1);assert.ok((await page.locator('body').innerText()).includes('未接入'));
    assert.deepEqual(errors,[]);console.log('PASS browser fixture: zero/null, source states, all groups, coverage vs Top10, responsive 390px, expandable evidence, HTTP404, stock race, clear, actual daily missing-manifest state.');
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
