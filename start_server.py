import http.server
import socketserver
import webbrowser
import os
from urllib.parse import urlparse

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()

def start_server():
    # Create the server
    handler = MyHttpRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\n🚀 Server started at http://localhost:{PORT}")
        print("📁 Serving files from:", DIRECTORY)
        print("\n📋 Available files:")
        for file in os.listdir(DIRECTORY):
            if file.endswith('.html'):
                print(f"   - http://localhost:{PORT}/{file}")
        print("\n⚠️  Press Ctrl+C to stop the server")
        
        # Open the main page in the default browser
        webbrowser.open(f'http://localhost:{PORT}/index.html')
        
        # Start the server
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    start_server() 