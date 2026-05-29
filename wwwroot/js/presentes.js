/**
 * PRESENTES.JS — Lógica do catálogo de presentes, filtros e modal de doação
 */

const CONFIG = {
  nomes: "Vitória & Rodrigo",
  nomeA: "Vitória",
  nomeB: "Rodrigo",
  dataEvento: "27 de junho de 2026",
  localEvento: "Maceió, Alagoas",
  pixKey: "vitoriaerodrigo@email.com",
  whatsapp: "5582999990000",
  instagram: "@vitoriaerodrigo",
  endereco: "Rua das Palmeiras, 789 – Ponta Verde, Maceió, AL",
  itemsPerPage: 8,
};

let currentCat = 'todos';
let currentSearch = '';
let currentSort = 'default';
let visibleCount = CONFIG.itemsPerPage;
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

// Inicialização do Banco de Dados de Presentes (usando dados dinâmicos do Razor)
let presentesDb = window.presentesDb || [];

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  initModalEvents();
  
  // Verifica se é a página principal ou a do catálogo completo
  if (document.getElementById('presentes-grid')) {
    updateCategoryCounts();
    renderPresentesGrid();
  } else if (document.getElementById('presentes-horizontal-scroll')) {
    renderPresentesHorizontal();
  }
});

// ============================================
// RENDERIZAR CARDS — GRADE COMPLETA (presentes.html)
// ============================================
function renderPresentesGrid() {
  const grid = document.getElementById('presentes-grid');
  if (!grid) return;

  let items = [...presentesDb];

  // Filtro de categoria
  if (currentCat !== 'todos') {
    items = items.filter(p => p.categoria === currentCat);
  }

  // Filtro de busca
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    items = items.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.descricao.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  }

  // Ordenação
  if (currentSort === 'price-asc') {
    items.sort((a, b) => a.preco - b.preco);
  } else if (currentSort === 'price-desc') {
    items.sort((a, b) => b.preco - a.preco);
  } else if (currentSort === 'available') {
    items.sort((a, b) => {
      const order = { disponivel: 0, parcial: 1, reservado: 2 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  } else {
    // Destaque primeiro e depois mais desejados
    items.sort((a, b) => {
      if (b.destaque !== a.destaque) return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0);
      return (b.desejo ? 1 : 0) - (a.desejo ? 1 : 0);
    });
  }

  const visibleItems = items.slice(0, visibleCount);
  grid.innerHTML = '';

  if (visibleItems.length === 0) {
    grid.innerHTML = `
      <div class="presentes__empty">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <p>Nenhum presente encontrado no momento</p>
      </div>`;
    return;
  }

  visibleItems.forEach((p, i) => {
    const card = createPresenteCard(p, i);
    grid.appendChild(card);
  });

  // Exibe/oculta botão "Carregar mais"
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = visibleCount >= items.length ? 'none' : 'inline-flex';
  }

  // Efeito de entrada suave dos cards
  setTimeout(() => {
    grid.querySelectorAll('.presente-card').forEach((card) => {
      card.classList.add('card-visible');
    });
  }, 50);
}

