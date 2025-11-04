// WhatsApp Link
const whatsappNumber = "393403788846";
document.getElementById("whatsapp-link").href = `https://wa.me/${whatsappNumber}`;

// Menù interattivo: apre/chiude categorie
function toggleCategory(categoryElement) {
    const items = categoryElement.querySelector(".items");
    items.style.display = items.style.display === "block" ? "none" : "block";
}