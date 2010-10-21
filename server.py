#!/usr/bin/env python3.1
from multiprocessing import Process, Queue, Lock, Pipe
from socketserver import ThreadingMixIn
from http.server import BaseHTTPRequestHandler, HTTPServer

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


def main(port=""):
    server = Server(*([("", int(port))] if port else []))
    server.serve_forever()

if __name__ == "__main__":
    import sys
    sys.exit(main(*sys.argv[1:]))
