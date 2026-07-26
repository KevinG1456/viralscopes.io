# AI_Strategy.md
# ViralScopes.io — AI Strategy

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Cross-references:** [n8n_Workflow_Diagrams.md](./n8n_Workflow_Diagrams.md) · [Database_Schema.md](./Database_Schema.md) · [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) · [Monetization_Model.md](./Monetization_Model.md)

---

## 1. AI Vision

### Business Objectives

ViralScopes uses AI to achieve three business outcomes:

1. **Create an analytical capability no human team can replicate at this scale and cost.** Manually analysing 50,000 videos per month to extract hook types, title formulas, narrative arcs, and thumbnail CTR predictions would require a team of 50+ analysts. AI makes this possible with a team of three engineers.

2. **Transform raw data into actionable creative guidance.** A view count is data. A Viral Score with an explanation of the nine signals that produced it, paired with an original hook concept inspired by the structural patterns of the top-performing videos in a niche, is intelligence. AI creates the gap between ViralScopes and every data-only competitor.

3. **Enforce the ethical constraint at every layer.** The ethical AI framework — which prohibits reproducing or closely imitating any creator's work — is what makes ViralScopes safe for creators to use confidently. AI must be deployed in a way that actively enforces this constraint, not merely claims it.

### Customer Value

AI delivers value to ViralScopes customers in three ways:

| Customer goal | AI capability | Outcome |
|---|---|---|
| Understand why content works | Structural analysis (hook type, narrative arc, title formula) | Creators make informed structural decisions, not guesses |
| Find opportunities before competitors | Trend detection and velocity classification | Creators act on emerging topics 2–4 weeks before peak |
| Create original, better content | Ethical recommendation engine | Creators get specific, original ideas grounded in real patterns |

### Guiding Principles

| # | Principle | Implementation |
|---|---|---|
| AI-1 | **Analysis, not imitation** | AI is used to identify patterns in content structure, never to reproduce or closely imitate any creator's work. This principle is enforced at the system prompt, output validation, and UI labelling layers. |
| AI-2 | **Confidence is explicit** | Every AI-generated output includes a confidence signal. Users are never shown analysis without knowing how reliable it is. |
| AI-3 | **Prompts are versioned assets** | All prompts are stored in the `prompt_library` database table with version history. No prompt exists only in code or in the AI provider's UI. |
| AI-4 | **Cost is a first-class constraint** | AI is expensive at scale. Caching, tiered analysis, and model selection are engineered constraints, not afterthoughts. |
| AI-5 | **Human oversight is built in** | All AI outputs can be reviewed, corrected, and reported. The prompt library admin panel allows prompt tuning without code deployment. Dead-letter queues capture AI validation failures for human review. |
| AI-6 | **Fallback is always defined** | Every AI call has a defined fallback: a cached result, a lower-tier analysis, or a graceful degradation. The platform never shows an error where a partial result is possible. |

---

## 2. AI Features

### 2.1 Content Analysis (Core — MVP)

**What it does:** Analyses the full content of a YouTube video — transcript, title, thumbnail, narrative structure — and extracts the structural patterns that contribute to its performance.

**AI tasks involved:**
- Transcript summarisation and section extraction
- Hook classification (9 hook types)
- Title formula detection (14 formula types)
- Thumbnail vision analysis (emotion, composition, CTR prediction)
- Full narrative structure analysis (story arc, target audience, retention tactics)

**Model routing:**

| Task | Model | Reason |
|---|---|---|
| Full content analysis | Claude Sonnet 4.6 | Best-in-class reasoning for nuanced narrative analysis |
| Title formula detection | GPT-4o mini | Simple classification; cost-efficient |
| Hook classification | GPT-4o mini | Simple classification; cost-efficient |
| Thumbnail vision | GPT-4o | Strong vision capabilities; structured output |

**See:** [n8n_Workflow_Diagrams.md](./n8n_Workflow_Diagrams.md) for full pipeline detail.

---

### 2.2 Trend Detection (Core — MVP)

**What it does:** Clusters video topics daily into trend groups and classifies each as Emerging, Evergreen, or Declining. Computes velocity, competition, and opportunity scores.

