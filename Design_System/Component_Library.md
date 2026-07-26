# Component_Library.md
# ViralScopes.io — Component Library

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Base:** shadcn/ui (Radix UI primitives) · Tailwind CSS · Design tokens from [Design_Tokens.md](./Design_Tokens.md)
> **Cross-references:** [UI_Design_System.md](./UI_Design_System.md) · [Design_Tokens.md](./Design_Tokens.md) · [Accessibility.md](./Accessibility.md) · [Frontend_Architecture.md](./Frontend_Architecture.md)

---

> This document is the **implementation reference** for every reusable UI component. For visual specifications and design rationale, see [UI_Design_System.md](./UI_Design_System.md). For design tokens, see [Design_Tokens.md](./Design_Tokens.md). For accessibility requirements, see [Accessibility.md](./Accessibility.md).

---

## Component Categories

1. [Buttons](#1-buttons)
2. [Forms](#2-forms)
3. [Navigation](#3-navigation)
4. [Data Display](#4-data-display)
5. [Tables](#5-tables)
6. [Charts](#6-charts)
7. [Cards](#7-cards)
8. [Modals & Drawers](#8-modals--drawers)
9. [Tabs & Menus](#9-tabs--menus)
10. [Tooltips](#10-tooltips)
11. [Alerts](#11-alerts)
12. [Toasts](#12-toasts)
13. [Badges & Chips](#13-badges--chips)
14. [Avatars](#14-avatars)
15. [Skeleton Loaders](#15-skeleton-loaders)
16. [Empty States](#16-empty-states)
17. [Loaders](#17-loaders)
18. [Composition Patterns](#18-composition-patterns)

---

## 1. Buttons

**File:** `components/ui/button.tsx`

**Purpose:** Trigger an action or navigate to a new location.

### Variants

| Variant | Class names | Use case |
|---|---|---|
| `primary` | `bg-primary text-white hover:bg-primary/90` | The main action on a page. One per page. |
| `secondary` | `bg-secondary text-secondary-foreground hover:bg-secondary/80` | Alternative or secondary actions |
| `outline` | `border border-border bg-transparent hover:bg-surface-overlay` | Less prominent actions alongside a primary |
| `ghost` | `hover:bg-surface-overlay` | Toolbar actions, icon buttons, navigation items |
| `destructive` | `bg-error text-white hover:bg-error/90` | Irreversible actions: Delete, Revoke, Cancel subscription |
| `link` | `text-primary underline-offset-4 hover:underline` | Inline text actions within prose |

### Sizes

| Size | Height | Padding | Font size |
|---|---|---|---|
| `sm` | 32px | `px-3 py-1.5` | 13px |
| `md` (default) | 40px | `px-4 py-2` | 14px |
| `lg` | 48px | `px-6 py-3` | 16px |
| `icon` (square) | 40×40px | `p-2` | — |

### States

- **Default:** Base variant styles
- **Hover:** 10% darker background or `bg-surface-overlay`
- **Active:** 15% darker + slight scale down (`scale-[0.98]`)
- **Focus-visible:** `ring-2 ring-primary ring-offset-2` (matches global focus token)
- **Disabled:** `opacity-50 cursor-not-allowed pointer-events-none`
- **Loading:** Spinner replaces or precedes label; `aria-busy="true" aria-disabled="true"` set on the button element; `disabled` attribute set

### Accessibility

- Always `<button>` element — never `<div>` or `<span>` for clickable actions
- `disabled` attribute set (not just visual opacity) when disabled
- Icon-only buttons require `aria-label` attribute
- Loading state: `aria-busy="true"` + visually hidden "Loading…" text for screen readers

### Do's and Don'ts

✅ One primary button per page (the most important action)
✅ Label describes the action: "Create Watchlist", "Export CSV"
✅ Use `destructive` variant for any irreversible action
❌ Don't use `onClick` on `<div>` or `<span>` elements
❌ Don't use "Click here" or "Submit" as button labels
❌ Don't place more than 2 buttons side-by-side in most contexts

---

## 2. Forms

### 2.1 Input

**File:** `components/ui/input.tsx`

**Purpose:** Single-line text entry.

**Variants:** `default`, `search` (prefix search icon), `password` (suffix toggle)

**States:** default, focus (ring-2 ring-primary), filled, error (ring-error + red border), disabled

**Anatomy:**
```
[Label (above)]
[Prefix icon?] [ Input field                    ] [Suffix action?]
[Helper text / Error message (below)]
```

**Accessibility:** `id` matches `htmlFor` on label; `aria-invalid` + `aria-describedby` linking to error message; `aria-required` on required fields.

**Responsive:** Full width by default. Width constrained by parent container.

---

### 2.2 Textarea

**File:** `components/ui/textarea.tsx`

**Purpose:** Multi-line text entry.

**Auto-resize:** Grows vertically with content up to a `max-height`, then scrolls internally.

**Character count:** Displayed in bottom-right when `maxLength` is set.

**States:** Same as Input.

---

### 2.3 Select

**File:** `components/ui/select.tsx` (Radix UI Select)

**Purpose:** Choose one option from ≤ 10 predefined options. For ≥ 10 options or searchable selection, use `Combobox` pattern.

**Accessibility:** Full keyboard navigation (arrow keys, typing to jump to option); `role="listbox"` on list, `role="option"` on items; `aria-selected` on active option.

---

### 2.4 Combobox (Searchable Select)

**File:** `components/ui/combobox.tsx`

**Purpose:** Searchable dropdown for large option sets (categories, languages, watchlist targets).

**Pattern:** `<Input>` + `<Popover>` + virtual list of `<Command>` items.

**Keyboard:** Type to filter; arrow keys to navigate; Enter to select; Escape to close.

---

### 2.5 Checkbox

**File:** `components/ui/checkbox.tsx` (Radix UI Checkbox)

**Supports:** Checked, unchecked, and **indeterminate** state (for "select all" in tables).

**Rules:** Always paired with a visible `<Label>`. Clicking the label activates the checkbox.

---

### 2.6 Switch

**File:** `components/ui/switch.tsx` (Radix UI Switch)

**Purpose:** Toggle a binary setting that takes immediate effect (e.g. alert rule active/inactive).

**When to use Switch vs Checkbox:**
- Switch: immediate effect, no form submit needed
- Checkbox: form field submitted with a form

**Accessibility:** `role="switch"` + `aria-checked` set automatically by Radix.

---

### 2.7 Form Layout Wrapper

**Pattern:** All forms use a consistent vertical layout:

```tsx
<form onSubmit={handleSubmit}>
  {/* Form-level error */}
  {formError && <Alert variant="error">{formError}</Alert>}

  <div className="space-y-4">
    <FormField name="name" label="Watchlist name" required>
      <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
      <FormError error={errors.name} />
    </FormField>
  </div>

  <div className="flex justify-end gap-3 pt-4">
    <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
    <Button variant="primary" type="submit" disabled={isSubmitting}>
      {isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : null}
      Create Watchlist
    </Button>
  </div>
</form>
```

---

## 3. Navigation

### 3.1 Sidebar

**File:** `components/layout/Sidebar.tsx`

**Purpose:** Primary navigation for the dashboard.

**Behaviour:** 240px wide (expanded) | 56px (collapsed, icon-only) | Hidden (mobile, opens as drawer)

**States per nav item:**
- Default: muted text, no background
- Hover: `bg-surface-overlay`
- Active (current route): Left border 3px primary + slightly elevated background + primary text

**Accessibility:** `<nav aria-label="Main navigation">`; `aria-current="page"` on active item.

---

### 3.2 Topbar

**File:** `components/layout/Topbar.tsx`

**Contents:** Breadcrumb (left) | Search trigger (centre-right) | Notifications bell | User avatar + menu

**Height:** 64px (`var(--topbar-height)`)

**Sticky:** `position: sticky; top: 0; z-index: var(--z-sticky)`

---

### 3.3 Breadcrumb

**File:** `components/ui/breadcrumb.tsx`

**Pattern:**
```
Home / Videos / How I Saved £10,000 in 6 Months
```

**Accessibility:** `<nav aria-label="Breadcrumb">` + `aria-current="page"` on last item; last item is not a link.

---

## 4. Data Display

### 4.1 ViralScoreBadge (Custom)

**File:** `components/common/ViralScoreBadge.tsx`

**Purpose:** Display a Viral Score with colour coding based on the score range.

**Props:**
```typescript
interface ViralScoreBadgeProps {
  score: number;           // 0–100
  confidence?: number;     // 0–1
  size?: "sm" | "md" | "lg";
  showConfidence?: boolean;
}
```

**Colour mapping:**
- 0–30: `text-error` + red background tint
- 31–50: `text-orange-500` + orange tint
- 51–69: `text-yellow-500` + yellow tint
- 70–84: `text-teal-500` + teal tint
- 85–100: `text-success` + green tint

**Accessibility:** `role="status"` + `aria-label="Viral Score: 87.4 — Above average"`

**Do:** Always show the numeric value alongside the colour
**Don't:** Rely on colour alone to communicate the score level

---

### 4.2 HookTypeBadge (Custom)

**File:** `components/common/HookTypeBadge.tsx`

**Purpose:** Display a hook type classification as an outline badge.

**Supported types:** `question`, `shock`, `statistic`, `fear`, `story`, `mystery`, `promise`, `curiosity`, `humour`

**Visual:** Outline badge with capitalised hook type label and a relevant icon.

---

### 4.3 TrendStatusBadge (Custom)

**File:** `components/common/TrendStatusBadge.tsx`

**Purpose:** Display a trend status with icon and colour.

| Status | Colour | Icon |
|---|---|---|
| Emerging | Green | `Flame` |
| Evergreen | Teal | `Leaf` |
| Declining | Amber | `TrendingDown` |

---

### 4.4 StatCard (Custom)

**File:** `components/common/StatCard.tsx`

**Purpose:** KPI card with label, value, and delta.

```tsx
<StatCard
  label="Videos Analysed"
  value="4,821"
  delta="+312 this week"
  deltaDirection="up"
  icon={<VideoIcon className="h-5 w-5" />}
/>
```

**Responsive:** Full width on mobile, 1/4 width on desktop (via CSS Grid).

---

### 4.5 Pagination

**File:** `components/common/Pagination.tsx`

**Pattern:** Cursor-based (Previous / Next with count display):
```
Showing 26–50 of 4,821 results    [← Previous]  [Next →]
```

**Accessibility:** `<nav aria-label="Results pagination">`; disabled buttons use `aria-disabled="true"`.

---

## 5. Tables

**File:** `components/common/DataTable.tsx`

**Purpose:** Display structured data with sorting, filtering, and row actions.

**Features:**
- Sortable columns with `aria-sort` on `<th>`
- Row selection with indeterminate checkbox in header
- Sticky header on scroll
- Bulk action bar (appears when rows are selected)
- Dropdown row actions menu (three-dot, appears on hover)
- Responsive: scrollable on mobile; key columns prioritised

**Accessibility:**
- `<table>` element (not `<div>` grid)
- `<caption>` or `aria-label` describing the table
- `scope="col"` on column headers
- `scope="row"` on row headers (if applicable)
- Sort state: `aria-sort="ascending"` | `"descending"` | `"none"` on sortable headers

**Do:** Use for tabular data with > 4 columns
**Don't:** Use table for layout purposes

---

## 6. Charts

All charts wrap Recharts components with ViralScopes design tokens applied. No raw Recharts usage in page/feature components — always use these wrappers.

**Common props (all chart wrappers):**
```typescript
interface ChartProps {
  data: unknown[];
  isLoading?: boolean;
  isEmpty?: boolean;
  height?: number;
  className?: string;
  aria-label: string;  // Required for accessibility
}
```

### 6.1 LineChart

**File:** `components/charts/LineChart.tsx`

**Usage:** Trend over time (viral scores, view growth, subscriber growth)

**Accessibility:** `role="img"` + `aria-label`; "View as table" toggle button

### 6.2 BarChart

**File:** `components/charts/BarChart.tsx`

**Usage:** Comparison across categories (hook type distribution, title formula breakdown)

### 6.3 AreaChart

**File:** `components/charts/AreaChart.tsx`

**Usage:** Trend velocity (filled area under the line for visual weight)

### 6.4 SparkLine

**File:** `components/charts/SparkLine.tsx`

**Usage:** Mini trend in KPI cards (30-day history in a small inline chart)

**No axes, no tooltips** — purely visual trend indicator. `aria-hidden="true"` (not informative alone; the number is the primary label).

### 6.5 ViralScoreGauge

**File:** `components/charts/ViralScoreGauge.tsx`

**Usage:** Video detail page — full breakdown of the viral score

**Animation:** Needle sweeps from 0 to score value on first render (1,000ms, spring easing). Instant when `prefers-reduced-motion` is active.

**Accessibility:** `role="meter"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` + `aria-label`

---

## 7. Cards

**File:** `components/ui/card.tsx`

### Variants

| Variant | Usage |
|---|---|
| `default` | Standard content container |
| `stat` | KPI display (wraps `StatCard`) |
| `interactive` | Clickable card (video result, trend card) — hover border + cursor-pointer |
| `highlighted` | Selected or featured state — primary border |

**Responsive:** Cards stack to full-width on mobile; auto-fit grid on desktop.

**Accessibility:** Interactive cards use `<article>` or `<li>` as appropriate. Clickable cards have a visible focus indicator and keyboard activation via `onKeyDown`.

---

## 8. Modals & Drawers

### 8.1 Modal (Dialog)

**File:** `components/ui/dialog.tsx` (Radix UI Dialog)

**Purpose:** Requires user action before they can continue.

**Sizes:** `sm` (400px), `md` (560px — default), `lg` (800px)

**Behaviour:**
- Focus trapped inside while open
- Escape key closes (except destructive confirmation)
- Backdrop click closes (except destructive confirmation)
- `aria-labelledby` pointing to the dialog title
- On open: focus moves to first focusable element
- On close: focus returns to the trigger

**Types:**

| Type | Backdrop close | Escape close |
|---|---|---|
| Information | Yes | Yes |
| Form | Yes | Yes |
| Confirmation (destructive) | No | Yes (cancels) |

---

### 8.2 Drawer

**File:** `components/ui/sheet.tsx` (shadcn Sheet = Radix Dialog with slide animation)

**Purpose:** Slide-in panel for secondary content, filter panels, and mobile navigation.

**Positions:** `right` (default for detail panels) | `left` (mobile navigation) | `bottom` (mobile action sheets)

**Width:** `right`/`left`: 400px on desktop, full-width on mobile. `bottom`: full-width, auto-height.

---

## 9. Tabs & Menus

### 9.1 Tabs

**File:** `components/ui/tabs.tsx` (Radix UI Tabs)

**Variants:**
- `underline` (default) — thin underline on active tab; page-level navigation
- `pill` — filled background on active tab; compact filter tabs

**Accessibility:** Arrow key navigation between tabs; `role="tablist"`, `role="tab"`, `role="tabpanel"` all set by Radix.

---

### 9.2 Dropdown Menu

**File:** `components/ui/dropdown-menu.tsx` (Radix UI DropdownMenu)

**Purpose:** Context actions for a resource (three-dot menu on table rows and cards).

**Rules:**
- Max 7 items before using a divider for grouping
- Destructive items always at the bottom, separated by a divider, in `text-error`
- No nested dropdowns (max 1 level deep)

**Keyboard:** Arrow keys navigate; Enter/Space activates; Escape closes.

---

### 9.3 Context Menu

**File:** `components/ui/context-menu.tsx` (Radix UI ContextMenu)

**Usage:** Right-click context on table rows (optional — keyboard users must still have access to actions).

---

## 10. Tooltips

**File:** `components/ui/tooltip.tsx` (Radix UI Tooltip)

**Purpose:** Supplementary information shown on hover/focus. Never used for critical information.

**Behaviour:**
- Open delay: 400ms
- Close delay: 100ms
- Auto-placed to avoid viewport edges
- Max width: 240px

**Rules:**
- The trigger element must be keyboard-focusable
- Tooltip content supplements — never replaces — visible labels
- Don't put interactive elements inside a tooltip

**Accessibility:** Tooltip content is linked to trigger via `aria-describedby`.

---

## 11. Alerts

**File:** `components/ui/alert.tsx`

**Purpose:** Communicate system-level status or important contextual information within the page.

**Variants:** `info`, `success`, `warning`, `error`

**Anatomy:**
```
[Icon] [Title (bold)] [Dismiss button?]
       [Description text]
       [Action link/button (optional)]
```

**Accessibility:**
- `role="alert"` for `error` and `warning` (announced immediately)
- `role="status"` for `info` and `success` (polite announcement)
- Icon is `aria-hidden="true"` (decorative — meaning carried by text)

**Do:** Use for system states (API errors, quota warnings, feature unavailability)
**Don't:** Use for transient feedback — that's what Toasts are for

---

## 12. Toasts

**File:** `components/ui/toast.tsx` (Sonner or Radix Toast)

**Purpose:** Brief, non-blocking feedback that auto-dismisses.

**Variants:** `success`, `error`, `warning`, `info`, `loading` (persistent)

**Placement:** Bottom-right on desktop; bottom-centre on mobile.

**Auto-dismiss durations:**
- Success / Info: 4 seconds
- Warning: 6 seconds
- Error: 8 seconds
- Loading: persistent until resolved/dismissed

**Accessibility:** `role="status"` for success/info; `role="alert"` for errors. Focus is never stolen. A close button is always visible.

**Maximum visible:** 3 toasts. Older ones are dismissed as new ones arrive.

---

## 13. Badges & Chips

### 13.1 Badge

**File:** `components/ui/badge.tsx`

**Purpose:** Short metadata label attached to an item (status, category, plan tier).

**Variants:** `default`, `primary`, `success`, `warning`, `error`, `outline`

**Size:** Fixed small (12px text, 20px height). No size variants.

**Accessibility:** Purely presentational when paired with visible text. When used alone as the sole information carrier, add `aria-label`.

---

### 13.2 Chip (Filter Chip)

**File:** `components/common/Chip.tsx`

**Purpose:** Selectable filter options (horizontal scrolling filter bars).

**States:** Default (outline), Selected (filled primary background), Disabled

**With remove button:** Shows ✕ button when `onRemove` prop is provided (for applied filter chips).

---

## 14. Avatars

**File:** `components/ui/avatar.tsx` (Radix UI Avatar)

**Purpose:** User or organisation avatar.

**Fallback:** Displays user initials on a deterministically coloured background when no image is available.

**Sizes:** `sm` (24px), `md` (32px — default), `lg` (40px), `xl` (64px)

**Accessibility:** `alt` text on the image; fallback text is `aria-hidden` (initials are decorative when the user's name is visible nearby).

---

## 15. Skeleton Loaders

**File:** `components/ui/skeleton.tsx`

**Purpose:** Placeholder UI matching the shape of content while loading.

**Animation:** `animate-pulse` (fade in/out) — disabled when `prefers-reduced-motion`.

**Rules:**
- Skeleton shape must approximate the content it replaces (same height, proportional widths)
- `aria-busy="true"` on the container; `aria-label="Loading..."` for screen readers
- Never show a skeleton AND a spinner for the same content area

**Common skeleton presets:**

```tsx
// Stat card skeleton
<div className="space-y-2 p-4 rounded-lg border border-border bg-surface-elevated">
  <Skeleton className="h-3 w-24" />
  <Skeleton className="h-8 w-16" />
  <Skeleton className="h-3 w-20" />
</div>

// Table row skeleton
<div className="flex items-center gap-4 py-3">
  <Skeleton className="h-4 w-4 rounded" />          {/* Checkbox */}
  <Skeleton className="h-9 w-16 rounded" />          {/* Thumbnail */}
  <Skeleton className="h-4 flex-1 max-w-xs" />       {/* Title */}
  <Skeleton className="h-6 w-12 rounded-full" />     {/* Badge */}
</div>
```

---

## 16. Empty States

**File:** `components/common/EmptyState.tsx`

**Purpose:** Communicate that a section has no content and guide the user to fix it.

**Anatomy:**
```
[Optional icon — 48px, text-tertiary]
[Heading — "No videos here yet"]
[Body — "Add a watchlist to start discovering..."]
[Primary action button (optional)]
[Secondary link (optional)]
```

**Two types:**
1. **"Nothing yet"** — User hasn't created anything. CTA creates the first item.
2. **"No results"** — Filters applied; no matches. CTA clears filters.

**Accessibility:** Heading uses `<h2>` or `<h3>` depending on context. The icon is `aria-hidden="true"`.

**Do:** Be specific about what's empty and what to do
**Don't:** Say "No data" or "Nothing here" without guidance

---

## 17. Loaders

### 17.1 Spinner

**File:** `components/ui/spinner.tsx`

**Usage:** Button loading state, inline loading within a component.

**Sizes:** `sm` (16px), `md` (20px — default), `lg` (32px)

**Accessibility:** `aria-label="Loading"` + `role="status"` on the spinner element.

### 17.2 Progress Bar

**File:** `components/ui/progress.tsx` (Radix UI Progress)

**Usage:** Export generation progress, background job progress, quota usage bars.

**Accessibility:** `role="progressbar"` + `aria-valuenow` + `aria-valuemin` + `aria-valuemax` set by Radix.

### 17.3 Page Loading

When an entire page or section is loading (not just a component), use a skeleton layout matching the page structure rather than a full-page spinner. Spinners are for small, inline loading contexts only.

---

## 18. Composition Patterns

### 18.1 The PageHeader Pattern

Used on all main dashboard pages:

```tsx
function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-h3 font-semibold text-text-primary">{title}</h1>
        {description && (
          <p className="text-body text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
```

### 18.2 The FilterBar Pattern

Consistent filter UI above data tables:

```tsx
function FilterBar({ children, onClear, hasActiveFilters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <SearchInput className="w-64" />
      {children}  {/* Filter dropdowns */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
```

### 18.3 The FormField Pattern

Consistent form field with label, input, and error:

```tsx
function FormField({
  name, label, required, children, error
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className={required ? "after:content-['*'] after:text-error after:ml-0.5" : ""}>
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-caption text-error flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### 18.4 The ContentGate Pattern

Wraps content that requires a specific plan:

```tsx
<PlanGate requiredPlan="professional" fallback={<UpgradePrompt feature="api_access" />}>
  <ApiKeySection />
</PlanGate>
```

### 18.5 Avoiding Component Duplication

Before creating a new component:

1. Check `components/ui/` — does a shadcn component already exist?
2. Check `components/common/` — is there a project-specific component?
3. Check `components/charts/` — is it a chart variant?
4. If a new component is truly needed, add it to the appropriate directory and document it in this file before or alongside the PR.
