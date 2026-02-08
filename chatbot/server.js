// Listerdale Leadership Chatbot - Standalone Server
// Express + OpenAI + SQLite (better-sqlite3)

import "dotenv/config";
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { SYSTEM_PROMPT, LEADERSHIP_MODULES } from "./knowledge-base.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Configuration ───────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_HISTORY = 20; // Max messages to send as context

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY is required. Copy .env.example to .env and add your key.");
  process.exit(1);
}

// ─── OpenAI Client ───────────────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── SQLite Database ─────────────────────────────────────────────────────────

const dbPath = join(__dirname, "chat.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    message_count INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
  );

  CREATE INDEX IF NOT EXISTS idx_messages_session ON chat_messages(session_id);
`);

// Prepared statements for performance
const stmts = {
  createSession: db.prepare("INSERT INTO chat_sessions (id) VALUES (?)"),
  getSession: db.prepare("SELECT * FROM chat_sessions WHERE id = ?"),
  updateSession: db.prepare("UPDATE chat_sessions SET updated_at = datetime('now'), message_count = message_count + 1 WHERE id = ?"),
  addMessage: db.prepare("INSERT INTO chat_messages (session_id, role, content) VALUES (?, ?, ?)"),
  getMessages: db.prepare("SELECT role, content FROM chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT ?"),
};

// ─── Express App ─────────────────────────────────────────────────────────────

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS || "*";
if (allowedOrigins === "*") {
  app.use(cors());
} else {
  const origins = allowedOrigins.split(",").map((o) => o.trim());
  app.use(cors({ origin: origins }));
}

app.use(express.json({ limit: "1mb" }));

// Serve the embed.js widget as a static file
app.use("/embed.js", express.static(join(__dirname, "embed.js")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    modules: LEADERSHIP_MODULES.length,
    model: OPENAI_MODEL,
  });
});

// ─── Chat API ────────────────────────────────────────────────────────────────

// POST /api/chat
// Body: { message: string, sessionId?: string }
// Returns: { reply: string, sessionId: string }
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId: incomingSessionId } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: "Message too long (max 2000 characters)" });
    }

    // Get or create session
    let sessionId = incomingSessionId;
    if (sessionId) {
      const session = stmts.getSession.get(sessionId);
      if (!session) sessionId = null; // Invalid session, create new
    }
    if (!sessionId) {
      sessionId = randomUUID();
      stmts.createSession.run(sessionId);
    }

    // Save user message
    stmts.addMessage.run(sessionId, "user", message.trim());
    stmts.updateSession.run(sessionId);

    // Build conversation history for context
    const history = stmts.getMessages.all(sessionId, MAX_HISTORY);

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({ role: m.role, content: m.content })),
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    // Save assistant reply
    stmts.addMessage.run(sessionId, "assistant", reply);
    stmts.updateSession.run(sessionId);

    res.json({ reply, sessionId });
  } catch (error) {
    console.error("Chat error:", error.message);

    if (error.status === 401) {
      return res.status(500).json({ error: "Invalid OpenAI API key. Check your .env file." });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment and try again." });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
┌─────────────────────────────────────────────────────┐
│  Listerdale Leadership Chatbot                      │
│                                                     │
│  Server:  http://localhost:${String(PORT).padEnd(5)}                   │
│  Model:   ${OPENAI_MODEL.padEnd(40)} │
│  Modules: ${String(LEADERSHIP_MODULES.length).padEnd(40)} │
│  DB:      ${dbPath.length > 40 ? "..." + dbPath.slice(-37) : dbPath.padEnd(40)} │
│                                                     │
│  Embed widget: http://localhost:${String(PORT).padEnd(5)}/embed.js      │
└─────────────────────────────────────────────────────┘
  `);
});
