// =========================
// DIZIONARIO LINGUE
// =========================
const translations = {
  it: {
    title: "Casa del Gelato",
    menu: "Menù",
    create_cup_title: "Crea la tua Coppa",
    create_cup_subtitle: "Personalizza la tua coppa come la vuoi tu",
    create_button: "🍨 INIZIA",
    contacts: "Contatti",
    whatsapp: "Chat WhatsApp",
    directions: "Indicazioni Stradali",
    welcome_island: "Benvenuto! Inizia a creare la tua coppa 🍨"
  },
  en: {
    title: "Casa del Gelato",
    menu: "Menu",
    create_cup_title: "Create Your Cup",
    create_cup_subtitle: "Customize your cup the way you like",
    create_button: "🍨 START",
    contacts: "Contacts",
    whatsapp: "WhatsApp Chat",
    directions: "Get Directions",
    welcome_island: "Welcome! Start creating your cup 🍨"
  },
  de: {
    title: "Casa del Gelato",
    menu: "Menü",
    create_cup_title: "Erstelle deinen Becher",
    create_cup_subtitle: "Gestalte deinen Becher nach Wunsch",
    create_button: "🍨 START",
    contacts: "Kontakte",
    whatsapp: "WhatsApp Chat",
    directions: "Wegbeschreibung",
    welcome_island: "Willkommen! Beginne deinen Becher zu erstellen 🍨"
  }
};

function applyLanguage(lang) {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  const flag = { it: "🇮🇹", en: "🇬🇧", de: "🇩🇪" }[lang] || "🌍";
  document.getElementById("lang-toggle").textContent = flag + " ▾";

  localStorage.setItem("selectedLanguage", lang);
}

// =========================
// SCELTA LINGUA
// =========================
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.onclick = () => {
    const lang = btn.getAttribute("data-lang");
    applyLanguage(lang);
    document.getElementById("language-screen").style.display = "none";
    document.getElementById("lang-menu").classList.remove("show");
  };
});

// =========================
// MOSTRA/NASCONDI MENU A TENDINA
// =========================
const langToggle = document.getElementById("lang-toggle");
const langMenu = document.getElementById("lang-menu");

langToggle.onclick = () => {
  langMenu.classList.toggle("show");
};

// ✅ Chiudi menu se clicchi fuori
document.addEventListener("click", (e) => {
  if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
    langMenu.classList.remove("show");
  }
});

// =========================
// MOSTRA SCHERMATA LINGUA SOLO ALLA PRIMA VISITA
// =========================
window.addEventListener("load", () => {
  const savedLang = localStorage.getItem("selectedLanguage");
  const screen = document.getElementById("language-screen");

  const isHome =
    location.pathname.endsWith("home.html") ||
    location.pathname === "/" ||
    location.pathname === "";

  if (!savedLang && isHome) {
    screen.style.display = "flex";
  } else {
    screen.style.display = "none";
    if (savedLang) applyLanguage(savedLang);
  }
});