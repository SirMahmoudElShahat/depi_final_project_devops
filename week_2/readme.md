# Monitoring a Containerized URL Shortener Web Service

This is **Week 2** of the Depi DevOps graduation project.
In this week, the focus is on **monitoring the containerized URL shortener** using **Prometheus** and preparing the environment for **Grafana dashboards** in the upcoming phase.

---

## 🎯 Objectives

* Integrate **Prometheus** with the running URL Shortener service.
* Expose application metrics using **/metrics endpoint**.
* Collect, visualize, and verify the metrics in Prometheus.
* Configure Prometheus to scrape data from the web service container.

---

## 🛠️ Tech Stack

* **Python (Flask)** – Web service
* **SQLite** – Local database
* **Docker & Docker Compose** – Container orchestration
* **Prometheus** – Monitoring & metrics collection

---

## 📂 Project Structure

```

week_2/
├── server.js              # Main server code
├── package-lock.json
├── package.json
├── Dockerfile             # For container image
├── docker-compose.yml     # For service orchestration
├── prometheus.yml         # Prometheus configuration file
├── data/                  # SQLite database folder
└── README.md
```

---

## ⚙️ How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/SirMahmoudElShahat/depi_final_project_devops.git
cd week_2
```

### 2. Start all services using Docker Compose

```bash
docker-compose up -d --build
```

This will start:

* The **URL Shortener App** (Flask)
* **Prometheus** service for monitoring

✅ After a few seconds, check all containers:

```bash
docker ps
```

---

## 🌐 Access the Services

| Service       | URL                                            | Description          |
| ------------- | ---------------------------------------------- | -------------------- |
| URL Shortener | [http://localhost:8000](http://localhost:8000) | Main web service     |
| Prometheus    | [http://localhost:9091](http://localhost:9091) | Metrics and query UI |

---

## 📈 Prometheus Setup

Prometheus configuration file:
`prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: 'url_shortener'
    static_configs:
      - targets: ['app:8000']
```

This tells Prometheus to scrape metrics from the Flask app every 5 seconds.

---

## 🧪 Verify Prometheus is Running

Open **[http://localhost:9090/targets](http://localhost:9090/targets)**
You should see the target `app:5000` **UP** ✅

📸 *Screenshot here:*
`![Prometheus Target Up](images/prometheus_up.png)`

---

## ⚙️ Execute a Metric Query

1. Go to **[http://localhost:9090/](http://localhost:9090/)**
2. In the “Expression” box, try:

   ```
   urlshortener_shorten_total
   ```
3. Click **Execute** to view live data.

📸 *Screenshot here:*
`![Prometheus Execute Query](images/prometheus_execute.png)`

---

## 🔍 Exposed Metrics (Examples)

| Metric Name                            | Description                               |
| -------------------------------------- | ----------------------------------------- |
| `urlshortener_shorten_total`           | Total number of shorten requests          |
| `urlshortener_redirect_total`          | Total number of successful redirects      |
| `urlshortener_notfound_total`          | Total number of 404 not found errors      |
| `urlshortener_request_latency_seconds` | Histogram of request latency per endpoint |

---

## 🧠 What I Accomplished (Week 2 Summary)

* Integrated **Prometheus monitoring** with the URL shortener service.
* Exposed and scraped **application metrics** successfully.
* Verified the **Prometheus UI** shows active targets.
* Tested and confirmed metrics appear when executing queries.
* Prepared the system for **Grafana integration** in the next phase.

