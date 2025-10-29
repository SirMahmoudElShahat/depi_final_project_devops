# 🚀 URL Shortener Monitoring & Alerting (Week 3 — DEPI Final Project)

This project implements a complete **Monitoring & Alerting setup** for a simple **URL Shortener app** using:

- **Prometheus** → Metrics collection  
- **Grafana** → Visualization  
- **Alertmanager** → Alert handling  
- **Docker Compose** → Service orchestration  

---

## 🧩 Project Structure

```

week_3/
│
├── server.js
├── Dockerfile
├── docker-compose.yaml
├── package.json
├── package-lock.json
│
├── prometheus.yml
├── prom-rules.yml
├── alertmanager.yml
│
└── grafana/
├── dashboards/
│   └── urlshortener-dashboard.json
└── provisioning/
├── datasources/
│   └── datasource.yml
└── dashboards/
└── dashboard.yml

````

---

## ⚙️ Step 1 — Run All Services

Build and start all containers:

```bash
sudo docker compose up -d --build
````

Check that everything is **Up**:

```bash
sudo docker compose ps
```

✅ All services should appear as `Up`:

<img width="1911" height="939" alt="docker_compose_ps" src="https://github.com/user-attachments/assets/c21af40c-48d8-4b0a-936e-e755291bd32e" />

---

## 📊 Step 2 — Prometheus Setup

### **Prometheus Configuration (`prometheus.yml`):**

```yaml
global:
  scrape_interval: 5s

rule_files:
  - "/etc/prometheus/prom-rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

scrape_configs:
  - job_name: 'urlshortener'
    metrics_path: /metrics
    static_configs:
      - targets: ['app:8000']
```

### **Prometheus Rules (`prom-rules.yml`):**

Contains 3 main alerting rules:

* High latency (p95)
* Spike in 404s
* High error rate

<img width="1919" height="963" alt="urlshortener_rules" src="https://github.com/user-attachments/assets/c0ce8190-db5f-4926-afef-a124cf33e1e9" />

---

## 🔔 Step 3 — Alertmanager

The **Alertmanager** configuration is simple and can later be expanded to include Slack or Email notifications.

```yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 1h
  receiver: 'console'

receivers:
  - name: 'console'
    webhook_configs:
      - url: 'http://localhost:9094/'
```

---

## 📈 Step 4 — Grafana Provisioning

Grafana is automatically provisioned via files under `grafana/provisioning`.

* **Datasource** → connects Grafana to Prometheus
* **Dashboard** → automatically loads `urlshortener-dashboard.json`

### ✅ Connected Datasource:

<img width="1919" height="932" alt="data_sources" src="https://github.com/user-attachments/assets/e8b18ca4-a880-4b33-9f7d-6afe05b8a5f6" />

---

## 📉 Step 5 — Dashboard Visualization

The dashboard visualizes metrics such as:

* Total shorten requests
* Successful redirects
* 404 not found rate
* Latency (p95)
* Error ratio

All graphs are automatically refreshed every 10 seconds.

<img width="1919" height="931" alt="url_shortener_monitorin" src="https://github.com/user-attachments/assets/89ee866e-6215-48d8-b35d-151f40f1c3ac" />

---

## 🧪 Step 6 — Testing the App

Run the following to simulate requests and see live metrics updates:

```bash
# Send 20 shorten requests
for i in {1..20}; do
  curl -s -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/?q='$i'"}' http://localhost:8000/shorten
done

# Test redirects
curl -I http://localhost:8000/3
```

Example output from terminal:

<img width="1919" height="947" alt="url_return_done" src="https://github.com/user-attachments/assets/91dade8d-76fc-4df2-b870-a05d5a67b478" />

---

## ✅ Verification

* Prometheus: [http://localhost:9090/targets](http://localhost:9090/targets) → should show `app:8000` as **UP**
* Grafana: [http://localhost:3000/](http://localhost:3000/) → Dashboard auto-loaded
* Alertmanager: [http://localhost:9093/](http://localhost:9093/) → No alert groups found (normal if no rules triggered)

---

## 🧠 Notes

* Default Grafana login → **admin / admin** (you’ll be asked to change it).
* Make sure all file paths match those used in `docker-compose.yaml`.
* You can extend Alertmanager to send alerts to Slack, Email, or Webhooks.

---

## 📜 Credits

Developed by **Mahmoud El-Shahat**
Part of **DEPI Final Project — Week 3 (Monitoring & Alerting)**

