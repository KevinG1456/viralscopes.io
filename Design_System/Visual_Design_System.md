# Visual_Design_System.md
# ViralScopes.io — Visual Design System & Brand Guidelines

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Companion document:** [UI_Design_System.md](./UI_Design_System.md) covers component-level implementation. This document covers brand identity, visual language, and design philosophy.
> **Cross-references:** [UI_Design_System.md](./UI_Design_System.md) · [README.md](./README.md) · [What_ViralScopes_Does.md](./What_ViralScopes_Does.md)

---

## Table of Contents

1. [Brand Vision](#1-brand-vision)
2. [Brand Personality](#2-brand-personality)
3. [Design Philosophy](#3-design-philosophy)
4. [Design Principles](#4-design-principles)
5. [Color Psychology](#5-color-psychology)
6. [Brand Color Palette](#6-brand-color-palette)
7. [Light & Dark Themes](#7-light--dark-themes)
8. [Typography System](#8-typography-system)
9. [Iconography Guidelines](#9-iconography-guidelines)
10. [Illustration Style](#10-illustration-style)
11. [Photography Guidelines](#11-photography-guidelines)
12. [Logo Usage](#12-logo-usage)
13. [Logo Spacing](#13-logo-spacing)
14. [Logo Variations](#14-logo-variations)
15. [Motion Principles](#15-motion-principles)
16. [Animation Guidelines](#16-animation-guidelines)
17. [Accessibility Considerations](#17-accessibility-considerations)
18. [Visual Consistency Rules](#18-visual-consistency-rules)
19. [Dashboard Visual Language](#19-dashboard-visual-language)
20. [Marketing Visual Language](#20-marketing-visual-language)
21. [Future Branding Evolution](#21-future-branding-evolution)

---

## 1. Brand Vision

### The Brand in One Sentence

> **ViralScopes is the intelligence layer between a creator and their next breakthrough.**

### What the Brand Stands For

ViralScopes occupies a distinctive space in the creator economy: it is not a creative tool, not a management platform, and not a social media dashboard. It is an **intelligence instrument** — a precision device that reveals the underlying structure of what works, so creators can build on that structure with their own original voice.

The brand visual language must communicate three things simultaneously:

1. **Analytical precision** — this is a serious tool that processes real data and produces rigorous outputs
2. **Creative empowerment** — the output of all that analysis is original creative guidance, not a template to copy
3. **Ethical clarity** — the platform explicitly refuses to help creators imitate others; this is a feature, not a limitation

### What the Brand Must Never Feel Like

- A generic SaaS dashboard (interchangeable with any analytics tool)
- A creator "hack" tool that promises shortcuts to viral content
- Cold and purely algorithmic (data without humanity)
- Overwhelming or inaccessible (complexity hidden behind clarity)

---

## 2. Brand Personality

The ViralScopes brand personality is defined by five traits, each with explicit design implications:

### 2.1 Perceptive

The brand sees things others miss. It detects patterns invisible to the naked eye. This personality trait is expressed through:
- Data visualisations that reveal non-obvious relationships (hook types by viral score, posting time vs engagement)
- UI copy that tells the user *why* something scored the way it did, not just the number
- Confident precision in scores and classifications (not vague ranges)

### 2.2 Direct

No hedging. No marketing speak. No vague promises. Direct means:
- Scores are numbers, not qualitative bands ("87.4", not "Very High")
- Recommendations are specific ("Open with the bank balance on screen — no voiceover")
- Error messages tell the user exactly what happened and what to do

### 2.3 Trustworthy

The brand earns trust through consistency, accuracy, and transparency:
- Confidence intervals shown alongside scores (not hidden)
- "This is an AI-generated recommendation" labelled explicitly
- The ethical constraint is a visible brand promise, not fine print

### 2.4 Focused

The brand removes noise so creators can focus. Focus means:
- Dark, calm interface — no bright distracting colours beyond the accent
- No notifications that don't require action
- Generous whitespace between data points
- One primary action per page

### 2.5 Enabling

The brand gives creators capability without taking their creative ownership:
- All recommendations are framed as "inspired by" not "copy this"
- Vocabulary is creator-native ("hook", "script", "thumbnail", "niche") not marketing jargon
- The product celebrates creator originality in its own language

---

## 3. Design Philosophy

### Intelligence Made Visible

The core design challenge of ViralScopes is making invisible analytical processes feel tangible, comprehensible, and actionable. A neural network has computed a Viral Score — but the creator needs to understand and trust it, not just see a number.

The design achieves this through **layered disclosure**:

```
Surface layer:    Viral Score — 87.4 ●●●●●●●●○○
Explanation:      [Why this score? ▼]
Detail:           Hook: Statistic (confidence 0.94)
                  Title formula: "How I X in Y"  
                  Thumbnail CTR prediction: 78.2
                  Topic trend: Emerging (+38% velocity)
                  Engagement velocity: 40,571 views/day
```

Each layer is accessible but not forced on the user. The score alone is useful for quick scanning. The full breakdown is there when decisions need justification.

### Calm Precision

The visual aesthetic is deliberately restrained. Calm precision means:
- The data is the hero — the interface serves it, not the other way around
- Colour is used to carry meaning, not decoration
- Grid alignment is tight and consistent — every element is anchored to the grid
- Nothing flashes, bounces, or demands attention

### Dark Mode as Default

The default theme is dark for three reasons:
1. Creators and analysts work in low-light environments for extended sessions
2. Data visualisations have higher visual contrast on dark backgrounds
3. The dark aesthetic communicates sophistication and technical seriousness

Light mode is available and fully supported — it is not an afterthought.

---

## 4. Design Principles

| Principle | What it means in practice |
|---|---|
| **Hierarchy before decoration** | Visual weight must reflect information importance. Large type = important. Small type = supplementary. Never use size or colour purely for aesthetics. |
| **Colour carries meaning** | Every use of colour communicates something. Green means success or growth. Red means error or decline. Blue means primary action or information. Amber means warning. Don't use these colours casually. |
| **Alignment is trust** | Misaligned elements erode confidence in the data. Every element is aligned to an invisible 8px grid. |
| **Consistency is intelligence** | A consistent interface requires less cognitive effort, letting the user focus on the data rather than the interface. If a pattern is used once, it is used everywhere. |
| **Whitespace is content** | Empty space is not wasted space. It creates breathing room, separates concepts, and guides the eye. Resist the temptation to fill space. |
| **Motion communicates state** | Animations are not decoration — they communicate transitions between states (loading → loaded, collapsed → expanded). Every animation has a semantic purpose. |

---

## 5. Color Psychology

The ViralScopes palette is built on deliberate psychological associations:

### Electric Blue (Primary)
**Hex: #1D8CF8** | **HSL: 210° 94% 55%**

Psychology: Intelligence, technology, trust, precision, data.

This is the colour of active interfaces — the cursor, the selected state, the call-to-action button. It is energetic but not aggressive. In the context of a data intelligence tool, blue communicates that the system is thinking, processing, and reliable.

*Why not purple?* Purple would lean into creativity and mysticism — associations that conflict with the analytical precision ViralScopes represents. Blue keeps the brand credibly technical.

### Deep Space Background
**Hex: #070B14** | **HSL: 224° 71% 6%**

Psychology: Focus, depth, seriousness, premium.

The deep dark background creates a "studio monitor" effect — like looking at data on a professional display rather than a bright consumer screen. It reduces eye strain during long sessions and makes the data visualisations glow with clarity.

### Violet Accent
**Hex: #7C5CFC** | **HSL: 252° 95% 68%**

Psychology: Creativity, innovation, insight.

Used sparingly for secondary highlights and gradient accents. The violet creates visual depth and distinguishes ViralScopes from purely blue-palette tech tools. It represents the creative output side of the platform (recommendations, trends) as opposed to the analytical side (scores, metrics).

### Semantic Colours

| Colour | Primary association | ViralScopes context |
|---|---|---|
| Green `#10B981` | Growth, success, positive | Emerging trends, high Viral Score, successful analysis |
| Amber `#F59E0B` | Caution, attention | Quota warnings, declining trends, medium Viral Score |
| Red `#EF4444` | Error, decline, danger | Errors, declining trends, low Viral Score, destructive actions |
| Cyan `#06B6D4` | Information, data, cool | Info alerts, secondary data series in charts |

---

## 6. Brand Color Palette

### Primary Palette

```
Electric Blue          Deep Space             Violet Accent
#1D8CF8                #070B14                #7C5CFC
HSL 210° 94% 55%      HSL 224° 71% 6%        HSL 252° 95% 68%
████████████████       ████████████████       ████████████████
```

### Extended Blue Scale

```
Blue 50:   #EFF6FF   ████  — Light tint (light theme backgrounds)
Blue 100:  #DBEAFE   ████  — Hover background (light theme)
Blue 400:  #60A5FA   ████  — Lighter accent
Blue 500:  #3B82F6   ████  — Standard blue
Blue 600:  #1D8CF8   ████  — Primary brand blue ← primary use
Blue 700:  #1D4ED8   ████  — Pressed state, darker emphasis
Blue 800:  #1E3A8A   ████  — Very dark (light theme borders)
Blue 900:  #1E2D5A   ████  — Dark theme surface tint
```

### Surface Scale (Dark Theme)

```
Background:        #070B14  ████  — Page background
Surface:           #0D1526  ████  — Elevated sections
Surface Elevated:  #121E35  ████  — Cards, panels
Surface Overlay:   #18263F  ████  — Hover, tooltips, overlays
Border:            #1E2D4A  ████  — Standard borders
Border Strong:     #2A3F5F  ████  — Emphasis borders
```

### Text Scale (Dark Theme)

```
Text Primary:      #F1F5F9  ████  — Headlines, primary body text
Text Secondary:    #94A3B8  ████  — Supporting text, metadata
Text Tertiary:     #64748B  ████  — Placeholder, disabled context
Text Disabled:     #334155  ████  — Truly disabled elements
```

### Semantic Palette

```
Success:           #10B981  ████  HSL 158° 76% 40%
Success Light:     #D1FAE5  ████  Success background (light theme)
Warning:           #F59E0B  ████  HSL 43° 91% 50%
Warning Light:     #FEF3C7  ████  Warning background (light theme)
Error:             #EF4444  ████  HSL 0° 84% 60%
Error Light:       #FEE2E2  ████  Error background (light theme)
Info:              #06B6D4  ████  HSL 190° 92% 43%
Info Light:        #CFFAFE  ████  Info background (light theme)
```

### Viral Score Gradient

The Viral Score colour gradient is one of the most visible brand elements in the product:

```
Score  0–30:  #EF4444  ████  Red        — Low
Score 31–50:  #F97316  ████  Orange     — Below average
Score 51–69:  #EAB308  ████  Yellow     — Average
Score 70–84:  #14B8A6  ████  Teal       — Above average
Score 85–100: #10B981  ████  Green      — Exceptional
```

---

## 7. Light & Dark Themes

### Dark Theme (Default)

The dark theme uses the Deep Space foundation palette. It is the primary design expression of the brand.

```
Background:         #070B14
Surface:            #0D1526
Surface Elevated:   #121E35
Surface Overlay:    #18263F
Border Default:     #1E2D4A
Border Strong:      #2A3F5F
Text Primary:       #F1F5F9
Text Secondary:     #94A3B8
Text Tertiary:      #64748B
Primary:            #1D8CF8
Accent:             #7C5CFC
```

**Designed for:**
- Extended working sessions in dim environments
- Detailed data analysis where contrast is critical
- Professional/technical context (developers, serious creators)

### Light Theme

The light theme uses crisp white surfaces with the same primary and accent colours.

```
Background:         #F8FAFC
Surface:            #FFFFFF
Surface Elevated:   #F1F5F9
Surface Overlay:    #E2E8F0
Border Default:     #CBD5E1
Border Strong:      #94A3B8
Text Primary:       #0F172A
Text Secondary:     #475569
Text Tertiary:      #94A3B8
Primary:            #1D8CF8
Accent:             #7C5CFC
```

**Designed for:**
- Bright working environments
- Users who prefer standard professional SaaS aesthetics
- Presentations and screen sharing
- Users with certain visual impairments who find dark themes harder

### Theme Switching

- Theme preference is stored in user settings (synced to their account)
- Default: dark theme on first visit
- Switch control: Settings → Appearance → Theme
- Also available via `prefers-color-scheme` media query (respects OS preference if user hasn't set a manual preference)
- Theme switch applies instantly with no page reload

### Theme Decision Guide

| Context | Recommended theme |
|---|---|
| Product UI (default) | Dark |
| Exported PDF reports | Light (white paper) |
| Email templates | Light (email clients rarely support dark mode reliably) |
| Marketing website | Light (standard for marketing/landing pages) |
| API documentation | Light |
| Print / physical materials | Light |

---

## 8. Typography System

### Type Philosophy

Typography in ViralScopes communicates two things simultaneously:
1. **Analytical precision** — numbers are displayed in tabular figures, aligned in columns, legible at small sizes
2. **Human readability** — body text is set with generous line height and comfortable measure

### Font Families

**Primary: Inter**
- Usage: All UI text — headings, body, labels, buttons
- Rationale: Inter was designed specifically for screen UI. Its x-height is high, legibility at small sizes is exceptional, and its neutral character keeps the data as the focus rather than the type itself
- Weights used: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

**Monospace: JetBrains Mono**
- Usage: API keys, code snippets, version numbers, technical identifiers
- Rationale: Designed for developers; excellent legibility for long technical strings
- Weights used: 400 (Regular), 500 (Medium)

**Numeric display: Inter with `font-variant-numeric: tabular-nums`**
- All numbers displayed in data tables, charts, and KPI cards use tabular figures
- This prevents number columns from shifting width as values change
- Applied via `.tabular-nums` utility class

### Type Scale

The scale uses a **Major Second (1.125×)** modular ratio from a 14px base (dashboard body text):

| Level | Size | Weight | Line height | Usage |
|---|---|---|---|---|
| Display | 48px | 700 | 1.1 | Marketing hero headline |
| H1 | 36px | 700 | 1.2 | Page titles (rare in product) |
| H2 | 30px | 700 | 1.25 | Section headings |
| H3 | 24px | 600 | 1.3 | Card headings, widget titles |
| H4 | 20px | 600 | 1.35 | Sub-section headings |
| H5 | 18px | 600 | 1.4 | Sidebar labels, small headings |
| Body Large | 16px | 400 | 1.6 | Onboarding, explanatory text |
| Body | 14px | 400 | 1.57 | Default dashboard body text |
| Body Small | 13px | 400 | 1.54 | Supporting text |
| Caption | 12px | 400 | 1.5 | Timestamps, metadata |
| Label | 12px | 500 | 1.0 | Form labels, table headers |
| Overline | 10px | 600 | 1.6 | Section labels (ALL CAPS) |
| Code | 14px | 400 | 1.6 | Code, API keys (JetBrains Mono) |

### Typography Rules

- **Maximum line length:** 72 characters for body text (prevents fatigue on long reads)
- **Minimum body size:** 14px in the product UI; 12px only for captions and labels
- **Numbers in data tables:** Always right-aligned, tabular figures, same decimal precision per column
- **Heading hierarchy:** Never skip heading levels (H1 → H3 without H2)
- **All-caps:** Only used for overlines (10px, 600 weight, 0.1em letter-spacing). Never used for body text or headings
- **Underlines:** Reserved exclusively for hyperlinks. Never use underline for emphasis

---

## 9. Iconography Guidelines

### Icon Library: Lucide Icons

ViralScopes uses **Lucide** (`lucide-react`) as the sole icon system. No mixing of icon families.

**Rationale:** Lucide is consistent, well-maintained, open-source, and designed for UI use with a consistent 2px stroke weight and 24px grid.

### Icon Sizes

| Context | Size | Usage |
|---|---|---|
| Inline with text | 16×16px | Body text, labels, badge indicators |
| Standard UI | 20×20px | Buttons, navigation items, input prefixes |
| Feature / Hero | 24×24px | Card headers, section identifiers |
| Empty states | 48×48px | Empty state illustrations |
| Loading / status | 20×20px | Spinner, status indicators |

### Icon Colour

Icons always use `currentColor` — they inherit the colour of their parent text element. This ensures icons automatically adapt to:
- Theme changes (dark/light)
- State changes (disabled, hover, active)
- Different text colour contexts (primary, secondary, tertiary)

Exception: Icons used in coloured badges or status indicators use the badge's foreground colour explicitly.

### Icon Rules

- [ ] **Never use text alone for actions that should have an icon** (e.g. the close button always has an X icon, not just text)
- [ ] **Never use an icon alone without an accessible label** (either a visible text label or `aria-label` / `aria-hidden` + `sr-only` text)
- [ ] **Consistency over creativity** — use the standard Lucide icon for a concept even if a slightly different icon seems more clever
- [ ] **No icon animations** — icons do not spin, bounce, or pulse (except the loading spinner, which is a purpose-built SVG)
- [ ] **No filled icons** — Lucide has both outline and filled variants; use outline only

### Icon-to-Concept Mapping

| Concept | Icon | Lucide name |
|---|---|---|
| Viral Score | Target with crosshair | `Crosshair` |
| Trending up | Arrow with upward trend | `TrendingUp` |
| Trending down | Arrow with downward trend | `TrendingDown` |
| Emerging trend | Flame | `Flame` |
| Declining trend | Timer | `TimerOff` |
| Evergreen | Leaf | `Leaf` |
| Video | Play button | `Play` |
| Channel | TV screen | `Tv` |
| Watchlist | Bookmark | `Bookmark` |
| Alert | Bell | `Bell` |
| Recommendation | Lightbulb | `Lightbulb` |
| Hook type | Fishing hook | `Anchor` |
| Export | Download | `Download` |
| API key | Key | `Key` |
| Settings | Cog | `Settings` |
| Search | Magnifier | `Search` |
| Filter | Funnel | `Filter` |
| Admin | Shield | `Shield` |
| Dead-letter | Inbox with X | `InboxX` |
| Dashboard | Grid | `LayoutDashboard` |

---

## 10. Illustration Style

### When Illustrations Are Used

Illustrations appear only in:
1. **Empty states** — when a section has no content yet
2. **Onboarding steps** — to give visual context to setup instructions
3. **Error pages** — 404, 500, maintenance
4. **Marketing website** — feature explanations, hero sections

Illustrations are **not** used:
- As decoration inside data-dense dashboard pages
- As background elements that compete with data
- In modals or tooltips

### Style Characteristics

**Geometric and flat:**
The illustration style is abstract and geometric — not literal or representational. A "video analysis" illustration is not a cartoon of a person watching a video; it is a composition of geometric shapes suggesting data flow, analysis, and output.

**Attributes:**

| Attribute | Specification |
|---|---|
| Style | Flat, geometric, minimal |
| Line weight | 2px (matching icon stroke) |
| Colour usage | Maximum 3 colours per illustration; drawn from brand palette |
| Shadow | Flat — no drop shadows, no gradients in illustrations |
| Faces / characters | Not used — abstract shapes only |
| Detail level | Low — communicate the concept with minimal elements |
| Size (in-product) | 80×80px to 160×160px |
| Size (marketing) | Up to full viewport width in hero contexts |

### Empty State Illustrations

Each major empty state has a dedicated minimal illustration:

| Empty state | Illustration concept |
|---|---|
| No videos yet | Abstract grid of empty tiles with a subtle pulse |
| No trends | Flat line chart with a question mark |
| No watchlists | Empty bookmark shape |
| No alerts | Bell with an empty inbox |
| No results (search) | Magnifier with nothing inside |
| Analysis pending | Circular progress with clock hands |

---

## 11. Photography Guidelines

### Product UI

Photography is **not used inside the product UI**. All visual content inside the dashboard is:
- Data visualisations (charts, gauges, tables)
- YouTube thumbnails (from the platform; displayed in their native format)
- User avatars (generated from initials if no uploaded photo)
- Illustrations (for empty states)

This is a deliberate choice. Photography inside a data dashboard adds visual noise and competes with the data.

### Marketing Website

Photography is used selectively on the marketing website:

**Permitted uses:**
- Creator workspace photography (desk, monitor, creator working) — conveys the real-world context of the product
- Product screenshots (showing real UI) — always displayed on a device mockup (MacBook, browser frame)
- Creator headshots (for testimonials) — provided by the creator; displayed at small size

**Photography style guidelines:**
- **Tone:** Documentary, natural light; not staged or over-produced
- **Colour grading:** Slightly cool and desaturated — complements the dark brand palette
- **Composition:** Subject to one side, breathing room; creators in their natural working environment
- **What to avoid:** Stock photography clichés (people pointing at whiteboards, fake laptop poses), overly bright and cheerful imagery, and any photography that feels like general business stock

**Image sourcing:**
- Commissioned photography for hero images and creator testimonials
- Unsplash / Pexels for supplementary imagery (filtered for authentic, natural style)
- Always credit photographers and verify commercial licences

### Social Media

- Short-form video content: screen recordings of the product with voiceover
- Static posts: product screenshots with branded frame, or data insights visualised as shareable graphics
- Creator spotlights: creator-provided photos or video, branded overlay
- No heavily filtered or AI-generated photography for official brand posts

---

## 12. Logo Usage

### Logo Architecture

The ViralScopes logo consists of two elements that can be used together or separately:

```
[Icon mark]  ViralScopes
    ●────●
    │    │       Wordmark
    ●────●
```

**Icon mark:** An abstract crosshair / scope symbol — a circle with four directional tick marks and a central dot. Communicates precision targeting, analysis, focus.

**Wordmark:** "ViralScopes" set in Inter SemiBold. The "V" and "S" are slightly larger to create a natural visual rhythm. No letterform modifications.

### Approved Logo Configurations

| Configuration | When to use |
|---|---|
| Full logo (icon + wordmark, horizontal) | Primary usage; marketing, website header, most contexts |
| Full logo (icon + wordmark, stacked) | Square contexts, social media profiles |
| Wordmark only | Space-constrained horizontal contexts |
| Icon mark only | App icon, favicon, very small contexts (< 100px wide) |

### Logo Files

| File | Format | Usage |
|---|---|---|
| `logo-full-dark.svg` | SVG | Dark backgrounds (primary) |
| `logo-full-light.svg` | SVG | Light backgrounds |
| `logo-icon-dark.svg` | SVG | Icon mark on dark background |
| `logo-icon-light.svg` | SVG | Icon mark on light background |
| `logo-full-dark.png` | PNG @2× | Where SVG is not supported |
| `favicon.ico` | ICO | Browser favicon |
| `icon-192.png` | PNG | PWA icon |
| `icon-512.png` | PNG | PWA icon / high-res |

### Approved Background Colours

| Background | Logo variant | Notes |
|---|---|---|
| Deep Space `#070B14` | `logo-full-dark.svg` | Primary use |
| Dark Surface `#0D1526` | `logo-full-dark.svg` | Secondary dark surfaces |
| White `#FFFFFF` | `logo-full-light.svg` | Marketing, documents |
| Brand Blue `#1D8CF8` | White logo (special variant) | Brand campaigns only |

### Prohibited Logo Usage

- [ ] Do not rotate or skew the logo
- [ ] Do not stretch or squash the logo (maintain aspect ratio)
- [ ] Do not recolour the logo beyond the approved variants
- [ ] Do not place the logo on a busy photographic background without sufficient contrast
- [ ] Do not add drop shadows, glows, or other effects to the logo
- [ ] Do not place the logo smaller than its minimum size
- [ ] Do not use the wordmark without the icon mark in contexts where the icon alone would be unclear

---

## 13. Logo Spacing

### Clear Space

The minimum clear space around the logo is equal to the height of the icon mark (designated as **X**):

```
        X
   ┌────────────┐
 X │            │ X
   │  LOGO HERE │
   │            │
   └────────────┘
        X
```

No other graphic elements, text, or images may appear within this clear space zone.

### Minimum Sizes

| Logo configuration | Minimum width |
|---|---|
| Full logo (horizontal) | 120px |
| Full logo (stacked) | 80px |
| Wordmark only | 100px |
| Icon mark only | 24px |

Below these sizes, the logo loses legibility. At sizes below the icon mark minimum, use only the favicon/app icon.

---

## 14. Logo Variations

### Standard Variations

**1. Full Logo — Horizontal (Primary)**
- Icon mark to the left of the wordmark
- Ideal for: website header, email headers, presentations
- Aspect ratio: approximately 4:1

**2. Full Logo — Stacked**
- Icon mark centred above the wordmark
- Ideal for: app store icons (large), social media profile images, square containers
- Aspect ratio: approximately 1:1.5

**3. Wordmark Only**
- "ViralScopes" text only, no icon
- Ideal for: narrow horizontal spaces where the icon would be too small
- Only use when the icon has already been established in the same context

**4. Icon Mark Only**
- The scope/crosshair symbol alone
- Ideal for: favicon, app icon, social media avatar, very small footprints
- Always use the full logo when space permits

### Colour Variations

**5. Standard (Light-on-dark)**
- Icon: Electric Blue `#1D8CF8` + White
- Wordmark: White `#F1F5F9`
- Use on: dark backgrounds

**6. Standard (Dark-on-light)**
- Icon: Electric Blue `#1D8CF8` + Deep Space
- Wordmark: Deep Space `#070B14`
- Use on: light/white backgrounds

**7. Monochrome White**
- All elements white
- Use on: photographic backgrounds, coloured backgrounds with sufficient contrast

**8. Monochrome Dark**
- All elements Deep Space
- Use on: light backgrounds when colour printing is not available

**9. Brand Blue (Special)**
- Icon: White
- Wordmark: White
- Background: Electric Blue `#1D8CF8`
- Reserved for: brand campaign hero usage, product announcements

---

## 15. Motion Principles

### Why Motion

Motion in ViralScopes serves exactly one purpose: **communicating state change**. It is never decorative.

Every animation answers one of these questions:
- "What just happened?" (a new video appeared in the feed — it fades in)
- "Where is this going?" (a modal is opening — it scales from the trigger)
- "Is the system working?" (analysis is running — there is a progress indicator)

### Motion Values

**Purposeful:** If removing the animation would not change the user's understanding of what happened, the animation should be removed.

**Fast and precise:** Animations are short. The interface never waits for an animation to finish before accepting new input. Target durations:
- State transitions (hover, focus, active): 100ms
- Show/hide elements (tooltips, dropdowns): 200ms
- Page-level transitions: 300ms
- Modals and drawers: 250ms

**Natural easing:** All animations use ease-out curves (fast start, slow finish) which feel natural and responsive. Ease-in-out for elements that move across the screen.

**Consistent:** The same type of state change always uses the same animation. Dropdowns always open downward with a fade + slight scale. Toasts always slide up from the bottom-right. Consistency reduces surprise.

---

## 16. Animation Guidelines

### 16.1 Timing Tokens

```
Duration Instant: 0ms      — No animation (immediate state change)
Duration Fast:    100ms    — Micro-interactions (colour change, focus ring)
Duration Normal:  200ms    — Standard transitions (show/hide, fade)
Duration Moderate: 300ms   — Page transitions, route changes
Duration Slow:    400ms    — Modals, drawers (larger moving elements)
Duration Slower:  600ms    — Complex multi-step animations (rare)
```

### 16.2 Easing Functions

```css
/* Standard ease-out — for elements appearing or changing state */
--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1.0);

/* Ease-in — for elements disappearing */
--ease-in: cubic-bezier(0.4, 0.0, 1.0, 1.0);

/* Ease-in-out — for elements moving across the screen */
--ease-in-out: cubic-bezier(0.4, 0.0, 0.2, 1.0);

/* Spring — for elements that overshoot slightly (used for toast notifications) */
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
```

### 16.3 Standard Animations

**Fade in (content loading):**
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Duration: 200ms ease-out */
```

**Slide up (toasts, bottom sheets):**
```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Duration: 300ms spring */
```

**Scale in (modals, popovers):**
```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
/* Duration: 200ms ease-out */
```

**Shimmer (skeleton loading):**
```css
@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
/* Duration: 1.5s linear infinite */
```

**Spin (loading indicator):**
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
/* Duration: 0.8s linear infinite */
```

### 16.4 Viral Score Animation

When a Viral Score is first displayed after analysis completes, the gauge needle sweeps from 0 to the final score:

```
Duration: 1,000ms
Easing: cubic-bezier(0.34, 1.56, 0.64, 1)  — slight overshoot for organic feel
Delay: 200ms after the score data arrives
```

This is one of the few animations in the product that has a deliberate "reveal" quality — it is the moment the user gets the answer they were waiting for.

### 16.5 Chart Animations

Charts animate their data in on first render:
- **Line/area charts:** Draw the line from left to right over 600ms
- **Bar charts:** Bars grow from bottom to top over 500ms, staggered by 30ms per bar
- **Gauge:** Sweeps to final value over 1,000ms (as above for Viral Score)
- **Sparklines:** Instant — no animation (too small for animation to add value)

Charts do **not** re-animate on data updates (filter changes, etc.) — only on initial load.

---

## 17. Accessibility Considerations

### Colour Contrast

All text and interactive elements meet WCAG 2.2 AA minimum contrast ratios:

| Element | Contrast ratio | WCAG level |
|---|---|---|
| Primary body text on dark bg | 12.4:1 | AAA ✅ |
| Secondary text on dark bg | 5.8:1 | AA ✅ |
| Primary button text | 4.6:1 | AA ✅ |
| Viral Score badge text | All variants checked | AA ✅ |
| Error text on dark bg | 5.1:1 | AA ✅ |
| Link text on dark bg | 4.8:1 | AA ✅ |

*High-contrast and forced-colours modes are tested in addition to standard contrast measurement.*

### Colour Independence

Colour is **never** the sole carrier of meaning. Every colour-coded element has a secondary indicator:

| Coloured element | Secondary indicator |
|---|---|
| Viral Score badge | Score number + badge label ("High", "Exceptional") |
| Trend status | Text label ("Emerging", "Declining", "Evergreen") |
| Alert severity | Icon + text label |
| Form error state | Error icon + error message text |
| Chart series | Legend with text labels |

### Animation & Motion

- All animations respect `prefers-reduced-motion: reduce`
- When reduced motion is active, all transitions are instant (0ms duration)
- No content relies solely on animation to be understandable
- The Viral Score gauge still displays its numeric value without the sweep animation

### Focus Indicators

Custom focus rings meet WCAG 2.2 Success Criterion 2.4.11 (Focus Appearance):

```css
:focus-visible {
  outline: 2px solid #1D8CF8;
  outline-offset: 2px;
  border-radius: 4px;
}
```

- Minimum area: 3px perimeter (CSS outline of 2px with 1px offset creates a 3px visible indicator)
- Contrast: Focus ring (`#1D8CF8`) against dark background (`#070B14`) = 5.6:1 ✅
- Focus ring is never suppressed — it is only hidden on mouse interaction (not keyboard)

---

## 18. Visual Consistency Rules

### The Golden Rules

1. **Every pixel is intentional.** Nothing exists in the UI without a reason. If you cannot articulate why an element is there, remove it.

2. **One hierarchy, enforced.** Large = most important. Bold = emphasis. Colour = status. These rules apply everywhere without exception.

3. **Spacing is always from the scale.** No 7px gaps. No 13px padding. Every value is a multiple of 4. If it feels wrong at a scale value, the scale is not the problem — the design decision is.

4. **New components extend the system.** When a new UI pattern is needed, check the design system first. Only build a new component when the existing system genuinely cannot accommodate the pattern. Then add it to the system.

5. **Dark and light are equally considered.** Every new design is reviewed in both themes before handoff. Dark-only designs are not acceptable.

6. **Type hierarchy is semantic, not decorative.** H1 is used because the content IS a top-level heading, not because a larger font size looks good in that space.

### Visual Anti-Patterns (Never Do)

| Anti-pattern | Why it's forbidden |
|---|---|
| Multiple competing calls-to-action on one page | Users cannot prioritise; engagement drops |
| Random colour usage (blue text that is not a link) | Destroys the semantic colour system |
| Decoration gradients on data elements | Confuses signal with noise |
| Mix of icon styles (some filled, some outline) | Creates visual inconsistency |
| Inline styles in component code | Bypasses the design token system |
| Hardcoded hex colours in components | Makes theming impossible |
| Busy backgrounds behind data tables | Reduces data legibility |
| Uppercase body text | Significantly reduces reading speed |
| Multiple font families in the product | Creates visual chaos |
| Centred body text (more than 2 lines) | Harder to read than left-aligned |

---

## 19. Dashboard Visual Language

### The Data Canvas

The dashboard is a **data canvas** — every visual element is in service of helping the user understand and act on information. The visual language of the dashboard has three registers:

**Structural (invisible):** Grid, spacing, borders — the skeleton that holds everything in place. The user should not notice these; they should just feel that everything is orderly.

**Informational (semi-visible):** Labels, axes, legends, timestamps — the context that makes data meaningful. Visible enough to read, but muted enough not to compete with the data itself.

**Data (prominent):** Numbers, scores, charts, trend lines — the actual content. These have the highest visual weight. Nothing in the structural or informational layer should ever be more prominent than the data itself.

### KPI Card Visual Language

KPI cards use a vertical hierarchy:

```
┌──────────────────────────────┐
│ ↑ VIDEOS ANALYSED       [icon]│  ← Overline label (10px, uppercase, tertiary)
│                               │
│ 4,821                         │  ← Primary value (30px, bold, primary text)
│                               │
│ ↑ +312 this week              │  ← Delta (12px, coloured by direction)
└──────────────────────────────┘
```

Delta colours:
- Positive change: Success green `#10B981` with ↑ arrow
- Negative change: Error red `#EF4444` with ↓ arrow
- Neutral / no change: Tertiary text with → arrow

### Table Visual Language

Data tables follow a strict visual grammar:

- **Header row:** Surface Overlay background + Label type (12px, 500 weight, uppercase, tertiary colour)
- **Data rows:** Alternate no-background / Surface Overlay (on hover only — no striping in default state)
- **Borders:** Horizontal borders only (no vertical cell borders)
- **Numeric columns:** Right-aligned, tabular figures
- **Text columns:** Left-aligned
- **Actions column:** Right-aligned, visible on row hover

### Chart Visual Language

Charts are restrained — they show exactly the data needed and nothing more:

- **No chartjunk** (no 3D effects, no excessive gridlines, no decorative elements)
- **Gridlines:** Horizontal only, very light (`border-color` at 30% opacity)
- **Axes:** Y-axis on the left only; X-axis hidden when dates are shown as labels
- **Tooltips:** Appear on hover with the exact data point value, formatted consistently
- **Legends:** Below the chart, not inside it, text-based (not colour swatches alone)
- **Empty areas:** Flat line at the zero baseline (not empty space)

---

## 20. Marketing Visual Language

### Marketing vs Product

The marketing visual language shares the same brand foundation but is more expressive:

| Dimension | Product UI | Marketing |
|---|---|---|
| Animation | Minimal, purposeful | More dynamic; used for engagement |
| Colour | Restrained; semantic | More gradient; more vibrancy |
| Typography | Small, dense, functional | Large headlines; display type |
| Imagery | No photography | Photography + product screenshots |
| Whitespace | Dense (data needs space) | Generous (breathing room for reading) |
| Illustration | Minimal (empty states only) | Feature illustrations, hero graphics |

### Marketing Hero Visual Language

The hero section of the marketing site uses:
- **Large display type:** 48–72px, bold, tight letter-spacing (−0.03em)
- **Gradient headline:** The primary headline uses a left-to-right gradient from `#1D8CF8` (blue) to `#7C5CFC` (violet) on key phrases
- **Product screenshot:** A browser-framed screenshot of the dashboard in dark mode, showing a high-quality viral score analysis
- **Subtle background:** Very dark (`#070B14`) with a barely-visible radial gradient emanating from behind the product screenshot

### Social Media Visual Language

**Post types and their visual specifications:**

| Post type | Size | Background | Typography | Colour use |
|---|---|---|---|---|
| Viral insight post | 1080×1080px | Deep Space `#070B14` | H2 + body | Blue accent + data |
| Trend alert | 1080×1080px | Gradient dark | Large number | Semantic (green/amber/red) |
| Feature announcement | 1080×1080px + 1920×1080px | Product screenshot | H3 overlay | White on dark |
| Creator testimonial | 1080×1080px | Creator photo + overlay | Quote + name | Semi-transparent dark overlay |
| Weekly stat | 1080×1080px | Deep Space | Large stat number | Blue gradient |

### Email Visual Language

Email templates use the **light theme** because dark mode email support is inconsistent across clients.

**Email header:** White background, logo full horizontal variant (dark-on-light), 600px max width
**Body text:** 16px Inter, `#0F172A` on white — high contrast, mobile-friendly
**CTA button:** Electric Blue `#1D8CF8`, white text, 8px border-radius, minimum 44px tall
**Footer:** Light grey background, 12px text, tertiary colour

---

## 21. Future Branding Evolution

### Phase 1 — MVP Brand (Current)

The MVP brand is deliberately minimal and functional. The logo is clean, the palette is established, and the type system is in place. The brand identity is complete enough for launch but leaves room for refinement based on market feedback.

**MVP brand maturity checklist:**
- [x] Logo (full + icon mark + wordmark)
- [x] Core palette (dark + light themes)
- [x] Typography system
- [x] Icon system (Lucide)
- [x] Motion tokens
- [ ] Professional photography library (3–5 hero images)
- [ ] Illustration library (empty states)
- [ ] Brand video (product demo, 60–90 seconds)
- [ ] Press kit

### Phase 2 — Brand Refinement (Month 6–12)

After 6 months of user feedback and product iteration:
- **Illustration system formalised:** Consistent illustration style guide; all empty states illustrated
- **Motion design formalised:** Specific animations documented and implemented consistently across the product
- **Brand photography:** Commissioned photography library for marketing use
- **Community brand elements:** Discord server branding, newsletter header, social media templates
- **Pitch deck template:** Investor and partnership presentation template

### Phase 3 — Enterprise Brand Expansion (Month 18–24)

As Enterprise and agency customers grow:
- **White-label design system exports:** The design token system is exportable for white-label deployments
- **Partner brand guidelines:** Co-branding rules for partner integrations
- **Conference and event materials:** Booth design, banners, print materials
- **Enterprise brand standards document:** A separate document for Enterprise customers covering logo usage on co-branded materials

### Phase 4 — Platform Brand (Month 30+)

As ViralScopes becomes a multi-platform analytics brand:
- **Platform-specific visual identities:** TikTok analytics, Instagram analytics — each has a visual accent colour while remaining under the ViralScopes umbrella brand
- **Marketplace brand:** The plugin/extension marketplace has its own visual identity within the ViralScopes system
- **SDK and developer brand:** Documentation site, API portal, and SDK materials with a developer-first visual aesthetic

---

*This visual design system is reviewed at each major product version launch and updated to reflect brand evolution. All changes to the core palette, logo, or typography system require approval from the founding team. Component-level changes are governed by [UI_Design_System.md](./UI_Design_System.md).*

---

**Related Documents:**
- [UI_Design_System.md](./UI_Design_System.md) — Component implementation, spacing, and code-level design tokens
- [README.md](./README.md) — Tech stack (Tailwind, shadcn/ui)
- [What_ViralScopes_Does.md](./What_ViralScopes_Does.md) — Brand purpose and product mission
- [Business_Model.md](./Business_Model.md) — Brand positioning context
