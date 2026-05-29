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
  
  if (!cardsContainer) return;

  // Carrega recados salvos ou inicializa com os padrões
  const storedRecados = localStorage.getItem('recados');
  let recados = [];
  if (storedRecados === null) {
    recados = [...RECADOS_INICIAIS];
    localStorage.setItem('recados', JSON.stringify(recados));
  } else {
    recados = JSON.parse(storedRecados);
  }

  // Renderiza recados na tela
  function renderRecados() {
    cardsContainer.innerHTML = '';
    // Exibe do mais recente para o mais antigo
    [...recados].reverse().forEach((r, i) => {
      const card = document.createElement('div');
      card.className = 'recado-card';
      card.style.opacity = '0';
      card.style.transform = 'translateY(15px)';
      card.style.transition = `opacity 0.4s ease ${i * 0.05}s, transform 0.4s ease ${i * 0.05}s`;
      
      card.innerHTML = `
        <div class="recado-card__header">
          <span class="recado-card__name">${escapeHtml(r.nome)}</span>
          <span class="recado-card__date">${r.data}</span>
        </div>
        <p class="recado-card__msg">"${escapeHtml(r.mensagem)}"</p>
      `;
      cardsContainer.appendChild(card);
      
      // Trigger reflow/animation
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'none';
      }, 50);
    });
  }

  renderRecados();

  // Envio de novo recado
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nomeInput = document.getElementById('recado-nome');
      const msgInput = document.getElementById('recado-msg');
      
      if (!nomeInput || !msgInput) return;

      const nome = nomeInput.value.trim();
      const mensagem = msgInput.value.trim();
      
      if (!nome || !mensagem) {
        showToast('Por favor, preencha todos os campos do recado.');
        return;
      }

      // Adiciona o recado
      const hoje = new Date();
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const dataStr = `${hoje.getDate()} ${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;

      const novoRecado = {
        id: Date.now(),
        nome: nome,
        mensagem: mensagem,
        data: dataStr
      };

      recados.push(novoRecado);
      localStorage.setItem('recados', JSON.stringify(recados));

      // Limpa formulário e renderiza novamente
      nomeInput.value = '';
      msgInput.value = '';
      
      renderRecados();
      showToast('Recado enviado com carinho! 💛');
    });
  }
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
