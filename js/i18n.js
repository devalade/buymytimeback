/**
 * @fileoverview Internationalization: locales, translations, and translation helpers.
 */

import { DEFAULT_LANG, LANG_KEY } from "./constants.js";

/** @typedef {import('./types.js').Locale} Locale */

/**
 * @type {Record<string, Locale>}
 */
export const LOCALES = {
  fr: { bcp47: "fr-FR", label: "FR" },
  en: { bcp47: "en-US", label: "EN" },
  es: { bcp47: "es-ES", label: "ES" },
  de: { bcp47: "de-DE", label: "DE" }
};

/**
 * @type {string}
 */
let currentLang = DEFAULT_LANG;

/**
 * Set the active language.
 * @param {string} code
 */
export function setLang(code) {
  currentLang = I18N[code] ? code : DEFAULT_LANG;
}

/**
 * @returns {string}
 */
export function getLang() {
  return currentLang;
}

/**
 * @returns {Record<string, unknown>}
 */
export function L() {
  return I18N[currentLang] || I18N[DEFAULT_LANG];
}

/**
 * @returns {string}
 */
export function bcp47() {
  return (LOCALES[currentLang] || LOCALES[DEFAULT_LANG]).bcp47;
}

/**
 * Resolve a dotted translation path.
 * @param {string} path
 * @returns {unknown}
 */
export function t(path) {
  const parts = path.split(".");
  let cur = L();
  for (let i = 0; i < parts.length; i++) {
    if (cur == null) {
      break;
    }
    cur = cur[parts[i]];
  }
  return cur == null ? path : cur;
}

/**
 * Detect the initial language from localStorage or the browser.
 * @returns {string}
 */
export function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) {
      return saved;
    }
  } catch {
    // Ignore localStorage errors.
  }
  const nav = (navigator.language || "").toLowerCase();
  const base = nav.split("-")[0];
  if (I18N[base]) {
    return base;
  }
  return DEFAULT_LANG;
}

/**
 * Persist the active language.
 */
export function persistLang() {
  try {
    localStorage.setItem(LANG_KEY, currentLang);
  } catch {
    // Ignore localStorage errors.
  }
}

/**
 * @type {Record<string, Record<string, unknown>>}
 */
