import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

import fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define DB path
const DB_PATH = process.env.URLSHORTENER_DB || path.join(__dirname, "data", "urls.db");

// ✅ Ensure "data" directory exists before connecting to SQLite
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log("📁 Created data directory:", dbDir);
}

//const DB_PATH = process.env.URLSHORTENER_DB || path.join(__dirname, "data", "urls.db");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const PORT = process.env.PORT || 8000;

// Create Express app
const app = express();
app.use(express.json());

// --- Helper: Base62 encode/decode ---
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = ALPHABET.length;

function encodeBase62(num) {
  if (num === 0) return ALPHABET[0];
  let s = "";
  while (num > 0) {
    s = ALPHABET[num % BASE] + s;
    num = Math.floor(num / BASE);
  }
  return s;
}

function decodeBase62(str) {
  return [...str].reduce((acc, c) => acc * BASE + ALPHABET.indexOf(c), 0);
}

// --- Initialize SQLite ---
let db;
async function initDb() {
  db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS url_map (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      long_url TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}
await initDb();

// --- POST /shorten ---
app.post("/shorten", async (req, res) => {
  const { url } = req.body || {};
  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: "Invalid URL. Must start with http:// or https://" });
  }

  try {
    // Check if already exists
    const existing = await db.get("SELECT id FROM url_map WHERE long_url = ?", [url]);
    let id;
    if (existing) {
      id = existing.id;
    } else {
      const result = await db.run("INSERT INTO url_map (long_url) VALUES (?)", [url]);
      id = result.lastID;
    }

    const code = encodeBase62(id);
    const shortUrl = `${BASE_URL.replace(/\/$/, "")}/${code}`;
    res.status(201).json({ short_code: code, short_url: shortUrl, long_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// --- Health check ---
app.get("/health", (_, res) => res.json({ status: "ok" }));

// --- GET /:code ---
app.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const id = decodeBase62(code);
    const row = await db.get("SELECT long_url FROM url_map WHERE id = ?", [id]);
    if (!row) return res.status(404).send("Not found");
    res.redirect(301, row.long_url);
  } catch {
    res.status(404).send("Invalid short code");
  }
});

// --- Start server ---
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ URL Shortener running at ${BASE_URL}`);
});
