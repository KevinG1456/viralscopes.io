-- Migration: 0009_seed_prompt_library
--
-- Phase 7 (AI Prompt Library & Versioning). Seeds the 6 real AI prompts
-- this platform actually calls a model for, as version 1, active. Content
-- is transcribed from AI_Strategy.md section 2 and n8n_Workflow_Diagrams.md
-- (WF-04 through WF-07, WF-10, WF-12) -- not invented here.
--
-- ROADMAP.md's Phase 7 checklist names 8 items, but two of them
-- ("transcript analysis", "opportunity detection") are not AI prompts at
-- all per n8n_Workflow_Diagrams.md's own, more detailed design: WF-03
-- Transcript Pipeline only fetches YouTube captions (no AI call; transcript
-- summarisation is part of the video_analysis prompt below), and WF-11
-- Opportunity Engine is explicitly "No AI calls -- purely computational
-- ranking". Seeding fake prompts for pipelines that don't call AI would be
-- actively wrong, not a faithful implementation of a documented design --
-- so only the 6 prompts that correspond to a real model call are seeded.
-- This matches AI_Strategy.md section 5.1's own "Active prompts (MVP)"
-- table exactly. See DEC-020 in PROJECT_STATUS.md.

-- Up

INSERT INTO prompt_library (name, version, model, system_prompt, user_template, output_schema, is_active, notes) VALUES

('video_analysis', 1, 'claude-sonnet-4-6',
$prompt$You are a content strategy analyst for ViralScopes, a platform that helps creators understand why content performs well.

Analyse the provided video's transcript, title, and description to extract the structural patterns behind its performance. You are identifying PATTERNS, not judging quality or reproducing content.

Classify the opening hook technique as exactly one of: question, shock, statistic, fear, story, mystery, promise, curiosity, humour.

Extract: the narrative/story structure, the overall narrative arc, a concise content summary, the target audience and their level (beginner, intermediate, advanced, or all), the primary emotion evoked, retention tactics used, key themes, the specific drivers of virality, and any content weaknesses. Also classify the call-to-action type and its exact text if present.

Respond only with JSON matching the provided output schema. Every classification must be grounded in the transcript and title actually provided -- never invent statistics or claims not present in the input.$prompt$,
$prompt$Title: {{title}}
Description: {{description}}
Duration (seconds): {{duration_secs}}
View count: {{view_count}}

Transcript:
{{transcript}}

Respond with JSON matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "object",
  "required": ["hook_type", "hook_confidence", "hook_summary", "story_structure", "narrative_arc", "content_summary", "target_audience", "audience_level", "primary_emotion", "retention_tactics", "key_themes", "virality_drivers", "content_weaknesses"],
  "properties": {
    "hook_type": { "enum": ["question", "shock", "statistic", "fear", "story", "mystery", "promise", "curiosity", "humour"] },
    "hook_confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "hook_summary": { "type": "string" },
    "story_structure": { "type": "string" },
    "narrative_arc": { "type": "string" },
    "content_summary": { "type": "string" },
    "target_audience": { "type": "string" },
    "audience_level": { "enum": ["beginner", "intermediate", "advanced", "all"] },
    "primary_emotion": { "type": "string" },
    "retention_tactics": { "type": "array", "items": { "type": "string" } },
    "key_themes": { "type": "array", "items": { "type": "string" } },
    "virality_drivers": { "type": "array", "items": { "type": "string" } },
    "content_weaknesses": { "type": "array", "items": { "type": "string" } },
    "cta_type": { "type": "string", "nullable": true },
    "cta_text": { "type": "string", "nullable": true }
  }
}'::jsonb,
true,
'Seeded in migration 0009. Source: n8n_Workflow_Diagrams.md WF-05 (AI Analysis Pipeline). Populates video_analyses.'),

