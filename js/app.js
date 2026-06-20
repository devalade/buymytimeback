/**
 * @fileoverview Main entry point and orchestration of the application.
 */

import { store } from "./store.js";
import { getLang, L, t } from "./i18n.js";
import { LOCALES } from "./i18n.js";
import { DEFAULT_LANG } from "./constants.js";

// Import all custom elements to register them
import "./components/BmtbLangSwitcher.js";
import "./components/BmtbActivityForm.js";
import "./components/BmtbActivityList.js";
import "./components/BmtbOpportunity.js";
import "./components/BmtbVerdict.js";

const $all = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

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
 * Initialize the application.
 */
export function init() {
  // Listen for language changes to update static page content (hero, faq, title, meta etc)
  store.addEventListener("lang-changed", (e) => {
    document.documentElement.lang = e.detail.lang;
    applyTranslations();
    applySeo();
  });

  // Bind footer reset button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (window.confirm(String(t("confirm.reset")))) {
        store.clearAll();
      }
    });
  }

  // Initialize store. This will trigger initial events and components will render themselves.
  store.init();
}
