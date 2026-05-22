const BASE_URL = 'http://localhost:3000';
const tableBody            = document.getElementById('livresTableBody');
const filterPillsContainer = document.getElementById('filterPillsContainer');
const modalPillsContainer  = document.getElementById('modalPillsContainer');
const genrePlaceholder     = document.getElementById('genrePlaceholder');
const modalOverlay         = document.getElementById('modalOverlay');
const livreForm            = document.getElementById('livreForm');
const btnOpenModal         = document.getElementById('btnOpenModal');
const btnCancel            = document.getElementById('btnCancel');
const btnToggleFilter      = document.getElementById('btnToggleFilter');
const modalTitle           = document.getElementById('modalTitle');

const inputId          = document.getElementById('livreId');
const inputTitre       = document.getElementById('inputTitre');
const inputAuteur      = document.getElementById('inputAuteur');
const inputGenre       = document.getElementById('inputGenre');   // hidden
const inputDescription = document.getElementById('inputDescription');
const inputCouverture  = document.getElementById('inputCouverture');
const inputALire       = document.getElementById('inputALire');

let allLivres        = [];
let activeFilter     = '';   
let filterVisible    = false;

async function fetchLivres() {
  try {
    const res = await fetch(`${BASE_URL}/livres`);
    if (!res.ok) throw new Error();
    allLivres = await res.json();
    buildFilterPills();
    buildModalPills();
    applyFilter();
  } catch {
    tableBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="7">Impossible de charger les données. Vérifiez que json-server est démarré.</td>
      </tr>`;
  }
}

function renderTable(livres) {
  if (!livres.length) {
    tableBody.innerHTML = `
      <tr class="empty-row"><td colspan="7">Aucun livre trouvé pour ce genre.</td></tr>`;
    return;
  }
  tableBody.innerHTML = livres.map((l, index) => `
    <tr>
      <td style="text-align:center;font-size:.78rem;color:var(--text-light)">${index + 1}</td>
      <td class="cell-cover">
        ${l.couverture
          ? `<img src="${l.couverture}" alt="${esc(l.titre)}"
               onerror="this.parentElement.innerHTML='<div class=&quot;no-cover&quot;>Pas<br>d\'image</div>'">`
          : '<div class="no-cover">Pas<br>d\'image</div>'}
      </td>
      <td style="font-weight:700">${esc(l.titre)}</td>
      <td>${esc(l.auteur)}</td>
      <td>${esc(l.genre)}</td>
      <td>
        <span class="badge-alire ${l.aLire ? 'oui' : 'non'}">
          ${l.aLire ? 'Oui' : 'Non'}
        </span>
      </td>
      <td>
        <div class="actions-cell">
          <button class="btn-edit"   onclick="openEditModal('${l.id}')" title="Modifier">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-delete" onclick="deleteLivre('${l.id}')" title="Supprimer">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function buildFilterPills() {
  const genres = getUniqueGenres();

  filterPillsContainer.innerHTML = '';

  filterPillsContainer.appendChild(
    makePill('Tous les genres', activeFilter === '', () => selectFilter(''))
  );

  genres.forEach(g => {
    filterPillsContainer.appendChild(
      makePill(g, activeFilter === g, () => selectFilter(g))
    );
  });

  filterPillsContainer.classList.add('hidden');
}

function selectFilter(genre) {
  activeFilter = genre;
  
  filterPillsContainer.querySelectorAll('.genre-pill').forEach(p => {
    const isActive = p.dataset.value === genre;
    p.classList.toggle('active', isActive);
    p.querySelector('.pill-check').style.opacity = isActive ? '1' : '0';
  });
  applyFilter();
}

function applyFilter() {
  const filtered = activeFilter
    ? allLivres.filter(l => l.genre === activeFilter)
    : allLivres;
  renderTable(filtered);
}

btnToggleFilter.addEventListener('click', () => {
  filterVisible = !filterVisible;
  filterPillsContainer.classList.toggle('hidden', !filterVisible);
});

function buildModalPills(selectedGenre = '') {
  const genres = getUniqueGenres();
  modalPillsContainer.innerHTML = '';

  genres.forEach(g => {
    modalPillsContainer.appendChild(
      makePill(g, g === selectedGenre, () => selectModalGenre(g))
    );
  });

  if (selectedGenre) {
    genrePlaceholder.classList.add('hidden');
    inputGenre.value = selectedGenre;
  } else {
    genrePlaceholder.classList.remove('hidden');
    inputGenre.value = '';
  }
}

function selectModalGenre(genre) {
  inputGenre.value = genre;
  genrePlaceholder.classList.add('hidden');

  modalPillsContainer.querySelectorAll('.genre-pill').forEach(p => {
    const isActive = p.dataset.value === genre;
    p.classList.toggle('active', isActive);
    p.querySelector('.pill-check').style.opacity = isActive ? '1' : '0';
  });
}

function makePill(label, isActive, onClick) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'genre-pill' + (isActive ? ' active' : '');
  pill.dataset.value = label === 'Tous les genres' ? '' : label;
  pill.innerHTML = `
    <i class="fa-solid fa-check pill-check" style="opacity:${isActive ? 1 : 0}"></i>
    ${label}`;
  pill.addEventListener('click', onClick);
  return pill;
}

