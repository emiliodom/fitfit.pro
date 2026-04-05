# FitFit UI Revamp Phases

## Phase 1: Foundation Shell + Video Studio
- Introduce a consistent app shell with improved spacing, contrast, and mobile behavior.
- Standardize shared timer UI via `src/components/common/TimerPanel.jsx`.
- Centralize video resolution logic in `src/utils/videoLibrary.js`.
- Add `Video Studio` admin page (`src/components/Admin/VideoAdminPage.jsx`) for local override editing and JSON export.

## Phase 2: Guided Routine Interaction
- Replace guided mode selects with tactile range sliders.
- Add explicit on/off toggle pattern for guided mode.
- Keep controls finger-friendly for mobile (`>=44px` touch targets).

## Phase 3: Rollout + Hardening (next)
- Convert remaining inline style controls to reusable classes.
- Add integration tests for:
  - timer panel presets
  - guided mode slider ranges
  - video override save/export path
- Evaluate route-level code splitting for large bundle warning.

## Video Studio Best Practices
- Source of truth in runtime: `resolveExerciseVideos()`.
- Storage strategy:
  - Base mappings from bundled JSON files.
  - User edits in localStorage (`fitfit_video_overrides_v1`).
- Export workflow:
  - Use `Export JSON` in Video Studio.
  - Review and merge exported overrides into `src/data/exerciseVideoOverrides.json` when promoting to repository defaults.

## UI Standards Introduced
- Primary actions use high-contrast solid buttons.
- Secondary actions use outline/ghost with clear hover feedback.
- Card-driven sections with consistent corner radius and spacing.
- Responsive shell with off-canvas navigation on smaller viewports.
