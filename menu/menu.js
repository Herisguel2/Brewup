import { auth } from '../firebase.js';
import { saveOrder } from '../firebase.js';

// Carrossel do Menu
class MenuCarousel {
  constructor() {
    this.carousels = document.querySelectorAll('.carousel-container');
    this.initializeCarousels();
  }

  initializeCarousels() {
    this.carousels.forEach(carousel => {
      const items = carousel.querySelector('.carousel-items');
      const prevButton = carousel.querySelector('.carousel-button.prev');
      const nextButton = carousel.querySelector('.carousel-button.next');
      const itemWidth = 300; // Largura de cada item do menu
      let currentPosition = 0;

      // Adiciona event listeners para os botões de navegação
      prevButton.addEventListener('click', () => {
        const maxScroll = items.scrollWidth - items.clientWidth;
        currentPosition = Math.max(currentPosition - itemWidth, 0);
        items.scrollTo({
          left: currentPosition,
          behavior: 'smooth'
        });
      });

      nextButton.addEventListener('click', () => {
        const maxScroll = items.scrollWidth - items.clientWidth;
        currentPosition = Math.min(currentPosition + itemWidth, maxScroll);
        items.scrollTo({
          left: currentPosition,
          behavior: 'smooth'
        });
      });

      // Adiciona suporte para touch em dispositivos móveis
      let touchStartX = 0;
      let touchEndX = 0;

      items.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      });

      items.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX, items, currentPosition, itemWidth);
      });
    });
  }

  handleSwipe(startX, endX, items, currentPosition, itemWidth) {
    const swipeThreshold = 50;
    const diff = startX - endX;
    const maxScroll = items.scrollWidth - items.clientWidth;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        currentPosition = Math.min(currentPosition + itemWidth, maxScroll);
      } else {
        currentPosition = Math.max(currentPosition - itemWidth, 0);
      }

      items.scrollTo({
        left: currentPosition,
        behavior: 'smooth'
      });
    }
  }
}

// Carrinho de Compras
class ShoppingCart {
  constructor() {
    this.items = [];
    this.initializeCart();
  }

  initializeCart() {
    // Adiciona event listeners para todos os botões "Adicionar ao Carrinho"
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const itemData = JSON.parse(e.target.dataset.item);
        this.addItem(itemData);
      });
    });
    // Carrega itens do carrinho do localStorage
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
  }

  addItem(item) {
    this.items.push(item);
    // Armazena itens no localStorage
    localStorage.setItem('cart', JSON.stringify(this.items));
    // Mostra confirmação
    this.showConfirmation(item.name);
  }

  showConfirmation(itemName) {
    // Cria elemento de confirmação
    const confirmation = document.createElement('div');
    confirmation.className = 'cart-confirmation';
    confirmation.textContent = `${itemName} adicionado ao carrinho!`;
    document.body.appendChild(confirmation);

    // Remove após 2 segundos
    setTimeout(() => {
      confirmation.remove();
    }, 2000);
  }
}

// Function to handle scroll animations
function handleScrollAnimations() {
    const elements = document.querySelectorAll('.menu-section');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('reveal-on-scroll');
        }
    });
}

// Function to handle carousel functionality
function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel-container');
    
    carousels.forEach(carousel => {
        const items = carousel.querySelector('.carousel-items');
        const prevButton = carousel.querySelector('.prev');
        const nextButton = carousel.querySelector('.next');
        let currentPosition = 0;
        const itemWidth = items.querySelector('.menu-item').offsetWidth;
        const itemsCount = items.children.length;
        
        // Update carousel position
        const updateCarousel = () => {
            items.style.transform = `translateX(${currentPosition}px)`;
        };
        
        // Handle next button click
        nextButton.addEventListener('click', () => {
            if (currentPosition > -(itemWidth * (itemsCount - 3))) {
                currentPosition -= itemWidth;
                updateCarousel();
            }
        });
        
        // Handle previous button click
        prevButton.addEventListener('click', () => {
            if (currentPosition < 0) {
                currentPosition += itemWidth;
                updateCarousel();
            }
        });
    });
}

