import json
import re
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


APP_DIR = Path(__file__).resolve().parent
DATABASE_PATH = APP_DIR / "commonground.sqlite3"
HOST = "127.0.0.1"
PORT = 8000
MAX_REQUEST_SIZE = 16384
PUBLIC_FILES = {"/", "/index.html", "/app.js", "/styles.css"}
ALLOWED_SUGGESTION_KINDS = {
    "Suggest a new service",
    "Correct a listing",
    "Something else",
}

SERVICES = [
    ("Neighborhood Food Shelf", "Food", "🥕", "Groceries and pantry staples for individuals and families.", "214 Maple Street, Springfield", "Mon–Fri, 9 am–4 pm", "(555) 010-0142", "Example listing", "food pantry groceries neighborhood maple"),
    ("Open Table Community Kitchen", "Food", "🍲", "A warm meal and a welcoming place at the table.", "8 Oak Avenue, Springfield", "Weekdays, 12–2 pm", "(555) 010-0198", "Example listing", "meal kitchen lunch food oak"),
    ("Fresh Start Produce Market", "Food", "🍎", "Affordable fresh produce and nutrition resources.", "Market Square, Springfield", "Sat, 8 am–1 pm", "(555) 010-0130", "Example listing", "produce market fruit vegetables saturday"),
    ("Maple Street Health Clinic", "Health", "✚", "Low-cost primary care and help finding a provider.", "42 Maple Street, Springfield", "Mon–Thu, 8 am–5 pm", "(555) 010-0111", "Example listing", "health clinic doctor medical care maple"),
    ("Community Care Counseling", "Health", "♡", "Confidential counseling and mental health support.", "120 River Road, Springfield", "By appointment", "(555) 010-0155", "Example listing", "mental health therapy counseling care"),
    ("Springfield Community Gym", "Fitness", "💪", "Affordable gym access and beginner-friendly group workouts.", "25 Park Avenue, Springfield", "Mon–Sat, 6 am–9 pm", "(555) 010-0184", "Example listing", "gym fitness workout exercise strength classes park"),
    ("Open Door Fitness Center", "Fitness", "🏋️", "Low-cost exercise classes and a welcoming place to get active.", "90 Elm Street, Springfield", "Mon–Fri, 7 am–8 pm", "(555) 010-0193", "Example listing", "gym fitness exercise workout yoga classes elm"),
    ("Haven Family Resource Center", "Housing", "⌂", "Housing guidance and referrals for local families.", "6 Cedar Lane, Springfield", "Mon–Fri, 9 am–4 pm", "(555) 010-0177", "Example listing", "housing shelter family haven cedar"),
    ("Safe Steps Night Shelter", "Housing", "☾", "Emergency shelter referrals and overnight support.", "Downtown Springfield", "Call for availability", "(555) 010-0124", "Example listing", "shelter emergency housing downtown safe"),
    ("Springfield Welcome Hub", "Community", "☼", "Help with forms, job searches, and community connections.", "18 Main Street, Springfield", "Tue–Sat, 10 am–6 pm", "(555) 010-0166", "Example listing", "community jobs forms welcome main"),
]


def initialize_database():
    with sqlite3.connect(DATABASE_PATH) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                category TEXT NOT NULL,
                icon TEXT NOT NULL,
                description TEXT NOT NULL,
                address TEXT NOT NULL,
                hours TEXT NOT NULL,
                phone TEXT NOT NULL,
                verified TEXT NOT NULL,
                search TEXT NOT NULL
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS suggestions (
                id INTEGER PRIMARY KEY,
                kind TEXT NOT NULL,
                service TEXT NOT NULL DEFAULT '',
                note TEXT NOT NULL,
                email TEXT NOT NULL DEFAULT '',
                submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.executemany(
            """
            INSERT OR IGNORE INTO services
                (name, category, icon, description, address, hours, phone, verified, search)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            SERVICES,
        )


class CommonGroundHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(APP_DIR), **kwargs)

    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def send_head(self):
        # GET and inherited HEAD both use this allowlist.
        path = unquote(urlparse(self.path).path)
        if path not in PUBLIC_FILES:
            self.send_error(404, "File not found")
            return None
        return super().send_head()

    def do_GET(self):
        if urlparse(self.path).path == "/api/services":
            try:
                with sqlite3.connect(DATABASE_PATH) as connection:
                    connection.row_factory = sqlite3.Row
                    rows = connection.execute(
                        """
                        SELECT name, category, icon, description, address, hours,
                               phone, verified, search
                        FROM services ORDER BY id
                        """
                    ).fetchall()
                self._send_json(200, {"services": [dict(row) for row in rows]})
            except sqlite3.Error:
                self.log_error("Could not read services from the database")
                self._send_json(500, {"error": "Could not load services."})
            return

        if urlparse(self.path).path.startswith("/api/"):
            self._send_json(404, {"error": "API endpoint not found."})
            return

        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/suggestions":
            self._send_json(404, {"error": "API endpoint not found."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "Invalid request size."})
            return
        if content_length <= 0 or content_length > MAX_REQUEST_SIZE:
            self._send_json(413, {"error": "Request body is missing or too large."})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "Request body must be valid JSON."})
            return
        if not isinstance(payload, dict):
            self._send_json(400, {"error": "Request body must be a JSON object."})
            return

        kind = payload.get("kind")
        service = payload.get("service", "")
        note = payload.get("note")
        email = payload.get("email", "")
        if (
            not isinstance(kind, str)
            or kind not in ALLOWED_SUGGESTION_KINDS
            or not isinstance(service, str)
            or not isinstance(note, str)
            or not isinstance(email, str)
        ):
            self._send_json(400, {"error": "Please provide a valid suggestion."})
            return

        service = service.strip()
        note = note.strip()
        email = email.strip()
        if not note or len(note) > 2000 or len(service) > 160 or len(email) > 254:
            self._send_json(400, {"error": "Please check the length of your suggestion fields."})
            return
        if email and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
            self._send_json(400, {"error": "Please provide a valid email address."})
            return

        try:
            with sqlite3.connect(DATABASE_PATH) as connection:
                cursor = connection.execute(
                    "INSERT INTO suggestions (kind, service, note, email) VALUES (?, ?, ?, ?)",
                    (kind, service, note, email),
                )
                suggestion_id = cursor.lastrowid
        except sqlite3.Error:
            self.log_error("Could not save suggestion to the database")
            self._send_json(500, {"error": "Could not save your suggestion. Please try again."})
            return

        self._send_json(201, {"id": suggestion_id, "message": "Suggestion received."})


if __name__ == "__main__":
    initialize_database()
    server = ThreadingHTTPServer((HOST, PORT), CommonGroundHandler)
    print(f"CommonGround is running at http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down CommonGround.")
    finally:
        server.server_close()
