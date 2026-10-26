import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { suggestions } from "../../db/schema.js";

const MAX_REQUEST_SIZE = 16384;
const ALLOWED_SUGGESTION_KINDS = new Set([
  "Suggest a new service",
  "Correct a listing",
  "Something else",
]);

const error = (status: number, message: string) =>
  Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });

export default async (req: Request) => {
  const raw = await req.text();
  if (!raw || new TextEncoder().encode(raw).length > MAX_REQUEST_SIZE) {
    return error(413, "Request body is missing or too large.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return error(400, "Request body must be valid JSON.");
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return error(400, "Request body must be a JSON object.");
  }

  const { kind, service = "", note, email = "" } = payload as Record<string, unknown>;
  if (
    typeof kind !== "string" ||
    !ALLOWED_SUGGESTION_KINDS.has(kind) ||
    typeof service !== "string" ||
    typeof note !== "string" ||
    typeof email !== "string"
  ) {
    return error(400, "Please provide a valid suggestion.");
  }

  const values = { kind, service: service.trim(), note: note.trim(), email: email.trim() };
  if (!values.note || values.note.length > 2000 || values.service.length > 160 || values.email.length > 254) {
    return error(400, "Please check the length of your suggestion fields.");
  }
  if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
    return error(400, "Please provide a valid email address.");
  }

  try {
    const [saved] = await db.insert(suggestions).values(values).returning({ id: suggestions.id });
    return Response.json({ id: saved.id, message: "Suggestion received." }, { status: 201 });
  } catch (err) {
    console.error("Could not save suggestion to the database", err);
    return error(500, "Could not save your suggestion. Please try again.");
  }
};

export const config: Config = {
  path: "/api/suggestions",
  method: "POST",
};