// Function to handle menu item hover effects
function handleMenuItemHover() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const image = item.querySelector('.menu-item-image');
        const content = item.querySelector('.menu-item-content');
        const badge = item.querySelector('.menu-item-badge');
        
        item.addEventListener('mouseenter', () => {
            image.style.transform = 'scale(1.05)';
            content.style.transform = 'translateY(-5px)';
            badge.style.transform = 'scale(1.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            image.style.transform = 'scale(1)';
            content.style.transform = 'translateY(0)';
            badge.style.transform = 'scale(1)';
        });
    });
}

// Function to handle add to cart animation
function handleAddToCart() {
    const addButtons = document.querySelectorAll('.add-to-cart');
    
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            button.appendChild(ripple);
            
            // Get click position
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Set ripple position
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // Add success animation
            button.classList.add('success');
            setTimeout(() => {
                button.classList.remove('success');
            }, 1000);
        });
    });
}

// Tipo de pedido global
let orderType = null;

// Ao carregar a página, mostrar o modal de escolha
window.addEventListener('DOMContentLoaded', () => {
  const orderTypeModal = document.getElementById('order-type-modal');
  const mainContent = document.getElementById('menu-main-content');
  // Debug logs
  console.log('orderTypeModal:', orderTypeModal);
  console.log('mainContent:', mainContent);
  // Se já existe escolha salva, pula o modal
  const savedType = localStorage.getItem('orderType');
  console.log('orderType salvo:', savedType);
  if (savedType) {
    orderType = savedType;
    if (orderTypeModal) orderTypeModal.style.display = 'none';
    if (mainContent) mainContent.style.display = '';
  } else {
    if (orderTypeModal) orderTypeModal.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
  }
  // Listeners dos botões do modal
  document.querySelectorAll('.order-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setOrderTypeAndShowMenu(btn.dataset.type);
    });
  });
  // Fallback: se o modal não for fechado em 2 segundos, mostra o menu
  setTimeout(() => {
    if (mainContent && mainContent.style.display === 'none') {
      mainContent.style.display = '';
      if (orderTypeModal) orderTypeModal.style.display = 'none';
      console.warn('Fallback: mostrando menu por segurança.');
    }
  }, 2000);
  // Initial check for elements in view
  handleScrollAnimations();
  
  // Add scroll event listener
  window.addEventListener('scroll', handleScrollAnimations);
  
  // Initialize carousels
  initializeCarousels();
  
  // Initialize hover effects
  handleMenuItemHover();
  
  // Initialize add to cart animations
  handleAddToCart();
  
  const carousel = new MenuCarousel();
  const cart = new ShoppingCart();

  // Atualiza contador ao carregar
  updateCartCount();

  // Botão do carrinho
  const cartBtn = document.getElementById('cart-icon-btn');
  if (cartBtn) cartBtn.addEventListener('click', openCartModal);
  // Fechar modal
  const closeBtn = document.getElementById('cart-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeCartModal);
  
  // Inicializa o botão de finalizar (removido o event listener duplicado)
  updateCartFinishButton();

  // Atualiza contador sempre que adicionar ao carrinho
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      setTimeout(updateCartCount, 200); // Pequeno delay para garantir atualização
    });
  });

  setupAddToCartButtons();

  // Botão de trocar modo de pedido
  const changeBtn = document.getElementById('change-order-type-btn');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      // Limpa escolha anterior
      localStorage.removeItem('orderType');
      orderType = null;
      // Mostra o modal de escolha
      const orderTypeModal = document.getElementById('order-type-modal');
      const mainContent = document.getElementById('menu-main-content');
      if (orderTypeModal) orderTypeModal.style.display = 'flex';
      if (mainContent) mainContent.style.display = 'none';
    });
  }

  updateChangeOrderTypeBtn();
});

