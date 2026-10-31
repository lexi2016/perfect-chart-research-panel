import{createHash}from'node:crypto';import{createCompletionConsumer}from'./completion-consumer.mjs';
const need=(x,c)=>{if(!x)throw Error(c)},hash=b=>createHash('sha256').update(b).digest('hex');
export function createSuccessHook({root,read,registrations}){
 const consumer=createCompletionConsumer({root,read,registrations});
 return{current:consumer.current,async afterProducerSuccess({result,eventReference}={}){
  if(!result||!eventReference)return{status:'WAITING_PRODUCER_COMPLETION',production_allowed:false,natural_schedule_verified:false,latest:await consumer.current()};
  try{
   need(['READY','PARTIAL_WITH_ROWS'].includes(result.status),'HOOK_PRODUCER_NOT_COMPLETED');
   need(typeof eventReference.path==='string'&&/^[a-f0-9]{64}$/.test(eventReference.sha256??''),'HOOK_EVENT_REF');
   const bytes=await read(eventReference);need(bytes&&hash(bytes)===eventReference.sha256,'HOOK_EVENT_HASH');const event=JSON.parse(bytes);
   need(event.schema_version==='v4.a_share.daily_completion.v1','HOOK_EVENT_SCHEMA');
   for(const k of['status','data_date','source_generation','processed_count','unknown_count'])need(result[k]===event[k],'HOOK_RESULT_BINDING');
   for(const k of['manifest','artifact'])need(result[k]?.path===event[k]?.path&&result[k]?.sha256===event[k]?.sha256,'HOOK_RESULT_BINDING');
   // Never synthesize a producer event. Consumer independently rechecks all event,
   // manifest/product and reviewed rank bytes before its atomic latest commit.
   return await consumer.consume({kind:'live-completion-event',reference:eventReference});
  }catch(e){return{status:'FAILED_KEEP_LAST',error:e.message,latest:await consumer.current(),production_allowed:false,natural_schedule_verified:false};}
 },async replayCompletedHistory(request){need(request?.kind==='historical-index-replay','HOOK_HISTORY_KIND');return{...await consumer.consume(request),generator_executed:false};}};
}
