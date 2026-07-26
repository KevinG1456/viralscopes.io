# INFRASTRUCTURE_GROWTH_PLAN.md
# ViralScopes.io — Infrastructure Evolution Plan

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [ROADMAP.md](./ROADMAP.md) · [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [PROJECT_RULES.md](./PROJECT_RULES.md)

---

## Table of Contents

1. [Overview & Philosophy](#1-overview--philosophy)
2. [Infrastructure Stages](#2-infrastructure-stages)
3. [Current Architecture — MVP (Stage 1)](#3-current-architecture--mvp-stage-1)
4. [Target Architecture — Growth (Stage 2)](#4-target-architecture--growth-stage-2)
5. [Target Architecture — Scale (Stage 3)](#5-target-architecture--scale-stage-3)
6. [Target Architecture — Enterprise (Stage 4)](#6-target-architecture--enterprise-stage-4)
7. [Database Growth Strategy](#7-database-growth-strategy)
8. [Caching Strategy](#8-caching-strategy)
9. [CDN Strategy](#9-cdn-strategy)
10. [Queue & Background Job Strategy](#10-queue--background-job-strategy)
11. [Object Storage Strategy](#11-object-storage-strategy)
12. [Search Infrastructure](#12-search-infrastructure)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Logging Strategy](#14-logging-strategy)
15. [CI/CD Evolution](#15-cicd-evolution)
16. [Security Evolution](#16-security-evolution)
17. [Disaster Recovery & High Availability](#17-disaster-recovery--high-availability)
18. [Cost Optimisation](#18-cost-optimisation)
19. [Multi-Region Strategy](#19-multi-region-strategy)
20. [Infrastructure Milestones](#20-infrastructure-milestones)

---

## 1. Overview & Philosophy

### Guiding Principles

1. **Do not over-engineer for a future that may not arrive.** The MVP infrastructure is deliberately simple and cost-effective. Complexity is added only when real data proves it is needed.
2. **Bottlenecks are measured, not guessed.** Every infrastructure upgrade is triggered by an observed metric breaching a defined threshold — not by anticipation.
3. **Every system must be replaceable.** No vendor lock-in without a documented migration path. All external services are accessed through abstraction layers.
4. **Infrastructure changes are code.** All configuration is version-controlled. No manual changes to production infrastructure that are not also committed to the repository.
5. **Observability precedes optimisation.** You cannot optimise what you cannot measure. Monitoring and logging are first-class citizens from day one.
6. **Fail safely.** Every infrastructure component has a defined failure mode, a retry strategy, and a fallback. Cascading failures are mitigated by circuit breakers and graceful degradation.

### Upgrade Triggers

Infrastructure is upgraded when one or more of the following thresholds are breached and sustained for more than 7 days:

| Metric | Trigger threshold | Action |
|---|---|---|
| API p95 response time | > 800ms | Investigate query performance, add caching, consider read replica |
| Database connection pool saturation | > 80% | Increase pool size, add PgBouncer tier, consider read replica |
| Redis memory usage | > 70% | Increase Redis instance size or add cluster |
| Queue backlog (pending jobs) | > 5,000 sustained | Add n8n worker instances |
| Dead-letter job rate | > 1% of total jobs | Investigate workflow reliability |
| YouTube API quota utilisation | > 75% of daily limit | Activate supplemental data source, upgrade quota tier |
| AI API cost | > £1,500/month | Audit caching effectiveness, tighten tiered analysis thresholds |
| Storage growth rate | > 50GB/month | Review retention policies, evaluate CDN caching |
| Monthly server cost | > 60% of MRR | Cost optimisation review |

---

## 2. Infrastructure Stages

| Stage | Name | Trigger | Target users | Est. MRR |
|---|---|---|---|---|
| **Stage 1** | MVP — Single Server | Project launch | 0 – 2,000 MAU | £0 – £15k |
| **Stage 2** | Growth — Separated Services | Stage 1 triggers hit | 2,000 – 20,000 MAU | £15k – £75k |
| **Stage 3** | Scale — Distributed | Stage 2 triggers hit | 20,000 – 200,000 MAU | £75k – £500k |
| **Stage 4** | Enterprise — Global | Stage 3 triggers hit | 200,000+ MAU | £500k+ |

Each stage is described in full below, including the specific changes made from the previous stage.

---

## 3. Current Architecture — MVP (Stage 1)

*Target: Launch through first 2,000 MAU and £15k MRR*

### 3.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Cloudflare                             │
│              (DNS, CDN, DDoS Protection, WAF)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Single VPS / Cloud Server                  │
│                 (Coolify managed, ~8 vCPU / 32GB RAM)        │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  Traefik    │   │  Next.js    │   │   Fastify API    │  │
│  │ (Reverse    │──▶│  Frontend   │   │   (Node.js)      │  │
│  │  Proxy +    │   │  (Port 3000)│   │   (Port 3001)    │  │
│  │  SSL)       │──▶│             │   │                  │  │
│  └─────────────┘   └─────────────┘   └────────┬─────────┘  │
│                                               │            │
│  ┌─────────────┐   ┌─────────────┐   ┌───────▼──────────┐  │
│  │    n8n      │   │    Redis    │   │   PostgreSQL     │  │
│  │ (Workflows) │◀──│  (Queue +   │   │   (Supabase      │  │
│  │  (Port 5678)│   │   Cache)    │   │    hosted)       │  │
│  └─────────────┘   └─────────────┘   └──────────────────┘  │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  Prometheus │   │   Grafana   │   │      Loki        │  │
│  │  (Metrics)  │   │ (Dashboards)│   │     (Logs)       │  │
│  └─────────────┘   └─────────────┘   └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        Cloudflare R2   SendGrid/   YouTube API
        (Object Store)   Resend     OpenAI/Claude
                        (Email)     (AI APIs)
```

### 3.2 Component Inventory

| Component | Technology | Hosting | Purpose |
|---|---|---|---|
| Reverse proxy | Traefik | Same VPS | SSL termination, routing, security headers |
| Frontend | Next.js 14 | Same VPS (Docker) | User-facing dashboard |
| API | Fastify + Node.js | Same VPS (Docker) | REST API, business logic |
| Workflow engine | n8n (self-hosted) | Same VPS (Docker) | Background pipeline orchestration |
| Database | PostgreSQL | Supabase hosted | Primary data store |
| Cache + Queue | Redis | Same VPS (Docker) | Rate limiting, caching, BullMQ job queue |
| Object storage | Cloudflare R2 | Cloudflare edge | Thumbnails, exports, reports |
| Email | SendGrid or Resend | SaaS | Transactional email delivery |
| AI analysis | OpenAI + Anthropic | SaaS | Video analysis and recommendations |
| YouTube data | YouTube Data API v3 | Google SaaS | Video discovery and metadata |
| CDN + DDoS | Cloudflare | Cloudflare edge | CDN, WAF, DDoS protection |
| Monitoring | Prometheus + Grafana | Same VPS (Docker) | Metrics and dashboards |
| Log aggregation | Loki | Same VPS (Docker) | Centralised log collection |
| Deployment | Coolify | Same VPS | Self-hosted PaaS, CI/CD integration |

### 3.3 Server Specification

| Resource | Specification | Rationale |
|---|---|---|
| CPU | 8 vCPU | Handles concurrent Node.js processes and n8n workers |
| RAM | 32 GB | PostgreSQL local cache, Redis, n8n, Next.js, Fastify, monitoring |
| Storage | 500 GB NVMe SSD | Database volumes, n8n workflow data, logs |
| Network | 1 Gbps | Adequate for early-stage traffic volumes |
| Backups | Daily, 30-day retention | Automated via Coolify + object storage |

### 3.4 Cost Estimate (Stage 1)

| Service | Est. monthly cost |
|---|---|
| VPS (8 vCPU / 32GB) | £80 – £160 |
| Supabase (Pro plan) | £20 – £25 |
| Cloudflare R2 (10GB storage + egress) | £5 – £15 |
| SendGrid / Resend | £15 – £30 |
| OpenAI API (with caching) | £100 – £400 |
| Anthropic API (with caching) | £50 – £200 |
| YouTube Data API (free tier + RapidAPI) | £0 – £50 |
| Cloudflare (Pro plan) | £20 |
| **Total estimate** | **£290 – £900/month** |

### 3.5 Stage 1 Limitations

These are accepted constraints at Stage 1 that are resolved in Stage 2:

- All services on a single server — no horizontal scaling
- No database read replica — reads and writes compete on one instance
- Redis is not persistent across server restarts (AOF not enabled)
- n8n is a single instance — no worker parallelism
- No distributed tracing (only structured logs and Prometheus metrics)
- No automated failover — manual recovery required on server failure

---

## 4. Target Architecture — Growth (Stage 2)

*Trigger: Stage 1 thresholds breached. Target: 2,000–20,000 MAU, £15k–£75k MRR*

### 4.1 Changes from Stage 1

| Change | Reason |
|---|---|
| Separate API and frontend to distinct servers | Allows independent scaling of API and frontend |
| Add PostgreSQL read replica | Offload analytics and read-heavy queries from primary |
| Enable Redis persistence (AOF + RDB) | Prevent queue data loss on Redis restart |
| Add second n8n worker instance | Parallel workflow execution for higher job throughput |
| Move Prometheus + Grafana + Loki to dedicated monitoring server | Prevent monitoring overhead from affecting API performance |
| Enable Supabase connection pooling (PgBouncer) at full capacity | Handle increased concurrent DB connections |
| Add ClickHouse for analytics queries | Offload high-cardinality analytics from PostgreSQL |

### 4.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         Cloudflare                           │
│               (DNS, CDN, DDoS, WAF, Load Balancing)          │
└────┬──────────────────────────┬───────────────────────────────┘
     │                          │
     ▼                          ▼
┌────────────┐           ┌──────────────┐
│ Frontend   │           │  API Server  │
│ Server     │           │  (2x VPS,    │
│ (Next.js)  │           │  Traefik LB) │
└────────────┘           └──────┬───────┘
                                │
               ┌────────────────┼─────────────────┐
               ▼                ▼                  ▼
        ┌────────────┐  ┌──────────────┐  ┌──────────────┐
        │ PostgreSQL │  │    Redis     │  │  n8n Worker  │
        │ Primary +  │  │  (Managed,   │  │  (2 instances│
        │ Read       │  │  persistent) │  │  + queue)    │
        │ Replica    │  └──────────────┘  └──────────────┘
        └────────────┘
               │
               ▼
        ┌────────────┐
        │ ClickHouse │
        │ (Analytics │
        │  queries)  │
        └────────────┘

┌─────────────────────────────┐
│   Monitoring Server         │
│  (Prometheus + Grafana +    │
│   Loki + Alertmanager)      │
└─────────────────────────────┘
```

### 4.3 New Components

| Component | Technology | Justification |
|---|---|---|
| Read replica | Supabase read replica or self-hosted | Offload analytics queries; improve read latency |
| Managed Redis | Upstash or Redis Cloud | Persistence, high availability, no ops burden |
| ClickHouse | Self-hosted or ClickHouse Cloud | Sub-second analytics on millions of rows |
| Second n8n worker | Docker container on API server | Parallel workflow execution |
| Monitoring server | Dedicated VPS | Isolate monitoring overhead from application servers |

### 4.4 Cost Estimate (Stage 2)

| Service | Est. monthly cost |
|---|---|
| Frontend server (4 vCPU / 16GB) | £40 – £80 |
| API server x2 (8 vCPU / 32GB each) | £160 – £320 |
| PostgreSQL primary + replica (Supabase) | £60 – £120 |
| Redis managed (Upstash or Redis Cloud) | £30 – £80 |
| ClickHouse Cloud (starter) | £50 – £100 |
| Monitoring server (2 vCPU / 8GB) | £20 – £40 |
| Object storage, email, AI APIs (scaling) | £500 – £1,500 |
| **Total estimate** | **£860 – £2,240/month** |

---

## 5. Target Architecture — Scale (Stage 3)

*Trigger: Stage 2 thresholds breached. Target: 20,000–200,000 MAU, £75k–£500k MRR*

### 5.1 Changes from Stage 2

| Change | Reason |
|---|---|
| Kubernetes (K8s) for container orchestration | Automated horizontal scaling, self-healing, rolling deploys |
| API auto-scaling (HPA) | Handle traffic spikes without manual intervention |
| Redis Cluster (3+ nodes) | Horizontal Redis scaling; eliminate single point of failure |
| n8n worker pool (5–20 instances) | Process thousands of jobs per hour in parallel |
| Global CDN for static assets (Cloudflare Pages or Vercel) | Sub-100ms global frontend delivery |
| Elasticsearch or Typesense for full-text search | Dedicated search engine; offload search from PostgreSQL |
| Distributed tracing (OpenTelemetry + Jaeger or Tempo) | Trace requests across services; diagnose latency issues |
| Message broker (Apache Kafka or AWS SQS) | Durable, high-throughput event streaming at scale |
| Database connection proxy (RDS Proxy or PgBouncer tier) | Handle thousands of concurrent connections efficiently |

### 5.2 Architecture Diagram

```
                    ┌────────────────────┐
                    │    Cloudflare      │
                    │  (Global CDN,      │
                    │   WAF, DDoS,       │
                    │   Load Balancer)   │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Kubernetes       │
                    │   Cluster          │
                    │                   │
                    │  ┌─────────────┐  │
                    │  │ Frontend    │  │
                    │  │ Pods (3–10) │  │
                    │  └─────────────┘  │
                    │                   │
                    │  ┌─────────────┐  │
                    │  │ API Pods    │  │
                    │  │ (5–20, HPA) │  │
                    │  └──────┬──────┘  │
                    │         │         │
                    │  ┌──────▼──────┐  │
                    │  │ n8n Workers │  │
                    │  │ (5–20 pods) │  │
                    │  └─────────────┘  │
                    └─────────┬──────────┘
                              │
          ┌───────────────────┼──────────────────────┐
          ▼                   ▼                       ▼
  ┌──────────────┐   ┌──────────────┐       ┌─────────────────┐
  │  PostgreSQL  │   │ Redis Cluster│       │  Kafka / SQS    │
  │  Primary +   │   │  (3+ nodes)  │       │  (Event stream) │
  │  2 Replicas  │   └──────────────┘       └─────────────────┘
  │  + PgBouncer │
  └──────┬───────┘
         │
  ┌──────▼───────┐   ┌──────────────┐       ┌─────────────────┐
  │  ClickHouse  │   │Elasticsearch │       │  OpenTelemetry  │
  │  (Analytics) │   │  (Search)    │       │  + Jaeger/Tempo  │
  └──────────────┘   └──────────────┘       │  (Tracing)      │
                                            └─────────────────┘
```

### 5.3 Kubernetes Setup

- **Cluster:** Managed Kubernetes (GKE, EKS, or Hetzner K8s — cost-driven choice)
- **Node pools:**
  - General purpose: API and frontend pods (auto-scaling, 2–20 nodes)
  - Compute-optimised: n8n worker pods (burstable, scale to zero when idle)
  - Stateful: databases and Redis (dedicated, no auto-scaling)
- **Horizontal Pod Autoscaler (HPA):** API pods scale based on CPU (> 70%) and request latency (p95 > 500ms)
- **Pod Disruption Budgets:** Minimum 2 API pods available at all times during rolling deploys
- **Helm charts:** All Kubernetes manifests managed as Helm charts, stored in `/infra/k8s/`

---

## 6. Target Architecture — Enterprise (Stage 4)

*Trigger: Stage 3 thresholds breached or enterprise customer requirements. Target: 200,000+ MAU, £500k+ MRR*

### 6.1 Changes from Stage 3

| Change | Reason |
|---|---|
| Multi-region deployment (2+ regions) | Data residency requirements; sub-50ms latency globally |
| Global load balancing (Cloudflare or AWS Global Accelerator) | Route users to nearest region |
| CockroachDB or Aurora Global for multi-region DB | Active-active replication across regions |
| Dedicated enterprise tenant infrastructure | VPC isolation for Enterprise customers |
| Service mesh (Istio or Linkerd) | mTLS between all services; advanced traffic management |
| Zero-trust network architecture | No implicit trust between services; all traffic authenticated |
| Dedicated compliance infrastructure (SOC 2, ISO 27001) | Enterprise procurement requirements |
| SLA-backed support infrastructure (PagerDuty, Statuspage) | Enterprise contract commitments |

### 6.2 Multi-Region Topology

```
                    ┌────────────────────┐
                    │  Cloudflare Global │
                    │   Load Balancer    │
                    └─────┬──────────┬───┘
                          │          │
               ┌──────────▼──┐  ┌───▼──────────┐
               │  EU Region  │  │  US Region   │
               │  (Frankfurt)│  │  (N. Virginia│
               │             │  │   / Oregon)  │
               │  K8s Cluster│  │  K8s Cluster │
               │  + DB Primary│  │  + DB Replica│
               └─────────────┘  └──────────────┘
                          │          │
                    ┌─────▼──────────▼────┐
                    │  Global Data Sync   │
                    │ (CockroachDB / Aurora│
                    │  Global Database)   │
                    └─────────────────────┘
```

---

## 7. Database Growth Strategy

### 7.1 Stage 1 — Single Instance (MVP)

- **PostgreSQL hosted by Supabase** (Pro plan)
- PgBouncer connection pooling enabled from day one
- Row Level Security (RLS) on all tables
- Partitioning for `usage_events` and `job_logs` by month
- Indexes defined at creation time for all foreign keys and query columns
- Daily automated backups to Cloudflare R2

### 7.2 Stage 2 — Read Replica

- **Trigger:** Read query latency > 200ms sustained, or primary CPU > 70%
- Add one Supabase read replica or self-hosted PostgreSQL replica via streaming replication
- Route all analytics queries, reporting queries, and non-critical reads to the replica
- Writes and auth-sensitive reads remain on the primary
- API service routes queries based on `ReadPreference` flag per query

```typescript
// Query routing convention
const db = readPreference === "replica"
  ? dbReadReplica
  : dbPrimary;
```

### 7.3 Stage 3 — Sharding Preparation

- **Trigger:** Primary write throughput > 5,000 TPS or storage > 2TB
- Evaluate sharding strategy: shard by `org_id` (horizontal) or by table type (vertical)
- Vertical sharding first: move `usage_events`, `job_logs`, and `audit_logs` to a dedicated PostgreSQL instance
- Introduce a query router service that directs queries to the correct shard

### 7.4 Analytics Offload — ClickHouse

- **Trigger:** PostgreSQL analytics query p95 > 1,000ms, or analytics queries consuming > 30% of DB CPU
- Deploy ClickHouse (self-hosted or ClickHouse Cloud)
- Migrate all aggregate analytics queries: viral score distributions, trend velocity calculations, usage reporting, engagement analytics over time
- ETL pipeline syncs data from PostgreSQL to ClickHouse every 15 minutes (Stage 2) or in real-time via Kafka (Stage 3)
- ClickHouse is append-only — no updates, no deletes (use soft deletes in PostgreSQL, filter in ClickHouse)

### 7.5 Database Schema Evolution Rules

- [ ] Never `DROP COLUMN` — add new columns, migrate data, then stop reading the old column
- [ ] Never rename columns — add new column with new name, dual-write, then deprecate old
- [ ] All migrations must be reversible (up + down)
- [ ] Zero-downtime migrations for all changes in production
- [ ] Large table alterations use `pg_repack` or online schema change tools
- [ ] Foreign keys on high-write tables are deferred until Stage 3 (PostgreSQL FK locks can impede throughput)

### 7.6 Backup & Recovery

| Stage | Backup frequency | Retention | Storage | RTO | RPO |
|---|---|---|---|---|---|
| Stage 1 | Daily | 30 days | Cloudflare R2 | < 1 hour | 24 hours |
| Stage 2 | Every 6 hours | 60 days | Cloudflare R2 + secondary | < 30 minutes | 6 hours |
| Stage 3 | Continuous WAL archiving | 90 days | Cross-region S3 | < 15 minutes | < 1 minute |
| Stage 4 | Continuous + PITR | 365 days | Multi-region | < 5 minutes | Near-zero |

---

## 8. Caching Strategy

### 8.1 Cache Layers

| Layer | Technology | What is cached | TTL |
|---|---|---|---|
| **AI response cache** | Redis | AI analysis outputs, keyed by `(prompt_version, sha256(input))` | 24 hours |
| **Feature flag cache** | Redis | Plan-based feature flags per organisation | 5 minutes |
| **Rate limit counters** | Redis | API request counts per key per window | Rolling window |
| **Usage counters** | Redis | Billable event counts per organisation per period | Until period reset |
| **YouTube quota counters** | Redis | Daily API unit consumption | Until midnight UTC |
| **Session tokens** | Redis | JWT refresh token metadata | 30 days |
| **Search results** | Redis | Top search queries (LRU eviction) | 10 minutes |
| **Trend snapshots** | Redis | Current trend list (refreshed by daily job) | 25 hours |
| **CDN cache** | Cloudflare | Static assets, Next.js static pages | 1 year (immutable) |
| **Next.js ISR** | Next.js cache | Statically-generated pages with revalidation | Per-page TTL |

### 8.2 Cache Invalidation Strategy

- **Time-based (TTL):** Default for most cached data. Simple and predictable.
- **Event-based invalidation:** When a video's viral score is recomputed, invalidate its cached analysis immediately.
- **Write-through:** Usage counters are incremented in Redis on write; PostgreSQL is updated asynchronously.
- **Cache stampede prevention:** Use Redis `SET NX` + lock pattern for high-concurrency cache misses on AI responses.

### 8.3 Redis Evolution

| Stage | Configuration | Why |
|---|---|---|
| Stage 1 | Single Redis instance, Docker, no persistence | Simplicity; cache misses are acceptable |
| Stage 2 | Managed Redis (Upstash or Redis Cloud), AOF + RDB persistence | Prevent queue data loss on restart |
| Stage 3 | Redis Cluster (3+ shards, 1 replica each) | Horizontal scaling; HA with automatic failover |
| Stage 4 | Redis Enterprise with geo-replication | Multi-region cache consistency |

### 8.4 Cache Key Convention

```
viralscopes:<resource>:<identifier>:<variant>

Examples:
viralscopes:ai:response:sha256abc123:prompt_v3
viralscopes:flags:org:01HXYZ123456789:professional
viralscopes:ratelimit:key:sha256keyabc:minute:1720000000
viralscopes:trends:snapshot:2026-07-20
viralscopes:quota:youtube:2026-07-20
```

All cache keys are namespaced to prevent collisions in shared Redis instances.

---

## 9. CDN Strategy

### 9.1 Stage 1 — Cloudflare (MVP)

- Cloudflare sits in front of all traffic (DNS proxied)
- **Static assets** (JS, CSS, images, fonts): cached at Cloudflare edge with immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- **Next.js pages:** Dynamic pages bypass CDN (Cache-Control: no-store). Statically generated pages (privacy, terms, changelog) cached with `stale-while-revalidate`
- **API responses:** Not cached at CDN. Rate limiting and auth happen server-side.
- **Cloudflare WAF:** Managed rule sets enabled. Custom rules for auth endpoint rate limiting.
- **DDoS protection:** Cloudflare Magic Transit or Pro plan automatic mitigation

### 9.2 Stage 2 — Cloudflare + Next.js ISR

- Enable **Incremental Static Regeneration (ISR)** for trend snapshot pages and opportunity ranking pages
- These pages change at most once per hour (driven by the trend detection workflow)
- ISR revalidates automatically — users always see data no older than 1 hour with no server hit for most requests
- Cloudflare caches the ISR output at the edge

### 9.3 Stage 3 — Edge Functions

- Move lightweight API endpoints (search autocomplete, feature flag lookups) to **Cloudflare Workers** or **Next.js Edge Runtime**
- These run at the edge — sub-10ms latency for cached queries globally
- AI analysis endpoints remain on the origin API servers (too compute-heavy for edge)

### 9.4 Thumbnail & Export CDN

- Video thumbnails downloaded during analysis are stored in Cloudflare R2
- Served via a `cdn.viralscopes.io` subdomain with Cloudflare edge caching
- Exports (PDF, CSV, Excel) served via signed S3 URLs with 24-hour expiry — not cached at CDN (one-time downloads)

---

## 10. Queue & Background Job Strategy

### 10.1 Stage 1 — BullMQ + Single n8n Instance

- **BullMQ** (Redis-backed) is the job queue between the API and n8n
- API enqueues jobs; n8n polls and executes them
- Single n8n instance with one worker thread per workflow type
- Max concurrency: ~10–20 simultaneous workflow executions
- Dead-letter queue for failed jobs after 3 retries
- All job executions logged to `job_logs`

### 10.2 Stage 2 — Multiple n8n Workers

- **Trigger:** Queue backlog consistently > 500 pending jobs
- Add a second n8n worker instance connected to the same BullMQ queues
- Each worker handles different workflow types (segregated queues):
  - High-priority queue: Alert dispatch, viral score computation
  - Standard queue: AI analysis pipeline, thumbnail analysis
  - Low-priority queue: Trend detection, channel intelligence, opportunity engine
- Workers auto-restart on failure via Docker restart policy

### 10.3 Stage 3 — Kafka Event Streaming

- **Trigger:** Job volume > 100,000/day or need for event replay capability
- Replace BullMQ with **Apache Kafka** (or AWS SQS + SNS for managed option)
- Benefits:
  - Durable message retention (replay events for debugging or reprocessing)
  - Multiple consumer groups (n8n workers, ClickHouse ETL, audit log service)
  - Guaranteed ordering within a partition (useful for sequential video pipeline stages)
- n8n workers become Kafka consumers
- API publishes events to Kafka topics; n8n subscribes

```
API → Kafka Topic: video.discovered
                 → n8n Consumer Group: metadata-pipeline
                 → Kafka Topic: video.metadata-ready
                 → n8n Consumer Group: ai-analysis-pipeline
                 → Kafka Topic: video.analysis-complete
                 → n8n Consumer Group: viral-score-engine
                                    → ClickHouse ETL Consumer
```

### 10.4 Queue Naming Convention

```
viralscopes:<priority>:<workflow-name>

High priority:
  viralscopes:high:alert-dispatch
  viralscopes:high:viral-score-engine

Standard priority:
  viralscopes:standard:ai-analysis
  viralscopes:standard:thumbnail-analysis
  viralscopes:standard:transcript-pipeline

Low priority:
  viralscopes:low:trend-detection
  viralscopes:low:channel-intelligence
  viralscopes:low:opportunity-engine
```

### 10.5 Dead-Letter Queue Strategy

| Attempt | Delay | Action |
|---|---|---|
| 1st retry | Immediate | Retry with same payload |
| 2nd retry | 30 seconds | Retry with same payload |
| 3rd retry | 5 minutes | Retry with same payload |
| After 3 failures | — | Write to `dead_letter_jobs`, send admin notification |
| Admin review | — | Inspect payload, fix root cause, retry manually |
| 30 days unresolved | — | Auto-archive (per data retention policy) |

---

## 11. Object Storage Strategy

### 11.1 Bucket Structure

```
viralscopes-production/
├── thumbnails/              # Downloaded video thumbnails (used for AI analysis)
│   └── {video_id}.jpg
├── exports/                 # User-requested data exports
│   └── {org_id}/{export_id}/{filename}.{csv|xlsx|json|pdf}
├── reports/                 # Scheduled reports (Post-MVP)
│   └── {org_id}/weekly/{date}.pdf
└── prompt-cache/            # Cached AI prompt outputs (overflow from Redis)
    └── {sha256_key}.json
```

### 11.2 Access Control

- All buckets are **private** — no public read access
- Thumbnails are served via signed URLs with 1-hour expiry (used by the AI analysis workflow internally)
- Exports are served via signed URLs with 24-hour expiry (user-facing download links)
- The API generates signed URLs server-side — the frontend never holds long-lived storage credentials

### 11.3 Lifecycle Policies

| Folder | Retention | Action |
|---|---|---|
| `thumbnails/` | 7 days | Auto-delete after analysis is complete |
| `exports/` | 7 days | Auto-delete; user notified to download within the window |
| `reports/` | 90 days | Auto-delete old reports |
| `prompt-cache/` | 30 days | Auto-delete (Redis is the primary cache; this is overflow) |

### 11.4 Provider Evolution

| Stage | Provider | Reason |
|---|---|---|
| Stage 1 (dev) | MinIO (local Docker) | Free, S3-compatible, no egress costs |
| Stage 1 (prod) | Cloudflare R2 | No egress fees; significant cost savings vs S3 at this scale |
| Stage 2+ | Cloudflare R2 (primary) + AWS S3 (backup) | Cross-provider redundancy for critical exports |
| Stage 4 | Multi-region R2 or S3 with cross-region replication | Data residency requirements |

---

## 12. Search Infrastructure

### 12.1 Stage 1 — PostgreSQL Full-Text Search

- PostgreSQL `tsvector` and `tsquery` for full-text search on video titles, descriptions, and topics
- GIN index on `tsvector` columns for acceptable query performance
- Adequate for: < 1 million video records, < 100 concurrent search requests
- **Limitation:** Cannot rank by relevance + viral score simultaneously without complex queries

### 12.2 Stage 2 — Typesense

- **Trigger:** Search query p95 > 500ms, or > 1 million video records
- Deploy **Typesense** (self-hosted, single node) as a dedicated search engine
- Sync video records from PostgreSQL to Typesense via an n8n ETL workflow (every 15 minutes)
- Typesense handles: fuzzy matching, typo tolerance, faceted filtering, multi-field ranking
- API routes search queries to Typesense; PostgreSQL is the source of truth

### 12.3 Stage 3 — Typesense Cluster or Elasticsearch

- **Trigger:** Typesense single node saturated (> 10,000 search requests/minute)
- Scale Typesense to a 3-node cluster (built-in raft consensus)
- Or migrate to **Elasticsearch** for more complex ranking customisation (viral score boosting, recency decay)
- Real-time sync via Kafka (replacing the 15-minute ETL)

---

## 13. Monitoring & Observability

### 13.1 Stage 1 — Prometheus + Grafana + Loki

**Metrics (Prometheus):**
- API: request count, latency histograms (p50/p95/p99), error rate, active connections
- n8n: workflow execution count, success/failure rate, queue depth, execution duration
- PostgreSQL: connection count, query latency, cache hit ratio, replication lag
- Redis: memory usage, hit rate, connected clients, queue length
- System: CPU, memory, disk I/O, network throughput per container

**Dashboards (Grafana):**

| Dashboard | Key panels |
|---|---|
| API Performance | Request rate, p95 latency, error rate, top endpoints by latency |
| Queue Health | Queue depth per priority, job success/failure rate, dead-letter count |
| Database Metrics | Connection pool usage, slow queries, replication lag, index hit ratio |
| YouTube Quota | Daily units consumed vs limit, per-org quota usage |
| Business Metrics | New signups, active organisations, plan distribution, MRR trend |
| AI Pipeline | Cache hit rate, AI API call count, cost estimate, schema validation failures |

**Logs (Loki):**
- All services emit structured JSON logs to stdout
- Promtail or Docker logging driver forwards to Loki
- Grafana Explore for ad hoc log queries
- Log-based alerts for: error log rate spike, specific error codes, auth failure bursts

### 13.2 Stage 2 — Add Alertmanager + PagerDuty

- **Alertmanager** routes Prometheus alerts to the correct destination:
  - P1 (service down, data loss risk) → PagerDuty → on-call engineer
  - P2 (performance degradation, quota warning) → Slack #alerts channel
  - P3 (informational) → Slack #monitoring channel
- Alert deduplication and grouping to prevent alert storms
- Silence rules for maintenance windows

### 13.3 Stage 3 — Distributed Tracing

- **OpenTelemetry SDK** instrumented in all services (API, n8n workflows, frontend server)
- **Jaeger** or **Grafana Tempo** as the trace backend
- Traces show: end-to-end request path, time spent in each service, DB query timing, AI API call latency
- Correlation IDs link logs, metrics, and traces for a single request
- Sampling rate: 100% for errors, 10% for normal traffic

### 13.4 Stage 4 — SLA Monitoring + Statuspage

- **Uptime monitoring** (Better Uptime or Pingdom) from external locations globally
- **Statuspage** (Atlassian or Cachet self-hosted) for public incident communication
- SLA reporting dashboard for Enterprise customers
- Automated incident creation in PagerDuty when uptime monitors detect failures

---

## 14. Logging Strategy

### 14.1 Log Format

All logs are **structured JSON** using Pino (API) and standard Next.js logging (frontend):

```json
{
  "level": "info",
  "time": "2026-07-20T10:30:00.000Z",
  "correlationId": "01HXYZ123456789ABCDEF",
  "service": "api",
  "version": "1.2.3",
  "orgId": "01HX...",
  "userId": "01HY...",
  "msg": "Viral score computed",
  "videoId": "abc123",
  "viralScore": 87,
  "durationMs": 142
}
```

### 14.2 Log Levels

| Level | When to use | Production enabled |
|---|---|---|
| `error` | System fault; requires immediate attention | Yes |
| `warn` | Recoverable issue; degraded state | Yes |
| `info` | Business event; significant state change | Yes |
| `debug` | Developer context; variable dumps | No (staging only) |
| `trace` | Detailed execution flow | No (local dev only) |

### 14.3 What Must Never Be Logged

- Passwords, tokens, or API keys (even hashed)
- Personal email addresses or names in non-audit contexts
- Credit card numbers or payment details
- Raw AI prompt content containing user data
- Stack traces in production API responses (logs only, never responses)

### 14.4 Log Retention

| Stage | Retention | Storage |
|---|---|---|
| Stage 1 | 30 days | Loki local volume |
| Stage 2 | 60 days | Loki + object storage (Loki compaction to R2) |
| Stage 3 | 90 days | Loki cluster with S3 backend |
| Stage 4 | 365 days (compliance) | Loki cluster, cross-region replication |

---

## 15. CI/CD Evolution

### 15.1 Stage 1 — GitHub Actions + Coolify

```
Pull Request →
  [lint] → [type-check] → [unit tests] → [integration tests] → [security scan]

Merge to main →
  [build Docker images] → [push to registry] →
  [deploy to staging via Coolify webhook] →
  [run smoke tests on staging]

Manual approval →
  [deploy to production via Coolify webhook] →
  [run smoke tests on production] →
  [notify Slack]
```

- Build time target: < 10 minutes for full CI pipeline
- Docker image registry: GitHub Container Registry (GHCR) or Docker Hub
- Rollback: Coolify supports one-click rollback to previous image version

### 15.2 Stage 2 — Parallel Test Execution + Preview Environments

- Split test suite into parallel shards (4x shards for unit tests, 2x for integration)
- Reduce CI time to < 5 minutes per PR
- **Preview environments:** Each PR auto-deploys to a temporary staging URL for review
- Preview environments auto-deleted after PR is merged or closed

### 15.3 Stage 3 — GitOps + Kubernetes CD

- Adopt **GitOps** with ArgoCD or Flux for Kubernetes deployments
- All K8s manifests stored in `/infra/k8s/` — ArgoCD auto-syncs to cluster
- **Progressive delivery:** Canary deployments (10% → 50% → 100% traffic) for API changes
- **Automated rollback:** ArgoCD rolls back automatically if error rate exceeds threshold post-deploy
- Feature flags used for large feature releases (decouple deploy from release)

### 15.4 Stage 4 — Multi-Region CD

- Deployments propagate region by region (EU first, then US)
- Each region has an independent CD pipeline
- Blue-green deployments at the region level
- Global traffic gradually shifted to new version using Cloudflare Load Balancing weights

---

## 16. Security Evolution

### 16.1 Stage 1 — Baseline Security

- [ ] HTTPS enforced; TLS 1.2 minimum; HSTS enabled
- [ ] Helmet.js security headers (CSP, X-Frame-Options, Referrer-Policy)
- [ ] CORS locked to allowed origins
- [ ] CSRF protection on browser-session endpoints
- [ ] Input validation (Zod) on all API endpoints
- [ ] XSS sanitisation on all user-generated content
- [ ] SQL injection prevention via ORM parameterised queries
- [ ] API keys stored as `sha256(key)` only
- [ ] Secrets injected at runtime by Coolify — never in code
- [ ] `npm audit` in CI — high/critical CVEs block the build
- [ ] GDPR compliance (deletion, export, consent)
- [ ] RLS on all database tables
- [ ] Brute force protection (account lockout, rate limiting on auth)
- [ ] Webhook signature verification on all incoming webhooks

### 16.2 Stage 2 — Enhanced Security

- [ ] Web Application Firewall (WAF) rules tuned based on observed attack patterns
- [ ] Bot detection and CAPTCHA on auth endpoints
- [ ] Anomaly detection for unusual API usage patterns (sudden quota spikes, unusual geographic access)
- [ ] Dependency vulnerability monitoring (Snyk or GitHub Advanced Security)
- [ ] Penetration testing (external, annual)
- [ ] Bug bounty programme launched

### 16.3 Stage 3 — Defence in Depth

- [ ] Zero-trust network architecture (Cloudflare Access or Tailscale for internal services)
- [ ] Service-to-service mTLS via Istio or Linkerd service mesh
- [ ] Secrets management with HashiCorp Vault (replace Coolify env injection at scale)
- [ ] Runtime security monitoring (Falco for container anomaly detection)
- [ ] SIEM integration (Datadog or Elastic SIEM) for security event correlation
- [ ] SOC 2 Type II audit initiated

### 16.4 Stage 4 — Enterprise Compliance

- [ ] SOC 2 Type II certification
- [ ] ISO 27001 certification
- [ ] GDPR Data Protection Officer (DPO) appointed
- [ ] Enterprise SSO (SAML 2.0, OIDC) for Enterprise customers
- [ ] Data residency controls (EU data stays in EU, US data stays in US)
- [ ] Customer-managed encryption keys (CMEK) for Enterprise tier
- [ ] Annual third-party penetration testing
- [ ] Formal incident response plan with documented runbooks

---

## 17. Disaster Recovery & High Availability

### 17.1 Failure Modes & Recovery

| Component | Failure mode | Detection | Recovery procedure | RTO |
|---|---|---|---|---|
| API server | Process crash | Health check fails | Docker restart policy (immediate); Coolify redeploys | < 2 min |
| API server | Full server failure | Uptime monitor | Deploy to backup server via Coolify; update DNS | < 30 min |
| PostgreSQL (Supabase) | Service degradation | DB health check fails | Fail over to read replica (read-only mode); contact Supabase support | < 15 min |
| Redis | Process crash | Health check fails | Docker restart; queue jobs retry from BullMQ persistence | < 5 min |
| n8n | Worker crash | Job log gap | Docker restart; jobs retry via BullMQ | < 5 min |
| Cloudflare R2 | Storage unavailable | Export requests fail | Serve cached exports from local backup; retry uploads when restored | < 60 min |
| Stripe | API unavailable | Payment webhook fails | Grace period activates automatically; no customer impact | No action needed |
| OpenAI / Anthropic | API unavailable | AI workflow failures | Switch to fallback model (Claude ↔ GPT-4o); cache serves existing analyses | < 10 min |
| YouTube Data API | Quota exhausted | 403 responses | Switch to RapidAPI / Apify fallback; admin notified | < 5 min |

### 17.2 Backup Verification

- Monthly automated test restore from backup to a staging environment
- Test restore is logged and any failures are treated as P1 incidents
- Restore time is measured and compared against RTO targets

### 17.3 High Availability Progression

| Stage | HA approach | Availability target |
|---|---|---|
| Stage 1 | Single server, Docker restart policy, daily backups | 99.5% |
| Stage 2 | Separated services, managed Redis HA, DB read replica | 99.9% |
| Stage 3 | Kubernetes multi-node, Redis Cluster, DB with auto-failover | 99.95% |
| Stage 4 | Multi-region, active-active, zero single point of failure | 99.99% |

### 17.4 Runbook Library

All recovery procedures are documented in `/docs/guides/runbooks/`:

- `RB-001-api-server-recovery.md`
- `RB-002-database-failover.md`
- `RB-003-redis-recovery.md`
- `RB-004-n8n-workflow-recovery.md`
- `RB-005-youtube-quota-exhausted.md`
- `RB-006-ai-provider-failover.md`
- `RB-007-data-breach-response.md`

---

## 18. Cost Optimisation

### 18.1 AI Cost Management (Critical)

AI API costs are the largest variable cost driver. These controls are mandatory from day one:

| Control | Description | Expected saving |
|---|---|---|
| **Tiered analysis** | Only high-engagement videos (> 100k views) get full AI analysis; lower videos get metadata-only scoring | 60–80% reduction in AI calls |
| **Response caching** | Cache all AI outputs by `(prompt_version, sha256(input))`. Same input never re-processed. | 40–70% hit rate at scale |
| **Batch processing** | Batch trend clustering calls (10 topics per API call) instead of one call per topic | 90% reduction in trend clustering cost |
| **Model selection** | Use Claude Haiku or GPT-4o mini for simple classification tasks; full models only for strategic analysis | 50–70% cost reduction on classification |
| **Cost alerts** | Grafana alert when daily AI spend exceeds £50 | Prevents runaway costs |

### 18.2 Infrastructure Cost Controls

| Control | Description |
|---|---|
| **Reserved instances** | Commit to 1-year reserved pricing for consistently-used servers once usage is stable (40–60% saving) |
| **Spot instances** | Use spot/preemptible instances for n8n worker pods that can tolerate interruption |
| **Cloudflare R2** | R2 has no egress fees (vs AWS S3 egress at $0.09/GB) — significant saving at scale |
| **Auto-scaling** | K8s HPA scales down during low-traffic hours (nights/weekends) — typically 40% of peak |
| **Log retention** | Aggressive log compaction and tiered storage (hot → warm → cold) |
| **Redis eviction policy** | LRU eviction on search result cache — Redis memory stays bounded |

### 18.3 Cost Review Cadence

- **Weekly:** AI API cost vs previous week; alert if > 20% increase week-over-week
- **Monthly:** Full infrastructure cost review; cost per MAU calculation; cost optimisation opportunities identified
- **Quarterly:** Reserved instance renewal decisions; vendor contract renegotiations

---

## 19. Multi-Region Strategy

### 19.1 When to Go Multi-Region

Multi-region deployment is triggered by:
- Enterprise customer data residency requirements (EU data must stay in EU)
- API latency > 300ms for users in a secondary region
- MRR > £300k (sufficient revenue to justify the operational complexity)

### 19.2 Region Selection

| Phase | Regions | Rationale |
|---|---|---|
| Stage 1–3 | EU (Frankfurt) | Primary market; GDPR jurisdiction |
| Stage 4 initial | EU (Frankfurt) + US-East (N. Virginia) | US is second-largest English-speaking market |
| Stage 4 expansion | + APAC (Singapore or Tokyo) | Asia-Pacific creator market |

### 19.3 Data Residency Architecture

- **EU customers:** Data stored exclusively in EU region (Frankfurt). Enforced at org creation.
- **US customers:** Data stored in US region. Opt-in to EU storage available.
- **Cross-region data:** Trend data and aggregated analytics (non-PII) are replicated globally for low-latency reads.
- **AI analysis:** AI API calls may cross regions (OpenAI, Anthropic are US-based). Data Processing Agreements (DPAs) cover this transfer.

### 19.4 Global Traffic Routing

```
User in London → Cloudflare → EU cluster (Frankfurt)
User in New York → Cloudflare → US cluster (N. Virginia)
User in Tokyo → Cloudflare → APAC cluster (Singapore) → or EU if no APAC cluster yet
```

Cloudflare Load Balancing with health checks routes users to the nearest healthy region. If a region is unhealthy, traffic is failed over to the next nearest region automatically.

---

## 20. Infrastructure Milestones

| Milestone | Stage | Trigger / Target date | Deliverable |
|---|---|---|---|
| IM-01 | 1 | Week 2 | Docker Compose dev environment: one-command startup |
| IM-02 | 1 | Week 3 | CI/CD pipeline: lint → test → build → staging deploy |
| IM-03 | 1 | Week 3 | Monitoring stack: Prometheus + Grafana + Loki live |
| IM-04 | 1 | Week 3 | Health check endpoints on all services |
| IM-05 | 1 | Week 20 | Production deployment on single VPS via Coolify |
| IM-06 | 1 | Week 20 | Daily database backups with verified test restore |
| IM-07 | 1 | Week 20 | Cloudflare CDN and DDoS protection active |
| IM-08 | 2 | Stage 1 trigger | PostgreSQL read replica provisioned and query routing active |
| IM-09 | 2 | Stage 1 trigger | Managed Redis with AOF persistence and HA |
| IM-10 | 2 | Stage 1 trigger | Second n8n worker instance; segregated queues |
| IM-11 | 2 | Stage 1 trigger | Dedicated monitoring server |
| IM-12 | 2 | 1M+ video records | ClickHouse deployed; analytics queries migrated |
| IM-13 | 2 | Stage 2 trigger | Alertmanager + PagerDuty integration |
| IM-14 | 2 | Stage 2 trigger | Typesense deployed; full-text search migrated |
| IM-15 | 3 | Stage 2 trigger | Kubernetes cluster provisioned |
| IM-16 | 3 | Stage 2 trigger | HPA configured for API pods |
| IM-17 | 3 | Stage 2 trigger | Redis Cluster (3 nodes) |
| IM-18 | 3 | Stage 3 trigger | Kafka event streaming replaces BullMQ |
| IM-19 | 3 | Stage 3 trigger | OpenTelemetry distributed tracing (Jaeger/Tempo) |
| IM-20 | 3 | Stage 3 trigger | SOC 2 audit initiated |
| IM-21 | 4 | Enterprise requirement | Multi-region deployment (EU + US) |
| IM-22 | 4 | Enterprise requirement | Data residency controls enforced per org |
| IM-23 | 4 | Enterprise requirement | SOC 2 Type II certification achieved |
| IM-24 | 4 | Enterprise requirement | Customer-managed encryption keys (CMEK) |

---

*This document is updated whenever a new infrastructure component is added, a stage upgrade is triggered, or architectural decisions change. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [ROADMAP.md](./ROADMAP.md) — Development phases that drive infrastructure requirements
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — How infrastructure configuration is organised in the repo
- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards including infrastructure-as-code rules
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current infrastructure stage and active milestones
