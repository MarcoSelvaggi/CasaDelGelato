// ===============================
// 🌍 AUTO TRANSLATION ENGINE
// Casa del Gelato
// ===============================

(function () {
  const DEFAULT_LANG = "it";
  const SUPPORTED = ["it", "en", "de"];

  const userLang =
    localStorage.getItem("cdg_lang") ||
    (navigator.language || "it").slice(0, 2);

  const currentLang = SUPPORTED.includes(userLang)
    ? userLang
    : DEFAULT_LANG;

  localStorage.setItem("cdg_lang", currentLang);

  if (currentLang === "it") return; // 🇮🇹 niente da fare

  // 🔥 traduce SOLO nodi di testo, non HTML
  function translateNode(node) {
    if (
      node.nodeType !== Node.TEXT_NODE ||
      !node.nodeValue ||
      !node.nodeValue.trim()
    ) return;

    const parent = node.parentElement;
    if (!parent) return;

    // evita input, textarea, script ecc
    if (
      ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE"].includes(parent.tagName)
    ) return;

    // evita elementi già tradotti
    if (parent.dataset.translated) return;

    parent.dataset.translated = "1";

    fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=${currentLang}&dt=t&q=` +
        encodeURIComponent(node.nodeValue)
    )
      .then(r => r.json())
      .then(res => {
        if (res && res[0] && res[0][0]) {
          node.nodeValue = res[0][0][0];
        }
      })
      .catch(() => {});
  }

  function scan() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      translateNode(node);
    }
  }

  // 🚀 avvio
  window.addEventListener("load", () => {
    setTimeout(scan, 300);
  });

  // 🔁 ritraduce se la pagina cambia (popup, animazioni, ecc)
  const observer = new MutationObserver(() => {
    scan();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();

// ===============================
// 🌐 LANGUAGE SWITCHER UI
// ===============================

(function () {
  const FLAGS = {
    it: "🇮🇹",
    en: "🇬🇧",
    de: "🇩🇪"
  };

  const toggle = document.getElementById("lang-toggle");
  const menu = document.getElementById("lang-menu");

  if (!toggle || !menu) return;

  const current = localStorage.getItem("cdg_lang") || "it";
  toggle.textContent = FLAGS[current] + " ▾";

toggle.addEventListener("click", e => {
  e.stopPropagation();
  menu.classList.toggle("open");
});

document.addEventListener("click", () => {
  menu.classList.remove("open");
});
  // cambio lingua
  menu.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.dataset.lang;
      if (!lang) return;

      localStorage.setItem("cdg_lang", lang);

      // aggiorna icona
      toggle.textContent = FLAGS[lang] + " ▾";
      menu.style.display = "none";

      // 🔥 ritraduce subito SENZA reload
      document.querySelectorAll("[data-translated]").forEach(el => {
        el.removeAttribute("data-translated");
      });

      // forza nuova scansione
      setTimeout(() => {
        const evt = new Event("load");
        window.dispatchEvent(evt);
      }, 50);
    });
  });
})();

