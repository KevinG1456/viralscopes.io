# KPI_Dashboard_Definitions.md
# ViralScopes.io — KPI Dashboard Definitions

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Cross-references:** [Analytics_Events.md](./Analytics_Events.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) · [Monitoring_&_Operations.md](./Monitoring_and_Operations.md)

---

Every KPI displayed in ViralScopes internal dashboards (Grafana, PostHog, or a custom reporting layer) is defined below. Each definition specifies exactly how the metric is calculated, where the data comes from, how often it updates, and why it matters.

---

## Section 1 — Revenue KPIs

### 1.1 Monthly Recurring Revenue (MRR)

| Property | Value |
|---|---|
| **Description** | Total predictable subscription revenue normalised to one month |
| **Formula** | `SUM(active subscriptions × monthly_equivalent_price)` where annual plans are divided by 12 |
| **Data source** | `subscriptions` table; synced from Stripe via webhook |
| **Update frequency** | Real-time (on every Stripe webhook event) |
| **Owner** | Founder / Head of Growth |
| **Visualisation** | Line chart (rolling 12 months) + stat card (current value + MoM delta) |
| **Business importance** | North star revenue metric. Drives hiring, infrastructure, and investment decisions. |

**MRR Components:**

| Component | Formula | Business use |
|---|---|---|
| New MRR | MRR from customers who started a paid plan this month | Acquisition efficiency |
| Expansion MRR | MRR added from plan upgrades | Expansion revenue health |
| Churned MRR | MRR lost from cancellations | Churn severity |
| Reactivation MRR | MRR from returning customers | Win-back programme effectiveness |
| Net New MRR | New + Expansion + Reactivation − Churned | Overall MRR momentum |

---

### 1.2 Annual Recurring Revenue (ARR)

| Property | Value |
|---|---|
| **Description** | MRR × 12; the annualised revenue run-rate |
| **Formula** | `MRR × 12` |
| **Data source** | Derived from MRR |
| **Update frequency** | Real-time |
| **Owner** | Founder |
| **Visualisation** | Stat card with milestone markers (£100K, £500K, £1M, £3M) |
| **Business importance** | Primary metric for investor reporting, hiring decisions, and valuation. |

---

### 1.3 Average Revenue Per User (ARPU)

| Property | Value |
|---|---|
| **Description** | Average monthly revenue per paying customer |
| **Formula** | `MRR ÷ total active paying customers` |
| **Data source** | `subscriptions` table |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Line chart (rolling 12 months) + stat card |
| **Business importance** | Tracks whether expansion revenue and Enterprise mix are improving revenue quality. |
| **Target** | £52/month (early stage), growing to £75+ by Month 24 as Enterprise mix increases |

---

### 1.4 Revenue by Plan

| Property | Value |
|---|---|
| **Description** | MRR breakdown by subscription plan |
| **Formula** | `SUM(subscription_amount) GROUP BY plan` |
| **Data source** | `subscriptions` table |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Stacked bar chart (plan segments over time) + pie chart (current period) |
| **Business importance** | Shows whether the revenue mix is evolving toward higher-value plans. A healthy mix sees Enterprise and Business growing as a % of total MRR over time. |

---

### 1.5 Gross Margin

| Property | Value |
|---|---|
| **Description** | Revenue minus cost of goods sold (COGS), as a percentage |
| **Formula** | `(Revenue − COGS) ÷ Revenue × 100` where COGS = infrastructure + AI API costs + Stripe fees |
| **Data source** | Revenue from Stripe; COGS from infrastructure budget tracking + AI API cost monitoring |
| **Update frequency** | Monthly |
| **Owner** | Founder |
| **Visualisation** | Line chart (monthly) + stat card |
| **Business importance** | Indicates long-term profitability potential. Target: > 70% at scale. |
| **Target** | 65% Year 1 → 79% Year 3 |

---

## Section 2 — Customer KPIs

### 2.1 Customer Acquisition Cost (CAC)

| Property | Value |
|---|---|
| **Description** | Average cost to acquire one paying customer |
| **Formula** | `Total sales + marketing spend in period ÷ new paying customers in period` |
| **Data source** | Accounting system (sales + marketing spend); `subscriptions` table (new customers) |
| **Update frequency** | Monthly |
| **Owner** | Head of Growth |
| **Visualisation** | Line chart + stat card with target line |
| **Business importance** | Must be proportionate to LTV. CAC:LTV > 1:3 is required for sustainable growth. |
| **Target** | < £60 blended (organic mix); < £150 if paid acquisition is scaled |

---

### 2.2 Customer Lifetime Value (LTV)

