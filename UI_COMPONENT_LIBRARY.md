# Becoming UI Component Library

## Purpose

This document defines the core UI components for Becoming.

It translates the visual identity into implementable component rules engineers and AI coding tools can apply consistently across the product.

Use this file alongside:
- [VISUAL_IDENTITY.md](/Users/markmcdermott/Code/foundrs-prototype/VISUAL_IDENTITY.md)
- [BRAND.md](/Users/markmcdermott/Code/foundrs-prototype/BRAND.md)

The component library prioritises:
- calm, spacious UI
- clear hierarchy
- restrained motion
- constellation-based progress visuals
- accessible interaction states

## Global Tokens

### Colors

```txt
background.primary = #F7F6F3
text.primary       = #1F2933
border.neutral     = #E5E7EB

accent.blue        = #6C8CF5
accent.green       = #6FAF8F
accent.coral       = #FF8A7A
white              = #FFFFFF
```

### Typography

```txt
font.ui        = Inter
font.editorial = Canela
```

### Type Scale

```txt
display        = 36px / Canela / Regular
title          = 24px / Inter / Semibold
subtitle       = 20px / Inter / Semibold
body           = 16px / Inter / Regular
body.small     = 14px / Inter / Regular
caption        = 12px / Inter / Medium
button         = 16px / Inter / Medium
```

### Spacing

```txt
xs   = 4
sm   = 8
md   = 16
lg   = 24
xl   = 32
xxl  = 48
```

### Radius

```txt
sm   = 10
md   = 12
lg   = 16
xl   = 20
pill = 999
```

### Motion

```txt
fast   = 150ms
normal = 250ms
slow   = 400ms
easing = ease-out
```

## Component Principles

1. Components should feel light, calm, and breathable.
2. Primary actions should be visually clear but never loud.
3. Cards should separate content gently, not box it in aggressively.
4. Progress should be shown through dots, subtle structure, and pattern formation.
5. Color should support meaning, never carry meaning alone.

## Buttons

### Primary Button

Usage:
- use for the main action on a screen

Visual rules:
- background: `accent.blue`
- text color: `white`
- height: `48px`
- horizontal padding: `16px`
- border radius: `12px`
- shadow: none or extremely subtle

States:
- default: blue background
- pressed: 6 to 8 percent darker blue
- disabled: neutral border, muted fill, 60 percent opacity text

Copy rules:
- use plain labels like `Save`, `Continue`, `Add habit`, `Log today`
- avoid witty or branded CTA text

### Secondary Button

Usage:
- use for secondary actions

Visual rules:
- background: transparent
- border: `1px solid border.neutral`
- text: `text.primary`
- height: `44px` to `48px`
- border radius: `12px`

Example labels:
- Cancel
- Back
- Skip
- Edit

### Tertiary Button / Text Link

Usage:
- low emphasis action

Visual rules:
- no border
- no fill
- text color: `accent.blue` or `text.primary`
- underline only for inline text links

## Habit Tile

Purpose:
- core unit on the Today screen

Anatomy:
- habit name
- optional subtitle or time cue
- completion state
- dot or progress indicator
- optional streak badge

Visual rules:
- background: `white`
- border radius: `16px`
- padding: `16px`
- min height: `72px`
- spacing between tiles: `12px`
- border: `1px solid border.neutral` or extremely subtle shadow

States:

Default:
- white card
- slate text
- inactive dot placeholder

Completed:
- subtle green or blue accent
- filled progress dot
- optional checkmark
- completion animation allowed

Missed:
- keep neutral
- avoid alarm or red state
- use subdued text or outline variation only

## Check-In Control

Purpose:
- primary interaction for marking a habit complete

MVP decision:
- use a tappable circular checkbox

Visual rules:
- target size: minimum `44x44px`
- completion color: `accent.green`
- incomplete state: outline with neutral border
- completion includes subtle scale animation unless reduced motion is enabled

## Constellation Widget

Purpose:
- hero progress component used across Today, Tribe, and Profile

Role:
- decorative and informative

Implementation:
- use SVG for all MVP constellations
- do not use Canvas in MVP

Anatomy:
- nodes (dots)
- optional connections (lines)
- optional grouping or limited color variation
- subtle node appearance animation

Node rules:
- size: `6px` to `8px`
- shape: full circle
- default color: neutral or blue
- completed color: green or blue
- coral highlight only for rare delight moments

Connection rules:
- stroke width: `1px`
- color: slate at 20 to 30 percent opacity
- line caps: round

Behaviour by screen:

Today:
- small cluster
- represents today’s completed habits
- updates in real time

Tribe:
- small identity markers or header texture
- avoid turning this into a dense chart

Profile:
- larger long-term map
- still simple in MVP

Accessibility:
- constellation is never the only progress signal
- always pair with labels, counts, or completion states

## Progress Dot

Purpose:
- smallest progress primitive in the system

Usage:
- habit completion
- streak indicators
- weekly summaries
- constellation nodes

Visual rules:
- size: `6px`
- gap between dots: `6px` to `8px`
- inactive: light neutral
- active: blue or green
- special milestone: coral used sparingly

Motion:
- `scale(0) -> scale(1.15) -> scale(1.0)`
- duration: `250ms`

Respect reduced motion.

## Streak Badge

Purpose:
- compact milestone indicator

Visual rules:
- pill shape
- border radius: `pill`
- padding: `4px 10px`
- background: tinted neutral or pale accent
- text style: `caption`

Example labels:
- 3 day streak
- Weekly target met
- 80% this week