('thumbnail_analysis', 1, 'gpt-4o',
$prompt$You are a visual analyst for ViralScopes, predicting thumbnail click-through potential from structural and compositional patterns.

Analyse the provided thumbnail image. Identify the dominant emotion conveyed, the composition style, whether text overlay is present, and predict click-through rate potential on a 0-100 scale with a confidence score.

Respond only with JSON matching the provided output schema. Base every field strictly on what is visually present in the image.$prompt$,
$prompt$Thumbnail image (base64): {{thumbnail_base64}}

Respond with JSON matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "object",
  "required": ["emotion", "faces_count", "has_text", "text_density", "dominant_colors", "contrast_score", "composition_type", "objects_detected", "ctr_prediction", "ctr_confidence"],
  "properties": {
    "emotion": { "enum": ["surprise", "joy", "trust", "fear", "sadness", "disgust", "anger", "anticipation", "neutral"] },
    "faces_count": { "type": "integer", "minimum": 0 },
    "has_text": { "type": "boolean" },
    "text_content": { "type": "string", "nullable": true },
    "text_density": { "type": "number", "minimum": 0, "maximum": 1 },
    "dominant_colors": { "type": "array", "items": { "type": "string", "pattern": "^#[0-9A-Fa-f]{6}$" }, "maxItems": 5 },
    "contrast_score": { "type": "number", "minimum": 0, "maximum": 1 },
    "composition_type": { "enum": ["rule_of_thirds", "central", "split", "frame_in_frame", "leading_lines", "other"] },
    "objects_detected": { "type": "array", "items": { "type": "string" }, "maxItems": 10 },
    "background_type": { "type": "string", "nullable": true },
    "ctr_prediction": { "type": "number", "minimum": 0, "maximum": 100 },
    "ctr_confidence": { "type": "number", "minimum": 0, "maximum": 1 }
  }
}'::jsonb,
true,
'Seeded in migration 0009. Source: n8n_Workflow_Diagrams.md WF-04 (Thumbnail Analysis), whose Zod schema summary is transcribed directly. Populates thumbnail_analyses.'),

('title_formula_detection', 1, 'gpt-4o-mini',
$prompt$You are a classification assistant for ViralScopes, identifying which structural formula a video title follows.

Classify the title into exactly one formula type from the enum provided. Extract the formula template with the variable parts replaced by placeholders (e.g. "How I [Action] in [Timeframe]"), keywords, power words, and basic statistics about the title.

Respond only with JSON matching the provided output schema.$prompt$,
$prompt$Title: {{title}}

Respond with JSON matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "object",
  "required": ["formula_type", "formula_template", "keywords", "power_words", "character_count", "word_count", "has_number", "sentiment", "title_score"],
  "properties": {
    "formula_type": { "enum": ["how_i_did_x_in_y", "why_you_should_x", "top_n_x", "the_truth_about_x", "nobody_tells_you_x", "i_tried_x_for_y_days", "x_vs_y", "how_to_x", "what_happens_when_x", "x_things_about_y", "is_x_worth_it", "i_spent_x_on_y", "question", "statement", "other"] },
    "formula_template": { "type": "string" },
    "keywords": { "type": "array", "items": { "type": "string" } },
    "power_words": { "type": "array", "items": { "type": "string" } },
    "character_count": { "type": "integer", "minimum": 0 },
    "word_count": { "type": "integer", "minimum": 0 },
    "has_number": { "type": "boolean" },
    "number_value": { "type": "integer", "nullable": true },
    "sentiment": { "enum": ["positive", "negative", "neutral", "curiosity"] },
    "title_score": { "type": "number", "minimum": 0, "maximum": 100 }
  }
}'::jsonb,
true,
'Seeded in migration 0009. Source: n8n_Workflow_Diagrams.md WF-06 (Title Formula Detection); formula_type enum transcribed verbatim from that section''s "Formula Types Enum". Populates title_analyses.'),

('hook_classification', 1, 'gpt-4o-mini',
$prompt$You are a classification assistant for ViralScopes, identifying the opening hook technique used in the first 60 seconds of a video's transcript.

Classify the hook into exactly one of: question (opens with a direct question to the viewer), shock (a surprising or counterintuitive statement), statistic (a specific number or data point), fear (triggers fear of missing out or a negative outcome), story (places the viewer into a narrative), mystery (a puzzle or unanswered question), promise (a clear commitment of what will be delivered), curiosity (something visually or verbally intriguing), humour (a joke or comedic setup).

Respond only with JSON matching the provided output schema, including a one-sentence summary of the hook and a confidence score.$prompt$,
$prompt$Opening transcript (first 60 seconds):
{{hook_text}}

Respond with JSON matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "object",
  "required": ["hook_type", "hook_confidence", "hook_summary"],
  "properties": {
    "hook_type": { "enum": ["question", "shock", "statistic", "fear", "story", "mystery", "promise", "curiosity", "humour"] },
    "hook_confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "hook_summary": { "type": "string" }
  }
}'::jsonb,
true,
'Seeded in migration 0009. Source: n8n_Workflow_Diagrams.md WF-07 (Hook Classification); hook type descriptions transcribed from that section''s table. Updates video_analyses (hook_type/hook_confidence/hook_summary set by WF-05, refined here per WF-07''s own flow).'),

