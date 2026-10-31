const hasD29Component=r=>(r.review_routes??[]).some(x=>!['其他日线形态待核','数据待补_不借D30'].includes(x));
export function groupRows(rows,group){return rows.filter(r=>group==='all'||group==='unknown'&&r.source_availability!=='AVAILABLE_REQUIRED_FIELDS'||group==='risk'&&r.prior_review_risk_layer?.explicit_hard_veto||group==='component'&&hasD29Component(r)||group.startsWith('machine:')&&(r.machine?.numeric_groups??[]).includes(group.slice(8))).slice().sort((a,b)=>a.rank-b.rank);}
export function nextSymbol(rows,current,direction){const i=rows.findIndex(r=>r.symbol===current);return i<0?null:rows[i+direction]?.symbol??null;}
export function resumeSymbol(rows,saved){return rows.some(r=>r.symbol===saved?.symbol)?saved.symbol:rows[0]?.symbol??null;}
export function formalCompletion(reviews){const latest=new Map;for(const r of reviews){if(/测试|test/i.test(r.notes??''))continue;latest.set(r.symbol,r);}return new Set([...latest].filter(([,r])=>r.disposition!=='UNKNOWN').map(([s])=>s));}
export function sameSaveOrigin(a,b){return !!a?.symbol&&a.asof===b?.asof&&a.symbol===b?.symbol&&a.group===b?.group&&a.source===b?.source;}
