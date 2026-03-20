# Becoming Constellation System

## Purpose

This document defines the constellation system for Becoming.

The constellation system is the signature visual feature of the product. It turns repeated habit actions into dots and connections so users can see patterns forming over time.

This spec is intended for:
- engineers
- designers
- AI coding tools
- animation and front-end implementation

Use this document alongside:
- [VISUAL_IDENTITY.md](/Users/markmcdermott/Code/foundrs-prototype/VISUAL_IDENTITY.md)
- [UI_COMPONENT_LIBRARY.md](/Users/markmcdermott/Code/foundrs-prototype/UI_COMPONENT_LIBRARY.md)
- [BRAND.md](/Users/markmcdermott/Code/foundrs-prototype/BRAND.md)

## Core Principle

A constellation is a visual representation of accumulated habit actions.

Each completed habit creates a node. Repeated habit activity causes nodes to cluster and connect.

The system should communicate:
- gradual progress
- repeated behaviour
- quiet accumulation
- identity emerging over time

Constellations should feel:
- calm
- organic
- legible
- meaningful
- lightly rewarding

They must never feel:
- noisy
- overly decorative
- game-like
- hard to interpret

## System Roles

The constellation system serves two roles.

### Informational

It shows progress patterns over time.

Examples:
- habits completed today
- weekly consistency
- long-term accumulation

### Brand / Identity

It gives Becoming a distinctive visual language.

Examples:
- profile hero visual
- onboarding motion
- empty state illustrations
- app icon inspiration

## Placement Rules

Constellations should appear only in these contexts.

### Today Screen

Purpose: immediate progress feedback

- small constellation
- reflects today’s completed habits
- updates in real time as habits are checked off

### Weekly / Tribe View

Purpose: reveal weekly pattern

- medium constellation
- shows grouped activity across days
- connections become more visible

### Profile

Purpose: long-term reflection

- largest constellation
- represents ongoing habit identity
- aggregates across habits over time

### Onboarding

Purpose: symbolic brand moment

- decorative growth animation
- not required to carry detailed meaning

### Tribe

Purpose: lightweight identity marker

- tiny constellation motif or secondary header visual
- remains secondary to names and social actions

## What a Node Represents

A node is a single point in the constellation.

Default meaning:
- one completed habit event

Allowed alternative for aggregate profile views:
- one grouped cluster representing a habit over time

Rule:
- node meaning must remain consistent within a given screen
- do not mix meanings on the same visual without explicit explanation

## Node Specification

### Shape

- full circle only

### Default Size

- 6px mobile default
- may scale to 8px on hero or profile visualizations

### States

- inactive placeholder: neutral tint
- active: blue or green
- highlight: coral used sparingly for milestone emphasis

### Colors

Recommended:
- active default: `#6C8CF5`
- completed/progress-heavy: `#6FAF8F`
- milestone accent: `#FF8A7A`
- inactive / placeholder: `#D9DDE3`

### Visual Rules

- circles only
- no stars, diamonds, trophies, or decorative symbols
- node size variation should be limited and meaningful

## Connection Specification

Connections indicate emerging pattern, not strict data dependency.

### Line Style

- 1px stroke
- rounded caps
- slate or neutral line at 20 to 30 percent opacity

### Behaviour

- lines appear after minimum density threshold is reached
- not every dot needs to connect
- prioritize visual clarity over completeness

### Rules

- avoid dense spiderwebs
- avoid crossing lines when possible
- prefer short local connections

## Layout Logic

Constellations should feel organic, not random and not rigid.

### Preferred Layout Approaches

#### Loose Grid with Jitter

Best for:
- Today screen
- Weekly summaries

Method:
- start from a grid or hex grid
- apply slight positional jitter
- preserve balanced spacing

#### Cluster Layout

Best for:
- Profile
- grouped habits
- category-based habit views

Method:
- cluster related nodes
- connect within clusters first
- allow soft spacing between clusters

#### Force-Directed Layout

Reserved for future experimental views only. Not for MVP.

### Default Recommendation

For MVP:
- Today: loose grid with jitter
- Weekly / Tribe: loose grid with light grouping by day
- Profile: clustered layout aggregated by habit

## Layout Constraints

All constellation layouts must follow these rules:

- minimum node-to-node distance: 12px
- ideal node-to-node distance: 16px to 24px
- keep composition centred within container
- maintain visual balance
- do not place nodes too close to screen edges
- preserve layout stability between sessions when possible

Stability matters. Users should feel they are returning to their constellation, not seeing a random redraw each time.

## Deterministic Positioning

Where possible, node placement should be deterministic.

### Recommended Inputs for Seeding

- user id
- habit id
- completion date
- screen type

### Goal

Given the same data set, the constellation should render in the same arrangement.

This supports:
- recognition
- continuity
- emotional attachment

## Screen-by-Screen Rules

### Today Screen Constellation

Purpose:
- immediate feedback for today’s effort

Size:
- compact
- visible above the habit list without pushing the main task below the fold

