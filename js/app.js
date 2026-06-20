/**
 * @fileoverview Application state, DOM rendering, and event binding.
 */

import { DEFAULT_LANG, COMPARISONS, PROJECTIONS, MIN_PER_DAY } from "./constants.js";
import {
  LOCALES,
  I18N,
  setLang as setI18nLang,
  getLang,
  L,
  t,
  detectLang,
  persistLang
} from "./i18n.js";
import { computeStats, nf, formatDuration } from "./calculator.js";
import { loadActivities, saveActivities, hasSeeded, markSeeded } from "./storage.js";

/** @typedef {import('./types.js').Activity} Activity */

const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $all = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

/**
 * @type {Activity[]}
 */
let activities = [];

/**
 * @type {number}
 */
let phIndex = 0;

/**
 * @type {ReturnType<typeof setInterval> | null}
 */
let phTimer = null;

/**
 * @type {Record<string, HTMLElement | null>}
 */
const els = {};

/**
 * Generate a short unique id.
 * @returns {string}
 */
function uid() {
  return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * Escape HTML special characters.
 * @param {string} s
 * @returns {string}
 */
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

/**
 * Update an existing meta tag, if present.
 * @param {string} attr
 * @param {string} key
 * @param {string | null} content
 */
function setMeta(attr, key, content) {
  const el = document.querySelector(`meta[${attr}="${key}"]`);
  if (el && content != null) {
    el.setAttribute("content", content);
  }
}

/**
 * Apply the current locale's static translations.
 */
function applyTranslations() {
  $all("[data-i18n]").forEach((el) => {
    el.textContent = String(t(el.getAttribute("data-i18n")) ?? "");
  });
  $all("[data-i18n-html]").forEach((el) => {
    el.innerHTML = String(t(el.getAttribute("data-i18n-html")) ?? "");
  });
  $all("[data-i18n-ph]").forEach((el) => {
    el.placeholder = String(t(el.getAttribute("data-i18n-ph")) ?? "");
  });
}

/**
 * Apply SEO meta tags for the current locale.
 */
function applySeo() {
  const seo = L().seo;
  if (!seo) {
    return;
  }
  document.title = String(seo.title);
  setMeta("name", "description", String(seo.description));
  setMeta("property", "og:title", String(seo.title));
  setMeta("property", "og:description", String(seo.ogDescription || seo.description));
  setMeta(
    "property",
    "og:locale",
    (LOCALES[getLang()] || LOCALES[DEFAULT_LANG]).bcp47.replace("-", "_")
  );
  setMeta("name", "twitter:title", String(seo.title));
  setMeta(
    "name",
    "twitter:description",
    String(seo.twitterDescription || seo.ogDescription || seo.description)
  );
}

/**
 * Set the active language and refresh the UI.
 * @param {string} code
 */
function setLang(code) {
  if (!I18N[code]) {
    code = DEFAULT_LANG;
  }
  setI18nLang(code);
  document.documentElement.lang = code;
  persistLang();
  applyTranslations();
  applySeo();
  startPlaceholderCycle();
  updateActiveLangButton();
  renderList();
  renderVerdict(false);
}

/**
 * Build the language switcher buttons.
 */
function buildLangSwitcher() {
  const container = els.langSwitcher;
  if (!container) {
    return;
  }
  container.innerHTML = "";
  Object.keys(LOCALES).forEach((code) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang__btn";
    btn.dataset.lang = code;
    btn.textContent = LOCALES[code].label;
    btn.addEventListener("click", () => setLang(code));
    container.appendChild(btn);
  });
}

/**
 * Update the active state of language buttons.
 */
function updateActiveLangButton() {
  const lang = getLang();
  $all(".lang__btn", els.langSwitcher).forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-pressed", String(isActive));
  });
}

/**
 * Seed the inventory with default examples on first visit.
 * @returns {boolean}
 */
function maybeSeed() {
  if (hasSeeded()) {
    return false;
  }
  if (activities.length > 0) {
    return false;
  }
  const examples = L().examples || [];
  activities = examples.map((ex) => ({
    id: uid(),
    name: ex.name,
    minutes: Math.max(1, Math.min(1440, Math.round(ex.minutes)))
  }));
  markSeeded();
  saveActivities(activities);
  return true;
}

/**
 * Add a new activity.
 * @param {string} name
 * @param {number} minutes
 */
function addActivity(name, minutes) {
  activities.push({
    id: uid(),
    name: name.trim(),
    minutes: Math.max(1, Math.min(1440, Math.round(minutes)))
  });
  saveActivities(activities);
  renderList();
  renderVerdict(true);
}

/**
 * Remove an activity by id.
 * @param {string} id
 */
