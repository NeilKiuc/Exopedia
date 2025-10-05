# NASA model artifacts

This folder contains exploratory notebooks/scripts and an offline exporter that
produces a tiny JSON artifact consumed by the deployed API.

- Do NOT deploy heavy ML dependencies. The API loads only `api/exo_api/model_artifact.json`.
- Run `export_model.py` locally to refresh thresholds using the CSVs in this folder.

## How to update the deployed model thresholds

1. Ensure you have Python with `pandas` and `numpy` installed locally.
2. Run the exporter:
   - On Windows PowerShell:
     - python .\nasa\export_model.py
3. Commit the updated `api/exo_api/model_artifact.json` to git and push. Vercel will redeploy.

The API will then use the new thresholds immediately after deploy.
