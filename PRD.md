# PRD.md

# ViralScopes.io — Product Requirements Document

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Product Owner:** ViralScopes.io Team
> **Cross-references:** [ROADMAP.md](./ROADMAP.md) · [PROJECT_RULES.md](./PROJECT_RULES.md) · [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Problem Statement](#2-problem-statement)
3. [Target Users](#3-target-users)
4. [User Personas](#4-user-personas)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Success Metrics & KPIs](#8-success-metrics--kpis)
9. [Technical Requirements](#9-technical-requirements)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Assumptions & Constraints](#11-assumptions--constraints)
12. [Future Roadmap](#12-future-roadmap)

---

## 1. Product Vision

### 1.1 Vision Statement

> **ViralScopes.io is the intelligence layer between a creator and their next breakthrough.**

ViralScopes.io is an AI-powered content intelligence platform that helps creators, media teams, and agencies understand _why_ content goes viral — and how to create original content with the same structural characteristics, without copying anyone.

The platform analyses YouTube videos at scale, extracts the patterns behind viral performance (hook structures, title formulas, thumbnail compositions, narrative arcs, engagement drivers), and surfaces those patterns as actionable, original creative guidance for the people who subscribe to it.

### 1.2 Mission

To give every content creator access to the same calibre of data-driven content strategy that was previously available only to large media companies with dedicated research teams.

### 1.3 Core Ethical Principle

ViralScopes.io analyses **patterns**, not content. The platform:

- **Does** identify hook structures, title formulas, narrative techniques, engagement patterns, and topic trends.
- **Does not** reproduce, paraphrase, or facilitate copying of any creator's original scripts, titles, hooks, or creative work.
- **Does** generate original recommendations inspired by structural patterns.
- **Does not** help users imitate specific creators in an identifiable way.

This principle is enforced at the product level, the AI prompt level, and the engineering level.

### 1.4 Tagline

_"Understand why. Create originally."_

---

## 2. Problem Statement

### 2.1 The Core Problem

Content creators and media teams invest enormous time and resources into producing content with unpredictable results. The gap between a video that gets 500 views and one that gets 5 million views is rarely about production quality — it is about structural decisions made in the first 30 seconds: the hook, the title, the thumbnail, the topic timing, and the narrative arc.

Most creators:

- **Lack access to the data** needed to understand what made a specific video perform.
- **Rely on gut instinct** for decisions that could be informed by pattern analysis.
- **Discover trends too late** — after the opportunity window has closed.
- **Copy superficially** rather than understanding underlying structural patterns.
- **Spend hours manually researching** competitor content with no systematic methodology.

### 2.2 Existing Solutions and Their Limitations

| Existing Tool              | What it does                            | What it misses                                                          |
| -------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| YouTube Analytics          | Shows your own channel performance data | No competitor insight, no pattern analysis, no recommendations          |
| TubeBuddy / VidIQ          | Basic keyword research and SEO tags     | Surface-level; no deep structural analysis; no viral pattern extraction |
| Social Blade               | Historical channel growth statistics    | No content analysis; no actionable guidance                             |
| Exploding Topics           | Trend discovery                         | Not YouTube-specific; no content structure analysis                     |
| Manual competitor research | Ad hoc; creator dependent               | Time-intensive; inconsistent; no AI synthesis                           |
| ChatGPT (direct)           | Can discuss content strategy            | No access to real video data; no proprietary analysis pipeline          |

**The gap:** No platform combines large-scale video data collection, deep AI structural analysis, viral scoring, trend detection, and ethically generated original recommendations in a single product.

### 2.3 Why Now

- AI models capable of nuanced content analysis at scale are now commercially available and affordable with proper caching and tiering.
- The creator economy has grown to tens of millions of professional creators globally, all competing for attention with increasingly sophisticated content.
- YouTube's dominance as a discovery engine (over 2 billion monthly active users) makes it the highest-leverage platform to analyse first.
- No direct competitor has yet assembled this specific combination of capabilities in a SaaS product.

---

## 3. Target Users

### 3.1 Primary Markets

| Segment                  | Description                                                             | Size estimate    |
| ------------------------ | ----------------------------------------------------------------------- | ---------------- |
| **Independent creators** | Solo creators managing their own channels, typically 10k–1M subscribers | ~50M globally    |
| **Creator agencies**     | Agencies managing content strategy for multiple creator clients         | ~500k businesses |
| **Media companies**      | Digital-first publishers and media brands with YouTube presences        | ~100k companies  |
| **Marketing teams**      | In-house content teams at brands using YouTube as a marketing channel   | ~2M teams        |

### 3.2 Secondary Markets (Post-MVP)

- Podcast networks expanding into video
- Multi-channel networks (MCNs)
- Talent management firms
- Academic and journalism researchers studying media trends

### 3.3 Geographic Focus (MVP)

English-language content and English-speaking markets first:

- United States
- United Kingdom
- Canada
- Australia
- Ireland

Multi-language expansion (Spanish, Portuguese, German, French, Hindi) is planned for v2.

---

## 4. User Personas

### 4.1 Persona A — The Growth-Focused Independent Creator

**Name:** Maya Chen
**Role:** Full-time YouTube creator
**Channel size:** 180,000 subscribers (Tech & Productivity niche)
**Team:** Solo, occasional freelance editor

**Goals:**

- Identify which video topics are growing before they peak
- Understand why her best-performing videos worked so she can replicate the structure
- Reduce the time she spends researching competitors from 5+ hours per week to under 30 minutes

**Pain Points:**

- Spends Sunday evenings manually watching competitor videos to understand what is working
- Has no systematic way to decide between 10 possible video ideas
- Cannot afford to hire a research assistant or data analyst
- Has tried VidIQ but finds it too focused on keyword tags rather than content strategy

**How She Uses ViralScopes:**

- Checks the Trending dashboard Monday morning for fast-growing topics in her niche
- Reviews the Viral Score breakdown for her top-performing videos to understand which structural elements drove performance
- Uses the Opportunity Engine to identify topics with high demand and low saturation
- Gets AI-generated original title concepts and hook ideas to kickstart her creative process

**Willingness to Pay:** £39–£89/month

---

### 4.2 Persona B — The Agency Content Strategist

**Name:** Daniel Osei
**Role:** Head of Content Strategy at a mid-size creator agency
**Team size:** 12 people, managing 8 creator clients
**Clients:** Fashion, fitness, finance, and lifestyle creators

**Goals:**

- Deliver consistent, data-backed content strategy recommendations to clients every week
- Identify breakout opportunities for clients before competitors spot them
- Demonstrate ROI of the agency's content strategy with measurable data
- Scale strategy delivery without proportionally scaling headcount

**Pain Points:**

- Creating weekly strategy reports for 8 clients requires 20+ hours of manual research
- Client briefs are based on "what feels right" rather than pattern data
- No systematic way to monitor what competitors of each client are doing
- Difficult to justify strategy recommendations without supporting data

**How He Uses ViralScopes:**

- Sets up Watchlists for each client's 5 closest competitors
- Gets weekly alert digests when competitors post content that scores above a threshold
- Exports channel intelligence reports to share with clients in presentation decks
- Uses Trend Detection to brief clients on emerging topics 2–3 weeks before they peak
- Uses the AI Recommendation Engine to produce original content briefs for each client

**Willingness to Pay:** £199–£499/month per workspace (or per client slot)

---

### 4.3 Persona C — The In-House Brand Content Manager

**Name:** Priya Sharma
**Role:** Content Manager, YouTube channel for a consumer tech brand
**Team:** 4 people (herself, 2 video producers, 1 editor)
**Channel size:** 320,000 subscribers

**Goals:**

- Produce content that competes with creator-style videos, not just corporate brand content
- Understand what content formats and topics the brand's target audience is engaging with
- Justify content investments to senior management with concrete data
- Reduce time-to-decision on content calendar planning

**Pain Points:**

- YouTube Analytics only shows internal performance — no external benchmarking
- Senior leadership asks "why should we make that video?" and she lacks data to answer confidently
- Trend awareness is reactive — the team often produces content about topics that have already peaked
- Creative briefs for producers are based on instinct, not evidence

**How She Uses ViralScopes:**

- Uses Viral Score Breakdown to benchmark existing videos against the niche average
- Exports monthly competitor analysis reports for leadership presentations
- Uses Opportunity Engine to build a data-backed content calendar
- Creates alerts for specific competitor channels to track their release cadence

**Willingness to Pay:** £149–£299/month (typically on a company card)

---

### 4.4 Persona D — The Enterprise Media Director

**Name:** James Whitfield
**Role:** Director of Digital Content, national media publisher
**Team:** 30+ people across editorial, video, social, and data

**Goals:**

- Systematic competitive intelligence across 50+ competitor channels
- Data infrastructure that the entire content team can access and act on
- Custom reporting and data exports for internal tooling
- Enterprise-grade access controls (RBAC, workspaces, SSO)
- SLA-backed uptime and priority support

**Pain Points:**

- No existing tool handles the scale of competitor monitoring he requires
- Current tools don't integrate with internal BI systems
- Cannot share access granularly — tools are either all-or-nothing
- Lacks a dedicated account manager for onboarding and training

**How He Uses ViralScopes:**

- Uses the Public API (v2) to pipe data into internal dashboards
- Creates multiple workspaces — one per editorial team (politics, culture, sport, tech)
- Uses RBAC to control which editors see which competitor intelligence
- Exports structured data via the API for custom BI visualisations

**Willingness to Pay:** £1,000–£3,000/month (enterprise contract)

---

## 5. User Stories

### 5.1 Content Discovery & Analysis

| ID    | As a...    | I want to...                                                                      | So that...                                                    | Priority    |
| ----- | ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------- |
| US-01 | Creator    | See a feed of high-performing videos in my niche from the last 14 days            | I can quickly spot what is working without manual research    | Must Have   |
| US-02 | Creator    | View a detailed breakdown of why a specific video scored high on viral potential  | I can understand which structural elements drove performance  | Must Have   |
| US-03 | Creator    | See the hook type and first-60-second structure of any analysed video             | I can understand opening patterns that retain viewers         | Must Have   |
| US-04 | Creator    | View thumbnail analysis (emotion, composition, CTR prediction) for any video      | I can understand visual patterns that drive click-through     | Must Have   |
| US-05 | Creator    | See a transcript summary with key sections identified                             | I can learn content structure without watching the full video | Should Have |
| US-06 | Strategist | Filter the video feed by viral score range, date, niche, language, and engagement | I can drill into the most relevant data for my clients        | Must Have   |
| US-07 | Any user   | Search across all videos, channels, and trends with keyword filters               | I can find specific content quickly without browsing          | Must Have   |

### 5.2 Trend Detection & Opportunities

| ID    | As a...    | I want to...                                                              | So that...                                                          | Priority    |
| ----- | ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------- |
| US-08 | Creator    | See which topics are growing rapidly in my niche right now                | I can create content about emerging topics before they peak         | Must Have   |
| US-09 | Creator    | Distinguish between emerging, evergreen, and declining topics             | I can prioritise long-term content investments over fleeting trends | Must Have   |
| US-10 | Creator    | See a ranked list of content opportunities (high demand, low competition) | I can pick the highest-leverage topics for my next videos           | Must Have   |
| US-11 | Strategist | See how fast a trend is accelerating (velocity score)                     | I can brief clients on urgency and optimal timing                   | Should Have |
| US-12 | Any user   | Be notified when a tracked topic spikes beyond a threshold                | I can act on trend signals in near real-time                        | Must Have   |

### 5.3 Watchlists & Competitive Intelligence

| ID    | As a...    | I want to...                                                                      | So that...                                              | Priority    |
| ----- | ---------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| US-13 | Creator    | Create a watchlist of competitor channels                                         | I can monitor what they publish without manual checking | Must Have   |
| US-14 | Creator    | Create a watchlist for a specific keyword or topic                                | I can track how the landscape for that topic evolves    | Must Have   |
| US-15 | Strategist | Set up a watchlist per client with their specific competitors                     | I can deliver targeted weekly intelligence per client   | Must Have   |
| US-16 | Any user   | Receive an alert when a watched channel publishes a video above a score threshold | I can respond to significant competitor content quickly | Must Have   |
| US-17 | Any user   | See the posting cadence and average performance metrics for any watched channel   | I can benchmark upload frequency and consistency        | Should Have |

### 5.4 AI Recommendations

| ID    | As a...  | I want to...                                                                      | So that...                                                                 | Priority    |
| ----- | -------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------- |
| US-18 | Creator  | Receive original title ideas inspired by high-performing title formulas           | I can start from a strong title concept rather than a blank page           | Must Have   |
| US-19 | Creator  | Receive an original hook concept for a video topic                                | I can open my video with a proven structural pattern adapted to my niche   | Must Have   |
| US-20 | Creator  | Receive an original content outline for a video idea                              | I can structure my video with a narrative arc that retains viewers         | Must Have   |
| US-21 | Creator  | Receive a thumbnail concept description (visual composition, emotion, text)       | I can brief a designer or create a thumbnail with intentional CTR strategy | Should Have |
| US-22 | Creator  | Receive keyword suggestions for a topic                                           | I can optimise my video metadata without manual keyword research           | Should Have |
| US-23 | Any user | Be confident that recommendations are original and not copied from other creators | I can use them without ethical or legal concern                            | Must Have   |

### 5.5 Alerts & Notifications

| ID    | As a...  | I want to...                                                 | So that...                                                     | Priority    |
| ----- | -------- | ------------------------------------------------------------ | -------------------------------------------------------------- | ----------- |
| US-24 | Any user | Configure alerts to be delivered to email                    | I can receive notifications in my existing workflow            | Must Have   |
| US-25 | Any user | Configure alerts to be delivered to a Discord channel        | I can share intelligence with my team in real-time             | Must Have   |
| US-26 | Any user | Configure alerts to be delivered to a Slack channel          | I can integrate intelligence into my team's communication tool | Must Have   |
| US-27 | Any user | Configure alerts to be delivered to Telegram                 | I can receive mobile notifications without email               | Should Have |
| US-28 | Any user | Configure a custom webhook URL for alerts                    | I can pipe alerts into any external system or automation       | Should Have |
| US-29 | Any user | Set the minimum viral score threshold that triggers an alert | I can control alert volume and relevance                       | Must Have   |

### 5.6 Export & Reporting

| ID    | As a...    | I want to...                                            | So that...                                                       | Priority     |
| ----- | ---------- | ------------------------------------------------------- | ---------------------------------------------------------------- | ------------ |
| US-30 | Strategist | Export video analysis data to CSV or Excel              | I can include data in client reports and spreadsheets            | Must Have    |
| US-31 | Strategist | Export a channel intelligence report as a PDF           | I can send a polished deliverable to clients directly            | Should Have  |
| US-32 | Any user   | Export trend data and opportunity rankings              | I can build custom analyses in external tools                    | Should Have  |
| US-33 | Developer  | Access all platform data via a REST API with an API key | I can integrate ViralScopes data into my own tools and workflows | Nice to Have |

### 5.7 Team & Organisation

| ID    | As a...      | I want to...                                      | So that...                                                             | Priority    |
| ----- | ------------ | ------------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| US-34 | Agency owner | Create multiple workspaces within my organisation | I can separate client accounts without creating separate subscriptions | Must Have   |
| US-35 | Agency owner | Invite team members with specific roles           | I can control what each team member can see and do                     | Must Have   |
| US-36 | Admin        | Assign Team Member or Viewer roles to colleagues  | I can give limited access to people who should not change settings     | Must Have   |
| US-37 | Any user     | Log in with Google or GitHub                      | I can access the platform without creating a new password              | Must Have   |
| US-38 | Any user     | Manage and revoke my API keys                     | I can control programmatic access to my organisation's data            | Should Have |

### 5.8 Billing & Account

| ID    | As a...  | I want to...                                                     | So that...                                                             | Priority  |
| ----- | -------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- | --------- |
| US-39 | Any user | Sign up for a free plan without a credit card                    | I can evaluate the platform before committing                          | Must Have |
| US-40 | Any user | Upgrade my plan via a Stripe-hosted checkout                     | I can subscribe securely without my card details touching the platform | Must Have |
| US-41 | Any user | Manage my subscription (change plan, cancel) via a Stripe portal | I can make billing changes without contacting support                  | Must Have |
| US-42 | Any user | See how much of my monthly quota I have used                     | I can plan my usage and avoid hitting limits unexpectedly              | Must Have |
| US-43 | Any user | Receive an email warning when I reach 80% of my monthly quota    | I am not surprised by a hard limit                                     | Must Have |

---

## 6. Functional Requirements

### 6.1 Content Discovery Engine

**FR-01:** The system shall discover YouTube videos published in the last 14 days with between 50,000 and 300,000 views, across configurable categories, languages, and regions, every 6 hours.

**FR-02:** Each discovered video shall be analysed through a sequential pipeline: metadata extraction → transcript extraction → thumbnail analysis → AI content analysis → viral score calculation → recommendation generation.

**FR-03:** The system shall deduplicate videos by `video_id` before inserting, ensuring no video is analysed more than once per 24-hour window without an explicit refresh request.

**FR-04:** The system shall store the following for each video: title, description, URL, view count, like count, comment count, duration, language, category, channel, thumbnail URL, publication date, and all computed analysis fields.

**FR-05:** If a video's captions are unavailable (no manual or auto-generated captions), the pipeline shall mark `transcript_status = unavailable` and continue with the remaining analysis steps that do not require transcript data.

### 6.2 Viral Score Engine

**FR-06:** The system shall compute a Viral Score (0–100) for every analysed video using a weighted algorithm incorporating: title formula score, thumbnail CTR prediction, hook classification confidence, views-per-day velocity, likes ratio, comments ratio, growth rate, topic trend score, and publication timing.

**FR-07:** Every Viral Score shall be accompanied by a confidence level (0–1) reflecting the completeness of available input data.

**FR-08:** Viral Score computation shall be deterministic for a given set of inputs — the same inputs must always produce the same score.

**FR-09:** The Viral Score algorithm weights shall be configurable via the Super Admin Panel without requiring a code deployment.

### 6.3 AI Analysis Pipeline

**FR-10:** All AI calls shall be executed asynchronously in background workflows. No AI call shall block an API request handler.

**FR-11:** AI outputs shall be validated against a predefined Zod schema before being stored. Invalid outputs shall trigger a dead-letter job and an admin notification.

**FR-12:** All AI responses shall be cached keyed by `(prompt_version, sha256(normalised_input))` with a 24-hour TTL. The same input shall never be sent to an AI API twice within the cache window.

**FR-13:** The system shall maintain a versioned library of all AI prompts in the database. Every AI call shall reference a specific prompt version.

**FR-14:** The Ethical Recommendation Engine shall produce only original output. The system prompt shall explicitly instruct the AI model not to reproduce, closely paraphrase, or structurally copy any creator's specific script, title, hook, or creative expression.

### 6.4 Trend Detection

**FR-15:** The system shall run a daily trend detection process that clusters analysed videos by topic using AI, classifies each cluster as emerging, evergreen, or declining, and computes a velocity score and opportunity score for each topic.

**FR-16:** The system shall maintain a ranked Opportunity List combining high demand, low competition, fast growth, and low content saturation for each detected topic.

### 6.5 Watchlists & Alerts

**FR-17:** Users shall be able to create watchlists targeting: a specific YouTube channel, a keyword or phrase, a niche/category, or a competitor channel.

**FR-18:** The system shall check all active watchlists every 6 hours and dispatch alerts when configured thresholds are met (viral score, upload detected, trend spike).

**FR-19:** Alert channels shall include: email (via transactional email service), Discord webhook, Slack webhook, Telegram bot, and custom HTTP webhook.

**FR-20:** Alert notifications shall be throttled to a maximum of one alert per rule per hour to prevent notification fatigue.

**FR-21:** All dispatched alerts shall be logged to `alert_events` with payload, channel, and timestamp.

### 6.6 Search

**FR-22:** The system shall provide a unified search across videos, channels, and trends.

**FR-23:** Search shall support filtering by: keyword (title/description match), channel name, topic/niche, language, date range, viral score range, and platform.

**FR-24:** Search results shall be paginated using cursor-based pagination. Maximum page size: 50 results.

### 6.7 Export

**FR-25:** Users shall be able to export video analysis data in CSV, Excel (XLSX), JSON, and PDF formats.

**FR-26:** Exports shall be generated asynchronously. The user shall receive a notification (in-app and email) when the export is ready for download.

**FR-27:** Export files shall be stored in object storage (S3) with a signed URL valid for 24 hours.

**FR-28:** Export quotas shall be enforced per plan (number of exports per billing period).

### 6.8 Authentication & Authorisation

**FR-29:** The system shall support email/password registration and login, Google OAuth, and GitHub OAuth.

**FR-30:** All new accounts shall require email verification before accessing the dashboard.

**FR-31:** Password reset links shall expire after 1 hour.

**FR-32:** Accounts shall be locked after 5 consecutive failed login attempts. Unlock shall require an email link.

**FR-33:** The system shall implement role-based access control with the following roles: `Super Admin`, `Admin`, `Owner`, `Team Member`, `Viewer`.

**FR-34:** The system shall support multiple organisations per user, multiple workspaces per organisation, and multiple projects per workspace.

**FR-35:** JWT access tokens shall expire after 15 minutes. Refresh tokens shall rotate on every use.

### 6.9 Billing & Subscriptions

**FR-36:** The system shall offer the following plan tiers: Free, Starter, Professional, Business, Enterprise.

**FR-37:** Plan limits shall be enforced on: videos analysed per month, API requests per day, watchlists, alert rules, team member seats, and exports per month.

**FR-38:** Stripe shall be the primary payment processor for MVP. Paddle and crypto billing are Post-MVP.

**FR-39:** Subscription changes (upgrade, downgrade, cancellation) shall be handled via the Stripe Customer Portal.

**FR-40:** A 3-day grace period shall apply on payment failure before access is restricted.

**FR-41:** Usage shall be tracked in real-time via Redis and persisted asynchronously to PostgreSQL.

### 6.10 API & Integrations

**FR-42:** The platform shall expose a REST API at `/api/v1/` with full OpenAPI documentation.

**FR-43:** API authentication shall support both JWT (web session) and API Key (Bearer token) authentication methods.

**FR-44:** Rate limiting shall be enforced per API key using Redis, with limits defined per subscription plan.

**FR-45:** All incoming webhook payloads (Stripe, Paddle, custom) shall have their signatures verified before processing.

### 6.11 GDPR & Data Management

**FR-46:** Users shall be able to permanently delete their account and all associated personal data via a self-service endpoint.

**FR-47:** Users shall be able to export all their personal data in machine-readable JSON format.

**FR-48:** A cookie consent banner shall be displayed on first visit. Non-essential cookies shall not be set before consent is given.

**FR-49:** Data retention policies shall be automatically enforced by nightly purge jobs. Retention periods are configurable per data type.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement                    | Target                   | Critical Threshold |
| ------------------------------ | ------------------------ | ------------------ |
| API p50 response time          | < 100ms                  | 200ms              |
| API p95 response time          | < 500ms                  | 1,000ms            |
| API p99 response time          | < 1,000ms                | 2,000ms            |
| Dashboard initial page load    | < 2.5s LCP               | 4s                 |
| Search results returned        | < 300ms                  | 800ms              |
| Video discovery cycle (6h)     | Completes in < 30min     | 60min              |
| Full video analysis pipeline   | < 5 minutes per video    | 15 minutes         |
| Alert dispatch latency         | < 2 minutes from trigger | 10 minutes         |
| Export generation (1,000 rows) | < 60 seconds             | 5 minutes          |

### 7.2 Scalability

- The system shall handle 10,000 concurrent users at MVP launch without degradation beyond the performance targets above.
- The video database shall be designed to accommodate 10 million video records without query performance degradation.
- The n8n workflow engine shall be horizontally scalable via additional worker instances.
- The database shall be designed with read replicas in mind from the start, even if not deployed at launch.

### 7.3 Availability & Reliability

- **Uptime target:** 99.9% monthly (≤ 43.8 minutes downtime per month).
- **Recovery Time Objective (RTO):** < 1 hour for any single service failure.
- **Recovery Point Objective (RPO):** < 24 hours for data loss scenarios (daily backups).
- All services shall expose `/health` and `/ready` endpoints for health check monitoring.
- Failed background jobs shall be retried up to 3 times with exponential backoff before being moved to the dead-letter queue.

### 7.4 Security

- All data in transit is encrypted using TLS 1.2 or higher.
- All data at rest is encrypted at the storage layer.
- PII is never logged at any log level.
- API keys are stored as `sha256(key)` only. Plaintext is shown once at creation and never stored.
- High or Critical severity CVEs in dependencies block CI and must be resolved within 48 hours.
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy) are set on all responses.

### 7.5 Observability

- All services emit structured JSON logs, collected centrally by Loki.
- All services expose Prometheus metrics scraped at 15-second intervals.
- Grafana dashboards cover: API latency, queue depth, job success/failure rate, DB connections, cache hit rate, YouTube API quota consumption.
- Alerts are configured for: service down, p95 latency exceeding critical threshold, error rate > 1%, dead-letter queue depth > 10, disk usage > 80%.

### 7.6 Maintainability

- TypeScript strict mode enforced across the entire codebase.
- Unit test coverage ≥ 80%. Integration test coverage ≥ 70%.
- All schema changes use reversible migration files.
- All AI prompts are stored in the database and editable without code deployment.
- All n8n workflow JSON files are version-controlled in the repository.

### 7.7 Compliance

- GDPR compliant: right to deletion, data export, cookie consent, privacy policy, terms of service.
- No PII stored in log files or monitoring systems.
- Data Processing Agreements available for Enterprise customers.
- All financial transactions processed by Stripe (and later Paddle) as compliant payment processors.

---

## 8. Success Metrics & KPIs

### 8.1 Business Metrics

| Metric                          | MVP Target (Month 3) | Year 1 Target |
| ------------------------------- | -------------------- | ------------- |
| Monthly Active Users (MAU)      | 500                  | 5,000         |
| Paying Customers                | 100                  | 1,000         |
| Monthly Recurring Revenue (MRR) | £5,000               | £75,000       |
| Annual Recurring Revenue (ARR)  | £60,000              | £900,000      |
| Free-to-Paid Conversion Rate    | > 5%                 | > 8%          |
| Monthly Churn Rate              | < 8%                 | < 5%          |
| Net Revenue Retention (NRR)     | > 100%               | > 110%        |
| Customer Acquisition Cost (CAC) | < £150               | < £100        |
| Lifetime Value (LTV)            | > £450               | > £800        |
| LTV:CAC Ratio                   | > 3:1                | > 8:1         |

### 8.2 Product Engagement Metrics

| Metric                                              | Target      |
| --------------------------------------------------- | ----------- |
| Daily Active Users / Monthly Active Users (DAU/MAU) | > 30%       |
| Average session duration                            | > 8 minutes |
| Videos analysed per paying user per month           | > 20        |
| Watchlists created per organisation                 | > 3         |
| Alerts configured per organisation                  | > 2         |
| Exports generated per paying user per month         | > 2         |
| Recommendations viewed per user per session         | > 3         |

### 8.3 Technical Performance KPIs

| Metric                               | Target               |
| ------------------------------------ | -------------------- |
| Platform uptime                      | ≥ 99.9%              |
| API p95 response time                | < 500ms              |
| Video analysis pipeline success rate | > 98%                |
| Dead-letter job rate (% of jobs)     | < 0.5%               |
| AI cache hit rate                    | > 60%                |
| YouTube API quota utilisation        | < 80% of daily limit |
| CI pipeline success rate             | > 95%                |
| Mean Time to Recovery (MTTR)         | < 60 minutes         |

### 8.4 User Satisfaction Metrics

| Metric                                           | Target             |
| ------------------------------------------------ | ------------------ |
| Net Promoter Score (NPS)                         | > 40               |
| Customer Satisfaction Score (CSAT)               | > 4.2 / 5          |
| Support ticket resolution time (P1)              | < 4 hours          |
| Support ticket resolution time (P2)              | < 24 hours         |
| Onboarding completion rate                       | > 70%              |
| Feature adoption (Watchlists used within 7 days) | > 50% of new users |

---

## 9. Technical Requirements

### 9.1 Technology Stack

| Layer               | Technology                          | Rationale                                                           |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| Frontend            | Next.js 14+ (App Router)            | SSR/SSG, excellent DX, App Router for server components             |
| Frontend state      | TanStack Query (React Query)        | Best-in-class server state management                               |
| Frontend UI         | Tailwind CSS + shadcn/ui            | Utility-first, accessible, customisable components                  |
| Backend API         | Fastify + TypeScript                | High-performance Node.js framework with strong typing support       |
| Input validation    | Zod                                 | Runtime validation with TypeScript type inference                   |
| Database            | PostgreSQL via Supabase             | Reliable, scalable, with built-in auth and RLS                      |
| ORM / Migrations    | Drizzle ORM                         | Type-safe queries, lightweight, excellent migration tooling         |
| Cache / Queue       | Redis (Upstash or self-hosted)      | Sub-millisecond cache, BullMQ for job queuing                       |
| Workflow automation | n8n (self-hosted)                   | Visual workflow builder, supports complex pipelines, self-hostable  |
| Object storage      | Cloudflare R2 / AWS S3              | S3-compatible, low egress cost (R2), reliable                       |
| Email service       | SendGrid or Resend                  | Transactional email with template support and delivery tracking     |
| AI models           | Claude API (Anthropic) + OpenAI API | Claude for reasoning; GPT-4o for structured extraction              |
| Payments            | Stripe                              | Industry standard, excellent webhook support, Customer Portal       |
| Containerisation    | Docker + Docker Compose             | Consistent environments across dev, staging, production             |
| Deployment          | Coolify (self-hosted PaaS)          | Self-hosted Heroku alternative, Traefik integration, cost-effective |
| Reverse proxy       | Traefik                             | Automatic SSL, service discovery, health checks                     |
| Monitoring          | Prometheus + Grafana                | Industry standard observability stack                               |
| Logging             | Pino + Loki                         | Structured JSON logs, centralised collection                        |
| CI/CD               | GitHub Actions                      | Native GitHub integration, extensive ecosystem                      |
| Monorepo            | Turborepo                           | Efficient builds and caching in a monorepo                          |

### 9.2 Data Architecture

- **Primary database:** PostgreSQL (Supabase) with Row Level Security enforced on all tenant-scoped tables.
- **Read replicas:** Planned for v1.5 when read traffic warrants it.
- **Caching layer:** Redis for API rate limiting, session tokens, feature flags, AI response cache, and usage counters.
- **Queue:** BullMQ on Redis for all background job queuing between the API and n8n.
- **Object storage:** Cloudflare R2 (production) / MinIO (development) for thumbnails, exports, and cached AI responses.
- **Future analytics:** ClickHouse for high-cardinality analytics queries at scale (v2 target).

### 9.3 External Service Dependencies

| Service                | Purpose                                | Criticality | Fallback                 |
| ---------------------- | -------------------------------------- | ----------- | ------------------------ |
| YouTube Data API v3    | Video discovery and metadata           | Critical    | RapidAPI YouTube / Apify |
| Claude API (Anthropic) | Strategic AI analysis, recommendations | High        | GPT-4o (fallback model)  |
| OpenAI API             | Structured data extraction, embeddings | High        | Claude (fallback model)  |
| Stripe                 | Payment processing, subscriptions      | Critical    | Paddle (Post-MVP)        |
| SendGrid / Resend      | Transactional email                    | High        | SMTP fallback            |
| Cloudflare R2 / AWS S3 | Object storage                         | High        | MinIO (self-hosted)      |
| Supabase               | Database hosting, auth                 | Critical    | Self-hosted PostgreSQL   |

### 9.4 Infrastructure Requirements

- All services run in Docker containers managed by Docker Compose.
- Production deployment managed by Coolify on a dedicated VPS or cloud instance.
- Minimum production server spec: 8 vCPU, 32GB RAM, 500GB SSD (scalable).
- Traefik handles all SSL termination and service routing.
- Cloudflare is used as the CDN and DDoS protection layer in front of the Next.js frontend.
- Automated daily database backups with 30-day retention, stored in object storage.

---

## 10. Risks & Mitigations

| #    | Risk                                                            | Probability | Impact   | Mitigation                                                                                                     |
| ---- | --------------------------------------------------------------- | ----------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| R-01 | YouTube API quota exhaustion (10,000 units/day free tier)       | High        | Critical | Quota manager service; cache-first strategy (24h); RapidAPI/Apify fallback; per-plan quota allocation          |
| R-02 | AI API cost explosion at scale                                  | High        | High     | Tiered analysis (only high-score candidates get full AI); aggressive caching; batch processing; cost alerts    |
| R-03 | n8n instability at high job volume                              | Medium      | High     | Dead-letter queue; retry logic; horizontal worker scaling; workflow idempotency                                |
| R-04 | Scope creep delaying MVP                                        | High        | High     | Strict MVP scope definition; post-MVP backlog maintained; phase gating                                         |
| R-05 | GDPR non-compliance                                             | Low         | Critical | GDPR phase baked into pre-launch roadmap; right to deletion; data export; DPA for Enterprise                   |
| R-06 | Creator community backlash (perceived as tool to copy creators) | Medium      | High     | Ethical AI constraint enforced at product, prompt, and engineering levels; clear public communication          |
| R-07 | Stripe / payment processor downtime                             | Low         | High     | Grace period on payment failure; Paddle as backup processor (Post-MVP)                                         |
| R-08 | Supabase service degradation                                    | Low         | Critical | Connection pooling (PgBouncer); read replica planned; daily backups with tested restore procedure              |
| R-09 | Security breach / data leak                                     | Low         | Critical | RLS on all tables; audit logging; API key hashing; secrets management; dependency scanning in CI               |
| R-10 | Key person dependency                                           | Medium      | Medium   | Engineering standards documented; all decisions logged; pair programming on critical systems                   |
| R-11 | YouTube changes its API terms or pricing                        | Low         | High     | Multi-source strategy (RapidAPI, Apify) as hedging; platform-agnostic data model                               |
| R-12 | AI model deprecation or pricing change                          | Medium      | Medium   | Abstraction layer for AI providers; Claude and OpenAI as dual providers; prompt versioning for quick migration |

---

## 11. Assumptions & Constraints

### 11.1 Assumptions

> Items marked `[ASSUMPTION]` are working assumptions that should be validated as early as possible.

- `[ASSUMPTION]` The YouTube Data API v3 free tier (10,000 units/day) is sufficient for MVP-scale discovery when combined with a cache-first strategy and a quota manager.
- `[ASSUMPTION]` The target market (creators, agencies, media teams) is willing to pay a recurring monthly subscription for content intelligence tools in the £40–£500/month range.
- `[ASSUMPTION]` English-language content represents sufficient market depth for the MVP; multi-language expansion is a v2 feature.
- `[ASSUMPTION]` Claude and GPT-4o will remain available at current API pricing for at least 12 months post-launch.
- `[ASSUMPTION]` n8n (self-hosted) is a sufficient workflow engine for the MVP-scale job volume (estimated < 50,000 jobs/day at launch).
- `[ASSUMPTION]` Supabase's hosted PostgreSQL instance provides sufficient performance and reliability for the MVP without read replicas.
- `[ASSUMPTION]` Creators and agencies consider "pattern analysis leading to original content" to be ethically acceptable; the platform does not facilitate direct content copying.

### 11.2 Constraints

- **YouTube API:** The free tier provides 10,000 quota units per day. A search request costs 100 units. Video details cost 1–3 units. Discovery at scale requires a paid tier or supplemental data sources.
- **AI cost:** At current OpenAI/Anthropic pricing, full AI analysis of one video (transcript + thumbnail + full analysis + recommendations) costs approximately $0.05–$0.15 per video. At 10,000 videos/day, this is $500–$1,500/day without caching. Tiered analysis and aggressive caching are not optional — they are mandatory for financial viability.
- **Budget:** The MVP is designed to be deployable on a $200–$400/month cloud infrastructure budget.
- **Team:** The initial build is assumed to be a small team (1–3 engineers). Architecture and documentation standards are designed to support this.
- **Timeline:** The MVP target is 16–20 weeks from project initiation to production deployment.

---

## 12. Future Roadmap

_This section provides a high-level product roadmap. For the detailed technical roadmap with phases, dependencies, and task checklists, see [ROADMAP.md](./ROADMAP.md)._

### 12.1 MVP (v1.0) — Months 1–5

**Scope:** YouTube content discovery, viral scoring, trend detection, AI recommendations, dashboard, watchlists, alerts (email/Discord/Slack/Telegram), search, export, Stripe billing, GDPR compliance, production deployment.

**Success condition:** 100 paying customers, £5,000 MRR, < 8% monthly churn.

### 12.2 Version 1.5 — Months 6–9

- AI Chat Interface (ask questions about your niche in natural language)
- Scheduled weekly PDF reports delivered by email
- Trend Prediction Engine (estimate probability of continued growth)
- Database read replicas for improved query performance
- Chrome Extension for one-click YouTube video analysis
- Paddle billing integration (merchant of record, global tax compliance)

### 12.3 Version 2.0 — Months 10–18

- TikTok analytics connector
- Instagram analytics connector
- Mobile application (React Native, iOS + Android)
- Public REST API & SDKs (JavaScript, Python)
- Team collaboration features (comments, task assignments, shared annotations)
- Crypto billing (USDC/USDT invoice-based)
- Simplified affiliate and referral system
- White-label deployment option for agencies
- Multi-language content support (Spanish, Portuguese, German, French)

### 12.4 Version 3.0 — Months 18–30

- Plugin marketplace for third-party integrations
- Custom AI models (fine-tuned viral scoring per niche)
- Facebook, X (Twitter), LinkedIn, and podcast analytics
- Enterprise SSO (SAML, OIDC)
- Advanced fraud detection (ML-based)
- Dynamic pricing intelligence (rule-based, then ML)
- ClickHouse for high-cardinality analytics at scale

### 12.5 Version 4.0+ — Post Year 2

> These features require 2+ years of real transaction and behavioural data to function correctly. Do not build before that data exists.

- Autonomous Financial AI (pricing and routing autopilot)
- Self-Evolving Monetisation OS
- Global Payment Routing AI (ML-powered provider selection)
- Multi-touch attribution engine
- Reinforcement learning pricing models

---

_This PRD is a living document. It is updated when new features are added to scope, requirements change, or assumptions are validated or invalidated. All changes require a pull request with at least one approving review._

---

**Related Documents:**

- [PROJECT_RULES.md](./PROJECT_RULES.md) — Engineering standards
- [ROADMAP.md](./ROADMAP.md) — Detailed technical roadmap with phases and tasks
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current progress and blockers
- [INFRASTRUCTURE_GROWTH_PLAN.md](./INFRASTRUCTURE_GROWTH_PLAN.md) — Infrastructure evolution
- [CHANGELOG.md](./CHANGELOG.md) — Version history
