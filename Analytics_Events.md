# Analytics_Events.md
# ViralScopes.io — Analytics Events Specification

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Analytics platform:** PostHog (self-hosted, GDPR-compliant) or Mixpanel
> **Cross-references:** [PRD.md](./PRD.md) · [KPI_Dashboard_Definitions.md](./KPI_Dashboard_Definitions.md) · [Database_Schema.md](./Database_Schema.md)

> `[ASSUMPTION]` PostHog self-hosted is the preferred analytics platform for GDPR compliance. If PostHog is replaced with Mixpanel or Amplitude, the event schema below applies to any platform. The key difference is server-side vs client-side event capture — this spec mandates server-side for all business-critical events.

---

## 1. Event Naming Standards

### Naming Convention

All events follow the format: `[Object] [Action]` in Title Case.

| Component | Rule | Example |
|---|---|---|
| Object | The thing being acted on | `Video`, `User`, `Subscription`, `Export` |
| Action | Past tense verb | `Viewed`, `Created`, `Upgraded`, `Completed` |
| Separator | Single space | `Video Viewed` |
| Compound objects | Title Case, no underscore | `Alert Rule Created` |

**Examples:**
- ✅ `User Signed Up`, `Video Analysed`, `Export Completed`, `Subscription Upgraded`
- ❌ `user_signup`, `VIDEO_ANALYZED`, `exportcompleted`

### Versioning

Event schemas are versioned with a `schema_version` property. When a breaking property change is made, increment the version:

```json
{
  "event": "Video Analysed",
  "properties": {
    "schema_version": 2,
    ...
  }
}
```

Schema changes are documented in `CHANGELOG.md`.

### Required Properties (All Events)

Every event must include:

```json
{
  "event": "Event Name",
  "properties": {
    "user_id": "01HXYZ...",
    "org_id": "01HABC...",
    "org_plan": "professional",
    "session_id": "sess_abc123",
    "timestamp": "2026-07-20T10:30:00Z",
    "platform": "web",
    "schema_version": 1
  }
}
```

---

## 2. Authentication Events

### User Signed Up

**Trigger:** New user account created (email/password or OAuth)
**Business purpose:** Track acquisition, measure registration conversion, identify drop-off

```json
{
  "event": "User Signed Up",
  "properties": {
    "method": "email | google | github",
    "referral_source": "product_hunt | organic | affiliate | direct | unknown",
    "referral_code": "abc123 | null",
    "utm_source": "twitter | google | null",
    "utm_medium": "social | cpc | email | null",
    "utm_campaign": "launch_2026 | null"
  }
}
```

### User Logged In

**Trigger:** Successful authentication
**Business purpose:** DAU/WAU/MAU measurement, session start

```json
{
  "event": "User Logged In",
  "properties": {
    "method": "email | google | github | api_key",
    "session_count": 42
  }
}
```

### Email Verified

**Trigger:** User clicks email verification link successfully
**Business purpose:** Measure verification funnel completion, identify abandoned signups

```json
{
  "event": "Email Verified",
  "properties": {
    "time_to_verify_minutes": 12
  }
}
```

### Password Reset Completed

**Trigger:** User successfully sets a new password via reset flow
**Business purpose:** Track account recovery success rate

---

## 3. Onboarding Events

### Onboarding Step Completed

**Trigger:** User completes each onboarding step
**Business purpose:** Identify onboarding drop-off points

```json
{
  "event": "Onboarding Step Completed",
  "properties": {
    "step": "create_org | choose_plan | first_watchlist | product_tour",
    "step_number": 1,
    "time_on_step_seconds": 45
  }
}
```

### Onboarding Completed

**Trigger:** User completes all onboarding steps
**Business purpose:** Track activation rate and time-to-activate

```json
{
  "event": "Onboarding Completed",
  "properties": {
    "total_time_minutes": 8,
    "plan_selected": "starter | professional | business | free",
    "first_watchlist_type": "channel | keyword | niche | competitor"
  }
}
```

---

## 4. Content & Analysis Events

### Video Analysed

**Trigger:** A video analysis is triggered (manually or via watchlist)
**Business purpose:** Track core feature usage, measure analysis volume vs quota

```json
{
  "event": "Video Analysed",
  "properties": {
    "trigger": "manual | watchlist | discovery",
    "video_platform": "youtube",
    "analysis_tier": "metadata_only | basic_ai | full_ai",
    "cached": true,
    "viral_score": 87.4,
    "hook_type": "statistic | question | shock | null"
  }
}
```