// ============================================
// RENDERIZAR CARDS — CARROSSEL HORIZONTAL (index.html)
// ============================================
function renderPresentesHorizontal() {
  const container = document.getElementById('presentes-horizontal-scroll');
  if (!container) return;

  // Mostra apenas itens destacados ou desejados que ainda não estão reservados
  let items = presentesDb.filter(p => p.status !== 'reservado');
  
  // Fallback: se todos foram escolhidos, mostra todos
  if (items.length === 0) {
    items = [...presentesDb];
  }

  // Ordena destaque primeiro
  items.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

  container.innerHTML = '';

  items.slice(0, 8).forEach((p, i) => {
    const card = createPresenteCard(p, i);
    container.appendChild(card);
  });

  // Configura botões de rolagem
  const btnLeft = document.getElementById('scroll-left');
  const btnRight = document.getElementById('scroll-right');
  if (btnLeft && btnRight) {
    btnLeft.addEventListener('click', () => {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    });
    btnRight.addEventListener('click', () => {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  setTimeout(() => {
    container.querySelectorAll('.presente-card').forEach((card) => {
      card.classList.add('card-visible');
    });
  }, 50);
}

// ============================================
// CONSTRUÇÃO E ESTRUTURA DO CARD
// ============================================
function createPresenteCard(p, index) {
  const isWished = wishlist.includes(p.id);
  const card = document.createElement('div');
  card.className = 'presente-card';
  card.setAttribute('role', 'listitem');
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = `opacity 0.4s ease, transform 0.4s ease`;

  const statusBadge = getStatusBadge(p.status, p.desejo);
  const btnHtml = getBtnHtml(p);
  
  // Progresso para contribuição parcial
  const progressHtml = p.status === 'parcial' ? `
    <div class="presente-card__progress">
      <div class="presente-card__progress-label">
        <span>Arrecadado</span>
        <span>${p.progresso}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${p.progresso}%"></div>
      </div>
    </div>` : '';

  card.innerHTML = `
    <div class="presente-card__image-wrap">
      ${p.imagem
        ? `<img src="${p.imagem}" alt="${p.nome}" loading="lazy">`
        : `<div class="presente-card__image-placeholder">
             <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/><circle cx="8.5" cy="13.5" r="1.5"/></svg>
           </div>`
      }
      <div class="presente-card__status-badge">${statusBadge}</div>
      <button class="presente-card__wish ${isWished ? 'active' : ''}"
              data-id="${p.id}" 
              aria-label="${isWished ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
              title="Adicionar à lista de desejos">
        <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>
      </button>
    </div>
    <div class="presente-card__body">
      <p class="presente-card__category">${getCatLabel(p.categoria)}</p>
      <h3 class="presente-card__name">${p.nome}</h3>
      <p class="presente-card__desc">${p.descricao}</p>
      ${progressHtml}
      <div class="presente-card__footer">
        <span class="presente-card__price">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
        ${btnHtml}
      </div>
    </div>`;

  // Clique do card abre modal
  card.addEventListener('click', (e) => {
    if (e.target.closest('.presente-card__wish') || e.target.closest('.presente-card__wish svg')) return;
    openModal(p.id);
  });

  // Clique no botão Favorito
  const wishBtn = card.querySelector('.presente-card__wish');
  wishBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWishlist(p.id, wishBtn);
  });

  return card;
}

// ============================================
// ELEMENTOS DE SUPORTE
// ============================================
function getStatusBadge(status, desejo) {
  if (status === 'reservado') {
    return `<span class="badge badge--reserved">Escolhido 💛</span>`;
  }
  if (status === 'parcial') {
    return `<span class="badge badge--partial">Parcial</span>`;
  }
  if (desejo) {
    return `<span class="badge badge--available" style="border-color: #e8a75a; color: #d6811e;">Muito Desejado 🔥</span>`;
  }
  return `<span class="badge badge--available">Disponível</span>`;
}

function getBtnHtml(p) {
  if (p.status === 'reservado') {
    return `<button class="presente-card__btn presente-card__btn--reserved" disabled aria-disabled="true">Reservado</button>`;
  }
  return `<button class="presente-card__btn">Presentear</button>`;
}

function getCatLabel(cat) {
  const map = {
    cozinha:    'Cozinha',
    sala:       'Sala',
    quarto:     'Quarto',
    eletros:    'Eletrodomésticos',
    decoracao:  'Decoração',
    banheiro:   'Banheiro',
    outros:     'Outros',
  };
  return map[cat] || cat;
}

// Gerenciamento de lista de desejos (Wishlist)
function toggleWishlist(id, btn) {
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    btn.classList.add('active');
    showToast('Adicionado aos favoritos 💛');
  } else {
    wishlist.splice(idx, 1);
    btn.classList.remove('active');
    showToast('Removido dos favoritos');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// ============================================
// FILTROS, ORDENAÇÃO E BUSCA
// ============================================
function initFilters() {
  // Clique nas Categorias
  const cats = document.querySelectorAll('.categoria-btn');
  cats.forEach(btn => {
    btn.addEventListener('click', () => {
      cats.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentCat = btn.dataset.cat;
      visibleCount = CONFIG.itemsPerPage;
      renderPresentesGrid();
    });
  });

  // Campo de busca
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = searchInput.value;
        visibleCount = CONFIG.itemsPerPage;
        renderPresentesGrid();
      }, 300);
    });
  }

  // Ordenação
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderPresentesGrid();
    });
  }

  // Botão carregar mais
  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += CONFIG.itemsPerPage;
      renderPresentesGrid();
    });
  }
}

