# UI_Design_System.md
# ViralScopes.io — UI Design System

> **Version:** 1.0
> **Last Updated:** 2026-07-20
> **Status:** Active
> **Stack:** Next.js 14 · Tailwind CSS · shadcn/ui · Radix UI
> **Cross-references:** [README.md](./README.md) · [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) · [PRD.md](./PRD.md)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing System](#5-spacing-system)
6. [Layout System](#6-layout-system)
7. [Component Library](#7-component-library)
8. [Forms](#8-forms)
9. [Dashboard Design](#9-dashboard-design)
10. [Data Visualization](#10-data-visualization)
11. [Motion & Animation](#11-motion--animation)
12. [Accessibility](#12-accessibility)
13. [Future Component Roadmap](#13-future-component-roadmap)

---

## 1. Design Philosophy

### 1.1 Design Principles

| # | Principle | Description |
|---|---|---|
| D1 | **Clarity over cleverness** | Every interface decision prioritises immediate comprehension. The user should never wonder what a control does or what a number means. |
| D2 | **Data serves action** | Analytics and scores exist to help users make decisions, not to impress them. Every data point must have a clear next action. |
| D3 | **Progressive disclosure** | Surface the most important information first. Hide complexity until the user is ready for it. Don't show 15 metrics when 4 will do. |
| D4 | **Consistent affordances** | The same interaction model is used throughout the product. If blue underlined text is a link in one place, it is a link everywhere. |
| D5 | **Earn trust through reliability** | The UI communicates system state accurately at all times — loading states, error states, and empty states are first-class citizens, never afterthoughts. |
| D6 | **Respect user context** | Creators use this platform during work sessions. The design should be calm, focused, and free of distractions. No dark patterns. No manipulative notifications. |

### 1.2 User Experience Goals

- **Time to first insight under 60 seconds** — a new user opening the dashboard for the first time should understand what is happening in their niche within one minute.
- **Zero cognitive load for routine tasks** — weekly workflows (checking trending, reviewing opportunities, downloading a report) should require no thought about how to use the interface.
- **Professional credibility** — when a creator shares a ViralScopes export or screenshot with a client or team, it looks polished and data-literate.
- **No surprise in destructive actions** — deleting a watchlist, revoking an API key, or cancelling a subscription all have explicit confirmation flows.

### 1.3 Accessibility Philosophy

Accessibility is not a compliance checkbox — it is a quality indicator. An interface that works for users with visual, motor, or cognitive differences also works better for everyone.

Commitments:
- WCAG 2.2 Level AA compliance on every shipped component
- Keyboard navigation as a first-class interaction model — not an afterthought
- Screen reader compatibility tested with NVDA (Windows) and VoiceOver (macOS/iOS)
- Colour is never the sole carrier of information — always paired with text, icon, or pattern
- All interactive elements have a visible focus indicator meeting WCAG 2.2 3:4.5 contrast ratio

### 1.4 Mobile-First Strategy

The application is designed with a mobile-first breakpoint system but optimised for desktop use. The primary use case is a creator or strategist working at a desk with a wide viewport. However:

- All pages are functional and legible on mobile (375px+)
- The sidebar collapses to a bottom navigation bar on mobile
- Tables adapt to scrollable card lists on small screens
- Charts are simplified to show key data points on mobile (not full interactivity)
- The mobile app (v2.0) will provide a native experience for alert consumption and quick checks

### 1.5 Responsive Design Principles

- Fluid typography: type scales down gracefully on smaller screens
- Fluid grids: column counts reduce as viewport narrows
- Touch targets: minimum 44×44px on mobile
- Content priority: on small screens, the most important information comes first
- No horizontal scroll on any page (except intentional data tables)

### 1.6 Design Consistency Guidelines

- A component built once should be used everywhere it is needed — never build one-off components when a design system component exists
- All spacing values come from the spacing scale — no arbitrary pixel values
- All colours come from the design token system — no hardcoded hex values in components
- Icons come from the Lucide icon set only — no mixing icon families
- All new components are added to the design system before or alongside their first production use

---

## 2. Brand Identity

### 2.1 Brand Personality

ViralScopes.io positions itself as the **intelligent, professional co-pilot** for content creators. The brand is:

| Trait | What it means in the UI |
|---|---|
| **Intelligent** | The interface feels sophisticated without being intimidating. Data is presented with context and meaning. |
| **Direct** | No marketing fluff, no vague language. Scores, recommendations, and alerts are specific and actionable. |
| **Trustworthy** | Clean, measured visual design. No sensationalist language. Confidence intervals shown alongside scores. |
| **Focused** | The UI removes noise so the creator can focus on what matters. Calm, dark-mode-first aesthetic. |
| **Ethical** | The product is transparent about what it does and doesn't do. "This is an original recommendation" is clearly labelled. |

### 2.2 Visual Identity

The visual identity reflects the intersection of data science and creative work:

- **Dark mode as the default** — creators and analysts work in low-light environments; dark mode is more comfortable for extended sessions
- **Electric blue accent** — represents intelligence, data, and technology without feeling cold
- **Tight, precise typography** — communicates professionalism and data literacy
- **Generous whitespace** — separates information into scannable chunks; not a data wall
- **Subtle gradients on data elements** — viral score gauges, chart fills, and KPI cards use controlled gradients to suggest depth and dynamism

### 2.3 Logo Usage Guidelines

- The logo consists of a wordmark ("ViralScopes") and an optional icon mark (abstract scope/target symbol)
- **Minimum size:** 80px wide for the full wordmark; 32px for the icon mark alone
- **Clear space:** equal to the height of the "V" in ViralScopes on all sides
- **Permitted backgrounds:** dark surfaces (preferred), white, and brand blue
- **Never:** rotate, distort, recolour, add effects, or place on a busy background

### 2.4 Iconography Style

Icon library: **Lucide** (`lucide-react`)

| Property | Value |
|---|---|
| Style | Outline (stroke-based), consistent 2px stroke weight |
| Default size | 16px (inline), 20px (standalone in UI), 24px (hero/feature) |
| Colour | Inherits from text colour (uses `currentColor`) |
| Prohibited | Filled/solid icons (use outline only), mixing icon sets |

Icons always carry an accessible label:
```tsx
// ✅ Correct
<TrendingUp className="h-5 w-5" aria-hidden="true" />
<span className="sr-only">Trending up</span>

// ✅ Or with visible label
<TrendingUp className="h-5 w-5" aria-hidden="true" />
<span>Trending</span>
```

### 2.5 Illustration Style

Illustrations are used sparingly — primarily for empty states and onboarding steps.

Style characteristics:
- Flat, geometric, minimal
- Consistent line weight matching icon set (2px)
- Limited palette (2–3 brand colours per illustration)
- Abstract/conceptual rather than literal
- No photorealistic or 3D illustrations

### 2.6 Imagery Guidelines

- Photography is not used in the product UI (it belongs to the marketing site)
- Charts and data visualisations are the primary visual assets in the product
- Thumbnail images (from YouTube) are displayed with consistent aspect ratio (16:9) and rounded corners (4px radius)
- User avatars: circular, 32px default, 40px in profile contexts; fallback is initials on a coloured background

---

## 3. Color System

All colours are defined as CSS custom properties (design tokens) in the Tailwind config. Components never reference raw hex values — they always reference tokens.

### 3.1 Semantic Token Architecture

```css
/* globals.css — root token definitions */
:root {
  /* ── Primary ── */
  --color-primary:           210 100% 56%;   /* Electric blue */
  --color-primary-foreground: 0 0% 100%;

  /* ── Secondary ── */
  --color-secondary:         240 5% 26%;
  --color-secondary-foreground: 0 0% 95%;

  /* ── Accent ── */
  --color-accent:            262 83% 68%;    /* Purple-violet */
  --color-accent-foreground: 0 0% 100%;

  /* ── Semantic States ── */
  --color-success:           142 72% 40%;
  --color-success-foreground: 0 0% 100%;

  --color-warning:           38 92% 50%;
  --color-warning-foreground: 0 0% 10%;

  --color-error:             0 84% 60%;
  --color-error-foreground:  0 0% 100%;

  --color-info:              199 89% 48%;
  --color-info-foreground:   0 0% 100%;

  /* ── Surface & Background ── */
  --color-background:        224 71% 4%;     /* Deep dark blue-grey */
  --color-surface:           224 46% 8%;     /* Slightly lighter surface */
  --color-surface-elevated:  224 36% 11%;    /* Cards, modals */
  --color-surface-overlay:   224 26% 14%;    /* Hover states, tooltips */

  /* ── Text ── */
  --color-text-primary:      0 0% 95%;
  --color-text-secondary:    215 16% 65%;
  --color-text-tertiary:     215 12% 45%;
  --color-text-disabled:     215 10% 30%;
  --color-text-inverse:      224 71% 4%;

  /* ── Border ── */
  --color-border:            224 18% 18%;
  --color-border-focus:      210 100% 56%;
  --color-border-strong:     224 18% 25%;

  /* ── Focus ── */
  --color-focus-ring:        210 100% 56%;

  /* ── Disabled ── */
  --color-disabled-bg:       224 18% 14%;
  --color-disabled-text:     215 10% 30%;
}
```

### 3.2 Light Theme Overrides

```css
[data-theme="light"] {
  --color-background:        0 0% 98%;
  --color-surface:           0 0% 100%;
  --color-surface-elevated:  0 0% 96%;
  --color-surface-overlay:   210 20% 94%;

  --color-text-primary:      224 71% 4%;
  --color-text-secondary:    215 16% 35%;
  --color-text-tertiary:     215 12% 55%;

  --color-border:            214 32% 88%;
  --color-border-strong:     214 32% 78%;

  --color-secondary:         210 40% 94%;
  --color-secondary-foreground: 224 71% 4%;
}
```

### 3.3 Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ["./apps/web/**/*.{ts,tsx}"],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          foreground: "hsl(var(--color-primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary))",
          foreground: "hsl(var(--color-secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--color-accent))",
          foreground: "hsl(var(--color-accent-foreground))",
        },
        success: "hsl(var(--color-success))",
        warning: "hsl(var(--color-warning))",
        error: "hsl(var(--color-error))",
        info: "hsl(var(--color-info))",
        background: "hsl(var(--color-background))",
        surface: "hsl(var(--color-surface))",
        "surface-elevated": "hsl(var(--color-surface-elevated))",
        "surface-overlay": "hsl(var(--color-surface-overlay))",
        border: "hsl(var(--color-border))",
        "border-focus": "hsl(var(--color-border-focus))",
        "text-primary": "hsl(var(--color-text-primary))",
        "text-secondary": "hsl(var(--color-text-secondary))",
        "text-tertiary": "hsl(var(--color-text-tertiary))",
        "text-disabled": "hsl(var(--color-text-disabled))",
      },
    },
  },
};
```

### 3.4 Viral Score Colour Scale

The Viral Score (0–100) uses a semantic colour gradient:

| Score range | Colour | Token | Meaning |
|---|---|---|---|
| 0–30 | Red | `--vs-score-low` | Low viral potential |
| 31–50 | Orange | `--vs-score-medium-low` | Below average |
| 51–69 | Yellow | `--vs-score-medium` | Average |
| 70–84 | Teal | `--vs-score-high` | Above average |
| 85–100 | Green | `--vs-score-exceptional` | Exceptional |

### 3.5 High-Contrast Considerations

For users who prefer high contrast (Windows High Contrast Mode or `forced-colors: active` media query):
- All interactive element boundaries become explicit outlines
- Background/foreground relationships are reversed to system-forced colours
- The application uses semantic HTML that respects forced colours without custom overrides
- Test: all pages are checked with the Windows High Contrast White and Black themes

---

## 4. Typography

### 4.1 Font Families

| Role | Family | Fallback stack |
|---|---|---|
| **UI (headings + body)** | `Inter` (Google Fonts) | `system-ui, -apple-system, sans-serif` |
| **Monospace (code, API keys, IDs)** | `JetBrains Mono` | `ui-monospace, 'Cascadia Code', monospace` |
| **Data (numeric displays)** | `Inter` with `font-variant-numeric: tabular-nums` | — |

```css
/* globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'ss01' 1, 'ss02' 1;  /* Inter stylistic alternates */
}

.font-mono {
  font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

### 4.2 Type Scale

All type sizes use the `rem` unit. Base font size: 16px.

| Token | Size | Line height | Weight | Usage |
|---|---|---|---|---|
| `text-h1` | 2.25rem (36px) | 1.2 | 700 | Page titles (rare) |
| `text-h2` | 1.875rem (30px) | 1.25 | 700 | Section headings |
| `text-h3` | 1.5rem (24px) | 1.3 | 600 | Card headings, widget titles |
| `text-h4` | 1.25rem (20px) | 1.35 | 600 | Subsection headings |
| `text-h5` | 1.125rem (18px) | 1.4 | 600 | Small headings, sidebar labels |
| `text-h6` | 1rem (16px) | 1.5 | 600 | Inline headings |
| `text-body-lg` | 1rem (16px) | 1.6 | 400 | Primary body text |
| `text-body` | 0.875rem (14px) | 1.57 | 400 | Default body text (dashboard) |
| `text-body-sm` | 0.8125rem (13px) | 1.54 | 400 | Secondary body text |
| `text-caption` | 0.75rem (12px) | 1.5 | 400 | Captions, meta text, timestamps |
| `text-label` | 0.75rem (12px) | 1.0 | 500 | Form labels, table headers |
| `text-overline` | 0.625rem (10px) | 1.6 | 600 | Section labels (all caps) |
| `text-code` | 0.875rem (14px) | 1.6 | 400 | Inline code, API keys |
| `text-code-sm` | 0.75rem (12px) | 1.6 | 400 | Small code blocks |

```typescript
// tailwind.config.ts — fontSize extension
fontSize: {
  "h1": ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
  "h2": ["1.875rem", { lineHeight: "1.25", fontWeight: "700" }],
  "h3": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
  "h4": ["1.25rem", { lineHeight: "1.35", fontWeight: "600" }],
  "h5": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
  "body-lg": ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
  "body": ["0.875rem", { lineHeight: "1.57", fontWeight: "400" }],
  "body-sm": ["0.8125rem", { lineHeight: "1.54", fontWeight: "400" }],
  "caption": ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
  "label": ["0.75rem", { lineHeight: "1.0", fontWeight: "500" }],
  "overline": ["0.625rem", { lineHeight: "1.6", fontWeight: "600" }],
}
```

### 4.3 Font Weights

| Weight | Token | Usage |
|---|---|---|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Labels, secondary emphasis |
| 600 | `font-semibold` | Headings h3–h6, buttons |
| 700 | `font-bold` | Page headings h1–h2, KPI numbers |

### 4.4 Letter Spacing

| Token | Value | Usage |
|---|---|---|
| `tracking-tight` | -0.025em | Large headings (h1, h2) |
| `tracking-normal` | 0em | Body text (default) |
| `tracking-wide` | 0.025em | Labels, overlines |
| `tracking-widest` | 0.1em | ALL CAPS overlines |

---

## 5. Spacing System

### 5.1 Base Unit

The spacing system is built on a **4px base unit**. All spacing values are multiples of 4px.

```
4px  = 1 unit  = spacing-1
8px  = 2 units = spacing-2
12px = 3 units = spacing-3
16px = 4 units = spacing-4
20px = 5 units = spacing-5
24px = 6 units = spacing-6
32px = 8 units = spacing-8
40px = 10 units = spacing-10
48px = 12 units = spacing-12
64px = 16 units = spacing-16
80px = 20 units = spacing-20
96px = 24 units = spacing-24
```

Tailwind's default spacing scale aligns with this system — `p-4` = 16px, `p-6` = 24px, etc.

### 5.2 Spacing Application Guide

| Context | Spacing | Token |
|---|---|---|
| **Inline icon → text gap** | 8px | `gap-2` |
| **Within a component (internal)** | 8–12px | `p-2` to `p-3` |
| **Component padding (default)** | 16px | `p-4` |
| **Component padding (comfortable)** | 24px | `p-6` |
| **Between sibling components** | 16–24px | `gap-4` to `gap-6` |
| **Card internal padding** | 24px | `p-6` |
| **Section spacing (within page)** | 32–40px | `py-8` to `py-10` |
| **Page section gaps** | 48–64px | `py-12` to `py-16` |
| **Page margin (top)** | 32px | `pt-8` |

### 5.3 Grid System

The layout grid uses a **12-column** system at full width.

| Breakpoint | Columns | Gutter | Margin |
|---|---|---|---|
| Mobile (< 640px) | 4 | 16px | 16px |
| Tablet (640–1024px) | 8 | 20px | 24px |
| Desktop (1024–1280px) | 12 | 24px | 32px |
| Wide (> 1280px) | 12 | 24px | auto (centred) |

---

## 6. Layout System

### 6.1 Container Sizes

```typescript
// tailwind.config.ts
container: {
  center: true,
  padding: {
    DEFAULT: "1rem",
    sm: "1.5rem",
    lg: "2rem",
  },
  screens: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
},
```

### 6.2 Breakpoints

| Name | Min width | Target device |
|---|---|---|
| `xs` (default) | 0px | Mobile portrait |
| `sm` | 640px | Mobile landscape / small tablet |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop |
| `xl` | 1280px | Desktop (primary target) |
| `2xl` | 1536px | Wide desktop |

### 6.3 Application Shell Layout

```
┌────────────────────────────────────────────────────┐
│                    Topbar (64px)                   │
├───────────────┬────────────────────────────────────┤
│               │                                    │
│   Sidebar     │         Main Content Area          │
│   (240px)     │         (flex: 1)                  │
│               │                                    │
│               │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

```tsx
// components/layout/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto p-6 lg:p-8"
          id="main-content"
          tabIndex={-1}   // Focus target for skip-link
        >
          {children}
        </main>
      </div>
    </div>
  );
}
```

**Sidebar:** 240px wide (collapsed to icon-only at 56px on md and below; hidden on mobile with overlay drawer)

**Topbar:** 64px tall; contains breadcrumb, search trigger, notifications, user avatar

### 6.4 Dashboard Layout Patterns

**Pattern A — KPI Overview + Content Table (Home, Videos, Channels)**

```
┌─────────────────────────────────────────────────────┐
│  Page Header (title + primary action button)        │
├─────────────┬─────────────┬─────────────┬───────────┤
│  KPI Card   │  KPI Card   │  KPI Card   │ KPI Card  │
│  (3 or 4 cards spanning full width)                 │
├─────────────────────────────────────────────────────┤
│  Filter bar + search                                │
├─────────────────────────────────────────────────────┤
│  Data table or card grid                            │
│  (takes remaining vertical space, scrollable)       │
└─────────────────────────────────────────────────────┘
```

**Pattern B — Detail View (Video Detail, Channel Detail)**

```
┌─────────────────────────────────────────────────────┐
│  Back link + Page Header                            │
├──────────────────────────┬──────────────────────────┤
│                          │  Viral Score Card        │
│  Primary Content         │  ─────────────────────  │
│  (transcript summary,    │  Hook Type Badge         │
│   analysis, etc.)        │  ─────────────────────  │
│                          │  Key Metrics             │
│                          │  ─────────────────────  │
│                          │  Recommendations         │
└──────────────────────────┴──────────────────────────┘
```

**Pattern C — Split View (Trends, Opportunities)**

```
┌────────────────────┬────────────────────────────────┐
│  Filter sidebar    │  Content list/grid             │
│  (280px)           │  (flex: 1)                     │
│                    │                                │
│  Status filters    │  Trend cards / Opportunity     │
│  Date range        │  cards (scrollable)            │
│  Score sliders     │                                │
└────────────────────┴────────────────────────────────┘
```

### 6.5 Card Layouts

```tsx
// Standard card
<div className="rounded-lg border border-border bg-surface-elevated p-6">
  {content}
</div>

// Stat / KPI card
<div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-1">
  <p className="text-caption text-text-tertiary uppercase tracking-widest">{label}</p>
  <p className="text-h2 font-bold tabular-nums">{value}</p>
  <p className="text-caption text-text-secondary">{delta}</p>
</div>

// Interactive card (hover state)
<div className="rounded-lg border border-border bg-surface-elevated p-6
                transition-colors hover:border-border-strong hover:bg-surface-overlay
                cursor-pointer">
  {content}
</div>
```

### 6.6 Modal Layout

```tsx
// Standard modal wrapper (via Radix Dialog)
<Dialog.Content className="
  fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  w-full max-w-lg max-h-[85vh]
  rounded-xl border border-border bg-surface-elevated shadow-2xl
  flex flex-col
  focus:outline-none
">
  <Dialog.Title className="px-6 pt-6 text-h4 font-semibold" />
  <div className="flex-1 overflow-y-auto px-6 py-4">{content}</div>
  <div className="px-6 pb-6 flex justify-end gap-3">{actions}</div>
</Dialog.Content>
```

---

## 7. Component Library

All components use **shadcn/ui** as the base (built on Radix UI primitives). Customisation is done by editing the component source file in `components/ui/`. No component overrides styles via `!important`.

### 7.1 Button

**Purpose:** Triggers an action or navigates.

**Variants:**

| Variant | Use case | Class |
|---|---|---|
| `primary` | Primary page action (one per page) | `bg-primary text-primary-foreground` |
| `secondary` | Secondary action, alternative | `bg-secondary text-secondary-foreground` |
| `outline` | Less prominent action | `border border-border text-text-primary` |
| `ghost` | Toolbar action, icon button | `hover:bg-surface-overlay` |
| `destructive` | Irreversible actions (delete, revoke) | `bg-error text-error-foreground` |
| `link` | Inline text action | `text-primary underline-offset-4` |

**Sizes:** `sm` (32px height), `md` (40px, default), `lg` (48px)

**States:** default, hover, active, focus-visible, disabled, loading (spinner replaces label)

**Accessibility:**
- `<button>` element always (never `<div>` or `<a>` styled as button for actions)
- Disabled state uses `disabled` attribute, not just visual styling
- Loading state: `aria-disabled="true"` + `aria-busy="true"` + visible spinner + hidden "Loading..." text

```tsx
// Usage example
<Button variant="primary" size="md" onClick={handleAnalyze}
        disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
  Analyse Video
</Button>
```

---

### 7.2 Input

**Purpose:** Single-line text entry.

**Variants:** `default`, `search` (with search icon prefix), `password` (with visibility toggle)

**States:** default, focus, filled, error, disabled

**Anatomy:**
```
[Label]
[Prefix icon?] [Input field] [Suffix action?]
[Helper text / Error message]
```

```tsx
<div className="space-y-1.5">
  <Label htmlFor="channel-url">YouTube Channel URL</Label>
  <Input
    id="channel-url"
    type="url"
    placeholder="https://youtube.com/@channelname"
    aria-describedby="channel-url-error"
    aria-invalid={!!error}
  />
  {error && (
    <p id="channel-url-error" className="text-caption text-error" role="alert">
      {error}
    </p>
  )}
</div>
```

---

### 7.3 Textarea

**Purpose:** Multi-line text entry (e.g. custom alert message, notes).

**States:** Same as Input.
**Auto-resize:** Grows vertically with content up to a max-height, then scrolls.
**Character count:** Displayed below the field when `maxLength` is set.

---

### 7.4 Select

**Purpose:** Choose one option from a predefined list (< 10 options) or a searchable dropdown (10+ options).

Built on **Radix UI Select**. For searchable variants (e.g. country, category), use **Combobox** pattern instead.

**Accessibility:** Arrow key navigation, type-ahead search, `role="listbox"` + `role="option"`, `aria-selected`.

---

### 7.5 Dropdown Menu

**Purpose:** Context actions for a record (three-dot menu on table rows, cards).

Built on **Radix UI DropdownMenu**.

**Rules:**
- Maximum 7 items before grouping with a separator
- Destructive items (Delete, Revoke) are always at the bottom, separated, and coloured red
- Never nest dropdown menus more than one level deep

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="sm" aria-label="More options">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem>View detail</DropdownMenuItem>
    <DropdownMenuItem>Add to watchlist</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-error">Remove</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### 7.6 Checkbox & Radio

**Purpose:** Boolean selection (checkbox); mutually exclusive selection (radio).

Built on **Radix UI Checkbox** and **Radix UI RadioGroup**.

**Rules:**
- Always paired with a visible `<label>` — clicking the label activates the control
- Indeterminate checkbox state is supported for "select all" in tables
- Group related checkboxes/radios with `fieldset` and `legend`

---

### 7.7 Switch

**Purpose:** Toggle a binary setting that takes effect immediately (e.g. "Active" on an alert rule).

Built on **Radix UI Switch**.

**Accessibility:** `role="switch"`, `aria-checked`, visible label. Never use a switch for a form value submitted later — use a checkbox instead.

---

### 7.8 Table

**Purpose:** Display structured data with sort, filter, and row actions.

**Features:**
- Column sorting (ascending/descending toggle per column; `aria-sort` on `<th>`)
- Row selection with checkbox column (for bulk actions)
- Sticky header on scroll
- Column minimum widths to prevent content collapse
- Responsive: wraps to card list below `md` breakpoint

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-8">
        <Checkbox aria-label="Select all" />
      </TableHead>
      <TableHead
        className="cursor-pointer select-none"
        onClick={() => handleSort("title")}
        aria-sort={sort.field === "title" ? sort.direction : "none"}
      >
        <span className="flex items-center gap-1">
          Title
          <ArrowUpDown className="h-3.5 w-3.5 text-text-tertiary" />
        </span>
      </TableHead>
      <TableHead className="text-right">Viral Score</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {videos.map((video) => (
      <TableRow key={video.id} className="hover:bg-surface-overlay">
        <TableCell><Checkbox /></TableCell>
        <TableCell className="font-medium">{video.title}</TableCell>
        <TableCell className="text-right">
          <ViralScoreBadge score={video.viralScore} />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 7.9 Card

**Purpose:** Container for a self-contained piece of content.

**Variants:**

| Variant | Usage |
|---|---|
| `default` | Standard content grouping |
| `stat` | KPI/metric display (large number + label + delta) |
| `interactive` | Clickable card (video card, trend card) |
| `highlighted` | Featured content, selected state |
| `alert` | Warning or informational call-out |

---

### 7.10 Alert

**Purpose:** Communicate system-level status or important information.

**Variants:** `info` (blue), `success` (green), `warning` (amber), `error` (red)

```tsx
<Alert variant="warning">
  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
  <AlertTitle>YouTube API quota at 80%</AlertTitle>
  <AlertDescription>
    The fallback data source will activate at 100%.{" "}
    <Link href="/admin/quota">View quota usage</Link>
  </AlertDescription>
</Alert>
```

**Accessibility:** `role="alert"` for errors and warnings (announced by screen readers immediately). `role="status"` for informational messages.

---

### 7.11 Badge

**Purpose:** Short metadata label attached to an item.

**Variants:** `default`, `primary`, `success`, `warning`, `error`, `outline`

**Viral Score Badge (custom):**
```tsx
<ViralScoreBadge score={87.4} />
// Renders: coloured badge with score; colour from the viral score scale
```

**Hook Type Badge (custom):**
```tsx
<HookTypeBadge type="statistic" />
// Renders: outline badge with hook type label
```

---

### 7.12 Tooltip

**Purpose:** Provides supplementary information on hover/focus. Never used for critical information.

Built on **Radix UI Tooltip**.

**Rules:**
- Delay: 400ms open, 100ms close
- Max width: 240px
- Position: auto-placed to avoid viewport edges
- Always triggered by a keyboard-focusable element

---

### 7.13 Modal (Dialog)

**Purpose:** Requires the user to complete an action or acknowledge information before continuing.

Built on **Radix UI Dialog**.

**Rules:**
- Focus is trapped within the modal while open
- `Escape` key closes the modal
- Clicking the backdrop closes non-destructive modals
- Destructive modals require explicit Cancel / Confirm buttons (no backdrop close)
- `aria-labelledby` points to the modal title
- Maximum width: 560px for standard modals; 800px for data-heavy modals

**Modal types:**

| Type | Size | Example |
|---|---|---|
| Confirmation | sm (400px) | Delete watchlist, revoke API key |
| Form | md (560px) | Create alert rule, create watchlist |
| Detail | lg (800px) | Full analysis inline view |
| Full-screen | — | Mobile-only; uses a Drawer instead |

---

### 7.14 Drawer

**Purpose:** Slide-in panel for secondary content, mobile navigation, and filter panels.

Built on a custom Drawer using **Radix UI Dialog** with transform animation.

**Positions:** right (default for detail panels), left (mobile navigation), bottom (mobile actions)

---

### 7.15 Navigation (Sidebar)

**Structure:**
```
ViralScopes logo
─────────────────
Home
Trending
Videos
Channels
─────────────────
Trends
Opportunities
Recommendations
─────────────────
Watchlists
Alerts
─────────────────
Search
Export
─────────────────
[User avatar + name]
Settings
```

**Active state:** Left border accent (4px, primary colour) + slightly lighter background
**Collapsed state (icon-only):** Icons only, 56px wide; tooltips show label on hover
**Mobile:** Hidden; toggled via hamburger button in topbar; renders as a full-height left drawer overlay

---

### 7.16 Tabs

**Purpose:** Switch between related content views within a page section.

Built on **Radix UI Tabs**.

**Variants:**
- `underline` (default) — thin underline on active tab; used for page-level tabs
- `pill` — filled background on active tab; used for compact filter tabs

**Rules:**
- Arrow key navigation between tabs
- Active tab panel has `role="tabpanel"` with `aria-labelledby` pointing to its tab

---

### 7.17 Breadcrumb

**Purpose:** Show location within the application hierarchy.

```
Home / Videos / How I Saved £10,000 in 6 Months
```

**Rules:**
- `aria-label="Breadcrumb"` on the `<nav>` element
- `aria-current="page"` on the current page item
- The last item (current page) is not a link

---

### 7.18 Pagination

**Purpose:** Navigate through pages of results in tables and lists.

**Implementation:** Cursor-based (no page numbers — uses `Previous` / `Next` with count display).

```
Showing 26–50 of 4,821 results    [← Previous]  [Next →]
```

**Accessibility:** `aria-label` on the `<nav>`: "Video results pagination". Disabled Previous/Next buttons use `aria-disabled="true"`.

---

### 7.19 Toast Notifications

**Purpose:** Brief feedback messages that appear non-intrusively and auto-dismiss.

Built on **Sonner** or **Radix UI Toast**.

**Variants:** `success`, `error`, `warning`, `info`, `loading` (persistent until resolved)

**Placement:** Bottom-right on desktop; bottom-centre on mobile.

**Duration:** Success/info: 4 seconds. Warning: 6 seconds. Error: 8 seconds. Loading: persistent.

**Rules:**
- `role="status"` for success/info; `role="alert"` for errors
- Maximum 3 toasts visible simultaneously (older ones dismissed as new ones appear)
- A close button is always present for accessibility

---

### 7.20 Skeleton Loaders

**Purpose:** Placeholder UI shown while content is loading. Prevents layout shift.

```tsx
// Skeleton for a stat card
<div className="rounded-lg border border-border bg-surface-elevated p-4 space-y-2">
  <Skeleton className="h-3 w-24" />    {/* Label */}
  <Skeleton className="h-8 w-16" />    {/* Value */}
  <Skeleton className="h-3 w-20" />    {/* Delta */}
</div>
```

**Rules:**
- Skeletons match the approximate shape of the content they replace (same height, roughly same width proportions)
- `aria-busy="true"` on the skeleton container; `aria-label="Loading..."` for screen readers
- Animation: subtle shimmer from left to right (`animate-pulse` or custom shimmer)
- Never show a spinner AND a skeleton simultaneously for the same content area

---

### 7.21 Empty States

**Purpose:** Shown when a list, table, or data section has no content.

**Anatomy:**
```
[Illustration (optional, 120px)]
[Heading — what is empty]
[Body — why it might be empty + what to do]
[Primary action button (optional)]
```

```tsx
<EmptyState
  icon={<Eye className="h-12 w-12 text-text-tertiary" />}
  title="No videos analysed yet"
  description="Add a watchlist or paste a YouTube URL to start discovering viral content."
  action={<Button variant="primary">Add Watchlist</Button>}
/>
```

**Rules:**
- Empty states explain the situation and offer a path forward — never just "No data"
- Different empty states for: no data ever created vs no results matching the current filter
- "No results" empty states show the active filters and offer a "Clear filters" action

---

### 7.22 Loading Indicators

**Types:**

| Type | Usage | Component |
|---|---|---|
| **Spinner** | Button loading, inline loading within a component | `<Spinner />` (SVG, animated) |
| **Skeleton** | Full page or section loading | See 7.20 |
| **Progress bar** | Export generation, background job progress | `<Progress value={42} />` |
| **Shimmer** | Alternative to spinner for cards and list items | CSS animation via `animate-pulse` |

---

## 8. Forms

### 8.1 Validation Patterns

All form validation uses a combination of:
- **HTML5 native validation** for basic constraints (`required`, `type`, `min`, `max`)
- **Zod schemas** for business rules (validated on submit, and sometimes on blur)
- **Real-time validation** only for fields where it is helpful (password strength, URL format check)

**Validation triggers:**
- `onBlur` — validate when user leaves a field (less intrusive)
- `onSubmit` — final validation before submission
- `onChange` — only for password strength indicator and character count

### 8.2 Error Messaging

**Rules:**
- Error messages appear below the relevant field (never above, never as a tooltip)
- Error messages are specific: "Email address is invalid" not "Invalid input"
- `role="alert"` on error messages so screen readers announce them immediately
- `aria-invalid="true"` and `aria-describedby="field-error-id"` on the invalid input
- Form-level errors (e.g. server error) appear in an `<Alert variant="error">` above the submit button

```tsx
// Error field pattern
<div className="space-y-1.5">
  <Label htmlFor="email" className="text-label">Email address</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
    className={errors.email ? "border-error focus-visible:ring-error" : ""}
  />
  {errors.email && (
    <p id="email-error" className="text-caption text-error flex items-center gap-1" role="alert">
      <AlertCircle className="h-3 w-3" aria-hidden="true" />
      {errors.email.message}
    </p>
  )}
</div>
```

### 8.3 Required Field Indicators

- Required fields are marked with an asterisk (`*`) in the label, styled in `text-error`
- A note at the top of the form reads: "Fields marked * are required"
- `aria-required="true"` on all required inputs

### 8.4 Input Formatting

| Field type | Formatting applied |
|---|---|
| Currency | Formatted on blur: `£1,234.56` |
| Large numbers | Thousands separator on display |
| Dates | ISO 8601 internally; locale-formatted in UI |
| Phone numbers | Not used in MVP |
| API keys | Truncated after first 8 chars: `vs_live_a1b2****` |
| URLs | `https://` prefix auto-added if user omits it |

### 8.5 Success States

- After successful form submission, the form is replaced by a success confirmation (not a toast alone for significant actions)
- For inline editing (e.g. renaming a watchlist), a brief success icon appears next to the field then fades out
- Success messages are specific: "Watchlist 'Finance Competitors' updated" not "Saved"

---

## 9. Dashboard Design

### 9.1 Dashboard Widgets (KPI Cards)

KPI cards appear at the top of most dashboard pages. Standard layout: 4 cards in a 4-column grid (2×2 on tablet, 1×4 on mobile).

```tsx
// KPI Card anatomy
<StatCard
  label="Videos Analysed"
  value="4,821"
  delta="+312 this week"
  deltaDirection="up"
  icon={<VideoIcon className="h-5 w-5" />}
/>
```

**Properties:**
- `label` — short descriptor (uppercase, caption size)
- `value` — the primary number (h2, bold, tabular-nums)
- `delta` — change vs previous period (caption, coloured by direction)
- `icon` — optional context icon (top-right of card)

### 9.2 Analytics Cards

Analytics cards combine a KPI headline with a mini spark chart below it:

```
│ Avg Viral Score      ↑ +4.2 │
│ 67.4                         │
│ ──────────────────────────   │
│  [spark line chart: 30d]     │
└─────────────────────────────-┘
```

### 9.3 Data Tables

Dashboard tables follow the patterns in Section 7.8.

Dashboard-specific additions:
- **Quick action column** — rightmost column; contains a dropdown menu for per-row actions
- **Viral Score column** — uses `<ViralScoreBadge>` component; sortable
- **Status column** — uses coloured badge for analysis status
- **Thumbnail column** — 16:9 aspect ratio, 64px wide, `object-cover`, rounded-sm

### 9.4 Filters

The filter bar sits between the page header and the data table:

```
[Search input          ] [Platform ▼] [Language ▼] [Score ▼] [Date range ▼] [Clear filters]
```

**Filter behaviour:**
- Filters apply immediately on change (no "Apply" button)
- Active filters are indicated by a filled/coloured state on the dropdown trigger
- "Clear filters" button appears only when at least one non-default filter is active
- Filter state is reflected in the URL query string for shareable links

### 9.5 Bulk Actions

When one or more table rows are selected via checkbox:

```
[3 selected]  [Export ▼]  [Add to watchlist]  [✕ Clear selection]
```

- Bulk action bar slides down between the filter bar and the table header
- Deselecting all rows dismisses the bulk action bar
- Bulk actions only include actions applicable to all selected items

---

## 10. Data Visualization

### 10.1 Chart Library

**Primary:** Recharts (included in tech stack)
**Usage:** Line charts, area charts, bar charts, histograms

### 10.2 Chart Types & Usage

| Chart type | Usage in ViralScopes | Component |
|---|---|---|
| **Line chart** | Growth over time (views, viral score) | `<LineChart>` |
| **Area chart** | Trend velocity (filled for visual weight) | `<AreaChart>` |
| **Bar chart** | Engagement comparison, hook type distribution | `<BarChart>` |
| **Histogram** | Viral Score distribution | `<BarChart>` with equal bins |
| **Heatmap** | Upload frequency calendar | Custom SVG grid |
| **Gauge** | Viral Score on Video Detail page | Custom SVG arc |
| **Spark line** | Mini trend on KPI / Analytics cards | `<LineChart>` no axes |

### 10.3 Color Usage in Charts

- Use the semantic chart palette only — not arbitrary colours
- Each data series has a distinct colour from the palette
- Colour is always paired with a label (never colour alone to distinguish series)
- Colour-blind safe: the palette is tested against deuteranopia and protanopia

Chart colour tokens:
```css
--chart-1: 210 100% 56%;  /* Primary blue */
--chart-2: 262 83% 68%;   /* Accent purple */
--chart-3: 142 72% 40%;   /* Success green */
--chart-4: 38 92% 50%;    /* Warning amber */
--chart-5: 199 89% 48%;   /* Info cyan */
```

### 10.4 Chart Accessibility

- All charts have `role="img"` and `aria-label` describing the chart's content
- A data table alternative is available via a "View as table" toggle for all charts
- Tooltips are keyboard-accessible (focus on data points via arrow keys)
- Chart legends are listed as `<ul>` with `<li>` items for screen reader comprehension

### 10.5 Empty State for Charts

```tsx
<ChartEmptyState
  title="No data yet"
  description="Video discovery runs every 6 hours. Check back soon."
/>
// Renders: a dashed border box with the empty state message in the chart container
```

### 10.6 Loading State for Charts

- Skeleton replaces the chart container during loading
- The skeleton preserves the approximate height of the chart (e.g. 200px)
- No spinner inside a chart container

---

## 11. Motion & Animation

### 11.1 Transition Timing

All transitions use a consistent timing system:

```css
--duration-instant:  0ms;
--duration-fast:     100ms;
--duration-normal:   200ms;
--duration-slow:     350ms;
--duration-slower:   500ms;

--ease-default:      cubic-bezier(0.16, 1, 0.3, 1);   /* Ease out — snappy */
--ease-in:           cubic-bezier(0.4, 0, 1, 1);
--ease-out:          cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:       cubic-bezier(0.4, 0, 0.2, 1);
```

**Application:**
- Colour transitions: `duration-fast` (100ms) — hover colours
- Show/hide transitions: `duration-normal` (200ms) — tooltips, dropdowns
- Page transitions: `duration-slow` (350ms) — route changes
- Modals and drawers: `duration-normal` (200ms) slide + fade

### 11.2 Hover Effects

| Element | Hover effect |
|---|---|
| Button | Slight brightness increase (5–10%) |
| Table row | Background: `surface-overlay` |
| Card (interactive) | Border lightens; subtle shadow increase |
| Sidebar item | Background: `surface-overlay` |
| Link | Underline appears |

### 11.3 Loading Animations

- **Spinner:** Rotating SVG ring, `animation: spin 0.8s linear infinite`
- **Skeleton shimmer:** `animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`
- **Progress bar:** Smooth width transition, `transition: width 300ms ease-out`

### 11.4 Page Transitions

Next.js App Router handles page transitions. A minimal fade transition is applied to the `<main>` content area via CSS:

```css
main {
  animation: fadeIn 150ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 11.5 Reduced Motion Support

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

In JavaScript:
```typescript
const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Use instant transitions when reduced motion is preferred
const duration = prefersReducedMotion ? 0 : 200;
```

---

## 12. Accessibility

### 12.1 WCAG 2.2 AA Compliance

ViralScopes.io targets **WCAG 2.2 Level AA** compliance on all pages.

| Criterion | Requirement | Implementation |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 4.5:1 for normal text; 3:1 for large text | All text/background combinations pass |
| 1.4.4 Resize Text | Text resizable to 200% without loss of content | Rem-based sizing; no fixed-height text containers |
| 1.4.11 Non-text Contrast | 3:1 for UI components and graphical objects | All borders, icons, and chart elements checked |
| 2.4.7 Focus Visible | Visible focus indicator on all interactive elements | Custom focus ring: 2px solid primary, 2px offset |
| 2.4.11 Focus Appearance (AA) | Focus indicator meets size and contrast requirements | Focus ring is 3px, high-contrast |
| 2.5.3 Label in Name | Accessible name includes visible label text | All buttons and inputs follow this pattern |
| 3.2.2 On Input | No unexpected context changes on input | No auto-submit forms |
| 4.1.2 Name, Role, Value | All UI components have correct ARIA roles and values | shadcn/ui + Radix UI provide this by default |

### 12.2 Keyboard Navigation

Every interactive element is reachable and operable via keyboard:

| Key | Action |
|---|---|
| `Tab` | Move to next interactive element |
| `Shift+Tab` | Move to previous interactive element |
| `Enter` | Activate button, link, or select option |
| `Space` | Toggle checkbox, activate button |
| `Escape` | Close modal, dropdown, tooltip |
| `Arrow keys` | Navigate within dropdown menus, tabs, radio groups |
| `/` | Focus global search (shortcut) |
| `?` | Open keyboard shortcut help modal |

**Skip link:**
```html
<!-- First element in <body> -->
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground
          focus:rounded-md">
  Skip to main content
</a>
```

### 12.3 Focus Management

- When a modal opens: focus moves to the first focusable element inside the modal
- When a modal closes: focus returns to the element that triggered it
- When a page route changes: focus moves to the `<main>` content area (via `tabIndex={-1}` + `.focus()`)
- When a toast appears: it is announced via `role="alert"` without stealing focus

### 12.4 Screen Reader Considerations

- All icons are either `aria-hidden="true"` (decorative) or have an accessible label
- Dynamic content updates use `aria-live` regions appropriately:
  - `aria-live="polite"` — filter results updating, success messages
  - `aria-live="assertive"` — error alerts, critical notifications
- Table headers use `scope="col"` or `scope="row"` for data tables
- Charts have `role="img"` with an `aria-label` describing the chart

### 12.5 Colour Contrast Ratios

All text passes WCAG 2.2 AA minimum contrast:

| Element | Foreground | Background | Ratio | Pass |
|---|---|---|---|---|
| Body text (dark theme) | `text-primary` (#F2F2F5) | `background` (#070B14) | 12.4:1 | ✅ AAA |
| Secondary text | `text-secondary` (#9BAABB) | `background` (#070B14) | 5.8:1 | ✅ AA |
| Tertiary text | `text-tertiary` (#5B6E82) | `background` (#070B14) | 3.2:1 | ✅ AA (large) |
| Primary button | `primary-foreground` (#FFF) | `primary` (#1D8CF8) | 4.6:1 | ✅ AA |
| Error text | `error` (#F05252) | `background` (#070B14) | 5.1:1 | ✅ AA |
| Disabled text | `text-disabled` (#3A4A5A) | `background` (#070B14) | 2.1:1 | ⚠️ Exempt (disabled) |

### 12.6 ARIA Usage Guidelines

**Use ARIA only when native HTML is insufficient:**

```tsx
// ✅ Use native element
<button onClick={handleClick}>Analyse</button>

// ❌ Don't recreate button with ARIA
<div role="button" onClick={handleClick} tabIndex={0}>Analyse</div>

// ✅ ARIA to enhance when necessary
<div role="region" aria-label="Viral Score breakdown">
  {scoreContent}
</div>
```

Common ARIA patterns used in ViralScopes:
- `aria-label` — on icon-only buttons, charts, complex widgets
- `aria-describedby` — linking form fields to their error/helper text
- `aria-live` — dynamic content regions (filter results, notifications)
- `aria-expanded` — collapsible sections, dropdown triggers
- `aria-selected` — tabs, listbox options
- `aria-current="page"` — active navigation item, breadcrumb last item

---

## 13. Future Component Roadmap

### v1.5 Additions

| Component | Purpose | Target release |
|---|---|---|
| `<ChatBubble>` | AI Chat Interface message rendering (user + assistant) | v1.5 |
| `<StreamingText>` | SSE-streamed text with typing cursor animation | v1.5 |
| `<ReportPreview>` | PDF report preview card with thumbnail | v1.5 |
| `<TrendPredictionCard>` | Shows topic, growth probability, and momentum | v1.5 |
| `<ExtensionBanner>` | Prompt to install Chrome Extension | v1.5 |

### v2.0 Additions

| Component | Purpose | Target release |
|---|---|---|
| `<PlatformToggle>` | YouTube / TikTok / Instagram platform switcher | v2.0 |
| `<ShortFormScoreCard>` | Viral score card adapted for short-form content | v2.0 |
| `<MobileAlertCard>` | Alert card optimised for mobile app native feel | v2.0 |
| `<CollaborationComment>` | Inline comment thread on an analysis | v2.0 |
| `<AffiliateWidget>` | Referral link widget in Settings | v2.0 |
| `<ApiSandbox>` | Interactive API request tester in docs | v2.0 |

### v3.0 Additions

| Component | Purpose | Target release |
|---|---|---|
| `<PluginCard>` | Marketplace plugin listing card | v3.0 |
| `<SSOConfigPanel>` | Enterprise SAML/OIDC configuration UI | v3.0 |
| `<WhiteLabelPreview>` | Live preview of white-label branding | v3.0 |
| `<MultiRegionMap>` | Geographic data distribution visualisation | v3.0 |

---

*This design system is a living document. Any new component added to the product must be documented here before or alongside its first production use. All changes require a pull request with at least one approving review from a designer or senior engineer.*

---

**Related Documents:**
- [README.md](./README.md) — Tech stack details (shadcn/ui, Tailwind, Radix UI)
- [REPOSITORY_STRUCTURE.md](./REPOSITORY_STRUCTURE.md) — Where component files live
- [PRD.md](./PRD.md) — User stories that drive component requirements
- [Deployment_Guide.md](./Deployment_Guide.md) — How the frontend is built and deployed
