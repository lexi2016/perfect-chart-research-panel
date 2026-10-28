import unittest
import workflow
class Routes(unittest.TestCase):
 def base(self):return dict(scope='ACTIVE',baseline_date=20261028,target_date=20261029,previous_trade_date=20261028,bar_present=True,source_same=True,history_same=True,formula_same=True,event_same=True,new_effective_event=False,state_ready=True,complete_qfq_ready=False)
 def case(self,expected,**changes):
  d=self.base();d.update(changes);self.assertEqual(workflow.route(d),expected)
 def test_same_day_reuses(self):self.case('VERIFY_REUSE_EXISTING',target_date=20261028)
 def test_event_unchanged_state_increment(self):self.case('STATE_APPEND',event_same=True)
 def test_new_effective_event_invalidates(self):self.case('FULL_HISTORY_REQUIRED',new_effective_event=True)
 def test_changed_history_full_if_input_available(self):self.case('FULL_HISTORY_ORIGINAL_FORMULA',history_same=False,complete_qfq_ready=True)
 def test_bse_no_state_full(self):self.case('FULL_HISTORY_ORIGINAL_FORMULA',state_ready=False,complete_qfq_ready=True)
 def test_paused151_is_not_resumed(self):self.case('EXCLUDED_PAUSED',scope='PAUSED_151')
 def test_pending79_not_resumed(self):self.case('EXCLUDED_PENDING',scope='PENDING_79')
 def test_missing_bar_not_filled(self):self.case('UNKNOWN_MISSING_BAR',bar_present=False)
 def test_gap_isolated(self):self.case('UNKNOWN_DATE_GAP',previous_trade_date=20261027)
 def test_source_change_not_increment(self):self.case('FULL_HISTORY_REQUIRED',source_same=False)
 def test_stale_future_not_relabelled(self):self.case('REJECT_BEFORE_BASELINE',target_date=20261027)
 def test_single_failure_does_not_abort(self):
  rows=[('bad',dict(self.base(),target_date='invalid')),('ok',self.base())];r=workflow.dispatch(rows);self.assertEqual(len(r),2);self.assertEqual(r[0]['action'],'UNKNOWN_INVALID_CONTRACT');self.assertEqual(r[1]['action'],'STATE_APPEND')
if __name__=='__main__':unittest.main()

class RegistryVerification(unittest.TestCase):
 def test_valid_asset_verified(self):
  import tempfile,pathlib,hashlib
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'a';p.write_bytes(b'good');reg={'entries':[{'symbol':'X','assets':[{'path':'a','sha256':hashlib.sha256(b'good').hexdigest()}]}]}
   result=workflow.verify_registry(reg,d);self.assertEqual(len(result),1);self.assertEqual(result[0]['status'],'VERIFIED')
 def test_bad_one_does_not_block_next(self):
  import tempfile,pathlib,hashlib
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d)/'a';p.write_bytes(b'good');asset={'path':'a','sha256':hashlib.sha256(b'good').hexdigest()};reg={'entries':[{'symbol':'X','assets':[dict(asset,sha256='0'*64)]},{'symbol':'Y','assets':[asset]}]}
   rows=workflow.verify_registry(reg,d);self.assertEqual(len(rows),2);self.assertEqual(rows[0]['status'],'ISOLATED_HASH_OR_SOURCE_FAILURE');self.assertEqual(rows[1]['status'],'VERIFIED')
 def test_path_escape_rejected(self):
  import tempfile
  with tempfile.TemporaryDirectory() as d:
   reg={'entries':[{'symbol':'X','assets':[{'path':'../outside','sha256':'0'*64}]}]};result=workflow.verify_registry(reg,d);self.assertEqual(len(result),1);self.assertEqual(result[0]['status'],'ISOLATED_HASH_OR_SOURCE_FAILURE')

class CommandLine(unittest.TestCase):
 def invoke(self,target):
  import tempfile,pathlib,hashlib,json,subprocess,sys
  with tempfile.TemporaryDirectory() as d:
   p=pathlib.Path(d);(p/'a').write_text('good');reg={'date':20261028,'entries':[{'symbol':'X','assets':[{'path':'a','sha256':hashlib.sha256(b'good').hexdigest()}]}]};(p/'reg.json').write_text(json.dumps(reg));r=subprocess.run([sys.executable,workflow.__file__,'--registry',str(p/'reg.json'),'--root',d,'--target-date',str(target)],capture_output=True,text=True);return r
 def test_same_date_cli(self):
  import json
  r=self.invoke(20261028);self.assertEqual(r.returncode,0);self.assertTrue(r.stdout.startswith('{'));self.assertEqual(json.loads(r.stdout)['status'],'VERIFIED_BASELINE_REPLAY')
 def test_future_cli_cannot_fake_run(self):
  r=self.invoke(20261029);self.assertEqual(r.returncode,2);self.assertIn('AWAITING_DATE_SPECIFIC_EXECUTION',r.stdout)
