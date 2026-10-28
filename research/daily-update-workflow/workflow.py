"""Pure daily route classifier. It does NOT run old date-hardcoded adapters.
Inputs are verified facts from the source/baseline verifier, never inferred from
file names. A FULL_HISTORY action requires a complete same-coordinate input.
"""
import datetime

def route(c):
 for k in ('baseline_date','target_date','previous_trade_date'):
  if type(c[k]) is not int:raise ValueError('DATE_TYPE')
  datetime.datetime.strptime(str(c[k]),'%Y%m%d')
 if c['scope']=='PAUSED_151':return 'EXCLUDED_PAUSED'
 if c['scope']=='PENDING_79':return 'EXCLUDED_PENDING'
 if c['scope']!='ACTIVE':return 'EXCLUDED_OTHER'
 if c['target_date']<c['baseline_date']:return 'REJECT_BEFORE_BASELINE'
 same=all(c[k] is True for k in ('source_same','history_same','formula_same','event_same'))
 if c['target_date']==c['baseline_date']:
  return 'VERIFY_REUSE_EXISTING' if same and not c['new_effective_event'] else 'FULL_HISTORY_ORIGINAL_FORMULA' if c['complete_qfq_ready'] is True else 'FULL_HISTORY_REQUIRED'
 if c['previous_trade_date']!=c['baseline_date']:return 'UNKNOWN_DATE_GAP'
 if c['bar_present'] is not True:return 'UNKNOWN_MISSING_BAR'
 if same and not c['new_effective_event'] and c['state_ready'] is True:return 'STATE_APPEND'
 return 'FULL_HISTORY_ORIGINAL_FORMULA' if c['complete_qfq_ready'] is True else 'FULL_HISTORY_REQUIRED'

def dispatch(rows):
 results=[]
 for symbol,contract in rows:
  try:results.append(dict(symbol=symbol,action=route(contract)))
  except (KeyError,TypeError,ValueError) as e:results.append(dict(symbol=symbol,action='UNKNOWN_INVALID_CONTRACT',reason=str(e)))
 return results

def verify_registry(registry,root):
 from pathlib import Path
 import hashlib
 base=Path(root).resolve();result=[]
 for entry in registry['entries']:
  try:
   for asset in entry['assets']:
    rel=Path(asset['path'])
    if rel.is_absolute() or '..' in rel.parts:raise ValueError('PATH_ESCAPE')
    p=base/rel
    if any(q.is_symlink() for q in (p,*p.parents)):raise ValueError('SYMLINK')
    if not p.resolve().is_relative_to(base):raise ValueError('PATH_ESCAPE')
    if hashlib.sha256(p.read_bytes()).hexdigest()!=asset['sha256']:raise ValueError('HASH_CHANGED')
   if not entry['assets']:raise ValueError('NO_BOUND_ASSETS')
   result.append(dict(symbol=entry['symbol'],status='VERIFIED'))
  except (KeyError,ValueError,OSError) as e:result.append(dict(symbol=entry['symbol'],status='ISOLATED_HASH_OR_SOURCE_FAILURE',reason=str(e)))
 return result


def main():
 import argparse,json
 from pathlib import Path
 a=argparse.ArgumentParser(description=__doc__);a.add_argument('--registry',required=True);a.add_argument('--root',required=True);a.add_argument('--target-date',required=True,type=int);args=a.parse_args();reg=json.loads(Path(args.registry).read_text());checks=verify_registry(reg,args.root);bad=[x for x in checks if x['status']!='VERIFIED'];status='PARTIAL_BASELINE_FAILURE' if bad else 'VERIFIED_BASELINE_REPLAY' if args.target_date==reg['date'] else 'AWAITING_DATE_SPECIFIC_EXECUTION'
 print(json.dumps(dict(status=status,baseline_date=reg['date'],target_date=args.target_date,verified=len(checks)-len(bad),failed=bad,network_calls=0,formula_calls=0,production_modified=False,natural_future_run='NOT_RUN'),ensure_ascii=False));return 0 if status=='VERIFIED_BASELINE_REPLAY' else 2
if __name__=='__main__':raise SystemExit(main())
