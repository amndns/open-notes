# Styling & Design Documentation

This document provides comprehensive documentation on the visual design, component styling, and Tailwind CSS configuration for the Local Notes Recall application.

## Table of Contents

- [Overview](#overview)
- [Tailwind CSS Setup](#tailwind-css-setup)
- [Design System](#design-system)
- [Component Styling](#component-styling)
- [UI Component Library](#ui-component-library)
- [Custom Animations](#custom-animations)
- [Electron-Specific Styles](#electron-specific-styles)

---

## Overview

The application features a clean, modern, light-mode interface with:

- **Color Scheme**: Light gray backgrounds with vibrant accent colors
- **Typography**: Inter font family with system font fallbacks
- **Component Library**: shadcn/ui components (New York style)
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Icons**: Lucide React icon library

---

## Tailwind CSS Setup

### Installation & Dependencies

The application uses **Tailwind CSS v4** with the new Vite plugin architecture. Key packages:

```json
{
  "dependencies": {
    "@tailwindcss/vite": "^4.1.18",
    "tailwindcss": "^4.1.18",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  }
}
```

### Vite Configuration

Tailwind is integrated via the Vite plugin in `electron.vite.config.ts`:

```typescript
import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

**Key Points:**

- Uses `@tailwindcss/vite` plugin (v4 native Vite integration)
- No separate `tailwind.config.js` file needed in v4
- Configuration lives in the CSS file itself using `@theme`
- Path aliases configured for clean imports

### CSS Entry Point

The main CSS file is located at `src/renderer/src/assets/main.css`:

```css
@import 'tailwindcss';

/* Custom CSS variables for the app theme - Light Mode */
@theme {
  --color-background: #ffffff;
  --color-background-soft: #f8f9fa;
  --color-background-mute: #f1f3f4;
  --color-foreground: #1a1a1a;
  --color-foreground-muted: #6b7280;

  /* Speaker colors for transcript */
  --color-speaker-1: #2563eb;
  --color-speaker-2: #059669;
  --color-speaker-3: #d97706;
  --color-speaker-4: #db2777;
  --color-speaker-5: #7c3aed;
}
```

This file is imported in `src/renderer/src/main.tsx`:

```typescript
import './assets/main.css'
```

### shadcn/ui Configuration

The application uses shadcn/ui components with custom configuration in `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/renderer/src/assets/main.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@renderer/components",
    "utils": "@renderer/lib/utils",
    "ui": "@renderer/components/ui",
    "lib": "@renderer/lib",
    "hooks": "@renderer/hooks"
  },
  "iconLibrary": "lucide"
}
```

**Configuration Details:**

- **Style**: `new-york` (more compact, modern design)
- **Base Color**: `neutral` (grays)
- **CSS Variables**: Enabled for theme customization
- **Icons**: Lucide React library
- **Aliases**: Path mappings for clean imports

---

## Design System

### Color Palette

#### Base Colors

```css
/* Background Colors */
--color-background: #ffffff /* Pure white for main surfaces */ --color-background-soft: #f8f9fa
  /* Subtle gray for secondary surfaces */ --color-background-mute: #f1f3f4
  /* Light gray for muted backgrounds */ /* Text Colors */ --color-foreground: #1a1a1a
  /* Near-black for primary text */ --color-foreground-muted: #6b7280
  /* Gray-500 for secondary text */;
```

#### Speaker/Participant Colors

Used for transcript speaker differentiation:

```css
--color-speaker-1: #2563eb /* Blue-600 */ --color-speaker-2: #059669 /* Emerald-600 */
  --color-speaker-3: #d97706 /* Amber-600 */ --color-speaker-4: #db2777 /* Pink-600 */
  --color-speaker-5: #7c3aed /* Purple-600 */;
```

Additional speakers cycle through extended palette:

- `text-cyan-600` (#0891b2)
- `text-orange-600` (#ea580c)
- `text-lime-600` (#65a30d)

Each speaker color has a corresponding light background:

- `bg-blue-50` (#eff6ff)
- `bg-emerald-50` (#ecfdf5)
- `bg-amber-50` (#fffbeb)
- `bg-pink-50` (#fdf2f8)
- `bg-purple-50` (#faf5ff)
- `bg-cyan-50` (#ecfeff)
- `bg-orange-50` (#fff7ed)
- `bg-lime-50` (#f7fee7)

#### State Colors

```css
/* Recording States */
Red:   bg-red-600 (#dc2626)    /* Recording active */
       bg-red-100 (#fee2e2)    /* Recording background pulse */

Blue:  bg-blue-600 (#2563eb)   /* Processing state */
       bg-blue-100 (#dbeafe)   /* Processing background */

Gray:  bg-gray-100 (#f3f4f6)   /* Idle state */
       bg-gray-400 (#9ca3af)   /* Idle icon color */

/* Borders & Dividers */
border-gray-200 (#e5e7eb)      /* Subtle borders */
border-gray-100 (#f3f4f6)      /* Extra subtle dividers */

/* Backgrounds */
bg-gray-50 (#f9fafb)           /* Control panels, headers, footers */
```

### Typography

#### Font Family

```css
body {
  font-family:
    Inter,
    /* Primary font */ -apple-system,
    /* macOS San Francisco */ BlinkMacSystemFont,
    'Segoe UI',
    /* Windows */ Roboto,
    /* Android */ Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

#### Font Sizes & Weights

```css
/* Headings */
text-xl font-semibold    /* 20px / 600 - Main titles */
text-lg font-semibold    /* 18px / 600 - Section headers */

/* Body Text */
text-sm                  /* 14px - Default body text */
text-sm leading-relaxed  /* 14px with 1.625 line-height - Transcript text */

/* Small Text */
text-xs                  /* 12px - Metadata, timestamps, labels */

/* Speaker Labels */
text-sm font-medium      /* 14px / 500 - Speaker names */
```

### Spacing & Layout

#### Container Padding

```css
px-6 py-4   /* Horizontal panels (24px horizontal, 16px vertical) */
px-4 py-3   /* Compact panels (16px horizontal, 12px vertical) */
px-8        /* Wide content areas (32px horizontal) */
```

#### Gaps

```css
gap-2       /* 8px - Tight spacing (badges, small elements) */
gap-3       /* 12px - Medium spacing (metadata items) */
gap-4       /* 16px - Default spacing (buttons, controls) */
gap-6       /* 24px - Large spacing (card sections) */
```

#### Border Radius

```css
rounded-md       /* 6px - Buttons, inputs */
rounded-lg       /* 8px - Cards, panels */
rounded-xl       /* 12px - Large cards */
rounded-full     /* 9999px - Badges, circular elements */
```

### Custom Scrollbar

Styled for light mode consistency:

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f3f4; /* --color-background-mute */
}

::-webkit-scrollbar-thumb {
  background: #d1d5db; /* gray-300 */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af; /* gray-400 */
}
```

---

## Component Styling

### App Container (`App.tsx`)

```tsx
<div className="flex h-screen flex-col bg-white">
```

**Styles:**

- `flex h-screen flex-col` - Full-height vertical flexbox
- `bg-white` - Pure white background

#### Draggable Title Bar

```tsx
<div className="h-12 shrink-0 [-webkit-app-region:drag]" />
```

**Styles:**

- `h-12` - 48px height for macOS traffic lights
- `shrink-0` - Prevent flex shrinking
- `[-webkit-app-region:drag]` - Makes area draggable (Electron-specific)

#### Error Display

```tsx
<div className="mx-4 mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
  {appState.error}
</div>
```

**Styles:**

- `mx-4 mb-4` - Horizontal margin 16px, bottom margin 16px
- `rounded-lg` - 8px border radius
- `bg-red-50` - Very light red background
- `border border-red-200` - Light red border
- `px-4 py-3` - 16px horizontal, 12px vertical padding
- `text-sm text-red-600` - 14px red text

---

### EmptyState Component

Central placeholder for idle/recording/processing states.

```tsx
<div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
```

**Container Styles:**

- `flex flex-1 flex-col` - Flexible vertical container
- `items-center justify-center` - Centered content
- `px-8 text-center` - 32px horizontal padding, centered text

#### Icon Container

```tsx
<div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
  status === 'recording'
    ? 'animate-pulse bg-red-100'
    : status === 'processing'
      ? 'animate-spin bg-blue-100'
      : 'bg-gray-100'
}`}>
```

**Dynamic Styles:**

- `mb-6` - 24px bottom margin
- `flex h-24 w-24` - 96px square container
- `items-center justify-center` - Centered icon
- `rounded-full` - Perfect circle
- **Recording**: `animate-pulse bg-red-100` - Pulsing red background
- **Processing**: `animate-spin bg-blue-100` - Spinning blue background
- **Idle**: `bg-gray-100` - Static gray background

#### Icon

```tsx
<Mic
  className={`h-12 w-12 ${
    status === 'recording'
      ? 'text-red-600'
      : status === 'processing'
        ? 'text-blue-600'
        : 'text-gray-400'
  }`}
/>
```

**Dynamic Colors:**

- `h-12 w-12` - 48px icon size
- **Recording**: `text-red-600` - Bright red
- **Processing**: `text-blue-600` - Bright blue
- **Idle**: `text-gray-400` - Muted gray

#### Text Content

```tsx
<h2 className="mb-2 text-xl font-semibold text-gray-900">{title}</h2>
<p className="max-w-xs text-sm text-gray-500">{subtitle}</p>
```

**Title:**

- `mb-2` - 8px bottom margin
- `text-xl font-semibold` - 20px, 600 weight
- `text-gray-900` - Near-black

**Subtitle:**

- `max-w-xs` - 320px max width
- `text-sm` - 14px
- `text-gray-500` - Medium gray

---

### RecordingControls Component

Bottom control panel with action buttons.

```tsx
<div className="flex items-center justify-center gap-4 border-t border-gray-200 bg-gray-50 px-6 py-4">
```

**Container Styles:**

- `flex items-center justify-center` - Centered horizontal layout
- `gap-4` - 16px spacing between buttons
- `border-t border-gray-200` - Top border separator
- `bg-gray-50` - Light gray background
- `px-6 py-4` - 24px horizontal, 16px vertical padding

#### Start Recording Button

```tsx
<Button onClick={onStart} size="lg" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
  <Circle className="h-4 w-4 fill-current" />
  Start Recording
</Button>
```

**Custom Styles:**

- `gap-2` - 8px spacing between icon and text
- `bg-red-600 hover:bg-red-700` - Red background with darker hover
- `text-white` - White text
- Icon: `h-4 w-4 fill-current` - 16px filled circle

#### Stop Recording Button

```tsx
<Button
  onClick={onStop}
  size="lg"
  variant="outline"
  className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
>
  <Square className="h-4 w-4 fill-current" />
  Stop Recording
</Button>
```

**Custom Styles:**

- `variant="outline"` - Outlined button style
- `gap-2` - 8px spacing
- `border-red-300` - Light red border
- `text-red-600` - Red text
- `hover:bg-red-50` - Very light red background on hover
- Icon: `h-4 w-4 fill-current` - 16px filled square

#### New Meeting Button

```tsx
<Button onClick={onNew} size="lg" className="gap-2">
  <Plus className="h-4 w-4" />
  New Meeting
</Button>
```

**Uses default Button styles** with:

- `gap-2` - 8px spacing
- Icon: `h-4 w-4` - 16px plus icon

#### Processing Indicator

```tsx
<div className="flex items-center gap-2 text-gray-500">
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
  <span className="text-sm">Processing...</span>
</div>
```

**Spinner:**

- `h-4 w-4` - 16px size
- `animate-spin` - Continuous rotation
- `rounded-full` - Circle shape
- `border-2 border-gray-300` - 2px gray border
- `border-t-blue-600` - Blue top border (creates spinner effect)

**Text:**

- `text-sm text-gray-500` - 14px muted gray text

---

### TranscriptView Component

Displays the full transcript with speaker differentiation.

#### Container Structure

```tsx
<div className="flex flex-1 flex-col overflow-hidden">
```

**Root Container:**

- `flex flex-1 flex-col` - Flexible vertical layout
- `overflow-hidden` - Clip overflow to enable scroll area

#### Header

```tsx
<div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
  <h1 className="text-lg font-semibold text-gray-900">
    {transcript.meetingTitle || 'Untitled Meeting'}
  </h1>
  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">{/* Metadata items */}</div>
</div>
```

**Header Styles:**

- `border-b border-gray-200` - Bottom border separator
- `px-6 py-4` - 24px horizontal, 16px vertical padding
- `bg-gray-50` - Light gray background

**Title:**

- `text-lg font-semibold` - 18px, 600 weight
- `text-gray-900` - Near-black

**Metadata:**

- `mt-1` - 4px top margin
- `flex items-center gap-3` - Horizontal layout with 12px gaps
- `text-xs text-gray-500` - 12px muted gray text

#### Transcript Content

```tsx
<ScrollArea className="flex-1 bg-white">
  <div className="divide-y divide-gray-100 px-6">{/* Transcript segments */}</div>
</ScrollArea>
```

**ScrollArea:**

- `flex-1` - Takes remaining vertical space
- `bg-white` - White background

**Content Container:**

- `divide-y divide-gray-100` - Very subtle dividers between segments
- `px-6` - 24px horizontal padding

#### Transcript Segment

```tsx
<div className="group py-3">
  <div className="mb-1 flex items-center justify-between">
    <span className={`text-sm font-medium ${speakerColor}`}>
      {speakerName}
      {segment.participant.isHost && <span className="ml-2 text-xs text-gray-400">(Host)</span>}
    </span>
    <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
      {formatTime(segment.startTime)}
    </span>
  </div>
  <p className="text-sm leading-relaxed text-gray-700">{segment.text}</p>
</div>
```

**Segment Container:**

- `group py-3` - Grouping for hover effects, 12px vertical padding

**Speaker Header:**

- `mb-1 flex items-center justify-between` - 4px bottom margin, space-between layout

**Speaker Name:**

- `text-sm font-medium ${speakerColor}` - 14px, 500 weight, dynamic color (blue-600, emerald-600, etc.)
- Host badge: `ml-2 text-xs text-gray-400` - 8px left margin, 12px muted text

**Timestamp (hover-revealed):**

- `text-xs text-gray-400` - 12px muted gray
- `opacity-0 transition-opacity` - Hidden by default
- `group-hover:opacity-100` - Visible on segment hover

**Transcript Text:**

- `text-sm leading-relaxed` - 14px with 1.625 line-height
- `text-gray-700` - Dark gray for readability

#### Participants Footer

```tsx
<div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
  <div className="text-xs font-medium text-gray-500 mb-2">
    Participants ({transcript.participants.length})
  </div>
  <div className="flex flex-wrap gap-2">
    {transcript.participants.map((participant) => (
      <span
        key={participant.id}
        className={`text-xs px-2 py-0.5 rounded-full ${getSpeakerColor(participant.id)} ${getSpeakerBgColor(participant.id)}`}
      >
        {participant.name || `Speaker ${participant.id}`}
      </span>
    ))}
  </div>
</div>
```

**Footer Container:**

- `border-t border-gray-200` - Top border separator
- `bg-gray-50` - Light gray background
- `px-6 py-3` - 24px horizontal, 12px vertical padding

**Label:**

- `text-xs font-medium text-gray-500 mb-2` - 12px medium weight, 8px bottom margin

**Badge Container:**

- `flex flex-wrap gap-2` - Wrapping horizontal layout with 8px gaps

**Participant Badge:**

- `text-xs` - 12px text
- `px-2 py-0.5` - 8px horizontal, 2px vertical padding
- `rounded-full` - Pill shape
- Dynamic colors: e.g., `text-blue-600 bg-blue-50`

---

## UI Component Library

### Button Component (`ui/button.tsx`)

Built with `class-variance-authority` for variant management.

#### Base Styles

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
  // ... variants
)
```

**Base Classes:**

- `inline-flex items-center justify-center` - Centered content
- `gap-2` - 8px spacing between icon and text
- `whitespace-nowrap` - Prevent text wrapping
- `rounded-md` - 6px border radius
- `text-sm font-medium` - 14px, 500 weight
- `transition-all` - Smooth transitions
- `disabled:pointer-events-none disabled:opacity-50` - Disabled state
- `[&_svg]:pointer-events-none [&_svg]:size-4` - Icon sizing (16px)
- `focus-visible:ring-[3px]` - 3px focus ring

#### Variants

**Default:**

```typescript
default: 'bg-primary text-primary-foreground hover:bg-primary/90'
```

- Primary background color with 90% opacity on hover

**Outline:**

```typescript
outline: 'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground'
```

- Bordered style with subtle shadow
- Background color change on hover

**Destructive:**

```typescript
destructive: 'bg-destructive text-white hover:bg-destructive/90'
```

- Destructive actions (delete, cancel)
- Red color with white text

**Secondary:**

```typescript
secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
```

- Secondary actions
- Muted color scheme

**Ghost:**

```typescript
ghost: 'hover:bg-accent hover:text-accent-foreground'
```

- No background until hover
- Minimal visual weight

**Link:**

```typescript
link: 'text-primary underline-offset-4 hover:underline'
```

- Text-style link appearance

#### Sizes

```typescript
{
  default: 'h-9 px-4 py-2 has-[>svg]:px-3',      // 36px height, 16px padding
  sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',  // 32px height
  lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',    // 40px height, 24px padding
  icon: 'size-9',                                 // 36px square
  'icon-sm': 'size-8',                           // 32px square
  'icon-lg': 'size-10'                           // 40px square
}
```

**Usage:**

```tsx
<Button size="lg" variant="outline">
  Click Me
</Button>
```

---

### ScrollArea Component (`ui/scroll-area.tsx`)

Wrapper around Radix UI ScrollArea primitive with custom styling.

```tsx
<ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn('relative', className)}>
  <ScrollAreaPrimitive.Viewport
    data-slot="scroll-area-viewport"
    className="focus-visible:ring-ring/50 h-full w-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
  >
    {children}
  </ScrollAreaPrimitive.Viewport>
  <ScrollBar />
</ScrollAreaPrimitive.Root>
```

**Root:**

- `relative` - Position context for scrollbar

**Viewport:**

- `h-full w-full` - Full container size
- `rounded-[inherit]` - Inherits parent border radius
- `focus-visible:ring-[3px]` - 3px focus ring
- `transition-[color,box-shadow]` - Smooth focus transitions

**ScrollBar:**

```tsx
<ScrollAreaPrimitive.ScrollAreaScrollbar
  orientation={orientation}
  className={cn(
    'flex touch-none p-px transition-colors select-none',
    orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
    orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent'
  )}
>
  <ScrollAreaPrimitive.ScrollAreaThumb
    className="bg-border relative flex-1 rounded-full"
  />
</ScrollAreaPrimitive.Scrollbar>
```

**Scrollbar Styles:**

- Vertical: `h-full w-2.5` - 10px width
- Horizontal: `h-2.5` - 10px height
- `touch-none select-none` - Prevent interaction conflicts
- `transition-colors` - Smooth color changes

**Thumb:**

- `bg-border` - Uses theme border color
- `rounded-full` - Pill shape
- `flex-1` - Fills available space

---

### Card Component (`ui/card.tsx`)

Flexible card container with multiple sub-components.

```tsx
<Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
```

**Base Styles:**

- `flex flex-col gap-6` - Vertical layout with 24px gaps
- `rounded-xl` - 12px border radius
- `border` - Default border
- `py-6` - 24px vertical padding
- `shadow-sm` - Subtle shadow

**Sub-components:**

**CardHeader:**

```typescript
className: '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'
```

- Container queries enabled
- Grid layout with automatic rows
- 8px gap, 24px horizontal padding

**CardTitle:**

```typescript
className: 'leading-none font-semibold'
```

- Tight line height, semibold weight

**CardDescription:**

```typescript
className: 'text-muted-foreground text-sm'
```

- Muted color, 14px text

**CardContent:**

```typescript
className: 'px-6'
```

- 24px horizontal padding

**CardFooter:**

```typescript
className: 'flex items-center px-6 [.border-t]:pt-6'
```

- Horizontal flex layout
- 24px top padding if border present

---

### Utility Function (`lib/utils.ts`)

Critical utility for class name merging.

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

**Purpose:**

- `clsx` - Conditional class names
- `twMerge` - Intelligently merges Tailwind classes
- Prevents conflicting class names (e.g., `px-4` vs `px-6`)

**Usage:**

```tsx
<div className={cn('px-4 py-2', className, { 'bg-red-500': isError })}>
```

**Example Resolution:**

```typescript
cn('px-4 text-sm', 'px-6 text-lg')
// Result: 'px-6 text-lg' (later classes win)

cn('bg-red-500', isActive && 'bg-blue-500')
// Result: 'bg-blue-500' (if isActive is true)
```

---

## Custom Animations

### Pulse Animation

Used for recording state indicator.

```tsx
<div className="animate-pulse bg-red-100">
```

**Effect:**

- Fades opacity in and out
- Built-in Tailwind animation
- Duration: ~2 seconds
- Timing: ease-in-out

### Spin Animation

Used for processing state and loading indicators.

```tsx
<div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600">
```

**Effect:**

- Continuous 360° rotation
- Built-in Tailwind animation
- Duration: 1 second per rotation
- Timing: linear

**Spinner Pattern:**

- Circular border with different top color
- Creates visual rotation effect
- Common loading indicator pattern

### Hover Transitions

```tsx
<div className="opacity-0 transition-opacity group-hover:opacity-100">
```

**Pattern:**

- Default hidden state
- Smooth fade-in on parent hover
- Uses Tailwind `group` utility
- Duration: 150ms (Tailwind default)

### Button Hover

```tsx
<Button className="bg-red-600 hover:bg-red-700">
```

**Pattern:**

- Color darkening on hover
- Smooth transition via `transition-all`
- Duration: 150ms
- Timing: ease

---

## Electron-Specific Styles

### Draggable Title Bar

```tsx
<div className="h-12 shrink-0 [-webkit-app-region:drag]" />
```

**Purpose:**

- Creates draggable window area
- Accounts for macOS traffic lights
- Height: 48px

**CSS Property:**

- `[-webkit-app-region:drag]` - Arbitrary Tailwind value
- Electron/Chromium-specific property
- Makes area draggable by operating system

**Reverse (Make Clickable):**

```css
-webkit-app-region: no-drag;
```

Use on buttons/interactive elements within draggable area.

### Window Frame

The app uses a frameless window with custom title bar:

```tsx
<div className="flex h-screen flex-col bg-white">
  {/* Draggable title bar */}
  <div className="h-12 shrink-0 [-webkit-app-region:drag]" />

  {/* Content */}
  <div className="flex-1">...</div>
</div>
```

**Benefits:**

- Native window appearance
- Custom UI control
- Consistent cross-platform experience

---

## Responsive Design Patterns

### Flexbox Layout

Primary layout method throughout the app:

```tsx
// Vertical stacking
<div className="flex flex-col">

// Horizontal centering
<div className="flex items-center justify-center">

// Space between
<div className="flex items-center justify-between">

// Flexible sizing
<div className="flex-1">  // Grows to fill space
<div className="flex-none">  // Fixed size
<div className="shrink-0">  // Doesn't shrink
```

### Container Queries

Used in Card component for responsive layouts:

```tsx
<div className="@container/card-header">
```

Enables component-level responsiveness without media queries.

### Overflow Handling

```tsx
// Clip overflow
<div className="overflow-hidden">

// Enable scrolling
<div className="overflow-auto">

// Specific axis
<div className="overflow-y-auto overflow-x-hidden">
```

---

## Accessibility Features

### Focus Indicators

All interactive elements have visible focus states:

```css
focus-visible:ring-ring/50 focus-visible:ring-[3px]
```

- 3px focus ring
- 50% opacity
- Only shown for keyboard navigation

### Color Contrast

Text colors meet WCAG AA standards:

- Primary text: `text-gray-900` on `bg-white` (15.7:1 ratio)
- Secondary text: `text-gray-500` on `bg-white` (4.6:1 ratio)
- Small text: `text-gray-700` on `bg-white` (10.1:1 ratio)

### Semantic Markup

Components use semantic HTML:

- `<button>` for clickable actions
- `<h1>`, `<h2>` for headings
- `<p>` for text content

### ARIA Attributes

```tsx
aria-invalid:ring-destructive/20 aria-invalid:border-destructive
```

Buttons and inputs respond to ARIA states with visual feedback.

---

## Performance Optimizations

### CSS-in-CSS

Tailwind v4 processes CSS at build time:

- No runtime JavaScript overhead
- Static CSS output
- Tree-shaking unused styles

### Class Merging

`twMerge` utility prevents duplicate classes:

- Smaller DOM size
- Faster rendering
- Predictable styling

### Minimal Dependencies

Only essential UI libraries:

- Radix UI primitives (headless)
- Lucide React icons (tree-shakeable)
- No heavy component libraries

---

## Development Workflow

### Adding New Components

1. **Create component file:**

   ```bash
   src/renderer/src/components/MyComponent.tsx
   ```

2. **Import UI components:**

   ```tsx
   import { Button } from '@renderer/components/ui/button'
   import { Card } from '@renderer/components/ui/card'
   ```

3. **Use Tailwind classes:**
   ```tsx
   <div className="flex flex-col gap-4 p-6">
     <Button size="lg">Action</Button>
   </div>
   ```

### Adding shadcn/ui Components

Use the shadcn CLI (if installed):

```bash
npx shadcn@latest add <component-name>
```

Or manually copy from [ui.shadcn.com](https://ui.shadcn.com) into `src/renderer/src/components/ui/`.

### Custom Styles

Add global styles to `src/renderer/src/assets/main.css`:

```css
@theme {
  --my-custom-color: #abc123;
}

.my-custom-class {
  /* Custom CSS */
}
```

### Modifying Theme

Edit CSS variables in `@theme` block:

```css
@theme {
  --color-primary: #3b82f6; /* Change primary color */
}
```

Tailwind will automatically generate utilities using these values.

---

## Summary

This application achieves a polished, modern design through:

1. **Tailwind CSS v4** with native Vite integration
2. **shadcn/ui components** (New York style) for consistent UI patterns
3. **Custom CSS variables** in `@theme` for brand colors
4. **Lucide React icons** for sharp, consistent iconography
5. **Responsive flexbox layouts** for adaptable interfaces
6. **Smooth animations** for state transitions
7. **Accessibility-first** approach with focus states and semantic HTML
8. **Electron-specific styling** for native window feel

The design emphasizes **clarity**, **simplicity**, and **readability** with a light color palette, generous spacing, and subtle visual hierarchy.
