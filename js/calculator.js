/**
 * @fileoverview Pure calculation and formatting functions.
 */

import { MIN_PER_DAY_AWAKE, MIN_PER_DAY, DAYS_PER_MONTH, DAYS_PER_YEAR } from "./constants.js";
import { bcp47, L } from "./i18n.js";

/** @typedef {import('./types.js').Stats} Stats */
/** @typedef {import('./types.js').Activity} Activity */

/**
 * Format a number with locale-specific grouping.
 * @param {number} n
 * @returns {string}
 */
export function nf(n) {
  return new Intl.NumberFormat(bcp47()).format(Math.round(n));
}

/**
 * Format a duration in minutes into a human-readable string.
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  const dict = L();
  minutes = Math.max(0, Math.round(minutes));

  if (minutes < 60) {
    return `${minutes} ${dict.unit.min}`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (minutes < MIN_PER_DAY) {
    return mins === 0 ? `${hours} ${dict.unit.hour}` : `${hours} ${dict.unit.hour} ${mins}`;
  }

  const days = Math.floor(minutes / MIN_PER_DAY);
  const remMin = minutes - days * MIN_PER_DAY;
  const remHours = Math.floor(remMin / 60);
  if (remHours === 0) {
    return `${days} ${dict.unit.day}`;
  }
  return `${days} ${dict.unit.day} ${remHours} ${dict.unit.hour}`;
}

/**
 * Compute aggregate statistics from a list of activities.
 * @param {Activity[]} activities
 * @returns {Stats}
 */
export function computeStats(activities) {
  const perDay = activities.reduce((sum, a) => sum + a.minutes, 0);
  return {
    perDay,
    perWeek: perDay * 7,
    perMonth: perDay * DAYS_PER_MONTH,
    perYear: perDay * DAYS_PER_YEAR,
    lifePct: (perDay / MIN_PER_DAY_AWAKE) * 100,
    recoverPerYear: perDay * DAYS_PER_YEAR,
    recoverDays: (perDay * DAYS_PER_YEAR) / MIN_PER_DAY
  };
}
