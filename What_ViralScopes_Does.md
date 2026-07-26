# What_ViralScopes_Does.md
# What ViralScopes.io Does — Complete Business Overview

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Audience:** Developers, investors, stakeholders, new team members
> **Cross-references:** [PRD.md](./PRD.md) · [ROADMAP.md](./ROADMAP.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md)

---

> This document explains ViralScopes.io clearly enough that a new developer, investor, or stakeholder can understand the business, the product, and the opportunity without any additional context.

---

## Table of Contents

1. [The One-Sentence Summary](#1-the-one-sentence-summary)
2. [Product Vision](#2-product-vision)
3. [Mission](#3-mission)
4. [The Problem Being Solved](#4-the-problem-being-solved)
5. [The Solution](#5-the-solution)
6. [Value Proposition](#6-value-proposition)
7. [Target Audience](#7-target-audience)
8. [Customer Personas](#8-customer-personas)
9. [Core Features](#9-core-features)
10. [Premium Features](#10-premium-features)
11. [User Journey](#11-user-journey)
12. [Typical Workflows](#12-typical-workflows)
13. [Competitive Advantages](#13-competitive-advantages)
14. [Competitive Landscape](#14-competitive-landscape)
15. [Business Model](#15-business-model)
16. [Monetisation Strategy](#16-monetisation-strategy)
17. [Future Expansion Opportunities](#17-future-expansion-opportunities)
18. [Long-Term Vision](#18-long-term-vision)

---

## 1. The One-Sentence Summary

> **ViralScopes.io uses AI to analyse why YouTube videos go viral and gives creators the structural patterns — never the copied content — to create original high-performing content of their own.**

---

## 2. Product Vision

ViralScopes.io is the intelligence layer between a creator and their next breakthrough.

The platform transforms the chaotic, luck-driven process of content creation into a structured, data-informed discipline. It does this by continuously monitoring YouTube at scale, extracting the underlying structural patterns behind viral performance, and delivering those patterns as actionable, original creative guidance.

The vision is a world where every creator — whether a solo YouTuber with 10,000 subscribers or a media company with 10 million — has access to the same calibre of content intelligence that was previously available only to the largest studios with dedicated research teams.

---

## 3. Mission

> **To give every content creator access to the data-driven content strategy tools that were previously reserved for large media companies — without ever compromising the originality or integrity of their creative work.**

Three principles underpin this mission:

1. **Analyse patterns, not content.** ViralScopes studies the structure of what works — hook types, title formulas, narrative arcs, thumbnail compositions — not the specific words, ideas, or creative choices of individual creators.

2. **Inspire originality, never copy.** Every recommendation the platform generates is original. The AI is explicitly instructed not to reproduce, paraphrase, or closely imitate any creator's work.

3. **Make data accessible.** Complex content analytics should not require a data science team to interpret. ViralScopes surfaces insights in plain language, with clear context about why something matters.

---

## 4. The Problem Being Solved

### The Creator's Dilemma

The YouTube creator economy is enormous — over 50 million creators globally, with tens of thousands earning a full-time income from their content. Yet the difference between a video that earns 500 views and one that earns 5 million views is rarely about production quality, budget, or even effort. It is almost always about structural decisions made in the first 30 seconds of a video and in the 10 seconds before the viewer clicks play:

- **The hook** — does the opening compel the viewer to keep watching?
- **The title** — does it trigger curiosity without being clickbait?
- **The thumbnail** — does it communicate emotion and promise in a single glance?
- **The topic timing** — is this subject trending upward or already declining?
- **The narrative arc** — does the video structure retain attention through to the end?

Most creators have no systematic way to answer these questions. They make decisions based on gut instinct, observe results weeks later when it is too late to adjust, and repeat the cycle.

### The Specific Gaps

| Gap | Current reality | Impact |
|---|---|---|
| **No competitor analysis tool** | Creators manually watch competitor videos — hours per week | 5–10 hours of unstructured research weekly, with no synthesis |
| **No trend early-warning system** | Trends are discovered after they peak | Creators produce content about topics that are already declining |
| **No structural pattern analysis** | Creators know a video performed well but not why | Cannot systematically replicate success |
| **No original content ideation engine** | AI tools like ChatGPT have no access to real video data | Generic suggestions with no grounding in what is actually working |
| **No single intelligence platform** | Creators use 4–6 separate tools (VidIQ, Social Blade, TubeBuddy, Google Trends, Notion, Sheets) | Fragmented workflow; no synthesised view |
| **No ethical framework** | Some tools encourage copying successful content | Legal risk and community backlash for creators |

### Who Suffers Most

- **Independent creators** spending Sunday evenings manually watching competitor videos instead of creating
- **Agency content strategists** producing weekly briefs from 20+ hours of manual research
- **In-house brand teams** unable to justify content investment decisions to senior leadership without data
- **Media companies** managing 50+ competitor channels with no systematic monitoring

---

## 5. The Solution

ViralScopes.io is a SaaS platform that automates the entire content intelligence workflow:

```
Discover → Analyse → Score → Detect Trends → Recommend → Alert
```

### Step 1 — Discover
Every 6 hours, ViralScopes crawls YouTube via the official YouTube Data API, filtering for videos that show high engagement signals relative to their age. It captures metadata, thumbnails, transcripts, and channel data.

### Step 2 — Analyse
Each discovered video passes through a multi-stage AI analysis pipeline:
- **Transcript analysis** — summary, hook identification, CTA, narrative structure, key sections
- **Thumbnail vision analysis** — emotion, faces, objects, colours, composition, CTR prediction
- **Title formula detection** — identifies the structural template (e.g. "How I Did X in Y Days", "The Truth About X", "Why You Should Never Do X")
- **Hook classification** — classifies the opening technique (Question, Shock, Statistic, Promise, Story, Mystery, Fear, Curiosity, Humour)
- **Full content analysis** — story structure, target audience, emotional tone, retention tactics, virality drivers, weaknesses

### Step 3 — Score
A proprietary **Viral Score (0–100)** is computed for every video from 9 weighted signals: title formula strength, thumbnail CTR prediction, hook classification confidence, views-per-day velocity, likes ratio, comments ratio, topic trend score, growth rate, and publication timing. Every score includes a confidence level.

### Step 4 — Detect Trends
Daily, the platform clusters all analysed videos by topic using AI and classifies each cluster as **emerging**, **evergreen**, or **declining**. It computes velocity and opportunity scores so creators know not just what is trending, but how fast and whether it is worth acting on.

### Step 5 — Recommend
For each high-performing video, the platform generates **original** creative guidance:
- A fresh title concept (inspired by the detected formula, not copied)
- A fresh hook concept (inspired by the detected technique, not copied)
- An original content outline
- A thumbnail concept description (for a designer or AI image tool)
- Keyword suggestions for metadata optimisation

The AI is explicitly constrained from reproducing any creator's specific words, phrases, or creative choices.

### Step 6 — Alert
Teams configure watchlists for channels, keywords, niches, or competitors. When a watched channel uploads a video scoring above a threshold, or when a tracked topic spikes, alerts are dispatched via Email, Discord, Slack, Telegram, or a custom webhook — within 2 minutes of the trigger event.

---

## 6. Value Proposition

### For Independent Creators

> *"Stop guessing what works. Start understanding why."*

- Replace 5+ hours of weekly manual research with a Monday morning dashboard review
- Know which topics are growing before they peak — not after
- Get original title and hook ideas grounded in what is actually working in your niche
- Understand exactly why your best videos performed well so you can replicate the structure

### For Agencies

> *"Deliver data-backed content strategy at scale — without scaling headcount."*

- Set up competitive watchlists for every client in minutes
- Deliver weekly intelligence briefings generated from real data, not manual research
- Justify every content recommendation with a Viral Score and trend data
- Produce export-ready reports for client presentations

### For Brands & Media Teams

> *"Content investment decisions backed by data, not instinct."*

- Benchmark your channel against competitors with objective viral scoring
- Build content calendars from opportunity data, not gut feeling
- Alert the team when a competitor publishes something significant
- Export structured data for integration into internal BI dashboards

### For Enterprise

> *"The content intelligence infrastructure your whole team can act on."*

- Multiple workspaces — one per team, client, or product line
- Granular RBAC — control what each team member can see and do
- Public API — pipe ViralScopes data into your existing tools
- SLA-backed uptime and dedicated support

---

## 7. Target Audience

### Primary Markets (MVP)

| Segment | Description | Estimated global size |
|---|---|---|
| Independent creators | Solo creators managing their own channels (10k–1M subscribers) | ~50 million |
| Creator agencies | Agencies managing content strategy for multiple creator clients | ~500,000 businesses |
| In-house brand teams | Brands using YouTube as a marketing and content channel | ~2 million teams |
| Digital media companies | Publishers with YouTube presences managing content at scale | ~100,000 companies |

### Geographic Focus (MVP)

English-language content and English-speaking markets: United States, United Kingdom, Canada, Australia, Ireland.

### Secondary Markets (v2.0+)

Spanish, Portuguese, German, French, and Hindi language markets following multi-language content support launch.

---

## 8. Customer Personas

### Persona 1 — Maya, the Growth-Focused Independent Creator

| Property | Detail |
|---|---|
| **Age** | 28 |
| **Role** | Full-time YouTube creator, Tech & Productivity niche |
| **Channel** | 180,000 subscribers |
| **Team** | Solo, occasional freelance editor |
| **Location** | London, UK |

**Her situation:** Maya went full-time on YouTube 18 months ago. She is growing but inconsistently — some videos get 200,000 views while similar ones get 8,000. She cannot identify why. She spends every Sunday evening watching competitor videos and making notes in Notion, which takes 4–5 hours.

**What she wants:** To understand which structural decisions drive her best videos, find topics before they peak, and spend her Sunday evenings relaxing instead of researching.

**How ViralScopes helps:** Maya checks the Trending dashboard every Monday morning. Within 20 minutes she has identified three emerging topics in her niche, reviewed Viral Score breakdowns on the competitor videos she was planning to manually watch, and generated three original title concepts to start her week.

**Willingness to pay:** £39–£79/month

---

### Persona 2 — Daniel, the Agency Content Strategist

| Property | Detail |
|---|---|
| **Age** | 34 |
| **Role** | Head of Content Strategy at a mid-size creator agency |
| **Team** | 12 people, 8 creator clients |
| **Clients** | Fashion, fitness, finance, lifestyle creators |
| **Location** | Manchester, UK |

**His situation:** Daniel's agency manages 8 creator clients and promises weekly content strategy briefs. Each brief currently takes 2.5 hours to produce manually — 20 hours per week of research that does not directly generate revenue. He is the bottleneck.

**What he wants:** To produce better briefs faster, scale the agency without hiring more strategists, and justify his strategy recommendations with data his clients can see.

**How ViralScopes helps:** Daniel sets up a workspace per client with competitor watchlists. Each Monday he reviews the previous week's alert digest, checks the opportunity rankings for each client's niche, and uses the AI recommendations to draft content briefs. Total time: 3 hours for all 8 clients instead of 20.

**Willingness to pay:** £199–£499/month

---

### Persona 3 — Priya, the In-House Brand Content Manager

| Property | Detail |
|---|---|
| **Age** | 31 |
| **Role** | YouTube Content Manager at a consumer tech brand |
| **Team** | 4 people (herself, 2 producers, 1 editor) |
| **Channel** | 320,000 subscribers |
| **Location** | Dublin, Ireland |

**Her situation:** Priya's channel performs well but she struggles to justify content investment decisions to her CMO without hard data. She knows competitor channels are outperforming hers on certain formats but cannot quantify why or produce a data-backed plan to respond.

**What she wants:** Objective benchmarking data, competitor monitoring, and a content calendar built on opportunity data rather than team instinct.

**How ViralScopes helps:** Priya uses the channel comparison tool to benchmark her channel against 5 competitors. She exports a monthly competitor analysis report for CMO presentations. She uses the Opportunity Engine to build a data-backed content calendar for the next quarter.

**Willingness to pay:** £149–£299/month (company budget)

---

### Persona 4 — James, the Enterprise Media Director

| Property | Detail |
|---|---|
| **Age** | 45 |
| **Role** | Director of Digital Content, national publisher |
| **Team** | 30+ people across editorial, video, social, data |
| **Location** | London, UK |

**His situation:** James oversees YouTube strategy for a publisher with 50+ competitor channels to monitor. Current tools are either too lightweight for his scale or require dedicated data engineering to integrate. He needs enterprise-grade access control so different editorial teams can only see their relevant competitor intelligence.

**What he wants:** Systematic competitive monitoring at scale, RBAC for team access control, API access for internal BI integration, and SLA-backed uptime with dedicated support.

**How ViralScopes helps:** James creates workspaces per editorial team (Politics, Culture, Sport, Tech), each with their own competitor watchlists. His data team uses the Public API to pipe ViralScopes data into internal Tableau dashboards. He has a dedicated account manager for onboarding and quarterly reviews.

**Willingness to pay:** £1,000–£3,000/month (enterprise contract)

---

## 9. Core Features

All features below are available at MVP launch (v1.0).

### Video Discovery Engine
- Automated discovery of YouTube videos every 6 hours
- Filters: published in the last 14 days, 50,000–300,000 views, configurable by category, language, and region
- Deduplication prevents the same video being processed twice within 24 hours
- Covers any niche: technology, fitness, finance, cooking, gaming, education, and more

### Viral Score Engine
- Proprietary 0–100 score computed for every video
- 9 weighted signals: title formula strength, thumbnail CTR prediction, hook confidence, views/day velocity, likes ratio, comments ratio, topic trend score, growth rate, publication timing
- Confidence level included with every score
- Deterministic — same inputs always produce the same score
- Score weights configurable from the Super Admin Panel without code deployment

### AI Analysis Pipeline
- **Transcript analysis** — summary, hook identification, call-to-action, narrative sections, ending
- **Thumbnail vision analysis** — emotion, faces, objects, colours, contrast, text density, CTR prediction
- **Title formula detection** — structural pattern classification ("How I X", "The Truth About X", "Why You Should X", etc.)
- **Hook classification** — 9 hook types: Question, Shock, Statistic, Fear, Story, Mystery, Promise, Curiosity, Humour
- **Full content analysis** — story structure, target audience, emotional tone, retention tactics, virality drivers, key themes, weaknesses

### Trend Detection
- Daily topic clustering using AI across all analysed videos
- Three-way classification: Emerging, Evergreen, Declining
- Velocity score: how fast is this topic growing?
- Opportunity score: demand × growth ÷ competition
- Actionable timeline context: how long is this window?

### Opportunity Engine
- Ranked list of content opportunities combining high demand, low competition, fast growth, and low saturation
- Filterable by niche, language, and minimum opportunity score
- Updated weekly with a full refresh

### Ethical Recommendation Engine
- Generates **original** content ideas inspired by structural patterns — never copied
- Per video: fresh title concept, hook concept, content outline, thumbnail description, keyword suggestions, CTA idea
- AI system prompt explicitly prohibits reproducing any creator's specific words or creative choices
- Every recommendation is clearly labelled as AI-generated creative guidance, not a finished asset

### Watchlists
- Four watchlist types: Channel, Keyword, Niche, Competitor
- Monitor any YouTube channel or topic continuously
- View posting cadence, average performance, and trend trajectory for any watched entity
- Unlimited watchlists on Business and Enterprise plans

### Alert System
- Five delivery channels: Email, Discord webhook, Slack webhook, Telegram bot, Custom HTTP webhook
- Configurable trigger types: video viral score above threshold, trend spike, watched channel upload, breakout prediction
- Notification throttling: maximum 1 alert per rule per hour
- Full alert history with payload inspection

### Unified Search
- Search across videos, channels, and trends simultaneously
- 8 filter dimensions: keyword, channel name, topic, language, date range, viral score range, platform, category
- Cursor-based pagination for large result sets
- Results grouped by type

### Export System
- Four export formats: CSV, Excel (XLSX), JSON, PDF
- Exports generated asynchronously — user notified by email and in-app when ready
- Signed download links valid for 24 hours
- Export history with status and re-download capability

### Multi-Tenant Organisation System
- Organisations with multiple workspaces and projects
- 5 RBAC roles: Super Admin, Admin, Owner, Team Member, Viewer
- Member invitations via email link
- Session management: view all active sessions, revoke remotely
- Audit log for all significant actions

### Dashboard
- Home: KPI cards, recent activity feed
- Trending: latest high-performing videos with all filters
- Videos: searchable, filterable table with viral score badges
- Video Detail: full analysis breakdown with all AI outputs
- Channels: profiles, growth charts, upload frequency heatmap
- Trends: velocity charts, topic cluster visualisation
- Opportunities: ranked cards with demand/competition/growth indicators
- Recommendations: original AI content ideas per video
- Watchlists: management and latest activity per list
- Alerts: rule builder, channel configuration, notification history
- Search: unified cross-type search
- Export: trigger and download exports
- Settings: profile, organisation, billing, team, API keys
- Admin: job logs, dead-letter queue, quota, system health (admin roles only)

---

## 10. Premium Features

Features available on higher-tier plans or as post-MVP additions.

### Business & Enterprise Plan Features (MVP)
- Multiple workspaces per organisation
- Scheduled export delivery
- API key access (rate limits per plan)
- Priority job queue (analyses processed faster)
- Extended data retention (up to 13 months vs 90 days on Starter)
- Dedicated account manager (Enterprise)
- SLA-backed uptime guarantee (Enterprise)
- Data Processing Agreement / DPA (Enterprise)

### v1.5 Features (Month 8)
- **AI Chat Interface** — Ask natural language questions about your niche from any page
- **Scheduled PDF Reports** — Weekly briefings auto-delivered by email
- **Chrome Extension** — Analyse any YouTube video directly from the browser
- **Trend Prediction Engine** — Probability score for whether a topic will continue growing

### v2.0 Features (Month 18)
- **TikTok Analytics** — Full platform support for TikTok content discovery and scoring
- **Instagram Analytics** — Reels discovery and viral scoring
- **Mobile App** — iOS and Android companion app
- **Public API & SDKs** — Full programmatic access with JavaScript and Python SDKs
- **Team Collaboration** — Comments, tasks, and annotations on analyses
- **Affiliate Programme** — Referral tracking and commission payouts
- **White-Label Deployment** — Custom-branded deployments for agencies

---

## 11. User Journey

### From Signup to First Value (Target: Under 10 Minutes)

```
1. Visit viralscopes.io
       │
       ▼
2. Sign up (email/password or Google/GitHub OAuth)
       │
       ▼
3. Verify email
       │
       ▼
4. Onboarding Step 1: Create or join an organisation
       │
       ▼
5. Onboarding Step 2: Choose a plan (or start free)
       │
       ▼
6. Onboarding Step 3: Set your first watchlist
   (e.g. "Personal Finance" keyword or "Graham Stephan" channel)
       │
       ▼
7. Product tour: guided tooltips through the dashboard
       │
       ▼
8. Home dashboard: see the first batch of trending videos
   in the topic area related to your watchlist
       │
       ▼
9. Click a video to see its Viral Score breakdown and
   AI analysis → understand why it performed
       │
       ▼
10. View AI recommendations for original content ideas
    inspired by the video's structural patterns
       │
       ▼
11. First value delivered ✓
    (Creator now has 3 original content ideas grounded
     in what is actually working in their niche)
```

### Ongoing Weekly Workflow (Returning User)

```
Monday morning →
  Check Home dashboard (5 min)
  Review new high-scoring videos in niche (10 min)
  Check Trends for emerging topics (5 min)
  Review Opportunities for the week (5 min)
  Export or note top content ideas (5 min)
─────────────────
Total: 30 minutes replacing 5+ hours of manual research
```

---

## 12. Typical Workflows

### Workflow A — Independent Creator: Weekly Content Planning

**User:** Maya (independent creator, tech niche)

1. Opens ViralScopes every Monday
2. Checks the **Trending** page filtered to her niche and language — reviews the top 10 videos from the past 7 days by viral score
3. Clicks on a high-scoring video she had not seen — reads the AI analysis: hook type (Statistic), title formula ("You're Doing X Wrong — Here's Why"), thumbnail emotion (Surprise), key virality drivers
4. Opens **Opportunities** — sees "AI productivity tools for students" ranked #1 this week with high demand, low competition, and fast growth
5. Opens **Recommendations** for a similar video already in the system — gets 3 original title concepts, 2 hook ideas, and a content outline she can take straight to scripting
6. Creates an alert for when a specific competitor channel uploads — configured to send to her Discord
7. Done in 25 minutes. Has a data-backed content plan for the week.

---

### Workflow B — Agency Strategist: Weekly Client Brief

**User:** Daniel (agency, 8 clients)

1. Opens ViralScopes to the **Fitness** client workspace
2. Reviews the weekly alert digest — 3 competitor channels uploaded high-scoring videos
3. Checks the **Channel Intelligence** page for each competitor channel — sees their posting cadence has increased and average scores have risen
4. Opens the **Opportunities** page for fitness — identifies "cortisol and morning routine" as an emerging topic his client has not covered yet
5. Exports the channel analysis report as PDF
6. Switches to the **Finance** client workspace — repeats the process
7. After reviewing all 8 client workspaces: has 8 complete first-draft content briefs with competitive context, opportunity data, and original content ideas
8. Total time: 3 hours, down from 20 hours

---

### Workflow C — Brand Team: Competitive Benchmarking

**User:** Priya (brand content manager, tech company)

1. Navigates to **Channels** — has 5 competitor channels on her watchlist
2. Reviews each channel's average viral score, posting frequency, and top-performing video this month
3. Identifies that a competitor has found a high-performing format she has not tried (Reaction + Tutorial hybrid)
4. Clicks into the competitor's highest-scoring video — reads the full AI analysis
5. Views **Recommendations** for original content that uses the same structural format without copying the specific video
6. Exports the competitive analysis as Excel for a CMO presentation
7. Sets a new alert: notify the team on Slack whenever that competitor posts a video scoring above 75

---

### Workflow D — Developer: API Integration

**User:** Enterprise customer's data team

1. Generates an API key in **Settings → API Keys**
2. Uses the ViralScopes REST API to pull the last 30 days of viral score data for their watchlist
3. Pipes the data into Tableau for a custom executive dashboard
4. Sets up a webhook to push new high-scoring videos into their internal Slack bot in real-time
5. Schedules a weekly API pull for trend data to feed their content planning spreadsheet

---

## 13. Competitive Advantages

### Unique Differentiators

| Advantage | Description | Competitors have this? |
|---|---|---|
| **Proprietary Viral Score** | A single, transparent 0–100 score combining 9 signals. Explainable, not a black box. | No |
| **Ethical AI framework** | Explicitly constrained to generate only original output. Documented at the product, prompt, and code level. | No |
| **Structural pattern analysis** | Analyses hook types, title formulas, narrative arcs — not just keyword density or view counts | No |
| **Transcript + thumbnail + title + AI synthesis** | Four independent analysis streams synthesised into one coherent output | No |
| **Trend classification (emerging/evergreen/declining)** | Not just "trending" — tells you if a topic is going up or coming down | No |
| **Opportunity Engine** | Demand × growth ÷ competition ranking — finds untapped niches before saturation | No |
| **Dead-letter queue + admin observability** | Engineering-grade reliability with full operational transparency | Not user-facing in competitors |
| **Prompt versioning** | AI prompts versioned and editable from the admin panel — no code deploy to tune AI | Not applicable to SaaS tools |

### Defensible Moats

1. **Proprietary dataset** — the longer ViralScopes operates, the more historical data it has for trend detection and score calibration. This improves accuracy over time in a way that cannot be instantly replicated.

2. **Trained scoring model** — as the Viral Score is validated against real content performance data, the algorithm improves. Early competitors face a data cold-start problem.

3. **Ethical positioning** — in a market where "copy what works" is common advice, ViralScopes is the platform that explicitly refuses to facilitate copying. This is both a differentiator and a brand protection strategy.

4. **Network effects (v2+)** — as more agencies use the platform, aggregate anonymised patterns across all customers improve recommendations for everyone.

---

## 14. Competitive Landscape

| Competitor | What they do | What they miss |
|---|---|---|
| **VidIQ** | Keyword research, basic SEO, tag suggestions | No AI structural analysis; no viral scoring; no transcript analysis; no trend prediction |
| **TubeBuddy** | Browser extension for YouTube SEO and management | No deep content analysis; no recommendation engine; no multi-channel competitive intelligence |
| **Social Blade** | Historical channel growth statistics | No content analysis; no actionable guidance; no AI |
| **Exploding Topics** | General trend discovery | Not YouTube-specific; no content structure analysis; no recommendations |
| **vidIQ Boost** | Competitor tracking at a basic level | View count and subscriber data only; no AI analysis |
| **ChatGPT (direct use)** | Can discuss content strategy conversationally | No access to real video data; no proprietary analysis; outputs not grounded in actual performance |
| **Semrush / Ahrefs (YouTube features)** | Keyword and SEO data for YouTube | SEO focus only; no viral scoring; no AI narrative analysis |
| **Manual research** | Creator watches competitor videos manually | Time-intensive; inconsistent; no AI synthesis; no scalability |

**The gap:** No existing product combines large-scale YouTube data collection, multi-stream AI structural analysis, proprietary viral scoring, trend detection with classification, and ethically-generated original recommendations in a single SaaS product.

---

## 15. Business Model

ViralScopes.io operates as a **B2B2C SaaS** with a freemium entry point.

### Revenue Model

**Primary: Subscription (MRR/ARR)**
The dominant revenue source. Customers pay a monthly or annual subscription for access to the platform. Annual plans carry a discount (typically 20%) and are strongly incentivised.

**Secondary: Usage Overages (Post-MVP)**
High-volume users who exceed their plan limits pay a per-unit overage rate rather than being hard-blocked.

**Tertiary: Enterprise Contracts**
Enterprise customers are quoted custom annual contracts with volume pricing, dedicated support, and SLA commitments.

**Quaternary: Affiliate Commissions (v2.0)**
The affiliate programme allows existing customers to earn recurring commissions by referring new paying customers.

### Plan Tiers

| Plan | Price (monthly) | Price (annual) | Target user |
|---|---|---|---|
| **Free** | £0 | £0 | Evaluation, hobbyist creators |
| **Starter** | £39 | £374 (£31/mo) | Independent creators, getting started |
| **Professional** | £89 | £854 (£71/mo) | Full-time creators, small teams |
| **Business** | £249 | £2,390 (£199/mo) | Agencies, larger brand teams |
| **Enterprise** | Custom | Custom | Media companies, large agencies |

*Prices are indicative and subject to market validation during beta.*

### Key Financial Characteristics

- **Gross margin target:** > 70% at scale (AI and infrastructure costs are the primary variable costs)
- **Net Revenue Retention (NRR) target:** > 110% (existing customers expand their plans over time)
- **Monthly churn target:** < 5% at steady state
- **LTV:CAC target:** > 5:1

---

## 16. Monetisation Strategy

### Phase 1 — MVP (Months 1–5): Establish and Validate

- Launch with Stripe subscription billing (Free, Starter, Professional, Business)
- Focus: convert free users to paid; validate the £39–£249/month pricing
- Distribution: content marketing (YouTube SEO), Twitter/X creator community, Product Hunt launch, affiliate partnerships with creator educators

### Phase 2 — Growth (Months 6–12): Expand and Retain

- Launch Paddle billing for global VAT-compliant sales (UK, EU, Australia)
- Introduce annual plan incentive (20% discount, priority queue access)
- Referral programme: existing users earn commission on paid referrals
- Agency-focused landing page and use case content

### Phase 3 — Scale (Months 12–24): Enterprise and Ecosystem

- Enterprise sales motion: dedicated account manager, custom contracts, SLA
- Public API as a new revenue stream (usage-based or included in higher plans)
- White-label deployment for agencies at premium pricing
- Developer ecosystem: SDK adoption drives organic distribution

### Phase 4 — Ecosystem (Months 24+): Platform Network Effects

- Plugin marketplace with revenue sharing
- Multi-platform expansion (TikTok, Instagram) increases addressable market
- Data partnerships and insights products for media research firms

---

## 17. Future Expansion Opportunities

### Platform Expansion
- **TikTok** — The second-largest short-form video platform globally with a rapidly growing creator economy
- **Instagram Reels** — Reels is Meta's fastest-growing feature with significant creator monetisation
- **YouTube Shorts** — Short-form content within the YouTube ecosystem (different algorithm dynamics from long-form)
- **Facebook Video** — Enterprise media companies still generate significant audience on Facebook
- **X (Twitter) Video** — Emerging video platform with high engagement rates
- **LinkedIn Video** — B2B content creators represent an underserved, high-willingness-to-pay segment
- **Podcasts** — Podcast discovery and performance analysis via RSS feed data

### Product Expansion
- **AI Research Agent** — An autonomous agent that monitors your niche 24/7 and delivers personalised daily briefings
- **Content Calendar Integration** — Sync ViralScopes opportunity data directly into Notion, Airtable, or Google Sheets
- **Script Assist** — AI-powered script structuring tool grounded in the platform's hook and narrative analysis data
- **Thumbnail Generator** — AI image generation guided by the platform's thumbnail analysis data
- **A/B Title Testing** — Predict which of two title options will score higher before publishing

### Market Expansion
- **Spanish-language markets** — The Spanish-speaking creator economy is the second-largest on YouTube by content volume
- **Portuguese (Brazil)** — One of the fastest-growing YouTube markets globally
- **Hindi** — India represents the fastest-growing YouTube audience globally
- **German, French** — Large Western European markets with high creator economy participation

### Distribution Expansion
- **Chrome Extension** — Makes ViralScopes accessible as a utility while browsing YouTube, dramatically lowering discovery friction
- **Slack App** — Delivers intelligence directly into team Slack workspaces without requiring a dashboard visit
- **Notion Integration** — Pipes ViralScopes data directly into content planning databases

---

## 18. Long-Term Vision

In five years, ViralScopes.io is the standard infrastructure layer for professional content creation.

**Every professional creator** — from a solo YouTuber to a 50-person media company — uses ViralScopes as the foundation of their content strategy, the way a professional marketer uses Google Analytics or a developer uses GitHub.

**Every content decision** — what topic to cover, what hook to use, when to publish, how to structure the narrative — is informed by ViralScopes data, without any creator losing their voice, originality, or creative independence.

**The platform does not replace creative talent.** It makes creative talent more effective by removing the research burden, the guesswork, and the time wasted on content that was always unlikely to succeed — and replacing it with data that helps creators spend their creative energy on what only they can do: bring their unique perspective, voice, and experience to stories that matter to their audience.

The long-term business outcome is a profitable, category-defining SaaS company with:
- £10M+ ARR by Year 5
- Multi-platform intelligence (YouTube, TikTok, Instagram, LinkedIn, Podcasts)
- A developer ecosystem with 500+ integrations
- Enterprise contracts with the world's leading media companies
- A brand synonymous with ethical, effective content intelligence

---

*This document is maintained by the Product team and updated whenever the product vision, target audience, or business model changes significantly. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [PRD.md](./PRD.md) — Detailed product requirements, user stories, and functional specifications
- [ROADMAP.md](./ROADMAP.md) — Development phases and feature delivery timeline
- [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) — Financial projections and revenue model
- [README.md](./README.md) — Technical overview and quick start guide
