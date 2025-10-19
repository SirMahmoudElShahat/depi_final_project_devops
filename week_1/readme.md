# URL Shortener Web Service

A simple **URL shortener** web service built with **Node.js (Express)** and **SQLite**.
This is **Week 1** of a Depi DevOps course graduation project.

The goal of this week is to:

* Develop a basic backend service with REST APIs.
* Containerize it using Docker.
* Orchestrate it locally using Docker Compose.

---

## 🚀 Features

* **POST /shorten** → Shorten a long URL and return a short code.
* **GET /:code** → Redirect the user to the original long URL.
* **GET /health** → Simple health check endpoint.
* **SQLite storage** → Stores mappings between short codes and URLs in a local file.
* **Dockerized app** → Easy to build, run, and deploy anywhere.

---

## 🛠️ Tech Stack

* **Node.js** (Express)
* **SQLite3**
* **Docker**
* **Docker Compose**

---

## 📂 Project Structure

```
url-shortener/
├── server.js              # Main server code
├── package.json
├── Dockerfile             # For container image
├── docker-compose.yml     # For service orchestration
├── data/                  # SQLite database folder
└── README.md
```

---

## ⚙️ Setup & Run (Locally without Docker)

### 1. Clone the repository

```bash
git clone https://github.com/<abdlrhman00>/url-shortener.git
cd url-shortener
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the service

```bash
node server.js
```

✅ The service will start on:

```
http://localhost:8000
```

---

## 🧪 API Testing Examples

### 1. Check health

```bash
curl -i http://localhost:8000/health
```

Response:

```
HTTP/1.1 200 OK
Service is running
```

### 2. Shorten a URL

```bash
curl -X POST http://localhost:8000/shorten \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com"}'
```

Response:

```json
{
  "short_code": "abc123",
  "short_url": "http://localhost:8000/abc123"
}
```

### 3. Redirect to long URL

```bash
curl -i http://localhost:8000/abc123
```

Response:

```
HTTP/1.1 302 Found
Location: https://example.com
```

---

## 🐳 Run with Docker (Build Locally)

Use this method to **build and run the image locally** from your Dockerfile.

### 1. Build the image

```bash
docker build -t url-shortener:latest .
```

### 2. Run the container

```bash
docker run -p 8000:8000 url-shortener:latest
```

✅ The service will start on [http://localhost:8000](http://localhost:8000).
You can now test it using the same **curl commands** from the testing section.

---

## 🧩 Run with Docker Compose

Use this method to easily build, run, and manage the service with volumes and environment variables.

### 1. Start the service

```bash
docker-compose up -d
```

This will:

* Build the image (using your local Dockerfile)
* Create a persistent volume for database storage
* Start the container in detached mode

### 2. Check logs

```bash
docker-compose logs -f
```

### 3. Stop and remove containers

```bash
docker-compose down
```

---

## 📦 Run Using the Published Docker Hub Image

### 1. Pull the image

```bash
docker pull abdlrhman00/url-shortener:latest
```

### 2. Run the container

```bash
docker run -p 8000:8000 abdlrhman00/url-shortener:latest
```

✅ This runs the same version you published on Docker Hub.

---

## 🧠 What I Accomplished (Week 1 Summary)

* Built a working Node.js Express API for URL shortening.
* Integrated SQLite as a lightweight local database.
* Added Dockerfile for containerization.
* Created Docker Compose file for orchestration.
* Tested endpoints and verified service health.
* Successfully ran the service locally and via Docker.
