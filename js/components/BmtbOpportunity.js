import { store } from "../store.js";
import { L } from "../i18n.js";
import { nf, formatDuration } from "../calculator.js";

export class BmtbOpportunity extends HTMLElement {
  connectedCallback() {
    this.render();
    this.recoverEl = this.querySelector('[data-count="recover"]');
    this.noteEl = this.querySelector("#opportunityNote");

    this.boundOnActivitiesChanged = this.onActivitiesChanged.bind(this);
    store.addEventListener("activities-changed", this.boundOnActivitiesChanged);
    this.update(store.getStats(), false);
  }

  disconnectedCallback() {
    store.removeEventListener("activities-changed", this.boundOnActivitiesChanged);
  }

  onActivitiesChanged(e) {
    this.update(e.detail.stats, e.detail.animate);
  }

  render() {
    this.className = "opportunity";
    this.setAttribute("aria-live", "polite");
    this.innerHTML = `
      <div class="opportunity__kicker kicker" data-i18n="opportunity.kicker">L'opportunité</div>
      <div class="opportunity__main">
        <div class="opportunity__value"><span data-count="recover">0</span></div>
        <div class="opportunity__label" data-i18n="opportunity.unit">jours / an récupérables</div>
      </div>
      <p class="opportunity__note" id="opportunityNote">—</p>
    `;
  }

  update(stats, animate) {
    this.setCountTarget(this.recoverEl, stats.recoverDays, (v) => nf(v), animate);
    this.renderOpportunityNote(stats);
    if (animate) {
      this.classList.add("reveal");
      this.classList.remove("is-in");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.classList.add("is-in");
        });
      });
    } else {
      this.classList.remove("reveal", "is-in");
    }
  }

  renderOpportunityNote(s) {
    const dict = L();
    if (!this.noteEl) {
      return;
    }
    if (s.recoverDays === 0) {
      this.noteEl.textContent = String(dict.opportunity.none);
    } else {
      this.noteEl.textContent = String(dict.opportunity.some)
        .replace("{time}", formatDuration(s.recoverPerYear))
        .replace("{days}", nf(s.recoverDays));
    }
  }

  setCountTarget(el, target, formatter, animate) {
    if (!el) {
      return;
    }
    el._target = target;
    el._formatter = formatter;
    if (animate) {
      this.animateCount(el, 0, target, formatter);
    } else {
      el.textContent = formatter(target);
    }
  }

  animateCount(el, from, to, formatter) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = formatter(to);
      return;
    }

    const duration = 900;
    let start = 0;

    const step = (ts) => {
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
    };

    requestAnimationFrame(step);
  }
}

customElements.define("bmtb-opportunity", BmtbOpportunity);