Rules:
- badges should feel informational, not gamified
- avoid flames, trophies, and competitive icon overload

## Stat Card

Purpose:
- used in Tribe and Profile to summarise progress

Visual rules:
- background: `white`
- radius: `16px`
- padding: `16px` to `20px`
- title: caption or label
- value: `24px` Inter Semibold or `36px` serif for reflective emphasis
- optional mini dot row or sparkline

Good stats:
- Check-ins this week
- Weekly consistency
- Habits completed
- Best streak

## Input Field

Purpose:
- used for creating or editing habits

Visual rules:
- height: `44px`
- border: `1px solid border.neutral`
- radius: `10px`
- padding: `12px 14px`
- background: `white`
- focus border: `accent.blue`

States:
- default
- focused
- error
- disabled

Error rules:
- use clear copy first
- avoid jokes in errors

Examples:
- Habit name is required.
- Try a shorter title.

## Text Area

Purpose:
- used for reflection, notes, or onboarding prompts

Visual rules:
- min height: `96px`
- same base styling as input
- generous line height
- optional serif placeholder for reflective prompts

## Segmented Control / Tabs

Purpose:
- switching views such as organization versus tribe, or profile subsections

MVP decision:
- use underline tabs for utility screens
- do not use filled pill tabs by default

Visual rules:
- active indicator: blue underline
- inactive tabs: slate text
- active tabs: semibold plus blue indicator
- spacing: generous

## Card List

Purpose:
- standard stacked layout for habits, tribe activity, and settings

Rules:
- vertical gap: `12px`
- maximum of one primary card style per screen
- avoid stacking too many bordered cards without whitespace
- insert whitespace between groups instead of adding extra borders

## Empty State Block

Purpose:
- communicate a blank state with calm encouragement

Anatomy:
- small abstract illustration or dot cluster
- title
- optional supporting sentence
- clear next action

Example layout:
- illustration
- `Nothing here yet.`
- `A suspiciously good place to begin.`
- primary button: `Add habit`

Rules:
- empty states may be slightly more playful than the rest of the UI

## Toast / Inline Feedback

Purpose:
- small feedback after user actions

Visual rules:
- background: slate or white with border
- radius: `12px`
- padding: `12px 14px`
- short duration: `2s` to `3s`
- avoid stacking multiple toasts

Copy examples:
- Habit saved.
- Logged for today.
- Changes updated.

Wit is allowed sparingly, but clarity comes first.

## Modal / Bottom Sheet

Purpose:
- focused action or additional detail without leaving context

Visual rules:
- rounded top corners: `20px`
- internal padding: `24px`
- drag handle subtle and neutral
- avoid nested modal flows

Use cases:
- add habit
- edit schedule
- quick weekly reflection

## Navigation Bar

### Top Navigation

- simple title
- optional action on the right
- avoid clutter

### Bottom Navigation

Tabs:
- Today
- Tribe
- Profile

Rules:
- icon plus label
- active color: blue
- inactive color: muted slate
- minimum tap target: `44px`

## Screen Rules

### Today Screen

Priority:
- fast logging
- low friction
- lightly rewarding

Composition:
1. Header
2. Today constellation
3. Habit list
4. Primary action if needed

Rules:
- constellation sits near the top as a reward layer, not a barrier to action
- habit list should be scannable in one glance
- avoid overloading with stats

### Tribe Screen

Priority:
- warm social reinforcement

Composition:
1. Friend highlights
2. Small constellation markers
3. Activity feed
4. Light reactions or encouragement

Rules:
- keep social tone warm, not competitive
- constellations act as identity markers more than charts

### Profile Screen

Priority:
- reflection and long-term progress

Composition:
1. User summary
2. Hero constellation map
3. Key stats
4. Habit history or patterns

Rules:
- this is the best place for deeper reflection
- editorial serif may appear in summary moments

### Onboarding Screen

Priority:
- clarity
- calmness
- ease

Composition:
1. Simple statement of value
2. Soft constellation or dot animation
3. Primary CTA
4. Minimal decisions per step

Rules:
- reduce copy density
- keep philosophy present but brief

## Accessibility Rules

1. All text must meet WCAG AA contrast standards.
2. Completion must not rely on color alone.
3. Interactive targets must be at least `44x44px`.
4. Motion must respect reduced-motion preferences.
5. Constellations must have text equivalents when used to convey progress.

## UI Do / Don’t

### Do

- use warm off-white backgrounds
- leave generous spacing
- keep cards light
- make progress feel subtle and satisfying
- use blue for action, green for completion, coral rarely

### Don’t

- crowd screens with too many boxed elements
- use coral as a general-purpose warning color
- over-animate progress
- use gamified reward tropes like flames and confetti everywhere
- let constellations distract from the main task

## Implementation Notes

Recommended approach:
- use SVG for constellation widgets
- centralise design tokens for spacing, radius, color, and type
- centralise motion values in theme tokens

Suggested token names:

```txt
color.bg.primary
color.text.primary
color.border.neutral
color.accent.blue
color.accent.green
color.accent.coral

space.xs
space.sm
space.md
space.lg
space.xl
space.xxl

radius.sm
radius.md
radius.lg
radius.xl
radius.pill

motion.fast
motion.normal
motion.slow
```

## Summary

The Becoming UI should feel like a calm, modern, reflective system for watching patterns form over time.

It is not a loud productivity dashboard.

It is a composed environment where habits become visible as constellations, progress feels steady, and every component supports the same emotional outcome:
- calm
- capable
- respected
- quietly motivated
