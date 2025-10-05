"""
Offline exporter: trains or derives simple thresholds from CSVs and writes a lightweight
artifact that the deployed API can load without heavy dependencies.

This does NOT run on Vercel. Run locally and commit the produced JSON if you want to
update inference thresholds.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent

# Input CSVs (as provided in nasa/)
K2_CSV = ROOT / "K2.csv"
KOI_CSV = ROOT / "KOI.csv"
TOI_CSV = ROOT / "TOI.csv"


def load_and_prepare() -> pd.DataFrame:
    K2 = pd.read_csv(K2_CSV)
    KOI = pd.read_csv(KOI_CSV)
    TOI = pd.read_csv(TOI_CSV)
    K2 = K2.copy()
    K2['transit_dur'] = np.nan

    # K2 transit depth approximation
    K2['transit_depth'] = ((K2['pl_rade'] * (0.009157)) / K2['st_rad']) ** 2

    map_disp = {
        "FP": "FALSE POSITIVE",
        "PC": "CANDIDATE",
        "KP": "CONFIRMED",
        "APC": "CANDIDATE",
        "FA": "FALSE POSITIVE",
        "CP": "CONFIRMED",
    }
    TOI["tfopwg_disp"] = TOI["tfopwg_disp"].replace(map_disp)

    def colonne(name1, name2, name3):
        merged = pd.concat([TOI[name1], KOI[name2], K2[name3]], ignore_index=True)
        return pd.DataFrame(merged)

    cY = colonne('tfopwg_disp', 'koi_disposition', 'disposition')
    cTemp = colonne('pl_eqt', 'koi_teq', 'pl_eqt')
    cTransitDepth = colonne('pl_trandep', 'koi_depth', 'transit_depth')
    cTransitDur = colonne('pl_trandurh', 'koi_duration', 'transit_dur')
    cMagn = colonne('st_tmag', 'koi_kepmag', 'sy_vmag')
    cRadius = colonne('pl_rade', 'koi_prad', 'pl_rade')
    cOrb = colonne('pl_orbper', 'koi_period', 'pl_orbper')

    final_df = pd.concat([cY, cTemp, cTransitDepth, cTransitDur, cMagn, cRadius, cOrb], axis=1)
    final_df.columns = ['disposition', 'temperature_eq', 'transit_depth', 'transit_dur', 'magnitude', 'radius', 'orbital_period']

    # Drop rows without labels
    final_df = final_df.dropna(subset=['disposition'])

    # Map labels to numeric buckets
    map2 = {
        "FALSE POSITIVE": 0,
        "CANDIDATE": 1,
        "CONFIRMED": 2,
        "REFUTED": 0,
    }
    y = final_df['disposition'].replace(map2)
    X = final_df.drop(columns='disposition')

    # Simple heuristic: choose thresholds that maximize separation for snr/depth
    # We compute candidate thresholds at percentiles by class and pick a middle point.
    # This is intentionally simple to keep runtime tiny.
    df = X.copy()
    df['y'] = y.values

    def safe_percentile(vals, q):
        vals = vals[~np.isnan(vals)]
        if len(vals) == 0:
            return np.nan
        return float(np.percentile(vals, q))

    # Compute per-class percentiles
    cls = {
        'neg': df[df['y'] == 0],  # not exo / false positive
        'cand': df[df['y'] == 1],
        'pos': df[df['y'] == 2],  # confirmed
    }

    depth_pos_p50 = safe_percentile(cls['pos']['transit_depth'].values, 50)
    snr_pos_p50 = safe_percentile((cls['pos'].get('snr') if 'snr' in cls['pos'] else np.full(1, np.nan)).values if 'snr' in cls['pos'] else np.array([np.nan]), 50)
    # If SNR not present in CSVs, derive a proxy using transit_depth and magnitude
    if np.isnan(snr_pos_p50):
        # crude proxy
        snr_pos_p50 = float(np.nanmean(cls['pos']['transit_depth'].values) / (np.nanmean(cls['pos']['magnitude'].values) or 1.0))

    # Define thresholds conservatively
    thresholds = {
        'exo_snr': max(5.0, round(snr_pos_p50, 2)),
        'exo_depth': max(200.0, round(depth_pos_p50, 2)) if not np.isnan(depth_pos_p50) else 500.0,
        'candidate_snr': max(3.0, round(snr_pos_p50 * 0.5, 2)),
        'candidate_depth': max(100.0, round((depth_pos_p50 or 200.0) * 0.5, 2)),
    }

    artifact = {
        'model': 'rule-thresholds',
        'thresholds': thresholds,
        'source': 'nasa/export_model.py',
        'version': '0.2.0'
    }
    return final_df, artifact


def main() -> None:
    _, artifact = load_and_prepare()
    # Write directly into the deployed API folder so it’s bundled
    api_artifact = Path(__file__).resolve().parents[1] / 'api' / 'exo_api' / 'model_artifact.json'
    api_artifact.parent.mkdir(parents=True, exist_ok=True)
    with open(api_artifact, 'w', encoding='utf-8') as f:
        json.dump(artifact, f, indent=2)
    print(f"Wrote artifact to {api_artifact}")


if __name__ == '__main__':
    main()
