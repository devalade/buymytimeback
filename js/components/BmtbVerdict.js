import { store } from "../store.js";
import { L } from "../i18n.js";
import { nf, formatDuration } from "../calculator.js";
import { COMPARISONS, PROJECTIONS, MIN_PER_DAY } from "../constants.js";

export class BmtbVerdict extends HTMLElement {
  connectedCallback() {
    this.render();
    this.dayEl = this.querySelector('[data-count="day"]');
    this.weekEl = this.querySelector('[data-count="week"]');
    this.monthEl = this.querySelector('[data-count="month"]');
    this.yearEl = this.querySelector('[data-count="year"]');
    this.lifeEl = this.querySelector('[data-count="life"]');
    this.lifeFill = this.querySelector("#lifeFill");
    this.compareList = this.querySelector("#compareList");
    this.projectList = this.querySelector("#projectList");

    this.boundOnActivitiesChanged = this.onActivitiesChanged.bind(this);
    store.addEventListener("activities-changed", this.boundOnActivitiesChanged);
    this.update(store.activities, store.getStats(), false);
  }

  disconnectedCallback() {
    store.removeEventListener("activities-changed", this.boundOnActivitiesChanged);
  }

  onActivitiesChanged(e) {
    this.update(e.detail.activities, e.detail.stats, e.detail.animate);
  }

  render() {
    this.className = "block block--verdict";
    this.setAttribute("aria-live", "polite");
    this.hidden = true;
    this.innerHTML = `
      <div class="section__head">
        <span class="num" data-i18n="verdict.num">N° 03</span>
        <h2 class="section__title" data-i18n="verdict.title">Le verdict</h2>
        <p class="section__sub" data-i18n="verdict.sub">Sans jugement. Juste des chiffres.</p>
      </div>

      <div class="totals">
        <article class="total">
          <div class="total__value"><span data-count="day">0</span></div>
          <div class="total__unit" data-i18n="totals.day">par jour</div>
        </article>
        <article class="total">
          <div class="total__value"><span data-count="week">0</span></div>
          <div class="total__unit" data-i18n="totals.week">par semaine</div>
        </article>
        <article class="total">
          <div class="total__value"><span data-count="month">0</span></div>
          <div class="total__unit" data-i18n="totals.month">par mois</div>
        </article>
        <article class="total total--year">
          <div class="total__value"><span data-count="year">0</span></div>
          <div class="total__unit" data-i18n="totals.year">par an</div>
        </article>
      </div>

      <div class="lifebar">
        <div class="lifebar__head">
          <span class="kicker" data-i18n="life.kicker">Part de votre vie éveillée consommée</span>
          <span class="lifebar__pct" data-count="life">0%</span>
        </div>
        <div class="lifebar__track">
          <div class="lifebar__fill" id="lifeFill"></div>
          <div class="lifebar__mark" style="left: 100%"></div>
        </div>
        <p class="lifebar__note" data-i18n="life.note">
          Sur une base de 16 heures d'éveil par jour.
        </p>
      </div>

      <div class="rule rule--soft"></div>

      <div class="grid grid--two">
        <div class="panel">
          <div class="panel__head">
            <span class="kicker" data-i18n="panel.compare">Ce que cela représente · par an</span>
          </div>
          <ul class="compare" id="compareList"></ul>
        </div>

        <div class="panel">
          <div class="panel__head">
            <span class="kicker" data-i18n="panel.projection">Sur la durée</span>
          </div>
          <ul class="project" id="projectList"></ul>
        </div>
      </div>
    `;
  }

  update(activities, s, animate) {
    if (!activities.length) {
      this.hidden = true;
      return;
    }

    this.hidden = false;
    this.setCountTarget(this.dayEl, s.perDay, formatDuration, animate);
    this.setCountTarget(this.weekEl, s.perWeek, formatDuration, animate);
    this.setCountTarget(this.monthEl, s.perMonth, formatDuration, animate);
    this.setCountTarget(this.yearEl, s.perYear, formatDuration, animate);
    this.setCountTarget(this.lifeEl, s.lifePct, (v) => `${Math.round(v)}%`, animate);

    const fillPct = Math.min(100, s.lifePct);
    if (animate) {
      this.lifeFill.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.lifeFill.style.width = `${fillPct.toFixed(1)}%`;
        });
      });
    } else {
      this.lifeFill.style.width = `${fillPct.toFixed(1)}%`;
    }

    this.renderComparisons(s.perYear);
    this.renderProjections(s.perDay);

    if (animate) {
      this.revealVerdict();
    } else {
      this.querySelectorAll(".total, .lifebar, .panel").forEach((el) => {
        el.classList.remove("reveal", "is-in");
      });
    }
  }

  renderComparisons(perYear) {
    if (!this.compareList) {
      return;
    }
    this.compareList.innerHTML = "";
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
      lab.innerHTML = `<b>${this.escapeHtml(unit)}</b> ${this.escapeHtml(entry.label)}`;

      li.appendChild(nEl);
      li.appendChild(lab);
      fragment.appendChild(li);
    });

    this.compareList.appendChild(fragment);
  }

  renderProjections(perDay) {
    if (!this.projectList) {
      return;
    }
    this.projectList.innerHTML = "";
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
      val.innerHTML = `${nf(days)} <small>${this.escapeHtml(dict.proj.daysLost)}</small>`;

      li.appendChild(span);
      li.appendChild(val);
      fragment.appendChild(li);
    });

    this.projectList.appendChild(fragment);
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

  revealVerdict() {
    const targets = Array.from(this.querySelectorAll(".total, .lifebar, .panel"));
    targets.forEach((target, i) => {
      target.classList.add("reveal");
      target.classList.remove("is-in");
      requestAnimationFrame(() => {
        setTimeout(() => target.classList.add("is-in"), i * 90);
      });
    });
  }

  escapeHtml(s) {
    return s.replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
  }
}

customElements.define("bmtb-verdict", BmtbVerdict);
