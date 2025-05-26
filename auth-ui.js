import { 
  loginUser, 
  registerUser, 
  resetPassword, 
  logoutUser 
} from './firebase.js';
import { auth } from './firebase.js';
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from './firebase.js';

// Make functions available globally
window.loginUser = loginUser;
window.registerUser = registerUser;
window.resetPassword = resetPassword;
window.logoutUser = logoutUser;
window.updateAuthUI = updateAuthUI;

// Toggle Login Menu
function toggleLoginMenu() {
  console.log('Toggle login menu called'); // Debug log
  const menu = document.getElementById('login-menu');
  if (menu) {
    console.log('Menu found, toggling active class'); // Debug log
    menu.classList.toggle('active');
  } else {
    console.error('Login menu element not found'); // Debug log
  }
}

// Make toggleLoginMenu available globally
window.toggleLoginMenu = toggleLoginMenu;

// Toggle between login and register forms
function toggleForms(formType) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const resetForm = document.getElementById('reset-password-form');
  
  // Hide all forms first
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  resetForm.style.display = 'none';
  
  // Show the selected form
  if (formType === 'register') {
    registerForm.style.display = 'flex';
  } else if (formType === 'reset') {
    resetForm.style.display = 'flex';
  } else {
    loginForm.style.display = 'flex';
  }
}

// Update UI based on auth state
async function updateAuthUI(user) {
  console.log('Updating UI for user:', user); // Debug log
  
  const loginContainer = document.querySelector('.login-container');
  const loginButton = document.getElementById('login-toggle-btn');
  const userInfo = document.querySelector('.user-info');
  const userName = document.querySelector('.user-name');
  const dashboardBtn = document.querySelector('.dashboard-btn');
  const loginMenu = document.getElementById('login-menu');
  const logoutBtn = document.querySelector('.logout-btn');

  if (!loginContainer || !loginButton || !userInfo || !userName) {
    console.error('Required elements not found:', {
      loginContainer: !!loginContainer,
      loginButton: !!loginButton,
      userInfo: !!userInfo,
      userName: !!userName
    });
    return;
  }

  if (user) {
    console.log('User is signed in:', user.email); // Debug log
    // User is signed in
    loginButton.style.display = 'none';
    userInfo.classList.add('visible');
    userName.textContent = user.displayName || user.email;
    
    // Check if user is admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();
    if (userData && userData.isAdmin) {
      dashboardBtn.classList.add('visible');
      dashboardBtn.onclick = () => window.location.href = '/admin.html';
      } else {
      dashboardBtn.classList.remove('visible');
      dashboardBtn.onclick = null;
      }

    // Add logout handler
    if (logoutBtn) {
      logoutBtn.onclick = () => {
        logoutUser();
      };
    }
  } else {
    console.log('User is signed out'); // Debug log
    // User is signed out
    loginButton.style.display = 'flex';
    userInfo.classList.remove('visible');
    if (loginMenu) loginMenu.classList.remove('active');
    if (logoutBtn) logoutBtn.onclick = null; // Remove logout handler
    dashboardBtn.classList.remove('visible');
    dashboardBtn.onclick = null;
  }
}

// Attach event listeners after navbar is loaded
function setupNavbarAuthUI() {
  console.log('Setting up navbar auth UI'); // Debug log
  const loginBtn = document.getElementById('login-toggle-btn');
  if (loginBtn) {
    console.log('Login button found, attaching click listener'); // Debug log
    loginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Login button clicked'); // Debug log
      toggleLoginMenu();
    });
  } else {
    console.error('Login button not found'); // Debug log
  }

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('login-menu');
    const loginBtn = document.getElementById('login-toggle-btn');
    if (menu && menu.classList.contains('active') && 
        !menu.contains(e.target) && 
        !loginBtn.contains(e.target)) {
      console.log('Clicking outside, closing menu'); // Debug log
      menu.classList.remove('active');
    }
  });

  document.querySelectorAll('[data-toggle-form]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toggleForms(link.getAttribute('data-toggle-form'));
    });
  });
}

