# Technical Decisions

This document records why the current prototype was built the way it was. It should grow as the project becomes more real.

## 1. Built as plain HTML, CSS, and JavaScript

Decision:
Use a dependency-free static prototype instead of scaffolding React, Next.js, or another framework.

Why:
- The workspace did not contain an existing app to extend.
- This allowed immediate progress without package installation or project bootstrapping.
- It keeps the first pass easy to inspect for product review.

Tradeoff:
- State management, rendering, and navigation are all hand-rolled.
- This is fine for a prototype, but not the likely long-term architecture.

## 2. Onboarding-first information architecture

Decision:
Make onboarding the default entry experience, then route users into a focused two-screen daily flow.

Why:
- The latest product direction prioritizes first-time setup and daily behavior over broad browsing.
- This creates a cleaner user journey than the earlier tab-first prototype.

Tradeoff:
- Cross-tribe leaderboard and broader community views are no longer in the primary path.

## 3. Mobile web first layout

Decision:
Design the layout around a narrow mobile viewport and expand it at larger widths.

Why:
- The PRD explicitly called for mobile web first.
- The primary action in v1 is a quick daily check-in, which benefits from short, focused mobile flows.

Tradeoff:
- Desktop behavior is acceptable but not deeply optimized yet.

## 4. Local mock data instead of persistence

Decision:
Keep tribes, habits, member progress, and leaderboard numbers in static JavaScript objects.

Why:
- The goal of this pass was to make the product loop tangible, not to solve backend architecture prematurely.
- It enables rapid UI iteration while product decisions are still fresh.

Tradeoff:
- Refreshing the page resets state.
- Scores and member progress are illustrative, not computed from historical events.

## 5. Structured habit commitments

Decision:
Model committed habits as structured objects with typed targets instead of plain habit labels.

Why:
- The onboarding flow needs concrete commitments such as times, counts, durations, or rule statements.
- This makes the prototype closer to a real product model and easier to validate in tests.

Tradeoff:
- The app logic is more involved than the original string-based prototype.

## 6. Mocked wearable integrations at the habit level

Decision:
Represent integrations as per-habit tracking sources with mocked sync values rather than fake full OAuth/device connections.

Why:
- The requested UX is per-habit automatic tracking, not a single account-level toggle.
- The prototype remains front-end only, so real health-device auth is out of scope for now.

Tradeoff:
- The UI and logic can demonstrate automatic updates, but the sync values are seeded locally rather than fetched from real providers.

## 7. Full rerender approach

Decision:
Use simple render functions that replace relevant HTML blocks after state changes.

Why:
- The DOM is small enough that performance is not a concern.
- This keeps the code easy to follow for future agents and early product iteration.

Tradeoff:
- As the UI grows, this approach will become harder to maintain than a component-based framework.

## 8. Dedicated post-log tribe members screen

Decision:
Route users to a dedicated tribe-members screen immediately after they log the day.

Why:
- The desired product loop is daily log first, social accountability second.
- This makes the encourage/celebrate moment feel like a direct consequence of logging.

Tradeoff:
- It narrows the product surface and de-emphasizes broader navigation for now.

## 9. Edit flow reuses onboarding

Decision:
Use the same onboarding screens for editing name, tribe, and commitments after setup.

Why:
- The requested scope includes editing setup without introducing a separate settings system.
- Reusing the onboarding screens keeps the prototype smaller and more coherent.

Tradeoff:
- The onboarding screens now handle both first-run and edit states, which adds conditional rendering.

## 10. Privacy model reflected in the UI

Decision:
Show individual member state only inside the selected tribe and keep the social actions positive-only.

Why:
- This remains a core product constraint from the PRD.
- It avoids turning the app into a surveillance tool or guilt-heavy performance board.

Tradeoff:
- The prototype communicates privacy rules visually, but still does not enforce them through backend permissions.

## 11. Visual direction chosen to avoid generic SaaS styling

Decision:
Use warm neutrals, green accents, serif display typography, and layered gradients.

Why:
- The product brief called for a premium, playful, non-corporate feel.
- The design needed to avoid default “white dashboard with purple accents” patterns.

Tradeoff:
- Brand styling is still interpretive and may need refinement against a fuller Foundrs design system.
