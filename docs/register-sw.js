// Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('Service Worker registrado con éxito:', registration.scope);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('Nueva versión del Service Worker encontrada');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('Nueva versión disponible. Mostrando notificación...');
          showUpdateNotification();
        }
      });
    });

    if (registration.waiting) {
      showUpdateNotification();
    }

  } catch (error) {
    console.error('Error al registrar Service Worker:', error);
  }
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
    ">
      <p style="margin: 0 0 12px 0; font-weight: 600;">Nueva versión disponible</p>
      <button id="update-btn" style="
        background: white;
        color: #2196F3;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        margin-right: 8px;
      ">Actualizar</button>
      <button id="dismiss-btn" style="
        background: transparent;
        color: white;
        border: 1px solid white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Más tarde</button>
    </div>
  `;

  document.body.appendChild(notification);

  document.getElementById('update-btn').addEventListener('click', () => {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg && reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  });

  document.getElementById('dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });
}

navigator.serviceWorker?.addEventListener('controllerchange', () => {
  console.log('Service Worker actualizado');
  window.location.reload();
});