export const I18N = {
  fr: {
    meta: { edition: "Édition personnelle" },
    seo: {
      title: "Combien de temps perdez-vous ? Calculateur de temps perdu",
      description:
        "Combien de temps perdez-vous vraiment ? Calculateur gratuit par jour, semaine, mois et année, avec projections et comparaisons frappantes. Sans inscription.",
      ogDescription:
        "Calculez gratuitement le temps que vous perdez chaque jour, semaine, mois et année. Projections et comparaisons frappantes. Sans inscription.",
      twitterDescription:
        "Calculez gratuitement le temps que vous perdez chaque jour, semaine, mois et année."
    },
    hero: {
      num: "N° 01",
      kicker: "L'enquête",
      title: "Combien de temps<br />perdez-vous,<br /><em>vraiment&nbsp;?</em>",
      lede: "<span class=\"dropcap\">O</span>n parle rarement de son temps comme on parle de son argent. Pourtant, il s'écoule de la même façon — goutte à goutte, sans reçu, sans relevé. Cet outil dresse le bilan. Inscrivez ce que vous faites chaque jour. Laissez les chiffres parler — et voyez ce que l'automatisation pourrait vous rendre."
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
      activityExamples: [
        "Rédiger mes emails du jour",
        "Synchroniser mes stocks",
        "Rapprocher le tableau des ventes",
        "Recopier les contacts dans le CRM",
        "Préparer le résumé du standup",
        "Renommer et classer les factures"
      ],
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
    opportunity: {
      kicker: "L'opportunité",
      unit: "jours / an récupérables",
      none: "Ajoutez vos activités ci-dessus pour révéler le temps que vous pourriez récupérer.",
      some: "Soit {time} récupérables chaque année — l'équivalent de {days} journées complètes."
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
      credit:
        'Conçu par <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
    },
    confirm: { reset: "Effacer définitivement toutes les activités saisies ?" },
    row: { minSuffix: "min / jour", del: "Supprimer" },
    unit: { min: "min", hour: "h", day: "j" },
    compare: {
      books: { one: "livre", many: "livres", label: "lus (300 min / livre)" },
      films: { one: "film", many: "films", label: "visionnés (120 min / film)" },
      marathons: { one: "marathon", many: "marathons", label: "courus (240 min / marathon)" },
      workdays: {
        one: "journée de travail",
        many: "journées de travail",
        label: "(8 h / journée)"
      },
      flights: { one: "vol Paris–New York", many: "vols Paris–New York", label: "(540 min / vol)" }
    },
    examples: [
      { name: "Écrire mes emails le matin", minutes: 25 },
      { name: "Scroller Instagram et TikTok", minutes: 45 },
      { name: "Chercher mes clés ou mon téléphone", minutes: 5 },
      { name: "Réunions qui auraient pu être un mail", minutes: 30 },
      { name: "Zapper sur YouTube ou Netflix", minutes: 40 }
    ]
  },

  en: {
    meta: { edition: "Personal edition" },
    seo: {
      title: "How much time are you losing? Time-wasted calculator",
      description:
        "How much time are you really losing? Free calculator by day, week, month and year, with projections and striking comparisons. No sign-up.",
      ogDescription:
        "Calculate for free the time you lose every day, week, month and year. Projections and striking comparisons. No sign-up.",
      twitterDescription: "Calculate for free the time you lose every day, week, month and year."
    },
    hero: {
      num: "No. 01",
      kicker: "The investigation",
      title: "How much time<br />are you really<br /><em>losing?</em>",
      lede: '<span class="dropcap">W</span>e rarely talk about our time the way we talk about our money. Yet it drains just the same — drop by drop, no receipt, no bank statement. This tool draws up the balance. Write down what you do every day. Let the numbers speak — and see what automation could give back.'
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
      activityExamples: [
        "Write down my daily emails",
        "Sync my inventory data",
        "Reconcile the sales spreadsheet",
        "Copy leads into the CRM",
        "Draft the standup summary",
        "Rename and file invoices"
      ],
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
    opportunity: {
      kicker: "The opportunity",
      unit: "recoverable days a year",
      none: "Add your activities above to reveal the time you could reclaim.",
      some: "That's {time} you could reclaim every year — the equivalent of {days} full days."
    },
    proj: { y1: "In 1 year", y5: "In 5 years", y10: "In 10 years", daysLost: "days lost" },
    faq: {
      kicker: "FAQ",
      title: "Frequently asked questions",
      sub: "How the tool works, in plain terms.",
      q1: "How is wasted time calculated?",
      a1: "For each activity you enter the minutes spent per day. The tool derives your totals by multiplying by 7 (week), 30.44 (month) and 365.25 (year).",
      q2: "What does ‘share of waking life consumed’ mean?",
      a2: "It is the share of your 16 daily waking hours taken up by the listed activities. Above 100%, you are cutting into your sleep.",
      q3: "Are my data really private?",
      a3: "Yes. Everything is stored locally in your browser (localStorage). Nothing is sent to or stored on a server."
    },
    footer: {
      line: "Your data stays on this device. Nothing is sent anywhere.",
      reset: "Clear all",
      credit:
        'Built by <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
    },
    confirm: { reset: "Permanently delete all entered activities?" },
    row: { minSuffix: "min / day", del: "Delete" },
    unit: { min: "min", hour: "h", day: "d" },
    compare: {
      books: { one: "book", many: "books", label: "read (300 min / book)" },
      films: { one: "film", many: "films", label: "watched (120 min / film)" },
      marathons: { one: "marathon", many: "marathons", label: "run (240 min / marathon)" },
      workdays: { one: "workday", many: "workdays", label: "(8 h / day)" },
      flights: {
        one: "Paris–New York flight",
        many: "Paris–New York flights",
        label: "(540 min / flight)"
      }
    },
    examples: [
      { name: "Write my emails every morning", minutes: 25 },
      { name: "Scroll Instagram and TikTok", minutes: 45 },
      { name: "Look for my keys or phone", minutes: 5 },
      { name: "Meetings that could have been an email", minutes: 30 },
      { name: "Binge YouTube or Netflix", minutes: 40 }
    ]
  },

  es: {
    meta: { edition: "Edición personal" },
    seo: {
      title: "¿Cuánto tiempo pierdes? Calculadora de tiempo perdido",
      description:
        "¿Cuánto tiempo pierdes realmente? Calculadora gratuita por día, semana, mes y año, con proyecciones y comparaciones impactantes. Sin registro.",
      ogDescription:
        "Calcula gratis el tiempo que pierdes cada día, semana, mes y año. Proyecciones y comparaciones impactantes. Sin registro.",
      twitterDescription: "Calcula gratis el tiempo que pierdes cada día, semana, mes y año."
    },
    hero: {
      num: "N.º 01",
      kicker: "La investigación",
      title: "¿Cuánto tiempo<br />estás perdiendo,<br /><em>de verdad?</em>",
      lede: '<span class="dropcap">R</span>ara vez hablamos de nuestro tiempo como hablamos de nuestro dinero. Sin embargo, se escurre igual — gota a gota, sin recibo, sin extracto. Esta herramienta hace el balance. Anota lo que haces cada día. Deja que hablen los números — y mira lo que la automatización podría devolverte.'
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
      activityExamples: [
        "Redactar mis correos del día",
        "Sincronizar mi inventario",
        "Conciliar la hoja de ventas",
        "Copiar los contactos al CRM",
        "Preparar el resumen del standup",
        "Renombrar y archivar facturas"
      ],
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
    opportunity: {
      kicker: "La oportunidad",
      unit: "días recuperables al año",
      none: "Añade tus actividades arriba para revelar el tiempo que podrías recuperar.",
      some: "Es decir, {time} recuperables al año — el equivalente a {days} días completos."
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
      credit:
        'Creado por <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
    },
    confirm: { reset: "¿Borrar definitivamente todas las actividades introducidas?" },
    row: { minSuffix: "min / día", del: "Eliminar" },
    unit: { min: "min", hour: "h", day: "d" },
    compare: {
      books: { one: "libro", many: "libros", label: "leídos (300 min / libro)" },
      films: { one: "película", many: "películas", label: "vistas (120 min / película)" },
      marathons: { one: "maratón", many: "maratones", label: "corridos (240 min / maratón)" },
      workdays: {
        one: "jornada laboral",
        many: "jornadas laborales",
        label: "(8 h / jornada)"
      },
      flights: {
        one: "vuelo París–Nueva York",
        many: "vuelos París–Nueva York",
        label: "(540 min / vuelo)"
      }
    },
    examples: [
      { name: "Escribir mis correos por la mañana", minutes: 25 },
      { name: "Navegar por Instagram y TikTok", minutes: 45 },
      { name: "Buscar mis llaves o el móvil", minutes: 5 },
      { name: "Reuniones que podrían haber sido un correo", minutes: 30 },
      { name: "Ver YouTube o Netflix sin rumbo", minutes: 40 }
    ]
  },

  de: {
    meta: { edition: "Persönliche Ausgabe" },
    seo: {
      title: "Wie viel Zeit verlierst du? Rechner für verschwendete Zeit",
      description:
        "Wie viel Zeit verlierst du wirklich? Kostenloser Rechner nach Tag, Woche, Monat und Jahr, mit Projektionen und eindrucksvollen Vergleichen. Ohne Anmeldung.",
      ogDescription:
        "Berechne kostenlos die Zeit, die du jeden Tag, jede Woche, jeden Monat und jedes Jahr verlierst. Projektionen und eindrucksvolle Vergleiche. Ohne Anmeldung.",
      twitterDescription:
        "Berechne kostenlos die Zeit, die du jeden Tag, jede Woche, jeden Monat und jedes Jahr verlierst."
    },
    hero: {
      num: "Nr. 01",
      kicker: "Die Untersuchung",
      title: "Wie viel Zeit<br />verlierst du<br /><em>wirklich?</em>",
      lede: '<span class="dropcap">M</span>an spricht selten über seine Zeit wie über sein Geld. Dabei verrinnt sie genauso — Tropfen für Tropfen, ohne Quittung, ohne Kontoauszug. Dieses Tool zieht Bilanz. Notiere, was du jeden Tag tust. Lass die Zahlen sprechen — und sieh, was Automatisierung dir zurückgeben könnte.'
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
      activityExamples: [
        "Meine täglichen E-Mails schreiben",
        "Mein Inventar abgleichen",
        "Die Verkaufstabelle abstimmen",
        "Kontakte ins CRM kopieren",
        "Das Standup-Zusammenfassung schreiben",
        "Rechnungen umbenennen und ablegen"
      ],
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
    opportunity: {
      kicker: "Die Chance",
      unit: "zurückgewinnbare Tage pro Jahr",
      none: "Füge oben deine Aktivitäten hinzu, um zu sehen, welche Zeit du zurückgewinnen könntest.",
      some: "Das sind {time}, die du pro Jahr zurückgewinnen könntest — das Äquivalent von {days} vollen Tagen."
    },
    proj: {
      y1: "In 1 Jahr",
      y5: "In 5 Jahren",
      y10: "In 10 Jahren",
      daysLost: "verlorene Tage"
    },
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
      credit:
        'Entwickelt von <a href="https://devalade.me" class="footer__link" rel="noopener">devalade.me</a>'
    },
    confirm: { reset: "Alle eingegebenen Aktivitäten endgültig löschen?" },
    row: { minSuffix: "Min / Tag", del: "Löschen" },
    unit: { min: "Min", hour: "Std", day: "T" },
    compare: {
      books: { one: "Buch", many: "Bücher", label: "gelesen (300 Min / Buch)" },
      films: { one: "Film", many: "Filme", label: "gesehen (120 Min / Film)" },
      marathons: { one: "Marathon", many: "Marathons", label: "gelaufen (240 Min / Marathon)" },
      workdays: { one: "Arbeitstag", many: "Arbeitstage", label: "(8 Std / Tag)" },
      flights: {
        one: "Flug Paris–New York",
        many: "Flüge Paris–New York",
        label: "(540 Min / Flug)"
      }
    },
    examples: [
      { name: "Morgens meine E-Mails schreiben", minutes: 25 },
      { name: "Instagram und TikTok scrollen", minutes: 45 },
      { name: "Schlüssel oder Handy suchen", minutes: 5 },
      { name: "Meetings, die eine E-Mail gewesen sein könnten", minutes: 30 },
      { name: "YouTube oder Netflix schauen", minutes: 40 }
    ]
  }
};
