# Becoming Team Ring System

## Purpose

This document defines the active progress-visual system for Becoming.

The team ring system replaces the earlier constellation-based completion model.

It is intended for:
- engineers
- designers
- AI coding tools
- front-end and animation implementation

Use this document alongside:
- [VISUAL_IDENTITY.md](/Users/markmcdermott/Code/foundrs-prototype/VISUAL_IDENTITY.md)
- [UI_COMPONENT_LIBRARY.md](/Users/markmcdermott/Code/foundrs-prototype/UI_COMPONENT_LIBRARY.md)
- [BRAND.md](/Users/markmcdermott/Code/foundrs-prototype/BRAND.md)

## Overview

This feature implements a team-based habit completion dashboard centered around a segmented progress ring.

The system emphasizes:
- collective accountability
- individual visibility
- forgiveness layer through weekly correction of missed check-ins

## Core Concepts

### Entities

```ts
type User = {
  id: string;
  name: string;
  avatarUrl: string;
  color: string;
};

type Team = {
  id: string;
  name: string;
  members: User[];
};

type HabitCheckIn = {
  userId: string;
  date: string;
  completed: boolean;
  checkInTimestamp: Date | null;
  confirmedLater: boolean;
};
```

## Daily Completion Logic

A user is complete for the day if:

```ts
completed === true && checkInTimestamp != null;
```

Team completion:

```ts
teamCompletion = checkedInUsers / totalUsers;
```

## Weekly Completion Logic

A user is complete for the week if:

```ts
completed === true;
```

Notes:
- users can retroactively mark completion
- weekly completion is separate from daily completion

## Segmented Team Ring

### Structure

- circular ring
- split into N equal segments
- one segment per user

### Segment States

- `COMPLETE`: filled with user color
- `PENDING`: grey
- `MISSED`: muted red after cutoff

### Animation

- on check-in: segment fills over 300 to 500 milliseconds
- on 100 percent: use a subtle glow or pulse

### Center Text

Primary:
- `{XX}% complete`

Subtext:
- below 100 percent: `Waiting on {names}`
- at 100 percent: `Perfect day`

## Waiting On Logic

```ts
const remainingUsers = users.filter((u) => !checkedInToday(u));
```

Output:
- 1 remaining: `Waiting on Alex`
- 2 remaining: `Waiting on Alex and Billie`
- 3 or more remaining: `Waiting on Alex, Billie + {n} others`

## Avatar Row

Each user has:
- `COMPLETE`: green or check state
- `PENDING`: grey
- `MISSED`: red

The row should make it immediately clear who has and has not checked in.

## Weekly Grid

### Structure

- rows = users
- columns = days

### States

- `checked in`
- `completed later`
- `not completed`

### Rules

- users can edit past days
- week can be locked after completion later if product rules require it

## Time Rules

- daily cutoff: 11:59 PM local time

After cutoff:
- unchecked users become `missed`
- those days are still editable for weekly completion

## Interactions

### Check-in

```ts
onCheckIn(userId) {
  create HabitCheckIn({
    completed: true,
    checkInTimestamp: now,
  });
}
```

### Retroactive Completion

```ts
onRetroComplete(userId, date) {
  update HabitCheckIn({
    completed: true,
    confirmedLater: true,
  });
}
```

## Edge Cases

- if a user never checks in, they remain in `waiting on` until cutoff
- if team size changes, recalculate segments from current team state
- allow only one check-in per user per day

## Success Criteria

The user should be able to instantly answer:
- did we hit 100 percent
- who is missing

## MVP Implementation Guidance

For MVP:
- use SVG for the segmented ring
- keep user segment ordering deterministic
- prioritize instant legibility over decorative complexity
- treat the weekly grid as the canonical weekly recovery view

## Status

Active source of truth for progress visuals and shared-completion UI.