**AI tasks involved:**
- Topic clustering (batches of 50 topics per Claude call — cost-efficient)
- Trend status classification hint (AI provides a hint; deterministic rules confirm)

**Model:** Claude Sonnet 4.6

**Key design decisions:**
- Batch processing (50 topics per call) reduces AI cost by 98% vs one call per topic
- Final classification uses deterministic rules based on velocity and growth metrics, not pure AI judgment — prevents AI hallucination on classification
- Topic clusters are persisted to the `trends` table as snapshots, enabling historical trend analysis

---

### 2.3 Predictive Insights — Trend Prediction (v1.5)

**What it does:** Predicts which Emerging topics will continue to grow vs. peak and decline in the next 7–14 days. Assigns a growth probability score (0–1).

**AI approach:** Time-series analysis of topic velocity data combined with LLM reasoning about topic lifecycle patterns.

**Model:** Claude Sonnet 4.6

**`[ASSUMPTION]`** Trend prediction accuracy will be evaluated over 3 months of live data before being surfaced to users. The feature will not be released until it achieves > 70% accuracy on a held-out validation set.

---

### 2.4 Automated Reporting (v1.5)

**What it does:** Generates a structured weekly PDF report for an organisation, summarising their niche's top performing content, emerging trends, and original content opportunities.

**AI tasks involved:**
- Report narrative generation: Claude Sonnet 4.6 drafts the interpretive sections
- Data is pre-computed from `trends`, `videos`, and `video_analyses` — AI writes the narrative, not the data

**Key design decision:** Data comes from the database (not AI-computed); AI is only used for the interpretive narrative layer. This prevents hallucinated statistics.

---

### 2.5 Ethical Recommendation Engine (Core — MVP)

**What it does:** Generates original content ideas (title concept, hook concept, content outline, thumbnail concept, keyword suggestions) inspired by the structural patterns of a high-performing video.

**Model:** Claude Sonnet 4.6

**The ethical constraint (implemented at three layers):**

**Layer 1 — System prompt:**
```
You are a content strategy assistant helping a creator develop ORIGINAL content.

Your task is to analyse the structural patterns in this video and generate entirely 
original creative guidance for the creator. 

CRITICAL CONSTRAINTS:
- NEVER reproduce the title, hook, script, or specific creative expression of the 
  video being analysed.
- NEVER paraphrase or closely imitate the specific language of the analysed video.
- Your recommendations must be structurally INSPIRED but creatively ORIGINAL.
- The creator's voice and ideas must be the final product — not a copy of the 
  analysed creator's work.
```

**Layer 2 — Output validation:**
Zod schema validates that `title_concept` differs from `videos.title` by > 50% edit distance (Levenshtein). If similarity is too high, the job is dead-lettered for review.

**Layer 3 — UI labelling:**
All recommendations displayed in the dashboard include the label: *"AI-generated original recommendation — inspired by structural patterns, not copied from any creator's work."*

---

### 2.6 AI Chat Interface (v1.5)

**What it does:** A floating chat interface on all dashboard pages. Users ask natural language questions about their niche, competitors, or content strategy. Responses are streamed via SSE.

**Examples:**
- "Find fast-growing finance channels with fewer than 100,000 subscribers"
- "Why did this video outperform the others on this channel?"
- "Suggest 5 original content ideas for my productivity niche this week"
- "What hook types are working best in fitness content this month?"

**Model:** Claude Sonnet 4.6

