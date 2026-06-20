import { store } from "../store.js";
import { LOCALES } from "../i18n.js";

export class BmtbLangSwitcher extends HTMLElement {
  connectedCallback() {
    this.render();
    this.boundOnLangChanged = this.onLangChanged.bind(this);
    store.addEventListener("lang-changed", this.boundOnLangChanged);
    this.updateActiveBtn(store.lang);
  }

  disconnectedCallback() {
    store.removeEventListener("lang-changed", this.boundOnLangChanged);
  }

  onLangChanged(e) {
    this.updateActiveBtn(e.detail.lang);
  }

  render() {
    this.innerHTML = "";
    Object.keys(LOCALES).forEach((code) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang__btn";
      btn.dataset.lang = code;
      btn.textContent = LOCALES[code].label;
      btn.addEventListener("click", () => store.setLang(code));
      this.appendChild(btn);
    });
  }

  updateActiveBtn(lang) {
    this.querySelectorAll(".lang__btn").forEach((btn) => {
      const isActive = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }
}

customElements.define("bmtb-lang-switcher", BmtbLangSwitcher);