| Property | Value |
|---|---|
| **Description** | Predicted total revenue from a customer over their lifetime |
| **Formula** | `ARPU × Gross Margin % × (1 ÷ Monthly Churn Rate)` |
| **Data source** | Derived from ARPU, gross margin, and churn rate |
| **Update frequency** | Monthly |
| **Owner** | Head of Growth |
| **Visualisation** | Stat card + LTV:CAC ratio gauge |
| **Business importance** | Together with CAC, defines the unit economics of the business. |
| **Target** | > £790 at Month 18 steady state |

---

### 2.3 LTV:CAC Ratio

| Property | Value |
|---|---|
| **Description** | Ratio of customer lifetime value to customer acquisition cost |
| **Formula** | `LTV ÷ CAC` |
| **Data source** | Derived from LTV and CAC |
| **Update frequency** | Monthly |
| **Owner** | Founder |
| **Visualisation** | Gauge (0–20) with colour zones: red < 3, amber 3–5, green > 5 |
| **Business importance** | The fundamental unit economics ratio. > 3:1 means the business model is viable; > 5:1 is healthy; > 10:1 means the company is under-investing in growth. |
| **Target** | > 5:1 by Month 12; > 10:1 by Month 24 |

---

### 2.4 Payback Period

| Property | Value |
|---|---|
| **Description** | Months required to recover the cost of acquiring a customer |
| **Formula** | `CAC ÷ (ARPU × Gross Margin %)` |
| **Data source** | Derived from CAC, ARPU, and gross margin |
| **Update frequency** | Monthly |
| **Owner** | Head of Growth |
| **Visualisation** | Stat card |
| **Business importance** | Shorter payback = faster cash cycle = less capital required for growth. |
| **Target** | < 3 months |

---

## Section 3 — Churn & Retention KPIs

### 3.1 Monthly Logo Churn

| Property | Value |
|---|---|
| **Description** | Percentage of paying customers who cancel in a given month |
| **Formula** | `Customers who cancelled in month ÷ customers at start of month × 100` |
| **Data source** | `subscriptions` table (`status = 'canceled'` set during the month) |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Line chart (rolling 12 months) with target line |
| **Business importance** | The single most important retention metric. 5% monthly churn = 46% annual churn — the business loses half its customers every year. |
| **Target** | < 8% Month 1–6; < 5% Month 7–18; < 3% Month 18+ |

---

### 3.2 Monthly Revenue Churn

| Property | Value |
|---|---|
| **Description** | Percentage of MRR lost through cancellations in a given month |
| **Formula** | `Churned MRR ÷ MRR at start of month × 100` |
| **Data source** | `subscriptions` table |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Line chart alongside logo churn for comparison |
| **Business importance** | Revenue churn is typically lower than logo churn when higher-value plans have lower cancellation rates. |
| **Target** | < 5% monthly |

---

### 3.3 Net Revenue Retention (NRR)

| Property | Value |
|---|---|
| **Description** | Percentage of MRR retained plus expansion from existing customers over a period |
| **Formula** | `(MRR at end of period from customers who existed at start − Churned MRR) ÷ MRR at start × 100` |
| **Data source** | `subscriptions` table, cohort analysis |
| **Update frequency** | Monthly |
| **Owner** | Founder |
| **Visualisation** | Stat card + line chart |
| **Business importance** | NRR > 100% means the existing customer base grows revenue even without new customer acquisition. > 110% is considered excellent SaaS. |
| **Target** | > 95% Month 1–6; > 105% Month 7–12; > 110% Month 12+ |

---

## Section 4 — Engagement KPIs

### 4.1 Daily Active Users (DAU)

| Property | Value |
|---|---|
| **Description** | Unique users who view at least one dashboard page on a given day |
| **Formula** | `COUNT(DISTINCT user_id) WHERE Dashboard Viewed event is fired on date` |
| **Data source** | PostHog / analytics platform; `Dashboard Viewed` event |
| **Update frequency** | Daily |
| **Owner** | Head of Product |
| **Visualisation** | Line chart (rolling 30 days) |
| **Business importance** | Measures daily engagement intensity. Leading indicator of retention. |
| **Target** | Growing proportionally with MAU; DAU/MAU > 20% |

---

### 4.2 Weekly Active Users (WAU)

| Property | Value |
|---|---|
| **Description** | Unique users who view at least one dashboard page in a given week |
| **Formula** | `COUNT(DISTINCT user_id) in rolling 7-day window with Dashboard Viewed event` |
| **Data source** | Analytics platform |
| **Update frequency** | Weekly |
| **Owner** | Head of Product |
| **Visualisation** | Line chart + stat card |
| **Business importance** | ViralScopes aims to be a weekly habit (Monday morning dashboard review). WAU is the primary engagement frequency target. |
| **Target** | WAU/MAU > 40% (40% of monthly users visit at least once per week) |

---

### 4.3 Monthly Active Users (MAU)

