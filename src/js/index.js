// event listener to handle login redirecting
let button = document.getElementById("login");
button.addEventListener("click", () => {
  window.location.href = "login.html";
});

// Tooltip functionality for card buttons
let tooltip = null;

function createTooltip() {
  tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(event, text) {
  if (!tooltip) {
    createTooltip();
  }
  
  tooltip.textContent = text;
  tooltip.classList.add('show');
  updateTooltipPosition(event);
}

function updateTooltipPosition(event) {
  if (!tooltip) return;
  
  const offsetX = 10;
  const offsetY = 15;
  
  // Calcula a posição inicial
  let left = event.clientX + offsetX;
  let top = event.clientY + offsetY;
  
  // Aguarda para obter as dimensões corretas do tooltip
  requestAnimationFrame(() => {
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Ajusta horizontalmente se ultrapassar a borda direita
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = event.clientX - tooltipRect.width - offsetX;
      // Se ainda ultrapassar pela esquerda, centraliza
      if (left < 10) {
        left = viewportWidth - tooltipRect.width - 10;
      }
    }
    
    // Ajusta verticalmente se ultrapassar a borda inferior
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = event.clientY - tooltipRect.height - offsetY;
    }
    
    // Garante que não saia pela esquerda
    if (left < 10) {
      left = 10;
    }
    
    // Garante que não saia pelo topo
    if (top < 10) {
      top = 10;
    }
    
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  });
}

function hideTooltip() {
  if (tooltip) {
    tooltip.classList.remove('show');
  }
}

// Função para inicializar tooltips nos botões
function inicializarTooltips() {
  const cardButtons = document.querySelectorAll('.card__button');
  
  cardButtons.forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
      const tooltipText = btn.getAttribute('data-tooltip');
      if (tooltipText) {
        showTooltip(e, tooltipText);
      }
    });
    
    btn.addEventListener('mousemove', (e) => {
      updateTooltipPosition(e);
    });
    
    btn.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  });
}


function Card(title, description, img_url){
  return`
      <article class="card">
          <figure class="card__figure">
              <img class="card__image" src="${img_url}" alt="">
          </figure>
          <div class="card__content">
              <h3 class="card__title">${title}</h3>
              <p class="card__description">${description}</p>
              <div class="buttons__section">
                  <button class="card__button" data-tooltip="Mais informações"><img src="/src/img/icons/info-circle.svg" alt="informações"></button>
                  <button class="card__button" data-tooltip="Baixar"><img src="/src/img/icons/arrow-to-bottom-stroke.svg" alt="download"></button>
              </div>
          </div>
      </article>
  `
}

// Variáveis globais para armazenar os dados e paginação
let dadosEsbocos = [];
let dadosFiltrados = [];
let paginaAtual = 1;
const CARDS_POR_PAGINA = 12;

async function loadData(){
  try{
    const response = await fetch('/src/js/data.json');
    const data = await response.json();
    
    // Armazena os dados na variável global
    dadosEsbocos = data;
    dadosFiltrados = data;
    
    console.log('Dados carregados:', dadosEsbocos);
    return dadosEsbocos;
  }
  catch(erro){
     console.error("Erro ao carregar o JSON:", erro);
     return [];
  }
}

// Função para buscar por ID
function buscarPorId(id) {
  return dadosEsbocos.find(item => item.id === id);
}

// Função para buscar por nome/título (busca parcial, case-insensitive)
function buscarPorNome(nome) {
  const nomeLower = nome.toLowerCase();
  return dadosEsbocos.filter(item => 
    item.titulo.toLowerCase().includes(nomeLower)
  );
}

// Função para obter todos os dados
function obterTodos() {
  return dadosEsbocos;
}

// Função para renderizar cards
function renderizarCards() {
  const container = document.getElementById("conteiner-col");
  container.innerHTML = '';
  
  const inicio = (paginaAtual - 1) * CARDS_POR_PAGINA;
  const fim = inicio + CARDS_POR_PAGINA;
  const cardsParaExibir = dadosFiltrados.slice(inicio, fim);
  
  cardsParaExibir.forEach(item => {
    const card = Card(item.titulo, item.descricao, item.imagem);
    container.innerHTML += card;
  });
  
  // Inicializar tooltips após adicionar os cards
  inicializarTooltips();
  
  // Atualizar controles de paginação
  atualizarPaginacao();
}

// Função para atualizar controles de paginação
function atualizarPaginacao() {
  const totalPaginas = Math.ceil(dadosFiltrados.length / CARDS_POR_PAGINA);
  const pageNumbersContainer = document.getElementById('page-numbers');
  pageNumbersContainer.innerHTML = '';
  
  // Botões anterior/próximo
  document.getElementById('prev-page').disabled = paginaAtual === 1;
  document.getElementById('next-page').disabled = paginaAtual === totalPaginas || totalPaginas === 0;
  
  if (totalPaginas === 0) return;
  
  // Lógica para mostrar números de páginas
  let pagesToShow = [];
  
  if (totalPaginas <= 5) {
    // Mostrar todas as páginas se forem 5 ou menos
    for (let i = 1; i <= totalPaginas; i++) {
      pagesToShow.push(i);
    }
  } else {
    // Lógica para mostrar páginas com reticências
    if (paginaAtual <= 3) {
      pagesToShow = [1, 2, 3, 4, '...', totalPaginas];
    } else if (paginaAtual >= totalPaginas - 2) {
      pagesToShow = [1, '...', totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      pagesToShow = [1, '...', paginaAtual - 1, paginaAtual, paginaAtual + 1, '...', totalPaginas];
    }
  }
  
  // Renderizar números de páginas
  pagesToShow.forEach(page => {
    if (page === '...') {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'page-ellipsis';
      ellipsis.textContent = '...';
      pageNumbersContainer.appendChild(ellipsis);
    } else {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'page-number';
      if (page === paginaAtual) {
        pageBtn.classList.add('active');
      }
      pageBtn.textContent = page;
      pageBtn.addEventListener('click', () => irParaPagina(page));
      pageNumbersContainer.appendChild(pageBtn);
    }
  });
}

// Função para ir para uma página específica
function irParaPagina(numeroPagina) {
  paginaAtual = numeroPagina;
  renderizarCards();
}

// Função para pesquisar
function realizarPesquisa() {
  const searchInput = document.getElementById('search-input');
  const termoPesquisa = searchInput.value.trim();
  
  if (termoPesquisa === '') {
    dadosFiltrados = dadosEsbocos;
  } else {
    dadosFiltrados = buscarPorNome(termoPesquisa);
  }
  
  paginaAtual = 1; // Resetar para primeira página
  renderizarCards();
}

// Event listeners para paginação
document.getElementById('prev-page').addEventListener('click', () => {
  if (paginaAtual > 1) {
    irParaPagina(paginaAtual - 1);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  const totalPaginas = Math.ceil(dadosFiltrados.length / CARDS_POR_PAGINA);
  if (paginaAtual < totalPaginas) {
    irParaPagina(paginaAtual + 1);
  }
});

// Event listeners para pesquisa
document.getElementById('search-btn').addEventListener('click', realizarPesquisa);

document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    realizarPesquisa();
  }
});

// Limpar filtro quando input estiver vazio
document.getElementById('search-input').addEventListener('input', (e) => {
  if (e.target.value === '') {
    dadosFiltrados = dadosEsbocos;
    paginaAtual = 1;
    renderizarCards();
  }
});

// Carrega os dados ao iniciar a página
loadData().then(data => {
  renderizarCards();
});

