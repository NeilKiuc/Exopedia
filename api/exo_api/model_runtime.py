import json
import os
from typing import Any


class _RuleModel:
    def __init__(self, rules: dict[str, Any] | None = None):
        self.rules = rules or {}

    def predict(self, **features: float) -> str:
        # If artifact includes thresholds, apply them
        thr = self.rules.get("thresholds", {}) if isinstance(self.rules, dict) else {}
        snr = float(features.get("snr", 0))
        depth = float(features.get("transit_depth", 0))

        exo_snr = float(thr.get("exo_snr", 20))
        exo_depth = float(thr.get("exo_depth", 500))
        cand_snr = float(thr.get("candidate_snr", 10))
        cand_depth = float(thr.get("candidate_depth", 200))

        if snr >= exo_snr and depth >= exo_depth:
            return "exo"
        if snr >= cand_snr and depth >= cand_depth:
            return "candidate"
        return "not exo"


def _load_artifact() -> dict | None:
    # Try path relative to project root
    candidates = [
        os.path.join(os.getcwd(), "api", "exo_api", "model_artifact.json"),
        os.path.join(os.getcwd(), "api", "model_artifact.json"),
        os.path.join(os.getcwd(), "model_artifact.json"),
    ]
    for p in candidates:
        try:
            if os.path.isfile(p):
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            continue
    return None


def get_model() -> _RuleModel:
    data = _load_artifact()
    return _RuleModel(data)