// Wait for navbar to be loaded
const navbarContainer = document.getElementById('navbar-container');
if (navbarContainer) {
  console.log('Navbar container found, setting up observer'); // Debug log
  const observer = new MutationObserver(() => {
    if (document.getElementById('login-toggle-btn')) {
      console.log('Login button found in DOM, setting up UI'); // Debug log
      setupNavbarAuthUI();
      observer.disconnect();
    }
  });
  observer.observe(navbarContainer, { childList: true, subtree: true });
} else {
  console.error('Navbar container not found'); // Debug log
  // Fallback: try to setup immediately
  setupNavbarAuthUI();
}

// Handle login
window.handleLogin = async function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorElement = document.getElementById('login-error');
  const feedbackElement = document.getElementById('login-feedback');
  
  try {
    console.log('Attempting login with:', email); // Debug log
    const user = await loginUser(email, password);
    console.log('Login successful:', user); // Debug log
    
    // Clear form
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    // Show feedback
    if (feedbackElement) {
      feedbackElement.textContent = 'Login realizado com sucesso!';
      feedbackElement.style.display = 'block';
      setTimeout(() => {
        feedbackElement.style.display = 'none';
      }, 2000);
    }
    // Hide error
    if (errorElement) errorElement.textContent = '';
    
    // Close menu and update UI
    const loginMenu = document.getElementById('login-menu');
    if (loginMenu) {
      setTimeout(() => loginMenu.classList.remove('active'), 1200);
      console.log('Login menu closed'); // Debug log
    }
    
    // Update UI
    await updateAuthUI(user);
    console.log('UI updated for user:', user.email); // Debug log
    
  } catch (error) {
    console.error('Login error:', error); // Debug log
    if (errorElement) {
      let errorMessage = 'Erro ao fazer login. ';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Senha incorreta.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        default:
          errorMessage += error.message;
      }
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block'; // Make sure error is visible
    }
    // Hide feedback
    if (feedbackElement) feedbackElement.style.display = 'none';
  }
};

// Handle register
window.handleRegister = async function(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const errorElement = document.getElementById('register-error');
  
  try {
    const user = await registerUser(email, password, name);
    document.getElementById('login-menu').classList.remove('active');
    await updateAuthUI(user);
  } catch (error) {
    if (errorElement) {
      let errorMessage = 'Erro ao criar conta. ';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage += 'Este email já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email inválido.';
          break;
        case 'auth/weak-password':
          errorMessage += 'A senha é muito fraca.';
          break;
        default:
          errorMessage += error.message;
      }
      errorElement.textContent = errorMessage;
    }
  }
};

// Handle password reset
window.handleResetPassword = async function(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value;
  const errorElement = document.getElementById('reset-error');
  
  try {
    await resetPassword(email);
    if (errorElement) {
      errorElement.textContent = 'Email de recuperação enviado!';
      errorElement.style.color = 'green';
    }
  } catch (error) {
    if (errorElement) {
      let errorMessage = 'Erro ao redefinir senha. ';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage += 'Usuário não encontrado.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'Email inválido.';
          break;
        default:
          errorMessage += error.message;
      }
      errorElement.textContent = errorMessage;
      errorElement.style.color = 'red';
    }
  }
};

// Listen for auth state changes
// Aguarda navbar estar no DOM antes de chamar updateAuthUI
auth.onAuthStateChanged(user => {
  console.log('Auth state changed:', user ? 'User logged in' : 'User logged out'); // Debug log
  
  // Função para tentar atualizar a UI quando navbar estiver pronto
  const tryUpdate = () => {
    const userInfo = document.querySelector('.user-info');
    const loginButton = document.getElementById('login-toggle-btn');
    if (userInfo && loginButton) {
      console.log('Required elements found, updating UI'); // Debug log
      updateAuthUI(user);
    } else {
      console.log('Waiting for required elements...'); // Debug log
      setTimeout(tryUpdate, 100); // Tenta novamente em 100ms
    }
  };
  tryUpdate();
}); 