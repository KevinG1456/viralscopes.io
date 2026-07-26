# Product_Strategy.md
# ViralScopes.io — Product Strategy

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Cross-references:** [PRD.md](./PRD.md) · [ROADMAP.md](./ROADMAP.md) · [What_ViralScopes_Does.md](./What_ViralScopes_Does.md) · [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md)

---

## 1. Product Vision

### Mission

> To give every content creator access to data-driven content strategy tools previously reserved for large media companies — without compromising originality or creative integrity.

### Vision

> ViralScopes becomes the standard intelligence infrastructure for professional content creation.

In five years, every professional creator uses ViralScopes the way a professional marketer uses Google Analytics: expected, assumed, and essential.

### Product Goals (3-Year Horizon)

| Goal | Measure | Target |
|---|---|---|
| Category leadership | Market position | #1 AI content intelligence platform for YouTube creators |
| Customer retention | Monthly churn | < 3% at steady state |
| Creator independence | Time savings | Replace 5+ hours of manual research per creator per week |
| Ethical standards | Originality enforcement | Zero verified incidents of the platform facilitating content copying |
| Platform expansion | Coverage | YouTube + TikTok + Instagram by Year 3 |

---

## 2. Product Principles

These six principles govern every product decision. When in doubt, return to them.

### P1 — Creator-First Development

Every feature is validated against a real creator workflow. The question is never "Can we build this?" but "Does a creator need this, and does it save them meaningful time or make them meaningfully more effective?"

**In practice:**
- No feature ships without a named user story from the [PRD.md](./PRD.md)
- Features are rated by time-saved per week, not by technical sophistication
- The free plan must always deliver genuine value (it is a product experience, not a demo)

### P2 — Intelligence Over Volume

The product doesn't show creators more data — it shows them the right data, interpreted. A Viral Score of 87.4 is more valuable than a page of uninterpreted metrics. A single original hook idea grounded in real performance data is more valuable than 50 generic suggestions.

**In practice:**
- Every new data point added to the UI requires a corresponding interpretation layer
- Dashboards are designed for decisions, not for exploration
- All AI outputs have a confidence signal — we never present analysis without indicating certainty

### P3 — Performance at Scale

The platform must respond quickly even as data volume grows. Background processing is preferred over blocking the UI. Caching is aggressive and intentional.

**Targets:**
- API p95 < 500ms
- Dashboard initial load < 2s
- Analysis queue lag < 5 minutes at 99th percentile

### P4 — Security and Privacy by Default

No feature that compromises user data security or GDPR compliance ships, regardless of business pressure. These are non-negotiable constraints, not trade-offs.

### P5 — Ethical AI is a Product Feature

The ethical constraint (no copying, only original recommendations) is not a restriction — it is a competitive advantage and a brand promise. Every AI workflow is designed with the constraint built in, not bolted on.

### P6 — Reliability Over Features

A slightly smaller feature set that works reliably beats an ambitious feature set that is flaky. SLO targets are part of every release definition.

---

## 3. Product Roadmap Summary

Full detail in [ROADMAP.md](./ROADMAP.md). This section provides strategic intent per phase.

### MVP (v1.0) — Weeks 1–20

**Strategic intent:** Build the foundation. Prove the core value loop: discover → analyse → score → alert → recommend.

**Must have at launch:**
- Video discovery, AI analysis pipeline (all 14 workflows)
- Viral Score (0–100) with explanation
- Trend detection and Opportunity Engine
- Watchlists and alert dispatch (5 channels)
- Ethical recommendation engine
- Export (CSV, Excel, JSON, PDF)
- Stripe billing (all 5 tiers)
- GDPR compliance

**Success criteria:** 30 paying customers within 60 days of launch. < 5% monthly churn in month 2.

### Growth (v1.5) — Month 8

**Strategic intent:** Deepen engagement. Give users tools that make the product impossible to leave.

**Key additions:** AI Chat Interface, Scheduled PDF Reports, Chrome Extension, Trend Prediction, Paddle billing.

**Strategic rationale:** The Chrome Extension and AI Chat are habit-forming. Daily active users who use the Chrome Extension or AI Chat have materially lower churn. These features make ViralScopes part of the creator's workflow, not just a tool they check weekly.

### Platform (v2.0) — Month 18

