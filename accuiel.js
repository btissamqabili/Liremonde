const API_URL = "http://localhost:3000/livres";

const livreSection = document.querySelector(".livre");
const alireContainer = document.getElementById("a-lire-container");
const searchInput = document.querySelector(".search");

let alireListe = JSON.parse(localStorage.getItem("alire")) || [];

let state = {
  search: "",
  genre: "all"
};

window._tousLivres = [];

async function getLivres() {
  try {
    const res = await fetch(API_URL);
    const livres = await res.json();

    window._tousLivres = livres;

    afficherLivres();
    afficherAlire();

  } catch (err) {
    livreSection.innerHTML = `<p class="error">${err.message}</p>`;
  }
}
function afficherLivres() {

  let result = window._tousLivres;

  // filter genre
  if (state.genre !== "all") {
    result = result.filter(l => l.genre === state.genre);
  }

  if (state.search !== "") {
    result = result.filter(l =>
      l.titre.toLowerCase().includes(state.search)
    );
  }

  if (result.length === 0) {
    livreSection.innerHTML = `<p class="error">Aucun livre trouvé</p>`;
    return;
  }

  livreSection.innerHTML = `
    <div class="livres-container">
      ${result.map(livre => `
        <div class="livre-card">
          <img src="${livre.couverture}" alt="${livre.titre}">
          <div class="livre-info">
            <h3>${livre.genre}</h3>
            <p>${livre.auteur}</p>
            <button class="btn-titre" onclick="ouvrirModal('${livre.id}')">
              ${livre.titre}
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

window.ouvrirModal = function(id) {

  const livre = window._tousLivres.find(l => l.id == id);
  if (!livre) return;

  document.querySelector(".modal-overlay")?.remove();

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-overlay" onclick="fermerModal(event)">
      <div class="modal" onclick="event.stopPropagation()">

        <button class="modal-close" onclick="fermerModal()">&times;</button>

        <div class="modal-content">

          <div class="modal-image">
            <img src="${livre.couverture}" alt="${livre.titre}">
          </div>

          <div class="modal-details">

            <h2>${livre.titre}</h2>

            <p><strong>Auteur :</strong> ${livre.auteur}</p>
            <p><strong>Genre :</strong> ${livre.genre}</p>

            <p class="modal-description">
              ${livre.description}
            </p>

            <button class="btn-ajouter-alire"
              onclick="ajouterAlire('${livre.id}')">
              Ajouter à lire
            </button>

          </div>

        </div>

      </div>
    </div>
  `);
};

window.fermerModal = function(e) {
  if (!e || e.target.classList.contains("modal-overlay")) {
    document.querySelector(".modal-overlay")?.remove();
  }
};

window.ajouterAlire = function(id) {

  const livre = window._tousLivres.find(l => l.id == id);
  if (!livre) return;

  const existe = alireListe.find(l => l.id == id);

  if (existe) {
    alert("Déjà dans la liste !");
    return;
  }

  alireListe.push(livre);

  localStorage.setItem("alire", JSON.stringify(alireListe));

  afficherAlire();
};

function afficherAlire() {

  if (!alireContainer) return;

  if (alireListe.length === 0) {
    alireContainer.innerHTML = `<p class="loading">Aucun livre.</p>`;
    return;
  }

  alireContainer.innerHTML = `
    <div class="livres-container">
      ${alireListe.map(l => `
        <div class="livre-card">

          <img src="${l.couverture}" alt="${l.titre}">

          <div class="livre-info">

            <h3>${l.genre}</h3>
            <p>${l.auteur}</p>

            <button class="btn-titre">
              ${l.titre}
            </button>

            <button class="btn-supprimer"
              onclick="supprimerAlire('${l.id}')"
              style="margin-top:10px;">
              Supprimer
            </button>

          </div>

        </div>
      `).join("")}
    </div>
  `;
}

window.supprimerAlire = function(id) {

  alireListe = alireListe.filter(l => l.id != id);

  localStorage.setItem("alire", JSON.stringify(alireListe));

  afficherAlire();
};

document.querySelectorAll(".filter-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    state.genre = btn.dataset.cat;

    afficherLivres();

  });

});

searchInput.addEventListener("input", (e) => {

  state.search = e.target.value.toLowerCase().trim();

  afficherLivres();

});

getLivres();