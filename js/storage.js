/**
 * @fileoverview localStorage persistence helpers.
 */

import { STORAGE_KEY } from "./constants.js";

/** @typedef {import('./types.js').Activity} Activity */

/**
 * Load activities from localStorage.
 * @returns {Activity[]}
 */
export function loadActivities() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.activities)) {
      return parsed.activities.filter(
        (a) => a && typeof a.name === "string" && typeof a.minutes === "number"
      );
    }
  } catch {
    // Ignore localStorage errors.
  }
  return [];
}

/**
 * Persist activities to localStorage.
 * @param {Activity[]} activities
 */
export function saveActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities }));
  } catch {
    // Ignore localStorage errors.
  }
}