function updateCategoryCounts() {
  document.querySelectorAll('.categoria-btn').forEach(btn => {
    const cat = btn.dataset.cat;
    if (cat === 'todos') return;
    const count = presentesDb.filter(p => p.categoria === cat).length;
    let countEl = btn.querySelector('.cat-count');
    if (!countEl) {
      countEl = document.createElement('span');
      countEl.className = 'cat-count';
      btn.appendChild(countEl);
    }
    countEl.textContent = count;
  });
}

// ============================================
// LÓGICA E EVENTOS DO MODAL
// ============================================
function initModalEvents() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
}

function openModal(id) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  if (!overlay || !content) return;

  const p = presentesDb.find(item => item.id === id);
  if (!p) return;

  renderModalDetails(p);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Renderiza a tela de detalhes do produto no modal
function renderModalDetails(p) {
  const content = document.getElementById('modal-content');
  if (!content) return;

  const isReserved = p.status === 'reservado';
  const progressHtml = p.status === 'parcial' ? `
    <div class="modal__status-section">
      <div class="modal__status-label">
        <span>Arrecadação Parcial</span>
        <span>${p.progresso}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${p.progresso}%"></div>
      </div>
    </div>` : '';

  content.innerHTML = `
    <div class="modal__inner">
      <div class="modal__gallery">
        <div class="modal__main-img-wrap">
          ${p.imagem 
            ? `<img src="${p.imagem}" alt="${p.nome}">` 
            : `<div class="modal__main-img-placeholder">
                 <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/><circle cx="8.5" cy="13.5" r="1.5"/></svg>
               </div>`
          }
        </div>
        <div class="modal__extra-info">
          <p><strong>📍 Endereço de entrega:</strong> ${CONFIG.endereco}</p>
          <p><strong>📞 Dúvidas / Pix:</strong> ${CONFIG.whatsapp.replace('55', '')} (WhatsApp)</p>
        </div>
      </div>
      <div class="modal__content">
        <p class="modal__category">${getCatLabel(p.categoria)}</p>
        <h2 class="modal__title">${p.nome}</h2>
        <p class="modal__price">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
        <p class="modal__desc">${p.descricao}</p>
        ${p.textoEmocional ? `<div class="modal__emotional-text">"${p.textoEmocional}"</div>` : ''}
        ${progressHtml}
        
        <div class="modal__actions">
          ${isReserved 
            ? `<button class="modal__cta" style="background: var(--color-section-mid); color: var(--color-cream-muted); cursor: not-allowed;" disabled>Este item já foi reservado</button>`
            : `<button class="modal__cta" id="start-donation-btn">
                 <svg viewBox="0 0 24 24"><path d="M20 7H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                 Quero presentear com este item
               </button>`
          }
          <button class="modal__secondary-btn" onclick="closeModal()">Voltar para a lista</button>
        </div>
      </div>
    </div>
  `;

  const startDonationBtn = document.getElementById('start-donation-btn');
  if (startDonationBtn) {
    startDonationBtn.addEventListener('click', () => {
      renderModalDonationForm(p);
    });
  }
}

