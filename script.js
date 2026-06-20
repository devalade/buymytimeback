(function () {
  "use strict";

  var STORAGE_KEY = "buymytimeback.activities.v1";
  var LANG_KEY = "buymytimeback.lang.v1";
  var DEFAULT_LANG = "fr";

  var LOCALES = {
    fr: { bcp47: "fr-FR", label: "FR" },
    en: { bcp47: "en-US", label: "EN" },
    es: { bcp47: "es-ES", label: "ES" },
    de: { bcp47: "de-DE", label: "DE" }
  };

  var MIN_PER_DAY_AWAKE = 960;
  var MIN_PER_DAY = 1440;
  var DAYS_PER_MONTH = 30.44;
  var DAYS_PER_YEAR = 365.25;

  var COMPARISONS = [
    { key: "books", perUnit: 300 },
    { key: "films", perUnit: 120 },
    { key: "marathons", perUnit: 240 },
    { key: "workdays", perUnit: 480 },
    { key: "flights", perUnit: 540 }
  ];

  var PROJECTIONS = [
    { years: 1, key: "y1" },
    { years: 5, key: "y5" },
    { years: 10, key: "y10" }
  ];

  var I18N = {
    fr: {
      meta: { edition: "Édition personnelle" },
      hero: {
        num: "N° 01",
        kicker: "L'enquête",
        title: "Combien de temps<br />perdez-vous,<br /><em>vraiment&nbsp;?</em>",
        lede: "<span class=\"dropcap\">O</span>n parle rarement de son temps comme on parle de son argent. Pourtant, il s'écoule de la même façon — goutte à goutte, sans reçu, sans relevé. Cet outil dresse le bilan. Inscrivez ce que vous faites chaque jour. Laissez les chiffres parler."
      },
      inventory: {
        num: "N° 02",
        title: "L'inventaire",
        sub: "Listez ce qui dévore vos minutes. Soyez honnête — personne ne lira.",
        empty: "L'inventaire est vide. Ajoutez votre première activité ci-dessus."
      },
      form: {
        activity: "Activité",
        minutes: "Minutes / jour",
        automatable: "Automatisable<br />ou éliminable",
        activityPh: "Ex. Scroller Instagram",
        minutesPh: "45",
        submit: "Ajouter"
      },
      verdict: { num: "N° 03", title: "Le verdict", sub: "Sans jugement. Juste des chiffres." },
      totals: { day: "par jour", week: "par semaine", month: "par mois", year: "par an" },
      life: {
        kicker: "Part de votre vie éveillée consommée",
        note: "Sur une base de 16 heures d'éveil par jour."
      },
      panel: { compare: "Ce que cela représente · par an", projection: "Sur la durée" },
      recover: {
        kicker: "Si vous automatisez l'automatisable",
        unit: "jours / an récupérables",
        none: "Aucune activité n'est encore marquée comme automatisable. Cochez-la lors de l'ajout.",
        some: "Soit {time} par an, ou {days} jours complets rendus."
      },
      proj: { y1: "Dans 1 an", y5: "Dans 5 ans", y10: "Dans 10 ans", daysLost: "jours perdus" },
      faq: {
        kicker: "FAQ",
        title: "Questions fréquentes",
        sub: "Le fonctionnement de l'outil, en clair.",
        q1: "Comment est calculé le temps perdu ?",
        a1: "Vous indiquez, pour chaque activité, le nombre de minutes passées par jour. L'outil déduit vos totaux en multipliant par 7 (semaine), 30,44 (mois) et 365,25 (année).",
        q2: "Que signifie la part de vie éveillée consommée ?",
        a2: "C'est la part de vos 16 heures d'éveil quotidiennes absorbée par les activités listées. Au-delà de 100 %, vous empiétez sur votre sommeil.",
        q3: "Mes données sont-elles vraiment privées ?",
        a3: "Oui. Tout est stocké localement dans votre navigateur (localStorage). Rien n'est envoyé ni enregistré sur un serveur."
      },
      footer: {
        line: "Vos données restent sur cet appareil. Rien n'est envoyé nulle part.",
        reset: "Tout effacer",
        credit: 'Conçu par <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
      },
      confirm: { reset: "Effacer définitivement toutes les activités saisies ?" },
      row: { minSuffix: "min / jour", del: "Supprimer" },
      badge: { automatable: "automatisable" },
      unit: { min: "min", hour: "h", day: "j" },
      compare: {
        books: { one: "livre", many: "livres", label: "lus (300 min / livre)" },
        films: { one: "film", many: "films", label: "visionnés (120 min / film)" },
        marathons: { one: "marathon", many: "marathons", label: "courus (240 min / marathon)" },
        workdays: { one: "journée de travail", many: "journées de travail", label: "(8 h / journée)" },
        flights: { one: "vol Paris–New York", many: "vols Paris–New York", label: "(540 min / vol)" }
      }
    },

    en: {
      meta: { edition: "Personal edition" },
      hero: {
        num: "No. 01",
        kicker: "The investigation",
        title: "How much time<br />are you really<br /><em>losing?</em>",
        lede: "<span class=\"dropcap\">W</span>e rarely talk about our time the way we talk about our money. Yet it drains just the same — drop by drop, no receipt, no bank statement. This tool draws up the balance. Write down what you do every day. Let the numbers speak."
      },
      inventory: {
        num: "No. 02",
        title: "The inventory",
        sub: "List what devours your minutes. Be honest — no one will read this.",
        empty: "The inventory is empty. Add your first activity above."
      },
      form: {
        activity: "Activity",
        minutes: "Minutes / day",
        automatable: "Automatable<br />or eliminable",
        activityPh: "e.g. Scrolling Instagram",
        minutesPh: "45",
        submit: "Add"
      },
      verdict: { num: "No. 03", title: "The verdict", sub: "No judgment. Just numbers." },
      totals: { day: "per day", week: "per week", month: "per month", year: "per year" },
      life: {
        kicker: "Share of your waking life consumed",
        note: "Based on 16 waking hours per day."
      },
      panel: { compare: "What it amounts to · per year", projection: "Over time" },
      recover: {
        kicker: "If you automate the automatable",
        unit: "recoverable days / year",
        none: "No activity is marked as automatable yet. Check the box when adding one.",
        some: "That's {time} per year, or {days} full days given back."
      },
      proj: { y1: "In 1 year", y5: "In 5 years", y10: "In 10 years", daysLost: "days lost" },
      faq: {
        kicker: "FAQ",
        title: "Frequently asked questions",
        sub: "How the tool works, in plain terms.",
        q1: "How is wasted time calculated?",
        a1: "For each activity you enter the minutes spent per day. The tool derives your totals by multiplying by 7 (week), 30.44 (month) and 365.25 (year).",
        q2: "What does \u2018share of waking life consumed\u2019 mean?",
        a2: "It is the share of your 16 daily waking hours taken up by the listed activities. Above 100%, you are cutting into your sleep.",
        q3: "Are my data really private?",
        a3: "Yes. Everything is stored locally in your browser (localStorage). Nothing is sent to or stored on a server."
      },
      footer: {
        line: "Your data stays on this device. Nothing is sent anywhere.",
        reset: "Clear all",
        credit: 'Built by <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
      },
      confirm: { reset: "Permanently delete all entered activities?" },
      row: { minSuffix: "min / day", del: "Delete" },
      badge: { automatable: "automatable" },
      unit: { min: "min", hour: "h", day: "d" },
      compare: {
        books: { one: "book", many: "books", label: "read (300 min / book)" },
        films: { one: "film", many: "films", label: "watched (120 min / film)" },
        marathons: { one: "marathon", many: "marathons", label: "run (240 min / marathon)" },
        workdays: { one: "workday", many: "workdays", label: "(8 h / day)" },
        flights: { one: "Paris–New York flight", many: "Paris–New York flights", label: "(540 min / flight)" }
      }
    },

    es: {
      meta: { edition: "Edición personal" },
      hero: {
        num: "N.º 01",
        kicker: "La investigación",
        title: "¿Cuánto tiempo<br />estás perdiendo,<br /><em>de verdad?</em>",
        lede: "<span class=\"dropcap\">R</span>ara vez hablamos de nuestro tiempo como hablamos de nuestro dinero. Sin embargo, se escurre igual — gota a gota, sin recibo, sin extracto. Esta herramienta hace el balance. Anota lo que haces cada día. Deja que hablen los números."
      },
      inventory: {
        num: "N.º 02",
        title: "El inventario",
        sub: "Lista lo que devora tus minutos. Sé honesto — nadie lo leerá.",
        empty: "El inventario está vacío. Añade tu primera actividad arriba."
      },
      form: {
        activity: "Actividad",
        minutes: "Minutos / día",
        automatable: "Automatizable<br />o eliminable",
        activityPh: "p. ej. Navegar en Instagram",
        minutesPh: "45",
        submit: "Añadir"
      },
      verdict: { num: "N.º 03", title: "El veredicto", sub: "Sin juicios. Solo números." },
      totals: { day: "por día", week: "por semana", month: "por mes", year: "por año" },
      life: {
        kicker: "Cuota de tu vida en vela consumida",
        note: "Sobre una base de 16 horas de vigilia al día."
      },
      panel: { compare: "Lo que supone · por año", projection: "Con el tiempo" },
      recover: {
        kicker: "Si automatizas lo automatizable",
        unit: "días / año recuperables",
        none: "Todavía no hay ninguna actividad marcada como automatizable. Márcala al añadir.",
        some: "Es decir, {time} al año, o {days} días completos devueltos."
      },
      proj: { y1: "En 1 año", y5: "En 5 años", y10: "En 10 años", daysLost: "días perdidos" },
      faq: {
        kicker: "FAQ",
        title: "Preguntas frecuentes",
        sub: "Cómo funciona la herramienta, en claro.",
        q1: "¿Cómo se calcula el tiempo perdido?",
        a1: "Indicas, para cada actividad, los minutos dedicados al día. La herramienta obtiene los totales multiplicando por 7 (semana), 30,44 (mes) y 365,25 (año).",
        q2: "¿Qué significa la cuota de vida en vela consumida?",
        a2: "Es la parte de tus 16 horas diarias de vigilia absorbida por las actividades listadas. Más del 100 % y estás invadiendo tu sueño.",
        q3: "¿Mis datos son realmente privados?",
        a3: "Sí. Todo se guarda localmente en tu navegador (localStorage). Nada se envía ni se guarda en un servidor."
      },
      footer: {
        line: "Tus datos se quedan en este dispositivo. No se envía nada a ningún sitio.",
        reset: "Borrar todo",
        credit: 'Creado por <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
      },
      confirm: { reset: "¿Borrar definitivamente todas las actividades introducidas?" },
      row: { minSuffix: "min / día", del: "Eliminar" },
      badge: { automatable: "automatizable" },
      unit: { min: "min", hour: "h", day: "d" },
      compare: {
        books: { one: "libro", many: "libros", label: "leídos (300 min / libro)" },
        films: { one: "película", many: "películas", label: "vistas (120 min / película)" },
        marathons: { one: "maratón", many: "maratones", label: "corridos (240 min / maratón)" },
        workdays: { one: "jornada laboral", many: "jornadas laborales", label: "(8 h / jornada)" },
        flights: { one: "vuelo París–Nueva York", many: "vuelos París–Nueva York", label: "(540 min / vuelo)" }
      }
    },

    de: {
      meta: { edition: "Persönliche Ausgabe" },
      hero: {
        num: "Nr. 01",
        kicker: "Die Untersuchung",
        title: "Wie viel Zeit<br />verlierst du<br /><em>wirklich?</em>",
        lede: "<span class=\"dropcap\">M</span>an spricht selten über seine Zeit wie über sein Geld. Dabei verrinnt sie genauso — Tropfen für Tropfen, ohne Quittung, ohne Kontoauszug. Dieses Tool zieht Bilanz. Notiere, was du jeden Tag tust. Lass die Zahlen sprechen."
      },
      inventory: {
        num: "Nr. 02",
        title: "Das Inventar",
        sub: "Liste, was deine Minuten verschlingt. Sei ehrlich — niemand liest mit.",
        empty: "Das Inventar ist leer. Füge oben deine erste Aktivität hinzu."
      },
      form: {
        activity: "Aktivität",
        minutes: "Minuten / Tag",
        automatable: "Automatisierbar<br />oder streichbar",
        activityPh: "z. B. Instagram scrollen",
        minutesPh: "45",
        submit: "Hinzufügen"
      },
      verdict: { num: "Nr. 03", title: "Das Urteil", sub: "Ohne Urteil. Nur Zahlen." },
      totals: { day: "pro Tag", week: "pro Woche", month: "pro Monat", year: "pro Jahr" },
      life: {
        kicker: "Anteil deiner Wachzeit, der verbraucht wird",
        note: "Basiert auf 16 Stunden Wachzeit pro Tag."
      },
      panel: { compare: "Was das bedeutet · pro Jahr", projection: "Über die Zeit" },
      recover: {
        kicker: "Wenn du Automatisierbares automatisierst",
        unit: "rückgewinnbare Tage / Jahr",
        none: "Bisher ist keine Aktivität als automatisierbar markiert. Setze das Häkchen beim Hinzufügen.",
        some: "Das sind {time} pro Jahr, bzw. {days} volle Tage zurückgewonnen."
      },
      proj: { y1: "In 1 Jahr", y5: "In 5 Jahren", y10: "In 10 Jahren", daysLost: "verlorene Tage" },
      faq: {
        kicker: "FAQ",
        title: "Häufige Fragen",
        sub: "So funktioniert das Tool, verständlich erklärt.",
        q1: "Wie wird die verschwendete Zeit berechnet?",
        a1: "Du gibst pro Aktivität die Minuten pro Tag an. Das Tool ermittelt die Summen durch Multiplikation mit 7 (Woche), 30,44 (Monat) und 365,25 (Jahr).",
        q2: "Was bedeutet der Anteil der Wachzeit?",
        a2: "Das ist der Anteil deiner 16 täglichen Wachstunden, den die aufgeführten Aktivitäten beanspruchen. Über 100 % greifst du deine Schlafzeit an.",
        q3: "Sind meine Daten wirklich privat?",
        a3: "Ja. Alles wird lokal in deinem Browser gespeichert (localStorage). Nichts wird an einen Server gesendet oder dort gespeichert."
      },
      footer: {
        line: "Deine Daten bleiben auf diesem Gerät. Nichts wird irgendwohin gesendet.",
        reset: "Alles löschen",
        credit: 'Entwickelt von <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
      },
      confirm: { reset: "Alle eingegebenen Aktivitäten endgültig löschen?" },
      row: { minSuffix: "Min / Tag", del: "Löschen" },
      badge: { automatable: "automatisierbar" },
      unit: { min: "Min", hour: "Std", day: "T" },
      compare: {
        books: { one: "Buch", many: "Bücher", label: "gelesen (300 Min / Buch)" },
        films: { one: "Film", many: "Filme", label: "gesehen (120 Min / Film)" },
        marathons: { one: "Marathon", many: "Marathons", label: "gelaufen (240 Min / Marathon)" },
        workdays: { one: "Arbeitstag", many: "Arbeitstage", label: "(8 Std / Tag)" },
        flights: { one: "Flug Paris–New York", many: "Flüge Paris–New York", label: "(540 Min / Flug)" }
      }
    }
  };

  var state = { activities: [], lang: DEFAULT_LANG };
  var els = {};

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function L() { return I18N[state.lang] || I18N[DEFAULT_LANG]; }

  function t(path) {
    var parts = path.split(".");
    var cur = L();
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) break;
      cur = cur[parts[i]];
    }
    if (cur == null) cur = path;
    return cur;
  }

  function uid() {
    return "a" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function bcp47() { return (LOCALES[state.lang] || LOCALES[DEFAULT_LANG]).bcp47; }

  function nf(n) {
    return new Intl.NumberFormat(bcp47()).format(Math.round(n));
  }

  function formatDuration(minutes) {
    var dict = L();
    minutes = Math.max(0, Math.round(minutes));
    if (minutes < 60) return minutes + " " + dict.unit.min;
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (minutes < MIN_PER_DAY) {
      return mins === 0 ? hours + " " + dict.unit.hour : hours + " " + dict.unit.hour + " " + mins;
    }
    var days = Math.floor(minutes / MIN_PER_DAY);
    var remMin = minutes - days * MIN_PER_DAY;
    var remHours = Math.floor(remMin / 60);
    if (remHours === 0) return days + " " + dict.unit.day;
    return days + " " + dict.unit.day + " " + remHours + " " + dict.unit.hour;
  }

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && I18N[saved]) return saved;
    } catch (e) {}
    var nav = (navigator.language || "").toLowerCase();
    var base = nav.split("-")[0];
    if (I18N[base]) return base;
    return DEFAULT_LANG;
  }

  function setLang(code) {
    if (!I18N[code]) code = DEFAULT_LANG;
    state.lang = code;
    try { localStorage.setItem(LANG_KEY, code); } catch (e) {}
    document.documentElement.lang = code;
    applyTranslations();
    updateActiveLangButton();
    renderList();
    renderVerdict(false);
  }

  function applyTranslations() {
    $all("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    $all("[data-i18n-html]").forEach(function (el) {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    $all("[data-i18n-ph]").forEach(function (el) {
      el.placeholder = t(el.getAttribute("data-i18n-ph"));
    });
  }

  function buildLangSwitcher() {
    var container = els.langSwitcher;
    if (!container) return;
    container.innerHTML = "";
    Object.keys(LOCALES).forEach(function (code) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lang__btn";
      btn.dataset.lang = code;
      btn.textContent = LOCALES[code].label;
      btn.addEventListener("click", function () { setLang(code); });
      container.appendChild(btn);
    });
  }

  function updateActiveLangButton() {
    $all(".lang__btn", els.langSwitcher).forEach(function (btn) {
      btn.classList.toggle("is-active", btn.dataset.lang === state.lang);
      btn.setAttribute("aria-pressed", btn.dataset.lang === state.lang ? "true" : "false");
    });
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.activities && Array.isArray(parsed.activities)) {
        state.activities = parsed.activities.filter(function (a) {
          return a && typeof a.name === "string" && typeof a.minutes === "number";
        });
      }
    } catch (e) {
      state.activities = [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities: state.activities }));
    } catch (e) {}
  }

  function addActivity(name, minutes, automatable) {
    state.activities.push({
      id: uid(),
      name: name.trim(),
      minutes: Math.max(1, Math.min(1440, Math.round(minutes))),
      automatable: !!automatable
    });
    save();
    renderList();
    renderVerdict(true);
  }

  function removeActivity(id) {
    state.activities = state.activities.filter(function (a) { return a.id !== id; });
    save();
    renderList();
    renderVerdict(false);
  }

  function clearAll() {
    if (!state.activities.length) return;
    if (!window.confirm(t("confirm.reset"))) return;
    state.activities = [];
    save();
    renderList();
    renderVerdict(false);
  }

  function computeStats() {
    var perDay = 0;
    var recoverablePerDay = 0;
    state.activities.forEach(function (a) {
      perDay += a.minutes;
      if (a.automatable) recoverablePerDay += a.minutes;
    });
    return {
      perDay: perDay,
      perWeek: perDay * 7,
      perMonth: perDay * DAYS_PER_MONTH,
      perYear: perDay * DAYS_PER_YEAR,
      lifePct: perDay / MIN_PER_DAY_AWAKE * 100,
      recoverablePerDay: recoverablePerDay,
      recoverPerYear: recoverablePerDay * DAYS_PER_YEAR,
      recoverDays: recoverablePerDay * DAYS_PER_YEAR / MIN_PER_DAY
    };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function renderList() {
    var list = els.list;
    var empty = els.listEmpty;
    list.innerHTML = "";
    if (!state.activities.length) {
      empty.style.display = "";
      return;
    }
    empty.style.display = "none";
    var dict = L();
    state.activities.forEach(function (a, i) {
      var li = document.createElement("li");
      var idx = document.createElement("span");
      idx.className = "row__idx";
      idx.textContent = String(i + 1).padStart(2, "0");
      var name = document.createElement("span");
      name.className = "row__name";
      name.innerHTML = "<strong>" + escapeHtml(a.name) + "</strong>" +
        (a.automatable ? ' <span class="badge">' + dict.badge.automatable + "</span>" : "");
      var meta = document.createElement("span");
      meta.className = "row__meta";
      meta.innerHTML = "<b>" + a.minutes + "</b> " + dict.row.minSuffix;
      var del = document.createElement("button");
      del.type = "button";
      del.className = "row__del";
      del.setAttribute("aria-label", dict.row.del + " " + a.name);
      del.innerHTML = '<span class="row__del-text">' + dict.row.del + "</span>";
      del.addEventListener("click", function () { removeActivity(a.id); });
      li.appendChild(idx);
      li.appendChild(name);
      li.appendChild(meta);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function renderVerdict(animate) {
    var verdict = els.verdict;
    if (!state.activities.length) {
      verdict.hidden = true;
      return;
    }
    verdict.hidden = false;

    var s = computeStats();

    setCountTarget(els.day, s.perDay, formatDuration, animate);
    setCountTarget(els.week, s.perWeek, formatDuration, animate);
    setCountTarget(els.month, s.perMonth, formatDuration, animate);
    setCountTarget(els.year, s.perYear, formatDuration, animate);
    setCountTarget(els.life, s.lifePct, function (v) { return Math.round(v) + "%"; }, animate);
    setCountTarget(els.recover, s.recoverDays, function (v) { return nf(v); }, animate);

    var fillPct = Math.min(100, s.lifePct);
    if (animate) {
      els.lifeFill.style.width = "0%";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          els.lifeFill.style.width = fillPct.toFixed(1) + "%";
        });
      });
    } else {
      els.lifeFill.style.width = fillPct.toFixed(1) + "%";
    }

    renderComparisons(s.perYear);
    renderProjections(s.perDay);
    renderRecoverNote(s);

    if (animate) revealVerdict(verdict);
  }

  function renderComparisons(perYear) {
    var ul = els.compareList;
    var dict = L();
    ul.innerHTML = "";
    COMPARISONS.forEach(function (c) {
      var n = Math.floor(perYear / c.perUnit);
      var entry = dict.compare[c.key] || { one: c.key, many: c.key, label: "" };
      var unit = n <= 1 ? entry.one : entry.many;
      var li = document.createElement("li");
      var nEl = document.createElement("span");
      nEl.className = "compare__n";
      nEl.textContent = nf(n);
      var lab = document.createElement("span");
      lab.className = "compare__label";
      lab.innerHTML = "<b>" + escapeHtml(unit) + "</b> " + escapeHtml(entry.label);
      li.appendChild(nEl);
      li.appendChild(lab);
      ul.appendChild(li);
    });
  }

  function renderProjections(perDay) {
    var ul = els.projectList;
    var dict = L();
    ul.innerHTML = "";
    PROJECTIONS.forEach(function (sp) {
      var totalMin = perDay * 365 * sp.years;
      var days = totalMin / MIN_PER_DAY;
      var li = document.createElement("li");
      var span = document.createElement("span");
      span.className = "project__span";
      span.textContent = dict.proj[sp.key];
      var val = document.createElement("span");
      val.className = "project__val";
      val.innerHTML = nf(days) + " <small>" + escapeHtml(dict.proj.daysLost) + "</small>";
      li.appendChild(span);
      li.appendChild(val);
      ul.appendChild(li);
    });
  }

  function renderRecoverNote(s) {
    var dict = L();
    if (s.recoverablePerDay === 0) {
      els.recoverNote.textContent = dict.recover.none;
    } else {
      els.recoverNote.textContent = dict.recover.some
        .replace("{time}", formatDuration(s.recoverPerYear))
        .replace("{days}", nf(s.recoverDays));
    }
  }

  function setCountTarget(el, target, formatter, animate) {
    if (!el) return;
    el._target = target;
    el._formatter = formatter || String;
    if (animate) {
      animateCount(el, 0, target, formatter);
    } else {
      el.textContent = formatter(target);
    }
  }

  function animateCount(el, from, to, formatter) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = formatter(to);
      return;
    }
    var duration = 900;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = from + (to - from) * eased;
      el.textContent = formatter(val);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = formatter(to);
    }
    requestAnimationFrame(step);
  }

  function revealVerdict(verdict) {
    var targets = $all(".total, .lifebar, .panel, .recover", verdict);
    targets.forEach(function (target, i) {
      target.classList.add("reveal");
      requestAnimationFrame(function () {
        setTimeout(function () { target.classList.add("is-in"); }, i * 90);
      });
    });
  }

  function bindForm() {
    els.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = $("#actName", els.form);
      var minInput = $("#actMin", els.form);
      var autoInput = $("#actAuto", els.form);
      var name = nameInput.value.trim();
      var minutes = parseInt(minInput.value, 10);
      if (!name || isNaN(minutes) || minutes <= 0) return;
      addActivity(name, minutes, autoInput.checked);
      nameInput.value = "";
      minInput.value = "";
      autoInput.checked = false;
      nameInput.focus();
    });
    els.resetBtn.addEventListener("click", clearAll);
  }

  function cacheEls() {
    els.langSwitcher = $("#langSwitcher");
    els.form = $("#activityForm");
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
    els.recoverNote = $("#recoverNote");
    els.resetBtn = $("#resetBtn");
  }

  function init() {
    cacheEls();
    state.lang = detectLang();
    document.documentElement.lang = state.lang;
    buildLangSwitcher();
    updateActiveLangButton();
    applyTranslations();
    load();
    bindForm();
    renderList();
    renderVerdict(false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
