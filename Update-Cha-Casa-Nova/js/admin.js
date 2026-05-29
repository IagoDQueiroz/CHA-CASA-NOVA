/**
 * ADMIN.JS — Lógica da área administrativa, autenticação e CRUD de presentes
 */

// Banco de dados local compartilhado
let adminDb = JSON.parse(localStorage.getItem('presentes_db') || '[]');
if (adminDb.length === 0) {
  adminDb = [...PRESENTES_DATA]; // Fallback do data.js
  localStorage.setItem('presentes_db', JSON.stringify(adminDb));
}

document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.getElementById('login-form') !== null;
  const isAdminPage = document.getElementById('admin-table-body') !== null;

  if (isLoginPage) {
    initLogin();
  } else if (isAdminPage) {
    checkAuth();
    initAdmin();
  }
});

// ============================================
// LÓGICA DE AUTENTICAÇÃO (SESSÃO SIMULADA)
// ============================================
function checkAuth() {
  const loggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
  if (!loggedIn) {
    window.location.href = 'login.html';
  }
}

function initLogin() {
  // Se já estiver logado, vai direto pro painel
  if (sessionStorage.getItem('admin_logged_in') === 'true') {
    window.location.href = 'admin.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const btnRequestCode = document.getElementById('btn-request-code');
  const loginCodeInput = document.getElementById('login-code');
  const errorAlert = document.getElementById('login-error-alert');

  // Enviar Código por e-mail (Simulado)
  if (btnRequestCode) {
    btnRequestCode.addEventListener('click', () => {
      showToast('Código administrativo enviado para vitoriaerodrigo@email.com! ✉️');
      // Autofill de teste no input para ajudar o usuário
      if (loginCodeInput) {
        loginCodeInput.value = '12345678';
      }
    });
  }

  // Submit do Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const code = loginCodeInput.value.trim();
      
      // Validação: Aceita qualquer código de 8 dígitos para a simulação, mas o padrão é 12345678
      if (code.length === 8) {
        sessionStorage.setItem('admin_logged_in', 'true');
        showToast('Acesso autorizado! Redirecionando...');
        
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1200);
      } else {
        errorAlert.style.display = 'block';
        loginCodeInput.focus();
      }
    });
  }
}

// ============================================
// LOGOUT ADMINISTRATIVO
// ============================================
function initAdminLogout() {
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_logged_in');
      window.location.href = 'login.html';
    });
  }
}

// ============================================
// PAINEL ADMINISTRATIVO (DASHBOARD E CRUD)
// ============================================
function initAdmin() {
  initAdminLogout();
  renderAdminDashboard();
  initCrudModal();
}

function renderAdminDashboard() {
  // Atualiza banco local
  adminDb = JSON.parse(localStorage.getItem('presentes_db') || '[]');
  
  updateStats();
  renderTable();
  renderRecadosTable();
}