**Strategic intent:** Expand the addressable market. Multi-platform means multi-million creator TAM.

**Key additions:** TikTok, Instagram, Mobile App, Public API + SDKs, Affiliate Programme.

**Strategic rationale:** Adding TikTok and Instagram multiplies the TAM without proportional cost increase — the AI analysis pipeline is platform-agnostic once data normalisation is solved. The Public API unlocks a developer ecosystem that grows distribution without paid marketing.

### Enterprise & Ecosystem (v3.0) — Month 24+

**Strategic intent:** Lock in the upper market. Enterprise contracts create stable recurring ARR.

**Key additions:** Plugin Marketplace, Custom AI Models, Enterprise SSO, SOC 2 certification.

**Strategic rationale:** Enterprise customers have high ACV, low churn, and high NPS when supported well. The Plugin Marketplace creates a network effect — more integrations attract more users, which attracts more integrators.

---

## 4. Prioritisation Framework

### MoSCoW Applied to Product Decisions

**Must Have (MVP blocker):**
- Any gap blocks the core value loop (discover → analyse → score → recommend)
- Any gap creates a legal or compliance risk
- Any gap causes data loss or serious security vulnerability

**Should Have (next quarter):**
- Significantly reduces churn or increases engagement
- Directly requested by > 20% of active users in feedback
- Unlocks a new customer segment

**Could Have (backlog):**
- Nice-to-have quality of life improvement
- Requested by < 10% of users
- Would not materially change retention or conversion

**Won't Have For Now:**
- Features requiring platform capabilities not yet built
- Features for user segments outside current ICP
- Features that conflict with the ethical AI constraint
- Features that increase complexity without proportional user value

### Prioritisation Scorecards

New features are scored on four dimensions:

| Dimension | Weight | Question |
|---|---|---|
| Creator impact | 40% | How many creators benefit and by how much? |
| Retention impact | 30% | Does this reduce churn or increase daily active usage? |
| Revenue impact | 20% | Does this drive upgrades, expansions, or new plan selection? |
| Implementation effort | 10% (inverse) | Is the engineering cost proportionate to the benefit? |

Features scoring > 70 on the weighted scorecard proceed to sprint planning. Features scoring < 50 return to the backlog.

---

## 5. Success Metrics

### User Growth Metrics

| Metric | MVP target | 12-month target | 24-month target |
|---|---|---|---|
| MAU | 300 | 6,000 | 30,000 |
| Paying customers | 30 | 412 | 1,893 |
| Free → paid conversion | 5% | 8% | 10% |
| Organic signups (%) | 50% | 65% | 70% |

### Engagement Metrics

| Metric | Target | Notes |
|---|---|---|
| DAU/MAU ratio | > 20% | Measures habitual use |
| Sessions per week (paying) | > 3 | Healthy engagement benchmark |
| Videos analysed per org per month | > 20 | Validates ongoing usage |
| Alert rules per org | > 2 | Measures investment in the platform |
| Chrome Extension active users (v1.5+) | > 30% of paying users | Habit-formation signal |

### Retention Metrics

| Metric | Target | Notes |
|---|---|---|
| Month 1 retention | > 80% | Activation quality indicator |
| Month 3 retention | > 65% | Product-market fit indicator |
| Month 6 retention | > 55% | Churn rate stabiliser |
| Net Revenue Retention | > 110% | Expansion exceeds churn |
| Monthly churn | < 5% initially; < 3% by month 12 | Core health metric |

### Revenue Metrics

| Metric | MVP | 12 months | 24 months |
|---|---|---|---|
| MRR | £1,170 | £6,150 | £48,250 |
| ARR | £14,040 | £73,800 | £579,000 |
| ARPU | £39 | £55 | £75 |
| Gross margin | 65% | 75% | 82% |
| LTV:CAC | > 3:1 | > 5:1 | > 8:1 |

### Customer Satisfaction Metrics

| Metric | Target | Measure |
|---|---|---|
| NPS | > 40 | Quarterly NPS survey to all paying customers |
| Support ticket volume | < 2% of MAU per month | Indicator of UX quality |
| Time to first value | < 10 minutes | From signup to first analysis viewed |
| Feature request fulfilment | 30% implemented within 2 quarters | Builds customer trust |

Full financial targets in [Expected_Annual_Revenue_Target.md](./Expected_Annual_Revenue_Target.md).