### Video Detail Viewed

**Trigger:** User navigates to a video detail page
**Business purpose:** Measure engagement depth, identify most-viewed content

```json
{
  "event": "Video Detail Viewed",
  "properties": {
    "video_id": "01HXYZ...",
    "viral_score": 87.4,
    "from_page": "trending | search | watchlist | recommendation"
  }
}
```

### Recommendation Viewed

**Trigger:** User views the recommendations tab for a video
**Business purpose:** Track usage of the ethical recommendation engine

```json
{
  "event": "Recommendation Viewed",
  "properties": {
    "video_id": "01HXYZ...",
    "recommendation_id": "01HABC...",
    "time_spent_seconds": 45
  }
}
```

---

## 5. Discovery & Search Events

### Dashboard Viewed

**Trigger:** User views any main dashboard page
**Business purpose:** Track active usage and most-used features

```json
{
  "event": "Dashboard Viewed",
  "properties": {
    "page": "home | trending | videos | channels | trends | opportunities | recommendations | watchlists | alerts | search | export | settings"
  }
}
```

### Search Performed

**Trigger:** User submits a search query
**Business purpose:** Understand what creators search for; improve search quality

```json
{
  "event": "Search Performed",
  "properties": {
    "query": "[hashed — do not log raw queries for PII]",
    "query_length": 24,
    "result_types": ["videos", "channels"],
    "result_count": 142,
    "filters_applied": ["language:en", "viral_score_min:70"],
    "time_to_results_ms": 320
  }
}
```

*Note: Raw search queries are hashed for privacy. Only query length and result count are stored in plaintext.*

### Trend Viewed

**Trigger:** User views a trend detail page
**Business purpose:** Measure trend feature engagement

```json
{
  "event": "Trend Viewed",
  "properties": {
    "trend_id": "01HXYZ...",
    "topic": "[hashed]",
    "status": "emerging | evergreen | declining",
    "velocity_score": 91.2,
    "opportunity_score": 84.7
  }
}
```

---

## 6. Watchlist & Alert Events

### Watchlist Created

**Trigger:** User creates a new watchlist
**Business purpose:** Measure engagement with the monitoring feature

```json
{
  "event": "Watchlist Created",
  "properties": {
    "watchlist_type": "channel | keyword | niche | competitor",
    "watchlist_count_for_org": 3
  }
}
```

### Alert Rule Created

**Trigger:** User configures a new alert rule
**Business purpose:** Measure alert feature engagement and delivery channel preferences

```json
{
  "event": "Alert Rule Created",
  "properties": {
    "trigger_type": "viral_score_threshold | trend_spike | channel_upload | breakout_prediction",
    "threshold_value": 80,
    "delivery_channels": ["discord", "email"],
    "alert_rules_count_for_org": 5
  }
}
```

### Alert Triggered

**Trigger:** An alert dispatches a notification
**Business purpose:** Measure alert system usage and value delivery

```json
{
  "event": "Alert Triggered",
  "properties": {
    "trigger_type": "viral_score_threshold",
    "delivery_channel": "discord | slack | email | telegram | webhook",
    "viral_score": 87.4,
    "time_to_dispatch_seconds": 48
  }
}
```

---

## 7. Export Events

### Export Created

**Trigger:** User triggers an export job
**Business purpose:** Track export feature usage, identify report use cases

```json
{
  "event": "Export Created",
  "properties": {
    "export_type": "videos | channels | trends | recommendations",
    "format": "csv | xlsx | json | pdf",
    "row_count_estimate": 847,
    "filters_applied": ["language:en", "from:2026-07-01"]
  }
}
```

### Export Completed

**Trigger:** Export file is ready and download link is available
**Business purpose:** Measure export completion rate and performance

```json
{
  "event": "Export Completed",
  "properties": {
    "export_id": "01HXYZ...",
    "format": "csv",
    "row_count": 847,
    "duration_seconds": 8,
    "file_size_kb": 284
  }
}
```

### Export Downloaded

**Trigger:** User clicks the export download link
**Business purpose:** Distinguish between exports triggered and actually used

---

## 8. Subscription & Billing Events

### Subscription Started

