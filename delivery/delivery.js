import { auth, db } from '../firebase.js';
import { doc, onSnapshot, getDoc, collection, query, where, orderBy, limit, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let map, marker;

function renderStatus(status) {
  const statusInfo = document.getElementById('status-info');
  let statusText = '';
  let statusClass = '';
  
  switch (status) {
    case 'pending':
      statusText = 'Pedido recebido! Aguardando confirmação.';
      statusClass = 'pending';
      break;
    case 'accepted':
      statusText = 'Pedido aceito! Estamos preparando seu café.';
      statusClass = 'accepted';
      break;
    case 'preparing':
      statusText = 'Seu pedido está sendo preparado.';
      statusClass = 'preparing';
      break;
    case 'sent':
      statusText = 'Seu pedido saiu para entrega!';
      statusClass = 'sent';
      break;
    case 'delivered':
      statusText = 'Pedido entregue! Bom café!';
      statusClass = 'delivered';
      break;
    default:
      statusText = 'Aguardando atualização do pedido...';
      statusClass = 'pending';
  }
  
  statusInfo.innerHTML = `
    <i class="fas fa-circle-info"></i>
    ${statusText}
    <span class="status-badge ${statusClass}">${getStatusBadgeText(status)}</span>
  `;
}

function getStatusBadgeText(status) {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'accepted': return 'Aceito';
    case 'preparing': return 'Preparando';
    case 'sent': return 'Em Entrega';
    case 'delivered': return 'Entregue';
    default: return 'Aguardando';
  }
}

function renderTimer(createdAt, deliveredAt) {
  const timerInfo = document.getElementById('timer-info');
  if (!createdAt) {
    console.log('No createdAt timestamp provided');
    timerInfo.textContent = '';
    return;
  }

  console.log('Raw createdAt:', createdAt);
  
  // Convert Firestore Timestamp to Date
  let startDate;
  try {
    // If it's a Firestore Timestamp
    if (createdAt.toDate && typeof createdAt.toDate === 'function') {
      startDate = createdAt.toDate();
    }
    // If it's a server timestamp object
    else if (createdAt.seconds !== undefined) {
      startDate = new Date(createdAt.seconds * 1000 + (createdAt.nanoseconds || 0) / 1000000);
    }
    // If it's already a Date object
    else if (createdAt instanceof Date) {
      startDate = createdAt;
    }
    // If it's a date string
    else if (typeof createdAt === 'string') {
      startDate = new Date(createdAt);
    }
    // If it's a number (timestamp)
    else if (typeof createdAt === 'number') {
      startDate = new Date(createdAt);
    }
    else {
      throw new Error('Unsupported date format');
    }
    
    console.log('Converted startDate:', startDate);
    
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid date after conversion');
    }
  } catch (error) {
    console.error('Error converting start date:', error);
    timerInfo.textContent = 'Erro ao calcular tempo';
    return;
  }

  // Convert deliveredAt if exists
  let endDate = null;
  if (deliveredAt) {
    try {
      if (deliveredAt.toDate && typeof deliveredAt.toDate === 'function') {
        endDate = deliveredAt.toDate();
      }
      else if (deliveredAt.seconds !== undefined) {
        endDate = new Date(deliveredAt.seconds * 1000 + (deliveredAt.nanoseconds || 0) / 1000000);
      }
      else if (deliveredAt instanceof Date) {
        endDate = deliveredAt;
      }
      else if (typeof deliveredAt === 'string') {
        endDate = new Date(deliveredAt);
      }
      else if (typeof deliveredAt === 'number') {
        endDate = new Date(deliveredAt);
      }
      
      console.log('Converted endDate:', endDate);
      
      if (isNaN(endDate.getTime())) {
        console.warn('Invalid end date after conversion, ignoring deliveredAt');
        endDate = null;
      }
    } catch (error) {
      console.warn('Error converting end date, ignoring deliveredAt:', error);
      endDate = null;
    }
  }
  
  let lastUpdate = 0;
  function update() {
    try {
      const now = Date.now();
      // Only update every 100ms to improve performance
      if (now - lastUpdate < 100) {
        requestAnimationFrame(update);
        return;
      }
      lastUpdate = now;
      
      const currentTime = endDate ? endDate.getTime() : now;
      const startTime = startDate.getTime();
      const diff = Math.max(0, currentTime - startTime);
      
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      
      timerInfo.innerHTML = `
        <i class="fas fa-clock"></i>
        ${endDate ? 'Tempo total:' : 'Tempo desde o pedido:'} 
        <strong>${min}m ${sec < 10 ? '0' : ''}${sec}s</strong>
      `;
      
      if (!endDate) {
        requestAnimationFrame(update);
      }
    } catch (error) {
      console.error('Error updating timer:', error);
      timerInfo.textContent = 'Erro ao atualizar tempo';
    }
  }
  
  update();
}