// Renderização da Tabela de Recados/Comentários
function renderRecadosTable() {
  const tbody = document.getElementById('admin-recados-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const storedRecados = localStorage.getItem('recados');
  let recados = [];
  if (storedRecados === null) {
    recados = [...RECADOS_INICIAIS];
    localStorage.setItem('recados', JSON.stringify(recados));
  } else {
    recados = JSON.parse(storedRecados);
  }

  if (recados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; color: rgba(40,35,35,0.4); padding: 30px 0;">
          Nenhum recado postado no mural.
        </td>
      </tr>`;
    return;
  }

  // Renderiza em ordem decrescente de inserção (mais recente primeiro)
  [...recados].reverse().forEach((r) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${escapeHtml(r.nome)}</td>
      <td style="max-width: 400px; white-space: normal; word-break: break-word;">${escapeHtml(r.mensagem)}</td>
      <td>${r.data}</td>
      <td>
        <div class="admin-acoes">
          <button class="admin-acoes-btn admin-acoes-btn--delete recado-delete-btn" data-id="${r.id}">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind dos botões de exclusão
  tbody.querySelectorAll('.recado-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteRecado(parseInt(btn.dataset.id));
    });
  });
}

// Excluir Recado/Comentário
function deleteRecado(id) {
  let recados = JSON.parse(localStorage.getItem('recados') || '[]');
  const recado = recados.find(r => r.id === id);
  if (!recado) return;

  if (confirm(`Deseja realmente excluir o recado de "${recado.nome}"?`)) {
    recados = recados.filter(r => r.id !== id);
    localStorage.setItem('recados', JSON.stringify(recados));
    showToast('Recado excluído com sucesso.');
    renderRecadosTable();
  }
}

// Atualização de Resumos de Estatísticas
function updateStats() {
  const statTotal = document.getElementById('stat-total-items');
  const statAvailable = document.getElementById('stat-available-items');
  const statDonated = document.getElementById('stat-donated-items');
  const statValue = document.getElementById('stat-total-value');

  if (!statTotal || !statAvailable || !statDonated || !statValue) return;

  const total = adminDb.length;
  const donated = adminDb.filter(p => p.status === 'reservado').length;
  const available = total - donated;
  const sumValue = adminDb.reduce((acc, p) => acc + p.preco, 0);

  statTotal.textContent = total;
  statAvailable.textContent = available;
  statDonated.textContent = donated;
  statValue.textContent = 'R$ ' + sumValue.toFixed(2).replace('.', ',');
}

// Renderização da Tabela de Presentes
function renderTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (adminDb.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: rgba(40,35,35,0.4); padding: 30px 0;">
          Nenhum presente cadastrado no catálogo.
        </td>
      </tr>`;
    return;
  }

  adminDb.forEach((p) => {
    const tr = document.createElement('tr');
    
    // Badge de status
    const statusLabel = p.status === 'reservado' 
      ? `<span class="badge badge--reserved" style="box-shadow:none;">Reservado</span>` 
      : `<span class="badge badge--available" style="box-shadow:none;">Disponível</span>`;

    tr.innerHTML = `
      <td style="font-weight: 600;">${escapeHtml(p.nome)}</td>
      <td>${getCatLabel(p.categoria)}</td>
      <td style="font-weight: 700;">R$ ${p.preco.toFixed(2).replace('.', ',')}</td>
      <td>${statusLabel}</td>
      <td>${p.status === 'reservado' ? escapeHtml(p.doador || 'Anônimo') : '-'}</td>
      <td>
        <div class="admin-acoes">
          <button class="admin-acoes-btn admin-acoes-btn--edit" data-id="${p.id}">Editar</button>
          <button class="admin-acoes-btn admin-acoes-btn--delete" data-id="${p.id}">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Bind dos botões da tabela
  tbody.querySelectorAll('.admin-acoes-btn--edit').forEach(btn => {
    btn.addEventListener('click', () => {
      openEditModal(parseInt(btn.dataset.id));
    });
  });

  tbody.querySelectorAll('.admin-acoes-btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      deleteProduct(parseInt(btn.dataset.id));
    });
  });
}

// ============================================
// GERENCIAMENTO DO MODAL DE CRUD
// ============================================
function initCrudModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const closeBtn = document.getElementById('admin-modal-close');
  const createBtn = document.getElementById('btn-create-product');
  const form = document.getElementById('product-crud-form');
  const isDoadoCheckbox = document.getElementById('product-is-doado');
  const donorFields = document.getElementById('admin-donor-fields');

  if (createBtn) {
    createBtn.addEventListener('click', openCreateModal);
  }

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeCrudModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCrudModal();
    });
  }

  // Toggle do campo doador com base no checkbox de doação
  if (isDoadoCheckbox && donorFields) {
    isDoadoCheckbox.addEventListener('change', () => {
      donorFields.style.display = isDoadoCheckbox.checked ? 'block' : 'none';
      if (!isDoadoCheckbox.checked) {
        document.getElementById('product-donor-name').value = '';
        document.getElementById('product-donor-phone').value = '';
      }
    });
  }

  // Submit do formulário do presente
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProduct();
    });
  }
}

function openCreateModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  const form = document.getElementById('product-crud-form');
  const title = document.getElementById('admin-modal-title');
  const subtitle = document.getElementById('admin-modal-subtitle');
  const donorFields = document.getElementById('admin-donor-fields');

  if (!overlay || !form) return;

  form.reset();
  document.getElementById('product-id-val').value = '';
  title.textContent = 'Cadastrar Presente';
  subtitle.textContent = 'Preencha as informações do produto abaixo para adicioná-lo à lista pública.';
  
  if (donorFields) donorFields.style.display = 'none';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
  const overlay = document.getElementById('admin-modal-overlay');
  const form = document.getElementById('product-crud-form');
  const title = document.getElementById('admin-modal-title');
  const subtitle = document.getElementById('admin-modal-subtitle');
  const donorFields = document.getElementById('admin-donor-fields');

  if (!overlay || !form) return;

  const p = adminDb.find(item => item.id === id);
  if (!p) return;

  title.textContent = 'Editar Presente';
  subtitle.textContent = 'Altere as informações abaixo para atualizar o presente na lista.';

  // Prefill formulário
  document.getElementById('product-id-val').value = p.id;
  document.getElementById('product-name').value = p.nome;
  document.getElementById('product-price').value = p.preco;
  document.getElementById('product-category').value = p.categoria;
  document.getElementById('product-desc').value = p.descricao;
  document.getElementById('product-emotional').value = p.textoEmocional || '';
  document.getElementById('product-image').value = p.imagem || '';
  document.getElementById('product-link').value = p.linkProduto || '';
  
  const isDoado = p.status === 'reservado';
  document.getElementById('product-is-doado').checked = isDoado;
  
  if (donorFields) {
    donorFields.style.display = isDoado ? 'block' : 'none';
  }

  if (isDoado) {
    document.getElementById('product-donor-name').value = p.doador || '';
    document.getElementById('product-donor-phone').value = p.telefoneDoador || '';
  } else {
    document.getElementById('product-donor-name').value = '';
    document.getElementById('product-donor-phone').value = '';
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCrudModal() {
  const overlay = document.getElementById('admin-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// Salvar / Adicionar presente
function saveProduct() {
  const idVal = document.getElementById('product-id-val').value;
  const nome = document.getElementById('product-name').value.trim();
  const preco = parseFloat(document.getElementById('product-price').value);
  const categoria = document.getElementById('product-category').value;
  const descricao = document.getElementById('product-desc').value.trim();
  const emotional = document.getElementById('product-emotional').value.trim();
  const imagem = document.getElementById('product-image').value.trim();
  const link = document.getElementById('product-link').value.trim();
  const isDoado = document.getElementById('product-is-doado').checked;
  const donorName = document.getElementById('product-donor-name').value.trim();
  const donorPhone = document.getElementById('product-donor-phone').value.trim();

  if (!nome || isNaN(preco) || !categoria || !descricao) return;

  const status = isDoado ? 'reservado' : 'disponivel';
  const progresso = isDoado ? 100 : 0;

  if (idVal) {
    // Editar existente
    const id = parseInt(idVal);
    const idx = adminDb.findIndex(item => item.id === id);
    if (idx !== -1) {
      adminDb[idx] = {
        ...adminDb[idx],
        nome,
        preco,
        categoria,
        descricao,
        textoEmocional: emotional || null,
        imagem: imagem || null,
        linkProduto: link || null,
        status,
        progresso,
        doador: isDoado ? (donorName || 'Anônimo') : null,
        telefoneDoador: isDoado ? donorPhone : null
      };
      showToast('Presente atualizado com sucesso! 🎉');
    }
  } else {
    // Criar novo presente
    const novoPresente = {
      id: Date.now(),
      nome,
      preco,
      categoria,
      descricao,
      textoEmocional: emotional || null,
      imagem: imagem || null,
      linkProduto: link || null,
      status,
      progresso,
      quantidadeEscolhida: isDoado ? 1 : 0,
      doador: isDoado ? (donorName || 'Anônimo') : null,
      telefoneDoador: isDoado ? donorPhone : null,
      destaque: false,
      desejo: false
    };
    adminDb.push(novoPresente);
    showToast('Novo presente adicionado à lista! 🎁');
  }

  localStorage.setItem('presentes_db', JSON.stringify(adminDb));
  closeCrudModal();
  renderAdminDashboard();
}

// Excluir Presente
function deleteProduct(id) {
  const p = adminDb.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Deseja realmente excluir "${p.nome}" da lista de presentes?`)) {
    adminDb = adminDb.filter(item => item.id !== id);
    localStorage.setItem('presentes_db', JSON.stringify(adminDb));
    showToast('Presente excluído da lista.');
    renderAdminDashboard();
  }
}

// ============================================
// HELPERS
// ============================================
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

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

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
