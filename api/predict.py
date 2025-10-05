import json
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict

from exo_api.exo import exo


def _read_json(handler: BaseHTTPRequestHandler) -> Dict[str, Any]:
    length = int(handler.headers.get('content-length', '0') or 0)
    body = handler.rfile.read(length) if length > 0 else b"{}"
    try:
        return json.loads(body.decode('utf-8'))
    except Exception:
        return {}


def _send_json(handler: BaseHTTPRequestHandler, status: int, data: Dict[str, Any]):
    payload = json.dumps(data).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Content-Length', str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):  # Allow CORS preflight if needed
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        data = _read_json(self)
        required = [
            'orbital_period', 'transit_depth', 'duration', 'snr',
            'star_radius', 'star_temperature', 'star_magnitude'
        ]
        missing = [k for k in required if k not in data]
        if missing:
            return _send_json(self, 400, {"error": f"Missing fields: {', '.join(missing)}"})

        try:
            label = exo(
                float(data['orbital_period']),
                float(data['transit_depth']),
                float(data['duration']),
                float(data['snr']),
                float(data['star_radius']),
                float(data['star_temperature']),
                float(data['star_magnitude']),
            )
            return _send_json(self, 200, {"label": label})
        except Exception as e:
            return _send_json(self, 500, {"error": f"Inference error: {e}"})