function removeActivity(id) {
  activities = activities.filter((a) => a.id !== id);
  saveActivities(activities);
  renderList();
  renderVerdict(false);
}

/**
 * Clear all activities after confirmation.
 */
function clearAll() {
  if (!activities.length) {
    return;
  }
  if (!window.confirm(String(t("confirm.reset")))) {
    return;
  }
  activities = [];
  saveActivities(activities);
  renderList();
  renderVerdict(false);
}

/**
 * Render the activity list.
 */
function renderList() {
  const list = els.list;
  const empty = els.listEmpty;
  if (!list || !empty) {
    return;
  }

  list.innerHTML = "";
  if (!activities.length) {
    empty.style.display = "";
    return;
  }

  empty.style.display = "none";
  const dict = L();
  const fragment = document.createDocumentFragment();

  activities.forEach((a, i) => {
    const li = document.createElement("li");

    const idx = document.createElement("span");
    idx.className = "row__idx";
    idx.textContent = String(i + 1).padStart(2, "0");

    const name = document.createElement("span");
    name.className = "row__name";
    name.innerHTML = `<strong>${escapeHtml(a.name)}</strong>`;

    const meta = document.createElement("span");
    meta.className = "row__meta";
    meta.innerHTML = `<b>${a.minutes}</b> ${dict.row.minSuffix}`;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "row__del";
    del.setAttribute("aria-label", `${dict.row.del} ${a.name}`);
    del.innerHTML = `<span class="row__del-text">${dict.row.del}</span>`;
    del.addEventListener("click", () => removeActivity(a.id));

    li.appendChild(idx);
    li.appendChild(name);
    li.appendChild(meta);
    li.appendChild(del);
    fragment.appendChild(li);
  });

  list.appendChild(fragment);
}

/**
 * Render the full verdict panel.
 * @param {boolean} animate
 */
function renderVerdict(animate) {
  const verdict = els.verdict;
  if (!verdict) {
    return;
  }

  const s = computeStats(activities);
  setCountTarget(els.recover, s.recoverDays, (v) => nf(v), animate);
  renderOpportunityNote(s);

  if (!activities.length) {
    verdict.hidden = true;
    return;
  }

  verdict.hidden = false;
  setCountTarget(els.day, s.perDay, formatDuration, animate);
  setCountTarget(els.week, s.perWeek, formatDuration, animate);
  setCountTarget(els.month, s.perMonth, formatDuration, animate);
  setCountTarget(els.year, s.perYear, formatDuration, animate);
  setCountTarget(els.life, s.lifePct, (v) => `${Math.round(v)}%`, animate);

  const fillPct = Math.min(100, s.lifePct);
  if (animate) {
    els.lifeFill.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.lifeFill.style.width = `${fillPct.toFixed(1)}%`;
      });
    });
  } else {
    els.lifeFill.style.width = `${fillPct.toFixed(1)}%`;
  }

  renderComparisons(s.perYear);
  renderProjections(s.perDay);

  if (animate) {
    revealVerdict(verdict);
  }
}

/**
 * Render the comparison list.
 * @param {number} perYear
 */
function renderComparisons(perYear) {
  const ul = els.compareList;
  if (!ul) {
    return;
  }
  ul.innerHTML = "";
  const dict = L();
  const fragment = document.createDocumentFragment();

  COMPARISONS.forEach((c) => {
    const n = Math.floor(perYear / c.perUnit);
    const entry = dict.compare[c.key] || { one: c.key, many: c.key, label: "" };
    const unit = n <= 1 ? entry.one : entry.many;

    const li = document.createElement("li");
    const nEl = document.createElement("span");
    nEl.className = "compare__n";
    nEl.textContent = nf(n);
    const lab = document.createElement("span");
    lab.className = "compare__label";
    lab.innerHTML = `<b>${escapeHtml(unit)}</b> ${escapeHtml(entry.label)}`;

    li.appendChild(nEl);
    li.appendChild(lab);
    fragment.appendChild(li);
  });

  ul.appendChild(fragment);
}

/**
 * Render the projection list.
 * @param {number} perDay
 */
function renderProjections(perDay) {
  const ul = els.projectList;
  if (!ul) {
    return;
  }
  ul.innerHTML = "";
  const dict = L();
  const fragment = document.createDocumentFragment();

  PROJECTIONS.forEach((sp) => {
    const totalMin = perDay * 365 * sp.years;
    const days = totalMin / MIN_PER_DAY;

    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "project__span";
    span.textContent = String(dict.proj[sp.key]);
    const val = document.createElement("span");
    val.className = "project__val";
    val.innerHTML = `${nf(days)} <small>${escapeHtml(dict.proj.daysLost)}</small>`;

    li.appendChild(span);
    li.appendChild(val);
    fragment.appendChild(li);
  });

  ul.appendChild(fragment);
}