| Property | Value |
|---|---|
| **Description** | Unique users who engage with the dashboard at least once in a calendar month |
| **Formula** | `COUNT(DISTINCT user_id) with any event in calendar month` |
| **Data source** | Analytics platform |
| **Update frequency** | Monthly |
| **Owner** | Head of Product |
| **Visualisation** | Line chart (rolling 12 months) + stat card |
| **Business importance** | Broadest engagement measure. High MAU relative to registered users indicates good retention and activation. |
| **Target** | MAU / Registered Users > 30% |

---

### 4.4 DAU/MAU Ratio (Stickiness)

| Property | Value |
|---|---|
| **Description** | Percentage of monthly active users who are active on any given day |
| **Formula** | `DAU ÷ MAU × 100` |
| **Data source** | Derived from DAU and MAU |
| **Update frequency** | Daily |
| **Owner** | Head of Product |
| **Visualisation** | Line chart with comparison to industry benchmarks |
| **Business importance** | The "stickiness" metric. > 20% is good for a B2B SaaS tool; > 30% is excellent. |
| **Target** | > 20% initially; > 30% by Month 18 |

---

### 4.5 Activation Rate

| Property | Value |
|---|---|
| **Description** | Percentage of new signups who complete all three activation milestones within 7 days |
| **Activation milestones** | (1) Created ≥ 1 watchlist AND (2) Viewed ≥ 3 video analyses AND (3) Created ≥ 1 alert rule |
| **Formula** | `Users who completed all milestones within 7 days ÷ signups in the same cohort × 100` |
| **Data source** | Analytics events: `Watchlist Created`, `Video Detail Viewed`, `Alert Rule Created` |
| **Update frequency** | Daily |
| **Owner** | Head of Product |
| **Visualisation** | Funnel chart (milestone completion rates) + line chart (weekly activation cohorts) |
| **Business importance** | Activation is the strongest leading indicator of 30-day retention. Users who activate within 7 days retain at 2× the rate of those who don't. |
| **Target** | > 30% by Month 3; > 40% by Month 6 |

---

### 4.6 Conversion Rate (Free → Paid)

| Property | Value |
|---|---|
| **Description** | Percentage of free users who upgrade to a paid plan within 30 days |
| **Formula** | `Users who subscribed within 30 days of signup ÷ signups 30+ days ago × 100` |
| **Data source** | `subscriptions` table + user signup timestamps |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Line chart (weekly cohorts) + stat card |
| **Business importance** | The primary funnel metric. Improving this from 5% to 8% more than doubles annual revenue from the same acquisition volume. |
| **Target** | 5% → 8% over first 12 months |

---

## Section 5 — Platform Usage KPIs

### 5.1 API Usage

| Property | Value |
|---|---|
| **Description** | Total API requests per day, broken down by endpoint and plan tier |
| **Formula** | `COUNT(api_requests) GROUP BY endpoint, plan, date` |
| **Data source** | Redis rate limit counters (real-time); `usage_events` table (daily summary) |
| **Update frequency** | Real-time (Redis); daily summary (PostgreSQL) |
| **Owner** | Engineering Lead |
| **Visualisation** | Time series chart (API requests per day by plan tier) + top-10 endpoints bar chart |
| **Business importance** | Tracks API adoption as a stickiness signal. High API usage = high switching cost. Also informs rate limit configuration and overage pricing. |
| **Target** | > 30% of Professional+ customers making at least 1 API call per week by Month 12 |

---

### 5.2 AI Usage

| Property | Value |
|---|---|
| **Description** | Daily AI API calls, broken down by provider and task type |
| **Formula** | `COUNT(ai_api_calls) GROUP BY provider, task, date` where task ∈ {video_analysis, thumbnail, title, hook, recommendation, trend_clustering, chat} |
| **Data source** | `usage_events` table (event_type = 'video_analyzed'); n8n workflow logs |
| **Update frequency** | Daily |
| **Owner** | Engineering Lead |
| **Visualisation** | Stacked bar chart (AI calls by type per day) + line chart (daily cost estimate) |
| **Business importance** | AI costs are the largest variable cost. Monitoring usage prevents cost overruns and informs tiering decisions. |
| **Alert threshold** | Alert fires when estimated daily AI spend > £30 |

---

### 5.3 AI Cache Hit Rate

| Property | Value |
|---|---|
| **Description** | Percentage of AI requests served from cache rather than calling the API |
| **Formula** | `cache_hits ÷ (cache_hits + cache_misses) × 100` |
| **Data source** | Redis `ai_cache_hits_total` and `ai_cache_misses_total` Prometheus counters |
| **Update frequency** | Real-time (Grafana) |
| **Owner** | Engineering Lead |
| **Visualisation** | Gauge + line chart (rolling 7 days) |
| **Business importance** | Every 10% increase in cache hit rate reduces AI costs by 10%. Target hit rate is 55%+ by Month 6. |
| **Target** | > 40% by Month 3; > 55% by Month 6; > 65% by Month 12 |

