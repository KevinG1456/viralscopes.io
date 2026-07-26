# Accessibility.md
# ViralScopes.io — Accessibility Guide

> **Version:** 1.0 | **Last Updated:** 2026-07-20
> **Standard:** WCAG 2.2 Level AA
> **Cross-references:** [UI_Design_System.md](./UI_Design_System.md) · [Design_Tokens.md](./Design_Tokens.md) · [Component_Library.md](./Component_Library.md) · [Frontend_Architecture.md](./Frontend_Architecture.md)

---

## Table of Contents

1. [Accessibility Goals](#1-accessibility-goals)
2. [Keyboard Accessibility](#2-keyboard-accessibility)
3. [Screen Reader Support](#3-screen-reader-support)
4. [Visual Accessibility](#4-visual-accessibility)
5. [Accessible Components](#5-accessible-components)
6. [Accessibility Testing](#6-accessibility-testing)
7. [Compliance Reference](#7-compliance-reference)

---

## 1. Accessibility Goals

### WCAG 2.2 Level AA Commitment

ViralScopes.io commits to meeting WCAG 2.2 Level AA on all pages, features, and emails shipped to customers. This is not a compliance checkbox — it is a quality standard. An interface that fails accessibility fails a portion of our users.

**What AA means in practice:**
- Any user who relies on a keyboard, screen reader, switch control, or other assistive technology can complete every core workflow that a mouse user can
- Any user with low vision, colour blindness, or photosensitivity can use the product safely
- Any user with cognitive differences can understand the interface with reasonable effort

### Inclusive Design Principles

| Principle | Implementation |
|---|---|
| **Equitable use** | The core product experience is the same for all users. Accessibility is not a "lite mode". |
| **Flexibility** | Users can use keyboard, mouse, touch, or voice. Multiple paths to the same outcome. |
| **Simple and intuitive** | UI copy is plain language. Heading hierarchy is logical. Navigation is predictable. |
| **Perceptible information** | Information is communicated through multiple channels: colour + text + icon. Never colour alone. |
| **Tolerance for error** | Destructive actions require confirmation. Errors are recoverable and clearly explained. |
| **Low physical effort** | Touch targets are at least 44×44px. Click/tap targets do not require precision. |

### Accessibility Statement

> ViralScopes.io is committed to ensuring our platform is accessible to all users, including those with disabilities. We target WCAG 2.2 Level AA compliance across all product pages and features. If you encounter an accessibility barrier, please contact us at accessibility@viralscopes.io and we will address it within 5 business days.

---

## 2. Keyboard Accessibility

### Global Keyboard Navigation

Every interactive element is reachable and operable via keyboard alone.

| Key | Action |
|---|---|
| `Tab` | Move focus to next interactive element |
| `Shift + Tab` | Move focus to previous interactive element |
| `Enter` | Activate button, link, or focused option |
| `Space` | Toggle checkbox, activate button, open select |
| `Escape` | Close modal, dropdown, tooltip, or cancel current action |
| `Arrow keys` | Navigate within menus, tabs, radio groups, listboxes |
| `/` | Focus global search (custom shortcut) |
| `?` | Open keyboard shortcuts help modal |

### Skip Links

A skip link is the first focusable element in the page. It allows keyboard users to bypass the sidebar navigation and jump directly to the main content:

```html
<!-- In app/layout.tsx — first child of <body> -->
<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
         focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-md
         focus:bg-primary focus:text-white focus:font-medium
         focus:shadow-lg"
>
  Skip to main content
</a>
```

**Keyboard shortcut links (at top of page, for power users):**
- Skip to main content
- Skip to navigation (for users who want to reach the sidebar directly)

### Focus Indicators

All interactive elements have a visible focus indicator that meets WCAG 2.2 Success Criterion 2.4.11 (Focus Appearance):

```css
/* globals.css */
:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* For elements that have custom border styling */
.custom-focus:focus-visible {
  box-shadow: var(--shadow-focus);
  /* = 0 0 0 2px background-color, 0 0 0 4px focus-ring-color */
}
```

**Focus indicator specifications:**
- Outline width: 2px
- Outline offset: 2px
- Colour: `--color-focus-ring` (`#1D8CF8`, Electric Blue)
- Contrast ratio vs dark background: 5.6:1 ✅
- Contrast ratio vs light background: 4.2:1 ✅

**Focus hiding:** The focus ring is hidden on mouse interaction using the `:focus-visible` pseudo-class (not `:focus`). Keyboard focus is always visible.

### Logical Tab Order

The natural DOM order determines tab order. We never use positive `tabindex` values. Rules:

- The DOM order matches the visual reading order
- Modal content is inserted at the end of `<body>` (via Radix portal) but focus is managed programmatically
- `tabindex="-1"` is used on elements that receive programmatic focus but are not in the natural tab order (e.g. the `<main>` element receives focus on route change)

### Focus Management

**On modal open:** Focus moves to the first focusable element inside the modal (or the modal heading if `autoFocus` is set on the dialog).

**On modal close:** Focus returns to the element that triggered the modal (the trigger button).

**On route change:** The `<main>` element receives programmatic focus so keyboard users are repositioned at the top of the new page's content:

```typescript
// In the dashboard layout component
const pathname = usePathname();
const mainRef = useRef<HTMLElement>(null);

useEffect(() => {
  // Small delay to allow the new page to render
  const timer = setTimeout(() => {
    mainRef.current?.focus();
  }, 100);
  return () => clearTimeout(timer);
}, [pathname]);

// In JSX:
<main ref={mainRef} id="main-content" tabIndex={-1}>
```

**On toast notification:** Toasts announce themselves to screen readers via `role="alert"` or `role="status"`. Focus is never moved to a toast.

---

## 3. Screen Reader Support

### Semantic HTML First

Semantic HTML is always preferred over ARIA. ARIA is used only when native HTML elements are insufficient.

| Content type | Native element used |
|---|---|
| Page heading | `<h1>`–`<h6>` (correct hierarchy) |
| Navigation | `<nav>` with `aria-label` |
| Lists of items | `<ul>` / `<ol>` / `<li>` |
| Data tables | `<table>` with `<th>`, `<td>`, `scope` |
| Forms | `<form>`, `<fieldset>`, `<legend>`, `<label>` |
| Buttons | `<button>` (never `<div>` styled as button) |
| Links | `<a>` with `href` (never `<div>` styled as link) |
| Main content | `<main>` |
| Page header | `<header>` |
| Page footer | `<footer>` |

### ARIA Usage Guidelines

**Use ARIA when native HTML is insufficient:**

```tsx
// ✅ Correct: ARIA enhances native element
<button aria-expanded={isOpen} aria-controls="dropdown-menu">
  Options
</button>

// ✅ Correct: ARIA on custom widget with no native equivalent
<div role="tablist" aria-label="Video analysis sections">
  <button role="tab" aria-selected={activeTab === "summary"}>Summary</button>
  <button role="tab" aria-selected={activeTab === "analysis"}>Analysis</button>
</div>

// ❌ Wrong: Recreating native element with ARIA
<div role="button" onClick={fn} tabIndex={0}>Submit</div>
```

### Accessible Labels

**Every interactive element must have an accessible name:**

| Element | Labelling method |
|---|---|
| Form input | `<label htmlFor="input-id">` |
| Icon button | `aria-label="Delete watchlist"` |
| Decorative icon with text | `<Icon aria-hidden="true" /> Visible text` |
| Image | `alt="Descriptive text"` |
| Decorative image | `alt=""` |
| Complex widget | `aria-labelledby="heading-id"` |
| Chart | `aria-label="Line chart showing viral scores over 30 days"` |
| Data table | `<caption>` or `aria-label` |

**Labels must be specific:**

```tsx
// ✅ Specific
<button aria-label="Delete watchlist 'Finance Competitors'">
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</button>

// ❌ Vague
<button aria-label="Delete">
  <Trash2 className="h-4 w-4" />
</button>
```

### Live Regions

Dynamic content changes are announced to screen readers using `aria-live`:

| Use case | `aria-live` value | `aria-atomic` |
|---|---|---|
| Search results count updating | `polite` | `true` |
| Filter applied — results changed | `polite` | `false` |
| Form submission success | `polite` | `true` |
| Error alert appearing | `assertive` | `true` |
| Analysis complete notification | `polite` | `true` |
| Quota warning | `polite` | `true` |

```tsx
// Results count live region
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? "Loading..." : `${totalCount} videos found`}
</div>
```

### Form Accessibility

Every form input is correctly labelled and its error state is communicated:

```tsx
<div className="space-y-1.5">
  {/* Label linked via htmlFor */}
  <Label htmlFor="email">
    Email address <span aria-hidden="true" className="text-error">*</span>
    <span className="sr-only">(required)</span>
  </Label>

  {/* Input with error state and aria-describedby */}
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : "email-hint"}
  />

  {/* Helper text (referenced by aria-describedby when no error) */}
  {!errors.email && (
    <p id="email-hint" className="text-caption text-text-tertiary">
      We'll send a verification link to this address.
    </p>
  )}

  {/* Error message (role="alert" ensures immediate announcement) */}
  {errors.email && (
    <p id="email-error" className="text-caption text-error" role="alert">
      <AlertCircle className="h-3 w-3 inline mr-1" aria-hidden="true" />
      {errors.email.message}
    </p>
  )}
</div>
```

---

## 4. Visual Accessibility

### Colour Contrast Requirements

All text and interactive elements meet WCAG 2.2 AA minimum contrast ratios:

| Element | Contrast requirement | ViralScopes dark theme | ViralScopes light theme |
|---|---|---|---|
| Body text (≤ 18px) | 4.5:1 | 12.4:1 ✅ | 13.1:1 ✅ |
| Large text (≥ 18px or ≥ 14px bold) | 3:1 | 9.8:1 ✅ | 10.2:1 ✅ |
| Secondary text | 4.5:1 | 5.8:1 ✅ | 5.1:1 ✅ |
| Tertiary text | 4.5:1 | 3.2:1 ⚠️ (large text only) | 3.6:1 ✅ |
| Primary button text | 4.5:1 | 4.6:1 ✅ | 4.6:1 ✅ |
| Error text | 4.5:1 | 5.1:1 ✅ | 5.4:1 ✅ |
| Focus ring vs background | 3:1 | 5.6:1 ✅ | 4.2:1 ✅ |
| Border on form inputs | 3:1 | 3.2:1 ✅ | 3.1:1 ✅ |

*Tertiary text (`--color-text-tertiary`) at 3.2:1 is only used for labels and captions at 12px+ where the large text threshold applies.*

### Colour Independence

Colour is **never** the sole carrier of meaning. Every colour-coded element has a secondary indicator:

| Coloured element | Secondary indicator |
|---|---|
| Viral Score badge (5 colours) | Numeric score + tier label ("Exceptional") |
| Trend status (green/amber/red) | Text label ("Emerging", "Declining") |
| Alert variant (info/success/warning/error) | Icon + text label |
| Form error (red border) | Error message below the field |
| Chart data series (multiple colours) | Legend with text labels |
| Delta arrows (green up / red down) | Arrow direction + percentage value |

### Text Scaling

The product UI uses `rem` units throughout. When the browser's default font size is increased (via browser accessibility settings), all text scales proportionally. No container uses a fixed pixel height that would clip enlarged text.

**Test:** Increase browser font size to 200% (Ctrl/Cmd +). All text must remain visible and no horizontal scrolling should occur.

### Responsive Layouts

On small screens (< 640px):
- The sidebar collapses to a hidden drawer (toggle via topbar hamburger)
- Data tables become horizontally scrollable (not truncated)
- Cards stack to full-width columns
- Modals become full-screen sheets
- Touch targets are minimum 44×44px

### Reduced Motion

All animations and transitions respect `prefers-reduced-motion: reduce`. When this media query is active:
- All CSS transitions are set to 0.01ms duration
- Chart animations are disabled (data is shown immediately at final value)
- The Viral Score gauge shows its final value without the sweep animation
- Skeleton shimmer is replaced with a static opacity

See implementation in [Design_Tokens.md §5.5](./Design_Tokens.md).

### Dark Mode Considerations

The dark theme is the default. Light theme is a full, equally accessible alternative.

Dark mode-specific accessibility checks:
- Text on dark backgrounds is tested separately from light mode (different contrast values)
- Gradient text (marketing hero headlines) is checked for contrast — gradient text can fail contrast requirements on certain backgrounds
- Transparent surfaces (modals, dropdowns on dark backgrounds) are tested with actual content visible through them

---

## 5. Accessible Components

### Forms

Full implementation: see [Component_Library.md §2](./Component_Library.md) and Section 3.4 of this document.

**Key rules:**
- [ ] Every input has a `<label>` linked via `htmlFor`
- [ ] Required fields have `aria-required="true"` and a visual indicator
- [ ] Error messages use `role="alert"` and `aria-describedby`
- [ ] `fieldset` + `legend` wraps radio groups and checkbox groups
- [ ] Form submit button clearly describes the action ("Create Watchlist", not "Submit")

### Tables

Full implementation: see [Component_Library.md §5](./Component_Library.md).

**Key rules:**
- [ ] `<table>` element (not CSS grid or flex)
- [ ] `<caption>` or `aria-label` describing the table's purpose
- [ ] `scope="col"` on column headers; `scope="row"` on row headers
- [ ] `aria-sort="ascending"` | `"descending"` | `"none"` on sortable column headers
- [ ] Row selection checkboxes have `aria-label="Select [row description]"`
- [ ] "Select all" checkbox uses indeterminate state and `aria-label="Select all videos"`

### Dialogs (Modals)

Full implementation: see [Component_Library.md §8](./Component_Library.md).

**Key rules:**
- [ ] Focus is trapped inside the dialog while open (Radix Dialog handles this)
- [ ] `aria-labelledby` points to the dialog heading
- [ ] `aria-describedby` points to the dialog description (if present)
- [ ] Escape key closes the dialog
- [ ] On close, focus returns to the trigger element

### Menus and Dropdowns

Full implementation: see [Component_Library.md §9](./Component_Library.md).

**Key rules:**
- [ ] `aria-haspopup="menu"` + `aria-expanded` on the trigger
- [ ] `role="menu"` on the menu container
- [ ] `role="menuitem"` on each menu item
- [ ] Arrow keys navigate between items; Escape closes; Tab closes and moves on
- [ ] Destructive items have `aria-label` that includes "destructive" or warns of the consequence

### Charts

Full implementation: see [Component_Library.md §6](./Component_Library.md).

**Key rules:**
- [ ] `role="img"` + `aria-label` describing the chart's content and data range
- [ ] A "View as table" toggle button is available for all charts
- [ ] Chart tooltips are keyboard-accessible (focus on data points via arrow keys)
- [ ] Legend items are listed as `<ul>/<li>` for screen reader comprehension
- [ ] Sparklines are `aria-hidden="true"` (the numeric value is the primary label)

### Notifications (Toasts and Alerts)

**Key rules:**
- [ ] `role="alert"` for errors and warnings (announced immediately)
- [ ] `role="status"` for success and info messages (polite announcement)
- [ ] Focus is never stolen by a notification
- [ ] A close button is always present and keyboard-operable
- [ ] Toast messages are concise (under 80 characters) to avoid overwhelming screen reader users

### Media Controls

`[ASSUMPTION]` Video playback is not a feature in the product UI. If video tutorials are added in a future version, all video players must include:
- Keyboard-operable controls (play/pause, seek, volume, caption toggle)
- Captions for all spoken content
- `aria-label` on all controls
- Transcript available alongside the video

---

## 6. Accessibility Testing

### Automated Testing (CI Pipeline)

Every PR runs automated accessibility scanning:

```yaml
# .github/workflows/ci.yml
- name: Accessibility scan (axe)
  run: npx playwright test --project=accessibility
  # Runs axe-core against all critical page templates
```

**Pages scanned on every PR:**
- `/login` (auth flow)
- `/home` (dashboard)
- `/videos` (data table)
- `/videos/[id]` (detail page)
- `/trending` (filters + cards)
- `/settings/profile` (form)

**Failure criteria:** Any axe violation at `critical` or `serious` severity blocks the PR from merging.

```typescript
// e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Dashboard home page has no critical accessibility violations", async ({ page }) => {
  await page.goto("/home");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations.filter(v =>
    ["critical", "serious"].includes(v.impact ?? "")
  )).toHaveLength(0);
});
```

### Manual Testing Checklist

Run before every major feature release:

**Keyboard-only navigation:**
- [ ] All interactive elements reachable via Tab
- [ ] Logical tab order (matches visual reading order)
- [ ] Skip link works and leads to main content
- [ ] All dropdowns, menus, and modals operable via keyboard
- [ ] Focus is visible on all interactive elements
- [ ] No keyboard traps (other than intentional modal traps)
- [ ] Escape key closes all overlays

**Screen reader testing:**
- [ ] NVDA + Chrome (Windows)
- [ ] VoiceOver + Safari (macOS)
- [ ] VoiceOver + Safari (iOS)
- [ ] All page headings read in logical order
- [ ] All images have appropriate alt text
- [ ] All form errors are announced
- [ ] Live regions announce dynamic changes
- [ ] Charts have accessible descriptions

**Visual checks:**
- [ ] Zoom to 200% — no content hidden or overlapping
- [ ] Dark theme contrast passes (see Section 4)
- [ ] Light theme contrast passes
- [ ] Windows High Contrast Mode — product is usable
- [ ] Forced colours mode — no invisible elements
- [ ] `prefers-reduced-motion` active — no essential animations

### Keyboard-Only Testing Protocol

**Setup:** Unplug/disable mouse. Use only keyboard.

**Test flow:**
1. Open `https://app.viralscopes.io/login`
2. Tab to email field, enter email, tab to password, enter password, Enter to submit
3. Navigate the onboarding flow using keyboard only
4. On the Home dashboard, navigate to Videos page using sidebar
5. Open a video detail page using keyboard
6. Navigate to Trending, apply a filter using keyboard, clear the filter
7. Create a watchlist using keyboard only (form + submit)
8. Open and close a modal
9. Navigate Settings and update profile

Any step that requires a mouse is an accessibility failure.

### Screen Reader Testing Protocol

**NVDA (Windows) + Chrome:**
1. Enable NVDA
2. Browse to the Home dashboard
3. Use NVDA's heading navigation (H key) to check heading hierarchy
4. Use NVDA's landmark navigation (D key) to verify landmarks
5. Navigate a data table with arrow keys; verify column headers are announced
6. Submit a form with a validation error; verify error is announced
7. Open a modal; verify focus moves to modal; verify title is announced; close modal; verify focus returns

### Accessibility Regression Testing

When a component is changed, its accessibility tests are re-run:

1. Automated axe scan (in CI for every PR)
2. Snapshot comparison (visual regression catches focus indicator removal)
3. Manual keyboard check if the component has complex interaction patterns

---

## 7. Compliance Reference

### WCAG 2.2 AA Criteria Met

| Criterion | Level | Description | Implementation |
|---|---|---|---|
| 1.1.1 Non-text Content | A | All non-text content has a text alternative | `alt` on images; `aria-label` on icons |
| 1.3.1 Info and Relationships | A | Information conveyed visually is also in the markup | Semantic HTML; ARIA roles |
| 1.3.2 Meaningful Sequence | A | Correct reading order in the DOM | DOM order matches visual order |
| 1.3.3 Sensory Characteristics | A | Instructions don't rely on shape/size/location/orientation | No "click the blue button" copy |
| 1.4.1 Use of Colour | A | Colour not the only means of conveying information | Colour + text/icon for all status indicators |
| 1.4.3 Contrast (Minimum) | AA | 4.5:1 for normal text; 3:1 for large | All combinations pass (see Section 4) |
| 1.4.4 Resize Text | AA | Text resizable to 200% without loss | rem-based sizing throughout |
| 1.4.10 Reflow | AA | Content available without scrolling in 2 directions at 320px | Responsive layout; no fixed-width tables |
| 1.4.11 Non-text Contrast | AA | 3:1 for UI components | Borders, icons, focus rings all pass |
| 1.4.12 Text Spacing | AA | No loss of content when spacing is adjusted | No fixed-height text containers |
| 1.4.13 Content on Hover/Focus | AA | Hover/focus content dismissible and persistent | Tooltips dismissible via Escape |
| 2.1.1 Keyboard | A | All functionality available via keyboard | Comprehensive keyboard testing |
| 2.1.2 No Keyboard Trap | A | Focus not trapped (except modals with escape) | Radix handles modal focus trap correctly |
| 2.4.3 Focus Order | A | Focus order preserves meaning | DOM order = visual order |
| 2.4.4 Link Purpose | A | Link purpose determinable from link text | Descriptive link and button text |
| 2.4.6 Headings and Labels | AA | Headings and labels describe their topic | Semantic heading hierarchy |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator visible | Custom focus ring; `:focus-visible` |
| 2.4.11 Focus Appearance | AA | Focus indicator meets size and contrast | 2px outline, 5.6:1 contrast |
| 2.5.3 Label in Name | A | Accessible name contains visible label | All buttons and inputs follow this |
| 2.5.8 Target Size | AA | Target size at least 24×24px | All targets ≥ 40×40px |
| 3.1.1 Language of Page | A | Language of page determined | `lang="en"` on `<html>` |
| 3.2.2 On Input | A | No unexpected context change on input | No auto-submit forms |
| 3.3.1 Error Identification | A | Input errors identified and described | Error messages with `role="alert"` |
| 3.3.2 Labels or Instructions | A | Labels provided for inputs | All inputs have labels |
| 4.1.2 Name, Role, Value | A | All UI components have name, role, value | shadcn/Radix handle ARIA correctly |
| 4.1.3 Status Messages | AA | Status messages conveyed without focus change | `aria-live` regions |

### WAI-ARIA Authoring Practices

All custom widget implementations follow WAI-ARIA Authoring Practices 1.2:
- Accordion: `role="region"` + `aria-expanded`
- Combobox: composite widget pattern
- Dialog: `role="dialog"` + focus trap
- Disclosure: `aria-expanded` on trigger
- Grid: data table pattern
- Listbox: `role="listbox"` + `role="option"`
- Menu: `role="menu"` + arrow key navigation
- Tabs: `role="tablist"` + `role="tab"` + `role="tabpanel"`
- Toolbar: `role="toolbar"` + arrow key navigation

---

*This accessibility guide is reviewed with every major feature release and updated when new components are added or existing components are significantly modified. Any WCAG violation discovered in production is treated as a P2 bug and addressed in the next sprint.*

---

**Related Documents:**
- [UI_Design_System.md](./UI_Design_System.md) — ARIA usage patterns and focus management
- [Design_Tokens.md](./Design_Tokens.md) — Contrast-checked colour tokens; reduced motion tokens
- [Component_Library.md](./Component_Library.md) — Per-component accessibility requirements
- [Frontend_Architecture.md](./Frontend_Architecture.md) — Skip links implementation and route change focus management
- [Visual_Design_System.md](./Visual_Design_System.md) — Colour contrast ratios and dark/light theme specifications
