import copy
import hashlib
import tempfile
import unittest
from pathlib import Path
from validate_refresh import validate


class Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "fixture.txt").write_text("synthetic test only")
        self.m = dict(data_date="2026-10-28", source_date="2026-10-28", calendar_status="TRADING_DAY",
            scope_label="synthetic scope", scope_count=201, valid_count=200, unknown_count=1, rank_count=200,
            rank_review="PASS", report_policy="EXPLANATION_ONLY_NO_SCORE_NO_VETO",
            inputs=[dict(path="fixture.txt", sha256=hashlib.sha256((self.root/"fixture.txt").read_bytes()).hexdigest())],
            layers={})
    def tearDown(self): self.temp.cleanup()
    def run_m(self, m=None): return validate(m or self.m, "2026-10-28", self.root)
    def test_ready_partial_research(self):
        r=self.run_m(); self.assertEqual(r["status"], "READY_FOR_RANK_PUBLICATION_WITH_UNKNOWN"); self.assertFalse(r["research_complete"])
    def test_future_date(self): self.assertEqual(validate(self.m,"2026-10-29",self.root)["status"],"BLOCKED")
    def test_bool_count(self): self.m["valid_count"]=True; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_count_mismatch(self): self.m["scope_count"]=202; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_shortfall(self): self.m.update(scope_count=10,valid_count=9,rank_count=9); self.assertTrue(self.run_m()["rank_shortfall"])
    def test_rank_fail(self): self.m["rank_review"]="FAIL"; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_hash_mismatch(self): (self.root/"fixture.txt").write_text("changed"); self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_duplicate_input(self): self.m["inputs"]*=2; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_absolute_path(self): self.m["inputs"][0]["path"]=str(self.root/"fixture.txt"); self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_escape(self): self.m["inputs"][0]["path"]="../fixture.txt"; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_symlink(self): (self.root/"linked.txt").symlink_to(self.root/"fixture.txt"); self.m["inputs"][0]["path"]="linked.txt"; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_empty_input(self): self.m["inputs"]=[]; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_ready_needs_evidence(self): self.m["layers"]={"industry":{"status":"READY"}}; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_reports_no_score(self): self.m["report_policy"]="ADD_SCORE"; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_unknown_calendar(self): self.m["calendar_status"]="UNKNOWN"; self.assertEqual(self.run_m()["status"],"BLOCKED")
    def test_closed(self): self.m["calendar_status"]="MARKET_CLOSED"; self.assertEqual(self.run_m()["status"],"MARKET_CLOSED_NO_UPDATE")


if __name__ == "__main__": unittest.main()