// Renderiza a tela de formulário de doação no modal
function renderModalDonationForm(p) {
  const content = document.getElementById('modal-content');
  if (!content) return;

  content.innerHTML = `
    <div class="modal-confirm">
      <button class="modal-confirm__back-btn" id="back-details-btn">
        <svg viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Voltar aos detalhes
      </button>
      <h2 class="modal-confirm__title">Presentear: ${p.nome}</h2>
      <p class="modal-confirm__text">Preencha os dados abaixo para confirmar sua doação. O item será marcado como escolhido para evitar duplicidades.</p>
      
      <form class="modal-confirm__form" id="confirm-donation-form">
        <div class="linha-dupla">
          <div class="form-group">
            <label for="donor-name">Seu nome *</label>
            <input type="text" id="donor-name" required placeholder="Como podemos te chamar?">
          </div>
          <div class="form-group">
            <label for="donor-phone">Seu telefone *</label>
            <input type="tel" id="donor-phone" required placeholder="(82) 99999-0000" maxlength="15">
          </div>
        </div>
        <div class="form-group">
          <label for="donor-email">Seu e-mail</label>
          <input type="email" id="donor-email" placeholder="Para enviarmos o recibo e agradecimento">
        </div>
        <div class="form-group">
          <label for="delivery-method">Como deseja entregar? *</label>
          <select id="delivery-method" required>
            <option value="">Selecione a opção</option>
            <option value="pix">Contribuir com o valor via Pix (Chave Pix)</option>
            <option value="envio">Comprar em outra loja e enviar para o endereço</option>
            <option value="maos">Entregar em mãos no dia do evento</option>
          </select>
        </div>

        <div id="pix-container" style="display: none;">
          <div class="pix-instructions">
            <p style="font-size: 11px; margin-bottom: 8px;"><strong>Opção PIX selecionada:</strong> Você pode transferir o valor de <strong>R$ ${p.preco.toFixed(2).replace('.', ',')}</strong> utilizando a nossa chave Pix abaixo:</p>
            <div class="pix-instructions__key-area">
              <span class="pix-instructions__key" id="pix-key-val">${CONFIG.pixKey}</span>
              <button type="button" class="pix-instructions__copy-btn" id="copy-pix-btn">Copiar Chave</button>
            </div>
          </div>
        </div>

        <button type="submit" class="modal__cta" style="margin-top: var(--space-md);">
          Confirmar Presente 🎁
        </button>
      </form>
    </div>
  `;

  // Tratamento do telefone com máscara simples
  const phoneInput = document.getElementById('donor-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
      e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
  }

  // Volta para detalhes
  document.getElementById('back-details-btn').addEventListener('click', () => {
    renderModalDetails(p);
  });

  // Mostrar instruções de Pix se selecionado
  const deliverySelect = document.getElementById('delivery-method');
  const pixContainer = document.getElementById('pix-container');
  if (deliverySelect && pixContainer) {
    deliverySelect.addEventListener('change', () => {
      if (deliverySelect.value === 'pix') {
        pixContainer.style.display = 'block';
      } else {
        pixContainer.style.display = 'none';
      }
    });
  }

  // Copiar chave Pix
  const copyBtn = document.getElementById('copy-pix-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const keyVal = document.getElementById('pix-key-val').textContent;
      navigator.clipboard.writeText(keyVal).then(() => {
        copyBtn.textContent = 'Copiado!';
        copyBtn.style.background = '#28a745';
        setTimeout(() => {
          copyBtn.textContent = 'Copiar Chave';
          copyBtn.style.background = '';
        }, 2000);
      }).catch(err => {
        console.error('Falha ao copiar: ', err);
      });
    });
  }

  // Envio do formulário de doação
  const donationForm = document.getElementById('confirm-donation-form');
  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const donorName = document.getElementById('donor-name').value.trim();
      const donorPhone = document.getElementById('donor-phone').value.trim();
      const donorEmail = document.getElementById('donor-email').value.trim();
      const method = deliverySelect.value;

      if (!donorName || !donorPhone || !method) {
        showToast('Preencha os campos obrigatórios.');
        return;
      }

      // Submete os dados reais para o servidor ASP.NET Core
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/Produtos/Doar';
      
      const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
      if (tokenInput) {
        form.appendChild(tokenInput.cloneNode(true));
      }
      
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = 'id';
      idInput.value = p.id;
      form.appendChild(idInput);
      
      const nomeInput = document.createElement('input');
      nomeInput.type = 'hidden';
      nomeInput.name = 'nome';
      nomeInput.value = donorName;
      form.appendChild(nomeInput);
      
      const telefoneInput = document.createElement('input');
      telefoneInput.type = 'hidden';
      telefoneInput.name = 'telefone';
      telefoneInput.value = donorPhone;
      form.appendChild(telefoneInput);
      
      if (donorEmail) {
        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'email';
        emailInput.value = donorEmail;
        form.appendChild(emailInput);
      }
      
      const methodInput = document.createElement('input');
      methodInput.type = 'hidden';
      methodInput.name = 'formaEntrega';
      methodInput.value = method;
      form.appendChild(methodInput);
      
      document.body.appendChild(form);
      form.submit();
    });
  }
}

// Utilitário para exibir Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