('trend_clustering', 1, 'claude-sonnet-4-6',
$prompt$You are a trend analyst for ViralScopes, clustering content topics from recently analysed videos.

You will receive a batch of up to 50 topics, each with its video count and average viral score. Group related topics into clusters, label each cluster descriptively, and provide a status hint (emerging, evergreen, declining, or unknown) based on the patterns you observe -- this hint is advisory only; final classification is computed deterministically downstream from velocity and growth metrics, not from your judgment alone.

Respond only with a JSON array matching the provided output schema.$prompt$,
$prompt$Topics (topic, video_count, avg_viral_score), batch of up to 50:
{{topics_batch}}

Respond with a JSON array matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "array",
  "items": {
    "type": "object",
    "required": ["topic", "related_topics", "cluster_label", "status_hint"],
    "properties": {
      "topic": { "type": "string" },
      "related_topics": { "type": "array", "items": { "type": "string" } },
      "cluster_label": { "type": "string" },
      "status_hint": { "enum": ["emerging", "evergreen", "declining", "unknown"] }
    }
  }
}'::jsonb,
true,
'Seeded in migration 0009. Source: n8n_Workflow_Diagrams.md WF-10 (Trend Detection). AI provides a hint only -- final emerging/evergreen/declining classification uses deterministic velocity/growth-rate rules (AI_Strategy.md section 2.2) to prevent hallucinated trend calls. Populates the trends table (via downstream deterministic classification, not directly).'),

('ethical_recommendation', 1, 'claude-sonnet-4-6',
$prompt$You are a content strategy assistant helping a creator develop ORIGINAL content.

Your task is to analyse the structural patterns in this video and generate entirely original creative guidance for the creator.

CRITICAL CONSTRAINTS:
- NEVER reproduce the title, hook, script, or specific creative expression of the video being analysed.
- NEVER paraphrase or closely imitate the specific language of the analysed video.
- Your recommendations must be structurally INSPIRED but creatively ORIGINAL.
- The creator's voice and ideas must be the final product -- not a copy of the analysed creator's work.

Respond only with JSON matching the provided output schema.$prompt$,
$prompt$Analysed video's structural patterns (not to be reproduced -- for inspiration only):
Title: {{title}}
Hook type: {{hook_type}}
Story structure: {{story_structure}}
Virality drivers: {{virality_drivers}}
Title formula: {{formula_type}} ({{formula_template}})
Thumbnail: {{thumbnail_emotion}}, {{thumbnail_composition_type}}

Generate an original recommendation. Respond with JSON matching this schema:
{{output_schema}}$prompt$,
'{
  "type": "object",
  "required": ["title_concept", "hook_concept", "content_outline", "thumbnail_concept", "keywords", "cta_suggestion"],
  "properties": {
    "title_concept": { "type": "string" },
    "hook_concept": { "type": "string" },
    "content_outline": { "type": "array", "items": { "type": "object", "required": ["heading", "description"], "properties": { "heading": { "type": "string" }, "description": { "type": "string" } } } },
    "thumbnail_concept": { "type": "string" },
    "keywords": { "type": "array", "items": { "type": "string" } },
    "cta_suggestion": { "type": "string" },
    "tone_notes": { "type": "string", "nullable": true }
  }
}'::jsonb,
true,
'Seeded in migration 0009. System prompt transcribed verbatim from AI_Strategy.md section 2.5 (Layer 1 of the three-layer ethical constraint). Layer 2 (output validation: title_concept must differ from the analysed video''s title by >50% edit distance) and Layer 3 (UI labelling) are enforced outside this prompt row -- see AI_Strategy.md section 2.5. Populates recommendations.');

-- Down

DELETE FROM prompt_library WHERE name IN (
  'video_analysis', 'thumbnail_analysis', 'title_formula_detection',
  'hook_classification', 'trend_clustering', 'ethical_recommendation'
) AND version = 1;
