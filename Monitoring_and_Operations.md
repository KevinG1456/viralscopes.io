# Monitoring_&_Operations.md
# ViralScopes.io — Monitoring & Operations

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) · [Security_Architecture.md](./Security_Architecture.md) · [Deployment_Guide.md](./Deployment_Guide.md) · [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md)

---

## Table of Contents

1. [Monitoring Philosophy](#1-monitoring-philosophy)
2. [Monitoring Architecture](#2-monitoring-architecture)
3. [Logging Architecture](#3-logging-architecture)
4. [Metrics Reference](#4-metrics-reference)
5. [Grafana Dashboards](#5-grafana-dashboards)
6. [Alerting](#6-alerting)
7. [Error Tracking](#7-error-tracking)
8. [Performance Monitoring](#8-performance-monitoring)
9. [Health Checks](#9-health-checks)
10. [Uptime Monitoring](#10-uptime-monitoring)
11. [Service Level Objectives](#11-service-level-objectives)
12. [Service Level Indicators](#12-service-level-indicators)
13. [Service Level Agreements](#13-service-level-agreements)
14. [Incident Response](#14-incident-response)
15. [On-Call Procedures](#15-on-call-procedures)
16. [Backup Verification](#16-backup-verification)
17. [Disaster Recovery](#17-disaster-recovery)
18. [Capacity Planning](#18-capacity-planning)
19. [Operational Runbooks](#19-operational-runbooks)
20. [Maintenance Procedures](#20-maintenance-procedures)

---

## 1. Monitoring Philosophy

### The Three Pillars

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   METRICS   │   │    LOGS     │   │   TRACES    │
│             │   │             │   │             │
│ Prometheus  │   │    Loki     │   │   Jaeger /  │
│  + Grafana  │   │  + Grafana  │   │    Tempo    │
│             │   │   Explore   │   │  (Stage 3)  │
│ What is     │   │ Why did it  │   │ Where did   │
│ happening   │   │  happen     │   │  time go    │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Principles

1. **Observe before acting.** No infrastructure change is made without first understanding the current state from metrics.
2. **Alert on symptoms, not causes.** Alert when users are affected (high latency, errors), not when an internal system is in a degraded state that has no user impact yet.
3. **Every alert must be actionable.** An alert that fires without a clear remediation step is not an alert — it is noise. Remove or improve it.
4. **Correlation IDs link everything.** Every API request generates a `correlationId` that appears in every log line, every metric label, and every trace span for that request.
5. **Dashboards tell a story.** Each dashboard answers a specific operational question, not a collection of random metrics.
6. **No alert fatigue.** Alerts that fire more than 3 times per week without action are reviewed and either fixed or removed.

---

## 2. Monitoring Architecture

### Stage 1 Architecture (MVP — Self-Hosted)

```
┌──────────────────────────────────────────────────────────────┐
│                     Monitored Services                       │
│                                                              │
│  Fastify API ──┐                                             │
│  Next.js     ──┤                                             │
│  n8n         ──┼──▶ Prometheus (scrape every 15s)           │
│  Redis       ──┤         │                                   │
│  PostgreSQL  ──┤         ▼                                   │
│  Traefik     ──┘    Grafana (dashboards + alerts)            │
│                          │                                   │
│  All services ──────────▶ Loki (log aggregation)            │
│  (stdout JSON logs)       │                                  │
│                           ▼                                  │
│                      Grafana Explore                         │
│                      (log querying)                          │
└──────────────────────────────────────────────────────────────┘
                           │
                    Alert fired
                           │
                     ┌─────▼──────┐
                     │ Alertmanager│
                     └─────┬──────┘
                           │
              ┌────────────┼─────────────┐
              ▼            ▼             ▼
         Slack DM    PagerDuty      Email
         (P3/P4)      (P1/P2)       (P2)
```

### Metrics Collection

All services expose a `/metrics` endpoint in Prometheus exposition format. Prometheus scrapes every 15 seconds.

**Service exporters:**

| Service | Exporter | Metrics endpoint |
|---|---|---|
| Fastify API | Built-in (`fastify-metrics` plugin) | `http://api:3001/metrics` |
| Next.js | Built-in (custom instrumentation) | `http://web:3000/metrics` |
| PostgreSQL | `postgres_exporter` (Docker sidecar) | `http://pg-exporter:9187/metrics` |
| Redis | `redis_exporter` (Docker sidecar) | `http://redis-exporter:9121/metrics` |
| n8n | Custom HTTP probe | `http://n8n:5678/metrics` |
| Traefik | Built-in | `http://traefik:8082/metrics` |
| Node.js (all) | `prom-client` library | Included in service `/metrics` |
| Docker host | `node_exporter` | `http://localhost:9100/metrics` |

### Prometheus Configuration

```yaml
# infra/monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: production
    service: viralscopes

rule_files:
  - /etc/prometheus/alerts/api-alerts.yml
  - /etc/prometheus/alerts/queue-alerts.yml
  - /etc/prometheus/alerts/infra-alerts.yml
  - /etc/prometheus/alerts/business-alerts.yml

scrape_configs:
  - job_name: fastify-api
    static_configs:
      - targets: ['api:3001']
    metrics_path: /metrics

  - job_name: nextjs-web
    static_configs:
      - targets: ['web:3000']

  - job_name: postgres
    static_configs:
      - targets: ['pg-exporter:9187']

  - job_name: redis
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: traefik
    static_configs:
      - targets: ['traefik:8082']

  - job_name: node-host
    static_configs:
      - targets: ['localhost:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']
```

---

## 3. Logging Architecture

### Log Format

All services emit structured JSON logs to `stdout`. Docker captures `stdout` and forwards to Loki via Promtail or Docker's logging driver.

**Standard log entry:**

```json
{
  "level": "info",
  "time": "2026-07-20T10:30:00.000Z",
  "pid": 1,
  "hostname": "api-container",
  "correlationId": "01HXYZ123456789ABCDEF",
  "service": "api",
  "version": "1.0.0",
  "environment": "production",
  "userId": "01HABC...",
  "orgId": "01HDEF...",
  "method": "GET",
  "path": "/api/v1/videos",
  "statusCode": 200,
  "durationMs": 42,
  "msg": "Request completed"
}
```

### Pino Logger Configuration (API)

```typescript
// apps/api/src/plugins/logger.plugin.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: "api",
    version: process.env.APP_VERSION ?? "unknown",
    environment: process.env.APP_ENV ?? "development",
  },
  redact: {
    // NEVER log these fields — PII and secrets
    paths: [
      "*.password", "*.password_hash", "*.token",
      "*.apiKey", "*.api_key", "*.authorization",
      "*.email", "*.name", "*.ip_address",
      "req.headers.authorization", "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

### Correlation ID Propagation

```typescript
// middleware/correlation-id.ts
import { ulid } from "ulid";

export async function correlationIdMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Use client-provided ID if valid, otherwise generate
  const correlationId =
    request.headers["x-request-id"] ??
    request.headers["x-correlation-id"] ??
    ulid();

  request.correlationId = correlationId;
  request.log = request.log.child({ correlationId });
  reply.header("X-Request-ID", correlationId);
}
```

### Loki Configuration

```yaml
# infra/monitoring/loki/loki.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2026-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  retention_period: 720h  # 30 days
```

### Promtail / Docker Log Driver

```yaml
# docker-compose.prod.yml — logging section for each service
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "3"
        tag: "{{.Name}}/{{.ID}}"
    labels:
      - "logging=promtail"
      - "service=api"
```

### Log Levels in Production

| Level | When used | Example |
|---|---|---|
| `error` | System fault, unhandled exception, failed DB operation | "Database connection failed", "n8n workflow crashed" |
| `warn` | Recoverable issue, degraded state | "YouTube quota at 80%", "Redis cache miss rate elevated" |
| `info` | Business event, significant state change | "Video analysis complete", "Alert dispatched", "User signed up" |
| `debug` | Disabled in production | Enabled on staging for detailed debugging |

### What Must Never Be Logged

- Email addresses
- Names or any PII
- Passwords or password hashes
- JWT tokens, refresh tokens, API keys
- Stripe payment details
- IP addresses (in non-audit contexts)
- Full request bodies that may contain sensitive data

---

## 4. Metrics Reference

### API Metrics

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `http_requests_total` | Counter | `method`, `path`, `status` | Total HTTP requests |
| `http_request_duration_ms` | Histogram | `method`, `path`, `status` | Request duration in milliseconds |
| `http_request_size_bytes` | Histogram | `method`, `path` | Request body size |
| `http_response_size_bytes` | Histogram | `method`, `path` | Response body size |
| `http_active_connections` | Gauge | — | Current active connections |
| `auth_login_total` | Counter | `method`, `status` | Login attempts by method and success/failure |
| `auth_token_refresh_total` | Counter | `status` | Token refresh attempts |
| `rate_limit_triggered_total` | Counter | `plan`, `endpoint` | Rate limit hits |

### n8n Workflow Metrics

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `workflow_executions_total` | Counter | `workflow`, `status` | Total workflow runs |
| `workflow_execution_duration_ms` | Histogram | `workflow` | Workflow duration |
| `workflow_queue_depth` | Gauge | `priority` | Pending jobs per queue priority |
| `dead_letter_jobs_total` | Counter | `workflow` | Jobs sent to dead-letter queue |
| `ai_api_calls_total` | Counter | `provider`, `model`, `task` | AI API calls by provider/task |
| `ai_cache_hits_total` | Counter | `task` | AI response cache hits |
| `ai_cache_misses_total` | Counter | `task` | AI response cache misses |
| `youtube_quota_units_used` | Gauge | — | YouTube API quota consumed today |

### Database Metrics (postgres_exporter)

| Metric name | Type | Description |
|---|---|---|
| `pg_stat_activity_count` | Gauge | Active connections |
| `pg_stat_bgwriter_checkpoints_total` | Counter | Checkpoint count |
| `pg_stat_database_tup_fetched` | Counter | Rows fetched |
| `pg_stat_database_deadlocks` | Counter | Deadlocks |
| `pg_replication_lag_seconds` | Gauge | Replica lag (Stage 2+) |
| `pg_database_size_bytes` | Gauge | Database size |
| `pg_stat_user_tables_n_live_tup` | Gauge | Live row count per table |

### Redis Metrics (redis_exporter)

| Metric name | Type | Description |
|---|---|---|
| `redis_connected_clients` | Gauge | Connected clients |
| `redis_used_memory_bytes` | Gauge | Memory used |
| `redis_keyspace_hits_total` | Counter | Cache hits |
| `redis_keyspace_misses_total` | Counter | Cache misses |
| `redis_commands_processed_total` | Counter | Commands processed |
| `redis_blocked_clients` | Gauge | Blocked clients (queue depth indicator) |

### Business Metrics

| Metric name | Type | Labels | Description |
|---|---|---|---|
| `videos_analysed_total` | Counter | `status`, `tier` | Videos processed by analysis tier |
| `viral_scores_computed_total` | Counter | — | Viral scores computed |
| `alerts_dispatched_total` | Counter | `channel`, `trigger_type` | Alerts dispatched by channel |
| `exports_created_total` | Counter | `format` | Exports generated |
| `users_registered_total` | Counter | `method` | New user registrations |
| `organisations_created_total` | Counter | — | New organisations |
| `subscriptions_active` | Gauge | `plan` | Active subscriptions by plan |

---

## 5. Grafana Dashboards

### Dashboard 1: API Performance

**Purpose:** Answer "Is the API healthy right now?"

| Panel | Visualization | Query |
|---|---|---|
| Request rate (req/sec) | Time series | `rate(http_requests_total[1m])` |
| p50 latency | Time series | `histogram_quantile(0.50, rate(http_request_duration_ms_bucket[5m]))` |
| p95 latency | Time series | `histogram_quantile(0.95, rate(http_request_duration_ms_bucket[5m]))` |
| p99 latency | Time series | `histogram_quantile(0.99, rate(http_request_duration_ms_bucket[5m]))` |
| Error rate (5xx) | Time series + stat | `rate(http_requests_total{status=~"5.."}[1m]) / rate(http_requests_total[1m])` |
| Top 10 slowest endpoints | Table | Sort by p95 per path |
| Active connections | Gauge | `http_active_connections` |
| Rate limit hits | Counter | `rate(rate_limit_triggered_total[5m])` |

**Alerts linked:** API_HIGH_ERROR_RATE, API_HIGH_LATENCY

---

### Dashboard 2: Queue & Workflow Health

**Purpose:** Answer "Are background jobs processing normally?"

| Panel | Visualization | Description |
|---|---|---|
| Queue depth by priority | Time series | High / Standard / Low priority queue depths |
| Workflow success rate | Stat (%) | `success / (success + failed)` last 1h |
| Workflow execution duration | Heatmap | Duration distribution per workflow |
| Dead-letter queue depth | Stat + alert | Jobs in `dead_letter_jobs` where `resolved = false` |
| AI API call rate | Time series | Calls per minute by provider and task |
| AI cache hit rate | Stat (%) | `hits / (hits + misses)` |
| YouTube quota remaining | Gauge | `10000 - youtube_quota_units_used` |
| Workflows by status (last 24h) | Bar chart | Success / Failed / Retrying per workflow name |

**Alerts linked:** QUEUE_BACKLOG, DEAD_LETTER_ELEVATED, YOUTUBE_QUOTA_WARNING

---

### Dashboard 3: Database Metrics

**Purpose:** Answer "Is the database healthy and sized correctly?"

| Panel | Visualization | Description |
|---|---|---|
| Active connections | Time series + threshold | Current vs max pool size |
| Query latency (p95) | Time series | `pg_stat_statements` p95 |
| Database size | Gauge | Total size in GB |
| Table sizes (top 10) | Table | Largest tables by size |
| Deadlocks | Counter | Should always be 0 |
| Cache hit ratio | Stat (%) | `pg_stat_database_blks_hit / (blks_hit + blks_read)` |
| Replication lag | Time series | Seconds behind primary (Stage 2+) |
| Slow queries (> 1s) | Table | Query text, duration, frequency |

**Alerts linked:** DB_CONNECTIONS_HIGH, DB_REPLICATION_LAG

---

### Dashboard 4: YouTube API Quota

**Purpose:** Answer "How much YouTube API quota have we used today?"

| Panel | Visualization | Description |
|---|---|---|
| Units used today | Gauge (0–10,000) | Current daily consumption |
| Units used over time | Time series (today) | Consumption rate through the day |
| Projected daily total | Stat | At current rate, will we exceed quota? |
| Units by operation type | Pie chart | Search vs video detail vs channel vs captions |
| Cache hit rate (24h) | Stat | % of requests served from DB cache |
| Fallback activation events | Counter | Times RapidAPI/Apify fallback was used |

**Alerts linked:** YOUTUBE_QUOTA_WARNING, YOUTUBE_QUOTA_CRITICAL

---

### Dashboard 5: Business Metrics

**Purpose:** Answer "How is the product performing?"

| Panel | Visualization | Description |
|---|---|---|
| Videos analysed today | Stat | Running total |
| Viral scores computed | Stat | Running total |
| New signups (24h) | Stat | User registrations |
| Active subscriptions by plan | Bar chart | Free / Starter / Pro / Business / Enterprise |
| Alerts dispatched (24h) | Stat by channel | Email / Discord / Slack / Telegram / Webhook |
| Exports generated (24h) | Stat by format | CSV / Excel / JSON / PDF |
| API key authentications | Time series | External API usage growth |
| AI cost estimate (today) | Stat | Based on call counts × estimated token costs |

---

### Dashboard 6: Infrastructure Health

**Purpose:** Answer "Is the server healthy?"

| Panel | Visualization | Description |
|---|---|---|
| CPU usage per service | Time series | % CPU per container |
| Memory usage per service | Time series | MB used per container |
| Disk usage | Gauge | Used vs available on /data volume |
| Network I/O | Time series | Bytes in/out per second |
| Redis memory | Gauge + time series | Used memory vs max |
| Redis hit rate | Stat | Overall cache effectiveness |
| Container restarts | Counter | Should be 0 in steady state |
| System load average | Time series | 1m, 5m, 15m averages |

**Alerts linked:** HIGH_MEMORY, HIGH_CPU, DISK_SPACE_WARNING

---

## 6. Alerting

### Alert Routing

```yaml
# infra/monitoring/prometheus/alertmanager.yml
global:
  resolve_timeout: 5m
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: slack-default

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical
      repeat_interval: 1h

    - match:
        severity: warning
      receiver: slack-warnings
      repeat_interval: 4h

receivers:
  - name: pagerduty-critical
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: slack-warnings
    slack_configs:
      - channel: '#alerts'
        title: '⚠️ {{ .CommonAnnotations.summary }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: slack-default
    slack_configs:
      - channel: '#monitoring'
        title: 'ℹ️ {{ .CommonAnnotations.summary }}'
```

### Alert Definitions

#### API Alerts

```yaml
# infra/monitoring/prometheus/alerts/api-alerts.yml
groups:
  - name: api
    rules:
      - alert: API_HIGH_ERROR_RATE
        expr: |
          rate(http_requests_total{status=~"5.."}[5m])
          / rate(http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "API error rate > 1%"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."
          runbook: "https://docs.viralscopes.io/runbooks/api-high-error-rate"

      - alert: API_HIGH_LATENCY_P95
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_ms_bucket[5m])
          ) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API p95 latency > 1,000ms"
          description: "p95 response time is {{ $value }}ms."
          runbook: "https://docs.viralscopes.io/runbooks/api-high-latency"

      - alert: API_HIGH_LATENCY_P95_CRITICAL
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_ms_bucket[5m])
          ) > 2000
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API p95 latency critically high (> 2,000ms)"
          description: "p95 response time is {{ $value }}ms. Immediate investigation required."

      - alert: API_SERVICE_DOWN
        expr: up{job="fastify-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Fastify API is down"
          description: "The API service has been unreachable for 1 minute."
```

#### Queue Alerts

```yaml
      - alert: QUEUE_BACKLOG_HIGH
        expr: workflow_queue_depth{priority="high"} > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High-priority queue backlog > 100"
          description: "{{ $value }} jobs pending in high-priority queue."

      - alert: QUEUE_BACKLOG_CRITICAL
        expr: workflow_queue_depth{priority="standard"} > 1000
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Standard queue backlog critically high"
          description: "{{ $value }} jobs queued. n8n workers may be failing."

      - alert: DEAD_LETTER_ELEVATED
        expr: dead_letter_jobs_total > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Dead-letter queue has > 10 unresolved jobs"
          description: "{{ $value }} jobs in dead-letter queue. Review at /admin/dead-letter."

      - alert: WORKFLOW_FAILURE_RATE_HIGH
        expr: |
          rate(workflow_executions_total{status="failed"}[15m])
          / rate(workflow_executions_total[15m]) > 0.05
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Workflow failure rate > 5%"
          description: "{{ $value | humanizePercentage }} of workflows failing in the last 15 minutes."
```

#### YouTube Quota Alerts

```yaml
      - alert: YOUTUBE_QUOTA_WARNING
        expr: youtube_quota_units_used > 7500
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: "YouTube API quota at 75%"
          description: "{{ $value }} / 10,000 units used today. Fallback sources activating soon."

      - alert: YOUTUBE_QUOTA_CRITICAL
        expr: youtube_quota_units_used > 9500
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "YouTube API quota at 95% — fallback active"
          description: "{{ $value }} / 10,000 units used. RapidAPI/Apify fallback active."
```

#### Infrastructure Alerts

```yaml
      - alert: HIGH_MEMORY_USAGE
        expr: |
          (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)
          / node_memory_MemTotal_bytes > 0.85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Server memory usage > 85%"
          description: "Memory at {{ $value | humanizePercentage }}. Review running containers."

      - alert: DISK_SPACE_WARNING
        expr: |
          (node_filesystem_size_bytes{mountpoint="/"}
          - node_filesystem_free_bytes{mountpoint="/"})
          / node_filesystem_size_bytes{mountpoint="/"} > 0.80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk usage > 80%"
          description: "Disk at {{ $value | humanizePercentage }}. Expand or clean up logs."

      - alert: DISK_SPACE_CRITICAL
        expr: |
          (node_filesystem_size_bytes{mountpoint="/"}
          - node_filesystem_free_bytes{mountpoint="/"})
          / node_filesystem_size_bytes{mountpoint="/"} > 0.92
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Disk usage critically high (> 92%)"
          description: "Immediate action required. Service degradation imminent."

      - alert: REDIS_MEMORY_HIGH
        expr: redis_used_memory_bytes / redis_maxmemory_bytes > 0.80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage > 80%"

      - alert: DB_CONNECTIONS_HIGH
        expr: pg_stat_activity_count > 100
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL connection count > 100"
          description: "{{ $value }} active connections. Check PgBouncer pool size."
```

### Alert Review Policy

- Alerts are reviewed monthly in a team operations review
- Any alert that fires > 3 times per week without producing a remediation action is flagged for improvement
- Alert history is tracked in a dedicated Slack channel `#alert-history`
- New alerts must be reviewed in staging before being enabled in production

---

## 7. Error Tracking

### Stage 1 — Structured Log-Based Error Tracking

At MVP, errors are tracked via structured logs in Loki with Grafana alerts. No additional error tracking service is required.

**Error log pattern:**

```typescript
// In service layer
try {
  await videoRepository.findById(videoId);
} catch (err) {
  logger.error({
    correlationId: request.correlationId,
    err,                        // Pino automatically serialises Error objects
    videoId,
    context: "VideoService.getById",
  }, "Failed to fetch video from database");
  throw new AppError("INTERNAL_ERROR", "An unexpected error occurred.", 500);
}
```

**Loki query to find errors:**

```logql
{service="api"} |= "error" | json | level = "error"
  | line_format "{{.time}} [{{.correlationId}}] {{.context}}: {{.msg}}"
```

### Stage 2 — Sentry Integration (Post-MVP)

At Stage 2, Sentry is added for richer error tracking with stack traces, release tracking, and user impact:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.APP_ENV,
  release: process.env.APP_VERSION,
  tracesSampleRate: 0.1,        // Sample 10% of transactions for performance
  beforeSend(event) {
    // Scrub PII before sending to Sentry
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },
});
```

---

## 8. Performance Monitoring

### API Performance Targets

| Metric | Target | Warning threshold | Critical threshold |
|---|---|---|---|
| p50 response time | < 80ms | 150ms | 300ms |
| p95 response time | < 500ms | 800ms | 1,500ms |
| p99 response time | < 1,000ms | 1,500ms | 3,000ms |
| Error rate (5xx) | < 0.1% | 0.5% | 1% |
| Availability | > 99.9% | 99.5% | 99.0% |

### Frontend Performance Targets (Core Web Vitals)

| Metric | Target | Tool |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5s | Vercel Analytics / Lighthouse |
| First Input Delay (FID) | < 100ms | Real User Monitoring |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse CI |
| Time to Interactive (TTI) | < 3.5s | Lighthouse CI |
| Lighthouse Performance Score | ≥ 85 | Lighthouse CI in GitHub Actions |

**Lighthouse CI in GitHub Actions:**

```yaml
# .github/workflows/ci.yml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:3000/login
      http://localhost:3000/home
    budgetPath: ./lighthouse-budget.json
    uploadArtifacts: true
```

### Background Job Performance Targets

| Metric | Target | Alert threshold |
|---|---|---|
| Video discovery cycle duration | < 30 minutes | > 45 minutes |
| Single video full analysis | < 5 minutes | > 10 minutes |
| Alert dispatch latency | < 2 minutes from trigger | > 10 minutes |
| Daily trend detection cycle | < 2 hours | > 4 hours |
| Export generation (1,000 rows) | < 60 seconds | > 5 minutes |
| Dead-letter notification delay | < 5 minutes | > 15 minutes |

### Slow Query Monitoring

```sql
-- Enable pg_stat_statements in Supabase
-- Then query for slow queries:
SELECT
  query,
  calls,
  mean_exec_time::numeric(10,2) AS avg_ms,
  max_exec_time::numeric(10,2) AS max_ms,
  total_exec_time::numeric(10,2) AS total_ms
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 20;
```

Slow queries (> 100ms average) are reviewed weekly and optimised.

---

## 9. Health Checks

### API Health Endpoints

**`GET /health` — Liveness probe**

Returns immediately if the process is running. Used by Coolify and Traefik to detect crashed containers.

```typescript
fastify.get("/health", async (request, reply) => {
  return reply.code(200).send({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    version: process.env.APP_VERSION ?? "unknown",
    timestamp: new Date().toISOString(),
  });
});
```

**`GET /ready` — Readiness probe**

Checks all dependencies before declaring the service ready to receive traffic.

```typescript
fastify.get("/ready", async (request, reply) => {
  const checks: Record<string, string> = {};

  // Check database
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error: connection failed";
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error: connection failed";
  }

  // Check queue
  try {
    const queueSize = await bullQueue.count();
    checks.queue = `ok (${queueSize} pending)`;
  } catch {
    checks.queue = "error: BullMQ unreachable";
  }

  const allOk = Object.values(checks).every((v) => v.startsWith("ok"));
  const statusCode = allOk ? 200 : 503;

  return reply.code(statusCode).send({
    status: allOk ? "ready" : "not_ready",
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

### Health Check Registration

```yaml
# docker-compose.prod.yml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Traefik Health Check

```yaml
# infra/traefik/dynamic/middlewares.yml
http:
  services:
    api:
      loadBalancer:
        healthCheck:
          path: /ready
          interval: "30s"
          timeout: "10s"
```

---

## 10. Uptime Monitoring

### External Uptime Monitoring (Better Uptime or UptimeRobot)

External monitoring checks from multiple global locations to detect outages that internal monitoring would miss.

| Monitor | URL | Check interval | Alert on |
|---|---|---|---|
| Frontend | `https://app.viralscopes.io` | 1 minute | 2 consecutive failures |
| API health | `https://api.viralscopes.io/health` | 1 minute | 2 consecutive failures |
| API readiness | `https://api.viralscopes.io/ready` | 2 minutes | 3 consecutive failures |
| Login page | `https://app.viralscopes.io/login` | 5 minutes | 2 consecutive failures |

### Uptime SLO Tracking

Uptime is calculated as:

```
Uptime % = (Total minutes - Downtime minutes) / Total minutes × 100
```

Monthly uptime is tracked and reported to the team each Monday.

---

## 11. Service Level Objectives

SLOs define the reliability targets we commit to achieving.

### Platform SLOs

| SLO | Target | Measurement window | Error budget (monthly) |
|---|---|---|---|
| API availability | 99.9% | Rolling 30 days | 43.8 minutes downtime |
| API p95 latency < 500ms | 99.5% of requests | Rolling 7 days | 0.5% of requests |
| Background job success rate | 99.0% | Rolling 24 hours | 1% of jobs |
| Alert dispatch within 2 minutes | 98.0% | Rolling 7 days | 2% of alerts |
| Export completion within 5 minutes | 99.0% | Rolling 7 days | 1% of exports |
| Email delivery | 98.0% | Rolling 7 days | 2% of emails |

### Error Budget Policy

- If the monthly API availability error budget is > 50% consumed by week 2 of the month: freeze all non-critical deployments.
- If the error budget is fully consumed: no further changes to production until the budget resets, except reliability fixes.
- Error budget consumption is reviewed weekly.

---

## 12. Service Level Indicators

SLIs are the specific metrics used to measure whether SLOs are being met.

| SLO | SLI (what we measure) | Data source |
|---|---|---|
| API availability | `(total_requests - 5xx_errors) / total_requests` | Prometheus |
| API p95 latency | `histogram_quantile(0.95, http_request_duration_ms_bucket)` | Prometheus |
| Job success rate | `successful_jobs / total_jobs` | Prometheus + job_logs table |
| Alert dispatch latency | `alert_dispatched_at - trigger_event_at` | alert_events table |
| Export completion time | `completed_at - created_at` | exports table |
| Email delivery | `delivered / (delivered + bounced + failed)` | SendGrid webhook data |

### SLI Measurement Cadence

| SLI | Measurement frequency | Alert frequency |
|---|---|---|
| API availability | Real-time (15s Prometheus scrape) | Immediate on breach |
| API p95 latency | 1-minute rolling average | After 5 minutes sustained breach |
| Job success rate | 15-minute rolling average | After 10 minutes breach |
| Alert dispatch latency | Computed on each dispatch | If any alert takes > 10 minutes |

---

## 13. Service Level Agreements

SLAs are the contractual commitments made to customers. They are stricter at higher plan tiers.

| Plan | Uptime SLA | Response time SLA | Breach credit |
|---|---|---|---|
| Free | No SLA | No SLA | None |
| Starter | No SLA | No SLA | None |
| Professional | 99.5% monthly | — | Service credit: 1 day per hour below SLA |
| Business | 99.9% monthly | P1 support: 4-hour response | Service credit: 1 week per hour below SLA |
| Enterprise | 99.95% monthly | P1 support: 1-hour response | Custom SLA credit terms |

### SLA Reporting

- Monthly SLA reports are generated automatically and emailed to Business and Enterprise customers
- SLA incidents are logged in `audit_logs` with type `sla.incident`
- Credits are applied automatically to the next invoice via Stripe balance

---

## 14. Incident Response

### Incident Classification

| Severity | Definition | Response target | Communication |
|---|---|---|---|
| **P1 — Critical** | Service completely down or data breach | Acknowledge: 5 min · Mitigate: 30 min | Status page + email to all customers |
| **P2 — High** | Major feature broken, > 10% error rate | Acknowledge: 15 min · Mitigate: 2 hours | Status page + email to affected customers |
| **P3 — Medium** | Minor feature degraded, < 10% error rate | Acknowledge: 1 hour · Resolve: 24 hours | Status page update |
| **P4 — Low** | Cosmetic issue, no user impact | Resolve: 7 days | Internal tracking only |

### Incident Response Checklist

#### Detection (0–5 minutes)
- [ ] Alert fires in PagerDuty / Slack
- [ ] On-call engineer acknowledges
- [ ] Classify severity (P1–P4)
- [ ] Open incident Slack channel: `#incident-YYYY-MM-DD-short-name`
- [ ] Assign Incident Commander and Technical Lead

#### Assessment (5–15 minutes)
- [ ] Check Grafana dashboards — which metrics are anomalous?
- [ ] Check Loki logs — what errors appear in the last 5 minutes?
- [ ] Check `/ready` endpoint on all services
- [ ] Check Cloudflare dashboard for traffic anomalies
- [ ] Determine blast radius: which users are affected?
- [ ] Post initial status update to incident channel

#### Containment (15–60 minutes for P1)
- [ ] If applicable: enable maintenance mode or circuit breaker
- [ ] Preserve logs and metrics snapshots before any changes
- [ ] Identify the root cause hypothesis
- [ ] Apply the minimum change needed to stop the bleeding
- [ ] Verify the containment step worked via metrics

#### Resolution
- [ ] Apply permanent fix or revert the breaking change
- [ ] Verify via `/ready` and Grafana that all metrics return to baseline
- [ ] Communicate resolution to customers via status page
- [ ] Monitor for 30 minutes post-resolution

#### Post-Mortem (within 5 business days)
- [ ] Create post-mortem document from template
- [ ] Timeline of events (what happened, when)
- [ ] Root cause (the 5 Whys)
- [ ] Contributing factors
- [ ] What went well
- [ ] What did not go well
- [ ] Action items (with owners and deadlines)
- [ ] Share with team; schedule a review meeting

---

## 15. On-Call Procedures

### On-Call Schedule

At Stage 1 (small team), all engineers are available on a best-effort basis. Formal on-call rotation begins at Stage 2 when PagerDuty is enabled.

| Stage | On-call structure |
|---|---|
| Stage 1 (MVP) | Engineering lead primary; all engineers expected to respond within 30 minutes during business hours |
| Stage 2 | Weekly rotation via PagerDuty; primary + secondary on-call |
| Stage 3 | 24/7 rotation; primary + secondary; follow-the-sun for global coverage |

### On-Call Responsibilities

The on-call engineer is responsible for:

1. **Acknowledging P1/P2 alerts within 15 minutes**
2. **Triaging the alert** — is it real? What is the impact?
3. **Following the relevant runbook** (see Section 19)
4. **Escalating** if resolution is not within their ability
5. **Communicating** status to the team and, for P1/P2, to customers
6. **Documenting** actions taken during the incident

### Escalation Path

```
Alert fires
    │
    ▼
On-call engineer (acknowledges within 15 min)
    │ Not resolved in 30 min
    ▼
Engineering Lead (escalate by phone/Slack DM)
    │ Not resolved in 60 min
    ▼
Founding Team (full incident war room)
    │ Data breach or legal risk
    ▼
Legal / PR team notified
```

### Handoff Procedure

At the end of each on-call shift:
- [ ] Write a brief handoff note in `#on-call-handoff` Slack channel
- [ ] Include: any active incidents, any known issues, any changes made during shift
- [ ] Confirm the incoming engineer has acknowledged

---

## 16. Backup Verification

### Backup Schedule

| Backup type | Frequency | Retention | Storage |
|---|---|---|---|
| Supabase automated backup | Daily at 02:00 UTC | 7 days (Pro), 30 days (Pro + PITR) | Supabase infrastructure |
| pg_dump export to R2 | Daily at 03:00 UTC | 30 days | Cloudflare R2 `backups/` bucket |
| Hetzner server snapshot | Weekly (Sunday 04:00 UTC) | 4 snapshots | Hetzner snapshot storage |
| n8n workflow export | On every workflow change | Git history | GitHub repository |
| Loki log export | Monthly to R2 | 6 months | Cloudflare R2 `logs-archive/` |

### Monthly Backup Verification Procedure

Run on the first Tuesday of every month:

```bash
#!/bin/bash
# scripts/verify-backup.sh

echo "=== ViralScopes Backup Verification ==="
echo "Date: $(date)"

# 1. List available Supabase backups
echo "
--- Supabase backups ---"
supabase db remote backup list

# 2. Restore yesterday's pg_dump to a staging DB
echo "
--- Restoring pg_dump to staging ---"
BACKUP_FILE="s3://viralscopes-backups/$(date -d 'yesterday' +%Y-%m-%d)/viralscopes-prod.sql.gz"
aws s3 cp $BACKUP_FILE /tmp/backup.sql.gz --endpoint-url $R2_ENDPOINT
gunzip /tmp/backup.sql.gz
psql $STAGING_DATABASE_URL < /tmp/backup.sql

# 3. Run smoke queries against restored DB
echo "
--- Running smoke queries ---"
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM users;" | grep -q "[0-9]" && echo "✅ users table OK"
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM videos;" | grep -q "[0-9]" && echo "✅ videos table OK"
psql $STAGING_DATABASE_URL -c "SELECT COUNT(*) FROM organizations;" | grep -q "[0-9]" && echo "✅ organizations table OK"

# 4. Measure restore time
echo "
--- Restore time: $(elapsed) seconds ---"

# 5. Log result to job_logs
echo "
--- Logging result ---"
# ... API call to log the verification result

echo "
=== Backup verification complete ==="
```

### Backup Verification Checklist

- [ ] Supabase backup list shows backup from last 24 hours
- [ ] pg_dump restore to staging completes without errors
- [ ] Core tables (`users`, `organizations`, `videos`, `subscriptions`) have row counts matching production approximately
- [ ] Restore time is within the RTO target (< 1 hour at Stage 1)
- [ ] Result logged to `job_logs` with `workflow_name = 'backup_verification'`
- [ ] Any failures treated as P2 incidents immediately

---

## 17. Disaster Recovery

### Recovery Objectives

| Scenario | RTO | RPO | Priority |
|---|---|---|---|
| API container crash | 2 minutes | 0 (Docker restart) | P1 |
| VPS hardware failure | 30 minutes | 24 hours (last backup) | P1 |
| Database corruption | 1 hour | 24 hours (last backup) | P1 |
| Redis failure (Stage 1, no persistence) | 5 minutes | Cache only (no data loss) | P2 |
| Object storage unavailable | 60 minutes | None (read-only impact) | P2 |
| n8n workflow failure | 5 minutes | Queue retry covers gaps | P2 |
| Cloudflare service disruption | 30 minutes | None | P2 |
| AI API unavailability (OpenAI/Anthropic) | 10 minutes | None (analysis paused) | P3 |

### DR Runbook: VPS Complete Failure

```
Estimated time: 30 minutes

1. Provision new Hetzner CCX33 server (5 minutes)
   → Hetzner Cloud Console → Create Server → CCX33 → Germany → Ubuntu 24.04

2. Install Coolify on new server (10 minutes)
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

3. Restore environment variables from backup (3 minutes)
   → Access Coolify → Settings → Import environment template from secure backup

4. Pull and deploy Docker images (8 minutes)
   → Coolify → Deploy from GitHub Container Registry

5. Restore database from latest pg_dump (5 minutes)
   → Download from R2 → psql < backup.sql (if Supabase is unavailable)
   → Or: Supabase is managed; no action needed if only the VPS failed

6. Update DNS records in Cloudflare (2 minutes)
   → Point api.viralscopes.io and app.viralscopes.io to new server IP

7. Verify: curl https://api.viralscopes.io/ready

8. Restore n8n workflows from /infra/n8n-workflows/ (3 minutes)
   npm run workflows:import
```

### DR Runbook: Database Corruption

```
Estimated time: 60 minutes

1. Put application in maintenance mode (1 minute)
   → Set MAINTENANCE_MODE=true in Coolify env → Redeploy API

2. Identify the point of corruption from job_logs and audit_logs

3. Restore from Supabase backup via Supabase dashboard (30 minutes)
   → Select backup from before corruption event
   → Initiate restore

4. Replay WAL logs from corruption point if PITR is available (15 minutes)
   → Available at Stage 2+ with WAL archiving enabled

5. Verify data integrity with smoke queries (5 minutes)

6. Disable maintenance mode and redeploy (3 minutes)

7. Notify affected customers via email (6 minutes)
```

---

## 18. Capacity Planning

### Capacity Review Cadence

- **Weekly:** Review queue depth trends, API latency trends
- **Monthly:** Review disk growth rate, DB table sizes, Redis memory growth
- **Quarterly:** Full capacity review against growth projections; plan infrastructure upgrades

### Capacity Thresholds — Action Required

| Resource | Warning | Critical | Action |
|---|---|---|---|
| Server CPU (sustained) | 70% | 85% | Optimise, then upgrade server |
| Server RAM | 75% | 88% | Optimise Redis/n8n, then upgrade |
| Disk usage | 75% | 88% | Expand volume or clean old logs |
| PostgreSQL connections | 80% of pool | 95% | Increase PgBouncer pool size |
| Redis memory | 75% of max | 88% | Increase Redis maxmemory or add node |
| Queue depth (sustained 1h) | 500 jobs | 2,000 jobs | Add n8n worker instance |
| Database size | 6 GB (on 8GB Supabase Pro) | 7.5 GB | Upgrade Supabase plan |

### Disk Growth Projection

Expected disk usage growth at Stage 1:

| Data type | Growth rate | Monthly addition |
|---|---|---|
| PostgreSQL (videos, analyses) | ~500 MB/month | +500 MB |
| Loki logs | ~200 MB/month | +200 MB |
| Prometheus metrics | ~100 MB/month (with compaction) | +100 MB |
| n8n workflow data | ~50 MB/month | +50 MB |
| **Total** | **~850 MB/month** | |

At this rate, the 240 GB NVMe SSD on the CCX33 provides approximately **280 months** before disk becomes a concern — well beyond when a Stage 2 migration would occur.

---

## 19. Operational Runbooks

Runbooks live in `/docs/guides/runbooks/` and are linked from Grafana alert annotations.

### Runbook Index

| ID | Title | Trigger | Last reviewed |
|---|---|---|---|
| RB-001 | API High Error Rate | `API_HIGH_ERROR_RATE` alert | 2026-07-20 |
| RB-002 | API High Latency | `API_HIGH_LATENCY_P95` alert | 2026-07-20 |
| RB-003 | Queue Backlog | `QUEUE_BACKLOG_HIGH` alert | 2026-07-20 |
| RB-004 | Dead-Letter Jobs Elevated | `DEAD_LETTER_ELEVATED` alert | 2026-07-20 |
| RB-005 | YouTube Quota Exhausted | `YOUTUBE_QUOTA_CRITICAL` alert | 2026-07-20 |
| RB-006 | AI Provider Unavailable | Manual / workflow failures | 2026-07-20 |
| RB-007 | Database Connection High | `DB_CONNECTIONS_HIGH` alert | 2026-07-20 |
| RB-008 | Disk Space Warning | `DISK_SPACE_WARNING` alert | 2026-07-20 |
| RB-009 | VPS Complete Failure | Manual / uptime monitor | 2026-07-20 |
| RB-010 | Database Corruption | Manual | 2026-07-20 |
| RB-011 | Redis Failure | Uptime monitor / queue errors | 2026-07-20 |
| RB-012 | Data Breach Response | Manual / security alert | 2026-07-20 |
| RB-013 | Backup Verification Failure | Monthly job / manual | 2026-07-20 |

### Runbook Template (RB-001 Example)

```markdown
# RB-001 — API High Error Rate

**Alert:** API_HIGH_ERROR_RATE (5xx error rate > 1% for 5 minutes)
**Severity:** Critical
**Expected resolution time:** 30 minutes

## Immediate Steps

1. Check Grafana → API Performance dashboard
   → Which endpoints are returning 5xx?
   → Is the error rate rising or stable?

2. Check Loki logs for errors:
   {service="api"} | json | level="error" | last 10m

3. Check `/ready` endpoint:
   curl https://api.viralscopes.io/ready

## Common Causes & Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| All endpoints 500 | Database unreachable | Check Supabase status, PgBouncer pool |
| All endpoints 500 | Redis unreachable | Restart Redis container |
| Specific endpoints 500 | Bug in recent deploy | Roll back to previous version |
| 503 from Traefik | API container down | Check `docker ps`, restart container |
| DB connection errors | Pool exhausted | Increase PgBouncer pool size |

## Escalation

If not resolved within 20 minutes: escalate to Engineering Lead.
If data loss suspected: escalate to Founding Team immediately.

## Post-Incident

1. Log root cause in incident Slack channel
2. Create post-mortem if incident lasted > 15 minutes
3. Update this runbook if a new cause was discovered
```

---

## 20. Maintenance Procedures

### Scheduled Maintenance Window

- **Time:** Sundays 02:00–04:00 UTC (lowest traffic period)
- **Frequency:** Monthly (or as needed)
- **Notice:** 48-hour advance notice via status page and email for planned maintenance
- **Communication:** Status page updated to "Scheduled Maintenance" 30 minutes before start

### Zero-Downtime Deployment Procedure

All routine deployments use zero-downtime rolling deploys via Coolify:

```
1. New Docker image built and pushed to GHCR via GitHub Actions
2. Coolify receives webhook trigger
3. Coolify starts new container (health check: /ready must return 200)
4. New container passes health check
5. Traefik routes new traffic to new container
6. Old container receives no new connections
7. Old container finishes serving in-flight requests
8. Old container is stopped
```

Total downtime: 0 seconds (assuming the new container starts healthy).

### Database Migration Procedure

```bash
# 1. Apply migration to staging first
npm run db:migrate --workspace=packages/db --env=staging
# Verify staging is working correctly

# 2. Take a pre-migration snapshot (production)
# Hetzner snapshot or pg_dump

# 3. Apply migration to production
# Done automatically by CI/CD pipeline before container swap

# 4. Verify migration applied correctly
npm run db:migrate:status --workspace=packages/db --env=production
```

### Log Rotation & Cleanup

Managed automatically:
- Docker container logs: JSON file driver with `max-size=100m, max-file=3` — auto-rotated
- Loki: retention policy deletes logs older than 30 days (Stage 1)
- Prometheus: 15-day retention with TSDB compaction
- Old partition tables (`usage_events_*`, `job_logs_*`): dropped by monthly maintenance CRON job

### Monthly Operations Checklist

- [ ] Review Grafana dashboards for trends (CPU, memory, disk, queue depth)
- [ ] Run backup verification procedure (Section 16)
- [ ] Review dead-letter queue — any unresolved jobs?
- [ ] Check `npm audit` for new vulnerabilities
- [ ] Review Cloudflare WAF block logs for new attack patterns
- [ ] Check Dependabot PRs — merge any approved updates
- [ ] Review SLO error budget consumption
- [ ] Review alert history — any noisy/ineffective alerts?
- [ ] Review AI API cost vs previous month
- [ ] Check Supabase storage usage
- [ ] Update runbooks if any new incident patterns discovered
- [ ] Review on-call rotation and ensure coverage for next month

### Quarterly Operations Checklist

- [ ] Full capacity review against growth projections
- [ ] Review and update all runbooks
- [ ] JWT secret rotation (if annual rotation not due, confirm no compromise)
- [ ] Review RBAC permissions — any over-privileged accounts?
- [ ] Review API key usage — any unused keys to revoke?
- [ ] Update disaster recovery runbooks
- [ ] Test DR procedure against staging (restore from backup)
- [ ] Review infrastructure cost vs revenue ratio
- [ ] Plan any infrastructure upgrades for the next quarter

---

*This document is reviewed monthly and updated whenever monitoring configuration changes, new alerts are added, or runbooks are revised.*

---

**Related Documents:**
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure evolution and upgrade triggers
- [Security_Architecture.md](./Security_Architecture.md) — Security monitoring and incident response
- [Deployment_Guide.md](./Deployment_Guide.md) — Deployment pipeline and post-deploy verification
- [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) — Monitoring cost breakdown
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current operational status and known issues
