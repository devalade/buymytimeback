import { store } from "../store.js";
import { L } from "../i18n.js";

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

export class BmtbActivityList extends HTMLElement {
  connectedCallback() {
    this.renderContainer();
    this.listEl = this.querySelector(".list");
    this.emptyEl = this.querySelector(".list__empty");

    this.boundOnActivitiesChanged = this.onActivitiesChanged.bind(this);
    store.addEventListener("activities-changed", this.boundOnActivitiesChanged);
    this.update(store.activities);
  }

  disconnectedCallback() {
    store.removeEventListener("activities-changed", this.boundOnActivitiesChanged);
  }

  onActivitiesChanged(e) {
    this.update(e.detail.activities);
  }

  renderContainer() {
    this.innerHTML = `
      <ul class="list" aria-live="polite"></ul>
      <p class="list__empty" data-i18n="inventory.empty" style="display: none;">
        L'inventaire est vide. Ajoutez votre première activité ci-dessus.
      </p>
    `;
  }

  update(activities) {
    this.listEl.innerHTML = "";
    if (!activities.length) {
      this.emptyEl.style.display = "";
      return;
    }

    this.emptyEl.style.display = "none";
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
      del.addEventListener("click", () => store.removeActivity(a.id));

      li.appendChild(idx);
      li.appendChild(name);
      li.appendChild(meta);
      li.appendChild(del);
      fragment.appendChild(li);
    });

    this.listEl.appendChild(fragment);
  }
}

customElements.define("bmtb-activity-list", BmtbActivityList);
