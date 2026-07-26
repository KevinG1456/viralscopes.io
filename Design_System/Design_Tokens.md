# Design_Tokens.md
# ViralScopes.io — Design Tokens

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Source of truth for:** all colour, typography, spacing, layout, and motion values used in the product.
> **Implementation:** CSS custom properties in `apps/web/styles/globals.css` · Tailwind config in `apps/web/tailwind.config.ts`
> **Cross-references:** [UI_Design_System.md](./UI_Design_System.md) · [Visual_Design_System.md](./Visual_Design_System.md) · [Frontend_Architecture.md](./Frontend_Architecture.md)

---

> **How to use this document:** Every value in the product UI comes from a token defined here. When implementing a component, reference the semantic token name (e.g. `--color-text-primary`), never a raw value (e.g. `#F1F5F9`). This ensures theme switching, accessibility adjustments, and brand evolution require only token changes — not component-level edits.

---

## Table of Contents

1. [Color Tokens](#1-color-tokens)
2. [Typography Tokens](#2-typography-tokens)
3. [Spacing Tokens](#3-spacing-tokens)
4. [Layout Tokens](#4-layout-tokens)
5. [Motion Tokens](#5-motion-tokens)
6. [Token Governance](#6-token-governance)

---

## 1. Color Tokens

### Architecture

The color system has three tiers:

```
Tier 1 — Primitive values    e.g. --blue-600: #1D8CF8
Tier 2 — Semantic tokens     e.g. --color-primary: var(--blue-600)
Tier 3 — Component tokens    e.g. --button-primary-bg: var(--color-primary)
```

Components reference **Tier 2 semantic tokens only**. Tier 1 primitives are for internal token composition. Tier 3 component tokens are defined within individual component stylesheets.

### 1.1 Primitive Color Scale (Tier 1)

```css
/* globals.css — Primitive values (do not use in components directly) */
:root {
  /* Blue scale */
  --blue-50:  #EFF6FF;
  --blue-100: #DBEAFE;
  --blue-200: #BFDBFE;
  --blue-300: #93C5FD;
  --blue-400: #60A5FA;
  --blue-500: #3B82F6;
  --blue-600: #1D8CF8;   /* ← Brand Electric Blue */
  --blue-700: #1D4ED8;
  --blue-800: #1E3A8A;
  --blue-900: #1E2D5A;
  --blue-950: #172554;

  /* Violet scale */
  --violet-400: #A78BFA;
  --violet-500: #8B5CF6;
  --violet-600: #7C5CFC;  /* ← Brand Accent Violet */
  --violet-700: #6D28D9;

  /* Neutral/Slate scale */
  --slate-50:  #F8FAFC;
  --slate-100: #F1F5F9;
  --slate-200: #E2E8F0;
  --slate-300: #CBD5E1;
  --slate-400: #94A3B8;
  --slate-500: #64748B;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1E293B;
  --slate-900: #0F172A;
  --slate-950: #020617;

  /* Deep space scale (brand dark backgrounds) */
  --space-50:  #1A2540;
  --space-100: #18263F;
  --space-200: #121E35;
  --space-300: #0D1526;
  --space-400: #070B14;  /* ← Brand Deep Space */

  /* Green scale */
  --green-400: #34D399;
  --green-500: #10B981;  /* ← Brand Success */
  --green-600: #059669;

  /* Amber scale */
  --amber-400: #FBBF24;
  --amber-500: #F59E0B;  /* ← Brand Warning */
  --amber-600: #D97706;

  /* Red scale */
  --red-400:   #F87171;
  --red-500:   #EF4444;  /* ← Brand Error */
  --red-600:   #DC2626;

  /* Cyan scale */
  --cyan-400:  #22D3EE;
  --cyan-500:  #06B6D4;  /* ← Brand Info */
  --cyan-600:  #0891B2;

  /* Teal scale */
  --teal-400:  #2DD4BF;
  --teal-500:  #14B8A6;  /* ← Viral Score: High */
  --teal-600:  #0D9488;

  /* Orange scale */
  --orange-400: #FB923C;
  --orange-500: #F97316;  /* ← Viral Score: Below Average */
}
```

### 1.2 Semantic Color Tokens (Tier 2) — Dark Theme

```css
:root,
[data-theme="dark"] {
  /* ── Primary ── */
  --color-primary:            var(--blue-600);        /* #1D8CF8 */
  --color-primary-hover:      var(--blue-700);
  --color-primary-active:     var(--blue-800);
  --color-primary-foreground: #ffffff;
  --color-primary-subtle:     rgba(29, 140, 248, 0.12);
  --color-primary-border:     rgba(29, 140, 248, 0.30);

  /* ── Secondary ── */
  --color-secondary:            var(--space-100);     /* #18263F */
  --color-secondary-hover:      var(--space-50);
  --color-secondary-foreground: var(--slate-100);

  /* ── Accent ── */
  --color-accent:             var(--violet-600);      /* #7C5CFC */
  --color-accent-hover:       var(--violet-700);
  --color-accent-foreground:  #ffffff;
  --color-accent-subtle:      rgba(124, 92, 252, 0.12);

  /* ── Semantic states ── */
  --color-success:            var(--green-500);       /* #10B981 */
  --color-success-foreground: #ffffff;
  --color-success-subtle:     rgba(16, 185, 129, 0.12);
  --color-success-border:     rgba(16, 185, 129, 0.30);

  --color-warning:            var(--amber-500);       /* #F59E0B */
  --color-warning-foreground: var(--slate-900);
  --color-warning-subtle:     rgba(245, 158, 11, 0.12);
  --color-warning-border:     rgba(245, 158, 11, 0.30);

  --color-error:              var(--red-500);         /* #EF4444 */
  --color-error-foreground:   #ffffff;
  --color-error-subtle:       rgba(239, 68, 68, 0.12);
  --color-error-border:       rgba(239, 68, 68, 0.30);

  --color-info:               var(--cyan-500);        /* #06B6D4 */
  --color-info-foreground:    #ffffff;
  --color-info-subtle:        rgba(6, 182, 212, 0.12);
  --color-info-border:        rgba(6, 182, 212, 0.30);

  /* ── Background & Surface ── */
  --color-background:         var(--space-400);       /* #070B14 */
  --color-surface:            var(--space-300);       /* #0D1526 */
  --color-surface-elevated:   var(--space-200);       /* #121E35 */
  --color-surface-overlay:    var(--space-100);       /* #18263F */
  --color-surface-inset:      rgba(255,255,255,0.03);

  /* ── Border ── */
  --color-border:             #1E2D4A;
  --color-border-strong:      #2A3F5F;
  --color-border-focus:       var(--blue-600);
  --color-border-error:       var(--red-500);

  /* ── Text ── */
  --color-text-primary:       var(--slate-100);       /* #F1F5F9 */
  --color-text-secondary:     var(--slate-400);       /* #94A3B8 */
  --color-text-tertiary:      var(--slate-500);       /* #64748B */
  --color-text-disabled:      var(--slate-700);       /* #334155 */
  --color-text-inverse:       var(--space-400);
  --color-text-on-primary:    #ffffff;
  --color-text-on-accent:     #ffffff;
  --color-text-link:          var(--blue-400);
  --color-text-link-hover:    var(--blue-300);

  /* ── Focus ── */
  --color-focus-ring:         var(--blue-600);
  --color-focus-ring-offset:  var(--space-400);

  /* ── Disabled ── */
  --color-disabled-bg:        var(--space-200);
  --color-disabled-text:      var(--slate-700);
  --color-disabled-border:    #1E2D4A;
}
```

### 1.3 Semantic Color Tokens — Light Theme

```css
[data-theme="light"] {
  /* ── Background & Surface ── */
  --color-background:         var(--slate-50);        /* #F8FAFC */
  --color-surface:            #ffffff;
  --color-surface-elevated:   var(--slate-100);       /* #F1F5F9 */
  --color-surface-overlay:    var(--slate-200);       /* #E2E8F0 */
  --color-surface-inset:      rgba(0,0,0,0.03);

  /* ── Border ── */
  --color-border:             var(--slate-200);       /* #E2E8F0 */
  --color-border-strong:      var(--slate-300);       /* #CBD5E1 */

  /* ── Text ── */
  --color-text-primary:       var(--slate-900);       /* #0F172A */
  --color-text-secondary:     var(--slate-600);       /* #475569 */
  --color-text-tertiary:      var(--slate-400);       /* #94A3B8 */
  --color-text-disabled:      var(--slate-300);
  --color-text-inverse:       var(--slate-50);
  --color-text-link:          var(--blue-600);
  --color-text-link-hover:    var(--blue-700);

  /* ── Focus ── */
  --color-focus-ring-offset:  #ffffff;

  /* ── Success subtle ── */
  --color-success-subtle:     #DCFCE7;
  --color-warning-subtle:     #FEF3C7;
  --color-error-subtle:       #FEE2E2;
  --color-info-subtle:        #CFFAFE;
  --color-primary-subtle:     #DBEAFE;
  --color-accent-subtle:      #EDE9FE;

  /* Primary, accent, and semantic state colors remain the same */
}
```

### 1.4 Viral Score Color Tokens

```css
:root {
  --vs-score-low:          var(--red-500);     /* 0–30:   #EF4444 */
  --vs-score-medium-low:   var(--orange-500);  /* 31–50:  #F97316 */
  --vs-score-medium:       #EAB308;            /* 51–69:  Yellow */
  --vs-score-high:         var(--teal-500);    /* 70–84:  #14B8A6 */
  --vs-score-exceptional:  var(--green-500);   /* 85–100: #10B981 */
}
```

### 1.5 Chart Color Tokens

```css
:root {
  --chart-1: var(--blue-600);    /* #1D8CF8 */
  --chart-2: var(--violet-600);  /* #7C5CFC */
  --chart-3: var(--green-500);   /* #10B981 */
  --chart-4: var(--amber-500);   /* #F59E0B */
  --chart-5: var(--cyan-500);    /* #06B6D4 */
  --chart-6: var(--red-500);     /* #EF4444 */
  --chart-7: var(--teal-500);    /* #14B8A6 */
  --chart-8: var(--orange-500);  /* #F97316 */
}
```

---

## 2. Typography Tokens

### 2.1 Font Family Tokens

```css
:root {
  --font-sans:  'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:  'JetBrains Mono', ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  --font-display: var(--font-sans);  /* Same as sans; override for marketing if needed */
}
```

### 2.2 Font Size Tokens

```css
:root {
  --text-xs:   0.625rem;   /* 10px — overline */
  --text-sm:   0.75rem;    /* 12px — caption, label */
  --text-base: 0.8125rem;  /* 13px — body-sm */
  --text-md:   0.875rem;   /* 14px — body (default) */
  --text-lg:   1rem;       /* 16px — body-lg */
  --text-xl:   1.125rem;   /* 18px — h5 */
  --text-2xl:  1.25rem;    /* 20px — h4 */
  --text-3xl:  1.5rem;     /* 24px — h3 */
  --text-4xl:  1.875rem;   /* 30px — h2 */
  --text-5xl:  2.25rem;    /* 36px — h1 */
  --text-6xl:  3rem;       /* 48px — display */
}
```

### 2.3 Font Weight Tokens

```css
:root {
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;
}
```

### 2.4 Line Height Tokens

```css
:root {
  --leading-none:    1;
  --leading-tight:   1.2;
  --leading-snug:    1.3;
  --leading-normal:  1.5;
  --leading-relaxed: 1.57;
  --leading-loose:   1.6;
}
```

### 2.5 Letter Spacing Tokens

```css
:root {
  --tracking-tighter: -0.05em;
  --tracking-tight:   -0.025em;
  --tracking-normal:  0em;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
}
```

### 2.6 Composite Text Style Tokens

```css
:root {
  /* Composite styles bundle font-size + line-height + weight */
  --style-display:   var(--font-bold) var(--text-6xl)/var(--leading-tight) var(--font-sans);
  --style-h1:        var(--font-bold) var(--text-5xl)/var(--leading-tight) var(--font-sans);
  --style-h2:        var(--font-bold) var(--text-4xl)/var(--leading-snug) var(--font-sans);
  --style-h3:        var(--font-semibold) var(--text-3xl)/var(--leading-snug) var(--font-sans);
  --style-h4:        var(--font-semibold) var(--text-2xl)/1.35 var(--font-sans);
  --style-h5:        var(--font-semibold) var(--text-xl)/1.4 var(--font-sans);
  --style-body-lg:   var(--font-normal) var(--text-lg)/var(--leading-loose) var(--font-sans);
  --style-body:      var(--font-normal) var(--text-md)/var(--leading-relaxed) var(--font-sans);
  --style-body-sm:   var(--font-normal) var(--text-base)/var(--leading-normal) var(--font-sans);
  --style-caption:   var(--font-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  --style-label:     var(--font-medium) var(--text-sm)/1 var(--font-sans);
  --style-overline:  var(--font-semibold) var(--text-xs)/var(--leading-loose) var(--font-sans);
  --style-code:      var(--font-normal) var(--text-md)/var(--leading-loose) var(--font-mono);
  --style-code-sm:   var(--font-normal) var(--text-sm)/var(--leading-loose) var(--font-mono);
}
```

---

## 3. Spacing Tokens

### 3.1 Base Spacing Scale

The spacing scale is built on a **4px base unit**. All spacing values are multiples of 4px.

```css
:root {
  --space-0:   0px;
  --space-px:  1px;
  --space-0_5: 2px;
  --space-1:   4px;
  --space-1_5: 6px;
  --space-2:   8px;
  --space-2_5: 10px;
  --space-3:   12px;
  --space-3_5: 14px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-7:   28px;
  --space-8:   32px;
  --space-9:   36px;
  --space-10:  40px;
  --space-11:  44px;
  --space-12:  48px;
  --space-14:  56px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32:  128px;
  --space-40:  160px;
  --space-48:  192px;
  --space-64:  256px;
}
```

### 3.2 Semantic Spacing Tokens

```css
:root {
  /* Component internal padding */
  --spacing-component-xs:  var(--space-2);   /* 8px  — tight components */
  --spacing-component-sm:  var(--space-3);   /* 12px — compact components */
  --spacing-component-md:  var(--space-4);   /* 16px — default component padding */
  --spacing-component-lg:  var(--space-6);   /* 24px — comfortable cards */
  --spacing-component-xl:  var(--space-8);   /* 32px — spacious panels */

  /* Gaps between sibling elements */
  --spacing-gap-xs:  var(--space-1);   /* 4px  — inline icon-to-text */
  --spacing-gap-sm:  var(--space-2);   /* 8px  — tight element groups */
  --spacing-gap-md:  var(--space-4);   /* 16px — standard element gap */
  --spacing-gap-lg:  var(--space-6);   /* 24px — section element gap */
  --spacing-gap-xl:  var(--space-8);   /* 32px — large section gap */

  /* Page layout */
  --spacing-page-x:    var(--space-6);   /* 24px — horizontal page margin */
  --spacing-page-y:    var(--space-8);   /* 32px — vertical page margin */
  --spacing-section:   var(--space-12);  /* 48px — between page sections */

  /* Touch targets */
  --spacing-touch-min: var(--space-11);  /* 44px — minimum touch target */
}
```

### 3.3 Grid Spacing Tokens

```css
:root {
  --grid-columns:     12;
  --grid-gutter-sm:   var(--space-4);   /* 16px — mobile */
  --grid-gutter-md:   var(--space-5);   /* 20px — tablet */
  --grid-gutter-lg:   var(--space-6);   /* 24px — desktop */
  --grid-margin-sm:   var(--space-4);   /* 16px — mobile side margins */
  --grid-margin-md:   var(--space-6);   /* 24px — tablet side margins */
  --grid-margin-lg:   var(--space-8);   /* 32px — desktop side margins */
}
```

---

## 4. Layout Tokens

### 4.1 Breakpoint Tokens

```css
/* CSS custom properties can't be used in media queries — define as Tailwind values */
/* Breakpoints for reference (use Tailwind responsive prefixes in code) */
:root {
  --bp-xs:  0px;      /* Default (mobile portrait) */
  --bp-sm:  640px;    /* sm: — mobile landscape / small tablet */
  --bp-md:  768px;    /* md: — tablet portrait */
  --bp-lg:  1024px;   /* lg: — tablet landscape / laptop */
  --bp-xl:  1280px;   /* xl: — desktop (primary target) */
  --bp-2xl: 1536px;   /* 2xl: — wide desktop */
}
```

```typescript
// tailwind.config.ts — breakpoint definition
screens: {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
}
```

### 4.2 Container Width Tokens

```css
:root {
  --container-sm:   640px;
  --container-md:   768px;
  --container-lg:  1024px;
  --container-xl:  1280px;
  --container-2xl: 1536px;

  /* Application shell dimensions */
  --sidebar-width:           240px;
  --sidebar-collapsed-width:  56px;
  --topbar-height:            64px;
  --settings-sidebar-width:  220px;
}
```

### 4.3 Border Radius Tokens

```css
:root {
  --radius-none:   0px;
  --radius-sm:     4px;    /* Badges, thumbnails, small elements */
  --radius-md:     6px;    /* Buttons, inputs (default) */
  --radius-lg:     8px;    /* Cards, dropdowns */
  --radius-xl:     12px;   /* Modals, larger panels */
  --radius-2xl:    16px;   /* Large cards, feature panels */
  --radius-full:   9999px; /* Pills, avatars, circular elements */
}
```

### 4.4 Shadow Tokens

```css
:root {
  --shadow-none:  none;
  --shadow-sm:    0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md:    0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg:    0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --shadow-xl:    0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  --shadow-2xl:   0 25px 50px -12px rgba(0, 0, 0, 0.6);

  /* Coloured glow shadows for special elements */
  --shadow-primary: 0 0 0 3px rgba(29, 140, 248, 0.25);
  --shadow-focus:   0 0 0 2px var(--color-background), 0 0 0 4px var(--color-focus-ring);
}

/* Light theme: lighter shadows */
[data-theme="light"] {
  --shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.05);
  --shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
}
```

### 4.5 Z-Index Scale Tokens

```css
:root {
  --z-below:      -1;
  --z-base:        0;
  --z-raised:     10;   /* Cards, sticky table headers */
  --z-dropdown:   100;  /* Dropdown menus, popovers */
  --z-sticky:     200;  /* Sticky elements (topbar) */
  --z-overlay:    300;  /* Drawer backdrops */
  --z-modal:      400;  /* Modal dialogs */
  --z-toast:      500;  /* Toast notifications (above modals) */
  --z-tooltip:    600;  /* Tooltips (highest layer) */
}
```

### 4.6 Opacity Tokens

```css
:root {
  --opacity-0:       0;
  --opacity-5:       0.05;
  --opacity-10:      0.10;
  --opacity-20:      0.20;
  --opacity-30:      0.30;
  --opacity-40:      0.40;
  --opacity-50:      0.50;
  --opacity-60:      0.60;
  --opacity-70:      0.70;
  --opacity-75:      0.75;
  --opacity-80:      0.80;
  --opacity-90:      0.90;
  --opacity-95:      0.95;
  --opacity-100:     1;

  /* Semantic opacity tokens */
  --opacity-disabled:  0.40;
  --opacity-overlay:   0.60;
  --opacity-backdrop:  0.80;
}
```

---

## 5. Motion Tokens

### 5.1 Duration Tokens

```css
:root {
  --duration-instant:  0ms;
  --duration-fast:     100ms;   /* Colour transitions, focus rings */
  --duration-normal:   200ms;   /* Show/hide, tooltips, dropdowns */
  --duration-moderate: 300ms;   /* Page transitions, route changes */
  --duration-slow:     400ms;   /* Modals, drawers */
  --duration-slower:   500ms;   /* Chart animations (first render) */
  --duration-slowest:  1000ms;  /* Viral Score gauge sweep */
}
```

### 5.2 Easing Tokens

```css
:root {
  --ease-linear:   linear;
  --ease-in:       cubic-bezier(0.4, 0, 1, 1);
  --ease-out:      cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-default:  cubic-bezier(0.16, 1, 0.3, 1);   /* Snappy ease-out */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Slight overshoot */
  --ease-bounce:   cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

### 5.3 Transition Tokens (Composite)

```css
:root {
  --transition-colour:    color var(--duration-fast) var(--ease-out),
                          background-color var(--duration-fast) var(--ease-out),
                          border-color var(--duration-fast) var(--ease-out),
                          fill var(--duration-fast) var(--ease-out);

  --transition-shadow:    box-shadow var(--duration-fast) var(--ease-out);

  --transition-transform: transform var(--duration-normal) var(--ease-default);

  --transition-opacity:   opacity var(--duration-normal) var(--ease-out);

  --transition-all:       all var(--duration-normal) var(--ease-out);

  /* Common UI transitions */
  --transition-button:    var(--transition-colour), var(--transition-shadow);
  --transition-modal:     opacity var(--duration-slow) var(--ease-default),
                          transform var(--duration-slow) var(--ease-default);
  --transition-drawer:    transform var(--duration-slow) var(--ease-default);
  --transition-tooltip:   opacity var(--duration-fast) var(--ease-out);
}
```

### 5.4 Animation Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(4px); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(var(--space-4)); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(calc(-1 * var(--space-4))); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}

@keyframes scoreReveal {
  from { stroke-dashoffset: var(--score-circumference); }
  to   { stroke-dashoffset: var(--score-offset); }
}
```

### 5.5 Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration:       0.01ms !important;
    animation-iteration-count: 1     !important;
    transition-duration:      0.01ms !important;
    scroll-behavior:          auto   !important;
  }

  /* Override specific keyframe animations that carry semantic meaning */
  @keyframes spin {
    /* Keep spin for loading indicators — but make it instant */
    to { transform: rotate(360deg); }
  }
}
```

---

## 6. Token Governance

### 6.1 Naming Conventions

| Rule | Example |
|---|---|
| All token names use kebab-case | `--color-text-primary` not `--colorTextPrimary` |
| All tokens prefixed with category | `--color-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--duration-*`, `--ease-*` |
| Semantic tokens describe purpose, not appearance | `--color-error` not `--color-red` |
| Primitive tokens describe value | `--blue-600`, `--space-4` |
| Composite tokens describe the combination | `--transition-button`, `--style-body` |
| Dark/light variants managed via `[data-theme]` selector, not separate token names | One `--color-background` token; value changes per theme |

### 6.2 Token Usage Rules

| Rule | Enforcement |
|---|---|
| **Components use semantic tokens only** — never primitive values | ESLint rule: no raw hex values in component files |
| **No inline styles with raw values** — use Tailwind utilities (which reference tokens) | ESLint: no `style={{ color: "#1D8CF8" }}` |
| **No Tailwind arbitrary values for design system properties** — use defined tokens | ESLint: restrict `text-[#1D8CF8]` syntax |
| **New semantic tokens must be added to both dark and light themes** | PR template checklist |
| **Token values must be tested in both themes before shipping** | Design review checklist |

### 6.3 Versioning

Token changes follow semantic versioning:

| Change type | Version bump | Example |
|---|---|---|
| New token added (backward-compatible) | Minor | Adding `--color-primary-subtle` |
| Token renamed | Major (breaking) | Renaming `--color-bg` to `--color-background` |
| Token value changed | Minor if intentional, Patch if bug fix | Adjusting `--blue-600` to pass contrast check |
| Token removed | Major (breaking) | Must deprecate for one release cycle first |

### 6.4 Deprecation Policy

When a token is deprecated:

1. Add a CSS comment: `/* @deprecated: use --color-primary instead */`
2. Keep the deprecated token for one full release cycle (typically 1 month)
3. Add to `CHANGELOG.md` under the next version entry
4. Remove in the following release

```css
/* Example deprecated token */
--vs-primary: var(--color-primary); /* @deprecated since v1.1.0: use --color-primary */
```

### 6.5 Usage Guidelines

**When to use a semantic token vs a Tailwind utility:**

| Scenario | Approach |
|---|---|
| Standard UI colour | Tailwind utility: `bg-surface text-primary` (mapped to tokens in `tailwind.config.ts`) |
| Dynamic colour from JavaScript | CSS variable: `style={{ color: "var(--color-primary)" }}` |
| CSS animation/keyframe | CSS variable directly in stylesheet |
| Design token not in Tailwind config | CSS variable: `var(--duration-slowest)` |

**Tailwind Token Mapping (tailwind.config.ts summary):**

All semantic token names are mapped into Tailwind via the `extend.colors`, `extend.spacing`, `extend.borderRadius`, `extend.boxShadow`, and `extend.transitionDuration` keys, so standard Tailwind utility classes like `bg-primary`, `text-error`, `rounded-lg`, `shadow-md`, and `duration-normal` resolve to the correct design token values.
