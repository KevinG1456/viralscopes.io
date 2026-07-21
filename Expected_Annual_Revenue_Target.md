# Expected_Annual_Revenue_Target.md

# ViralScopes.io — Expected Annual Revenue Target & Financial Projections

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Currency:** GBP (£)
> **Cross-references:** [What_ViralScopes_Does.md](./What_ViralScopes_Does.md) · [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) · [PRD.md](./PRD.md)

---

> **Disclaimer:** All financial projections are estimates based on assumptions clearly labelled throughout. Actual results will depend on market conditions, execution quality, pricing validation, and factors outside the team's control. These projections are for planning purposes only and should not be treated as guarantees.

---

## Table of Contents

1. [Revenue Model Overview](#1-revenue-model-overview)
2. [Pricing Structure](#2-pricing-structure)
3. [Key Assumptions](#3-key-assumptions)
4. [Customer Acquisition Model](#4-customer-acquisition-model)
5. [Conversion & Churn Assumptions](#5-conversion--churn-assumptions)
6. [Monthly Recurring Revenue Projections](#6-monthly-recurring-revenue-projections)
7. [Annual Recurring Revenue Milestones](#7-annual-recurring-revenue-milestones)
8. [Revenue by Customer Tier](#8-revenue-by-customer-tier)
9. [Break-Even Analysis](#9-break-even-analysis)
10. [Three-Year Financial Outlook](#10-three-year-financial-outlook)
11. [Infrastructure Cost vs Revenue](#11-infrastructure-cost-vs-revenue)
12. [Profitability Targets](#12-profitability-targets)
13. [Key Business KPIs](#13-key-business-kpis)
14. [Growth Assumptions](#14-growth-assumptions)
15. [Risks & Sensitivities](#15-risks--sensitivities)

---

## 1. Revenue Model Overview

ViralScopes.io operates on a **B2B SaaS subscription model** with a freemium entry point.

### Revenue Streams

| Stream                      | Type                | MVP      | Notes                                                            |
| --------------------------- | ------------------- | -------- | ---------------------------------------------------------------- |
| **Subscription (MRR/ARR)**  | Recurring           | Yes      | Primary revenue source; 5 plan tiers                             |
| **Annual plan discount**    | Recurring (prepaid) | Yes      | 20% discount incentivises annual commitment; improves cash flow  |
| **Enterprise contracts**    | Recurring (custom)  | Yes      | Negotiated annually; higher ACV, lower churn                     |
| **Usage overages**          | Variable            | Post-MVP | Charges above plan limits; protects power users from hard blocks |
| **Affiliate commissions**   | Variable            | v2.0     | Users earn recurring commission on referred paying customers     |
| **API access**              | Usage-based         | v2.0     | Per-request pricing or included in Professional+ plans           |
| **White-label deployments** | Recurring           | v3.0     | Agency-tier pricing for branded deployments                      |

### Unit Economics at a Glance

| Metric                          | Target                                      |
| ------------------------------- | ------------------------------------------- |
| Average Revenue Per User (ARPU) | £52/month (blended across all paying tiers) |
| Gross Margin                    | > 70% at scale                              |
| Net Revenue Retention (NRR)     | > 110%                                      |
| Monthly Churn Rate              | < 5% at steady state                        |
| Customer Acquisition Cost (CAC) | < £120                                      |
| Lifetime Value (LTV)            | > £520                                      |
| LTV:CAC Ratio                   | > 4:1                                       |
| Payback Period                  | < 3 months                                  |

---

## 2. Pricing Structure

### Plan Tiers

| Plan             | Monthly price | Annual price | Annual/mo equivalent | Saving     |
| ---------------- | ------------- | ------------ | -------------------- | ---------- |
| **Free**         | £0            | £0           | £0                   | —          |
| **Starter**      | £39           | £374         | £31.17/mo            | 20%        |
| **Professional** | £89           | £854         | £71.17/mo            | 20%        |
| **Business**     | £249          | £2,390       | £199.17/mo           | 20%        |
| **Enterprise**   | Custom        | Custom       | —                    | Negotiated |

_`[ASSUMPTION]` Prices are indicative and will be validated during beta. The £39 Starter price point is common in creator tool SaaS (TubeBuddy Pro: $49/mo, VidIQ Boost: $49/mo). The £249 Business price targets agency buyers._

### Plan Limits Summary

| Feature               | Free    | Starter | Professional | Business  | Enterprise    |
| --------------------- | ------- | ------- | ------------ | --------- | ------------- |
| Videos analysed/month | 20      | 200     | 1,000        | 5,000     | Custom        |
| Watchlists            | 1       | 5       | 20           | Unlimited | Unlimited     |
| Alert rules           | 2       | 10      | 50           | Unlimited | Unlimited     |
| Team seats            | 1       | 1       | 3            | 10        | Unlimited     |
| Exports/month         | 0       | 5       | 20           | 100       | Unlimited     |
| API access            | No      | No      | Yes          | Yes       | Yes           |
| Data retention        | 30 days | 90 days | 6 months     | 13 months | Custom        |
| Priority support      | No      | No      | No           | Email     | Dedicated CSM |

### Enterprise Pricing Model

Enterprise contracts are quoted based on:

- Seat count (minimum 10 seats)
- Monthly video analysis volume
- Number of workspaces
- Data retention requirements
- SLA tier

_`[ASSUMPTION]` Enterprise ACV (Annual Contract Value) estimated at £12,000–£36,000/year (£1,000–£3,000/month). Target: 10 Enterprise customers by end of Year 2._

---

## 3. Key Assumptions

All projections are built on the following assumptions. Each is marked with its confidence level.

| #   | Assumption                                                              | Confidence | Notes                                                          |
| --- | ----------------------------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| A1  | Starter plan priced at £39/month will convert at 5%+ from free          | Medium     | Comparable to VidIQ/TubeBuddy pricing; to be validated in beta |
| A2  | Average paying customer revenue = £52/month (blended)                   | Medium     | Weighted average across Starter/Pro/Business/Enterprise mix    |
| A3  | Free-to-paid conversion rate = 5% within 30 days                        | Medium     | Industry benchmark for creator tools: 3–8%                     |
| A4  | Monthly churn starts at 8%, improves to 4% by month 18                  | Medium     | Early SaaS churn is typically higher until product-market fit  |
| A5  | Organic growth via word-of-mouth = 30% of new signups by month 6        | Low        | Requires product excellence and creator community virality     |
| A6  | Content marketing drives 40% of signups from month 3 onwards            | Medium     | YouTube SEO and creator community presence                     |
| A7  | Paid acquisition CAC = £120 on average                                  | Low        | Depends on channel mix; to be measured                         |
| A8  | Annual plan take rate = 25% of paying customers                         | Medium     | Incentivised by 20% discount                                   |
| A9  | Enterprise closes at 2–3 customers per quarter from month 12            | Low        | Requires dedicated outbound sales motion                       |
| A10 | AI API costs managed to < £0.015/video average (with caching + tiering) | High       | Engineering control; validated in prototype                    |

---

## 4. Customer Acquisition Model

### Acquisition Channels

| Channel                                    | % of signups | CAC       | Notes                                                |
| ------------------------------------------ | ------------ | --------- | ---------------------------------------------------- |
| **Content marketing (YouTube SEO, blog)**  | 40%          | £0–£30    | High-leverage for a content intelligence tool        |
| **Organic word-of-mouth / referral**       | 25%          | £0–£15    | Grows as NPS improves                                |
| **Product Hunt / launch events**           | 10%          | £20–£50   | One-time spike; concentrated at launch               |
| **Creator community (Twitter/X, Discord)** | 15%          | £15–£40   | Direct creator community participation               |
| **Paid acquisition (Google Ads, Meta)**    | 10%          | £100–£200 | Tested conservatively; scaled if unit economics work |

**Blended CAC target: £80** (weighted by channel mix)

### Monthly New Signup Projections

| Month            | New signups | Channel mix                                               |
| ---------------- | ----------- | --------------------------------------------------------- |
| 1–2 (Pre-launch) | 0           | Beta waitlist only                                        |
| 3 (Launch)       | 500         | Product Hunt launch, content marketing, creator community |
| 4                | 300         | Organic + content                                         |
| 5                | 400         | Organic + content + first paid test                       |
| 6                | 500         | All channels running                                      |
| 9                | 800         | Content flywheel building                                 |
| 12               | 1,200       | Referral programme active, brand building                 |
| 18               | 2,500       | TikTok/Instagram launch drives new signups                |
| 24               | 4,000       | Strong brand + multi-platform                             |

_`[ASSUMPTION]` Launch month signup estimates assume a successful Product Hunt launch (top 5 of the day) combined with 3 months of pre-launch content marketing. This is achievable but not guaranteed._

---

## 5. Conversion & Churn Assumptions

### Free-to-Paid Conversion

| Timeframe               | Conversion rate | Reasoning                          |
| ----------------------- | --------------- | ---------------------------------- |
| Within 7 days of signup | 2%              | Users are still evaluating         |
| Within 30 days          | 5%              | Users who experience value convert |
| Within 90 days          | 7%              | Longer-tail users who needed time  |
| Never                   | 93%             | Free tier users who don't upgrade  |

_The 5% 30-day conversion rate is the planning assumption. If actual conversion is 3%, revenue projections drop by ~40% — a key risk. If conversion reaches 8%, projections increase by ~60%._

### Monthly Churn by Plan

| Plan         | Month 1–6 churn      | Month 7–18 churn | Steady state (18m+) |
| ------------ | -------------------- | ---------------- | ------------------- |
| Free         | 15% (inactive users) | 10%              | 8%                  |
| Starter      | 10%                  | 7%               | 5%                  |
| Professional | 7%                   | 5%               | 3%                  |
| Business     | 5%                   | 3%               | 2%                  |
| Enterprise   | 2%                   | 1.5%             | 1%                  |

_`[ASSUMPTION]` Early-stage SaaS churn is typically higher as product-market fit is established. Churn improves as the product matures, onboarding improves, and customer success is added._

### Net Revenue Retention (NRR)

NRR measures whether existing customers expand their revenue over time (upgrades) or contract (downgrades/cancellations).

| Stage       | NRR  | Driver                                |
| ----------- | ---- | ------------------------------------- |
| Month 1–6   | 95%  | Churn outweighs expansions early      |
| Month 7–12  | 102% | Starter → Professional upgrades begin |
| Month 13–18 | 108% | Business + Enterprise expansions      |
| Month 19–24 | 112% | Strong expansion revenue, low churn   |

**Target NRR: > 110% by end of Year 2** — this is the point at which the existing customer base grows revenue even without new customer acquisition.

---

## 6. Monthly Recurring Revenue Projections

### Month-by-Month MRR Build (Year 1)

| Month      | New paying customers | Churned customers | Total paying | MRR     | MoM growth |
| ---------- | -------------------- | ----------------- | ------------ | ------- | ---------- |
| 1 (Launch) | 0                    | 0                 | 0            | £0      | —          |
| 2          | 15                   | 0                 | 15           | £780    | —          |
| 3          | 25                   | 1                 | 39           | £2,028  | +160%      |
| 4          | 30                   | 2                 | 67           | £3,484  | +72%       |
| 5          | 35                   | 3                 | 99           | £5,148  | +48%       |
| 6          | 40                   | 5                 | 134          | £6,968  | +35%       |
| 7          | 45                   | 6                 | 173          | £8,996  | +29%       |
| 8          | 50                   | 8                 | 215          | £11,180 | +24%       |
| 9          | 55                   | 10                | 260          | £13,520 | +21%       |
| 10         | 60                   | 12                | 308          | £16,016 | +18%       |
| 11         | 65                   | 14                | 359          | £18,668 | +17%       |
| 12         | 70                   | 17                | 412          | £21,424 | +15%       |

_`[ASSUMPTION]` ARPU = £52/month (blended). New customers grow linearly in Year 1 as channels are established. Churn improves gradually as the product matures._

**Year 1 ARR at end of Month 12: £21,424 × 12 = ~£257,000**

---

### Month-by-Month MRR Build (Year 2)

| Month | New paying | Churned | Total paying | MRR     | MoM growth |
| ----- | ---------- | ------- | ------------ | ------- | ---------- |
| 13    | 80         | 19      | 473          | £24,596 | +15%       |
| 14    | 90         | 22      | 541          | £28,132 | +14%       |
| 15    | 100        | 25      | 616          | £32,032 | +14%       |
| 16    | 115        | 28      | 703          | £36,556 | +14%       |
| 17    | 130        | 32      | 801          | £41,652 | +14%       |
| 18    | 150        | 36      | 915          | £47,580 | +14%       |
| 19    | 170        | 41      | 1,044        | £54,288 | +14%       |
| 20    | 190        | 46      | 1,188        | £61,776 | +14%       |
| 21    | 210        | 53      | 1,345        | £69,940 | +13%       |
| 22    | 230        | 60      | 1,515        | £78,780 | +13%       |
| 23    | 250        | 67      | 1,698        | £88,296 | +12%       |
| 24    | 270        | 75      | 1,893        | £98,436 | +11%       |

_v1.5 launches at Month 9 (AI Chat, Scheduled Reports, Chrome Extension) — drives acceleration in months 10–14. v2.0 launches at Month 18 (TikTok, Instagram, Mobile App) — drives acceleration in months 19–24._

**Year 2 ARR at end of Month 24: £98,436 × 12 = ~£1,181,000**

---

### Month-by-Month MRR Build (Year 3)

| Month | New paying | Churned | Total paying | MRR      | MoM growth |
| ----- | ---------- | ------- | ------------ | -------- | ---------- |
| 25    | 300        | 85      | 2,108        | £109,616 | +11%       |
| 27    | 370        | 105     | 2,583        | £134,316 | +10%       |
| 30    | 480        | 135     | 3,357        | £174,564 | +9%        |
| 33    | 580        | 165     | 4,162        | £216,424 | +8%        |
| 36    | 680        | 200     | 5,042        | £262,184 | +7%        |

_Growth rate decelerates naturally as the base grows. Maintained by multi-platform expansion (v2.0) and enterprise sales motion._

**Year 3 ARR at end of Month 36: £262,184 × 12 = ~£3,146,000**

---

## 7. Annual Recurring Revenue Milestones

### Key ARR Milestones

| Milestone             | ARR         | Paying customers | Target month | Significance                           |
| --------------------- | ----------- | ---------------- | ------------ | -------------------------------------- |
| First paying customer | >£0         | 1                | Month 2      | Proof of willingness to pay            |
| £10,000 ARR           | £10,000     | ~16              | Month 3–4    | Covers basic infrastructure costs      |
| £100,000 ARR          | £100,000    | ~160             | Month 9–10   | Initial product-market fit signal      |
| £500,000 ARR          | £500,000    | ~800             | Month 18–19  | Series A readiness indicator           |
| £1,000,000 ARR        | £1,000,000  | ~1,600           | Month 21–22  | Seven-figure ARR milestone             |
| £3,000,000 ARR        | £3,000,000  | ~4,800           | Month 34–36  | Scale phase; enterprise sales critical |
| £10,000,000 ARR       | £10,000,000 | ~12,000          | Year 5+      | Category leadership                    |

---

## 8. Revenue by Customer Tier

### Target Customer Mix at Key Milestones

**At £100K ARR (Month 9–10):**

| Plan         | Customers | ARPU    | MRR contribution | % of MRR |
| ------------ | --------- | ------- | ---------------- | -------- |
| Starter      | 90        | £39     | £3,510           | 42%      |
| Professional | 55        | £89     | £4,895           | 58%      |
| Business     | 15        | £249    | £3,735           | —        |
| Enterprise   | 0         | —       | £0               | —        |
| **Total**    | **160**   | **£52** | **£12,140**      | —        |

_Note: The above mix corrects to approximately £100K ARR on an annualised basis._

---

**At £500K ARR (Month 18–19):**

| Plan         | Customers | ARPU     | MRR contribution | % of MRR |
| ------------ | --------- | -------- | ---------------- | -------- |
| Starter      | 400       | £39      | £15,600          | 37%      |
| Professional | 280       | £89      | £24,920          | 59%      |
| Business     | 100       | £249     | £24,900          | —        |
| Enterprise   | 5         | £1,500   | £7,500           | —        |
| **Total**    | **785**   | **~£93** | **£72,920/mo**   | —        |

_By Month 18, enterprise customers (5) contribute 10% of MRR despite being <1% of customer count. This is typical of multi-tier SaaS._

---

**At £1M ARR (Month 21–22):**

| Plan         | Customers | ARPU      | MRR contribution | % of MRR |
| ------------ | --------- | --------- | ---------------- | -------- |
| Starter      | 700       | £39       | £27,300          | 32%      |
| Professional | 520       | £89       | £46,280          | 54%      |
| Business     | 200       | £249      | £49,800          | —        |
| Enterprise   | 12        | £1,800    | £21,600          | —        |
| **Total**    | **1,432** | **~£104** | **£145,000/mo**  | —        |

---

**At £3M ARR (Month 34–36):**

| Plan         | Customers | ARPU      | MRR contribution | % of MRR |
| ------------ | --------- | --------- | ---------------- | -------- |
| Starter      | 2,000     | £39       | £78,000          | 30%      |
| Professional | 1,600     | £89       | £142,400         | 54%      |
| Business     | 650       | £249      | £161,850         | —        |
| Enterprise   | 50        | £2,000    | £100,000         | —        |
| **Total**    | **4,300** | **~£117** | **£482,250/mo**  | —        |

_Enterprise ACV grows from £12k to £24k as the product matures and enterprise features (SSO, white-label, custom SLAs) are added in v3.0._

---

## 9. Break-Even Analysis

### Definition

Break-even is defined as the point at which **Monthly Revenue ≥ Monthly Total Costs** (infrastructure + salaries + other opex).

### Cost Structure at Key Stages

#### Month 6 — Early Stage (1-person team)

| Cost item                                    | Monthly    |
| -------------------------------------------- | ---------- |
| Infrastructure (fixed + AI)                  | £400       |
| Founder salary / opportunity cost            | £4,000     |
| Software tools (GitHub, Figma, Linear, etc.) | £200       |
| Marketing / content creation                 | £300       |
| Accounting / legal                           | £150       |
| **Total monthly costs**                      | **£5,050** |

**Break-even MRR at Month 6: £5,050**
**Actual projected MRR at Month 6: £6,968**
**Status: ✅ Break-even achieved at Month 5–6**

---

#### Month 12 — Small Team (3-person team)

| Cost item                      | Monthly     |
| ------------------------------ | ----------- |
| Infrastructure                 | £726        |
| Engineer 1 salary              | £6,500      |
| Engineer 2 salary              | £5,500      |
| Founder salary                 | £5,000      |
| Software tools                 | £500        |
| Marketing & content            | £800        |
| Accounting / legal / insurance | £400        |
| **Total monthly costs**        | **£19,426** |

**Break-even MRR at Month 12: £19,426**
**Actual projected MRR at Month 12: £21,424**
**Status: ✅ Break-even maintained**

---

#### Month 24 — Growth Stage (6-person team)

| Cost item                      | Monthly     |
| ------------------------------ | ----------- |
| Infrastructure                 | £2,300      |
| Engineering (3 engineers)      | £21,000     |
| Product / design (1)           | £6,000      |
| Sales / customer success (1)   | £5,000      |
| Founder salary                 | £6,000      |
| Software tools                 | £1,500      |
| Marketing & content            | £3,000      |
| Accounting / legal / insurance | £1,000      |
| Office / co-working            | £1,000      |
| **Total monthly costs**        | **£46,800** |

**Break-even MRR at Month 24: £46,800**
**Actual projected MRR at Month 24: £98,436**
**Status: ✅ Well above break-even; margin expanding**

---

### Infrastructure-Only Break-Even

The minimum MRR needed to cover just the infrastructure costs (not salaries):

| Stage                | Monthly infra cost | Infra break-even MRR | Customers needed |
| -------------------- | ------------------ | -------------------- | ---------------- |
| Stage 1 (optimistic) | £260               | £867                 | 22               |
| Stage 1 (realistic)  | £400               | £1,333               | 34               |
| Stage 2              | £1,200             | £4,000               | 77               |
| Stage 3              | £4,000             | £13,333              | 256              |

_Infrastructure break-even is achievable very early. The harder break-even is covering team salaries._

---

## 10. Three-Year Financial Outlook

### Summary P&L

|                              | Year 1       | Year 2        | Year 3          |
| ---------------------------- | ------------ | ------------- | --------------- |
| **Revenue**                  |              |               |                 |
| Starting MRR                 | £0           | £21,424       | £98,436         |
| Ending MRR                   | £21,424      | £98,436       | £262,184        |
| Annual Revenue               | £73,800      | £578,000      | £2,124,000      |
| **Costs**                    |              |               |                 |
| Infrastructure               | £6,550       | £18,900       | £61,500         |
| Salaries & contractors       | £120,000     | £320,000      | £780,000        |
| Marketing & sales            | £12,000      | £60,000       | £180,000        |
| Software & tools             | £6,000       | £15,000       | £30,000         |
| Legal, accounting, insurance | £5,000       | £10,000       | £20,000         |
| Other opex                   | £5,000       | £15,000       | £40,000         |
| **Total costs**              | **£154,550** | **£438,900**  | **£1,111,500**  |
| **EBITDA**                   | **-£80,750** | **+£139,100** | **+£1,012,500** |
| **EBITDA margin**            | **-109%**    | **+24%**      | **+47%**        |

_Year 1 is loss-making as the team is built and product is established. Profitability emerges in Year 2, growing strongly in Year 3._

### Quarterly Revenue Breakdown

**Year 1:**

| Quarter          | Revenue     | Key events                                |
| ---------------- | ----------- | ----------------------------------------- |
| Q1               | £2,808      | Launch month; first paying customers      |
| Q2               | £14,756     | Growing channels; product iterations      |
| Q3               | £28,236     | v1.5 launches; AI Chat drives upgrades    |
| Q4               | £28,000     | Steady growth; enterprise pipeline builds |
| **Year 1 Total** | **£73,800** |                                           |

**Year 2:**

| Quarter          | Revenue      | Key events                   |
| ---------------- | ------------ | ---------------------------- |
| Q1               | £88,760      | Enterprise deals closing     |
| Q2               | £131,040     | v2.0 TikTok/Instagram launch |
| Q3               | £178,960     | Mobile app drives retention  |
| Q4               | £179,240     | Public API launched          |
| **Year 2 Total** | **£578,000** |                              |

**Year 3:**

| Quarter          | Revenue        | Key events                          |
| ---------------- | -------------- | ----------------------------------- |
| Q1               | £391,248       | Enterprise sales motion mature      |
| Q2               | £508,128       | v3.0 Enterprise SSO and marketplace |
| Q3               | £599,760       | Plugin ecosystem growing            |
| Q4               | £624,864       | Strong enterprise base              |
| **Year 3 Total** | **£2,124,000** |                                     |

---

## 11. Infrastructure Cost vs Revenue

| Month | Monthly revenue | Monthly infra | Infra % | Gross margin (excl. salaries) |
| ----- | --------------- | ------------- | ------- | ----------------------------- |
| 3     | £2,028          | £260          | 12.8%   | 87.2%                         |
| 6     | £6,968          | £400          | 5.7%    | 94.3%                         |
| 9     | £13,520         | £550          | 4.1%    | 95.9%                         |
| 12    | £21,424         | £726          | 3.4%    | 96.6%                         |
| 18    | £47,580         | £1,500        | 3.2%    | 96.8%                         |
| 24    | £98,436         | £2,300        | 2.3%    | 97.7%                         |
| 30    | £174,564        | £4,000        | 2.3%    | 97.7%                         |
| 36    | £262,184        | £6,000        | 2.3%    | 97.7%                         |

_Infrastructure as a percentage of revenue remains well below the 20% warning threshold throughout the entire 3-year projection. The SaaS model's leverage is clearly visible — revenue scales linearly while infrastructure scales sub-linearly._

### Gross Margin Analysis (Including AI Costs)

Total COGS = Infrastructure + AI API costs + Stripe fees (~3% of revenue)

| Month | Revenue  | Total COGS | Gross Margin |
| ----- | -------- | ---------- | ------------ |
| 6     | £6,968   | £2,000     | 71%          |
| 12    | £21,424  | £5,500     | 74%          |
| 18    | £47,580  | £11,500    | 76%          |
| 24    | £98,436  | £23,000    | 77%          |
| 36    | £262,184 | £55,000    | 79%          |

_Gross margin improves over time as AI caching becomes more effective and volume discounts are negotiated._

---

## 12. Profitability Targets

### EBITDA Milestones

| Milestone                       | Target month | Monthly revenue required |
| ------------------------------- | ------------ | ------------------------ |
| Infrastructure break-even       | Month 4–5    | £1,300+                  |
| Team break-even (1 person)      | Month 5–6    | £6,000+                  |
| Team break-even (3 people)      | Month 12     | £19,500+                 |
| EBITDA positive (6-person team) | Month 20–22  | £47,000+                 |
| 20% EBITDA margin               | Month 25–28  | £60,000+                 |
| 30% EBITDA margin               | Month 30–34  | £120,000+                |
| 40%+ EBITDA margin              | Month 36+    | £200,000+                |

### Cash Flow Considerations

- **Year 1 cash burn:** ~£80,000–£100,000 (covered by founder investment or pre-seed funding)
- **Annual plan prepayments** improve cash flow significantly — a £854 annual plan generates £854 upfront vs £89/month
- **Target: 25% annual plan take-rate** by Month 6 — this creates a cash buffer

### Funding Requirements

| Scenario                     | Year 1 cash requirement | Source                                                                  |
| ---------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| Bootstrapped (founder funds) | £80,000–£100,000        | Founder savings or consulting income                                    |
| Pre-seed raise               | £150,000–£300,000       | Angel investors or pre-seed fund; extends runway and accelerates hiring |
| Seed raise (if high growth)  | £500,000–£1,500,000     | Seed fund at Month 12–18 if MRR > £30,000                               |

---

## 13. Key Business KPIs

### Primary KPIs (Reviewed Weekly)

| KPI                         | Month 3 target | Month 6 target | Month 12 target | Month 24 target |
| --------------------------- | -------------- | -------------- | --------------- | --------------- |
| **MRR**                     | £2,000         | £7,000         | £21,000         | £98,000         |
| **Paying customers**        | 39             | 134            | 412             | 1,893           |
| **Free trial signups**      | 750            | 2,400          | 6,500           | 28,000          |
| **Free-to-paid conversion** | 5%             | 5.5%           | 6%              | 6.5%            |
| **Monthly churn**           | 8%             | 7%             | 6%              | 4%              |
| **ARPU**                    | £52            | £52            | £52             | £52             |

### Secondary KPIs (Reviewed Monthly)

| KPI                                               | Target      | Notes                                           |
| ------------------------------------------------- | ----------- | ----------------------------------------------- |
| Net Promoter Score (NPS)                          | > 40        | Measured via monthly in-app survey              |
| Customer Satisfaction (CSAT)                      | > 4.2/5     | Measured post-onboarding and post-support       |
| Daily Active Users / MAU (DAU/MAU)                | > 30%       | Engagement signal; low DAU/MAU = low stickiness |
| Average session duration                          | > 8 minutes | Indicates users are finding value               |
| Videos analysed per paying user/month             | > 20        | Core platform usage                             |
| Onboarding completion rate                        | > 70%       | Users who complete all 4 onboarding steps       |
| Feature adoption: Watchlist created within 7 days | > 50%       | Key early engagement signal                     |
| Support ticket volume per 100 customers           | < 5/month   | Indicates product quality                       |
| Payback period                                    | < 3 months  | CAC recovered within 3 months of payment        |

### Investor-Grade KPIs (Reviewed Quarterly)

| KPI                                  | Target                           |
| ------------------------------------ | -------------------------------- |
| MoM MRR growth rate                  | > 15% (Year 1), > 10% (Year 2)   |
| Net Revenue Retention (NRR)          | > 110% by Month 18               |
| LTV:CAC ratio                        | > 4:1                            |
| Gross margin                         | > 70%                            |
| Logo churn (% of customers churning) | < 5% monthly                     |
| Quick Ratio (new MRR / churned MRR)  | > 4                              |
| Rule of 40                           | Growth rate + EBITDA margin > 40 |

---

## 14. Growth Assumptions

### Year 1 Growth Drivers

1. **Product Hunt launch** — Expected top 5 of the day; historically generates 500–2,000 signups for a well-prepared launch
2. **Content marketing** — 2 long-form YouTube videos/month targeting creator education keywords; 4 blog posts/month
3. **Creator community** — Active participation in creator subreddits, Discord servers, and Twitter/X creator community
4. **Early adopter programme** — Offer 3 months free Professional to 50 influential creators in exchange for case studies and testimonials

### Year 2 Growth Drivers

1. **v1.5 features** — AI Chat Interface and Scheduled Reports significantly improve retention and trigger upgrades
2. **Referral programme** — Launch at Month 12; expect 15% of new customers from referrals by Month 18
3. **Enterprise outbound** — Hire first sales hire at Month 12 to target agencies and media companies
4. **v2.0 multi-platform** — TikTok and Instagram connectors expand TAM significantly; re-launch campaigns

### Year 3 Growth Drivers

1. **Enterprise expansion** — Multiple workspaces, SSO, and white-label drive enterprise ACV growth
2. **v3.0 plugin marketplace** — Creates network effects; third-party integrations drive new signups
3. **Geographic expansion** — Spanish, Portuguese, German content markets
4. **Public API ecosystem** — Developers building on ViralScopes data drive organic growth

---

## 15. Risks & Sensitivities

### Revenue Risk Matrix

| Risk                                  | Probability | Impact | Mitigation                                                                         |
| ------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------- |
| Free-to-paid conversion < 3%          | Medium      | High   | Improve onboarding; test pricing; add more features to free → paid bridge          |
| Monthly churn > 10% sustained         | Medium      | High   | Invest in customer success; improve product stickiness; add annual plan incentives |
| Product Hunt launch underperforms     | Medium      | Medium | Pre-build audience; prepare backup channels; launch on multiple platforms          |
| AI API pricing increases > 50%        | Low         | Medium | Aggressive caching; model diversification; pass cost to higher plans               |
| YouTube API terms change              | Low         | High   | Multi-source strategy (RapidAPI, Apify); platform-agnostic data model              |
| New direct competitor launches        | Medium      | Medium | Speed to market advantage; unique ethical positioning; proprietary Viral Score     |
| Enterprise sales cycle > 6 months     | Medium      | Medium | Focus on mid-market Business plan; enterprise as upside                            |
| CAC > £200 (paid channels don't work) | Medium      | Medium | Lean into organic/content; referral programme; reduce paid spend                   |

### Sensitivity Analysis: Impact of Key Variables on Year 1 ARR

| Variable                  | Base case   | Bear case      | Bull case     |
| ------------------------- | ----------- | -------------- | ------------- |
| Free-to-paid conversion   | 5%          | 3% (-40%)      | 8% (+60%)     |
| Monthly churn             | 7% avg      | 12% avg (-35%) | 4% avg (+25%) |
| ARPU                      | £52         | £42 (-19%)     | £65 (+25%)    |
| Monthly new signups (avg) | 400         | 200 (-50%)     | 700 (+75%)    |
| **Year 1 ARR outcome**    | **£73,800** | **£22,000**    | **£180,000**  |

### Bear Case Scenario

_If conversion is 3% AND churn is 12% AND signups are 200/month:_

- Year 1 ARR: ~£22,000
- Not enough to sustain a 3-person team
- Action: Pivot pricing, improve product, reduce burn rate, extend runway

### Bull Case Scenario

_If conversion is 8% AND churn is 4% AND signups are 700/month:_

- Year 1 ARR: ~£180,000
- Strong product-market fit signal
- Action: Accelerate hiring, increase marketing spend, consider seed raise

### Recommended Monitoring

Review the following every month to detect divergence from plan early:

- [ ] 30-day free-to-paid conversion rate vs 5% target
- [ ] Monthly logo churn vs 7% target (early stage)
- [ ] Weekly MRR vs plan (should not lag by more than 20% for more than 4 weeks)
- [ ] CAC by channel (identify which channels are cost-effective)
- [ ] NPS score (leading indicator of churn and referral growth)

---

_This document is reviewed and updated quarterly, or whenever a significant market or product change occurs that materially affects the projections._

---

**Related Documents:**

- [What_ViralScopes_Does.md](./What_ViralScopes_Does.md) — Business overview and value proposition
- [PRD.md](./PRD.md) — Product requirements and success metrics
- [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) — Cost model that supports gross margin calculations
- [ROADMAP.md](./ROADMAP.md) — Feature timeline that drives revenue projections
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — Current status and actuals vs plan
