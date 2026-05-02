const cards = document.querySelectorAll(".card");
const nextBtn = document.getElementById("nextBtn");

let selectedType = null;

cards.forEach((card) => {
  card.addEventListener("click", () => {
    // remove seleção anterior
    cards.forEach((c) => c.classList.remove("selected"));

    // adiciona no clicado
    card.classList.add("selected");

    // salva escolha
    selectedType = card.dataset.type;

    console.log("Selecionado:", selectedType);
  });
});

nextBtn.addEventListener("click", () => {
  if (!selectedType) {
    alert("Escolha um tipo antes de continuar!");
    return;
  }
  // simulacao de resposta
  alert("Indo para próxima etapa com: " + selectedType);
});
