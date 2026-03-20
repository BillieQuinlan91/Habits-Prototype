# Becoming Visual Identity

## Overview

The visual identity of Becoming reflects the philosophy that small actions, repeated over time, form meaningful patterns in a life.

The system visualises this through dots forming constellations. Each completed habit becomes a dot. Over time these dots connect into patterns, representing routines emerging and identity forming.

The interface should feel:
- calm
- optimistic
- thoughtful
- modern
- quietly rewarding

The visual tone complements the product voice:

**Quiet wisdom with a raised eyebrow.**

The design should avoid productivity hype and instead emphasise steady progress and gentle accumulation.

## Core Visual Concept

### Constellations of Habits

The primary visual metaphor for the product is constellations.

Each completed habit creates a dot. As habits repeat, dots gradually connect into constellations.

This visual system represents:
- repeated behaviour
- patterns over time
- identity forming through action

Over time each user develops a unique constellation map representing their habits.

## App Icon

### Constellation Symbol

The app icon is a minimal constellation composed of several dots connected by thin lines.

Characteristics:
- 4 to 5 circular dots
- thin connecting lines
- asymmetrical but balanced layout
- rounded edges

Design principles:
- dots slightly larger than lines
- generous spacing
- minimal detail
- readable at small sizes

### Icon Colours

- Background: Dusty Blue
- Dots: Warm Off-White
- Connecting Lines: Soft Moss Green

The icon should feel calm, symbolic, and modern.

## Colour System

The palette communicates warm optimism and calm progress.

### Primary Background

- Warm Off-White
- `#F7F6F3`

Creates a soft, paper-like interface that feels reflective and calm.

### Primary Text

- Deep Slate
- `#1F2933`

Provides strong readability without harsh black.

### Accent Colours

#### Dusty Blue

- `#6C8CF5`
- Use for primary highlights, active habits, focus states, and interface emphasis

#### Soft Coral

- `#FF8A7A`
- Use sparingly for celebration moments, positive delight, and rare special achievements

#### Moss Green

- `#6FAF8F`
- Use for completed habits, long-term progress, and positive indicators

### Neutral UI Colour

- Light Grey
- `#E5E7EB`

Use for dividers, inactive elements, and subtle structure.

### Color Usage Rules

- Blue is the default action and focus color
- Green is the completion and progress color
- Coral is a rare accent, not a generic warning or error color
- Completion must never rely on color alone

## Typography

The typography system combines modern product clarity with editorial warmth.

### Primary Font — UI

- Font: `Inter`
- Use for navigation, buttons, labels, habit names, and general interface text

### Secondary Font — Editorial

- Font: `Canela` or equivalent serif
- Use for reflections, onboarding philosophy, milestone messages, and weekly summaries

### Type Principles

- Serif appears sparingly in reflective or editorial moments
- UI remains mostly sans-serif for clarity and speed
- Avoid excessive font mixing within a single block

## Dot System

Dots are the core visual building block.

Each completed habit creates a new dot. Dots accumulate and form constellations over time.

### Dot Behaviour

When a habit is completed:
1. A dot appears
2. The dot grows slightly
3. The dot settles into position

Animation pattern:

`scale(0) -> scale(1.15) -> scale(1.0)`

Timing:
- 200ms to 400ms
- ease-out easing

This should feel subtle and satisfying, not flashy.

## Constellation System

Dots gradually connect into constellations. Connections represent patterns emerging in behaviour.

Line characteristics:
- thin
- low opacity
- softly rounded

Connections should appear gradually as more dots accumulate.

This reinforces the idea that routines slowly form structure.

### MVP Implementation Rule

For MVP:
- use simple SVG constellations
- keep constellations decorative plus lightly informative
- do not build zoomable or highly interactive maps yet

## Illustration Style

Illustrations are abstract and minimal, using the same shapes as the UI.

Elements include:
- dots
- circles
- soft curves
- clustered patterns

Illustrations represent growth and emergence rather than literal objects.

Avoid:
- characters
- literal drawings
- decorative complexity

Illustrations should feel like data visualisation mixed with art.

## Motion Principles

Motion reinforces gradual progress.

Animations should be:
- calm
- smooth
- purposeful
- restrained

Avoid:
- fast animations
- flashy effects
- gamified reward bursts

Examples:
- Habit completion: dot appears, grows slightly, settles
- Weekly progress: dots slowly connect into constellations
- Long-term growth: constellations gradually expand

## Layout Principles

The interface should feel spacious and composed.

Use:
- generous margins
- clear hierarchy
- minimal visual noise

Think:
- journal
- reflective workspace
- personal dashboard

Avoid:
- crowded dashboards
- aggressive progress meters
- overly bright colours

### Mobile Layout Rules

- prioritize one primary task per screen
- avoid dense card stacks without whitespace breaks
- keep hero elements visible without pushing the main action below the fold
- respect bottom-nav safe space on mobile

## Signature Screens

### Today Screen

Shows the daily constellation forming.

- completed habits add dots
- uncompleted habits appear as faint placeholders
- the constellation acts as a reward layer, not a barrier to action

### Weekly View / Tribe

Shows a constellation pattern representing the week.

- dots connect to reveal behaviour patterns
- use constellations as identity markers or progress texture, not noisy charts

### Profile

Displays the user’s long-term constellation map.

- over time this becomes a visual representation of routines
- for MVP, keep this simple and calm rather than building a large exploratory map

## Emotional Outcome

The visual system should make users feel:
- calm
- proud
- reflective
- quietly motivated

Progress should feel like patterns emerging, not scores increasing.

## Accessibility Rules

- all text must meet WCAG AA contrast
- completion must not rely on color alone
- interactive elements must be at least `44x44px`
- motion must respect reduced-motion preferences
- constellations must have text equivalents when they convey progress

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
- rely on gamified reward tropes
- let constellations distract from the main task

## Brand Summary

The Becoming visual identity shows:

**Small actions forming constellations over time.**
