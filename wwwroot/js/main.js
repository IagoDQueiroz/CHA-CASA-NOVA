/**
 * MAIN.JS — Lógica geral, animações e mensagens de convidados
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initRevealOnScroll();
  initRecados();
});

// ============================================
// NAVBAR E CONTROLES MOBILE
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!navbar) return;

  // Alteração de estilo ao scrollar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.remove('navbar--transparent');
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
      navbar.classList.add('navbar--transparent');
    }
  });

  // Toggle Hamburger e Mobile Menu
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
      hamburger.setAttribute('aria-expanded', !expanded);
    });

    // Fechar ao clicar nos links
    mobileMenu.querySelectorAll('.navbar__mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// ============================================
// ANIMAÇÃO REVEAL ON SCROLL
// ============================================
function initRevealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Executa apenas uma vez
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    // Fallback para navegadores antigos
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < windowHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Executa inicialmente
  }
}

// ============================================
// GESTÃO DE RECADOS (LocalStorage)
// ============================================
function initRecados() {
  const form = document.getElementById('recados-form');
  const cardsContainer = document.getElementById('recados-cards');
  if (!form || !cardsContainer) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('btn-enviar-recado');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Enviando...';

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Erro na resposta do servidor:', response.status, errText);
        throw new Error(`Erro do servidor (${response.status})`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const rawText = await response.text();
        console.error('Resposta não-JSON do servidor:', rawText);
        throw new Error('Resposta inválida do servidor.');
      }

      const result = await response.json();

      if (result.success) {
        // Remover a mensagem de lista vazia se ela existir
        const emptyMsg = cardsContainer.querySelector('div[style*="text-align: center"]');
        if (emptyMsg) {
          emptyMsg.remove();
        }

        // Criar o novo card de comentário
        const card = document.createElement('div');
        card.className = 'recado-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        card.style.transition = 'all 0.4s ease';

        card.innerHTML = `
          <div class="recado-card__header">
            <span class="recado-card__name">${escapeHtml(result.nome)}</span>
            <span class="recado-card__date">${escapeHtml(result.data)}</span>
          </div>
          <p class="recado-card__msg">"${escapeHtml(result.mensagem)}"</p>
        `;

        // Inserir no início do mural (prepend)
        cardsContainer.insertBefore(card, cardsContainer.firstChild);

        // Forçar reflow para animar a entrada
        card.offsetHeight;
        card.style.opacity = '1';
        card.style.transform = 'none';

        // Mostrar Toast de Sucesso e limpar o formulário
        showToast('Mensagem enviada com carinho! 💛');
        form.reset();
      } else {
        alert(result.message || 'Erro ao enviar recado.');
      }
    } catch (error) {
      console.error(error);
      alert(`Ocorreu um erro ao enviar seu recado (${error.message}). Por favor, tente novamente.`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });
}



// ============================================
// UTILITÁRIOS GERAIS
// ============================================
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================
// CONEXÃO SIGNALR EM TEMPO REAL (REAL-TIME WS)
// ============================================
if (typeof signalR !== 'undefined') {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/notificationHub")
    .withAutomaticReconnect()
    .build();

  // Recebe recado novo em tempo real de outros navegadores
  connection.on("NovoRecado", (recado) => {
    const cardsContainer = document.getElementById('recados-cards');
    if (!cardsContainer) return;

    // Remove mensagem "Nenhum recado ainda" se existir
    const emptyMsg = cardsContainer.querySelector('div[style*="text-align: center"]');
    if (emptyMsg) {
      emptyMsg.remove();
    }

    const card = document.createElement('div');
    card.className = 'recado-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px)';
    card.style.transition = 'all 0.4s ease';

    card.innerHTML = `
      <div class="recado-card__header">
        <span class="recado-card__name">${escapeHtml(recado.nome)}</span>
        <span class="recado-card__date">${escapeHtml(recado.data)}</span>
      </div>
      <p class="recado-card__msg">"${escapeHtml(recado.mensagem)}"</p>
    `;

    cardsContainer.insertBefore(card, cardsContainer.firstChild);

    card.offsetHeight; // Forçar reflow
    card.style.opacity = '1';
    card.style.transform = 'none';
  });

  // Recebe atualização de status de produtos em tempo real
  connection.on("NovoStatusProduto", (data) => {
    // 1. Atualizar banco de dados local da memória da página (se existir)
    if (window.presentesDb) {
      const pIndex = window.presentesDb.findIndex(item => item.id === data.id);
      if (pIndex !== -1) {
        window.presentesDb[pIndex].status = data.status;
        window.presentesDb[pIndex].progresso = data.status === 'reservado' ? 100 : 0;
        window.presentesDb[pIndex].quantidadeEscolhida = data.status === 'reservado' ? 1 : 0;
      }
    }

    // 2. Atualizar cards correspondentes no DOM (Mural principal e Catálogo completo)
    const cards = document.querySelectorAll(`.presente-card[data-id="${data.id}"], [data-id="${data.id}"]`);
    cards.forEach(card => {
      const badgeWrap = card.querySelector('.presente-card__status-badge');
      const footer = card.querySelector('.presente-card__footer');

      if (data.status === 'reservado') {
        // Altera badge
        if (badgeWrap) {
          badgeWrap.innerHTML = `<span class="badge badge--reserved">Escolhido 💛</span>`;
        }
        // Altera botão
        if (footer) {
          const priceSpan = footer.querySelector('.presente-card__price')?.outerHTML || '';
          footer.innerHTML = `${priceSpan}<button class="presente-card__btn presente-card__btn--reserved" disabled aria-disabled="true">Reservado</button>`;
        }
      } else {
        // Altera badge
        if (badgeWrap) {
          badgeWrap.innerHTML = `<span class="badge badge--available">Disponível</span>`;
        }
        // Altera botão
        if (footer) {
          const priceSpan = footer.querySelector('.presente-card__price')?.outerHTML || '';
          footer.innerHTML = `${priceSpan}<button class="presente-card__btn">Presentear</button>`;
        }
      }
    });
  });

  connection.start().then(() => {
    console.log("Conectado ao SignalR Hub de Notificações! 🚀");
  }).catch(err => {
    console.error("Erro ao estabelecer conexão SignalR:", err);
  });
}
