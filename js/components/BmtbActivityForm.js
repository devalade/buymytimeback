import { store } from "../store.js";
import { L } from "../i18n.js";

export class BmtbActivityForm extends HTMLElement {
  constructor() {
    super();
    this.phIndex = 0;
    this.phTimer = null;
  }

  connectedCallback() {
    this.render();
    this.form = this.querySelector("form");
    this.nameInput = this.querySelector("#actName");
    this.minInput = this.querySelector("#actMin");

    this.form.addEventListener("submit", this.onSubmit.bind(this));

    this.boundOnLangChanged = this.onLangChanged.bind(this);
    store.addEventListener("lang-changed", this.boundOnLangChanged);

    this.startPlaceholderCycle();
  }

  disconnectedCallback() {
    store.removeEventListener("lang-changed", this.boundOnLangChanged);
    this.stopPlaceholderCycle();
  }

  onLangChanged() {
    this.startPlaceholderCycle();
  }

  onSubmit(e) {
    e.preventDefault();
    const name = this.nameInput.value.trim();
    const minutes = parseInt(this.minInput.value, 10);
    if (!name || Number.isNaN(minutes) || minutes <= 0) {
      return;
    }

    store.addActivity(name, minutes);
    this.nameInput.value = "";
    this.minInput.value = "";
    this.nameInput.focus();
  }

  render() {
    this.innerHTML = `
      <form class="form" autocomplete="off">
        <div class="form__field form__field--name">
          <label for="actName" data-i18n="form.activity">Activité</label>
          <input
            type="text"
            id="actName"
            name="name"
            required
            maxlength="60"
          />
        </div>
        <div class="form__field form__field--min">
          <label for="actMin" data-i18n="form.minutes">Minutes / jour</label>
          <input
            type="number"
            id="actMin"
            name="minutes"
            data-i18n-ph="form.minutesPh"
            min="1"
            max="1440"
            required
          />
        </div>
        <div class="form__field form__field--submit">
          <button type="submit" class="btn btn--primary" data-i18n="form.submit">Ajouter</button>
        </div>
      </form>
    `;
  }

  setPlaceholder() {
    if (!this.nameInput) {
      return;
    }
    const examples = L().form?.activityExamples || [];
    if (examples.length) {
      this.nameInput.placeholder = examples[this.phIndex % examples.length];
    }
  }

  startPlaceholderCycle() {
    this.phIndex = 0;
    this.setPlaceholder();
    this.stopPlaceholderCycle();

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    this.phTimer = setInterval(() => {
      if (document.activeElement === this.nameInput) {
        return;
      }
      this.phIndex++;
      this.setPlaceholder();
    }, 2600);
  }

  stopPlaceholderCycle() {
    if (this.phTimer) {
      clearInterval(this.phTimer);
      this.phTimer = null;
    }
  }
}

customElements.define("bmtb-activity-form", BmtbActivityForm);
