// PWA Installer - Gestión de instalación de la aplicación
let deferredPrompt;
let installButton;

window.addEventListener('load', () => {
  initPWAInstaller();
});

function initPWAInstaller() {
  installButton = document.getElementById('install-button');

  if (!installButton) {
    createInstallButton();
  }

  checkInstallationStatus();
}

function createInstallButton() {
  installButton = document.createElement('button');
  installButton.id = 'install-button';
  installButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span>Instalar App</span>
  `;

  installButton.style.cssText = `
    display: none;
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #2196F3;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    z-index: 9999;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;

  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'scale(1.05)';
    installButton.style.boxShadow = '0 6px 16px rgba(33, 150, 243, 0.5)';
  });

  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'scale(1)';
    installButton.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.4)';
  });

  document.body.appendChild(installButton);
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA instalable detectada');

  e.preventDefault();
  deferredPrompt = e;

  showInstallButton();
});

function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'flex';
    installButton.addEventListener('click', installPWA);
  }
}

async function installPWA() {
  if (!deferredPrompt) {
    console.log('No hay prompt de instalación disponible');
    return;
  }

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  console.log(`Usuario eligió: ${outcome}`);

  if (outcome === 'accepted') {
    showInstallationSuccess();
  }

  deferredPrompt = null;
  hideInstallButton();
}

function hideInstallButton() {
  if (installButton) {
    installButton.style.display = 'none';
  }
}

function showInstallationSuccess() {
  const successMessage = document.createElement('div');
  successMessage.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4CAF50;
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideDown 0.3s ease;
    ">
      <p style="margin: 0; font-weight: 600;">✓ Aplicación instalada correctamente</p>
    </div>
  `;

  document.body.appendChild(successMessage);

  setTimeout(() => {
    successMessage.remove();
  }, 3000);
}

window.addEventListener('appinstalled', () => {
  console.log('PWA instalada exitosamente');
  deferredPrompt = null;

  trackInstallation();
});

function checkInstallationStatus() {
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    console.log('Aplicación corriendo en modo instalado');
    hideInstallButton();
    showWelcomeMessage();
  }
}

function showWelcomeMessage() {
  const lastVisit = localStorage.getItem('pwa-last-visit');

  if (!lastVisit) {
    const welcome = document.createElement('div');
    welcome.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        color: #333;
        padding: 16px 32px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
      ">
        <p style="margin: 0; font-weight: 600;">👋 ¡Bienvenido a la aplicación!</p>
      </div>
    `;

    document.body.appendChild(welcome);

    setTimeout(() => {
      welcome.remove();
    }, 3000);
  }

  localStorage.setItem('pwa-last-visit', new Date().toISOString());
}

function trackInstallation() {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'pwa_installed', {
      event_category: 'PWA',
      event_label: 'Installation'
    });
  }
}

function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        registration.update();
      }
    });
  }
}

setInterval(checkForUpdates, 60 * 60 * 1000);