/**
 * Update the opportunity note text.
 * @param {import('./types.js').Stats} s
 */
function renderOpportunityNote(s) {
  const dict = L();
  if (!els.opportunityNote) {
    return;
  }
  if (s.recoverDays === 0) {
    els.opportunityNote.textContent = String(dict.opportunity.none);
  } else {
    els.opportunityNote.textContent = String(dict.opportunity.some)
      .replace("{time}", formatDuration(s.recoverPerYear))
      .replace("{days}", nf(s.recoverDays));
  }
}

/**
 * Set the target value on a count element.
 * @param {HTMLElement | null} el
 * @param {number} target
 * @param {(v: number) => string} formatter
 * @param {boolean} animate
 */
function setCountTarget(el, target, formatter, animate) {
  if (!el) {
    return;
  }
  el._target = target;
  el._formatter = formatter;
  if (animate) {
    animateCount(el, 0, target, formatter);
  } else {
    el.textContent = formatter(target);
  }
}

/**
 * Animate a number from `from` to `to`.
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {(v: number) => string} formatter
 */
function animateCount(el, from, to, formatter) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = formatter(to);
    return;
  }

  const duration = 900;
  let start = 0;

  /**
   * @param {number} ts
   */
  function step(ts) {
    if (start === 0) {
      start = ts;
    }
    const p = Math.min(1, (ts - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = from + (to - from) * eased;
    el.textContent = formatter(val);
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = formatter(to);
    }
  }

  requestAnimationFrame(step);
}

/**
 * Reveal verdict sections with a staggered animation.
 * @param {HTMLElement} verdict
 */
function revealVerdict(verdict) {
  const targets = $all(".opportunity, .total, .lifebar, .panel", verdict);
  targets.forEach((target, i) => {
    target.classList.add("reveal");
    requestAnimationFrame(() => {
      setTimeout(() => target.classList.add("is-in"), i * 90);
    });
  });
}

/**
 * Cycle the activity name placeholder examples.
 */
function setPlaceholder() {
  if (!els.actName) {
    return;
  }
  const examples = L().form?.activityExamples || [];
  if (examples.length) {
    els.actName.placeholder = examples[phIndex % examples.length];
  }
}

/**
 * Start (or restart) the placeholder cycle.
 */
function startPlaceholderCycle() {
  if (!els.actName) {
    return;
  }
  phIndex = 0;
  setPlaceholder();
  if (phTimer) {
    clearInterval(phTimer);
    phTimer = null;
  }
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  phTimer = setInterval(() => {
    if (document.activeElement === els.actName) {
      return;
    }
    phIndex++;
    setPlaceholder();
  }, 2600);
}

/**
 * Attach form and reset event listeners.
 */
function bindForm() {
  if (!els.form) {
    return;
  }
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = $("#actName", els.form);
    const minInput = $("#actMin", els.form);
    if (!nameInput || !minInput) {
      return;
    }

    const name = nameInput.value.trim();
    const minutes = parseInt(minInput.value, 10);
    if (!name || Number.isNaN(minutes) || minutes <= 0) {
      return;
    }

    addActivity(name, minutes);
    nameInput.value = "";
    minInput.value = "";
    nameInput.focus();
  });

  if (els.resetBtn) {
    els.resetBtn.addEventListener("click", clearAll);
  }
}

/**
 * Cache frequently used DOM elements.
 */
function cacheEls() {
  els.langSwitcher = $("#langSwitcher");
  els.form = $("#activityForm");
  els.actName = $("#actName");
  els.list = $("#activityList");
  els.listEmpty = $("#listEmpty");
  els.verdict = $("#verdict");
  els.day = $('[data-count="day"]');
  els.week = $('[data-count="week"]');
  els.month = $('[data-count="month"]');
  els.year = $('[data-count="year"]');
  els.life = $('[data-count="life"]');
  els.recover = $('[data-count="recover"]');
  els.lifeFill = $("#lifeFill");
  els.compareList = $("#compareList");
  els.projectList = $("#projectList");
  els.opportunityNote = $("#opportunityNote");
  els.resetBtn = $("#resetBtn");
}

/**
 * Initialize the application.
 */
export function init() {
  cacheEls();
  const lang = detectLang();
  setI18nLang(lang);
  document.documentElement.lang = lang;
  buildLangSwitcher();
  setLang(lang);
  activities = loadActivities();
  const justSeeded = maybeSeed();
  bindForm();
  renderList();
  renderVerdict(justSeeded);
  startPlaceholderCycle();
}
