/**
 * Aegis CRM - Interactive Legal Portal Engine
 * Powers search filtering, category pills, TOC ScrollSpy, reading progress, and section deep links.
 */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('legal-search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const filterPills = document.querySelectorAll('.filter-pill');
  const sectionCards = document.querySelectorAll('.legal-section-card');
  const tocLinks = document.querySelectorAll('.toc-link');
  const readingProgressBadge = document.getElementById('reading-progress');
  const progressFill = document.getElementById('progress-fill');
  const noResultsBox = document.getElementById('no-results-box');

  let currentCategory = 'all';
  let currentSearchQuery = '';

  // 1. REAL-TIME SEARCH FILTERING
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
      }
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentSearchQuery = '';
        clearSearchBtn.style.display = 'none';
        applyFilters();
      }
    });
  }

  // 2. CATEGORY PILL FILTERING
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  function applyFilters() {
    let visibleCount = 0;

    sectionCards.forEach(card => {
      const category = card.getAttribute('data-category') || '';
      const textContent = card.textContent.toLowerCase();

      const matchesCategory = (currentCategory === 'all' || category === currentCategory);
      const matchesSearch = (!currentSearchQuery || textContent.includes(currentSearchQuery));

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        card.classList.remove('hidden-card');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden-card');
      }
    });

    if (noResultsBox) {
      noResultsBox.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // 3. SCROLLSPY & READING PROGRESS
  function updateScrollSpy() {
    const scrollPosition = window.scrollY + 180;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercent = Math.min(100, Math.max(0, Math.round((window.scrollY / Math.max(1, documentHeight)) * 100)));

    if (readingProgressBadge) {
      readingProgressBadge.textContent = `${progressPercent}% lido`;
    }
    if (progressFill) {
      progressFill.style.width = `${progressPercent}%`;
    }

    // Highlight active TOC link
    let activeId = '';
    sectionCards.forEach(card => {
      if (card.style.display !== 'none') {
        const top = card.offsetTop;
        const height = card.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          activeId = card.getAttribute('id');
        }
      }
    });

    if (activeId) {
      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
          link.classList.add('active');
          // Scroll the TOC nav container (not the page) to keep active link visible
          const tocNav = document.getElementById('toc-nav');
          if (tocNav) {
            const linkTop = link.offsetTop - tocNav.offsetTop;
            const navHeight = tocNav.clientHeight;
            if (linkTop < tocNav.scrollTop || linkTop > tocNav.scrollTop + navHeight - 40) {
              tocNav.scrollTop = linkTop - navHeight / 3;
            }
          }
        }
      });
    }
  }

  window.addEventListener('scroll', updateScrollSpy, { passive: true });
  updateScrollSpy();

  // 4. COPY SECTION ANCHOR LINK
  document.querySelectorAll('.anchor-link').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      const targetCard = document.querySelector(href);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, null, href);

        const fullUrl = window.location.origin + window.location.pathname + href;
        navigator.clipboard.writeText(fullUrl).then(() => {
          showToast('Link da seção copiado para a área de transferência.');
        }).catch(() => {
          showToast('Seção selecionada.');
        });
      }
    });
  });

  // 5. TOAST NOTIFICATION HELPERS
  function showToast(message) {
    let toast = document.getElementById('legal-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'legal-toast';
      toast.className = 'legal-toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
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

