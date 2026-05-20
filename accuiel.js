
const API_URL = "http://localhost:3000/livres";

const livreSection = document.querySelector(".livre");
const alireContainer = document.getElementById("a-lire-container");

let alireListe = JSON.parse(localStorage.getItem("alire")) || [];

async function getLivres() {
  try {
    livreSection.innerHTML = `<p class="loading">Chargement des livres...</p>`;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Erreur lors du chargement");
    }

    const livres = await response.json();

    const loadingEl = document.querySelector(".loading");
    if (loadingEl) loadingEl.remove();

    afficherLivres(livres);
    afficherAlire();

  } catch (error) {
    const loadingEl = document.querySelector(".loading");
    if (loadingEl) loadingEl.remove();
    livreSection.innerHTML = `<p class="error">${error.message}</p>`;
  }
}


function afficherLivres(livres, filtreGenre = "all") {
  const oldContainer = livreSection.querySelector(".livres-container");
  if (oldContainer) oldContainer.remove();

  const container = document.createElement("div");
  container.classList.add("livres-container");

  const livresFiltres = filtreGenre === "all"
    ? livres
    : livres.filter(l => l.genre === filtreGenre);

  livresFiltres.forEach((livre) => {
    const card = document.createElement("div");
    card.classList.add("livre-card");

    card.innerHTML = `
      <img src="${livre.couverture}" alt="${livre.titre}" onerror="this.style.display='none'">
      <div class="livre-info">
        <h3>${livre.genre}</h3>
        <p>${livre.auteur}</p>
        <button class="btn-titre" data-id="${livre.id}">${livre.titre}</button>
      </div>
    `;
    card.querySelector(".btn-titre").addEventListener("click", () => {
      ajouterAlire(livre);
    });

    container.appendChild(card);
  });

  livreSection.appendChild(container);

  window._tousLivres = livres;
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.cat;
    if (window._tousLivres) {
      afficherLivres(window._tousLivres, cat);
    }
  });
});

function ajouterAlire(livre) {
  const dejaPresent = alireListe.find(l => l.id === livre.id);
  if (dejaPresent) return;

  alireListe.push(livre);
  localStorage.setItem("alire", JSON.stringify(alireListe));
  afficherAlire();
}

function afficherAlire() {
  if (!alireContainer) return;

  alireContainer.innerHTML = "";

  alireListe.forEach((livre) => {
    const card = document.createElement("div");
    card.classList.add("alire-card");

    card.innerHTML = `
      <img src="${livre.couverture}" alt="${livre.titre}" onerror="this.style.display='none'">
      <div class="alire-info">
        <h3>${livre.genre}</h3>
        <p>${livre.titre}</p>
        <button class="btn-supprimer" data-id="${livre.id}">Supprimer</button>
      </div>
    `;

    card.querySelector(".btn-supprimer").addEventListener("click", () => {
      supprimerAlire(livre.id);
    });

    alireContainer.appendChild(card);
  });
}


function supprimerAlire(id) {
  alireListe = alireListe.filter(l => l.id !== id);
  localStorage.setItem("alire", JSON.stringify(alireListe));
  afficherAlire();
}

getLivres();