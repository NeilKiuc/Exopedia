import json
from http.server import BaseHTTPRequestHandler


def _send_json(handler: BaseHTTPRequestHandler, status: int, data):
    payload = json.dumps(data).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(payload)))
    handler.end_headers()
    handler.wfile.write(payload)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        return _send_json(self, 200, {"status": "ok"})
