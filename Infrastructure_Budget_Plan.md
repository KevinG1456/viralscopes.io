# Infrastructure_Budget_Plan.md

# ViralScopes.io — Infrastructure Budget Plan

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Currency:** GBP (£) — converted from USD at £1 = $1.27 where applicable
> **Cross-references:** [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) · [Deployment_Guide.md](./Deployment_Guide.md)

---

> **Disclaimer:** All costs are estimates based on publicly available pricing at the time of writing (July 2026). Actual costs will vary based on usage patterns, provider pricing changes, negotiated discounts, and caching effectiveness. Assumptions are clearly labelled throughout.

---

## Table of Contents

1. [Budget Philosophy](#1-budget-philosophy)
2. [Infrastructure Overview](#2-infrastructure-overview)
3. [Cloud Provider Assumptions](#3-cloud-provider-assumptions)
4. [Development Environment Costs](#4-development-environment-costs)
5. [Staging Environment Costs](#5-staging-environment-costs)
6. [Production Environment — Stage 1 (MVP)](#6-production-environment--stage-1-mvp)
7. [Detailed Cost Breakdown — Stage 1](#7-detailed-cost-breakdown--stage-1)
8. [Production Environment — Stage 2 (Growth)](#8-production-environment--stage-2-growth)
9. [Production Environment — Stage 3 (Scale)](#9-production-environment--stage-3-scale)
10. [AI & API Costs](#10-ai--api-costs)
11. [Scaling Cost Projections](#11-scaling-cost-projections)
12. [Budget by User Growth Milestone](#12-budget-by-user-growth-milestone)
13. [Cost Optimisation Strategies](#13-cost-optimisation-strategies)
14. [Break-Even Infrastructure Analysis](#14-break-even-infrastructure-analysis)
15. [Annual Cost Summary](#15-annual-cost-summary)

---

## 1. Budget Philosophy

### Principles

1. **Validate before scaling.** Infrastructure is sized for the current stage. We do not pre-pay for capacity we do not yet need.
2. **Variable costs are the risk.** AI API costs are the largest variable expense and must be actively managed from day one through caching and tiered analysis.
3. **Infrastructure cost < 20% of MRR.** This is the target ratio at every stage. If infrastructure costs exceed 20% of MRR for two consecutive months, a cost review is mandatory.
4. **Track cost per customer.** Monthly infrastructure cost per paying customer should decline as the customer base grows (economies of scale).
5. **Every line item is justified.** No service is provisioned without a documented reason and a usage estimate.

### Key Cost Drivers

| Driver                           | Category           | Controllability          | Risk level |
| -------------------------------- | ------------------ | ------------------------ | ---------- |
| AI API calls (OpenAI, Anthropic) | Variable           | High (caching + tiering) | High       |
| YouTube API quota tier           | Fixed (above free) | Medium                   | Medium     |
| VPS / compute                    | Fixed              | Low                      | Low        |
| Database (Supabase)              | Fixed + variable   | Low                      | Low        |
| Object storage egress            | Variable           | Medium                   | Low        |
| Email volume (SendGrid)          | Variable           | Low                      | Low        |

---

## 2. Infrastructure Overview

### Stage 1 — MVP (Single Server)

All services run on a single VPS managed by Coolify. This is appropriate for 0–2,000 MAU.

```
┌────────────────────────────────────────────────────┐
│           Single VPS (Hetzner / DigitalOcean)      │
│               8 vCPU · 32GB RAM · 500GB NVMe       │
│                                                    │
│  Traefik · Next.js · Fastify API · n8n · Redis     │
│  Prometheus · Grafana · Loki · MinIO (dev)         │
└────────────────────────────────────────────────────┘
         │                    │
   Supabase (hosted)    Cloudflare R2
   PostgreSQL           (Object Storage)
```

### External SaaS Services (All Stages)

| Service           | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| Supabase          | PostgreSQL hosting, Auth, PgBouncer, automated backups |
| Cloudflare        | CDN, WAF, DDoS, DNS, R2 object storage                 |
| SendGrid / Resend | Transactional email                                    |
| Stripe            | Payment processing                                     |
| OpenAI            | AI vision and structured extraction                    |
| Anthropic         | AI strategic analysis and recommendations              |
| YouTube Data API  | Video discovery and metadata                           |
| GitHub            | Repository, Actions CI/CD                              |

---

## 3. Cloud Provider Assumptions

### Primary VPS Provider: Hetzner Cloud (Stage 1–2)

Hetzner offers the best price/performance ratio for European-hosted infrastructure. All Stage 1 compute costs are based on Hetzner pricing.

| Hetzner server    | vCPU    | RAM   | Storage | Monthly |
| ----------------- | ------- | ----- | ------- | ------- |
| CX32              | 4 vCPU  | 8 GB  | 80 GB   | £4.50   |
| CX42              | 8 vCPU  | 16 GB | 160 GB  | £15.00  |
| CX52              | 16 vCPU | 32 GB | 320 GB  | £30.00  |
| CCX23 (dedicated) | 4 vCPU  | 32 GB | 360 GB  | £46.00  |
| CCX33 (dedicated) | 8 vCPU  | 32 GB | 240 GB  | £55.00  |
| CCX43 (dedicated) | 16 vCPU | 64 GB | 360 GB  | £100.00 |

_`[ASSUMPTION]` Hetzner pricing as of July 2026. Prices subject to change._

### Alternative: DigitalOcean or Vultr

If Hetzner is unavailable or a US region is required, DigitalOcean or Vultr offer similar pricing with US data centre options. Costs approximately 10–20% higher than Hetzner equivalent.

### Managed Database: Supabase

| Supabase plan | Storage      | Connections | Monthly       |
| ------------- | ------------ | ----------- | ------------- |
| Free          | 500 MB       | 60          | £0            |
| Pro           | 8 GB         | 120         | £20           |
| Pro + Add-ons | Configurable | 200         | £20 + add-ons |
| Team          | Custom       | 400         | £350+         |

_`[ASSUMPTION]` Supabase Pro is sufficient for Stage 1. Read replica adds ~£75/month at Stage 2._

---

## 4. Development Environment Costs

The development environment runs entirely on developer machines using Docker Compose. There are no cloud costs for local development.

| Item                        | Cost         | Notes                                                               |
| --------------------------- | ------------ | ------------------------------------------------------------------- |
| Local Docker (dev machines) | £0           | Runs on developer laptops                                           |
| GitHub repository           | £0           | Free for public repos or included in team plan                      |
| GitHub Actions (CI minutes) | £0–£16/month | 2,000 minutes/month free on GitHub Free; Team plan £3.50/user/month |
| Supabase (local dev)        | £0           | Supabase CLI runs locally via Docker                                |
| MinIO (local S3)            | £0           | Runs in Docker Compose                                              |
| n8n (local)                 | £0           | Runs in Docker Compose                                              |

**Total development environment cost: £0–£16/month**

_Primary cost is GitHub Actions minutes if the free tier is exceeded. With efficient CI pipelines (< 5 min per run, < 20 PRs/day), the free tier is sufficient for a team of 1–3 engineers._

---

## 5. Staging Environment Costs

The staging environment mirrors production but uses smaller server sizes and free-tier external services where possible.

| Item                       | Spec                            | Monthly cost |
| -------------------------- | ------------------------------- | ------------ |
| Staging VPS (Hetzner CX32) | 4 vCPU, 8GB RAM                 | £4.50        |
| Supabase (free tier)       | 500 MB, 60 connections          | £0           |
| Cloudflare R2              | < 10 GB storage, minimal egress | £0–£2        |
| SendGrid (free tier)       | 100 emails/day                  | £0           |
| Stripe (test mode)         | —                               | £0           |
| GitHub Actions (shared)    | Shared with dev                 | £0           |

**Total staging environment cost: £4.50–£6.50/month**

**Annual staging cost: £54–£78/year**

_`[ASSUMPTION]` Staging uses Stripe test mode, so no payment fees apply. All AI API calls in staging use a budget cap of £20/month._

---

## 6. Production Environment — Stage 1 (MVP)

Stage 1 is a single-server deployment appropriate for 0–2,000 MAU and up to £15,000 MRR.

### Server Specification

| Resource  | Specification                  | Reason                                                                      |
| --------- | ------------------------------ | --------------------------------------------------------------------------- |
| Server    | Hetzner CCX33 (dedicated vCPU) | Dedicated vCPUs prevent noisy-neighbour issues for consistent API latency   |
| vCPU      | 8 dedicated                    | Next.js (2), Fastify API (2), n8n (2), Redis + monitoring (2)               |
| RAM       | 32 GB                          | Redis cache (4GB), PostgreSQL connections, n8n workflows, Node.js processes |
| Storage   | 240 GB NVMe SSD                | Database volumes, n8n data, Loki logs, Prometheus metrics                   |
| Bandwidth | 20 TB included                 | More than sufficient for Stage 1                                            |
| Location  | Hetzner Germany (EU)           | GDPR data residency, low latency for UK/EU users                            |

_`[ASSUMPTION]` A dedicated vCPU server is chosen over shared vCPU to ensure consistent API response times. The CCX33 costs ~£55/month vs ~£15/month for the shared CX52. The additional cost is justified for a production SaaS._

---

## 7. Detailed Cost Breakdown — Stage 1

### 7.1 Compute

| Service                        | Specification                          | Monthly cost | Annual cost |
| ------------------------------ | -------------------------------------- | ------------ | ----------- |
| Production VPS (Hetzner CCX33) | 8 vCPU dedicated, 32GB RAM, 240GB NVMe | £55.00       | £660.00     |
| Coolify licence                | Self-hosted PaaS (installed on VPS)    | £0           | £0          |
| **Compute subtotal**           |                                        | **£55.00**   | **£660.00** |

### 7.2 Database (Supabase)

| Service                           | Specification                                  | Monthly cost         | Annual cost |
| --------------------------------- | ---------------------------------------------- | -------------------- | ----------- |
| Supabase Pro                      | 8GB storage, 120 connections, daily backups    | £20.00               | £240.00     |
| Supabase compute add-on           | Dedicated compute (1 vCPU, 2GB RAM for the DB) | £7.00                | £84.00      |
| Point-in-time recovery (optional) | 7-day PITR window                              | £0 (included in Pro) | £0          |
| **Database subtotal**             |                                                | **£27.00**           | **£324.00** |

_`[ASSUMPTION]` The Supabase compute add-on is needed to prevent PostgreSQL from competing for resources with other services on the shared Pro plan compute._

### 7.3 Object Storage (Cloudflare R2)

| Usage                                  | Monthly estimate | Unit cost                  | Monthly cost |
| -------------------------------------- | ---------------- | -------------------------- | ------------ |
| Storage (thumbnails, exports, reports) | 50 GB            | £0.013/GB                  | £0.65        |
| Class A operations (uploads, lists)    | 500,000          | £3.50/million              | £1.75        |
| Class B operations (downloads)         | 1,000,000        | £0.28/million              | £0.28        |
| Egress (to internet)                   | 0 GB             | £0 (R2 has no egress fees) | £0           |
| **Object storage subtotal**            |                  |                            | **£2.68**    |

_`[ASSUMPTION]` R2 is chosen specifically for zero egress fees. This is material at scale — AWS S3 would charge $0.09/GB egress._

### 7.4 CDN & DNS (Cloudflare)

| Service                                     | Specification                                     | Monthly cost | Annual cost |
| ------------------------------------------- | ------------------------------------------------- | ------------ | ----------- |
| Cloudflare Pro plan                         | WAF, enhanced DDoS, analytics, image optimisation | £18.00       | £216.00     |
| Domain registration (viralscopes.io)        | Annual renewal                                    | £1.00        | £12.00      |
| Additional domains (app., api., cdn., n8n.) | Subdomains (free on Cloudflare)                   | £0           | £0          |
| SSL certificates                            | Let's Encrypt via Traefik (automated)             | £0           | £0          |
| **CDN & DNS subtotal**                      |                                                   | **£19.00**   | **£228.00** |

### 7.5 Email (Transactional)

| Service                | Option A: SendGrid              | Option B: Resend                |
| ---------------------- | ------------------------------- | ------------------------------- |
| Free tier              | 100 emails/day                  | 3,000 emails/month              |
| Paid tier (Essentials) | £13.50/month (50k emails/month) | £17.00/month (50k emails/month) |
| DKIM/SPF               | Included                        | Included                        |
| Dedicated IP           | £23.50/month add-on             | Not available at this tier      |

**Email cost at Stage 1:** £0–£13.50/month (free tier until > 3,000 emails/month)

_`[ASSUMPTION]` With ~3,000 registered users generating ~1 verification email, 1 welcome email, and occasional alerts = approximately 6,000–10,000 emails/month. Paid tier required from launch._

| Service                                | Monthly cost | Annual cost |
| -------------------------------------- | ------------ | ----------- |
| SendGrid Essentials (50k emails/month) | £13.50       | £162.00     |
| **Email subtotal**                     | **£13.50**   | **£162.00** |

### 7.6 Monitoring (Self-Hosted)

Prometheus, Grafana, and Loki are self-hosted on the same VPS. No additional cost.

| Service                    | Cost   | Notes                                                    |
| -------------------------- | ------ | -------------------------------------------------------- |
| Prometheus (self-hosted)   | £0     | Runs in Docker on VPS                                    |
| Grafana (self-hosted)      | £0     | Runs in Docker on VPS                                    |
| Loki (self-hosted)         | £0     | Runs in Docker on VPS                                    |
| PagerDuty (on-call alerts) | £0     | Free tier: 5 users, unlimited alerts                     |
| Uptime monitoring          | £0     | Better Uptime free tier (3 monitors) or UptimeRobot free |
| **Monitoring subtotal**    | **£0** |                                                          |

### 7.7 Queue System (BullMQ on Redis)

Redis is self-hosted on the same VPS. No additional cost at Stage 1.

| Service                       | Cost   | Notes                                  |
| ----------------------------- | ------ | -------------------------------------- |
| Redis (self-hosted in Docker) | £0     | Runs on VPS; no persistence at Stage 1 |
| BullMQ (npm package)          | £0     | Open source                            |
| **Queue subtotal**            | **£0** |                                        |

### 7.8 Backup Costs

| Service                         | Specification                              | Monthly cost |
| ------------------------------- | ------------------------------------------ | ------------ |
| Supabase automated backups      | Daily, 7-day retention (included in Pro)   | £0           |
| Additional pg_dump export to R2 | Daily, 30-day retention (~5 GB compressed) | £0.07        |
| Hetzner server snapshot         | Weekly snapshot (40 GB)                    | £0.80        |
| **Backup subtotal**             |                                            | **£0.87**    |

### 7.9 GitHub (CI/CD)

| Service                   | Specification                                          | Monthly cost                 |
| ------------------------- | ------------------------------------------------------ | ---------------------------- |
| GitHub Team plan          | 3,000 Actions minutes/month, Dependabot, Code scanning | £3.50/user × 2 users = £7.00 |
| GitHub Container Registry | Docker image storage (1 GB free, then £0.008/GB)       | £0–£2.00                     |
| **CI/CD subtotal**        |                                                        | **£7.00–£9.00**              |

### 7.10 Stripe (Payment Processing)

Stripe fees are transaction-based, not a fixed infrastructure cost. They are included here for completeness.

| Transaction type             | Fee               | Example                     |
| ---------------------------- | ----------------- | --------------------------- |
| Card payment (UK/EU)         | 1.4% + £0.20      | £39 Starter plan: £0.75 fee |
| Card payment (international) | 2.9% + £0.20      | £39 Starter plan: £1.33 fee |
| Stripe Radar (fraud)         | £0.03/transaction | Included in fee             |

_Stripe fees are typically 2–5% of revenue depending on card mix. They are not an infrastructure cost but should be factored into gross margin calculations._

### 7.11 Stage 1 Total Monthly Infrastructure Cost

| Category                           | Monthly cost  | Annual cost       |
| ---------------------------------- | ------------- | ----------------- |
| Compute (VPS)                      | £55.00        | £660.00           |
| Database (Supabase)                | £27.00        | £324.00           |
| Object Storage (R2)                | £2.68         | £32.16            |
| CDN & DNS (Cloudflare)             | £19.00        | £228.00           |
| Email (SendGrid)                   | £13.50        | £162.00           |
| Monitoring (self-hosted)           | £0            | £0                |
| Queue (self-hosted Redis)          | £0            | £0                |
| Backups                            | £0.87         | £10.44            |
| CI/CD (GitHub)                     | £8.00         | £96.00            |
| **Fixed infrastructure total**     | **£126.05**   | **£1,512.60**     |
| AI APIs (see Section 10)           | £200–£600     | £2,400–£7,200     |
| YouTube API (above free tier)      | £0–£50        | £0–£600           |
| **Total (excl. AI)**               | **£126.05**   | **£1,512.60**     |
| **Total (incl. AI, conservative)** | **£326–£726** | **£3,912–£8,712** |

---

## 8. Production Environment — Stage 2 (Growth)

_Trigger: 2,000–20,000 MAU, £15,000–£75,000 MRR_

### Changes from Stage 1

| Change                                           | Additional monthly cost    |
| ------------------------------------------------ | -------------------------- |
| Second API server (Hetzner CX42, 8 vCPU / 16GB)  | +£15.00                    |
| Frontend server (Hetzner CX32, 4 vCPU / 8GB)     | +£4.50                     |
| Supabase read replica                            | +£75.00                    |
| Managed Redis (Upstash Pro)                      | +£30.00                    |
| ClickHouse (self-hosted, CX32)                   | +£4.50                     |
| Dedicated monitoring server (CX21, 2 vCPU / 4GB) | +£3.00                     |
| Typesense (self-hosted, CX21)                    | +£3.00                     |
| PagerDuty (Professional, for proper on-call)     | +£13.00/user × 2 = +£26.00 |

### Stage 2 Total Monthly Infrastructure Cost

| Category                                                  | Monthly cost    | Annual cost         |
| --------------------------------------------------------- | --------------- | ------------------- |
| Compute (3 servers + monitoring + ClickHouse + Typesense) | £135.00         | £1,620.00           |
| Database (Supabase Pro + read replica)                    | £102.00         | £1,224.00           |
| Object Storage (R2, growing)                              | £10.00          | £120.00             |
| CDN & DNS (Cloudflare Pro)                                | £19.00          | £228.00             |
| Email (SendGrid, higher volume)                           | £40.00          | £480.00             |
| Managed Redis (Upstash Pro)                               | £30.00          | £360.00             |
| Monitoring (PagerDuty + self-hosted)                      | £26.00          | £312.00             |
| Backups (expanded)                                        | £5.00           | £60.00              |
| CI/CD (GitHub Team)                                       | £14.00          | £168.00             |
| **Fixed infrastructure total**                            | **£381.00**     | **£4,572.00**       |
| AI APIs (with caching, higher volume)                     | £600–£1,500     | £7,200–£18,000      |
| **Total (incl. AI, conservative)**                        | **£981–£1,881** | **£11,772–£22,572** |

---

## 9. Production Environment — Stage 3 (Scale)

_Trigger: 20,000–200,000 MAU, £75,000–£500,000 MRR_

### Changes from Stage 2

| Change                                            | Additional monthly cost            |
| ------------------------------------------------- | ---------------------------------- |
| Kubernetes cluster (3-node managed, Hetzner)      | +£120.00 (replaces individual VPS) |
| Redis Cluster (3 nodes managed via Upstash)       | +£60.00                            |
| Kafka (self-hosted, 3-node, 3× CX21)              | +£9.00                             |
| Elasticsearch (managed, Elastic Cloud Starter)    | +£60.00                            |
| n8n worker pool auto-scaling                      | +£30.00 avg                        |
| OpenTelemetry + Tempo (tracing)                   | +£20.00                            |
| Cloudflare Business plan (better WAF, SLAs)       | +£160.00                           |
| ClickHouse Cloud (managed, replacing self-hosted) | +£80.00                            |
| Additional object storage (growing data)          | +£30.00                            |
| Dedicated security tooling (Snyk, etc.)           | +£40.00                            |

### Stage 3 Total Monthly Infrastructure Cost

| Category                                     | Monthly cost      | Annual cost         |
| -------------------------------------------- | ----------------- | ------------------- |
| Compute (K8s cluster)                        | £250.00           | £3,000.00           |
| Database (Supabase Team + replicas)          | £350.00           | £4,200.00           |
| Object Storage (R2, large scale)             | £40.00            | £480.00             |
| CDN & DNS (Cloudflare Business)              | £180.00           | £2,160.00           |
| Email (SendGrid Pro, 500k/month)             | £80.00            | £960.00             |
| Redis Cluster (Upstash)                      | £90.00            | £1,080.00           |
| Kafka (self-hosted)                          | £9.00             | £108.00             |
| Search (Elasticsearch)                       | £60.00            | £720.00             |
| ClickHouse (managed)                         | £80.00            | £960.00             |
| Monitoring & Tracing (Grafana Cloud + Tempo) | £60.00            | £720.00             |
| Security tooling                             | £40.00            | £480.00             |
| Backups (cross-region)                       | £20.00            | £240.00             |
| CI/CD (GitHub Enterprise + larger runners)   | £40.00            | £480.00             |
| **Fixed infrastructure total**               | **£1,299.00**     | **£15,588.00**      |
| AI APIs (with tiering + caching)             | £2,000–£5,000     | £24,000–£60,000     |
| **Total (incl. AI, conservative)**           | **£3,299–£6,299** | **£39,588–£75,588** |

---

## 10. AI & API Costs

### 10.1 YouTube Data API

| Tier              | Daily quota      | Monthly cost    | Notes                                 |
| ----------------- | ---------------- | --------------- | ------------------------------------- |
| Free              | 10,000 units/day | £0              | Sufficient for early MVP with caching |
| Paid — 10k extra  | 20,000 units/day | ~£73            | Via Google Cloud Console              |
| Paid — 50k extra  | 60,000 units/day | ~£365           | Required at Stage 2 scale             |
| RapidAPI fallback | Pay-per-request  | ~£0.001/request | ~£100–£300 at Stage 1–2 scale         |

_`[ASSUMPTION]` The free 10,000 units/day is sufficient for MVP with aggressive caching (serve from DB if video analysed in last 24h). A search request costs 100 units; video detail costs 1–3 units._

**YouTube API cost estimate by stage:**

| Stage            | Daily calls (searches + details) | Monthly cost |
| ---------------- | -------------------------------- | ------------ |
| Stage 1 (MVP)    | Within free tier                 | £0–£30       |
| Stage 2 (Growth) | Requires paid tier               | £73–£200     |
| Stage 3 (Scale)  | Paid tier + supplemental         | £300–£600    |

### 10.2 Anthropic Claude API

Claude is used for: Full video content analysis, hook classification, trend clustering, ethical recommendation generation.

**Pricing (Claude Sonnet 4.6 as of July 2026):**

| Token type    | Price              |
| ------------- | ------------------ |
| Input tokens  | ~£0.0024/1k tokens |
| Output tokens | ~£0.012/1k tokens  |

_`[ASSUMPTION]` These prices are illustrative estimates. Actual pricing should be verified at api.anthropic.com/pricing._

**Cost per video analysis (Claude tasks only):**

| Task                                  | Input tokens (est.) | Output tokens (est.) | Cost per video             |
| ------------------------------------- | ------------------- | -------------------- | -------------------------- |
| Full content analysis                 | 2,500               | 800                  | £0.016                     |
| Recommendation generation             | 3,000               | 1,000                | £0.019                     |
| Trend clustering (per batch of 50)    | 5,000               | 1,500                | £0.030 / 50 = £0.0006 each |
| **Total Claude cost (full analysis)** |                     |                      | **~£0.036**                |

### 10.3 OpenAI API

OpenAI is used for: Thumbnail vision analysis, title formula detection.

**Pricing (GPT-4o as of July 2026):**

| Token type           | Price             |
| -------------------- | ----------------- |
| Input (text)         | ~£0.004/1k tokens |
| Input (image/vision) | ~£0.004/image     |
| Output               | ~£0.012/1k tokens |

**Cost per video analysis (OpenAI tasks only):**

| Task                                  | Estimated cost per video |
| ------------------------------------- | ------------------------ |
| Thumbnail vision analysis             | £0.008                   |
| Title formula detection (GPT-4o mini) | £0.001                   |
| **Total OpenAI cost (full analysis)** | **~£0.009**              |

### 10.4 Total AI Cost Per Video (Full Analysis)

| Component                                   | Cost        |
| ------------------------------------------- | ----------- |
| Claude (content analysis + recommendations) | £0.036      |
| OpenAI (thumbnail + title)                  | £0.009      |
| **Total AI cost per fully analysed video**  | **~£0.045** |

### 10.5 AI Cost Modelling by Analysis Tier

Not all videos receive full analysis. The tiered analysis model dramatically reduces costs:

| Tier                       | Criteria                                | % of discovered videos | AI cost per video               |
| -------------------------- | --------------------------------------- | ---------------------- | ------------------------------- |
| **Tier 0 — Metadata only** | < 30k views, engagement below threshold | 60%                    | £0.000                          |
| **Tier 1 — Basic AI**      | 30k–100k views                          | 25%                    | £0.015 (title + thumbnail only) |
| **Tier 2 — Full AI**       | > 100k views, high engagement           | 15%                    | £0.045                          |

**Effective average AI cost per discovered video = £0.012**

### 10.6 Monthly AI Cost by Discovery Volume

| Videos discovered/month | Cache hit rate      | Effective analyses | Monthly AI cost |
| ----------------------- | ------------------- | ------------------ | --------------- |
| 10,000                  | 0% (new platform)   | 10,000             | £120            |
| 50,000                  | 40% (growing cache) | 30,000             | £360            |
| 100,000                 | 55%                 | 45,000             | £540            |
| 500,000                 | 65%                 | 175,000            | £2,100          |
| 1,000,000               | 70%                 | 300,000            | £3,600          |

_`[ASSUMPTION]` Cache hit rate grows as the same videos are discovered across multiple watchlists and discovery cycles. A video analysed once in month 1 does not need re-analysis in month 2 unless its metrics have significantly changed._

### 10.7 AI Cost Controls

| Control                                      | Expected saving                               |
| -------------------------------------------- | --------------------------------------------- |
| Cache all AI responses (24h TTL)             | 40–70% reduction in redundant calls           |
| Tiered analysis (not all videos get full AI) | 60–70% reduction in full-analysis calls       |
| Batch trend clustering (50 topics per call)  | 90% reduction in clustering cost              |
| Use GPT-4o mini for simple classification    | 50–70% cost reduction on classification tasks |
| Daily AI spend alert (Grafana)               | Prevents runaway cost from workflow bugs      |

---

## 11. Scaling Cost Projections

### Monthly Infrastructure Cost vs MAU

| MAU     | Stage     | Fixed infra | AI APIs | Total monthly | Cost per MAU |
| ------- | --------- | ----------- | ------- | ------------- | ------------ |
| 100     | Stage 1   | £126        | £50     | £176          | £1.76        |
| 500     | Stage 1   | £126        | £100    | £226          | £0.45        |
| 1,000   | Stage 1   | £126        | £200    | £326          | £0.33        |
| 2,000   | Stage 1   | £126        | £350    | £476          | £0.24        |
| 5,000   | Stage 2   | £381        | £700    | £1,081        | £0.22        |
| 10,000  | Stage 2   | £381        | £1,200  | £1,581        | £0.16        |
| 20,000  | Stage 2→3 | £500        | £1,800  | £2,300        | £0.12        |
| 50,000  | Stage 3   | £1,299      | £3,000  | £4,299        | £0.09        |
| 100,000 | Stage 3   | £1,500      | £4,500  | £6,000        | £0.06        |
| 200,000 | Stage 3   | £2,000      | £6,000  | £8,000        | £0.04        |

_Cost per MAU declines with scale — a healthy SaaS characteristic._

### Infrastructure Cost as % of MRR

| MRR      | Total infra cost | Infra as % of MRR | Status          |
| -------- | ---------------- | ----------------- | --------------- |
| £2,000   | £326             | 16%               | ✅ Healthy      |
| £5,000   | £476             | 9.5%              | ✅ Very healthy |
| £15,000  | £726             | 4.8%              | ✅ Excellent    |
| £40,000  | £1,581           | 4.0%              | ✅ Excellent    |
| £75,000  | £2,300           | 3.1%              | ✅ Excellent    |
| £200,000 | £4,299           | 2.1%              | ✅ Excellent    |
| £500,000 | £8,000           | 1.6%              | ✅ Excellent    |

_Infrastructure costs as a percentage of MRR decline rapidly as revenue grows — infrastructure cost is sub-linear while revenue is closer to linear._

---

## 12. Budget by User Growth Milestone

### Milestone 1: 1,000 MAU / 100 Paying Customers

| Item                                  | Monthly cost                         |
| ------------------------------------- | ------------------------------------ |
| Fixed infrastructure                  | £126                                 |
| AI APIs (10,000 videos/month, tiered) | £120                                 |
| YouTube API                           | £0 (free tier)                       |
| Email (SendGrid paid)                 | £13.50                               |
| **Total**                             | **£259.50/month**                    |
| **MRR target**                        | **£3,900** (100 customers × £39 avg) |
| **Infra as % of MRR**                 | **6.7%**                             |
| **Gross margin (excl. payment fees)** | **~70%**                             |

---

### Milestone 2: 10,000 MAU / 1,000 Paying Customers

| Item                                              | Monthly cost                            |
| ------------------------------------------------- | --------------------------------------- |
| Fixed infrastructure (Stage 2 beginning)          | £381                                    |
| AI APIs (100,000 videos/month, tiered, 55% cache) | £540                                    |
| YouTube API (paid tier required)                  | £100                                    |
| Email (higher volume)                             | £40                                     |
| **Total**                                         | **£1,061/month**                        |
| **MRR target**                                    | **£52,000** (1,000 customers × £52 avg) |
| **Infra as % of MRR**                             | **2.0%**                                |
| **Gross margin**                                  | **~78%**                                |

---

### Milestone 3: 100,000 MAU / 8,000 Paying Customers

| Item                                         | Monthly cost                             |
| -------------------------------------------- | ---------------------------------------- |
| Fixed infrastructure (Stage 3)               | £1,299                                   |
| AI APIs (1M videos/month, tiered, 65% cache) | £3,600                                   |
| YouTube API (paid tier + supplemental)       | £400                                     |
| Email (500k+ emails/month)                   | £80                                      |
| **Total**                                    | **£5,379/month**                         |
| **MRR target**                               | **£400,000** (8,000 customers × £50 avg) |
| **Infra as % of MRR**                        | **1.3%**                                 |
| **Gross margin**                             | **~83%**                                 |

---

### Milestone 4: 1,000,000 MAU / 60,000 Paying Customers

_`[ASSUMPTION]` At this scale, reserved instance pricing, enterprise AI API contracts, and custom CDN arrangements significantly reduce costs compared to the extrapolated figures below._

| Item                                                             | Monthly cost (estimated)                    |
| ---------------------------------------------------------------- | ------------------------------------------- |
| Fixed infrastructure (Stage 4, multi-region K8s)                 | £8,000                                      |
| AI APIs (5M videos/month, tiered, 70% cache, enterprise pricing) | £12,000                                     |
| YouTube API (enterprise contract)                                | £1,500                                      |
| Email (millions/month, dedicated IPs)                            | £300                                        |
| Security & compliance tooling                                    | £500                                        |
| **Total**                                                        | **£22,300/month**                           |
| **MRR target**                                                   | **£3,000,000** (60,000 customers × £50 avg) |
| **Infra as % of MRR**                                            | **0.7%**                                    |
| **Gross margin**                                                 | **~88%**                                    |

---

## 13. Cost Optimisation Strategies

### Immediate (MVP — Week 1)

- [ ] **AI response caching** — Cache all AI outputs in Redis keyed by `(prompt_version, sha256(input))`. Target: 40% cache hit rate by month 2.
- [ ] **Tiered analysis** — Implement analysis tiers from day one. Only 15% of videos receive full AI analysis.
- [ ] **YouTube cache-first** — Serve from DB if a video was analysed in the last 24 hours. Never re-call the YouTube API for cached video metadata.
- [ ] **AI spend alert** — Grafana alert when daily AI spend exceeds £20.
- [ ] **R2 for storage** — Cloudflare R2 instead of AWS S3 eliminates egress fees entirely.
- [ ] **Hetzner for compute** — 2–3× better price/performance than AWS EC2 or GCP for European-hosted VMs.
- [ ] **Self-host monitoring** — Prometheus + Grafana + Loki on the same VPS; zero additional cost vs managed alternatives (£200–£500/month saved).

### Short-Term (Month 3–6)

- [ ] **GPT-4o mini for classification tasks** — Title formula detection and hook classification do not need the full GPT-4o model. GPT-4o mini is ~10× cheaper per token.
- [ ] **Batch trend clustering** — One Claude call per batch of 50 topics instead of one call per topic. 50× cost reduction on clustering.
- [ ] **Prompt optimisation** — Reduce token usage by 20–30% through prompt engineering without reducing output quality. Review prompts quarterly.
- [ ] **Thumbnail download TTL** — Thumbnails stored in R2 for 7 days only (lifecycle policy). Once analysis is complete, the thumbnail can be purged.

### Medium-Term (Month 6–12)

- [ ] **Reserved VPS pricing** — Hetzner offers annual prepayment discounts of ~10–15%. Commit once stable.
- [ ] **Anthropic volume pricing** — Negotiate volume pricing with Anthropic once Claude API spend exceeds £1,000/month.
- [ ] **OpenAI volume pricing** — Negotiate at £500+/month spend.
- [ ] **Read replica routing** — Route all analytics queries to read replica, freeing primary for writes. Prevents unnecessary primary scaling.

### Long-Term (Month 12+)

- [ ] **Kubernetes spot/preemptible nodes** — n8n worker pods run on spot instances (tolerate interruption). Typically 60–80% cheaper than on-demand.
- [ ] **ClickHouse for analytics** — Migrate heavy analytics queries from PostgreSQL to ClickHouse. Faster queries at lower compute cost.
- [ ] **Supabase → self-hosted at scale** — At > £500/month Supabase cost, evaluate self-hosted PostgreSQL with pgBackRest. Potential 60% database cost saving.
- [ ] **Multi-year AI contracts** — At significant AI API spend, negotiate enterprise contracts with usage commitments for substantial discounts.

---

## 14. Break-Even Infrastructure Analysis

### Definition

Infrastructure break-even is the MRR at which revenue covers all infrastructure costs (fixed + variable AI costs) with a 70%+ gross margin target.

### Break-Even Calculations

**Stage 1 — Conservative (high AI usage, no caching):**

```
Fixed infrastructure:     £126/month
AI APIs (no caching):     £400/month  (10,000 videos × £0.045 avg)
YouTube API:              £30/month
Email:                    £13.50/month
Total:                    £569.50/month

At 70% gross margin target:
MRR needed = £569.50 / (1 - 0.70) = £1,898/month
Paying customers needed = £1,898 / £39 avg = ~49 customers
```

**Stage 1 — Optimistic (caching active, tiered analysis):**

```
Fixed infrastructure:     £126/month
AI APIs (with optimisation): £120/month
YouTube API:              £0 (free tier)
Email:                    £13.50/month
Total:                    £259.50/month

At 70% gross margin target:
MRR needed = £259.50 / (1 - 0.70) = £865/month
Paying customers needed = £865 / £39 avg = ~23 customers
```

**Break-even summary:**

| Scenario                            | Monthly infra cost | MRR needed | Customers needed |
| ----------------------------------- | ------------------ | ---------- | ---------------- |
| Conservative (no caching)           | £570               | £1,900     | ~49              |
| Realistic (partial caching)         | £350               | £1,167     | ~30              |
| Optimistic (full caching + tiering) | £260               | £867       | ~22              |

**Target:** Reach break-even infrastructure within 60 days of launch (30 paying customers).

---

## 15. Annual Cost Summary

### Year 1 — Infrastructure Costs by Quarter

| Quarter           | MAU (est.)    | Monthly infra | Quarterly infra | Notes                             |
| ----------------- | ------------- | ------------- | --------------- | --------------------------------- |
| Q1 (Months 1–3)   | 0 → 300       | £260–£350     | £900            | MVP launch; minimal AI cost       |
| Q2 (Months 4–6)   | 300 → 1,000   | £350–£450     | £1,200          | Growing usage; caching kicking in |
| Q3 (Months 7–9)   | 1,000 → 3,000 | £450–£700     | £1,750          | v1.5 features; slightly higher AI |
| Q4 (Months 10–12) | 3,000 → 6,000 | £700–£1,100   | £2,700          | Stage 2 transition begins         |
| **Year 1 Total**  |               |               | **£6,550**      |                                   |

### Year 2 — Stage 2 Growth

| Quarter           | MAU (est.)      | Monthly infra | Quarterly infra |
| ----------------- | --------------- | ------------- | --------------- |
| Q1 (Months 13–15) | 6,000 → 10,000  | £1,081–£1,300 | £3,600          |
| Q2 (Months 16–18) | 10,000 → 15,000 | £1,300–£1,500 | £4,200          |
| Q3 (Months 19–21) | 15,000 → 20,000 | £1,500–£1,800 | £4,950          |
| Q4 (Months 22–24) | 20,000 → 30,000 | £1,800–£2,300 | £6,150          |
| **Year 2 Total**  |                 |               | **£18,900**     |

### Year 3 — Stage 3 Scale

| Quarter           | MAU (est.)        | Monthly infra | Quarterly infra |
| ----------------- | ----------------- | ------------- | --------------- |
| Q1 (Months 25–27) | 30,000 → 50,000   | £3,000–£4,000 | £10,500         |
| Q2 (Months 28–30) | 50,000 → 75,000   | £4,000–£5,000 | £13,500         |
| Q3 (Months 31–33) | 75,000 → 100,000  | £5,000–£6,000 | £16,500         |
| Q4 (Months 34–36) | 100,000 → 150,000 | £6,000–£8,000 | £21,000         |
| **Year 3 Total**  |                   |               | **£61,500**     |

### Three-Year Infrastructure Cost Summary

| Year             | Total infra cost | Est. ARR        | Infra as % of ARR |
| ---------------- | ---------------- | --------------- | ----------------- |
| Year 1           | £6,550           | £75,000         | 8.7%              |
| Year 2           | £18,900          | £600,000        | 3.2%              |
| Year 3           | £61,500          | £3,600,000      | 1.7%              |
| **3-Year Total** | **£86,950**      | **~£4,275,000** | **2.0% avg**      |

_Infrastructure costs as a percentage of ARR improve dramatically with scale — a strong indicator of the SaaS business model's leverage._

### Key Infrastructure Budget KPIs

| KPI                                            | Target                    | Review cadence |
| ---------------------------------------------- | ------------------------- | -------------- |
| Infrastructure cost / MRR                      | < 20%                     | Monthly        |
| AI API cost / total infra cost                 | < 60%                     | Monthly        |
| Cost per MAU                                   | Declining month-on-month  | Monthly        |
| AI cache hit rate                              | > 50% by month 3          | Weekly         |
| Infrastructure cost / paying customer          | < £5/customer by month 12 | Monthly        |
| Gross margin (after infra, before Stripe fees) | > 70%                     | Monthly        |

---

_This document is reviewed monthly and updated whenever significant infrastructure changes are made, new pricing is negotiated, or a stage transition is triggered._

---

**Related Documents:**

- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Technical infrastructure evolution strategy
- [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) — Revenue projections and margin targets
- [Deployment_Guide.md](./Deployment_Guide.md) — How infrastructure is provisioned and deployed
- [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) — Cost monitoring dashboards and alerts
