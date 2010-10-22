#!/usr/bin/env python3.1
from multiprocessing import Process, Queue, Lock, Pipe
from socketserver import ThreadingMixIn
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    """A threading HTTP server."""

def process_queue(queue):
    while True:
        queue.get()()

class Server(ThreadingHTTPServer):
    """HTTP server providing a web interface for the math library."""
    
    def __init__(self, server_address=None,
                 RequestHandlerClass=None, bind_and_activate=True):
        """Initializes things."""
        
        super().__init__(server_address or ("", 8080),
                         RequestHandlerClass or self.RequestHandler,
                         bind_and_activate)
        
        self.task_queue = Queue()
        self.task_process = Process(target=process_queue,
                                    args=(self.task_queue,))
        self.task_process.start()
    
    class RequestHandler(BaseHTTPRequestHandler):
        """Request handler for server.Sever()."""
        
        with open("error_template.html") as f:
            error_message_format = f.read()
        
        def do_GET(self):    
            parsed_path = urllib.parse.urlparse(self.path)
            qs_args = urllib.parse.parse_qs(parsed_path.query, True)
            name, _, extension = parsed_path.path[1:].partition(".")
            
            # defaults
            name = name or "index"
            extension = extension or "html"
            
            target = name, extension
            
            if target == ("index", "html"):
                if "i" in qs_args and qs_args["i"]:
                    latex = qs_args["i"][0]
                else:
                    latex = "a + b &= c^{10}\n\int^d_bfoo&=c"
                
                latex = ("\\begin{align}" +
                         latex.replace("\n", "\\\\<br>\n") +
                         "\\end{align}").encode()
                
                self.send_response(200)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                
                with open("index.html", "rb") as f:
                    self.wfile.write(f.read()
                                     .replace(b"\"result box\">",
                                              b"\"result box\">" + latex))
            elif target == ("jquery", "js"):
                self.send_response(200)
                self.send_header("Content-type", "application/javascript")
                self.end_headers()
                with open("jquery-1.3.4.js", "rb") as f:
                    self.wfile.write(f.read())
            elif target == ("coffeescript", "js"):
                self.send_response(200)
                self.send_header("Content-type", "application/javascript")
                self.end_headers()
                with open("coffeescript-0.9.4.js", "rb") as f:
                    self.wfile.write(f.read())
            else: # insecure as shit but fine for the moment
                self.send_response(200)
                mime = "text/plain" if extension != "css" else "style/css"
                self.send_header("Content-type", mime)
                self.end_headers()
                with open("." + parsed_path.path, "rb") as f:
                    self.wfile.write(f.read())


def main(port="8000"):
    server = Server(*([("", int(port))] if port else []))
    server.serve_forever()

if __name__ == "__main__":
    import sys
    sys.exit(main(*sys.argv[1:]))