**Trigger:** User completes Stripe Checkout and activates a paid plan
**Business purpose:** Revenue tracking, plan mix analysis

```json
{
  "event": "Subscription Started",
  "properties": {
    "plan": "starter | professional | business | enterprise",
    "billing_cycle": "monthly | annual",
    "amount_gbp": 39,
    "previous_plan": "free",
    "days_on_free": 14,
    "provider": "stripe"
  }
}
```

### Subscription Upgraded

**Trigger:** User upgrades from one paid plan to a higher plan
**Business purpose:** Expansion revenue tracking, upgrade funnel analysis

```json
{
  "event": "Subscription Upgraded",
  "properties": {
    "from_plan": "starter",
    "to_plan": "professional",
    "amount_change_gbp": 50,
    "days_on_previous_plan": 45,
    "upgrade_trigger": "quota_limit | feature_gate | voluntary | sales"
  }
}
```

### Subscription Cancelled

**Trigger:** User cancels their subscription (cancel_at_period_end set)
**Business purpose:** Churn tracking, cancellation reason analysis

```json
{
  "event": "Subscription Cancelled",
  "properties": {
    "plan": "professional",
    "days_subscribed": 87,
    "cancellation_reason": "too_expensive | missing_features | not_using | switching_tool | other | not_provided",
    "mrr_lost_gbp": 89
  }
}
```

### Paywall Encountered

**Trigger:** User hits a feature that requires a higher plan
**Business purpose:** Identify upgrade drivers, optimise plan limits

```json
{
  "event": "Paywall Encountered",
  "properties": {
    "feature": "api_access | extra_watchlists | pdf_export | ai_chat | advanced_filters",
    "current_plan": "starter",
    "minimum_plan_required": "professional",
    "user_converted_within_7_days": false
  }
}
```

---

## 9. Funnel Tracking

### Acquisition Funnel

```
[Organic/Paid Traffic arrives]
         │
         ▼
[Marketing Site Viewed]        ← page_view event
         │
         ▼
[Sign Up Page Viewed]          ← Dashboard Viewed {page: "register"}
         │
         ▼
[User Signed Up]               ← User Signed Up event
         │
         ▼
[Email Verified]               ← Email Verified event
         │
         ▼
[Onboarding Completed]         ← Onboarding Completed event
         │
         ▼
[First Video Analysis Viewed]  ← Video Detail Viewed event
         │
         ▼ ← ACTIVATION MILESTONE
[Day 3: Dashboard Return Visit]
         │
         ▼
[Paywall Encountered]          ← Paywall Encountered event (conversion signal)
         │
         ▼
[Subscription Started]         ← Subscription Started event
```

### Activation Definition

A user is **activated** when they complete all of:
1. Email verified
2. Onboarding completed
3. At least 1 watchlist created
4. At least 3 video analyses viewed
5. Returns to the dashboard within 7 days of signup

**Activation rate target:** > 30% of all signups within 7 days.

### Retention Funnel Events

| Milestone | Event | Target |
|---|---|---|
| Day 1 return | `Dashboard Viewed` | > 60% |
| Week 1 return | `Dashboard Viewed` (day 2–7) | > 45% |
| Month 1 return | `Dashboard Viewed` (day 8–30) | > 35% |
| Habit formation | ≥ 3 sessions in week 2 | > 25% |
| Alert created | `Alert Rule Created` | > 40% of paying users |

---

## 10. Event Implementation Guidelines

### Server-Side vs Client-Side

| Event type | Capture method | Reason |
|---|---|---|
| Auth events | Server-side only | Cannot be blocked by adblockers; source of truth |
| Subscription events | Server-side only | Revenue events must be reliable |
| Analysis events | Server-side only | Backend-triggered; no client available |
| Page views | Client-side (PostHog autocapture) | Standard web analytics |
| Feature interactions | Client-side | UX-level events; adblocker impact is acceptable |

### Privacy Compliance

- No PII is included in event properties (no email, name, IP address)
- Search queries are hashed before logging
- User IDs are internal UUIDs, not email addresses
- All analytics data is stored in EU (GDPR-compliant PostHog configuration)
- Users can opt out of analytics tracking (reflected in cookie consent banner)
- Analytics data is excluded from GDPR data exports (no PII in events)

### Event Validation

All server-side events are validated against a Zod schema before being sent to the analytics platform. Invalid events are logged but not discarded — they are quarantined for schema review.