// Garante que o evento de clique é atribuído corretamente aos botões de adicionar ao carrinho
function setupAddToCartButtons() {
  document.querySelectorAll('.add-to-cart').forEach(button => {
    // Remove event listeners duplicados
    button.replaceWith(button.cloneNode(true));
  });
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      let itemData;
      try {
        itemData = JSON.parse(button.dataset.item);
      } catch (err) {
        alert('Erro ao ler dados do item!');
        return;
      }
      // Se orderType não estiver definido, tenta pegar do localStorage
      let tipo = (typeof orderType !== 'undefined' && orderType) ? orderType : localStorage.getItem('orderType') || 'mesa';
      if (!tipo) {
        alert('Escolha o tipo de pedido antes de adicionar ao carrinho!');
        return;
      }
      addToCart(itemData, tipo);
    });
  });
}

// Função para mostrar feedback ao adicionar ao carrinho
function showAddToCartFeedback() {
  const msg = document.createElement('div');
  msg.textContent = 'Item adicionado ao carrinho!';
  msg.style.position = 'fixed';
  msg.style.bottom = '100px';
  msg.style.right = '50px';
  msg.style.background = '#222';
  msg.style.color = '#fff';
  msg.style.padding = '1rem 2rem';
  msg.style.borderRadius = '10px';
  msg.style.fontWeight = 'bold';
  msg.style.zIndex = 3000;
  msg.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// Função para adicionar ao carrinho usando o tipo escolhido
function addToCart(item, tipo) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const itemWithType = { ...item, tipo };
  cart.push(itemWithType);
  localStorage.setItem('cart', JSON.stringify(cart));
  showAddToCartFeedback();
  if (typeof updateCartCount === 'function') updateCartCount();
  // Não redireciona mais aqui!
}

// Função para finalizar pedido (mesa)
async function finishMesaOrder() {
  try {
    // Get cart items
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const mesaItems = cart.filter(item => item.tipo === 'mesa');
    
    if (mesaItems.length === 0) {
      alert('Adicione itens ao carrinho primeiro!');
      return;
    }

    // Get current user
    const user = auth.currentUser;
    if (!user) {
      alert('Por favor, faça login para finalizar o pedido.');
      return;
    }

    // Prepare order data
    const orderData = {
      userId: user.uid,
      userName: user.displayName || user.email,
      items: mesaItems,
      total: mesaItems.reduce((sum, item) => sum + Number(item.price), 0),
      type: 'mesa',
      status: 'pending',
      createdAt: new Date() // Ensure it's a proper Date object
    };

    console.log('Mesa order createdAt:', orderData.createdAt);

    // Save order to Firebase
    const orderId = await saveOrder(orderData);

    // Feedback visual
    const msg = document.createElement('div');
    msg.textContent = 'Pedido realizado com sucesso!';
    msg.style.position = 'fixed';
    msg.style.bottom = '100px';
    msg.style.right = '50px';
    msg.style.background = '#28a745';
    msg.style.color = '#fff';
    msg.style.padding = '1rem 2rem';
    msg.style.borderRadius = '10px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = 3000;
    document.body.appendChild(msg);

    // Limpa o carrinho
    cart = cart.filter(item => item.tipo !== 'mesa');
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount && updateCartCount();
    closeCartModal && closeCartModal();

    // Remove message after 2 seconds
    setTimeout(() => {
      msg.remove();
    }, 2000);

  } catch (error) {
    console.error('Erro ao finalizar pedido:', error);
    alert('Erro ao finalizar pedido. Por favor, tente novamente.');
  }
}

// Atualiza o contador do carrinho
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.length;
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = count;
}

