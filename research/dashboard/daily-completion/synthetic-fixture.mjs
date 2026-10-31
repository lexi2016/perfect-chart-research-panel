import{createHash}from'node:crypto';const hash=b=>createHash('sha256').update(b).digest('hex');
export function fixture(date='20261029'){
 const files=new Map;const ref=(id,x)=>{const b=Buffer.from(JSON.stringify(x));const r={path:id,sha256:hash(b)};files.set(id,b);return r;};
 const product={schema_version:'v4.a_share.daily_product.v1',data_date:date,status:'PARTIAL_WITH_ROWS',source_generation:'generation-A',source_identity:{input_sha256:'a'.repeat(64)},processed_count:2,source_universe_count:2,sample_only:false,processed_universe:['000001.SZ','000002.SZ'],row_refs:{'000001.SZ':{sha256:'1'.repeat(64)},'000002.SZ':{sha256:'2'.repeat(64)}},rows:[{symbol:'000001.SZ'}],unique_count:1,unknown_count:1,RESEARCH_ONLY:true,production_allowed:false};
 const artifact=ref('product',product);const manifest=ref('manifest',{schema_version:'v4.a_share.daily_product_manifest.v1',data_date:date,source_generation:product.source_generation,input_sha256:product.source_identity.input_sha256,artifact,processed_count:2,source_universe_count:2,sample_only:false,status:product.status});
 const index=ref('index',{schema_version:'v4.a_share.daily_product_index.v1',latest_date:date,dates:{[date]:manifest},latest:manifest});
 const raw=ref('raw',{date});const rank=ref('rank',{source_package_sha256:raw.sha256,source_date:date,scope_count:3,rankable_count:2,rank_unknown_count:1,top_count:2,rows:[{symbol:'000003.SZ',rank:1},{symbol:'000002.SZ',rank:2}]});const review=ref('review',{status:'PASS',rank_sha256:rank.sha256,source_date:date});
 const rankRegistration={date,rank,review,raw,review_status:'PASS',expected_scope:3,expected_top:2,rank_family:'independent-raw-reference',reader_registration:{date,route:'local-test',capability:'REGISTERED_SOURCE_ONLY'}};
 return {files,product,artifact,manifest,index,rankRegistration,read:async r=>files.get(r.path),request:{kind:'historical-index-replay',reference:index}};
}
