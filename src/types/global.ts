/**
 * TYPEPLAY — Global Types
 * ==========================================================================
 * Domain-wide type definitions. Phase 1 establishes only the foundational
 * types; richer typing, session, and music types will be added as their
 * respective phases are implemented.
 */

/* --------------------------------------------------------------------------
 * Navigation
 * -------------------------------------------------------------------------- */

/** Semantic route identifiers used across the application. */
export type RouteId =
  | 'home'
  | 'practice'
  | 'test'
  | 'learn'
  | 'progress'
  | 'music'
  | 'settings';

/** Per-route navigation metadata for the header and routing config. */
export interface NavItem {
  /** Unique route identifier (matches a RouteId). */
  id: RouteId;
  /** User-facing label shown in the UI. */
  label: string;
  /** URL path the route is mounted at. */
  path: string;
  /** Short description used for tooltips / accessibility. */
  description: string;
}

/* --------------------------------------------------------------------------
 * Settings (foundation)
 * -------------------------------------------------------------------------- */

/** Visual theme preference. Further themes may be added in later phases. */
export type ThemePreference = 'dark' | 'light' | 'system';

/**
 * All persisted application settings.
 *
 * Phase 1 establishes the shape and persistence mechanism only. Concrete
 * volumes and music selection values are intentionally optional here; they
 * are filled in as the audio and music systems are built (Phase 7) so the
 * store always reflects only features that actually exist.
 */
export interface Settings {
  /** Master music volume, 0–100. */
  musicVolume: number;
  /** Typing sound FX volume, 0–100. */
  typingSoundVolume: number;
  /** Identifier of the currently selected music track, or null for none. */
  selectedMusic: string | null;
  /** Prefer keeping motion to a minimum (respects OS-level preference too). */
  reducedMotion: boolean;
  /** Visual theme preference. */
  theme: ThemePreference;
  /** ISO timestamp of the last settings change, for diagnostics. */
  updatedAt: string;
}

/* --------------------------------------------------------------------------
 * Persistence
 * -------------------------------------------------------------------------- */

/** Key under which TypePlay data is stored in localStorage. */
export const STORAGE_KEYS = {
  settings: 'typeplay:settings',
  learning: 'typeplay:learning',
  history: 'typeplay:history',
} as const;
