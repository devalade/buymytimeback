/**
 * @fileoverview Centralized application state store using EventTarget.
 */

import { DEFAULT_LANG } from "./constants.js";
import { detectLang, setLang as setI18nLang, persistLang, L } from "./i18n.js";
import { computeStats } from "./calculator.js";
import { loadActivities, saveActivities, markSeeded } from "./storage.js";

/** @typedef {import('./types.js').Activity} Activity */

/**
 * Generate a short unique id.
 * @returns {string}
 */
function uid() {
  return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

class Store extends EventTarget {
  constructor() {
    super();
    /** @type {Activity[]} */
    this.activities = [];
    /** @type {string} */
    this.lang = DEFAULT_LANG;
  }

  /**
   * Initialize state from storage/detection.
   */
  init() {
    this.lang = detectLang();
    setI18nLang(this.lang);

    this.activities = loadActivities();
    const justSeeded = this.maybeSeed();

    this.dispatchLangChange();
    this.dispatchActivitiesChange(justSeeded);
  }

  /**
   * Seed default activities if empty and never seeded.
   * @returns {boolean}
   */
  maybeSeed() {
    if (this.activities.length > 0) {
      return false;
    }
    const examples = L().examples || [];
    this.activities = examples.map((ex) => ({
      id: uid(),
      name: ex.name,
      minutes: Math.max(1, Math.min(1440, Math.round(ex.minutes)))
    }));
    markSeeded();
    saveActivities(this.activities);
    return true;
  }

  /**
   * Set active language.
   * @param {string} code
   */
  setLang(code) {
    this.lang = code;
    setI18nLang(code);
    persistLang();
    this.dispatchLangChange();
    this.dispatchActivitiesChange(false);
  }

  /**
   * Add a new activity.
   * @param {string} name
   * @param {number} minutes
   */
  addActivity(name, minutes) {
    this.activities.push({
      id: uid(),
      name: name.trim(),
      minutes: Math.max(1, Math.min(1440, Math.round(minutes)))
    });
    saveActivities(this.activities);
    this.dispatchActivitiesChange(true);
  }

  /**
   * Remove an activity by ID.
   * @param {string} id
   */
  removeActivity(id) {
    this.activities = this.activities.filter((a) => a.id !== id);
    saveActivities(this.activities);
    this.dispatchActivitiesChange(false);
  }

  /**
   * Clear all activities.
   */
  clearAll() {
    this.activities = [];
    saveActivities(this.activities);
    this.dispatchActivitiesChange(false);
  }

  /**
   * Compute current stats.
   * @returns {import('./types.js').Stats}
   */
  getStats() {
    return computeStats(this.activities);
  }

  dispatchLangChange() {
    this.dispatchEvent(new CustomEvent("lang-changed", { detail: { lang: this.lang } }));
  }

  /**
   * @param {boolean} animate
   */
  dispatchActivitiesChange(animate) {
    this.dispatchEvent(
      new CustomEvent("activities-changed", {
        detail: {
          activities: this.activities,
          stats: this.getStats(),
          animate
        }
      })
    );
  }
}

export const store = new Store();
