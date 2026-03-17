/* ================================================
   MAIN APP JAVASCRIPT
   Hermanamiento PWA - Colonia Valdense & Luserna San Giovanni
   ================================================ */

// MOBILE MENU TOGGLE
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
      }
    });
  }
}

// ACTIVE NAV LINK
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-menu a');
  const currentPath = window.location.pathname;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '/' && href === '/')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// SMOOTH SCROLL
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#!') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// LAZY LOAD IMAGES
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  }
}

// GALLERY LIGHTBOX (simple version)
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        openLightbox(img.src, img.alt);
      }
    });
  });
}

// LIGHTBOX MODAL
function openLightbox(imgSrc, imgAlt) {
  // Remove existing lightbox if any
  const existing = document.querySelector('.lightbox');
  if (existing) {
    existing.remove();
  }

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', imgAlt || 'Imagen ampliada');
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.3s ease-out;
  `;

  lightbox.innerHTML = `
    <div style="position: relative; max-width: 90vw; max-height: 90vh;">
      <img src="${imgSrc}" alt="${imgAlt}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
      <button class="lightbox-close" aria-label="Cerrar imagen" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 28px; cursor: pointer; padding: 10px;">✕</button>
    </div>
  `;

  document.body.appendChild(lightbox);

  // Mover el foco al botón de cierre para usuarios de teclado/lectores de pantalla
  lightbox.querySelector('.lightbox-close').focus();

  const closeBtn = lightbox.querySelector('.lightbox-close');
  closeBtn.addEventListener('click', () => {
    lightbox.remove();
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.remove();
    }
  });

  // Close on ESC key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      lightbox.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

// FORM VALIDATION
function initFormValidation() {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });
}

// SCROLL TO TOP BUTTON
function initScrollToTop() {
  const button = document.getElementById('scroll-to-top');
  
  if (button) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        button.style.display = 'flex';
      } else {
        button.style.display = 'none';
      }
    });

    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// ANIMATE ON SCROLL
function initAOSLite() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const elementsToAnimate = document.querySelectorAll('.slide-in-up, .fade-in, .slide-left-fade');
  elementsToAnimate.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
}

// FILTER FUNCTIONALITY (for gallery)
function initFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const filterItems = document.querySelectorAll('.filter-item');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filterValue = button.getAttribute('data-filter');

      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter items
      filterItems.forEach(item => {
        if (filterValue === 'all') {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.3s ease-out';
        } else if (item.getAttribute('data-category') === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.3s ease-out';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// DARK MODE TOGGLE (optional)
function initDarkMode() {
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  
  if (darkModeToggle) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const isDarkMode = localStorage.getItem('dark-mode') === 'true' || prefersDark.matches;

    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    darkModeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('dark-mode', 'false');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('dark-mode', 'true');
      }
    });
  }
}

// PERFORMANCE MONITORING
function initPerformanceMonitoring() {
  if (window.performance) {
    window.addEventListener('load', () => {
      // Usar la API moderna PerformanceNavigationTiming
      const [navEntry] = performance.getEntriesByType('navigation');
      if (navEntry) {
        const pageLoadTime = Math.round(navEntry.loadEventEnd - navEntry.startTime);
        // Log solo en desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log(`Page Load Time: ${pageLoadTime}ms`);
        }
      }
    });
  }
}

// PAGE NAVIGATION WITH HISTORY
function initPageNavigation() {
  // Set active page in nav
  setActiveNavLink();
  
  // Handle back button
  window.addEventListener('popstate', () => {
    setActiveNavLink();
  });
}

// CONTACT FORM HANDLER
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);
      
      // Log form data (in real app, send to server)
      console.log('Form submitted:', data);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'success-message';
      successMsg.style.cssText = `
        background-color: var(--success);
        color: white;
        padding: var(--spacing-lg);
        border-radius: var(--radius);
        margin-bottom: var(--spacing-lg);
        animation: slideInDown 0.3s ease-out;
      `;
      successMsg.innerHTML = `
        <strong>¡Mensaje enviado!</strong><br>
        Gracias por tu contacto. Nos comunicaremos contigo pronto.
      `;
      
      contactForm.parentNode.insertBefore(successMsg, contactForm);
      contactForm.reset();
      
      // Remove message after 5 seconds
      setTimeout(() => {
        successMsg.remove();
      }, 5000);
    });
  }
}

// CLIPBOARD COPY FUNCTION
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }
}

// KEYBOARD SHORTCUTS
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Escape: Close modals/menus
    if (e.key === 'Escape') {
      const navMenu = document.querySelector('.nav-menu');
      if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    }
  });
}

// INIT ALL
function initApp() {
  initMobileMenu();
  setActiveNavLink();
  initSmoothScroll();
  initLazyLoading();
  initGalleryLightbox();
  initFormValidation();
  initScrollToTop();
  initAOSLite();
  initFilters();
  initDarkMode();
  initPerformanceMonitoring();
  initPageNavigation();
  initContactForm();
  initKeyboardShortcuts();

  // Log app ready
  console.log('🎉 Hermanamiento PWA Initialized');
}

// RUN WHEN DOM IS READY
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// HANDLE VISIBILITY CHANGE
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('App hidden');
  } else {
    console.log('App visible');
  }
});

// EXPORT FUNCTIONS FOR USE IN OTHER SCRIPTS
window.appHelpers = {
  openLightbox,
  copyToClipboard
};