**Architecture:**
- User message → API endpoint → Claude with system context (user's watchlists, recent trends)
- Claude uses tool-calling to query the ViralScopes database via a defined function schema
- Responses stream via SSE; the UI renders as tokens arrive
- Chat history is stored per-user for session continuity

**Context injection per request:**
```json
{
  "user_watchlists": [...],
  "user_org_plan": "professional",
  "current_page": "trends",
  "recent_trends": [...top 10 trends...],
  "recent_viral_videos": [...top 5 videos from user's watchlists...]
}
```

---

### 2.7 Natural Language Search (v2.0)

**What it does:** Extends the existing keyword search to support semantic/natural language queries. "Find slow-burn educational finance videos with Statistic hooks" should return relevant results even if those exact words don't appear in video titles.

**Implementation:** Embed video analysis text (titles, summaries, key themes, hook descriptions) into a vector store (pgvector in PostgreSQL or a dedicated Qdrant instance). Query embeddings generated at search time by OpenAI `text-embedding-3-small`.

**`[ASSUMPTION]`** Vector search requires embedding generation at index time (adds ~£0.001/video in embedding cost) and at query time (trivial). This is deferred to v2.0 when the user base is large enough to justify the infrastructure.

---

## 3. Model Strategy

### 3.1 Provider Selection

ViralScopes uses a **dual-provider strategy**: Anthropic Claude for reasoning-heavy tasks and OpenAI for vision and structured extraction. This avoids single-provider lock-in and routes each task to the model best suited to it.

| Provider | Primary use | Models used |
|---|---|---|
| **Anthropic** | Reasoning, analysis, recommendations, trend clustering, AI Chat | `claude-sonnet-4-6` |
| **OpenAI** | Vision (thumbnails), structured classification (titles, hooks) | `gpt-4o`, `gpt-4o-mini` |

### 3.2 Model Routing Logic

```typescript
// apps/api/src/services/ai/model-router.ts

type Task =
  | 'video_analysis'
  | 'recommendation'
  | 'trend_clustering'
  | 'thumbnail_analysis'
  | 'title_formula'
  | 'hook_classification'
  | 'chat';

const MODEL_ROUTING: Record<Task, { provider: 'anthropic' | 'openai'; model: string }> = {
  video_analysis:     { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  recommendation:     { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  trend_clustering:   { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  chat:               { provider: 'anthropic', model: 'claude-sonnet-4-6' },
  thumbnail_analysis: { provider: 'openai',    model: 'gpt-4o'          },
  title_formula:      { provider: 'openai',    model: 'gpt-4o-mini'     },
  hook_classification:{ provider: 'openai',    model: 'gpt-4o-mini'     },
};
```

### 3.3 Cost Optimisation

**Strategy 1 — Tiered analysis (highest impact):**
- Tier 0 (55% of videos): metadata + viral score only. No AI. Cost: £0.
- Tier 1 (30%): title + thumbnail analysis only. Cost: ~£0.012/video.
- Tier 2 (15%): full pipeline. Cost: ~£0.045/video.
- Effective blended average: ~£0.013/video.

**Strategy 2 — Aggressive caching:**
- Redis cache key: `vs:ai:{task}:{prompt_version}:{sha256(input)}`
- TTL: 24 hours (sufficient for all tasks given daily video freshness)
- Target hit rate: 55%+ by Month 6
- Cache invalidation: only on prompt version change

**Strategy 3 — Model downsizing for classification:**
- Simple classification tasks (title formula, hook type) use `gpt-4o-mini` instead of `gpt-4o`
- ~10× cheaper per token for equivalent classification accuracy
- Saved approximately £0.008/video vs using full `gpt-4o` for all tasks

**Strategy 4 — Batch trend clustering:**
- 50 topics per Claude call instead of 1 topic per call
- 50× cost reduction on trend clustering
- Achievable because Claude's context window can handle 50 topic descriptions easily

**Strategy 5 — Daily AI spend alert:**
- Prometheus alert fires when estimated daily spend exceeds £30
- Prevents runaway costs from workflow bugs or unexpected traffic spikes

### 3.4 Prompt Management

All prompts are stored in the `prompt_library` database table. No prompt text exists in code.

**Prompt lifecycle:**

```
1. Write new prompt version → INSERT into prompt_library
   (is_active = false, version = n+1)

2. Test using Admin Panel prompt test harness
   - Input: any video ID from the DB
   - See: full AI output before deploying

3. Run regression tests
   - 10 fixed fixture videos
   - Compare new output schema vs expected schema
   - Check for hallucination patterns (content that shouldn't appear)

4. Promote to active
   - UPDATE prompt_library SET is_active = false WHERE name = 'X'
   - UPDATE prompt_library SET is_active = true WHERE name = 'X' AND version = n+1

5. n8n workflows automatically use new prompt on next execution
   - No code deployment needed
   - No workflow restart needed
```

**Prompt fields:**

| Field | Type | Purpose |
|---|---|---|
| `name` | TEXT | Unique identifier (e.g. `'video_analysis'`) |
| `version` | INTEGER | Sequential version number |
| `model` | TEXT | Target model string |
| `system_prompt` | TEXT | Full system prompt text |
| `user_template` | TEXT | Handlebars-style template with `{{variable}}` slots |
| `output_schema` | JSONB | Zod schema in JSON format; used for validation |
| `is_active` | BOOLEAN | Only one version per name can be active at once |
| `notes` | TEXT | Change rationale; regression test results |

### 3.5 Model Evaluation

Before any model version change is deployed to production:

**Automated regression suite:**
- 10 fixed fixture videos with known expected outputs
- Each fixture has: expected `hook_type`, expected `formula_type`, expected `viral_score` range, expected recommendation format
- Suite runs in CI against every prompt version before promotion

**Manual evaluation criteria:**
- Output matches Zod schema 100% of the time
- `hook_type` classification accuracy > 90% on fixture set
- `formula_type` accuracy > 88% on fixture set
- Recommendation does not reproduce analysed video title (edit distance check)
- No hallucinated video statistics (numbers must come from provided data, not model memory)

---

## 4. Responsible AI

### 4.1 Privacy

- No user PII (email, name, IP) is ever included in AI API calls
- Transcripts processed by AI belong to the video creator (not ViralScopes users) — they are public YouTube content
- AI outputs are stored in the `video_analyses` and `recommendations` tables, which are covered by the standard data retention policy
- AI providers are covered by Data Processing Agreements (DPAs):
  - Anthropic DPA: [anthropic.com/legal/dpa](https://www.anthropic.com/legal/dpa)
  - OpenAI DPA: [openai.com/security](https://openai.com/security)
- No model training on ViralScopes customer data (`X-Anthropic-Dont-Train: true` header on all Anthropic API calls)

### 4.2 Security

- AI API keys are stored only in Coolify environment variables, never in code
- All AI API calls are made server-side (n8n or Fastify API); no AI calls from the browser
- AI response content is treated as untrusted input — it is validated against a strict Zod schema before storage
- Prompt injection is mitigated by:
  - Strict input sanitisation before template injection
  - System prompt architecture that separates instruction layer from data layer
  - Output schema validation that rejects any output not conforming to the expected structure

### 4.3 Bias Mitigation

Known AI bias risks and mitigations:

| Risk | Mitigation |
|---|---|
| English-language bias in content analysis | Language field stored; non-English content flagged; future: language-specific models |
| Hook/formula classification biased toward Western content norms | Evaluation fixture set includes diverse content origins; patterns tested across niches |
| Trend clustering favours high-volume topics | Velocity weighting explicitly counterbalances raw volume |
| Recommendation engine reproduces popular creator styles | Ethical constraint in system prompt + edit distance check on output |
| Viral Score algorithm favours certain content categories | Score components are individually audited; category-specific calibration is planned |

### 4.4 Transparency

- Every AI-generated output in the UI is labelled as AI-generated
- Viral Score components are shown to the user — no black-box score
- Confidence levels are always displayed alongside analysis outputs
- The prompt library is versioned and auditable via the Admin Panel
- Recommendations are labelled as "inspired by structural patterns, not copied"

### 4.5 Human Oversight

- Dead-letter queue captures all AI validation failures for human review
- The Super Admin Panel includes a prompt test harness for evaluating AI output before deployment
- All prompt changes require a PR review and regression test pass
- AI cost alerts prevent runaway AI spend without human awareness
- The Admin Panel shows real-time AI call counts and estimated costs

---

## 5. AI Operations

### 5.1 Prompt Library

Stored in `prompt_library` table. Managed via the Super Admin Panel (`/admin/prompts`).

Active prompts (MVP):

| Name | Current version | Model | Task |
|---|---|---|---|
| `video_analysis` | v3 | claude-sonnet-4-6 | Full content analysis |
| `ethical_recommendation` | v2 | claude-sonnet-4-6 | Original recommendations |
| `trend_clustering` | v2 | claude-sonnet-4-6 | Topic clustering |
| `thumbnail_analysis` | v2 | gpt-4o | Vision analysis |
| `title_formula_detection` | v1 | gpt-4o-mini | Title classification |
| `hook_classification` | v1 | gpt-4o-mini | Hook type classification |

### 5.2 Model Monitoring

Prometheus metrics tracked for all AI operations:

| Metric | Type | Description |
|---|---|---|
| `ai_api_calls_total` | Counter | Total calls by provider, model, task |
| `ai_api_latency_ms` | Histogram | Call duration by provider |
| `ai_cache_hits_total` | Counter | Cache hits by task |
| `ai_cache_misses_total` | Counter | Cache misses by task |
| `ai_validation_failures_total` | Counter | Zod validation failures by task |
| `ai_cost_estimate_gbp_today` | Gauge | Running daily cost estimate |

**Grafana dashboard:** "AI Usage & Cost" — shows all above metrics plus cost estimate vs daily budget.

### 5.3 Fallback Strategies

| Failure scenario | Fallback |
|---|---|
| Primary model provider API down | Switch to secondary provider (Claude → GPT-4o for analysis tasks) |
| AI response fails Zod validation (< 3 times) | Retry with same prompt |
| AI response fails Zod validation (≥ 3 times) | Dead-letter job; use cached result if available; show partial analysis to user |
| Cache miss + API timeout | Return partial result (viral score from metadata only) with `analysis_status: 'partial'` |
| Daily AI spend limit hit | Pause analysis queue; resume at 00:00 UTC; notify admin |
| Claude API quota exhausted | Route to OpenAI for all tasks temporarily |

---

## 6. Future AI Roadmap

### v1.5 (Month 8–9)

- **AI Chat Interface** — Natural language Q&A about niche, competitors, and content strategy
- **Trend Prediction Engine** — Growth probability scores for emerging topics
- **Scheduled AI Reports** — Weekly AI-generated narrative summaries

### v2.0 (Month 18)

- **Semantic Vector Search** — Natural language search across all video and trend data using pgvector
- **Multi-Platform AI** — Extend all AI pipelines to handle TikTok and Instagram content (different narrative structures, format constraints)
- **AI Short-Form Analysis** — Adapted hook classification and content analysis for sub-60-second content
- **AI Chat with Tool-Calling** — Chat interface can execute real-time database queries to answer specific questions ("What was the average viral score in my niche last month?")

### v3.0 (Month 24+)

- **Custom Per-Niche AI Models** — Fine-tuned viral scoring models trained on niche-specific datasets (fitness, finance, tech, gaming). Enterprise feature.
- **Content Calendar AI** — AI that proposes a 4-week content calendar based on the creator's historical performance, upcoming trends, and audience engagement patterns
- **Thumbnail Generation Guidance** — AI-generated thumbnail briefs (detailed composition instructions for a designer or AI image tool) grounded in CTR prediction data

### Long-Term AI Vision (Year 4+)

> *`[ASSUMPTION]` These capabilities require 3+ years of proprietary performance data to build reliably. They are directional, not committed.*

- **Predictive Content Performance** — Before a video is published, predict its likely Viral Score and engagement range based on the creator's historical data and current trend conditions
- **Autonomous Research Agent** — An AI agent that continuously monitors a creator's niche and delivers proactive intelligence without requiring the creator to open the dashboard
- **Creator DNA Analysis** — Analyse a creator's body of work to identify the structural patterns that most reliably drive their personal best performance — distinct from general viral patterns
- **Multi-Modal Content Intelligence** — Extend analysis beyond YouTube to include podcast transcripts, newsletter content, and social media posts as inputs to a unified creator intelligence model

---

*This document is reviewed at each major product version launch and updated when AI providers, models, or strategies change significantly.*

---

**Related Documents:**
- [n8n_Workflow_Diagrams.md](./n8n_Workflow_Diagrams.md) — Technical workflow implementation for all AI tasks
- [Database_Schema.md](./Database_Schema.md) — `prompt_library`, `video_analyses`, `recommendations` table schemas
- [Infrastructure_Budget_Plan.md](./Infrastructure_Budget_Plan.md) — AI cost modelling and monthly spend projections
- [Monetization_Model.md](./Monetization_Model.md) — AI credit system and premium AI model monetisation
- [Security_Architecture.md](./Security_Architecture.md) — AI API key management and prompt injection mitigations