Data model:
- one node per completed habit today

Placeholder behaviour:
- optional faint placeholders for remaining habits
- placeholders must be visually lighter and not distracting

Connection logic:
- no connections below 3 completions
- begin showing light connections after 3 or more completed habits

UX goal:
- make completion feel calm and satisfying

### Weekly / Tribe Constellation

Purpose:
- reveal weekly pattern

Size:
- medium
- suitable for a card hero area or top section

Data model for MVP:
- one node per completed habit event this week
- aggregate only if density becomes unreadable

Grouping:
- light grouping by day

Connection logic:
- stronger than Today
- show pattern emergence clearly
- keep density legible

UX goal:
- help users see consistency, not just count totals

### Profile Constellation

Purpose:
- long-term visual identity

Size:
- largest constellation in the app
- hero visual on Profile

Data model for MVP:
- aggregated by habit cluster over time

Interaction:
- static or subtly animated only
- no pinch, zoom, filtering, or tap tooltips in MVP

UX goal:
- make the user feel they are looking at a map of their becoming

## Motion Rules

Motion should feel like quiet arrival, not reward explosion.

### Node Appearance Animation

Use when a habit is completed.

Animation:
- opacity: 0 to 1
- scale: 0 to 1.15 to 1.0

Duration:
- 250ms

Easing:
- ease-out

### Connection Appearance

Animation:
- line fade-in only

Duration:
- 250ms to 400ms

### Idle Motion

Allowed only sparingly.

Recommendation:
- prefer static constellations with event-based motion
- no continuous drift in MVP

## Reduced Motion

Respect system reduced-motion settings.

If reduced motion is enabled:
- remove scale bounce
- use opacity fade only
- avoid animated line drawing
- avoid idle motion

## Color Usage Rules

### Dusty Blue

Use for:
- active or default progress nodes
- interactive highlight states

### Moss Green

Use for:
- completed and settled progress
- sustained consistency

### Soft Coral

Use only for:
- milestone emphasis
- rare highlight moments

Do not use coral:
- as a default node color
- for warnings
- for generic emphasis everywhere

### Neutral

Use for:
- placeholders
- inactive states
- subtle structure

Color must never be the only signal of completion.

## Accessibility Rules

Constellations must support interpretation beyond color.

Required supports:
- labels
- completion counts
- supporting text where needed
- check icons or badges in related UI

Contrast:
- maintain visible node/background contrast
- line opacity must remain visible on warm off-white backgrounds

Touch:
- if nodes are interactive, hit targets must be at least 44x44px via invisible tap area

Screen reader guidance:
- decorative constellations should be hidden from assistive tech
- informative constellations should have accessible summary text

Example:
- `4 of 6 habits completed today. Your constellation has 4 active nodes.`

## Performance Guidance

The constellation system should remain lightweight.

### Preferred Rendering

- SVG for small and medium constellations
- Canvas only for future large, highly dynamic maps

### Suggested Limits for MVP

- Today: up to 12 nodes
- Weekly: up to 40 nodes
- Profile: aggregate visible nodes to preserve clarity and performance

### Avoid

- continuously running simulations on mobile
- unnecessary particle effects
- redrawing the full layout on every state change

## Data Aggregation Rules

To prevent visual overload, larger views should aggregate data.

### Today

- no aggregation

### Weekly / Tribe

- aggregate only if node count exceeds readable density

### Profile

- always aggregate by habit cluster

## Engineering Recommendations

### Suggested Data Shape

```json
{
  "nodes": [
    {
      "id": "node_1",
      "habitId": "habit_1",
      "date": "2026-03-20",
      "status": "completed",
      "x": 120,
      "y": 80,
      "cluster": "health",
      "highlight": false
    }
  ],
  "edges": [
    {
      "from": "node_1",
      "to": "node_2"
    }
  ]
}
```

### Suggested Rendering Architecture

1. prepare data
2. compute deterministic layout
3. render nodes
4. render edges
5. animate only new nodes and edges

### State Change Recommendation

On new completion:
- preserve existing node positions
- add only the new node and any new local edges
- avoid full layout reshuffle

## MVP Implementation Status

Current app status:
- placeholder SVG constellation widgets are in place

Next implementation goal:
- deterministic seeded layouts per screen type
- today-specific placeholder nodes
- weekly density rules
- profile clustering by habit

## Visual Do / Don’t

### Do

- keep constellations sparse and legible
- let patterns emerge gradually
- preserve stability across sessions
- use motion only to acknowledge change
- make the constellation supportive of the main task

### Don’t

- draw every possible edge
- use random layouts that change constantly
- overload the screen with decorative nodes
- let constellations compete with buttons and habit actions
- turn the visualization into a gamified fireworks display

## Summary

The constellation system is the visual expression of Becoming’s core idea:

**small actions forming patterns over time.**

It should help users see progress as something that accumulates quietly and meaningfully.

The best implementation will feel:
- calm
- stable
- elegant
- rewarding
- personal
