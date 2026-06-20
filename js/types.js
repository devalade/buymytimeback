/**
 * @fileoverview Shared JSDoc type definitions.
 */

/**
 * @typedef {Object} Locale
 * @property {string} bcp47
 * @property {string} label
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} name
 * @property {number} minutes
 */

/**
 * @typedef {Object} Stats
 * @property {number} perDay
 * @property {number} perWeek
 * @property {number} perMonth
 * @property {number} perYear
 * @property {number} lifePct
 * @property {number} recoverPerYear
 * @property {number} recoverDays
 */

/**
 * @typedef {Object} ComparisonConfig
 * @property {string} key
 * @property {number} perUnit
 */

/**
 * @typedef {Object} ProjectionConfig
 * @property {number} years
 * @property {string} key
 */

export {};
