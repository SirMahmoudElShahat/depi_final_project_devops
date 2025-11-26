# 🚀 URL Shortener with Monitoring & Alerting

This project implements a robust **URL Shortener Service** instrumented with **Prometheus** for metrics collection, **Grafana** for visualization, and **Alertmanager** for alerting. It is containerized using **Docker Compose** for easy deployment.

## ✨ Features

- **URL Shortening**: Convert long URLs into short, shareable codes.
- **Redirection**: Seamlessly redirect users from short codes to original URLs.
- **Metrics Collection**: Tracks request rates, latency, 404 errors, and more using Prometheus.
- **Visualization**: Pre-configured Grafana dashboard to monitor service health.
- **Alerting**: Automated alerts for high latency, error spikes, and high error rates.
- **Data Persistence**: SQLite database and monitoring data persist across restarts.

## 🛠️ Prerequisites

- **Docker** and **Docker Compose** installed on your machine.

## 🚀 Getting Started

1.  **Clone the repository** (if you haven't already).
2.  **Start the stack**:
    ```bash
    docker compose up -d --build
    ```
3.  **Verify services are running**:
    ```bash
    docker compose ps
    ```

## 📡 API Documentation

The service exposes the following REST API endpoints on port `8000`.

### 1. Shorten a URL
Creates a short code for a given long URL.

- **Endpoint**: `POST /shorten`
- **Content-Type**: `application/json`
- **Body**:
  ```json
  {
    "url": "https://www.example.com/very/long/path"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "short_code": "1a",
    "short_url": "http://localhost:8000/1a",
    "long_url": "https://www.example.com/very/long/path"
  }
  ```
- **Error Response (400 Bad Request)**:
  ```json
  {
    "error": "Invalid URL. Must start with http:// or https://"
  }
  ```

### 2. Redirect to Original URL
Redirects the client to the original long URL associated with the short code.

- **Endpoint**: `GET /:code`
- **Example**: `GET /1a`
- **Response**:
  - **301 Moved Permanently**: Redirects to the long URL.
  - **404 Not Found**: If the short code does not exist.

### 3. Health Check
Simple endpoint to check if the service is running.

- **Endpoint**: `GET /health`
- **Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

### 4. Metrics
Exposes Prometheus metrics for scraping.

- **Endpoint**: `GET /metrics`
- **Response**: Plain text Prometheus metrics.

## 📊 Monitoring & Alerting

### Accessing Dashboards
- **Grafana**: [http://localhost:3000](http://localhost:3000)
    - **Credentials**: `admin` / `admin` (skip password change if prompted).
    - **Dashboard**: Go to **Dashboards** > **URL Shortener Monitoring**.
- **Prometheus**: [http://localhost:9091](http://localhost:9091)
- **Alertmanager**: [http://localhost:9093](http://localhost:9093)

### Configured Alerts
The system is configured to trigger alerts for the following conditions:
1.  **HighP95Latency**: 95th percentile latency exceeds the threshold for 2 minutes.
2.  **SpikeIn404**: More than 10 "Not Found" errors occur within 5 minutes.
3.  **HighErrorRate**: The rate of 404 errors exceeds 0.2 (20%) for 2 minutes.

## 📂 Project Structure

```
.
├── server.js               # Node.js Application
├── docker-compose.yaml     # Service Orchestration
├── prometheus.yml          # Prometheus Configuration
├── prom-rules.yml          # Alerting Rules
├── alertmanager.yml        # Alertmanager Configuration
├── grafana/                # Grafana Provisioning & Dashboards
└── data/                   # Persistent Data (SQLite)
```
