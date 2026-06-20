/**
 * @fileoverview Application constants.
 */

export const STORAGE_KEY = "buymytimeback.activities.v1";
export const LANG_KEY = "buymytimeback.lang.v1";
export const SEED_KEY = "buymytimeback.seeded.v1";
export const DEFAULT_LANG = "fr";

export const MIN_PER_DAY_AWAKE = 960;
export const MIN_PER_DAY = 1440;
export const DAYS_PER_MONTH = 30.44;
export const DAYS_PER_YEAR = 365.25;

export const COMPARISONS = [
  { key: "books", perUnit: 300 },
  { key: "films", perUnit: 120 },
  { key: "marathons", perUnit: 240 },
  { key: "workdays", perUnit: 480 },
  { key: "flights", perUnit: 540 }
];

export const PROJECTIONS = [
  { years: 1, key: "y1" },
  { years: 5, key: "y5" },
  { years: 10, key: "y10" }
];
