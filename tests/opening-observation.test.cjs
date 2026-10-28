'use strict';
// Synthetic fixtures only. Never loaded by the product page.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
class Element {
  constructor(tag='div') { this.tagName=tag; this.children=[]; this.hidden=false; this.attributes={}; this._text=''; }
  set textContent(value) { this._text=String(value); this.children=[]; }
  get textContent() { return this._text+this.children.map(x=>x.textContent).join(''); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this._text=''; this.children=children; }
  setAttribute(key,value) { this.attributes[key]=String(value); }
}
const context=(extra={})=>({tradeDate:'2026-10-28',candidateSourceDate:'2026-10-27',chartSourceDate:'2026-10-27',revision:'r3',symbol:'301655.SZ',name:'fixture security',sources:[{id:'first',title:'原组一'},{id:'second',title:'原组二'}],candidateCount:23,...extra});
function response(extra={}) {
  return {schema_version:'research.opening_observation.v1',trade_date:'2026-10-28',symbol:'301655.SZ',market:'A_SHARE',candidate_context:{source_date:'2026-10-27',authority:'CLIENT_CONTEXT_ONLY',stage_input_identity_verified:false},generated_at:'2026-10-28T10:00:00+08:00',status:'PARTIAL',write_performed:false,RESEARCH_ONLY:true,research_only:true,production_allowed:false,buy_gate_updated:false,orders_sent:false,
    stages:['STAGE_0925','STAGE_0930_0935','STAGE_0935_0940'].map((stage_id,i)=>({stage_id,window:i?'09:30–09:35':'09:20–09:25',cutoff_at:i?'09:35:05':'09:25:05',availability:'AVAILABLE',source_status:'CANNOT_CONFIRM',observation_mode:'RETROSPECTIVE',temporal_state:'LATE',missing_reasons:['fixture late receipt'],raw:{requested_rows:20,source_rows:19,row_count:19,coverage_ratio:0.95,captured_at:'2026-10-28T09:40:00+08:00',available_at:null,coverage_scope:'VERIFIED_RAW_INPUT_ONLY',run_id:'fixture-run',artifact_sha256:'a'.repeat(64),manifest_file_sha256:'b'.repeat(64)},selection:{coverage_scope:'STAGE_RECOMMENDATIONS_TOP10_ONLY',selected_symbol_present:false,raw_binding_matches:false,envelope:{fixture:true},missing_reasons:['RAW_BINDING_MISMATCH']},rows:[{symbol:'301655.SZ',source_symbol:'SZ.301655',quote_time:'2026-10-28T09:25:00+08:00',temporal_cutoff_safe:false,native:{fixture:true}}],metrics:{price:0,previous_close:10,change_pct:-100,volume:0,turnover:null,quote_time:'2026-10-28T09:25:00+08:00',price_basis:'SOURCE_REPORTED_UNVERIFIED',historical_support_comparison:'UNAVAILABLE_PRICE_BASIS_UNVERIFIED',historical_volume_ratio:null,historical_volume_ratio_reason:'COMPARABLE_HISTORICAL_WINDOW_UNAVAILABLE',missing_reasons:['turnover missing']}})),...extra};
}
function harness() {
  const section=new Element('section'), pending=[];
  const document={getElementById:id=>id==='openingObservation'?section:null,createElement:tag=>new Element(tag)};
  const window={};
  const sandbox={window,document,URLSearchParams,AbortController,console,fetch:(url,options)=>new Promise((resolve,reject)=>pending.push({url,options,resolve:data=>resolve({ok:true,json:async()=>data}),reject,http:status=>resolve({ok:false,status})}))};
  const file=path.join(__dirname,'../site/opening-observation.js');
  if(fs.existsSync(file))vm.runInNewContext(fs.readFileSync(file,'utf8'),sandbox);
  return {api:window.OpeningObservation,section,pending};
}
test('opening module exports the selection lifecycle',()=>{const h=harness();assert.equal(typeof h.api?.select,'function');assert.equal(typeof h.api?.clear,'function');});
test('zero survives, absence stays unknown, raw coverage differs from page and Top10, all memberships remain',async()=>{
  const h=harness();assert.ok(h.api,'opening lifecycle is missing');const done=h.api.select(context());
  assert.equal(h.pending[0].url,'/api/v3/research/opening-observation?date=2026-10-28&symbol=301655.SZ&candidate_source_date=2026-10-27');
  h.pending[0].resolve(response());await done;const text=h.section.textContent;
  for(const expected of ['原组一','原组二','23','价格：0','成交量：0','成交额：UNKNOWN','19 / 20','Top10','不表示筛除','LATE','RETROSPECTIVE','CANNOT_CONFIRM','RAW_BINDING_MISMATCH','2026-10-28T09:25:00+08:00'])assert.ok(text.includes(expected),expected);
});
test('long pool provenance stays out of the inline summary and remains complete in disclosure',async()=>{
  const h=harness();assert.ok(h.api);const done=h.api.select(context());const data=response();
  const sourceEvidence=Array.from({length:260},(_,i)=>`SYNTHETIC_POOL_EVIDENCE_${i}_${'x'.repeat(128)}`);
  const cannotConfirm=Array.from({length:8},(_,i)=>`SYNTHETIC_CANNOT_CONFIRM_${i}_${'y'.repeat(128)}`);
  for(const stage of data.stages)stage.raw.pool_identity={pool_id:'fixture-pool',revision:'fixture-r1',source_evidence:sourceEvidence,cannot_confirm:cannotConfirm};
  h.pending[0].resolve(data);await done;
  const cards=h.section.children.filter(x=>x.tagName==='article');
  const inline=cards.map(card=>card.children.filter(x=>x.tagName!=='details').map(x=>x.textContent).join('')).join('');
  const poolLines=cards.map(card=>card.children.find(x=>x.tagName==='p'&&x.textContent.includes('池/修订摘要'))?.textContent||'');
  assert.ok(poolLines.every(line=>line.length<350),`pool summary grew to ${Math.max(...poolLines.map(line=>line.length))} characters`);
  assert.match(inline,/fixture-pool/);assert.match(inline,/source_evidence=260项/);assert.match(inline,/cannot_confirm=8项/);
  assert.ok(!inline.includes('SYNTHETIC_POOL_EVIDENCE_'));
  const disclosure=cards.map(card=>card.children.filter(x=>x.tagName==='details').map(box=>box.children.find(x=>x.tagName==='pre')?.textContent||'').join('')).join('');
  for(const marker of ['SYNTHETIC_POOL_EVIDENCE_0_','SYNTHETIC_POOL_EVIDENCE_259_','SYNTHETIC_CANNOT_CONFIRM_0_','SYNTHETIC_CANNOT_CONFIRM_7_'])assert.ok(disclosure.includes(marker),marker);
});
for(const [name,change] of [
  ['wrong date',x=>x.trade_date='2026-10-27'],['wrong security',x=>x.symbol='600000.SH'],['wrong market',x=>x.market='HK_CONNECT'],['wrong source day',x=>x.candidate_context.source_date='2026-10-26'],['unsafe action flag',x=>x.orders_sent=true],['uppercase research flag false',x=>x.RESEARCH_ONLY=false],['foreign raw row',x=>x.stages[0].rows[0].symbol='00700.HK'],['duplicate stages',x=>x.stages[1].stage_id=x.stages[0].stage_id]
])test('rejects '+name+' before showing observations',async()=>{const h=harness();assert.ok(h.api);const done=h.api.select(context());const data=response();change(data);h.pending[0].resolve(data);await done;assert.match(h.section.textContent,/合同|身份|不一致/);assert.ok(!h.section.textContent.includes('价格：0'));});
test('late stale success and failure cannot replace a newer stock or date selection',async()=>{
  const h=harness();assert.ok(h.api);const old=h.api.select(context());const newer=h.api.select(context({tradeDate:'2026-10-29',candidateSourceDate:'2026-10-28',symbol:'600000.SH'}));
  assert.equal(h.pending[0].options.signal.aborted,true);const data=response({trade_date:'2026-10-29',symbol:'600000.SH',candidate_context:{source_date:'2026-10-28',authority:'CLIENT_CONTEXT_ONLY',stage_input_identity_verified:false}});for(const s of data.stages)s.rows=[];
  h.pending[1].resolve(data);await newer;h.pending[0].resolve(response());await old;assert.match(h.section.textContent,/600000.SH/);assert.ok(!h.section.textContent.includes('301655.SZ'));
  const stale=h.api.select(context());const final=h.api.select(context({symbol:'600000.SH'}));const finalData=response({symbol:'600000.SH'});for(const s of finalData.stages)s.rows=[];h.pending[3].resolve(finalData);await final;h.pending[2].reject(Error('old failure'));await stale;assert.ok(!h.section.textContent.includes('old failure'));
});
test('clear while loading prevents old response from repopulating observations',async()=>{const h=harness();assert.ok(h.api);const done=h.api.select(context());h.api.clear();h.pending[0].resolve(response());await done;assert.ok(!h.section.textContent.includes('价格：0'));assert.match(h.section.textContent,/等待选择/);});
test('HTTP failure has explicit empty state and does not retain old prices',async()=>{const h=harness();assert.ok(h.api);const first=h.api.select(context());h.pending[0].resolve(response());await first;const next=h.api.select(context());h.pending[1].http(404);await next;assert.match(h.section.textContent,/HTTP 404/);assert.ok(!h.section.textContent.includes('价格：0'));});
test('NOT_DUE hides any supplied future snapshot and marks stage unavailable',async()=>{const h=harness();assert.ok(h.api);const done=h.api.select(context());const data=response();for(const s of data.stages)s.availability='NOT_DUE';h.pending[0].resolve(data);await done;assert.match(h.section.textContent,/NOT_DUE/);assert.ok(!h.section.textContent.includes('价格：0'));assert.ok(!h.section.textContent.includes('fixture-run'));});
test('unknown candidate source day is omitted instead of fabricated',async()=>{const h=harness();assert.ok(h.api);const done=h.api.select(context({candidateSourceDate:null}));assert.ok(!h.pending[0].url.includes('candidate_source_date'));h.pending[0].resolve(response({candidate_context:{source_date:null,authority:'CLIENT_CONTEXT_ONLY',stage_input_identity_verified:false}}));await done;assert.match(h.section.textContent,/候选源日：UNKNOWN/);});
test('unresolved native A identity is explicit without opening provenance details',async()=>{
  const h=harness();assert.ok(h.api);const done=h.api.select(context());const data=response();for(const s of data.stages){s.rows=[];s.raw.identity_missing_reasons=['AMBIGUOUS_A_SOURCE_IDENTITY'];s.raw.unresolved_source_symbols=['A.301655'];s.selection.selected_symbol_present=null;}
  h.pending[0].resolve(data);await done;const top=h.section.children.filter(x=>x.tagName==='article').map(x=>x.children.filter(y=>y.tagName!=='details').map(y=>y.textContent).join('')).join('');
  assert.match(top,/AMBIGUOUS_A_SOURCE_IDENTITY/);assert.match(top,/A.301655/);assert.match(top,/不能确认本股覆盖/);
});
test('market cutoff stays distinct from scheduler and timestamp conflicts stay visible',async()=>{
  const h=harness();assert.ok(h.api);const done=h.api.select(context({symbol:'00700.HK'}));const data=response({symbol:'00700.HK',market:'HK_CONNECT'});
  for(const s of data.stages){s.rows[0].symbol='00700.HK';s.cutoff_at='09:20:05';s.scheduled_cutoff_at='09:25:05';s.raw.timestamp_missing_reasons=['CONFLICTING_AVAILABILITY_TIMESTAMPS'];s.raw.coverage_missing_reasons=['NATIVE_REQUESTED_ROWS_UNAVAILABLE'];}
  h.pending[0].resolve(data);await done;const top=h.section.children.filter(x=>x.tagName==='article').map(x=>x.children.filter(y=>y.tagName!=='details').map(y=>y.textContent).join('')).join('');
  for(const expected of ['09:20:05','调度截止','09:25:05','CONFLICTING_AVAILABILITY_TIMESTAMPS','NATIVE_REQUESTED_ROWS_UNAVAILABLE'])assert.ok(top.includes(expected),expected);
});
function dailyHarness() {
  const elements=new Map(), selected=[], clears=[];const get=id=>{if(!elements.has(id)){const e=new Element();e.querySelectorAll=()=>[];elements.set(id,e);}return elements.get(id);};
  const scope={window:{OpeningObservation:{clear:()=>clears.push(true),select:context=>selected.push(context)}},document:{getElementById:get},location:{search:'?date=2026-10-27&revision=r3',hash:''},URLSearchParams,fetch:()=>new Promise(()=>{}),console};
  vm.createContext(scope);vm.runInContext(fs.readFileSync(path.join(__dirname,'../site/daily.js'),'utf8'),scope);
  return {scope,selected,clears};
}
test('daily context keeps refreshed chart source separate from original candidate provenance and preserves mixed groups',()=>{
  const h=dailyHarness();vm.runInContext(`manifest={research_date:'2026-10-27',chart_source_date:'2026-10-27',revision:'native-r3',groups:[{id:'old',title:'旧池',candidate_source_date:'2026-10-26'},{id:'other',title:'另组'}],stocks:[{symbol:'301655.SZ',name:'fixture',sources:['old','other'],details:[]}]}; select('301655.SZ');`,h.scope);
  assert.equal(h.selected.length,1);const selected=h.selected[0];assert.equal(selected.candidateSourceDate,null);assert.equal(selected.chartSourceDate,'2026-10-27');assert.equal(selected.revision,'native-r3');assert.equal(selected.sources.length,2);assert.equal(selected.candidateCount,1);
});
test('daily uses an explicit common candidate date rather than refreshed chart date',()=>{
  const h=dailyHarness();vm.runInContext(`manifest={research_date:'2026-10-27',chart_source_date:'2026-10-27',groups:[{id:'old',title:'旧池',candidate_source_date:'2026-10-26'}],stocks:[{symbol:'301655.SZ',name:'fixture',sources:['old'],details:[]}]}; select('301655.SZ');`,h.scope);
  assert.equal(h.selected[0]?.candidateSourceDate,'2026-10-26');
});
test('daily chart loading preserves the opening request, while user clear cancels it',()=>{
  const h=dailyHarness();vm.runInContext(`manifest={research_date:'2026-10-27',groups:[{id:'old',title:'旧池'}],stocks:[{symbol:'301655.SZ',name:'fixture',sources:['old'],details:[{dataset:'old',data:'fixture-only.json',data_sha256:'fixture-only'}]}]};select('301655.SZ');`,h.scope);
  assert.equal(h.selected.length,1);assert.equal(h.clears.length,1);vm.runInContext('clear()',h.scope);assert.equal(h.clears.length,2);
});
test('daily keeps all date claims and rejects stock/manifest date conflicting with an original group',()=>{
  const h=dailyHarness();vm.runInContext(`manifest={research_date:'2026-10-27',candidate_source_date:'2026-10-27',groups:[{id:'old',title:'旧池',candidate_source_date:'2026-10-26'},{id:'other',title:'另组'}],stocks:[{symbol:'301655.SZ',candidate_source_date:'2026-10-27',name:'fixture',sources:['old','other'],details:[]}]};select('301655.SZ');`,h.scope);
  const selected=h.selected[0];assert.equal(selected.candidateSourceDate,null);assert.match(selected.candidateSourceDateReason,/CONFLICT/);assert.equal(selected.candidateSourceClaims.length,3);assert.equal(selected.sources.length,2);
});
test('invalid explicit candidate date is retained as a claim but never sent as a date',()=>{
  const h=dailyHarness();vm.runInContext(`manifest={research_date:'2026-10-27',candidate_source_date:'2026-02-30',groups:[{id:'old',title:'旧池',candidate_source_date:'2026-10-26'}],stocks:[{symbol:'301655.SZ',name:'fixture',sources:['old'],details:[]}]};select('301655.SZ');`,h.scope);
  const selected=h.selected[0];assert.equal(selected.candidateSourceDate,null);assert.match(selected.candidateSourceDateReason,/INVALID/);assert.equal(selected.candidateSourceClaims.length,2);
});
