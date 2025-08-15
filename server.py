#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for Privy SDK
"""
import http.server
import socketserver
import os

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    PORT = 5003
    os.chdir('/home/runner/workspace/hyperflow-presale-live')
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CORSHandler) as httpd:
        print(f"HyperFlow Presale with CORS serving at http://0.0.0.0:{PORT}")
        httpd.serve_forever()