# Monetization_Model.md
# ViralScopes.io — Monetisation Model

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [Pricing_Strategy.md](./Pricing_Strategy.md) · [Business_Model.md](./Business_Model.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) · [Commercial_Strategy.md](./Commercial_Strategy.md)

---

> This document covers all current and future monetisation mechanisms for ViralScopes.io in detail. For pricing plan definitions, see [Pricing_Strategy.md](./Pricing_Strategy.md). For high-level business strategy, see [Business_Model.md](./Business_Model.md).

---

## Table of Contents

1. [Revenue Streams Overview](#1-revenue-streams-overview)
2. [Monetisation by Feature](#2-monetisation-by-feature)
3. [AI Monetisation Strategy](#3-ai-monetisation-strategy)
4. [API Monetisation Strategy](#4-api-monetisation-strategy)
5. [Future Revenue Opportunities](#5-future-revenue-opportunities)
6. [Financial Assumptions](#6-financial-assumptions)

---

## 1. Revenue Streams Overview

### 1.1 Revenue Stream Map

| Stream | Type | Status | Est. Year 1 contribution | Est. Year 3 contribution |
|---|---|---|---|---|
| SaaS subscriptions (Free → Business) | Recurring | ✅ MVP | 95% | 55% |
| Enterprise contracts | Recurring | ✅ MVP | 5% | 20% |
| Usage overages | Variable | v1.5 | 0% | 5% |
| API monetisation (PAYG tier) | Usage-based | v2.0 | 0% | 5% |
| Affiliate programme | Variable | v2.0 | 0% | 3% |
| White-label licensing | Recurring | v3.0 | 0% | 5% |
| Plugin marketplace (revenue share) | Variable | v3.0 | 0% | 4% |
| Premium integrations | Recurring | v3.0 | 0% | 2% |
| Sponsored newsletter | Variable | v2.0 | 0% | 1% |
| **Total** | | | **100%** | **100%** |

### 1.2 SaaS Subscriptions (Primary)

The dominant revenue model at launch and through Year 2. Monthly or annual recurring subscription across 5 plan tiers (Free, Starter, Professional, Business, Enterprise).

**Why subscriptions are the right model:**
- Predictable revenue enables planning and hiring
- Monthly cadence aligns cost (AI API, infrastructure) with revenue
- Plan tiers create natural expansion paths as customer needs grow
- Annual plans improve cash flow and reduce churn

**Revenue mix target by Year 2:**

| Plan | % of customers | % of MRR | Why |
|---|---|---|---|
| Free | 85% | 0% | Acquisition engine |
| Starter | 8% | 16% | Volume tier |
| Professional | 5% | 22% | Core revenue tier |
| Business | 1.8% | 22% | High-value tier |
| Enterprise | 0.2% | 40% | Highest ACV; low volume |

*`[ASSUMPTION]` The 0.2% of customers contributing 40% of MRR at Enterprise is a realistic target for Year 2. Enterprise SaaS often follows this pattern — a small number of high-value customers contributing disproportionate revenue.*

### 1.3 Enterprise Contracts

Enterprise contracts are priced and structured differently from self-serve subscriptions:
- Annual contracts (minimum 12 months, typically 24–36)
- Invoiced quarterly in advance
- Custom pricing based on seat count, volume, and feature requirements
- Negotiated SLA, DPA, and support terms

Enterprise ACV (Annual Contract Value) progression:

| Phase | Enterprise ACV (avg) | Target contracts |
|---|---|---|
| MVP launch | N/A (no Enterprise yet) | 0 |
| Month 12 | £12,000 | 3–5 |
| Month 18 | £18,000 | 8–12 |
| Month 24 | £24,000 | 15–20 |
| Month 36 | £30,000 | 40–50 |

### 1.4 Usage Overages (v1.5, Month 9)

Rather than hard-blocking paying customers who exceed plan limits, optional overages allow power users to pay for additional consumption.

**Overage rates:**

| Resource | Overage rate | Applies to |
|---|---|---|
| Video analyses | £0.05 per video above limit | Starter, Professional, Business |
| API requests | £0.002 per 1,000 requests above limit | Professional, Business |
| Exports | £0.50 per export above limit | Professional, Business |

**Revenue projection:**
- Expected overage revenue as % of subscription revenue: 3–5%
- Primary benefit: Retains customers who would otherwise churn at limits, rather than converting them to hard paywalls

### 1.5 Affiliate Programme Revenue (v2.0)

Affiliates earn 25% of subscription revenue on referred customers. The net revenue retained by ViralScopes is 75%.

**Affiliate revenue model:**
- If 15% of new customers come from affiliates by Month 18
- And average affiliate customer pays £52/month
- And affiliate commission is 25% recurring
- Net affiliate revenue = affiliate customer MRR × 75%

*Affiliate revenue is net positive — even after 25% commission, affiliate-acquired customers cost less to acquire than paid channels.*

### 1.6 White-Label Licensing (v3.0)

Agencies and enterprise customers can deploy a white-label version of ViralScopes under their own brand.

**Pricing model:**
- Setup fee: £2,000 (one-time; covers custom domain, logo, colour scheme)
- Monthly licence: £500/month (in addition to their Business or Enterprise subscription)
- Minimum commitment: 12 months
- Target: 10 white-label deployments by Month 36

**Revenue from white-label by Month 36:** 10 × £500/month = £5,000/month = 1.9% of MRR

### 1.7 Plugin Marketplace (v3.0)

Third-party developers can publish integrations and tools in a ViralScopes plugin marketplace.

**Revenue model:**
- Free plugins: No revenue share
- Paid plugins: ViralScopes takes 30%; developer keeps 70%
- Featured placement: Auction-based; minimum bid £100/month

**Revenue timing:** Marketplace revenue is dependent on developer ecosystem adoption. Meaningful revenue unlikely before Year 3.

### 1.8 Sponsored Newsletter (v2.0)

The "Viral Content Weekly" newsletter (target: 20,000+ subscribers by Month 18) can carry sponsored content from complementary creator tools.

**Pricing model:**
- Single sponsored segment: £500–£1,000 per issue (weekly)
- Exclusive sponsorship (full issue): £1,500 per issue
- Only complementary, non-competing tools are accepted as sponsors

**Revenue projection (Month 24):** 2 sponsored issues/month × £700 avg = £1,400/month = 1.4% of MRR

---

## 2. Monetisation by Feature

### 2.1 Video Discovery Engine

| Dimension | Detail |
|---|---|
| **User value** | Discover 50,000–300,000 view videos in any niche every 6 hours — automates hours of manual research |
| **Revenue opportunity** | Core platform value; primary driver of plan conversion and retention |
| **Free availability** | 20 videos/month (limited but demonstrates value) |
| **Paid availability** | 200 (Starter), 1,000 (Pro), 5,000 (Business), custom (Enterprise) |
| **Upgrade trigger** | Hitting monthly quota; wanting faster discovery; needing more categories |

---

### 2.2 Viral Score Engine

| Dimension | Detail |
|---|---|
| **User value** | Single 0–100 score that aggregates 9 signals into an immediately understandable quality indicator |
| **Revenue opportunity** | The most shareable and recognisable product feature; drives word-of-mouth and social sharing |
| **Free availability** | Yes — all discovered videos show a Viral Score (but with basic analysis only on Free) |
| **Paid availability** | Full breakdown (9-component explanation) on Starter+; confidence interval on Professional+ |
| **Upgrade trigger** | "Why did it score 87?" — the full breakdown is behind the paid plan |

---

### 2.3 AI Analysis Pipeline (Transcript, Thumbnail, Title, Hook, Full Content)

| Dimension | Detail |
|---|---|
| **User value** | Extracts the structural patterns (hook type, narrative arc, title formula) that make a video work |
| **Revenue opportunity** | The deepest feature; highest switching cost; most differentiated from competitors |
| **Free availability** | Basic metadata + viral score only; no AI structural breakdown |
| **Paid availability** | Full 5-stage AI pipeline on Starter+; priority processing on Professional+; dedicated capacity on Enterprise |
| **Upgrade trigger** | "I want to understand WHY not just WHAT" — Free users see the score; paid users see the reasoning |

---

### 2.4 Trend Detection & Opportunity Engine

| Dimension | Detail |
|---|---|
| **User value** | Discover emerging topics 2–4 weeks before they peak; find untapped niches with high demand and low competition |
| **Revenue opportunity** | High perceived value ("forward-looking intelligence"); strong retention driver |
| **Free availability** | Trend feed visible; Opportunity Engine visible but limited to top 5 opportunities |
| **Paid availability** | Full opportunity list on Starter+; velocity data and competition scoring on Professional+ |
| **Upgrade trigger** | "I want to see all the opportunities, not just the top 5" |

---

### 2.5 Ethical Recommendation Engine

| Dimension | Detail |
|---|---|
| **User value** | Original AI-generated title concepts, hook ideas, content outlines, thumbnail descriptions — grounded in viral patterns |
| **Revenue opportunity** | High frequency of use once discovered; drives daily active usage |
| **Free availability** | 1 recommendation per video |
| **Paid availability** | 3 per video (Starter), 5 per video (Professional), 10 per video (Business), unlimited (Enterprise) |
| **Upgrade trigger** | "I want more than one idea per video" |

---

### 2.6 Watchlists

| Dimension | Detail |
|---|---|
| **User value** | Set-and-forget competitive monitoring for specific channels, keywords, or niches |
| **Revenue opportunity** | Strong retention driver — users who have watchlists configured churn at 60% of the rate of users without them |
| **Free availability** | 1 watchlist |
| **Paid availability** | 5 (Starter), 20 (Professional), unlimited (Business/Enterprise) |
| **Upgrade trigger** | "I need to track more than one competitor / niche" |

---

### 2.7 Alert Dispatch

| Dimension | Detail |
|---|---|
| **User value** | Automated notifications when tracked channels post or trends spike — delivered to Discord, Slack, Telegram, email, or webhook |
| **Revenue opportunity** | Multi-channel alerts are a key differentiator; Discord and Slack delivery are highly valued by team workflows |
| **Free availability** | Email only; 2 alert rules; 50 alerts/month |
| **Paid availability** | All channels on Starter+; higher limits per plan; configurable throttle on Business+ |
| **Upgrade trigger** | "I want alerts in Discord/Slack, not just email" (most common Free→Starter trigger) |

---

### 2.8 Export System

| Dimension | Detail |
|---|---|
| **User value** | Download video analysis data for client reports, presentations, and internal analysis |
| **Revenue opportunity** | Agencies and brand teams have strong export needs; PDF format is Professional+ |
| **Free availability** | No exports |
| **Paid availability** | 5/month CSV+Excel (Starter), 20/month all formats (Professional), 100/month (Business), unlimited (Enterprise) |
| **Upgrade trigger** | "I need to export this for a client report" — first trigger for Starter→Professional |

---

### 2.9 API Access

| Dimension | Detail |
|---|---|
| **User value** | Integrate ViralScopes data into internal dashboards, automations, and workflows |
| **Revenue opportunity** | API access increases switching cost dramatically; enterprise customers with API integration rarely churn |
| **Free availability** | No |
| **Paid availability** | Professional+; rate limits per plan |
| **Upgrade trigger** | "I want to pull this data into Tableau / our internal dashboard" |

---

### 2.10 Team & Workspace Management

| Dimension | Detail |
|---|---|
| **User value** | Manage multiple clients/channels in separate workspaces; share access with team members at appropriate roles |
| **Revenue opportunity** | Multiple seats and workspaces are primary drivers of Starter→Professional and Professional→Business upgrades |
| **Free availability** | 1 seat, 1 workspace |
| **Paid availability** | 3 seats + 3 workspaces (Professional), 10 seats + 5 workspaces (Business), custom (Enterprise) |
| **Upgrade trigger** | "I want to add a team member" or "I need a separate workspace per client" |

---

### 2.11 AI Chat Interface (v1.5)

| Dimension | Detail |
|---|---|
| **User value** | Ask natural language questions about any niche, video, or trend and get synthesised answers |
| **Revenue opportunity** | High frequency of use; drives daily engagement; strong upsell trigger for Starter→Professional |
| **Free availability** | No (Professional+ only) |
| **Paid availability** | Included in Professional, Business, Enterprise (limited messages/day per plan) |
| **Upgrade trigger** | "I want to ask questions about my niche" |

---

### 2.12 Scheduled Reports (v1.5)

| Dimension | Detail |
|---|---|
| **User value** | Automated weekly PDF reports delivered to clients or team members by email |
| **Revenue opportunity** | Primary value for agencies; strong retention driver; high switching cost once configured |
| **Free availability** | No |
| **Paid availability** | Business and Enterprise only |
| **Upgrade trigger** | "I want to automatically send a report to my client every week" |

---

## 3. AI Monetisation Strategy

### 3.1 The Challenge

AI API costs are the largest variable cost driver in ViralScopes. At full scale, analysing millions of videos per month without cost controls would be financially unsustainable.

The AI monetisation strategy must achieve three things simultaneously:
1. **Cover AI costs** — AI analysis must not be subsidised by subscription revenue
2. **Not constrain user value** — limits should be invisible to users who use the product normally
3. **Create upgrade pressure** — power users who want more AI analysis have a clear path to upgrade

### 3.2 Tiered AI Analysis Model

Not every video receives the same depth of AI analysis. The tier is determined by the video's engagement signals, not the user's plan.

| Tier | Criteria | Analysis depth | AI cost per video |
|---|---|---|---|
| **Tier 0 — Metadata only** | < 30k views, very low engagement | Viral score from metadata only; no AI | £0.000 |
| **Tier 1 — Basic AI** | 30k–100k views, moderate engagement | Title formula + thumbnail analysis | £0.012 |
| **Tier 2 — Full AI** | > 100k views OR high engagement | All 5 AI pipeline stages | £0.045 |

**Distribution across discovered videos:**
- Tier 0: ~55% of all discovered videos
- Tier 1: ~30% of all discovered videos
- Tier 2: ~15% of all discovered videos

**Effective average AI cost per discovered video:** £0.013 (with tiering)
**Without tiering:** £0.045 per video (3.5× more expensive)

### 3.3 AI Response Caching

Every AI output is cached in Redis keyed by `(prompt_version, sha256(normalised_input))` with a 24-hour TTL.

**Cache hit rate targets:**
- Month 1: 20% (low hit rate — new platform, new videos)
- Month 3: 40% (growing library of analysed videos)
- Month 6: 55% (many videos appear across multiple watchlists)
- Month 12: 65% (stable cache; most popular videos already analysed)

**Cost reduction from caching:**
At 65% hit rate, AI costs are reduced by 65% relative to no caching.
Without caching, 100,000 analyses/month at £0.013 avg = £1,300/month
With 65% caching, 35,000 actual API calls × £0.013 = £455/month
**Monthly saving: £845 (65%)**

### 3.4 AI Request Limits per Plan

| Plan | AI analyses included | Cache first policy | Priority queue |
|---|---|---|---|
| Free | 20 (Tier 0 and 1 only; Tier 2 excluded) | Yes | No |
| Starter | 200 (all tiers) | Yes | No |
| Professional | 1,000 (all tiers) | Yes | Yes (standard priority) |
| Business | 5,000 (all tiers) | Yes | Yes (high priority) |
| Enterprise | Custom | Yes | Yes (dedicated capacity) |

### 3.5 AI Credit System (v1.5)

From v1.5, a credit-based system supplements the plan limit model for ad-hoc power users.

**Credit bundles:**

| Bundle | Credits | Price | Cost per credit |
|---|---|---|---|
| Starter pack | 50 credits | £4 | £0.08/credit |
| Standard pack | 200 credits | £14 | £0.07/credit |
| Power pack | 500 credits | £30 | £0.06/credit |
| Pro pack | 1,500 credits | £80 | £0.053/credit |

**Credit consumption rates:**

| AI task | Credits consumed |
|---|---|
| Full AI analysis (Tier 2) | 5 credits |
| Basic AI analysis (Tier 1) | 2 credits |
| AI recommendation generation | 3 credits |
| AI Chat message | 1 credit |
| Trend clustering (per batch) | 1 credit |

**Credit economics:**
- Full analysis at 5 credits × £0.06/credit = £0.30 per analysis (paid credit)
- Actual AI cost per full analysis: ~£0.045
- Gross margin on credits: ~85%

### 3.6 Premium AI Models (v3.0)

As AI models improve, premium model access becomes a differentiation lever:

| Model tier | Description | Availability | Price premium |
|---|---|---|---|
| Standard | Current Claude + GPT-4o (default) | All paid plans | Included |
| Enhanced | Next-generation Claude / GPT-5 equivalent | Professional+ | +£20/month add-on |
| Custom | Fine-tuned per-niche model (fitness, finance, tech) | Enterprise | Included in Enterprise |

**Fine-tuned model rationale:** A viral scoring model trained on 100,000 fitness videos will outperform a general model on fitness content. This is a premium Enterprise feature that creates significant lock-in.

### 3.7 Enterprise AI Usage

Enterprise customers have different AI usage patterns:
- Higher volume (5,000–50,000 analyses/month)
- Need priority processing (analyses completed faster)
- May require dedicated AI capacity (no queue competition with other customers)

**Enterprise AI model:**
- Dedicated analysis worker pool (n8n worker instances reserved for Enterprise)
- Custom monthly AI volume allowance in the contract
- Overage pricing negotiated as part of the Enterprise contract
- Option to bring-your-own-AI-key (BYOK) for customers with existing Anthropic/OpenAI contracts

---

## 4. API Monetisation Strategy

### 4.1 API Access Philosophy

The API is both a product feature (included in plans) and a standalone monetisation opportunity (for developers who don't need the full product).

**Two API markets:**
1. **Existing ViralScopes customers** who want to integrate platform data into their tools → API access included in Professional+ plans
2. **Developers and data teams** who need raw data access without a full ViralScopes subscription → PAYG API tier

### 4.2 Free API Tier

There is no free API tier at MVP. API access requires at least a Professional plan subscription.

*`[ASSUMPTION]` A free developer API tier (very low limits) will be introduced in v2.0 to grow developer ecosystem adoption. The cost of low-limit free API access is offset by the brand exposure and eventual conversion to paid API users.*

**v2.0 free API tier:**
- 100 requests/day
- Read-only (videos, trends, channels)
- Rate limit: 5 requests/minute
- Requires account creation; no credit card
- Purpose: Developer discovery and ecosystem building

### 4.3 Paid API Tiers (v2.0)

| Tier | Included in | Extra requests | Price |
|---|---|---|---|
| **API Free** | — | 100/day | £0 |
| **API Included (Professional)** | Professional plan | 10,000/day | Included |
| **API Included (Business)** | Business plan | 100,000/day | Included |
| **API Developer** | Standalone (no subscription needed) | 2,500/day | £49/month |
| **API Scale** | Standalone | 25,000/day | £299/month |
| **API Enterprise** | Enterprise plan | Custom | Custom |

**Developer and Scale tiers** target:
- Data scientists and analysts who need raw ViralScopes data
- SaaS companies building products that incorporate ViralScopes data
- Agencies building custom client dashboards using ViralScopes as a data source

### 4.4 API Rate Limits

| Tier | Requests/minute | Requests/day | Burst limit |
|---|---|---|---|
| API Free | 5 | 100 | 10 |
| Professional (included) | 50 | 10,000 | 200 |
| Business (included) | 200 | 100,000 | 500 |
| API Developer | 30 | 2,500 | 100 |
| API Scale | 200 | 25,000 | 600 |
| Enterprise | Custom | Custom | Custom |

Rate limits are enforced via Redis sliding window counters. Responses include `X-RateLimit-*` headers.

### 4.5 Usage-Based API Billing (v2.0)

For API Developer and Scale tiers, billing is monthly based on actual usage up to the included amount:

```
API Developer Plan: £49/month includes 2,500 requests/day (75,000/month)
Overage: £0.001 per request above 75,000/month
```

Usage is tracked in real-time in Redis and settled at end of billing period.

### 4.6 API Revenue Projections

| Phase | API customers | Avg. MRR per API customer | API MRR |
|---|---|---|---|
| MVP | 0 | — | £0 |
| v2.0 (Month 18) | 50 (Developer tier) | £49 | £2,450 |
| Month 24 | 150 | £60 avg | £9,000 |
| Month 36 | 400 | £80 avg | £32,000 |

*`[ASSUMPTION]` API revenue grows slowly in the first 2 years as the developer ecosystem is established. The primary API value at MVP is retention (customers with API integration are very sticky) rather than a standalone revenue line.*

---

## 5. Future Revenue Opportunities

### 5.1 Mobile Applications (v2.0)

The mobile app (iOS + Android, React Native) is a retention play, not a direct revenue stream. However:

**Indirect revenue impact:**
- Creators who receive alerts on mobile are more engaged
- Mobile app increases DAU/MAU ratio → reduces churn
- Push notifications for viral alerts create a daily habit loop

**Potential direct monetisation (v3.0):**
- "Mobile Premium" add-on: £5/month for unlimited push notifications + offline analysis access
- In-app purchases for one-time credit bundles

### 5.2 Chrome Extension (v1.5)

The Chrome Extension (one-click YouTube video analysis from the browser) is a free tool for Professional+ subscribers.

**Monetisation potential:**
- Free for Professional+: Drives Professional plan upgrades from Free/Starter users who discover the extension
- Future standalone: A "lite" extension with 5 free analyses/month then £9.99/month for unlimited

### 5.3 Analytics Marketplace (v3.0)

The plugin/extension marketplace allows third-party developers to publish analytics integrations and tools.

**Revenue model:**
- 30% revenue share on paid plugins
- Featured placement fees (auction-based; minimum £100/month)
- Marketplace listing fee (optional; improves visibility)

**Example marketplace items:**
- Custom Viral Score calculators for specific niches (fitness, gaming, finance)
- Data export connectors (Snowflake, BigQuery, Notion databases)
- Custom alert templates (Discord bots, Slack automations)

### 5.4 Template Marketplace (v3.0)

Creators and agencies can publish and sell:
- Content brief templates (for specific video formats)
- Thumbnail design briefs (AI-generated thumbnail concept libraries)
- Watchlist configurations (pre-built competitor watchlists per niche)

**Revenue model:**
- Free templates: No revenue share
- Paid templates: ViralScopes takes 20%; creator keeps 80%
- Featured placement: £50/month

### 5.5 Premium Reports (v2.0)

One-time purchase of deep-dive industry reports generated using ViralScopes aggregate data.

**Example reports:**
- "State of the UK Personal Finance YouTube market: Q3 2026" — £29 one-time
- "Top 50 Viral Video Formulas in Fitness YouTube" — £49 one-time
- "Emerging Creator Niches: Opportunity Ranking 2026" — £79 one-time

**Revenue potential:** Niche play; estimated £2,000–£10,000/month by Month 36 if reports resonate.

### 5.6 AI Consulting Services (v3.0)

For Enterprise customers who want hands-on expert help implementing ViralScopes into their content strategy:

**Service offerings:**
- Content strategy workshop (using ViralScopes data): £2,000/day
- Channel audit and optimisation report: £1,500
- Quarterly competitive intelligence briefing: £800/quarter
- Custom prompt engineering for niche-specific analysis: £3,000 project

*`[ASSUMPTION]` Consulting is a high-margin, low-volume service. Not a priority revenue line but adds value to Enterprise relationships.*

### 5.7 White-Label Platform (v3.0)

Agencies and enterprise customers can deploy a branded version of ViralScopes for their clients.

**Pricing:**
- Setup: £2,000 one-time
- Monthly licence: £500/month (above the customer's base plan)
- Custom features: Quoted separately

**Revenue potential at Month 36:** 10–20 white-label deployments × £500/month = £5,000–£10,000/month

### 5.8 Data Licensing (v4.0+)

*`[ASSUMPTION]` Data licensing is a future opportunity contingent on scale and legal review.*

At scale (Year 3+), ViralScopes has aggregated data on millions of videos, viral patterns, trend cycles, and engagement benchmarks. This data has value to:
- Academic researchers studying media and creator economy
- Market research firms
- Advertising agencies benchmarking content performance
- Media planning tools

**Data licensing model:**
- Anonymised, aggregated data only (never individual creator data)
- Annual licence: £10,000–£100,000 depending on scope
- No personal data (compliant with GDPR); only platform-aggregate insights

### 5.9 Enterprise Professional Services (v3.0)

For large Enterprise deployments requiring custom implementation:

| Service | Price | Duration |
|---|---|---|
| Enterprise onboarding (extended) | £5,000 | 60-day programme |
| Custom API integration development | £8,000–£20,000 | Per project |
| Training programme (team of 10) | £3,000 | Full-day workshop |
| Annual audit and strategy review | £4,000 | Annual |

---

## 6. Financial Assumptions

### 6.1 Revenue Mix Projection

| Revenue stream | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| SaaS subscriptions (Starter + Pro + Business) | £70,000 (95%) | £406,000 (70%) | £1,167,000 (55%) |
| Enterprise contracts | £3,800 (5%) | £116,000 (20%) | £424,000 (20%) |
| Usage overages | £0 | £17,000 (3%) | £106,000 (5%) |
| API monetisation (PAYG) | £0 | £29,000 (5%) | £106,000 (5%) |
| Affiliate / referral | £0 | £6,000 (1%) | £64,000 (3%) |
| Other (reports, newsletter, marketplace) | £0 | £4,000 (1%) | £63,000 (3%) |
| White-label / consulting | £0 | £0 | £63,000 (3%) |
| **Total** | **£73,800** | **£578,000** | **£2,124,000** |

*`[ASSUMPTION]` Revenue mix shifts significantly toward Enterprise and API revenue in Year 3 as the Enterprise sales motion matures and the API developer ecosystem grows.*

### 6.2 Gross Margin Assumptions

| Cost component | Year 1 | Year 2 | Year 3 | Notes |
|---|---|---|---|---|
| AI API costs (Claude + OpenAI) | £8,000 | £35,000 | £90,000 | Tiering + caching reduces effective cost |
| Infrastructure (compute, DB, storage) | £6,550 | £18,900 | £61,500 | See Infrastructure_Budget_Plan.md |
| Stripe payment fees (~3% of revenue) | £2,200 | £17,000 | £63,000 | 3% of processed volume |
| Email / SendGrid | £1,600 | £5,000 | £12,000 | Scales with email volume |
| **Total COGS** | **£18,350** | **£75,900** | **£226,500** | |
| **Revenue** | **£73,800** | **£578,000** | **£2,124,000** | |
| **Gross Margin** | **75%** | **87%** | **89%** | Improves with scale + caching |

*Gross margin improves substantially in Year 2 and Year 3 due to:*
- *AI caching reducing effective per-analysis cost*
- *Infrastructure costs scaling sub-linearly (fixed base + marginal cost)*
- *Stripe fee % remaining constant but becoming a smaller % of gross margin as base grows*

### 6.3 Scaling Assumptions

| Assumption | Basis | Risk |
|---|---|---|
| ARPU held at £52/month in Year 1 | Conservative blended average | Upside if Enterprise mix grows faster |
| AI cost per video: £0.013 average | Tiered analysis + 55% cache hit rate by Month 6 | If caching underperforms, AI costs increase |
| Free-to-paid conversion: 5% (30-day) | Industry benchmark for creator tools | Key downside risk if conversion is 3% |
| Monthly churn: starts at 8%, declines to 5% | Typical SaaS trajectory | If product stickiness is low, churn may stay high |
| Enterprise ACV: £12,000 at MVP, growing to £24,000 by Month 24 | Based on comparable B2B SaaS products at this feature tier | Sales cycle may be longer than projected |
| Annual plan take-rate: 25% by Month 12 | Incentivised by 20% discount; common in SaaS | Lower if monthly is preferred; positive if higher |

### 6.4 Break-Even Targets

| Break-even type | Target MRR | Target date |
|---|---|---|
| Infrastructure cost break-even | £867 | Month 4–5 |
| Founder-only team break-even | £6,000 | Month 5–6 |
| 3-person team break-even | £19,500 | Month 11–12 |
| 6-person team EBITDA positive | £47,000 | Month 20–22 |
| 20% EBITDA margin | £60,000+ | Month 25–28 |
| 40%+ EBITDA margin (scale) | £200,000+ | Month 36+ |

### 6.5 Long-Term Monetisation Roadmap

```
Year 1 (Months 1–12)
  └── SaaS subscriptions (95%)
  └── Enterprise pilots begin (Month 9)
  └── Infrastructure break-even reached

Year 2 (Months 13–24)
  └── Enterprise contracts materially contribute (20%)
  └── Usage overages launched (v1.5)
  └── API monetisation launched (v2.0)
  └── Affiliate programme launched (v2.0)
  └── EBITDA positive (Month 20–22)

Year 3 (Months 25–36)
  └── White-label licensing launched (v3.0)
  └── Plugin marketplace launched (v3.0)
  └── Premium reports launched
  └── Revenue mix diversified (subscriptions 55%, Enterprise 20%, API 5%, other 20%)
  └── 40%+ EBITDA margin targeted

Year 4+ (Beyond Month 36)
  └── Data licensing explored (v4.0+)
  └── Multi-region monetisation (Latin America, APAC)
  └── AI consulting as premium service
  └── Potential acquisition target or Series A/B raise
```

### 6.6 Monetisation Principles

1. **Never monetise what should be free.** Core discovery, viral scoring, and trend data are available on the free plan because they demonstrate value. Monetise depth, volume, and workflow integration.

2. **Upgrade triggers must be natural, not forced.** A user should hit a limit because they are getting genuine value, not because the limits are artificially low. The goal is to grow with customers, not trap them.

3. **Enterprise pricing reflects real value.** Enterprise customers save tens of thousands of pounds in analyst time and see measurable content performance improvements. A £24,000/year contract is a small fraction of the value delivered.

4. **AI costs are a product cost, not a profit centre.** AI is priced to cover cost and create upgrade triggers, not to extract maximum margin from every AI call. Excessive AI monetisation would conflict with the platform's mission to make intelligence accessible.

5. **Diversify revenue without losing focus.** Marketplace, white-label, and consulting are additive to the core SaaS model. They are never prioritised over improving the core product.

---

*This monetisation model is reviewed quarterly. Significant pricing or revenue stream changes require a team-level decision and customer communication where applicable.*

---

**Related Documents:**
- [Pricing_Strategy.md](./Pricing_Strategy.md) — Detailed plan pricing and feature limits
- [Business_Model.md](./Business_Model.md) — Overall business strategy and revenue model overview
- [Commercial_Strategy.md](./Commercial_Strategy.md) — GTM strategy and sales approach
- [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) — 3-year financial projections
- [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) — Cost structure underpinning gross margin