function renderOrderInfo(order) {
  const orderInfo = document.getElementById('order-info');
  if (!order || !order.items || order.items.length === 0) {
    orderInfo.innerHTML = '<p>Nenhum item no pedido.</p>';
    return;
  }

  let total = order.items.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
  
  let html = `
    <ul>
      ${order.items.map(item => `
        <li>
          <span>${item.quantity || 1}x ${item.name}</span>
          <span>R$ ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}</span>
        </li>
      `).join('')}
      <li style="margin-top:10px;border-top:2px solid rgba(255,255,255,0.1);padding-top:10px;">
        <strong>Total</strong>
        <strong>R$ ${total.toFixed(2)}</strong>
      </li>
    </ul>
  `;
  
  if (order.endereco) {
    html += `
      <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.1);">
        <i class="fas fa-map-marker-alt"></i>
        <strong>Endereço de Entrega:</strong><br>
        ${order.endereco}
      </div>
    `;
  }
  
  orderInfo.innerHTML = html;
}

function renderContactInfo(order) {
  const contactInfo = document.getElementById('contact-info');
  if (!order) {
    contactInfo.textContent = '';
    return;
  }
  
  let html = '';
  
  if (order.nomeCompleto) {
    html += `
      <div>
        <i class="fas fa-user"></i>
        <span>${order.nomeCompleto}</span>
      </div>
    `;
  }
  
  if (order.telefone) {
    html += `
      <div>
        <i class="fas fa-phone"></i>
        <a href="tel:${order.telefone}" style="color:#fff;text-decoration:none;">
          ${order.telefone}
        </a>
      </div>
    `;
  }
  
  if (order.observacao) {
    html += `
      <div>
        <i class="fas fa-comment"></i>
        <span>${order.observacao}</span>
      </div>
    `;
  }
  
  contactInfo.innerHTML = html || '<p>Nenhuma informação de contato disponível.</p>';
}

function renderMap(address, latlng) {
  if (!window.google || !address) return;
  const mapDiv = document.getElementById('map');
  if (!latlng) {
    // Geocode address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        showMap({ lat: loc.lat(), lng: loc.lng() });
      } else {
        mapDiv.innerHTML = '<div style="padding:20px;color:#a00;">Endereço não encontrado no mapa.</div>';
      }
    });
  } else {
    showMap(latlng);
  }
}

function showMap(latlng) {
  const mapDiv = document.getElementById('map');
  if (!map) {
    map = new google.maps.Map(mapDiv, {
      center: latlng,
      zoom: 16,
      disableDefaultUI: true,
      styles: [
        {
          featureType: "all",
          elementType: "labels.text.fill",
          stylers: [{ color: "#ffffff" }]
        },
        {
          featureType: "all",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#000000" }, { lightness: 13 }]
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#000000" }]
        }
      ]
    });
    
    marker = new google.maps.Marker({
      position: latlng,
      map,
      title: 'Local de Entrega',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#d4a373",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });
  } else {
    map.setCenter(latlng);
    marker.setPosition(latlng);
  }
}

function listenOrder(userId) {
  if (!userId) {
    console.error('No user ID provided to listenOrder');
    return;
  }

  console.log('Starting order listener for user:', userId);
  
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    where('type', '==', 'delivery'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  const unsubscribe = onSnapshot(q, {
    next: (snapshot) => {
      try {
        if (snapshot.empty) {
          console.log('No active delivery orders found for user:', userId);
          document.getElementById('status-info').innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            Nenhum pedido encontrado.
          `;
          document.getElementById('timer-info').textContent = '';
          document.getElementById('order-info').innerHTML = '<p>Nenhum pedido ativo.</p>';
          document.getElementById('contact-info').textContent = '';
          return;
        }
        
        const orderDoc = snapshot.docs[0];
        const order = orderDoc.data();
        console.log('Latest order data:', order);
        
        // Update UI with order status
        renderStatus(order.status);
        renderTimer(order.createdAt, order.deliveredAt);
        renderOrderInfo(order);
        renderContactInfo(order);
        
        // If order has coordinates, update map
        if (order.latlng) {
          showMap(order.latlng);
        } else if (order.endereco) {
          renderMap(order.endereco);
        }
        
        // If order is delivered, show completion message
        if (order.status === 'delivered' && !order.notificationShown) {
          const msg = document.createElement('div');
          msg.textContent = 'Pedido entregue com sucesso!';
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
          
          setTimeout(() => {
            msg.remove();
          }, 5000);
          
          // Update order to mark notification as shown
          try {
            setDoc(doc(db, 'orders', orderDoc.id), { notificationShown: true }, { merge: true });
          } catch (error) {
            console.error('Error updating notification status:', error);
          }
        }
      } catch (error) {
        console.error('Error processing order data:', error);
        document.getElementById('status-info').innerHTML = `
          <i class="fas fa-exclamation-circle"></i>
          Erro ao carregar dados do pedido. Por favor, atualize a página.
        `;
      }
    },
    error: (error) => {
      console.error('Error listening to order updates:', error);
      document.getElementById('status-info').innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        Erro ao monitorar atualizações do pedido. Por favor, atualize a página.
      `;
    }
  });
  
  // Store unsubscribe function for cleanup
  window.addEventListener('beforeunload', () => unsubscribe());
}

function init() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      console.log('User not authenticated, redirecting to index');
      window.location.href = '../index.html';
      return;
    }
    console.log('User authenticated, starting order listener');
    listenOrder(user.uid);
  });
}

window.initMap = function() {};
document.addEventListener('DOMContentLoaded', init);
