# n8n_Workflow_Diagrams.md
# ViralScopes.io — n8n Workflow Diagrams & Documentation

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Workflow files:** `/infra/n8n-workflows/` (version-controlled JSON exports)
> **Cross-references:** [ROADMAP.md](./ROADMAP.md) · [Database_Schema.md](./Database_Schema.md) · [URL_&_API_Structure.md](./URL_and_API_Structure.md) · [Deployment_Guide.md](./Deployment_Guide.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Workflow Index](#2-workflow-index)
3. [WF-01: Video Discovery](#3-wf-01-video-discovery)
4. [WF-02: Metadata Pipeline](#4-wf-02-metadata-pipeline)
5. [WF-03: Transcript Pipeline](#5-wf-03-transcript-pipeline)
6. [WF-04: Thumbnail Analysis](#6-wf-04-thumbnail-analysis)
7. [WF-05: AI Analysis Pipeline](#7-wf-05-ai-analysis-pipeline)
8. [WF-06: Title Formula Detection](#8-wf-06-title-formula-detection)
9. [WF-07: Hook Classification](#9-wf-07-hook-classification)
10. [WF-08: Engagement Analytics](#10-wf-08-engagement-analytics)
11. [WF-09: Viral Score Engine](#11-wf-09-viral-score-engine)
12. [WF-10: Trend Detection](#12-wf-10-trend-detection)
13. [WF-11: Opportunity Engine](#13-wf-11-opportunity-engine)
14. [WF-12: Ethical Recommendation Engine](#14-wf-12-ethical-recommendation-engine)
15. [WF-13: Channel Intelligence](#15-wf-13-channel-intelligence)
16. [WF-14: Alert Dispatch](#16-wf-14-alert-dispatch)
17. [Dead-Letter Queue & Error Handling](#17-dead-letter-queue--error-handling)
18. [Scheduler Reference](#18-scheduler-reference)
19. [Workflow Development Rules](#19-workflow-development-rules)

---

## 1. Architecture Overview

### How the API and n8n Communicate

```
┌──────────────────────────────────────────────────────────┐
│                    Fastify API                           │
│                                                          │
│  POST /api/v1/videos/analyze  ──▶  queue.service.ts     │
│  POST /api/v1/jobs/:wf/trigger──▶  queue.service.ts     │
│                                         │                │
└─────────────────────────────────────────┼────────────────┘
                                          │
                                   BullMQ (Redis)
                                   Queue: vs:standard:*
                                   Queue: vs:high:*
                                   Queue: vs:low:*
                                          │
┌─────────────────────────────────────────┼────────────────┐
│                    n8n Workers                           │
│                                         │                │
│     Polls queues every 5 seconds ◀──────┘                │
│                                                          │
│  WF-01 Video Discovery (CRON + manual)                   │
│  WF-02 Metadata Pipeline                                 │
│  WF-03 Transcript Pipeline                               │
│  WF-04 Thumbnail Analysis                                │
│  WF-05 AI Analysis Pipeline          [all consuming      │
│  WF-06 Title Formula Detection        from BullMQ        │
│  WF-07 Hook Classification            queues]            │
│  WF-08 Engagement Analytics                              │
│  WF-09 Viral Score Engine                                │
│  WF-10 Trend Detection (CRON)                            │
│  WF-11 Opportunity Engine (CRON)                         │
│  WF-12 Recommendation Engine                             │
│  WF-13 Channel Intelligence (CRON)                       │
│  WF-14 Alert Dispatch                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
       PostgreSQL                Redis
     (results stored)         (AI cache,
                             queue state)
```

### Video Analysis Pipeline Flow

```
YouTube API
    │
    ▼
WF-01 Video Discovery ──▶ [Enqueue video IDs]
                                    │
                                    ▼
                         WF-02 Metadata Pipeline
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
               WF-03 Transcript       WF-04 Thumbnail
               Pipeline               Analysis
                          │
                          ▼
               WF-05 AI Analysis Pipeline
                          │
              ┌───────────┼──────────────┐
              ▼           ▼              ▼
        WF-06 Title  WF-07 Hook    WF-08 Engagement
        Formula      Classification Analytics
              │           │              │
              └───────────┴──────────────┘
                          │
                          ▼
               WF-09 Viral Score Engine
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
        WF-12 Recommendation   WF-14 Alert Dispatch
        Engine                 (if score threshold met)
```

### Queue Priority System

| Queue | Name | Workflows | Priority |
|---|---|---|---|
| High | `vs:high:alert-dispatch` | WF-14 Alert Dispatch | Dispatched within 2 minutes |
| High | `vs:high:viral-score` | WF-09 Viral Score | Processed before standard |
| Standard | `vs:standard:ai-analysis` | WF-05 AI Analysis | Main throughput queue |
| Standard | `vs:standard:transcript` | WF-03 Transcript | — |
| Standard | `vs:standard:thumbnail` | WF-04 Thumbnail | — |
| Standard | `vs:standard:metadata` | WF-02 Metadata | — |
| Standard | `vs:standard:recommendation` | WF-12 Recommendation | — |
| Low | `vs:low:trend-detection` | WF-10 Trend Detection | Non-urgent batch |
| Low | `vs:low:opportunity` | WF-11 Opportunity | Non-urgent batch |
| Low | `vs:low:channel-intel` | WF-13 Channel Intelligence | Non-urgent batch |

---

## 2. Workflow Index

| ID | Name | File | Trigger | Queue | Avg duration |
|---|---|---|---|---|---|
| WF-01 | Video Discovery | `video-discovery.json` | CRON + manual | — (producer) | 20–30 min |
| WF-02 | Metadata Pipeline | `metadata-pipeline.json` | Queue | `vs:standard:metadata` | 5–15 sec |
| WF-03 | Transcript Pipeline | `transcript-pipeline.json` | Queue | `vs:standard:transcript` | 10–30 sec |
| WF-04 | Thumbnail Analysis | `thumbnail-analysis.json` | Queue | `vs:standard:thumbnail` | 15–45 sec |
| WF-05 | AI Analysis Pipeline | `ai-analysis-pipeline.json` | Queue | `vs:standard:ai-analysis` | 30–90 sec |
| WF-06 | Title Formula Detection | `title-formula-detection.json` | Queue | `vs:standard:metadata` | 5–10 sec |
| WF-07 | Hook Classification | `hook-classification.json` | Queue | `vs:standard:transcript` | 10–20 sec |
| WF-08 | Engagement Analytics | `engagement-analytics.json` | Queue | `vs:standard:metadata` | 2–5 sec |
| WF-09 | Viral Score Engine | `viral-score-engine.json` | Queue | `vs:high:viral-score` | 2–5 sec |
| WF-10 | Trend Detection | `trend-detection.json` | CRON daily | `vs:low:trend-detection` | 30–90 min |
| WF-11 | Opportunity Engine | `opportunity-engine.json` | CRON weekly | `vs:low:opportunity` | 10–30 min |
| WF-12 | Ethical Recommendation Engine | `ethical-recommendation.json` | Queue | `vs:standard:recommendation` | 20–60 sec |
| WF-13 | Channel Intelligence | `channel-intelligence.json` | CRON daily | `vs:low:channel-intel` | 5–20 min |
| WF-14 | Alert Dispatch | `alert-dispatch.json` | Queue | `vs:high:alert-dispatch` | 5–15 sec |

---

## 3. WF-01: Video Discovery

**File:** `video-discovery.json`
**Trigger:** CRON every 6 hours + manual via `POST /api/v1/jobs/video-discovery/trigger`
**Purpose:** Discover new high-performing YouTube videos and enqueue them for analysis.

### Flow Diagram

```
[CRON / Manual Trigger]
         │
         ▼
[Load discovery config from DB]
  - Categories
  - Languages
  - Regions
  - Date range (last 14 days)
  - View range (50k–300k)
         │
         ▼
[Call YouTube Data API: search]
  - Type: video
  - Order: relevance
  - Published after: 14 days ago
  - Cost: 100 units per search call
         │
         ▼
[For each result: check duplicate]
  - Query: SELECT id FROM videos WHERE platform_video_id = ?
  - If EXISTS → skip (already discovered)
  - If NOT EXISTS → continue
         │
         ▼
[Insert new video record]
  - Status: pending
  - platform: youtube
  - platform_video_id: [id]
  - title, description, thumbnail_url, channel_id
  - published_at, view_count, like_count, comment_count
         │
         ▼
[Enqueue for Metadata Pipeline]
  - Queue: vs:standard:metadata
  - Payload: { videoId: [uuid] }
         │
         ▼
[Log execution to job_logs]
  - workflow_name: video-discovery
  - status: completed
  - output_summary: { discovered: N, skipped: M, queued: K }
```

### Failure Path

```
[YouTube API call fails]
         │
    ┌────┴────┐
    │ Retry?  │
    │ < 3x    │
    └────┬────┘
         │ Yes → Wait 30s, retry
         │ No  → Write to dead_letter_jobs
                 Send admin notification
```

### Key Notes

- YouTube quota cost: 100 units per search call × N searches (budget per run: 500–2,000 units)
- Duplicate check prevents re-analysis within 24h (cache-first strategy)
- The workflow handles multiple category/language combinations in a single run
- Run every 6 hours: 00:00, 06:00, 12:00, 18:00 UTC

---

## 4. WF-02: Metadata Pipeline

**File:** `metadata-pipeline.json`
**Trigger:** BullMQ queue `vs:standard:metadata`
**Purpose:** Fetch full metadata for a discovered video and enqueue downstream analysis.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Look up video record in DB]
  - Get platform_video_id
         │
         ▼
[Call YouTube Data API: videos.list]
  - Parts: snippet, statistics, contentDetails
  - Cost: 1 unit per video
         │
         ▼
[Normalise and validate response]
  - Duration: ISO 8601 → seconds
  - Tags: array → stored as TEXT[]
  - Language: auto-detect if not set
  - Handle null values gracefully
         │
         ▼
[UPDATE videos SET]
  - title, description, tags, thumbnail_url
  - duration_secs, language, category
  - view_count, like_count, comment_count
  - analysis_status = 'processing'
  - last_analysed_at = NOW()
         │
         ▼
[Enqueue parallel analysis tasks]
  ├── vs:standard:transcript  { videoId }
  ├── vs:standard:thumbnail   { videoId, thumbnailUrl }
  └── vs:low:channel-intel    { channelId }
         │
         ▼
[Log to job_logs]
```

### Failure Path

```
[YouTube API returns 404 (video deleted)]
  → UPDATE videos SET analysis_status = 'failed', 
                      error = 'video_not_found'
  → Do NOT dead-letter (expected failure type)
  → Log as 'warn' not 'error'

[YouTube API returns 403 (quota exceeded)]
  → Pause queue consumer
  → Set quota_exhausted flag in Redis
  → Activate RapidAPI fallback
  → Retry after 60s

[Network timeout]
  → Retry up to 3× with exponential backoff
  → After 3 failures → dead_letter_jobs
```

---

## 5. WF-03: Transcript Pipeline

**File:** `transcript-pipeline.json`
**Trigger:** BullMQ queue `vs:standard:transcript`
**Purpose:** Fetch video captions and store them for downstream AI analysis.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Call YouTube Data API: captions.list]
  - Cost: 50 units
         │
         ▼
[Captions available?]
         │
    ┌────┴──────────────────────┐
    │ YES                       │ NO
    ▼                           ▼
[Prefer manual captions      [UPDATE videos SET]
 over auto-generated]          transcript_status = 'unavailable'
         │                     [Log to job_logs]
         ▼                     [STOP — no AI analysis without transcript]
[Download caption track]
  - Format: SRT or VTT
  - Convert to plain text
         │
         ▼
[Store in transcripts table]
  - raw_text: full transcript
  - language: detected
  - is_auto_generated: bool
         │
         ▼
[UPDATE videos SET]
  transcript_status = 'available'
         │
         ▼
[Enqueue for AI Analysis]
  Queue: vs:standard:ai-analysis
  Payload: { videoId }
         │
         ▼
[Log to job_logs]
```

### Key Notes

- Transcripts are only fetched when captions exist (manual or auto-generated)
- Auto-generated captions are used as a fallback; quality is variable
- Videos without transcripts still receive thumbnail and title analysis (WF-04, WF-06)
- The `transcript_status` field is used by WF-05 to check prerequisites

---

## 6. WF-04: Thumbnail Analysis

**File:** `thumbnail-analysis.json`
**Trigger:** BullMQ queue `vs:standard:thumbnail`
**Purpose:** Analyse the video thumbnail using AI vision to predict CTR potential.

### Flow Diagram

```
[Dequeue job: { videoId: uuid, thumbnailUrl: string }]
         │
         ▼
[Validate thumbnail URL]
  - Must be from allowed domains:
    i.ytimg.com, img.youtube.com, yt3.ggpht.com
         │
         ▼
[Download thumbnail image]
  - Timeout: 10 seconds
  - Max size: 5MB
  - Validate Content-Type starts with 'image/'
         │
         ▼
[Check AI response cache]
  Key: vs:ai:thumbnail:{sha256(thumbnailUrl)}
  TTL: 24h
         │
    ┌────┴────┐
    │  HIT    │  MISS
    ▼         ▼
[Use cached  [Call AI Vision API]
 result]      - Model: gpt-4o (vision)
              - Prompt: thumbnail-analysis v{active}
              - Input: base64 thumbnail image
              - Expected output: JSON
              │
              ▼
             [Validate output against Zod schema]
              - Required: emotion, ctr_prediction
              - Optional: faces_count, has_text, etc.
              │
              ├── VALID → Cache result, continue
              └── INVALID → Dead-letter job, stop
         │
         ▼
[INSERT into thumbnail_analyses]
  - emotion, faces_count, has_text, text_content
  - dominant_colors, contrast_score, composition_type
  - objects_detected, ctr_prediction, ctr_confidence
  - raw_output (full AI response preserved)
  - prompt_version, model_used
         │
         ▼
[Log to job_logs with cache_hit: bool]
```

### Zod Validation Schema (Summary)

```typescript
const thumbnailAnalysisSchema = z.object({
  emotion: z.enum(["surprise","joy","trust","fear","sadness",
                   "disgust","anger","anticipation","neutral"]),
  faces_count: z.number().int().min(0),
  has_text: z.boolean(),
  text_content: z.string().nullable(),
  text_density: z.number().min(0).max(1),
  dominant_colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).max(5),
  contrast_score: z.number().min(0).max(1),
  composition_type: z.enum(["rule_of_thirds","central","split",
                             "frame_in_frame","leading_lines","other"]),
  objects_detected: z.array(z.string()).max(10),
  background_type: z.string().nullable(),
  ctr_prediction: z.number().min(0).max(100),
  ctr_confidence: z.number().min(0).max(1),
});
```

---

## 7. WF-05: AI Analysis Pipeline

**File:** `ai-analysis-pipeline.json`
**Trigger:** BullMQ queue `vs:standard:ai-analysis`
**Purpose:** Run the full AI content analysis on a video's transcript and metadata.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Check prerequisites]
  - transcript_status = 'available'?
  - If NOT → log warning, stop
         │
         ▼
[Load transcript and video metadata from DB]
         │
         ▼
[Load active prompt from prompt_library]
  - name: 'video-analysis'
  - WHERE is_active = true
         │
         ▼
[Build cache key]
  Key: vs:ai:analysis:{prompt.version}:{sha256(transcript + title + description)}
         │
         ▼
[Check AI response cache]
         │
    ┌────┴────┐
    │  HIT    │  MISS
    ▼         ▼
[Use cached  [Render prompt template]
 result]      - Inject: title, description, transcript text
              - Inject: target_output_schema as JSON
              │
              ▼
             [Call Anthropic Claude API]
              - Model: claude-sonnet-4-6
              - system_prompt: from prompt_library
              - user_message: rendered template
              │
              ▼
             [Validate output against Zod schema]
              │
              ├── VALID → Cache (24h TTL), continue
              └── INVALID → Dead-letter job, stop
         │
         ▼
[INSERT into video_analyses]
  - hook_type, hook_confidence, hook_summary
  - story_structure, narrative_arc, content_summary
  - target_audience, audience_level, primary_emotion
  - retention_tactics, key_themes, virality_drivers
  - content_weaknesses, cta_type, cta_text
  - raw_output, prompt_version, model_used
         │
         ▼
[Enqueue downstream workflows]
  ├── vs:standard:transcript  → WF-07 Hook Classification
  ├── vs:standard:metadata    → WF-06 Title Formula Detection
  └── vs:high:viral-score     → WF-09 Viral Score Engine
         │
         ▼
[Log to job_logs]
```

### Prompt Template Variables

| Variable | Source | Example |
|---|---|---|
| `{{title}}` | `videos.title` | "How I Saved £10,000 in 6 Months" |
| `{{description}}` | `videos.description` | First 500 chars |
| `{{transcript}}` | `transcripts.raw_text` | Full transcript text |
| `{{duration_secs}}` | `videos.duration_secs` | 847 |
| `{{view_count}}` | `videos.view_count` | 284000 |
| `{{output_schema}}` | `prompt_library.output_schema` | JSON schema object |

---

## 8. WF-06: Title Formula Detection

**File:** `title-formula-detection.json`
**Trigger:** BullMQ queue `vs:standard:metadata`
**Purpose:** Classify the video title into a known structural formula type.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Load video title from DB]
         │
         ▼
[Check cache: vs:ai:title:{sha256(title)}]
         │
    ┌────┴────┐
    │  HIT    │  MISS
    ▼         ▼
[Use cached  [Call AI: title formula detection]
 result]      - Model: gpt-4o-mini (cost-efficient)
              - Prompt: title-formula-detection v{active}
              - Input: video title only
              │
              ▼
             [Validate output]
              - formula_type must be in enum
              - template must be a string
              │
              ├── VALID → Cache (24h TTL)
              └── INVALID → Dead-letter
         │
         ▼
[INSERT into title_analyses]
  - formula_type (e.g. 'how_i_did_x_in_y')
  - formula_template (e.g. 'How I [Action] in [Timeframe]')
  - keywords, power_words
  - character_count, word_count
  - has_number, number_value, sentiment
  - title_score
         │
         ▼
[Log to job_logs]
```

### Formula Types Enum

```
'how_i_did_x_in_y'       — "How I Saved £10k in 6 Months"
'why_you_should_x'        — "Why You Should Never Do X"
'top_n_x'                 — "Top 10 Ways to X"
'the_truth_about_x'       — "The Truth About X (That Nobody Tells You)"
'nobody_tells_you_x'      — "The X Secret Nobody Tells You"
'i_tried_x_for_y_days'    — "I Tried X for 30 Days — Here's What Happened"
'x_vs_y'                  — "X vs Y — Which Is Actually Better?"
'how_to_x'                — "How to X (Complete Guide)"
'what_happens_when_x'     — "What Happens When You Stop Doing X"
'x_things_about_y'        — "7 Things About X That Will Change How You Think"
'is_x_worth_it'           — "Is X Actually Worth It in 2026?"
'i_spent_x_on_y'          — "I Spent £X on Y — Was It Worth It?"
'question'                 — Title is a direct question
'statement'                — Declarative statement (no clear formula)
'other'                    — Doesn't match known patterns
```

---

## 9. WF-07: Hook Classification

**File:** `hook-classification.json`
**Trigger:** BullMQ queue `vs:standard:transcript`
**Purpose:** Classify the opening hook technique of the video.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Load transcript from DB]
  - Extract first 60 seconds of text
  - Use hook_text if already extracted; else slice raw_text
         │
         ▼
[Check cache: vs:ai:hook:{sha256(hook_text)}]
         │
    ┌────┴────┐
    │  HIT    │  MISS
    ▼         ▼
[Use cached  [Call AI: hook classification]
 result]      - Model: gpt-4o-mini
              - Prompt: hook-classification v{active}
              - Input: first 60s of transcript
              │
              ▼
             [Validate: hook_type in enum, confidence 0–1]
              │
              ├── VALID → Cache (24h)
              └── INVALID → Dead-letter
         │
         ▼
[UPDATE video_analyses SET]
  - hook_type: classified type
  - hook_confidence: float 0.00–1.00
  - hook_summary: one-sentence description
         │
         ▼
[Log to job_logs]
```

### Hook Types

| Type | Description | Example opening |
|---|---|---|
| `question` | Opens with a direct question to the viewer | "Have you ever wondered why some creators grow 10× faster?" |
| `shock` | Opens with a surprising or counterintuitive statement | "I deleted my entire YouTube channel. Here's why." |
| `statistic` | Opens with a specific number or data point | "93% of YouTubers quit within 6 months. I almost did too." |
| `fear` | Opens by triggering fear of missing out or a negative outcome | "If you're still doing this, you're leaving money on the table." |
| `story` | Opens by placing the viewer into a narrative | "Three years ago I was working a 9-to-5 I hated. Then everything changed." |
| `mystery` | Opens with a puzzle or unanswered question | "What happened next shocked even me." |
| `promise` | Opens with a clear commitment of what will be delivered | "In this video I'm going to show you exactly how I..." |
| `curiosity` | Opens with something visually or verbally intriguing | "I found something in my attic that changed my entire business." |
| `humour` | Opens with a joke or comedic setup | "I tried to make a thousand pounds in a week. It did not go well." |

---

## 10. WF-08: Engagement Analytics

**File:** `engagement-analytics.json`
**Trigger:** BullMQ queue `vs:standard:metadata`
**Purpose:** Compute derived engagement metrics from raw video statistics.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Load video stats from DB]
  - view_count, like_count, comment_count
  - published_at, duration_secs
         │
         ▼
[Compute metrics — pure calculations, no AI]

  days_since_published = (NOW() - published_at) / 86400
  views_per_day        = view_count / MAX(days_since_published, 1)
  likes_ratio          = like_count / MAX(view_count, 1)
  comments_ratio       = comment_count / MAX(view_count, 1)
  
  engagement_rate      = (like_count + comment_count) / MAX(view_count, 1)
  
  velocity_score       = views_per_day / benchmark_for_category
  (benchmark loaded from platform config)
         │
         ▼
[UPDATE videos SET]
  - views_per_day
  - likes_ratio
  - comments_ratio
         │
         ▼
[Log to job_logs]
```

### Key Notes

- No AI calls in this workflow — purely mathematical
- Benchmark values per category are stored in a platform config table
- This workflow runs after metadata is fetched; it is fast (< 5 seconds typical)
- Results feed directly into WF-09 Viral Score computation

---

## 11. WF-09: Viral Score Engine

**File:** `viral-score-engine.json`
**Trigger:** BullMQ queue `vs:high:viral-score`
**Purpose:** Compute the proprietary Viral Score (0–100) for a fully analysed video.

### Flow Diagram

```
[Dequeue job: { videoId: uuid }]
         │
         ▼
[Check all prerequisites are ready]
  - thumbnail_analysis exists?
  - title_analysis exists?
  - video_analysis exists?
  - engagement metrics computed?
  
  → If any missing: re-enqueue with 30s delay (wait for upstream)
  → After 5 re-enqueue attempts: dead-letter
         │
         ▼
[Load all analysis data for this video]
         │
         ▼
[Compute Viral Score — weighted algorithm]

  Inputs and weights:
  ┌─────────────────────────────────────────────────┐
  │ Signal                    │ Weight │ Source      │
  ├───────────────────────────┼────────┼─────────────┤
  │ Title formula score       │ 15%    │ title_analyses.title_score    │
  │ Thumbnail CTR prediction  │ 20%    │ thumbnail_analyses.ctr_prediction │
  │ Hook type confidence      │ 15%    │ video_analyses.hook_confidence │
  │ Views per day             │ 20%    │ videos.views_per_day          │
  │ Likes ratio               │  8%    │ videos.likes_ratio            │
  │ Comments ratio            │  7%    │ videos.comments_ratio         │
  │ Topic trend score         │ 10%    │ trends.velocity_score         │
  │ Growth rate               │  3%    │ computed from velocity        │
  │ Publication timing        │  2%    │ published_at day/hour         │
  └─────────────────────────────────────────────────┘

  viral_score = sum(signal_score × weight) normalised to 0–100
  confidence  = min(data_completeness_factor, signal_confidence_avg)
         │
         ▼
[UPDATE videos SET]
  - viral_score: computed value
  - viral_score_confidence: computed confidence
  - viral_score_computed_at: NOW()
  - analysis_status: 'complete'
         │
         ▼
[Check alert thresholds]
  - Load alert_rules WHERE trigger_type = 'viral_score_threshold'
  - For each rule: if viral_score >= threshold → enqueue WF-14
  - Queue: vs:high:alert-dispatch
         │
         ▼
[Enqueue WF-12 Recommendation Engine]
  Queue: vs:standard:recommendation
  Payload: { videoId }
         │
         ▼
[Log to job_logs]
```

### Score Weighting Rationale

| Signal | Weight | Why this weight |
|---|---|---|
| Thumbnail CTR | 20% | CTR is the #1 factor in YouTube algorithm distribution |
| Views per day | 20% | Raw velocity is the most direct indicator of viral spread |
| Title formula | 15% | Proven title formulas significantly increase click-through |
| Hook confidence | 15% | Strong hooks are the #1 retention factor |
| Topic trend | 10% | Riding an emerging topic multiplies organic reach |
| Likes ratio | 8% | Positive signal to YouTube algorithm |
| Comments ratio | 7% | Community engagement signal |
| Growth rate | 3% | Acceleration of views (not just total velocity) |
| Publication timing | 2% | Minor factor but measurable for certain audiences |

*Weights are configurable via the Super Admin Panel without code deployment.*

---

## 12. WF-10: Trend Detection

**File:** `trend-detection.json`
**Trigger:** CRON daily at 03:00 UTC + manual via `POST /api/v1/jobs/trend-detection/trigger`
**Purpose:** Cluster all recent videos by topic and classify topic trends.

### Flow Diagram

```
[CRON / Manual Trigger]
         │
         ▼
[Load recent videos from DB]
  - published_at > 14 days ago
  - analysis_status = 'complete'
  - viral_score > 40 (only meaningful videos)
         │
         ▼
[Extract topics and themes]
  - From: video_analyses.key_themes (jsonb array)
  - Aggregate across all videos
  - Create flat list of [topic, video_id, viral_score]
         │
         ▼
[Batch topics for AI clustering]
  - Bundle 50 topics per AI call (cost efficiency)
  - Load prompt: 'trend-clustering' (active version)
         │
         ▼
[For each batch: Call Claude API]
  - Input: 50 topics with their video counts and avg viral scores
  - Output: JSON array of clusters with:
    { topic, related_topics, cluster_label, status_hint }
         │
         ▼
[Validate output against Zod schema]
  VALID → continue
  INVALID → dead-letter this batch; continue with others
         │
         ▼
[For each cluster: compute metrics]
  - video_count: how many videos on this topic
  - avg_viral_score: mean score of videos in cluster
  - velocity_score: rate of new videos entering the cluster
  - growth_rate: week-over-week change in video count
  - competition_score: inverse of content saturation
  - opportunity_score: (velocity × demand) / competition
         │
         ▼
[Classify each cluster]
  'emerging':  velocity_score > 70 AND video_count < 50
  'evergreen': consistent video_count over 30 days
  'declining': velocity_score < 20 AND trending downward
  'unknown':   insufficient data
         │
         ▼
[UPSERT into trends table]
  - ON CONFLICT (topic, platform, language, snapshot_date) DO UPDATE
  - snapshot_date = TODAY
         │
         ▼
[Log to job_logs with summary stats]
```

---

## 13. WF-11: Opportunity Engine

**File:** `opportunity-engine.json`
**Trigger:** CRON weekly (Monday 05:00 UTC) + manual
**Purpose:** Identify and rank content opportunities (high demand, low competition, fast growth).

### Flow Diagram

```
[CRON / Manual Trigger]
         │
         ▼
[Load all trends from today's snapshot]
  - WHERE snapshot_date = TODAY
  - AND status IN ('emerging', 'evergreen')
         │
         ▼
[For each trend: compute opportunity score]

  opportunity_score = (
    (velocity_score × 0.40) +
    (avg_viral_score × 0.30) +
    ((100 - competition_score) × 0.20) +
    (growth_rate_normalised × 0.10)
  )
         │
         ▼
[Rank all trends by opportunity_score DESC]
         │
         ▼
[UPDATE trends SET opportunity_score]
  - Store computed score for each trend
         │
         ▼
[Cache top 50 opportunities in Redis]
  Key: vs:trends:opportunities:snapshot:{date}
  TTL: 26 hours (covers until next daily snapshot)
         │
         ▼
[Log to job_logs]
```

### Key Notes

- No AI calls — purely computational ranking
- Results are cached in Redis for fast API response on `GET /api/v1/trends/opportunities`
- Weekly full refresh; daily trend detection updates the underlying data
- The opportunity_score formula weights are configurable in platform config

---

## 14. WF-12: Ethical Recommendation Engine

**File:** `ethical-recommendation.json`
**Trigger:** BullMQ queue `vs:standard:recommendation`
**Purpose:** Generate original, ethically-constrained content recommendations for a video, scoped per organisation.

### Flow Diagram

```
[Dequeue job: { videoId: uuid, orgIds: uuid[] }]
         │
         ▼
[Load full analysis for video from DB]
  - video: title, description, viral_score
  - video_analysis: hook_type, story_structure, virality_drivers
  - title_analysis: formula_type, formula_template
  - thumbnail_analysis: emotion, composition_type, ctr_prediction
         │
         ▼
[Load active prompt: 'ethical-recommendation']
         │
         ▼
[Build cache key]
  Key: vs:ai:recommendation:{prompt.version}:{sha256(videoId + analysisHash)}
         │
         ▼
[Check cache]
         │
    ┌────┴────┐
    │  HIT    │  MISS
    ▼         ▼
[Use cached  [Render prompt with analysis data]
 result]      
              CRITICAL — System prompt constraint:
              "You are helping a creator develop ORIGINAL content.
               NEVER reproduce, paraphrase, or closely imitate the
               title, script, hook, or creative expression of the
               video being analysed. Your recommendations must be
               structurally inspired but entirely original."
              │
              ▼
             [Call Claude API: ethical-recommendation]
              Output must include:
              - title_concept (original title idea)
              - hook_concept (original hook approach)
              - content_outline (array of sections)
              - thumbnail_concept (visual description)
              - keywords (array of SEO terms)
              - cta_suggestion (original CTA idea)
              │
              ▼
             [Validate against Zod schema]
              VALID → Cache (24h), continue
              INVALID → Dead-letter
         │
         ▼
[For each orgId in job payload]
  UPSERT into recommendations:
  - video_id, org_id
  - title_concept, hook_concept
  - content_outline (jsonb)
  - thumbnail_concept, keywords, cta_suggestion
  - prompt_version, model_used
  ON CONFLICT (video_id, org_id) DO UPDATE
         │
         ▼
[Log to job_logs]
```

### Ethical Constraint Enforcement

The ethical constraint is enforced at **three layers**:

| Layer | Mechanism |
|---|---|
| System prompt | Explicit instruction in the Claude system prompt: never reproduce creator work |
| Output validation | Zod schema validates structure but also checks that `title_concept` differs from the original `videos.title` by > 50% edit distance |
| UI labelling | All recommendations shown in the dashboard are labelled: "AI-generated original recommendation — inspired by structural patterns, not copied" |

---

## 15. WF-13: Channel Intelligence

**File:** `channel-intelligence.json`
**Trigger:** CRON daily at 04:00 UTC + on-demand when a new channel is discovered
**Purpose:** Build and update channel profiles with growth and posting pattern intelligence.

### Flow Diagram

```
[CRON / On-demand trigger]
         │
         ▼
[Load channels updated > 24h ago]
  - OR newly discovered channels (last_analysed_at IS NULL)
         │
         ▼
[For each channel: call YouTube API channels.list]
  - Parts: snippet, statistics, brandingSettings
  - Cost: 1 unit per channel
         │
         ▼
[Compute channel metrics from recent videos]
  - Load all videos for this channel from DB (last 90 days)
  - avg_views: mean view_count
  - avg_duration_secs: mean duration
  - upload_frequency: count / 90 * 7 (videos per week)
  - avg_viral_score: mean viral_score (if analysed)
  - growth_score: computed from subscriber_estimate trend
  - topic_focus: most common key_themes across videos
  - posting_schedule: most common published_at day + hour
         │
         ▼
[UPSERT into channels table]
  - subscriber_estimate, avg_views, avg_duration_secs
  - upload_frequency, growth_score
  - topic_focus (text[])
  - posting_schedule (jsonb)
  - last_analysed_at = NOW()
         │
         ▼
[Log to job_logs]
```

---

## 16. WF-14: Alert Dispatch

**File:** `alert-dispatch.json`
**Trigger:** BullMQ queue `vs:high:alert-dispatch`
**Purpose:** Dispatch alert notifications to configured channels when a trigger condition is met.

### Flow Diagram

```
[Dequeue job: { alertRuleId: uuid, triggerType: string,
                videoId?: uuid, trendId?: uuid }]
         │
         ▼
[Load alert rule from DB]
  - delivery_channels (jsonb array)
  - threshold_value
  - is_active (abort if false)
         │
         ▼
[Check throttle]
  Redis key: vs:alert:throttle:{alertRuleId}
  TTL: 3600 seconds (1 hour)
  
  If key EXISTS → skip (throttled), log as 'throttled'
  If NOT EXISTS → set key, proceed
         │
         ▼
[Load trigger data]
  - If videoId: load video + analysis summary
  - If trendId: load trend data
         │
         ▼
[Build alert payload]
  {
    event: "alert.fired",
    timestamp: NOW(),
    alertRuleName: rule.name,
    triggerType: rule.trigger_type,
    video?: { title, url, viralScore, channelName },
    trend?: { topic, status, velocityScore },
    deepLink: "https://app.viralscopes.io/..."
  }
         │
         ▼
[Dispatch to each configured channel]
  ├── type: 'email'
  │   → Call SendGrid/Resend API
  │   → Use template: alert-notification
  │
  ├── type: 'discord'
  │   → POST to webhookUrl
  │   → Format: Discord embed message
  │
  ├── type: 'slack'
  │   → POST to webhookUrl
  │   → Format: Slack Block Kit message
  │
  ├── type: 'telegram'
  │   → POST to Telegram Bot API
  │   → Format: HTML-formatted message
  │
  └── type: 'webhook'
      → POST to user-configured URL
      → Include X-ViralScopes-Signature header
      → Body: full alert payload JSON
         │
         ▼
[Log each dispatch to alert_events]
  - status: 'sent' | 'failed' | 'throttled'
  - delivery_channel, delivery_target, payload
         │
         ▼
[UPDATE alert_rules SET last_triggered_at = NOW()]
         │
         ▼
[Log to job_logs]
```

### Discord Message Format

```json
{
  "embeds": [{
    "title": "🎯 ViralScopes Alert: High Viral Score",
    "color": 1936894,
    "fields": [
      { "name": "Video", "value": "[Video Title](https://youtube.com/watch?v=...)", "inline": false },
      { "name": "Viral Score", "value": "**87.4** (confidence: 0.91)", "inline": true },
      { "name": "Channel", "value": "Finance With Freya", "inline": true },
      { "name": "Views", "value": "284,000", "inline": true }
    ],
    "footer": { "text": "ViralScopes.io" },
    "timestamp": "2026-07-20T14:22:00Z"
  }],
  "components": [{
    "type": 1,
    "components": [{
      "type": 2,
      "label": "View Full Analysis",
      "style": 5,
      "url": "https://app.viralscopes.io/videos/01HXYZ..."
    }]
  }]
}
```

---

## 17. Dead-Letter Queue & Error Handling

### Error Handling Strategy

Every workflow follows this error handling pattern:

```
Step execution
    │
    ├── Success → continue to next step
    │
    └── Error
          │
          ├── Retry attempt 1 (immediate)
          ├── Retry attempt 2 (30 seconds delay)
          ├── Retry attempt 3 (5 minutes delay)
          │
          └── After 3 failures:
                │
                ├── INSERT into dead_letter_jobs
                │   - workflow_name
                │   - original_payload (full job input)
                │   - error_message (last error)
                │   - error_stack (for debugging)
                │   - retry_attempts: 3
                │
                ├── Enqueue admin notification
                │   - Slack alert: #ops-alerts
                │   - Email: engineering@viralscopes.io
                │
                └── Log to job_logs with status: 'failed'
```

### Idempotency

**All workflows must be idempotent.** Running a workflow twice with the same input must not create duplicate records or side effects.

**Implementation patterns:**

| Operation | Idempotency mechanism |
|---|---|
| INSERT video record | UNIQUE constraint on `(platform, platform_video_id)` |
| INSERT analysis records | UNIQUE constraint on `video_id`; use UPSERT |
| INSERT recommendations | UNIQUE constraint on `(video_id, org_id)` |
| Dispatch alerts | Throttle key in Redis (1 alert per rule per hour) |
| Cache AI responses | Set if not exists (Redis SETNX); idempotent |
| Log to job_logs | Every execution gets a new log entry (not idempotent by design) |

### Dead-Letter Job Resolution

Admin actions available for dead-letter jobs:

| Action | When to use | Effect |
|---|---|---|
| **Retry** | Root cause fixed | Re-enqueues job to original queue |
| **Dismiss** | Job is no longer valid (e.g. video deleted) | Marks `resolved = true`; no retry |
| **Edit payload** | Input data was malformed | Allows editing payload before retry |

All dead-letter actions are logged to `audit_logs`.

---

## 18. Scheduler Reference

### CRON Schedules

| Workflow | CRON expression | Time (UTC) | Frequency |
|---|---|---|---|
| WF-01 Video Discovery | `0 0,6,12,18 * * *` | 00:00, 06:00, 12:00, 18:00 | Every 6 hours |
| WF-10 Trend Detection | `0 3 * * *` | 03:00 | Daily |
| WF-11 Opportunity Engine | `0 5 * * 1` | 05:00 Monday | Weekly |
| WF-13 Channel Intelligence | `0 4 * * *` | 04:00 | Daily |
| Data Retention Purge | `0 2 * * *` | 02:00 | Daily |
| Backup Verification | `0 10 1 * *` | 10:00 on 1st | Monthly |
| Partition Management | `0 1 1 * *` | 01:00 on 1st | Monthly |

### Manual Trigger Endpoint

Any workflow can be manually triggered by an Admin+ role user:

```
POST /api/v1/jobs/:workflowName/trigger
Authorization: Bearer <admin-jwt>

Body: { "payload": {} }  // workflow-specific input

Response 202: { "executionId": "n8n-exec-id", "status": "triggered" }
```

Available workflow names: `video-discovery`, `trend-detection`, `opportunity-engine`, `channel-intelligence`

---

## 19. Workflow Development Rules

### Core Rules

1. **Every workflow must be idempotent.** Running it twice with the same input must produce the same result without side effects.

2. **All AI calls go through the cache.** Check Redis before calling any AI API. Cache the result after receiving it.

3. **All AI outputs are Zod-validated before storage.** Never store raw unvalidated LLM output.

4. **All prompts come from `prompt_library`.** No hardcoded prompt text in workflow logic.

5. **Every execution is logged to `job_logs`.** Include: workflow name, status, duration, input summary, output summary.

6. **Every workflow has a dead-letter output.** After max retries, write to `dead_letter_jobs` and send admin notification.

7. **Workflow JSON files are version-controlled.** Export and commit to `/infra/n8n-workflows/` after every change. Never leave changes only in the n8n UI.

8. **Workflows use workflow IDs in logs, not names.** Names change; IDs do not.

### Adding a New Workflow

1. Design the workflow diagram (add a section to this document first)
2. Build and test the workflow in the staging n8n environment
3. Export the workflow JSON: n8n → Workflows → Export
4. Save to `/infra/n8n-workflows/<workflow-name>.json`
5. Commit with message: `feat(n8n): add <workflow-name> workflow`
6. Import to production n8n environment
7. Update the Scheduler Reference if CRON-triggered
8. Update the Workflow Index table in this document

### Prompt Versioning

When a prompt in `prompt_library` is updated:

1. Insert a new row with incremented `version` and `is_active = false`
2. Test the new prompt using the Admin Panel prompt test harness
3. Run the AI prompt regression tests against all 10 fixture videos
4. If tests pass: set new version `is_active = true`, old version `is_active = false`
5. The next workflow execution automatically picks up the new active prompt
6. No code deployment or workflow restart required

---

*This document is updated whenever a workflow is added, modified, or removed. All changes require a pull request with at least one approving review.*

---

**Related Documents:**
- [ROADMAP.md](./ROADMAP.md) — Phase 6 covers n8n workflow development requirements
- [Database_Schema.md](./Database_Schema.md) — Tables that workflows read from and write to
- [Security_Architecture.md](./Security_Architecture.md) — Credential management for workflow external service calls
- [Monitoring_&_Operations.md](./Monitoring_and_Operations.md) — Queue metrics, dead-letter monitoring, Grafana dashboards
- [Deployment_Guide.md](./Deployment_Guide.md) — How to deploy and import/export n8n workflows
