"""Exercise HTTP handling without opening network sockets."""
import io
import json
import sqlite3
import unittest
from unittest.mock import patch

import backend


class MemorySocket:
    def __init__(self, request):
        self.input = io.BytesIO(request)
        self.output = io.BytesIO()

    def makefile(self, *args, **kwargs):
        return self.input

    def sendall(self, data):
        self.output.write(data)


class BackendTests(unittest.TestCase):
    def setUp(self):
        self.database = sqlite3.connect(":memory:")
        class Connection:
            def __enter__(_):
                return self.database
            def __exit__(_, *args):
                self.database.commit()
        self.mock = patch.object(backend.sqlite3, "connect", return_value=Connection())
        self.mock.start()
        backend.initialize_database()

    def tearDown(self):
        self.mock.stop()
        self.database.close()

    def request(self, path, method="GET", payload=None):
        body = b"" if payload is None else json.dumps(payload).encode()
        raw = f"{method} {path} HTTP/1.0\r\nContent-Length: {len(body)}\r\n\r\n".encode() + body
        sock = MemorySocket(raw)
        backend.CommonGroundHandler(sock, ("127.0.0.1", 1), None)
        headers, body = sock.output.getvalue().split(b"\r\n\r\n", 1)
        return int(headers.split()[1]), body

    def test_private_files_blocked(self):
        for method in ("GET", "HEAD"):
            for path in ("/backend.py", "/commonground.sqlite3", "/.git/HEAD", "/firebase.json", "/%62ackend.py", "/../backend.py", "/"):
                with self.subTest(method=method, path=path):
                    self.assertEqual(self.request(path, method)[0], 200 if path == "/" else 404)

    def test_services(self):
        status, body = self.request("/api/services")
        self.assertEqual(status, 200)
        self.assertEqual(len(json.loads(body)["services"]), len(backend.SERVICES))

    def test_suggestions(self):
        self.assertEqual(self.request("/api/suggestions", "POST", {"kind": "Something else", "note": "A useful note"})[0], 201)
        self.assertEqual(self.database.execute("SELECT note FROM suggestions").fetchone()[0], "A useful note")
        for fields in ({"kind": "bad", "note": "test"}, {"kind": "Something else", "note": " "}, {"kind": "Something else", "note": "test", "email": "bad"}, {"kind": "Something else", "note": "x" * 2001}):
            self.assertEqual(self.request("/api/suggestions", "POST", fields)[0], 400)


if __name__ == "__main__":
    unittest.main()
