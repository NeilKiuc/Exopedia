import json
import time
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
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Content-Length', str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS, GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        return _send_json(self, 200, {"status": "ok"})

    def do_POST(self):
        t0 = time.time()
        payload = _read_json(self)

        data = payload.get('data', [])
        predictions = []
        try:
            for item in data:
                label = exo(
                    float(item['orbital_period']),
                    float(item['transit_depth']),
                    float(item['transit_duration']),
                    float(item['signal_to_noise_ratio']),
                    float(item['stellar_radius']),
                    float(item['stellar_temperature']),
                    float(item['stellar_magnitude']),
                )
                predictions.append({
                    'name': item.get('name'),
                    'label': label,
                })

            elapsed = (time.time() - t0) * 1000.0
            return _send_json(self, 200, {
                'success': True,
                'predictions': predictions,
                'insights': [],
                'recommendations': [],
                'anomalies': [],
                'model_version': payload.get('model_name') or 'api-1.0.0',
                'timestamp': time.time(),
                'processing_time': elapsed,
            })
        except Exception as e:
            return _send_json(self, 500, {'error': f'Batch inference error: {e}'})
