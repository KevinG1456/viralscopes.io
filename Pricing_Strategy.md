# Pricing_Strategy.md
# ViralScopes.io — Pricing Strategy

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Cross-references:** [Business_Model.md](./Business_Model.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) · [PRD.md](./PRD.md)

---

## Table of Contents

1. [Pricing Philosophy](#1-pricing-philosophy)
2. [Subscription Plans](#2-subscription-plans)
3. [Complete Usage Limits Reference](#3-complete-usage-limits-reference)
4. [Enterprise Features](#4-enterprise-features)
5. [Billing Policies](#5-billing-policies)
6. [Pricing Evolution Roadmap](#6-pricing-evolution-roadmap)

---

## 1. Pricing Philosophy

### 1.1 Value-Based Pricing

ViralScopes is priced based on the **value it delivers**, not its cost to produce.

The primary value delivered to each customer segment:

| Segment | Value delivered | Willingness to pay basis |
|---|---|---|
| Independent creator | Saves 5+ hours of weekly research; helps identify opportunities before competitors | Worth £39–£89/month if it helps earn £500+/month from content |
| Agency (per client) | Saves 2.5 hours of strategist time per client per week at ~£30/hour = £300/month saved per client | Business plan at £249/month covers savings from just 1 client |
| Brand team | Justifies content budget to leadership; reduces wasted content spend | £89–£249/month is negligible vs typical video production budgets |
| Enterprise | Competitive intelligence at scale; pipeline into internal BI | £1,000–£3,000/month is immaterial vs editorial team salaries |

**Pricing rule:** The subscription cost should be no more than 30% of the minimum measurable value delivered to the customer. At all plan levels, ViralScopes should feel like an obvious business expense, not a difficult decision.

### 1.2 Competitive Positioning

| Competitor | Monthly price | What's included |
|---|---|---|
| TubeBuddy Pro | $49/month | Keyword research, SEO tools, basic analytics |
| VidIQ Boost | $49/month | Keyword research, competitor tracking, basic AI |
| Social Blade Pro | $3.99/month | Historical statistics only |
| Semrush (YouTube features) | $140+/month | Broad SEO tool; YouTube is one feature |
| **ViralScopes Starter** | **£39/month** | **Deep AI structural analysis, viral scoring, trend detection, original recommendations** |
| **ViralScopes Professional** | **£89/month** | **Everything in Starter + API access, exports, 20 watchlists, 3 seats** |

**Positioning conclusion:** ViralScopes Starter is priced in line with TubeBuddy/VidIQ but delivers materially more depth of analysis. Professional is priced below Semrush but provides creator-specific intelligence that Semrush does not.

### 1.3 Expansion Revenue Strategy

The pricing tiers are designed to create natural upgrade paths as customers grow:

```
Free → Starter
  Trigger: Hits 20 video/month limit; wants more watchlists; wants Discord/Slack alerts

Starter → Professional
  Trigger: Wants API access; needs more than 5 watchlists; adding a team member; wants exports

Professional → Business
  Trigger: Managing multiple clients/workspaces; needs more than 3 seats; needs higher analysis volume

Business → Enterprise
  Trigger: Needs RBAC beyond 10 seats; needs SSO; needs SLA; needs custom data retention
```

**Net Revenue Retention (NRR) target:** > 110% — meaning the existing customer base grows revenue faster than churn removes it.

### 1.4 Annual Plan Strategy

Annual plans are strongly incentivised because they:
- Improve cash flow (12 months of revenue upfront)
- Reduce churn (customers who have paid annually are less likely to cancel)
- Signal commitment (annual customers are more engaged and more likely to expand)

**Annual discount:** 20% across all plans.
**Annual plan messaging:** "Save £95/year" (on Professional) or "2 months free" — whichever resonates more in testing.

**Annual plan take-rate targets:**
- Month 3: 10% of new paying customers
- Month 6: 15%
- Month 12: 25%
- Month 24: 35%

---

## 2. Subscription Plans

### 2.1 Free Plan

**Target:** Solo creators evaluating the platform; hobbyist creators; users who are revenue-constrained but want to explore.

**Price:** £0/month forever (no credit card required)

**Purpose:** Acquisition engine. Creates genuine utility and habit formation. Generates word-of-mouth. Creates natural upgrade pressure as users grow.

**Key constraints that drive upgrades:**
- 20 video analyses/month (just enough to see the value; not enough for serious research)
- 1 watchlist only
- Email alerts only (no Discord, Slack, Telegram, or webhook)
- No data exports
- No API access
- 30-day data retention

| Feature | Free |
|---|---|
| Videos analysed/month | 20 |
| Watchlists | 1 |
| Alert rules | 2 |
| Alert channels | Email only |
| Team seats | 1 |
| Workspaces | 1 |
| Exports/month | 0 |
| API access | No |
| Data retention | 30 days |
| Support | Community (Discord) |

---

### 2.2 Starter Plan

**Target:** Independent creators who are serious about their channels but managing costs. Typically earning some revenue from content.

**Price:** £39/month | £374/year (£31.17/month, save £94)

**Positioning:** "Everything you need to replace your manual competitor research."

**Key value adds vs Free:**
- 200 video analyses/month (10× free)
- 5 watchlists
- All alert channels (email, Discord, Slack, Telegram, webhook)
- 5 exports/month (CSV and Excel)
- 90-day data retention

| Feature | Starter |
|---|---|
| Videos analysed/month | 200 |
| Watchlists | 5 |
| Alert rules | 10 |
| Alert channels | Email, Discord, Slack, Telegram, Webhook |
| Team seats | 1 |
| Workspaces | 1 |
| Projects | 5 |
| Exports/month | 5 (CSV, Excel) |
| Export formats | CSV, Excel |
| API access | No |
| Data retention | 90 days |
| Support | Email (48h response) |
| Analysis priority | Standard queue |

---

### 2.3 Professional Plan

**Target:** Full-time creators, small content teams, creators who want to integrate ViralScopes into their workflow tools via API.

**Price:** £89/month | £854/year (£71.17/month, save £214)

**Positioning:** "Professional-grade intelligence for serious creators and small teams."

**Key value adds vs Starter:**
- 1,000 video analyses/month (5× Starter)
- 20 watchlists
- 3 team seats
- API access (50 req/min, 10,000 req/day)
- All 4 export formats (CSV, Excel, JSON, PDF)
- 20 exports/month
- 6-month data retention
- Priority analysis queue (videos are processed before Starter tier)

| Feature | Professional |
|---|---|
| Videos analysed/month | 1,000 |
| Watchlists | 20 |
| Alert rules | 50 |
| Alert channels | All + custom webhook |
| Team seats | 3 |
| Workspaces | 3 |
| Projects | 20 |
| Exports/month | 20 |
| Export formats | CSV, Excel, JSON, PDF |
| API access | Yes |
| API rate limit | 50 req/min, 10,000 req/day |
| Data retention | 6 months |
| Scheduled reports | No (v1.5) |
| Support | Email (24h response) |
| Analysis priority | Priority queue |

---

### 2.4 Business Plan

**Target:** Creator agencies managing multiple client accounts, brand content teams with multiple team members, and media companies with multi-workspace requirements.

**Price:** £249/month | £2,390/year (£199.17/month, save £598)

**Positioning:** "Built for teams and agencies who deliver content strategy at scale."

**Key value adds vs Professional:**
- 5,000 video analyses/month (5× Professional)
- Unlimited watchlists
- 10 team seats
- 5 workspaces (one per client or team)
- 100 exports/month (including scheduled weekly exports)
- API rate limit: 200 req/min, 100,000 req/day
- 13-month data retention (year-over-year comparison)
- Prompt library access (view and test AI prompts)
- Scheduled weekly report delivery
- Email support with 8-hour response

| Feature | Business |
|---|---|
| Videos analysed/month | 5,000 |
| Watchlists | Unlimited |
| Alert rules | Unlimited |
| Alert channels | All + custom webhook |
| Team seats | 10 |
| Workspaces | 5 |
| Projects | Unlimited |
| Exports/month | 100 |
| Export formats | CSV, Excel, JSON, PDF |
| Scheduled exports | Yes (weekly) |
| API access | Yes |
| API rate limit | 200 req/min, 100,000 req/day |
| Data retention | 13 months |
| Scheduled reports | Yes |
| Prompt library | View access |
| Support | Email (8h response) |
| Analysis priority | High priority queue |

---

### 2.5 Enterprise Plan

**Target:** Media companies, large agencies, publishers, and enterprise brands needing custom limits, SSO, SLA guarantees, and dedicated support.

**Price:** Custom — minimum £1,000/month (£12,000/year minimum ACV)

**Positioning:** "The complete content intelligence infrastructure for large teams."

**Quoted based on:**
- Seat count (minimum 10 seats)
- Monthly video analysis volume
- Number of workspaces
- Data retention requirements
- SLA tier selection
- Support tier selection

**Enterprise-only features:**
- Everything in Business, plus:
- Custom video analysis volume
- Unlimited workspaces
- Custom team seat count
- SAML 2.0 / OIDC SSO (v3.0)
- Custom data retention (up to 5 years)
- Enterprise SLA (99.95% uptime, 1-hour P1 response)
- Dedicated Customer Success Manager
- Custom onboarding programme (30-day guided setup)
- Quarterly business reviews
- Data Processing Agreement (DPA)
- Slack Connect support channel
- Custom API rate limits
- White-label deployment option (v3.0)
- Audit log export
- IP allowlisting for API access
- Priority infrastructure (dedicated processing capacity)

| Feature | Enterprise |
|---|---|
| Videos analysed/month | Custom |
| Watchlists | Unlimited |
| Alert rules | Unlimited |
| Team seats | Custom (min 10) |
| Workspaces | Unlimited |
| Exports/month | Unlimited |
| Export formats | All + custom integrations |
| Scheduled reports | Yes (custom cadence) |
| API access | Yes |
| API rate limit | Custom |
| Data retention | Custom (up to 5 years) |
| SSO (SAML/OIDC) | Yes (v3.0) |
| Audit log export | Yes |
| IP allowlisting | Yes |
| SLA | 99.95% uptime |
| Dedicated CSM | Yes |
| Slack Connect support | Yes |
| DPA | Yes |
| White-label | Yes (v3.0) |
| Onboarding | 30-day guided programme |

---

### 2.6 Plan Comparison Summary

| Feature | Free | Starter | Professional | Business | Enterprise |
|---|---|---|---|---|---|
| **Monthly price** | £0 | £39 | £89 | £249 | Custom |
| **Annual price** | £0 | £374 | £854 | £2,390 | Custom |
| **Videos/month** | 20 | 200 | 1,000 | 5,000 | Custom |
| **Watchlists** | 1 | 5 | 20 | Unlimited | Unlimited |
| **Alert rules** | 2 | 10 | 50 | Unlimited | Unlimited |
| **Alert channels** | Email | All | All | All | All |
| **Team seats** | 1 | 1 | 3 | 10 | Custom |
| **Workspaces** | 1 | 1 | 3 | 5 | Unlimited |
| **Exports/month** | 0 | 5 | 20 | 100 | Unlimited |
| **API access** | No | No | Yes | Yes | Yes |
| **Data retention** | 30d | 90d | 6mo | 13mo | Custom |
| **Scheduled reports** | No | No | No | Yes | Yes |
| **SSO** | No | No | No | No | v3.0 |
| **SLA** | No | No | No | No | 99.95% |
| **Dedicated CSM** | No | No | No | No | Yes |
| **Support** | Community | Email 48h | Email 24h | Email 8h | Slack + CSM |

---

## 3. Complete Usage Limits Reference

### 3.1 Video Analysis Limits

| Plan | Monthly limit | Overage (Post-MVP) | Reset |
|---|---|---|---|
| Free | 20 | Not available (hard block) | 1st of month |
| Starter | 200 | £0.05/video | 1st of month |
| Professional | 1,000 | £0.05/video | 1st of month |
| Business | 5,000 | £0.04/video | 1st of month |
| Enterprise | Custom | Custom | Custom |

*Video analysis = one video going through the full AI pipeline (metadata + transcript + thumbnail + viral score + recommendations). Re-analysing the same video within 24h counts as 1 additional analysis.*

### 3.2 API Limits

| Plan | Requests/minute | Requests/day | Concurrent connections |
|---|---|---|---|
| Free | — | — | — |
| Starter | — | — | — |
| Professional | 50 | 10,000 | 5 |
| Business | 200 | 100,000 | 20 |
| Enterprise | Custom | Custom | Custom |

*Rate limits apply to all authenticated API requests. Webhook endpoints and health check endpoints do not count toward rate limits.*

### 3.3 Storage & Data Retention

| Plan | Data retention | Object storage (exports) | Raw transcript storage |
|---|---|---|---|
| Free | 30 days | 0 (no exports) | 30 days |
| Starter | 90 days | 5 exports × 7 days | 90 days |
| Professional | 6 months | 20 exports × 7 days | 6 months |
| Business | 13 months | 100 exports × 30 days | 13 months |
| Enterprise | Custom | Unlimited × custom | Custom |

*Data retention applies to: video analyses, AI outputs, recommendations, alert history, and job logs. Videos themselves (metadata, scores) are retained indefinitely as shared platform data.*

### 3.4 Team & Workspace Limits

| Plan | Seats | Workspaces | Projects per workspace | Watchlists per workspace |
|---|---|---|---|---|
| Free | 1 | 1 | 3 | 1 |
| Starter | 1 | 1 | 5 | 5 |
| Professional | 3 | 3 | 10 | 20 |
| Business | 10 | 5 | Unlimited | Unlimited |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited |

### 3.5 Alert & Notification Limits

| Plan | Alert rules | Alert channels | Alerts/month | Throttle |
|---|---|---|---|---|
| Free | 2 | Email only | 50 | 1/hour/rule |
| Starter | 10 | All channels | 500 | 1/hour/rule |
| Professional | 50 | All + custom webhook | 2,500 | 1/hour/rule |
| Business | Unlimited | All + custom webhook | Unlimited | Configurable (min 15 min) |
| Enterprise | Unlimited | All + custom | Unlimited | Configurable (min 5 min) |

### 3.6 Export Limits

| Plan | Exports/month | Formats available | Max rows per export | Export file retention |
|---|---|---|---|---|
| Free | 0 | — | — | — |
| Starter | 5 | CSV, Excel | 1,000 | 7 days |
| Professional | 20 | CSV, Excel, JSON, PDF | 5,000 | 7 days |
| Business | 100 | All formats | 25,000 | 30 days |
| Enterprise | Unlimited | All + custom | Unlimited | Custom |

### 3.7 AI Usage

| Plan | AI analysis per video | Recommendation generation | Prompt library |
|---|---|---|---|
| Free | Basic (metadata + viral score only) | 1 recommendation per video | No access |
| Starter | Full (all 5 AI analysis stages) | 3 recommendations per video | No access |
| Professional | Full | 5 recommendations per video | No access |
| Business | Full + priority processing | 10 recommendations per video | View access |
| Enterprise | Full + dedicated capacity | Unlimited | Full access (edit + deploy) |

*`[ASSUMPTION]` "Basic" analysis on Free excludes full transcript AI analysis and thumbnail vision analysis (cost controls). Free users still see the Viral Score but without the full breakdown.*

---

## 4. Enterprise Features

### 4.1 Single Sign-On (SSO) — v3.0

**Availability:** Enterprise plan only

**Supported protocols:**
- SAML 2.0 (Okta, Azure AD, Google Workspace, Ping Identity, OneLogin)
- OIDC (Google Workspace, Auth0, Azure AD)

**Behaviour:**
- Just-in-time (JIT) user provisioning: accounts are created automatically on first SSO login
- SCIM provisioning (v3.0+): users are provisioned and deprovisioned automatically from the IdP
- Role mapping: IdP groups can be mapped to ViralScopes org roles (Admin, Member, Viewer)

**Setup:** Self-service in Enterprise Settings; takes 30 minutes with IT team support; guided by CSM.

### 4.2 Audit Logs

**Availability:** Enterprise plan only (read-only view available to Business Admin role)

**Events captured:**
- All authentication events (login, logout, OAuth, SSO, failed attempts)
- All member management events (invite, remove, role change, ownership transfer)
- All billing events (upgrade, downgrade, payment, cancellation)
- All API key events (create, revoke)
- All admin actions (plan override, quota reset, dead-letter retry, prompt edit)
- All data access events (exports, API calls above threshold)

**Export:** Audit logs exportable as JSON or CSV for Enterprise; also accessible via API.

**Retention:** 2 years per data retention policy.

### 4.3 Advanced Permissions

**Availability:** Business and Enterprise plans

Business plan RBAC:
- 4 roles: Owner, Admin, Member, Viewer
- Role applies across all workspaces within the organisation

Enterprise plan RBAC enhancements:
- Workspace-level roles (a user can be Admin in one workspace and Viewer in another)
- Custom role definitions (v3.0)
- IP allowlisting: restrict API access to specific IP ranges
- Session policy: enforce re-authentication after N hours

### 4.4 Service Level Agreement (SLA)

**Availability:** Enterprise plan only

| SLA tier | Uptime commitment | P1 response time | P2 response time | Credit for breach |
|---|---|---|---|---|
| Standard Enterprise | 99.9% monthly | 1 hour | 4 hours | 1 day credit per hour below SLA |
| Premium Enterprise | 99.95% monthly | 30 minutes | 2 hours | 1 week credit per hour below SLA |

*SLA credits are applied automatically to the next invoice. Scheduled maintenance windows do not count toward downtime.*

**P1 definition:** Service completely unavailable, data loss occurring, or security breach.
**P2 definition:** Major feature broken, > 10% error rate, or significant performance degradation.

### 4.5 Dedicated Support

**Business plan:** Email support with 8-hour response SLA. Shared support team.

**Enterprise plan — Standard:**
- Dedicated Customer Success Manager
- Slack Connect support channel
- Response time: < 1 hour for P1, < 4 hours for P2
- Quarterly business reviews (QBR)
- 30-day onboarding programme

**Enterprise plan — Premium:**
- Everything in Standard, plus:
- Named technical account manager
- Monthly business reviews
- Custom feature prioritisation input
- Beta access to new features

### 4.6 Custom Integrations

Enterprise customers can request:
- Custom webhook payload format (to match internal system expectations)
- Custom export templates (branded PDF reports)
- Custom Zapier/Make actions (v2.0)
- Direct database read access via read replica (on request, for BI teams)
- Slack App customisation for internal Slack workflows

### 4.7 Priority Infrastructure

Enterprise customers run on a dedicated processing queue:
- Video analyses are processed in the enterprise queue (separate from standard queue)
- No resource contention with lower-tier plans during high-demand periods
- Dedicated n8n worker instances for Enterprise customers (v3.0)

---

## 5. Billing Policies

### 5.1 Monthly Billing

- Billing cycle starts on the date of first payment
- Automatically renews each month on the same day
- Payment is processed via Stripe (card on file)
- Invoices are emailed automatically on each successful payment
- Failed payments enter a 3-day grace period before access is restricted

### 5.2 Annual Billing

- Full annual amount charged upfront on subscription start
- Annual invoices are emailed on payment
- If the customer upgrades from monthly to annual mid-year, remaining monthly payments are prorated and credited

### 5.3 Trial Period

- **Free plan:** Permanent free tier — no trial timer
- **Paid plans:** No free trial of paid plans at MVP launch (the free tier serves this purpose)
- **Beta period:** Beta users receive 3 months of Professional plan at no cost
- **Enterprise:** 30-day pilot programme at Business plan price; converts to Enterprise contract after pilot

*`[ASSUMPTION]` A free trial of paid plans (14 days no card required) will be tested at Month 3–4 if free-to-paid conversion is below 4%. Free trials increase trial volume but may lower conversion quality.*

### 5.4 Upgrades

- Upgrades take effect immediately
- The remaining days of the current billing period are prorated and credited
- The difference is charged immediately

**Example:**
- User is on Starter (£39/month), 15 days into their billing cycle
- Upgrades to Professional (£89/month)
- Credit for unused Starter days: £39 × (15/30) = £19.50
- Charge for Professional remainder: £89 × (15/30) = £44.50
- Net charge at upgrade: £25.00

### 5.5 Downgrades

- Downgrades take effect at the end of the current billing period (not immediately)
- The user retains their current plan features until the end of the period
- No prorated credit for downgrades (Stripe standard behaviour)
- If the lower plan has fewer seats/watchlists than currently in use, the user is prompted to reduce usage before the downgrade date

### 5.6 Cancellation

- Cancellations can be made at any time via the Stripe Customer Portal
- Cancellation takes effect at the end of the current billing period
- The account moves to the Free plan (not deleted)
- All data is retained for 30 days post-cancellation, then reduced to Free plan retention limits
- Annual plan cancellations: no refund for unused months (standard SaaS practice)
- **Exception:** If the customer requests a refund within 7 days of annual subscription start and has not used the service, a full refund is provided (goodwill policy)

### 5.7 Refund Policy

| Situation | Policy |
|---|---|
| Monthly plan, within 48 hours of charge | Full refund on request (goodwill) |
| Monthly plan, after 48 hours | No refund (access continues until end of period) |
| Annual plan, within 7 days of purchase, unused | Full refund on request |
| Annual plan, used or after 7 days | No refund |
| Service outage (SLA breach) | Automatic credit per SLA terms |
| Accidental double charge | Full refund immediately |

To request a refund: contact support at support@viralscopes.io or via the in-app support chat.

### 5.8 Taxes

**UK users:** VAT at 20% is added to all subscription prices. Prices displayed on the checkout are exclusive of VAT. The invoice shows the VAT component separately.

**EU users:** VAT rates vary by country. At MVP, Stripe handles UK and EU VAT collection and remittance for ViralScopes (as payment processor). At v1.5 with Paddle integration, Paddle becomes the merchant of record and handles all global VAT/GST compliance automatically.

**US users:** No VAT/GST. State sales tax may apply depending on nexus. Stripe Tax handles this at v1.5.

**Enterprise:** DPA and VAT exemption certificates handled case by case.

### 5.9 Currency Support

| Phase | Currencies | Handler |
|---|---|---|
| MVP | GBP (£), USD ($) | Stripe |
| v1.5 | GBP, USD, EUR, CAD, AUD | Stripe + Paddle |
| v2.0 | All major currencies | Paddle (merchant of record) |
| v2.0 | USDC, USDT | Crypto invoice system |

*`[ASSUMPTION]` GBP is the launch currency. USD pricing will be introduced at Month 2 once the US market is confirmed as a primary acquisition channel.*

**USD price parity (approximate):**

| Plan | GBP | USD |
|---|---|---|
| Starter | £39 | $49 |
| Professional | £89 | $109 |
| Business | £249 | $299 |

---

## 6. Pricing Evolution Roadmap

### 6.1 Principles for Price Changes

- **No surprise price increases for existing customers.** Customers on a plan at a specific price are grandfathered at that price unless they voluntarily upgrade.
- **New customers see the new price.** Price changes apply to new subscriptions from the effective date.
- **Minimum 60 days notice** for any price increase to existing customers.
- **Price decreases are applied immediately** to all customers (rare but possible as scale economies improve margins).

### 6.2 Planned Pricing Evolution

#### Phase 1 — MVP Launch (Month 1)

Launch pricing as documented in Section 2. Prices are set conservatively to maximise customer acquisition and gather conversion data.

*`[ASSUMPTION]` Initial prices may be adjusted within the first 90 days based on observed conversion rates. If Starter conversion exceeds 8%, the price can be tested at £49. If conversion is below 3%, a free trial of the paid tier will be introduced.*

#### Phase 2 — v1.5 Launch (Month 9)

New features (AI Chat, Scheduled Reports, Chrome Extension, Trend Prediction) justify a pricing review:

- **Possible adjustment:** Starter £39 → £45 for new customers
- **Possible addition:** A new "Creator Pro" plan between Starter and Professional: £59/month (2 seats, 500 videos/month, all alert channels)
- **Trigger:** Only if Starter plan conversion rate > 6% AND feature adoption of new features > 50%

#### Phase 3 — v2.0 Launch (Month 18)

Multi-platform expansion (TikTok, Instagram) and mobile app significantly increase TAM and value delivered:

- **Possible adjustment:** Professional £89 → £99 for new customers (TikTok + Instagram included)
- **Possible addition:** Per-platform add-ons (£19/month to add TikTok analysis to any plan)
- **Enterprise pricing:** Enterprise minimum ACV increases from £12,000 to £18,000/year as feature set expands

#### Phase 4 — v3.0 Launch (Month 30)

Enterprise SSO, plugin marketplace, and custom AI models justify:

- **Enterprise price increase:** Minimum ACV from £18,000 to £24,000/year
- **Plugin marketplace:** Revenue share model introduced
- **New Enterprise tier (Premium Enterprise):** Dedicated infrastructure, custom AI models, 24/7 support at £3,000+/month

#### Phase 5 — Scale Pricing (Month 36+)

At scale with strong NRR and market position:

- **Volume pricing for agencies:** Agency partners managing 5+ clients on Business plan receive a volume discount (15% off for 5 client seats, 25% off for 10+)
- **Geographic pricing:** Adjusted prices for high-growth lower-income markets (Brazil, India) where standard prices would be prohibitively expensive
- **Usage-based enterprise billing:** Large Enterprise customers billed per 1,000 video analyses consumed rather than a flat rate — aligns cost with value

### 6.3 Pricing Test Framework

Before any price change:

1. **A/B test on new user cohorts** — show 50% of new visitors the current price, 50% the new price
2. **Measure:** Trial start rate, free-to-paid conversion, time to convert
3. **Run for:** Minimum 4 weeks, minimum 200 new signups in each variant
4. **Decision criterion:** New price is adopted only if conversion does not decrease by more than 10% relative to the control

### 6.4 Discount Policy

Discounts outside of the standard 20% annual plan discount are rare and governed:

| Discount type | Approval required | Maximum discount | Duration |
|---|---|---|---|
| Annual plan | Automatic | 20% | Duration of annual term |
| Non-profit / educational | Founder approval | 50% | Annual review |
| Beta participant | Automatic | 100% (3 months) | First 3 months only |
| Partnership co-marketing | Founder approval | 30% | Per partnership agreement |
| Sales discretion (Enterprise) | Engineering lead | 20% | Per contract |
| Competitor migration | Founder approval | 25% first year | First year only |

No discounts are offered in response to general cancellation requests. If a customer wants to cancel due to price, the correct response is to explore a plan downgrade, not offer a discount on the current plan.

---

*This document is reviewed whenever a product launch, competitive pricing change, or conversion rate shift warrants a pricing evaluation. All price changes affecting existing customers require a company-level decision and 60-day customer notice.*

---

**Related Documents:**
- [Business_Model.md](./Business_Model.md) — Revenue strategy and monetisation model
- [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md) — Financial projections based on this pricing
- [PRD.md](./PRD.md) — Product requirements including feature limits per plan
- [What_ViralScopes_Does.md](./What_ViralScopes_Does.md) — Value proposition that underpins pricing decisions
- [URL_&_API_Structure.md](./URL_and_API_Structure.md) — API endpoint billing and rate limit enforcement
