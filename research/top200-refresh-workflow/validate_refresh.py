"""Read-only validation of a frozen Top200 refresh handoff; no network or publication."""
import argparse
import datetime
import hashlib
import json
import re
from pathlib import Path


def validate(manifest, run_date, root):
    errors = []
    if not isinstance(manifest, dict):
        return {"status": "BLOCKED", "errors": ["manifest is not object"]}
    try:
        datetime.date.fromisoformat(run_date)
    except (TypeError, ValueError):
        return {"status": "BLOCKED", "errors": ["invalid run_date"]}
    if manifest.get("calendar_status") == "MARKET_CLOSED":
        if manifest.get("data_date") != run_date:
            return {"status": "BLOCKED", "errors": ["closed date mismatch"]}
        return {"status": "MARKET_CLOSED_NO_UPDATE", "errors": []}
    if manifest.get("calendar_status") != "TRADING_DAY":
        errors.append("calendar missing or out of range")
    for key in ("data_date", "source_date"):
        if manifest.get(key) != run_date:
            errors.append(key + " mismatch")
    if not isinstance(manifest.get("scope_label"), str) or not manifest["scope_label"].strip():
        errors.append("scope label missing")
    counts = [manifest.get(k) for k in ("scope_count", "valid_count", "unknown_count", "rank_count")]
    if any(type(x) is not int or x < 0 for x in counts):
        errors.append("invalid coverage counts")
    else:
        scope, valid, unknown, ranks = counts
        if valid + unknown != scope or ranks != min(200, valid):
            errors.append("coverage/rank count mismatch")
    if manifest.get("rank_review") != "PASS":
        errors.append("rank independent review not PASS")
    if manifest.get("report_policy") != "EXPLANATION_ONLY_NO_SCORE_NO_VETO":
        errors.append("report policy mismatch")
    inputs = manifest.get("inputs")
    checked = 0
    seen = set()
    root = Path(root).resolve()
    if not isinstance(inputs, list) or not inputs:
        errors.append("no frozen inputs")
    else:
        for item in inputs:
            try:
                if not isinstance(item, dict):
                    raise ValueError("input is not object")
                relative = item.get("path")
                digest = item.get("sha256")
                if not isinstance(relative, str) or not relative or Path(relative).is_absolute() or ".." in Path(relative).parts:
                    raise ValueError("invalid input path")
                if relative in seen:
                    raise ValueError("duplicate input path")
                seen.add(relative)
                if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
                    raise ValueError("invalid hash")
                path = root / relative
                for part in (path, *path.parents):
                    if part == root:
                        break
                    if part.is_symlink():
                        raise ValueError("symlink input")
                if not path.resolve().is_relative_to(root) or not path.is_file():
                    raise ValueError("missing or escaped input")
                if hashlib.sha256(path.read_bytes()).hexdigest() != digest:
                    raise ValueError("input hash mismatch")
                checked += 1
            except (ValueError, OSError) as exc:
                errors.append(str(exc))
    layers = manifest.get("layers", {})
    states = {}
    if not isinstance(layers, dict):
        layers = {}
    for name in ("industry", "chart", "research_reports"):
        layer = layers.get(name, {})
        if not isinstance(layer, dict):
            layer = {}
        state = layer.get("status", "UNKNOWN")
        states[name] = state
        if state not in {"READY", "PARTIAL", "PENDING", "UNKNOWN"}:
            errors.append("invalid layer status: " + name)
        if state == "READY" and (not layer.get("asof") or not layer.get("evidence_refs")):
            errors.append("READY layer missing evidence: " + name)
    status = "BLOCKED" if errors else ("READY_FOR_RANK_PUBLICATION_WITH_UNKNOWN" if manifest.get("unknown_count") else "READY_FOR_RANK_PUBLICATION")
    return {"status": status, "errors": errors, "inputs_checked": checked, "layers": states,
            "research_complete": not errors and all(v == "READY" for v in states.values()),
            "rank_shortfall": type(manifest.get("rank_count")) is int and manifest["rank_count"] < 200,
            "published": False, "network_calls": 0, "formula_calls": 0}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--date", required=True)
    args = parser.parse_args()
    path = Path(args.manifest)
    result = validate(json.loads(path.read_text()), args.date, path.parent)
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(2 if result["status"] == "BLOCKED" else 0)
