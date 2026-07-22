/* ═══════════════════════════════════════════════════════════════════════════
   AEGIS CRM — Landing Page JavaScript
   All interactivity for the premium dark-mode SaaS landing page.
   Vanilla JS · No dependencies · Production-ready
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Utility: Brazilian currency formatter ─────────────────────────── */
  const fmtBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  /* ─── Cache common DOM references ───────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ═══════════════════════════════════════════════════════════════════════
     1. CURSOR SPOTLIGHT
     Updates CSS custom properties --mx / --my on #spotlight to follow mouse
     ═══════════════════════════════════════════════════════════════════════ */
  (function initSpotlight() {
    const spot = $('#spotlight');
    if (!spot) return;

    let rAF = 0;
    let mx = 0;
    let my = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (!rAF) {
        rAF = requestAnimationFrame(() => {
          spot.style.setProperty('--mx', mx + 'px');
          spot.style.setProperty('--my', my + 'px');
          rAF = 0;
        });
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     2. SCROLL REVEAL
     IntersectionObserver adds .active to .reveal / .reveal-left / .reveal-right
     ═══════════════════════════════════════════════════════════════════════ */
  (function initScrollReveal() {
    const targets = $$('.reveal, .reveal-left, .reveal-right');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     3. MAGNETIC BUTTONS
     Buttons subtly follow the cursor, then spring back on leave
     ═══════════════════════════════════════════════════════════════════════ */
  (function initMagneticButtons() {
    const buttons = $$('.magnetic-btn');

    buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.3;
        const dy = (e.clientY - cy) * 0.3;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.35s ease';
        btn.style.transform = 'translate(0, 0)';
        // Remove inline transition after animation completes
        const cleanup = () => {
          btn.style.transition = '';
          btn.removeEventListener('transitionend', cleanup);
        };
        btn.addEventListener('transitionend', cleanup);
      });
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     4. TYPEWRITER EFFECT
     Cycles through phrases with type / pause / delete / pause loop
     ═══════════════════════════════════════════════════════════════════════ */
  (function initTypewriter() {
    const el = $('#typewriter');
    if (!el) return;

    const phrases = [
      'Elimina o esquecimento do seu time.',
      'Automatiza o follow-up de cada lead.',
      'Coloca seu pipeline no piloto automático.',
    ];

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function tick() {
      const current = phrases[phraseIdx];

      if (!isDeleting) {
        /* Typing forward */
        charIdx++;
        el.textContent = current.substring(0, charIdx);

        if (charIdx === current.length) {
          /* Finished typing — pause then start deleting */
          isDeleting = true;
          setTimeout(tick, 2000);
          return;
        }
        setTimeout(tick, 60);
      } else {
        /* Deleting */
        charIdx--;
        el.textContent = current.substring(0, charIdx);

        if (charIdx === 0) {
          /* Fully deleted — move to next phrase */
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 40);
      }
    }

    tick();
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     5. FOMO BAR
     Rotates promotional messages with fade transition
     ═══════════════════════════════════════════════════════════════════════ */
  (function initFomoBar() {
    const bar = $('#fomo-bar');
    const text = $('#fomo-text');
    const close = $('#fomo-close');
    if (!bar || !text || !close) return;

    /* If user already closed, hide and bail */
    if (localStorage.getItem('fomo-closed')) {
      bar.classList.add('hidden');
      document.body.classList.add('fomo-hidden');
      return;
    }

    const messages = [
      '🔥 Oferta de lançamento: 30% OFF nos 3 primeiros meses — Válido até sexta',
      '🚀 Vagas limitadas para onboarding em junho — Restam 7 vagas',
      '📊 Empresas que começaram em maio já estão convertendo 38% mais',
    ];

    let msgIdx = 0;
    text.textContent = messages[0];

    const rotateInterval = setInterval(() => {
      text.style.opacity = '0';
      setTimeout(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        text.textContent = messages[msgIdx];
        text.style.opacity = '1';
      }, 300);
    }, 5000);

    close.addEventListener('click', () => {
      clearInterval(rotateInterval);
      localStorage.setItem('fomo-closed', '1');
      bar.classList.add('hidden');
      document.body.classList.add('fomo-hidden');
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     6. SCROLL PROGRESS BAR
     Thin bar at top showing how far down the page the user has scrolled
     ═══════════════════════════════════════════════════════════════════════ */
  (function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight =
            document.documentElement.scrollHeight -
            document.documentElement.clientHeight;
          const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     7. CALCULATOR — Prejuízo de não ter CRM
     Reacts to range sliders and updates loss / gain numbers
     ═══════════════════════════════════════════════════════════════════════ */
  (function initCalculator() {
    const elLeads = $('#calc-leads');
    const elConv = $('#calc-conv');
    const elTicket = $('#calc-ticket');
    if (!elLeads || !elConv || !elTicket) return;

    const outLeads = $('#calc-leads-val');
    const outConv = $('#calc-conv-val');
    const outTicket = $('#calc-ticket-val');
    const outLoss = $('#calc-loss');
    const outLossYear = $('#calc-loss-year');
    const outGain = $('#calc-gain');
    const outBar = $('#calc-bar');

    function calculate() {
      const leads = parseInt(elLeads.value, 10);
      const conv = parseInt(elConv.value, 10);
      const ticket = parseInt(elTicket.value, 10);

      /* Update displayed values */
      if (outLeads) outLeads.textContent = leads;
      if (outConv) outConv.textContent = conv + '%';
      if (outTicket) outTicket.textContent = fmtBRL.format(ticket);

      /* Calculations */
      const leadsEsquecidos = leads * 0.3;
      const conversaoPerdida = leadsEsquecidos * (conv / 100);
      const prejuizoMensal = conversaoPerdida * ticket;
      const prejuizoAnual = prejuizoMensal * 12;
      const recuperacao = prejuizoMensal * 0.65;

      /* Update results */
      if (outLoss) outLoss.textContent = fmtBRL.format(prejuizoMensal);
      if (outLossYear) outLossYear.textContent = fmtBRL.format(prejuizoAnual);
      if (outGain) outGain.textContent = fmtBRL.format(recuperacao);
      if (outBar) outBar.style.width = '65%';
    }

    [elLeads, elConv, elTicket].forEach((input) => {
      input.addEventListener('input', calculate);
    });

    /* Initialize on load */
    calculate();
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     8. DRAG & DROP KANBAN
     Desktop drag + touch support, toast notifications, badge updates
     ═══════════════════════════════════════════════════════════════════════ */
  (function initKanban() {
    const kanban = $('#kanban');
    if (!kanban) return;

    const toast = $('#kanban-toast');
    let toastTimer = null;

    /* ── Helper: show toast ──────────────────────────────────────────── */
    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('visible');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
    }

    /* ── Helper: update all badges ───────────────────────────────────── */
    function updateBadges() {
      ['new', 'qual', 'won'].forEach((col) => {
        const container = $(`#cards-${col}`);
        const badge = $(`#badge-${col}`);
        if (container && badge) {
          badge.textContent = container.querySelectorAll('.lead-card').length;
        }
      });
    }

    /* ── Helper: determine which column a container belongs to ──────── */
    function getColId(container) {
      const col = container.closest('.kanban-col');
      return col ? col.dataset.col : '';
    }

    /* ── Helper: handle post-drop logic (toast, glow, confetti) ────── */
    function onCardDropped(card, container) {
      const colId = getColId(container);
      const name = card.dataset.name || 'Lead';
      const value = parseInt(card.dataset.value, 10) || 0;

      updateBadges();

      if (colId === 'qual') {
        showToast(`📱 WhatsApp automático enviado para ${name}`);
      } else if (colId === 'won') {
        showToast(`🎉 +${fmtBRL.format(value)} no faturamento!`);
        card.classList.add('won-glow');
        launchConfetti();
      } else if (colId === 'new') {
        showToast(`🔄 ${name} retornou ao início do funil`);
      }
    }

    /* ── Desktop Drag & Drop ─────────────────────────────────────────── */
    const cards = $$('.lead-card', kanban);
    const containers = $$('.kanban-cards', kanban);

    cards.forEach((card) => {
      card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    containers.forEach((container) => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const col = container.closest('.kanban-col');
        if (col) col.classList.add('drag-over');
      });

      container.addEventListener('dragleave', (e) => {
        /* Only remove if truly leaving the container */
        if (!container.contains(e.relatedTarget)) {
          const col = container.closest('.kanban-col');
          if (col) col.classList.remove('drag-over');
        }
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const col = container.closest('.kanban-col');
        if (col) col.classList.remove('drag-over');

        const cardId = e.dataTransfer.getData('text/plain');
        const card = document.getElementById(cardId);
        if (!card) return;

        card.classList.remove('won-glow');
        container.appendChild(card);
        onCardDropped(card, container);
      });
    });

    /* ── Touch Drag & Drop (mobile) ──────────────────────────────────── */
    let touchCard = null;
    let touchClone = null;
    let touchOffsetX = 0;
    let touchOffsetY = 0;

    kanban.addEventListener('touchstart', (e) => {
      const card = e.target.closest('.lead-card');
      if (!card) return;

      touchCard = card;
      const rect = card.getBoundingClientRect();
      const touch = e.touches[0];
      touchOffsetX = touch.clientX - rect.left;
      touchOffsetY = touch.clientY - rect.top;

      /* Create visual clone for dragging */
      touchClone = card.cloneNode(true);
      touchClone.classList.add('dragging');
      touchClone.style.position = 'fixed';
      touchClone.style.zIndex = '9999';
      touchClone.style.width = rect.width + 'px';
      touchClone.style.pointerEvents = 'none';
      touchClone.style.opacity = '0.85';
      touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
      touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';
      document.body.appendChild(touchClone);

      card.style.opacity = '0.3';
    }, { passive: true });

    kanban.addEventListener('touchmove', (e) => {
      if (!touchCard || !touchClone) return;
      e.preventDefault();

      const touch = e.touches[0];
      touchClone.style.left = (touch.clientX - touchOffsetX) + 'px';
      touchClone.style.top = (touch.clientY - touchOffsetY) + 'px';

      /* Highlight drop target */
      containers.forEach((c) => {
        const col = c.closest('.kanban-col');
        if (!col) return;
        const rect = c.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          col.classList.add('drag-over');
        } else {
          col.classList.remove('drag-over');
        }
      });
    }, { passive: false });

    kanban.addEventListener('touchend', (e) => {
      if (!touchCard || !touchClone) return;

      /* Find which container we're over */
      const touch = e.changedTouches[0];
      let dropTarget = null;

      containers.forEach((c) => {
        const rect = c.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          dropTarget = c;
        }
        const col = c.closest('.kanban-col');
        if (col) col.classList.remove('drag-over');
      });

      if (dropTarget) {
        touchCard.classList.remove('won-glow');
        dropTarget.appendChild(touchCard);
        onCardDropped(touchCard, dropTarget);
      }

      touchCard.style.opacity = '';
      if (touchClone && touchClone.parentNode) {
        touchClone.parentNode.removeChild(touchClone);
      }
      touchCard = null;
      touchClone = null;
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     9. CONFETTI
     Canvas-based celebration effect triggered on "won" drop
     ═══════════════════════════════════════════════════════════════════════ */
  const confettiCanvas = $('#confetti-canvas');
  let confettiCtx = null;

  function sizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    sizeConfetti();
    window.addEventListener('resize', sizeConfetti);
  }

  function launchConfetti() {
    if (!confettiCtx || !confettiCanvas) return;

    const W = confettiCanvas.width;
    const H = confettiCanvas.height;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#FFFFFF'];
    const particles = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * -H * 0.5,
        w: 4 + Math.random() * 4,         // 4–8 px wide ≈ ~6 avg
        h: 8 + Math.random() * 4,          // 8–12 px tall ≈ ~10 avg
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,     // horizontal drift
        vy: 2 + Math.random() * 4,         // falling speed
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      });
    }

    const start = performance.now();
    const duration = 3000; // 3 seconds

    function frame(now) {
      const elapsed = now - start;
      if (elapsed > duration) {
        confettiCtx.clearRect(0, 0, W, H);
        return;
      }

      confettiCtx.clearRect(0, 0, W, H);

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += 0.08; // gravity
        p.y += p.vy;
        p.rotation += p.spin;

        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation);
        confettiCtx.fillStyle = p.color;
        confettiCtx.globalAlpha = Math.max(0, 1 - elapsed / duration);
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        confettiCtx.restore();
      });

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     10. ANIMATED BARS (Feature 3 chart)
     IntersectionObserver on #vis-3 — staggers .visible on each .vis-bar
     ═══════════════════════════════════════════════════════════════════════ */
  (function initAnimatedBars() {
    const vis3 = $('#vis-3');
    if (!vis3) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bars = $$('.vis-bar', vis3);
            bars.forEach((bar, i) => {
              setTimeout(() => bar.classList.add('visible'), i * 120);
            });
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(vis3);
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     11. COUNTER ANIMATION
     Animate .counter[data-target] from 0 → target with easeOut cubic
     ═══════════════════════════════════════════════════════════════════════ */
  (function initCounters() {
    const containers = $$('.metrics, .vis-chart');
    if (!containers.length) return;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animateCounter(el) {
      const target = parseInt(el.dataset.target, 10);
      if (isNaN(target)) return;

      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = Math.round(easeOutCubic(progress) * target);
        el.textContent = value;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = $$('.counter[data-target]', entry.target);
            counters.forEach(animateCounter);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    containers.forEach((c) => observer.observe(c));
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     12. TESTIMONIAL CAROUSEL
     Slide track, dot indicators, prev/next, auto-advance
     ═══════════════════════════════════════════════════════════════════════ */
  (function initCarousel() {
    const track = $('#testimonial-track');
    const prevBtn = $('#carousel-prev');
    const nextBtn = $('#carousel-next');
    const dots = $$('.carousel-dot');
    if (!track || !prevBtn || !nextBtn || !dots.length) return;

    const maxIndex = dots.length - 1;
    let current = 0;
    let autoTimer = null;

    function goTo(idx) {
      current = idx;
      track.style.transform = `translateX(-${current * 100}%)`;

      dots.forEach((d) => d.classList.remove('active'));
      const activeDot = dots[current];
      if (activeDot) activeDot.classList.add('active');
    }

    function next() {
      goTo(current >= maxIndex ? 0 : current + 1);
    }

    function prev() {
      goTo(current <= 0 ? maxIndex : current - 1);
    }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 6000);
    }

    nextBtn.addEventListener('click', () => {
      next();
      resetAuto();
    });

    prevBtn.addEventListener('click', () => {
      prev();
      resetAuto();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index, 10);
        if (!isNaN(idx)) {
          goTo(idx);
          resetAuto();
        }
      });
    });

    /* Start auto-advance */
    resetAuto();
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     13. VIDEO MODAL
     Open/close with body scroll lock
     ═══════════════════════════════════════════════════════════════════════ */
  (function initVideoModal() {
    const trigger = $('#video-trigger');
    const modal = $('#video-modal');
    const closeBtn = $('#video-modal-close');
    const backdrop = $('#video-modal-backdrop');
    if (!trigger || !modal) return;

    function openModal() {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    trigger.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     14. FAQ ACCORDION
     Toggle .open on .faq-item, close siblings, update aria-expanded
     ═══════════════════════════════════════════════════════════════════════ */
  (function initFAQ() {
    const questions = $$('.faq-q');
    if (!questions.length) return;

    questions.forEach((btn) => {
      btn.addEventListener('click', () => {
        const parent = btn.closest('.faq-item');
        if (!parent) return;

        const isOpen = parent.classList.contains('open');

        /* Close all items first */
        $$('.faq-item').forEach((item) => {
          item.classList.remove('open');
          const q = $('.faq-q', item);
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        /* If it wasn't open, open it now */
        if (!isOpen) {
          parent.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     15. FORM HANDLER
     WhatsApp mask, live validation, simulated submit with success state
     ═══════════════════════════════════════════════════════════════════════ */
  (function initForm() {
    const form = $('#demo-form');
    const inputName = $('#input-name');
    const inputWA = $('#input-whatsapp');
    const submitBtn = $('#form-submit');
    const success = $('#form-success');
    if (!form || !inputName || !inputWA || !submitBtn) return;

    /* ── WhatsApp mask: (XX) XXXXX-XXXX ──────────────────────────────── */
    inputWA.addEventListener('input', () => {
      let v = inputWA.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);

      if (v.length > 7) {
        v = `(${v.substring(0, 2)}) ${v.substring(2, 7)}-${v.substring(7)}`;
      } else if (v.length > 2) {
        v = `(${v.substring(0, 2)}) ${v.substring(2)}`;
      } else if (v.length > 0) {
        v = `(${v}`;
      }

      inputWA.value = v;
    });

    /* ── Live validation ─────────────────────────────────────────────── */
    function validateField(input, isValid) {
      if (isValid) {
        input.classList.add('valid');
        input.classList.remove('invalid');
      } else {
        input.classList.remove('valid');
        if (input.value.length > 0) {
          input.classList.add('invalid');
        } else {
          input.classList.remove('invalid');
        }
      }
    }

    inputName.addEventListener('input', () => {
      validateField(inputName, inputName.value.trim().length >= 2);
    });

    inputWA.addEventListener('input', () => {
      const digits = inputWA.value.replace(/\D/g, '');
      validateField(inputWA, digits.length >= 10);
    });

    /* ── Submit ───────────────────────────────────────────────────────── */
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameOk = inputName.value.trim().length >= 2;
      const waDigits = inputWA.value.replace(/\D/g, '');
      const waOk = waDigits.length >= 10;

      validateField(inputName, nameOk);
      validateField(inputWA, waOk);

      if (!nameOk || !waOk) return;

      /* Show loading state */
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        if (success) success.classList.add('visible');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 900);
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     16. HEADER SCROLL EFFECT
     Change header background opacity on scroll
     ═══════════════════════════════════════════════════════════════════════ */
  (function initHeaderScroll() {
    const header = $('#site-header');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 60) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     17. WHATSAPP WIDGET
     Timed reveal with bubble message
     ═══════════════════════════════════════════════════════════════════════ */
  (function initWAWidget() {
    const widget = $('#wa-widget');
    const bubble = $('#wa-bubble');
    const btn = $('#wa-btn');
    if (!widget) return;

    /* Show widget after 8s */
    setTimeout(() => widget.classList.add('visible'), 8000);

    /* Show bubble after 12s */
    if (bubble) {
      setTimeout(() => bubble.classList.add('visible'), 12000);

      /* Hide bubble after 20s */
      setTimeout(() => bubble.classList.remove('visible'), 20000);
    }

    /* Re-show bubble on hover */
    if (btn && bubble) {
      btn.addEventListener('mouseenter', () => {
        bubble.classList.add('visible');
      });
      btn.addEventListener('mouseleave', () => {
        // Optional: hide after short delay on leave
        // Keeping it visible until user interaction
      });
    }
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     18. GLOW CARD EFFECT
     Rotating border gradient that follows the cursor angle
     ═══════════════════════════════════════════════════════════════════════ */
  (function initGlowCards() {
    const cards = $$('.glow-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      let rAF = 0;
      let mouseX = 0;
      let mouseY = 0;

      card.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!rAF) {
          rAF = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const angle =
              Math.atan2(mouseY - cy, mouseX - cx) * (180 / Math.PI);
            card.style.setProperty('--glow-angle', angle + 'deg');
            rAF = 0;
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (rAF) {
          cancelAnimationFrame(rAF);
          rAF = 0;
        }
      });
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     19. HERO WHATSAPP 3D TILT EFFECT
     Mockup rotates slightly based on mouse movement within the Hero
     ═══════════════════════════════════════════════════════════════════════ */
  (function initHeroTilt() {
    const hero = $('#topo');
    const mockup = $('.whatsapp-mockup');
    if (!hero || !mockup) return;

    let rAF = 0;

    hero.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return; // Disable tilt on mobile

      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate percentage offset from center (-1 to 1)
      const tiltX = (centerY - y) / centerY * 8; // Max 8 degrees pitch
      const tiltY = (x - centerX) / centerX * 8;  // Max 8 degrees yaw

      if (!rAF) {
        rAF = requestAnimationFrame(() => {
          // Keep base rotation rotateY(-14deg) rotateX(6deg) and apply mouse delta
          mockup.style.transform = `rotateY(${-14 + tiltY}deg) rotateX(${6 + tiltX}deg)`;
          rAF = 0;
        });
      }
    });

    hero.addEventListener('mouseleave', () => {
      if (rAF) {
        cancelAnimationFrame(rAF);
        rAF = 0;
      }
      mockup.style.transform = 'rotateY(-14deg) rotateX(6deg)';
    });
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     20. HERO WHATSAPP CONVERSATION SIMULATOR
     Simulates real-time sales co-pilot database queries
     ═══════════════════════════════════════════════════════════════════════ */
  (function initWhatsAppSimulator() {
    const chatArea = $('#wa-chat-messages');
    const statusText = $('#wa-bot-status');
    if (!chatArea || !statusText) return;

    const messages = [
      { sender: 'vendedor', text: 'Aegis, quais leads eu não mexi essa semana?' },
      { sender: 'copilot', isTyping: true, status: 'Analisando banco de dados do CRM... 🧠' },
      { sender: 'copilot', text: 'Você tem <strong>3 leads parados há +5 dias</strong>. O lead <strong>TechCorp</strong> está há 8 dias sem contato.<br>💡 <em>Sugestão: Ligar hoje e oferecer 5% de desconto no fechamento.</em>' },
      { sender: 'vendedor', text: 'Excelente! Cria um orçamento pro cliente TechCorp.' },
      { sender: 'copilot', isTyping: true, status: 'Gerando orçamento em PDF... 📄' },
      { sender: 'copilot', text: 'Orçamento <strong>#1042</strong> gerado com sucesso! Ticket estimado: <strong>R$ 12.500,00</strong>. PDF pronto para envio! 🚀' },
      { sender: 'vendedor', text: 'Qual o principal motivo das nossas perdas este mês?' },
      { sender: 'copilot', isTyping: true, status: 'Compilando análise inteligente de perdas... 📊' },
      { sender: 'copilot', text: '🎯 <strong>60% das perdas foram por preço</strong>. Insight da IA: Leads vindos de indicação convertem <strong>3x mais</strong> que tráfego pago!' },
      { sender: 'vendedor', text: 'Sensacional, obrigado!' }
    ];

    let messageIndex = 0;

    function formatTime() {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    }

    function createBubble(msg) {
      const bubble = document.createElement('div');
      bubble.className = `wa-bubble ${msg.sender}`;
      
      const textSpan = document.createElement('span');
      textSpan.innerHTML = msg.text;
      bubble.appendChild(textSpan);

      const timeSpan = document.createElement('span');
      timeSpan.className = 'wa-bubble-time';
      timeSpan.textContent = formatTime();
      
      if (msg.sender === 'vendedor') {
        const check = document.createElement('span');
        check.className = 'wa-double-check';
        check.innerHTML = ' &#10004;&#10004;';
        timeSpan.appendChild(check);
      }
      
      bubble.appendChild(timeSpan);
      return bubble;
    }

    function createTypingIndicator() {
      const indicator = document.createElement('div');
      indicator.className = 'wa-typing';
      indicator.id = 'wa-typing-indicator';
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'wa-dot';
        indicator.appendChild(dot);
      }
      return indicator;
    }

    function runDialogue() {
      if (messageIndex >= messages.length) {
        // Dialogue ended, wait 8 seconds and restart
        setTimeout(() => {
          chatArea.innerHTML = '';
          messageIndex = 0;
          runDialogue();
        }, 8000);
        return;
      }

      const currentMsg = messages[messageIndex];

      if (currentMsg.isTyping) {
        // Show typing indicator
        statusText.textContent = currentMsg.status;
        const typing = createTypingIndicator();
        chatArea.appendChild(typing);
        chatArea.scrollTop = chatArea.scrollHeight;

        // Wait 2.2 seconds, then replace typing with the actual text message
        setTimeout(() => {
          const indicator = document.getElementById('wa-typing-indicator');
          if (indicator) indicator.remove();
          
          statusText.textContent = 'IA Ativa · Online';
          
          messageIndex++; // move to actual message
          const textMsg = messages[messageIndex];
          const bubble = createBubble(textMsg);
          chatArea.appendChild(bubble);
          chatArea.scrollTop = chatArea.scrollHeight;

          // Process next message after a pause
          messageIndex++;
          setTimeout(runDialogue, 2000);
        }, 2200);
      } else {
        // Salesperson sends message immediately
        const bubble = createBubble(currentMsg);
        chatArea.appendChild(bubble);
        chatArea.scrollTop = chatArea.scrollHeight;

        messageIndex++;
        setTimeout(runDialogue, 1800);
      }
    }

    // Delay start of first message slightly for better pacing
    setTimeout(runDialogue, 1000);
  })();

})();