// Renderiza o modal do carrinho
function renderCartModal() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const list = document.getElementById('cart-items-list');
  const deliveryFormId = 'delivery-extra-form';
  if (!list) return;
  list.innerHTML = '';
  if (cart.length === 0) {
    list.innerHTML = '<p style="color:#fff;">Seu carrinho está vazio.</p>';
    // Remove form extra se existir
    const oldForm = document.getElementById(deliveryFormId);
    if (oldForm) oldForm.remove();
    return;
  }
  cart.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-info">
        <span><b>${item.name}</b> - R$ ${Number(item.price).toFixed(2)}</span>
        <span class="cart-item-type">${item.tipo === 'mesa' ? 'Mesa' : 'Delivery'}</span>
      </div>
      <button class="cart-item-remove" data-idx="${idx}">Remover</button>
    `;
    list.appendChild(div);
  });
  // Listeners para remover
  list.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = btn.dataset.idx;
      removeFromCart(idx);
    });
  });

  // Adiciona formulário extra se for delivery
  const tipo = (typeof orderType !== 'undefined' && orderType) ? orderType : localStorage.getItem('orderType') || 'mesa';
  let oldForm = document.getElementById(deliveryFormId);
  if (tipo === 'delivery') {
    if (oldForm) oldForm.remove();
    const form = document.createElement('form');
    form.id = deliveryFormId;
    form.innerHTML = `
      <div style="margin-top:1rem; display: flex; flex-direction: column; gap: 0.7rem;">
        <label style='color:#fff;display:flex;align-items:center;gap:0.5rem;font-size:1rem;'><i class="fas fa-user"></i> Nome completo</label>
        <input type="text" id="delivery-nome" placeholder="Ex: João da Silva" required style="width:100%;margin-bottom:0.1rem;" />
        <span style='color:#aaa;font-size:0.95em;margin-bottom:0.3rem;'>Digite seu nome completo</span>

        <label style='color:#fff;display:flex;align-items:center;gap:0.5rem;font-size:1rem;'><i class="fas fa-phone"></i> Telefone</label>
        <input type="text" id="delivery-telefone" placeholder="(15) 99999-9999" required style="width:100%;margin-bottom:0.1rem;" />
        <span style='color:#aaa;font-size:0.95em;margin-bottom:0.3rem;'>Exemplo: (15) 99999-9999</span>

        <label style='color:#fff;display:flex;align-items:center;gap:0.5rem;font-size:1rem;'><i class="fas fa-map-marker-alt"></i> Endereço</label>
        <input type="text" id="delivery-endereco" placeholder="Rua, número, bairro" required style="width:100%;margin-bottom:0.1rem;" />
        <span style='color:#aaa;font-size:0.95em;margin-bottom:0.3rem;'>Ex: Rua das Flores, 123, Centro</span>

        <label style='color:#fff;display:flex;align-items:center;gap:0.5rem;font-size:1rem;'><i class="fas fa-comment"></i> Observação</label>
        <input type="text" id="delivery-observacao" placeholder="Ex: Portão azul, apto 12 (opcional)" style="width:100%;margin-bottom:0.1rem;" />
        <span style='color:#aaa;font-size:0.95em;margin-bottom:0.3rem;'>Dica: ponto de referência, complemento, etc.</span>
        <span id='delivery-form-error' style='color:#ff4444;font-size:1em;min-height:1.2em;margin-top:0.5em;'></span>
      </div>
    `;
    list.parentNode.insertBefore(form, list.nextSibling);
  } else if (oldForm) {
    oldForm.remove();
  }
}

// Remove item do carrinho
function removeFromCart(idx) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(idx, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  renderCartModal();
}

// Abrir/fechar modal do carrinho
function openCartModal() {
  renderCartModal();
  updateCartFinishButton();
  document.getElementById('cart-modal').style.display = 'flex';
}
function closeCartModal() {
  document.getElementById('cart-modal').style.display = 'none';
}

function updateChangeOrderTypeBtn() {
  const changeBtn = document.getElementById('change-order-type-btn');
  const tipo = (typeof orderType !== 'undefined' && orderType) ? orderType : localStorage.getItem('orderType') || 'mesa';
  if (changeBtn) {
    if (tipo === 'mesa') {
      changeBtn.textContent = 'Mudar para Delivery';
    } else {
      changeBtn.textContent = 'Mudar para Mesa';
    }
  }
}

// Atualizar o texto do botão sempre que o tipo for escolhido
function setOrderTypeAndShowMenu(tipo) {
  orderType = tipo;
  localStorage.setItem('orderType', orderType);
  const orderTypeModal = document.getElementById('order-type-modal');
  const mainContent = document.getElementById('menu-main-content');
  if (orderTypeModal) orderTypeModal.style.display = 'none';
  if (mainContent) mainContent.style.display = '';
  updateChangeOrderTypeBtn();
}

function updateCartFinishButton() {
  const finishBtn = document.getElementById('cart-finish-btn');
  if (!finishBtn) return;
  
  // Remove existing click handlers
  finishBtn.replaceWith(finishBtn.cloneNode(true));
  
  // Get fresh reference after replacing
  const newFinishBtn = document.getElementById('cart-finish-btn');
  if (!newFinishBtn) return;
  
  const tipo = (typeof orderType !== 'undefined' && orderType) ? orderType : localStorage.getItem('orderType') || 'mesa';
  newFinishBtn.textContent = 'Finalizar Pedido';
  
  // Add single click handler
  newFinishBtn.addEventListener('click', async () => {
    if (newFinishBtn.dataset.processing === 'true') return;
    
    try {
      newFinishBtn.dataset.processing = 'true';
      newFinishBtn.disabled = true;
      newFinishBtn.style.opacity = '0.7';
      newFinishBtn.textContent = 'Processando...';
      
      if (tipo === 'mesa') {
        await finishMesaOrder();
      } else {
        await finishDeliveryOrder();
      }
    } catch (error) {
      console.error('Erro ao processar pedido:', error);
      alert('Erro ao processar pedido. Por favor, tente novamente.');
    } finally {
      newFinishBtn.dataset.processing = 'false';
      newFinishBtn.disabled = false;
      newFinishBtn.style.opacity = '1';
      newFinishBtn.textContent = 'Finalizar Pedido';
    }
  });
}

// Função para finalizar pedido de delivery
async function finishDeliveryOrder() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const deliveryItems = cart.filter(item => item.tipo === 'delivery');
  
  if (deliveryItems.length === 0) {
    alert('Adicione itens ao carrinho primeiro!');
    return;
  }
  
  const user = auth.currentUser;
  if (!user) {
    alert('Por favor, faça login para finalizar o pedido.');
    return;
  }
  
  // Pega dados do formulário
  const nome = document.getElementById('delivery-nome')?.value.trim();
  const telefone = document.getElementById('delivery-telefone')?.value.trim();
  const endereco = document.getElementById('delivery-endereco')?.value.trim();
  const observacao = document.getElementById('delivery-observacao')?.value.trim();
  const errorEl = document.getElementById('delivery-form-error');
  
  if (!nome || !telefone || !endereco) {
    if (errorEl) errorEl.textContent = 'Preencha nome, telefone e endereço!';
    return;
  } else if (errorEl) {
    errorEl.textContent = '';
  }
  
  const orderData = {
    userId: user.uid,
    userName: user.displayName || user.email,
    nomeCompleto: nome,
    telefone,
    endereco,
    observacao,
    items: deliveryItems,
    total: deliveryItems.reduce((sum, item) => sum + Number(item.price), 0),
    type: 'delivery',
    status: 'pending',
    createdAt: new Date() // Ensure it's a proper Date object
  };

  console.log('Delivery order createdAt:', orderData.createdAt);
  
  // Save order and get the order ID
  const orderId = await saveOrder(orderData);
  
  // Limpa apenas os itens de delivery do carrinho
  cart = cart.filter(item => item.tipo !== 'delivery');
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount && updateCartCount();
  closeCartModal && closeCartModal();
  
  // Redireciona para a página de acompanhamento
  window.location.href = '/delivery/delivery.html';
} 