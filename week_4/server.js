import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import client from "prom-client"; 

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'url_shortener_' });

const shortenedUrlsCounter = new client.Counter({
  name: 'url_shortener_shortened_urls_total',
  help: 'Total number of URLs successfully shortened' 
});

const successfulRedirectsCounter = new client.Counter({
  name: 'url_shortener_successful_redirects_total',
  help: 'Total number of successful redirects' 
});

const failedLookupsCounter = new client.Counter({
  name: 'url_shortener_failed_lookups_total',
  help: 'Total number of failed lookups (404 errors)' 
});

const requestLatencyHistogram = new client.Histogram({
  name: 'url_shortener_request_latency_seconds',
  help: 'Request latency for API endpoints', 
  labelNames: ['method', 'endpoint'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5]
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.URLSHORTENER_DB || path.join(__dirname, "data", "urls.db");
const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const PORT = process.env.PORT || 8000;

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const app = express();
app.use(express.json());

app.get("/metrics", async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/health", (_, res) => res.json({ status: "ok" }));

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

let db;
async function initDb() {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS url_map (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      long_url TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

await initDb();

app.post("/shorten", async (req, res) => {
  const end = requestLatencyHistogram.startTimer({ method: 'POST', endpoint: '/shorten' });
  const { url } = req.body || {};
  if (!url || !/^https?:\/\//.test(url)) {
    end();
    return res.status(400).json({ error: "Invalid URL. Must start with http:// or https://" });
  }

  try {
    const existing = await db.get("SELECT id FROM url_map WHERE long_url = ?", [url]);
    let id = existing ? existing.id : (await db.run("INSERT INTO url_map (long_url) VALUES (?)", [url])).lastID;

    const code = encodeBase62(id);
    const shortUrl = `${BASE_URL.replace(/\/$/, "")}/${code}`;
    shortenedUrlsCounter.inc();
    res.status(201).json({ short_code: code, short_url: shortUrl, long_url: url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  } finally {
    end();
  }
});

app.get("/:code", async (req, res) => {
  const end = requestLatencyHistogram.startTimer({ method: 'GET', endpoint: '/:code' }); 
  try {
    const { code } = req.params;
    const id = decodeBase62(code);
    const row = await db.get("SELECT long_url FROM url_map WHERE id = ?", [id]);
    if (!row) {
      failedLookupsCounter.inc();
      return res.status(404).send("Not found");
    }
    successfulRedirectsCounter.inc(); 
    res.redirect(301, row.long_url);
  } catch {
    failedLookupsCounter.inc(); 
    res.status(404).send("Invalid short code");
  } finally {
    end(); 
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ URL Shortener running at ${BASE_URL}`);
});
