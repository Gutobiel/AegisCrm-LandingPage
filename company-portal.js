/**
 * Aegis CRM - Company Portal Interactive Engine
 * Handles contact form validation, support article instant search, status modal, and magnetic buttons.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. CONTACT FORM HANDLER & VALIDATION
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const phone = document.getElementById('contact-phone').value.trim();
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !phone || !subject || !message) {
        showToast('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Enviando Mensagem...';

      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      }, 1200);
    });
  }

  // 2. STATUS MODAL HANDLER
  const openStatusBtn = document.getElementById('open-status-modal-btn');
  const closeStatusBtn = document.getElementById('close-status-modal-btn');
  const statusModal = document.getElementById('status-modal');

  if (openStatusBtn && statusModal) {
    openStatusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      statusModal.style.display = 'flex';
    });
  }

  if (closeStatusBtn && statusModal) {
    closeStatusBtn.addEventListener('click', () => {
      statusModal.style.display = 'none';
    });
  }

  if (statusModal) {
    statusModal.addEventListener('click', (e) => {
      if (e.target === statusModal) {
        statusModal.style.display = 'none';
      }
    });
  }

  // 3. SUPPORT SEARCH ENGINE & ACCORDION TOGGLE
  const supportSearchInput = document.getElementById('support-search-input');
  const clearSupportSearchBtn = document.getElementById('clear-support-search-btn');
  const faqItems = document.querySelectorAll('.support-faq-item');
  const noSupportResults = document.getElementById('no-support-results');
  const showAllFaqsBtn = document.getElementById('show-all-faqs-btn');
  const faqAnchor = document.getElementById('faq-anchor');

  if (supportSearchInput) {
    supportSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (clearSupportSearchBtn) {
        clearSupportSearchBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }

      let matchCount = 0;
      faqItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (!query || text.includes(query)) {
          item.style.display = 'block';
          matchCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (noSupportResults) {
        noSupportResults.style.display = matchCount === 0 ? 'block' : 'none';
      }

      if (showAllFaqsBtn) {
        showAllFaqsBtn.style.display = query.length > 0 ? 'inline-flex' : 'none';
      }
    });
  }

  if (clearSupportSearchBtn) {
    clearSupportSearchBtn.addEventListener('click', () => {
      if (supportSearchInput) {
        supportSearchInput.value = '';
        clearSupportSearchBtn.style.display = 'none';
        faqItems.forEach(item => item.style.display = 'block');
        if (noSupportResults) noSupportResults.style.display = 'none';
        if (showAllFaqsBtn) showAllFaqsBtn.style.display = 'none';
      }
    });
  }

  // 4. CATEGORY CARD CLICK WITH SMOOTH SCROLL TO FAQS
  const categoryCards = document.querySelectorAll('.support-cat-card');
  categoryCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');

      categoryCards.forEach(c => c.style.borderColor = 'var(--border)');
      card.style.borderColor = 'var(--blue)';

      let matchCount = 0;
      faqItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (cat === itemCat) {
          item.style.display = 'block';
          matchCount++;
        } else {
          item.style.display = 'none';
        }
      });

      if (noSupportResults) {
        noSupportResults.style.display = matchCount === 0 ? 'block' : 'none';
      }

      if (showAllFaqsBtn) {
        showAllFaqsBtn.style.display = 'inline-flex';
      }

      // Smooth scroll to FAQ section
      if (faqAnchor) {
        faqAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  if (showAllFaqsBtn) {
    showAllFaqsBtn.addEventListener('click', () => {
      categoryCards.forEach(c => c.style.borderColor = 'var(--border)');
      faqItems.forEach(item => item.style.display = 'block');
      if (noSupportResults) noSupportResults.style.display = 'none';
      showAllFaqsBtn.style.display = 'none';
      if (supportSearchInput) {
        supportSearchInput.value = '';
        if (clearSupportSearchBtn) clearSupportSearchBtn.style.display = 'none';
      }
    });
  }

  // 5. TOAST NOTIFICATION HELPER
  function showToast(message) {
    let toast = document.getElementById('company-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'company-toast';
      toast.className = 'legal-toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // 6. MAGNETIC BUTTONS (MATCHING LANDING PAGE)
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.35;
        const dy = (e.clientY - cy) * 0.35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.35s ease';
        btn.style.transform = 'translate(0, 0)';
        const cleanup = () => {
          btn.style.transition = '';
          btn.removeEventListener('transitionend', cleanup);
        };
        btn.addEventListener('transitionend', cleanup);
      });
    });
  }

  initMagneticButtons();
});
