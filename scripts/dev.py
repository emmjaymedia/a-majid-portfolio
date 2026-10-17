from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
os.chdir(Path(__file__).resolve().parents[1]/'dist')
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  path=self.path.split('?')[0]
  if path.startswith('/projects/'): self.path='/case-study.html'
  elif path=='/admin': self.path='/admin.html'
  return super().do_GET()
ThreadingHTTPServer(('0.0.0.0',8080),Handler).serve_forever()