---

### 5.4 YouTube API Quota Usage

| Property | Value |
|---|---|
| **Description** | Daily YouTube Data API quota units consumed vs 10,000-unit daily limit |
| **Formula** | `SUM(quota_units_used) for current UTC day` |
| **Data source** | Prometheus gauge `youtube_quota_units_used` |
| **Update frequency** | Real-time |
| **Owner** | Engineering Lead |
| **Visualisation** | Gauge (0–10,000) + time series (consumption rate through the day) |
| **Business importance** | Quota exhaustion stops video discovery. The 75% and 95% thresholds trigger alerts and activate fallback sources. |
| **Alert thresholds** | Warning: 7,500 units; Critical: 9,500 units |

---

### 5.5 Workspace Growth

| Property | Value |
|---|---|
| **Description** | Number of workspaces created per week, as an indicator of agency and enterprise adoption |
| **Formula** | `COUNT(workspaces) WHERE created_at in period GROUP BY week` |
| **Data source** | `workspaces` table |
| **Update frequency** | Daily |
| **Owner** | Head of Growth |
| **Visualisation** | Bar chart (weekly workspace creation) |
| **Business importance** | Workspace creation is a strong signal of Business/Enterprise adoption. Agencies and enterprise teams create one workspace per client or team. |
| **Target** | > 20 new workspaces per month by Month 9 |

---

## Section 6 — Operational KPIs

### 6.1 API Error Rate

| Property | Value |
|---|---|
| **Description** | Percentage of API requests returning 5xx status codes |
| **Formula** | `rate(http_requests_total{status=~"5.."} [5m]) ÷ rate(http_requests_total [5m]) × 100` |
| **Data source** | Prometheus |
| **Update frequency** | Real-time |
| **Owner** | Engineering Lead |
| **Visualisation** | Line chart in Grafana API Performance dashboard |
| **Alert threshold** | > 1% for 5 minutes triggers P1 alert |
| **Business importance** | High error rates directly impact user experience and retention. |

---

### 6.2 API p95 Latency

| Property | Value |
|---|---|
| **Description** | 95th percentile API response time in milliseconds |
| **Formula** | `histogram_quantile(0.95, rate(http_request_duration_ms_bucket [5m]))` |
| **Data source** | Prometheus |
| **Update frequency** | Real-time |
| **Owner** | Engineering Lead |
| **Visualisation** | Line chart in Grafana |
| **Alert threshold** | > 1,000ms for 5 minutes = warning; > 2,000ms = critical |
| **Target** | < 500ms |

---

### 6.3 Queue Depth

| Property | Value |
|---|---|
| **Description** | Number of unprocessed jobs in each BullMQ queue |
| **Formula** | `workflow_queue_depth` Prometheus gauge by priority level |
| **Data source** | Prometheus (from BullMQ exporter) |
| **Update frequency** | Real-time |
| **Owner** | Engineering Lead |
| **Visualisation** | Multi-line chart (high / standard / low priority) |
| **Alert threshold** | High priority > 100 for 5 minutes = warning; > 500 = critical |
| **Business importance** | Queue depth indicates workflow processing health and capacity. |

---

### 6.4 Dead-Letter Queue Depth

| Property | Value |
|---|---|
| **Description** | Number of unresolved failed jobs in the dead-letter queue |
| **Formula** | `SELECT COUNT(*) FROM dead_letter_jobs WHERE resolved = false` |
| **Data source** | PostgreSQL `dead_letter_jobs` table |
| **Update frequency** | Every 5 minutes |
| **Owner** | Engineering Lead |
| **Visualisation** | Stat card with colour coding: green 0, amber 1–5, red > 5 |
| **Alert threshold** | > 10 unresolved jobs |
| **Business importance** | Unresolved dead-letter jobs mean analysis pipeline failures affecting users. |

---

## Section 7 — KPI Review Cadence

| Cadence | KPIs reviewed | Audience |
|---|---|---|
| **Real-time (Grafana)** | API error rate, p95 latency, queue depth, YouTube quota, dead-letter queue | Engineering on-call |
| **Daily** | DAU, new signups, new paying customers, MRR change, activation completions | Product + Growth |
| **Weekly** | WAU, conversion rate, churn signals, NRR (rolling), activation rate | Full team |
| **Monthly** | All revenue KPIs, LTV:CAC, gross margin, plan mix, NPS, feature adoption | Founder + all leads |
| **Quarterly** | Full unit economics review, CAC by channel, cohort retention curves, OKR progress | Founder + investors |
