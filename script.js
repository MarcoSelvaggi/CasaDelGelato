// Dizionario lingue
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

// Applica lingua
function applyLanguage(lang) {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  localStorage.setItem("selectedLanguage", lang);
}

// Al click dei bottoni lingua
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.getAttribute("data-lang");
    applyLanguage(lang);
    document.getElementById("language-screen").style.display = "none";
    document.getElementById("lang-menu").style.display = "none";
  });
});

// Mostra schermata solo la prima volta
window.addEventListener("load", () => {
  const savedLang = localStorage.getItem("selectedLanguage");
  if (savedLang) {
    applyLanguage(savedLang);
    document.getElementById("language-screen").style.display = "none";
  }
});