btnOpenModal.addEventListener('click', () => {
  resetForm();
  modalTitle.textContent = 'Ajouter un livre';
  buildModalPills('');
  openModal();
});

window.openEditModal = function(id) {
  const livre = allLivres.find(l => l.id === id);
  if (!livre) return;

  resetForm();
  modalTitle.textContent     = 'Modifier un livre';
  inputId.value              = livre.id;
  inputTitre.value           = livre.titre;
  inputAuteur.value          = livre.auteur;
  inputDescription.value     = livre.description || '';
  inputCouverture.value      = livre.couverture  || '';
  inputALire.checked         = livre.aLire       || false;

  buildModalPills(livre.genre);   
  openModal();
};
btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

function openModal()  { modalOverlay.classList.add('open'); }
function closeModal() { modalOverlay.classList.remove('open'); }
function resetForm()  { livreForm.reset(); inputId.value = ''; }
livreForm.addEventListener('submit', async e => {
  e.preventDefault();

  const payload = {
    titre:       inputTitre.value.trim(),
    auteur:      inputAuteur.value.trim(),
    genre:       inputGenre.value,
    description: inputDescription.value.trim(),
    couverture:  inputCouverture.value.trim(),
    aLire:       inputALire.checked
  };

  if (!payload.titre || !payload.auteur || !payload.genre) {
    alert('Veuillez remplir le titre, l\'auteur et sélectionner un genre.');
    return;
  }

  const id = inputId.value;

  try {
    if (id) {
      const res = await fetch(`${BASE_URL}/livres/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload })
      });
      if (!res.ok) throw new Error();
    } else {
      const maxId = allLivres.reduce((max, l) => {
        const n = parseInt(l.id, 10);
        return isNaN(n) ? max : Math.max(max, n);
      }, 0);
      const nextId = String(maxId + 1);

      const res = await fetch(`${BASE_URL}/livres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: nextId, ...payload })
      });
      if (!res.ok) throw new Error();
    }

    closeModal();
    await fetchLivres();

  } catch {
    alert('Une erreur est survenue. Réessayez.');
  }
});

window.deleteLivre = async function(id) {
  const livre = allLivres.find(l => l.id === id);
  if (!livre) return;
  if (!confirm(`Supprimer "${livre.titre}" ?`)) return;

  try {
    const res = await fetch(`${BASE_URL}/livres/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    await fetchLivres();
  } catch {
    alert('Impossible de supprimer ce livre.');
  }
};

function getUniqueGenres() {
  return [...new Set(allLivres.map(l => l.genre).filter(Boolean))].sort();
}

function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
fetchLivres();