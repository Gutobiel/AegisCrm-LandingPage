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
    const outBarText = $('#calc-bar-text');
    const ctaBtn = $('#calc-cta-btn');

    let currentLoss = 0;
    let currentLossYear = 0;
    let currentGain = 0;
    let animFrame = null;

    function calculate() {
      const leads = parseInt(elLeads.value, 10);
      const conv = parseInt(elConv.value, 10);
      const ticket = parseInt(elTicket.value, 10);

      /* Update displayed values */
      if (outLeads) outLeads.textContent = leads;
      if (outConv) outConv.textContent = conv + '%';
      if (outTicket) outTicket.textContent = fmtBRL.format(ticket);

      /* Calculations: Higher lead volume = manual teams lose more follow-ups, so AI recovery efficiency scales dynamically from 60% up to 85% */
      const leadsEsquecidos = leads * 0.3;
      const conversaoPerdida = leadsEsquecidos * (conv / 100);
      const targetLoss = Math.round(conversaoPerdida * ticket);
      const targetLossYear = Math.round(targetLoss * 12);
      
      const recoveryRate = Math.min(0.60 + (leads / 1000) * 0.25, 0.85);
      const targetGain = Math.round(targetLoss * recoveryRate);
      const recoveryPct = Math.round(recoveryRate * 100);

      if (outBar) outBar.style.width = recoveryPct + '%';
      if (outBarText) {
        outBarText.innerHTML = `<strong>${recoveryPct}%</strong> da receita perdida recuperada automaticamente pela IA`;
      }

      /* Animate Counter from current to target values smoothly */
      const startLoss = currentLoss;
      const startLossYear = currentLossYear;
      const startGain = currentGain;

      const duration = 200; // smooth 200ms ticker duration
      const startTime = performance.now();

      if (animFrame) cancelAnimationFrame(animFrame);

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        currentLoss = Math.round(startLoss + (targetLoss - startLoss) * ease);
        currentLossYear = Math.round(startLossYear + (targetLossYear - startLossYear) * ease);
        currentGain = Math.round(startGain + (targetGain - startGain) * ease);

        if (outLoss) outLoss.textContent = fmtBRL.format(currentLoss);
        if (outLossYear) outLossYear.textContent = fmtBRL.format(currentLossYear);
        if (outGain) outGain.textContent = fmtBRL.format(currentGain);
        if (ctaBtn) {
          ctaBtn.innerHTML = `👉 Recuperar meus <strong>${fmtBRL.format(currentGain)}</strong>/mês com o Aegis →`;
        }

        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          currentLoss = targetLoss;
          currentLossYear = targetLossYear;
          currentGain = targetGain;
        }
      }

      animFrame = requestAnimationFrame(step);
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
     16.5. MOBILE HAMBURGER MENU
     Toggle menu on mobile screens
     ═══════════════════════════════════════════════════════════════════════ */
  (function initMobileMenu() {
    const menuBtn = $('#mobile-menu-btn');
    const headerNav = $('.header-nav');
    if (!menuBtn || !headerNav) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuBtn.classList.toggle('active');
      headerNav.classList.toggle('active');
      const isExpanded = menuBtn.classList.contains('active');
      menuBtn.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    });

    // Close menu when clicking a navigation link
    const navLinks = headerNav.querySelectorAll('.nav-link, .btn');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        headerNav.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!headerNav.contains(e.target) && !menuBtn.contains(e.target) && headerNav.classList.contains('active')) {
        menuBtn.classList.remove('active');
        headerNav.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
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

  /* ═══════════════════════════════════════════════════════════════════════
     18. GSAP AGENT CARDS SEQUENCE
     Pins the section and transitions cards seamlessly one by one
     ═══════════════════════════════════════════════════�
});

  /* ═══════════════════════════════════════════════════════════════════════
     11. CALCULADORA INTERATIVA DE PLANOS & ROI
     ═══════════════════════════════════════════════════════════════════════ */
  function initPricingCalculator() {
    const sellersRange = document.getElementById('calc-sellers-range');
    const chatsRange = document.getElementById('calc-chats-range');
    const sellersVal = document.getElementById('calc-sellers-val');
    const chatsVal = document.getElementById('calc-chats-val');
    const planName = document.getElementById('calc-recommended-plan');
    const hoursSaved = document.getElementById('calc-hours-saved');
    const recoveredLeads = document.getElementById('calc-recovered-leads');
    const selectBtn = document.getElementById('calc-select-btn');

    const cardEssencial = document.getElementById('card-essencial');
    const cardCrescimento = document.getElementById('card-crescimento');
    const cardEnterprise = document.getElementById('card-enterprise');

    if (!sellersRange || !chatsRange) return;

    let userHasInteracted = false;

    function updateCalculations(userTriggered = false) {
      if (userTriggered) {
        userHasInteracted = true;
      }

      const sellers = parseInt(sellersRange.value, 10);
      const chats = parseInt(chatsRange.value, 10);

      sellersVal.textContent = sellers === 25 ? '25+ vendedores' : `${sellers} ${sellers === 1 ? 'vendedor' : 'vendedores'}`;
      chatsVal.textContent = chats === 8000 ? '8.000+ conversas' : `${chats.toLocaleString('pt-BR')} conversas`;

      const hours = Math.round(sellers * 5.5);
      hoursSaved.textContent = `~${hours}h/mês`;

      const minLeads = Math.max(1, Math.round(chats * 0.004));
      const maxLeads = Math.round(chats * 0.007);
      recoveredLeads.textContent = minLeads === maxLeads ? `~${minLeads}` : `~${minLeads} a ${maxLeads}`;

      let recommended = 'Crescimento (R$ 997/mês)';
      let targetCard = cardCrescimento;

      if (sellers <= 3 && chats <= 600) {
        recommended = 'Essencial (R$ 497/mês)';
        targetCard = cardEssencial;
      } else if (sellers > 10 || chats > 3500) {
        recommended = 'Enterprise (R$ 2.997/mês)';
        targetCard = cardEnterprise;
      } else {
        recommended = 'Crescimento (R$ 997/mês)';
        targetCard = cardCrescimento;
      }

      planName.textContent = recommended;
      selectBtn.textContent = `Selecionar ${recommended} →`;

      [cardEssencial, cardCrescimento, cardEnterprise].forEach(card => {
        if (!card) return;
        card.classList.remove('plan-recommended');
        const btn = card.querySelector('.pricing-btn');
        if (btn) {
          btn.classList.remove('btn-primary', 'magnetic-btn');
          btn.classList.add('btn-outline');
          btn.style.transform = 'translate(0, 0)';
        }
      });

      if (userHasInteracted && targetCard) {
        targetCard.classList.add('plan-recommended');
        const targetBtn = targetCard.querySelector('.pricing-btn');
        if (targetBtn) {
          targetBtn.classList.remove('btn-outline');
          targetBtn.classList.add('btn-primary', 'magnetic-btn');
        }
      }
    }

    const allPricingBtns = [
      cardEssencial?.querySelector('.pricing-btn'),
      cardCrescimento?.querySelector('.pricing-btn'),
      cardEnterprise?.querySelector('.pricing-btn')
    ].filter(Boolean);

    allPricingBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        if (!btn.classList.contains('magnetic-btn')) return;
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * 0.35;
        const dy = (e.clientY - cy) * 0.35;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        if (!btn.classList.contains('magnetic-btn')) return;
        btn.style.transition = 'transform 0.35s ease';
        btn.style.transform = 'translate(0, 0)';
        const cleanup = () => {
          btn.style.transition = '';
          btn.removeEventListener('transitionend', cleanup);
        };
        btn.addEventListener('transitionend', cleanup);
      });
    });

    sellersRange.addEventListener('input', () => updateCalculations(true));
    chatsRange.addEventListener('input', () => updateCalculations(true));
    updateCalculations(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPricingCalculator);
  } else {
    initPricingCalculator();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     18. GSAP AGENT CARDS SEQUENCE
     Pins the section and transitions cards seamlessly one by one
     ═══════════════════════════════════════════════════════════════════════ */
  function initGSAPCards() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // Skip card pinning sequence on mobile screens
    if (window.innerWidth <= 768) return;

    const section = document.querySelector('.ai-agents-section');
    const cards = gsap.utils.toArray('.agents-grid .agent-card, .agents-grid .agent-banner');
    
    if (!section || cards.length === 0) return;

    // Reset reveal classes to avoid CSS transform conflicts
    cards.forEach(card => {
      card.classList.remove('reveal', 'active', 'reveal-left', 'reveal-right');
      card.style.transition = 'none';
    });

    // Set initial card states: Card 0 active, others waiting below
    cards.forEach((card, i) => {
      if (i === 0) {
        gsap.set(card, { y: 0, opacity: 1, scale: 1, pointerEvents: 'auto' });
      } else {
        gsap.set(card, { y: 100, opacity: 0, scale: 0.95, pointerEvents: 'none' });
      }
    });

    // Ensure section header reveal elements are immediately active
    const headerElements = section.querySelectorAll('.ai-agents-header .reveal');
    headerElements.forEach(el => el.classList.add('active'));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80px',
        end: () => '+=' + (cards.length * 400),
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    // Transition sequence: Current card moves UP & out (-60px, opacity 0), next card enters (100px -> 0px, opacity 1)
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        const nextCard = cards[i + 1];
        const stepLabel = `step-${i}`;

        tl.to(card, {
          y: -60,
          opacity: 0,
          scale: 0.95,
          pointerEvents: 'none',
          duration: 0.8,
          ease: 'power1.inOut'
        }, stepLabel)
        .to(nextCard, {
          y: 0,
          opacity: 1,
          scale: 1,
          pointerEvents: 'auto',
          duration: 0.8,
          ease: 'power1.inOut'
        }, stepLabel);
      }
    });

    ScrollTrigger.refresh();
  }

  // Ensure GSAP initializes when window loads or immediately if already loaded
  if (document.readyState === 'complete') {
    initGSAPCards();
  } else {
    window.addEventListener('load', initGSAPCards);
  }

})();


/* ─── MODAL: DETALHES COMPLETOS E CUMULATIVOS DOS PLANOS ─── */
(function initPlanDetailModal() {
  'use strict';

  const planData = {
    essencial: {
      title: 'Plano Essencial — R$ 497/mês',
      annualTitle: 'Plano Essencial — R$ 4.970/ano (16% desc.)',
      sections: [
        { heading: 'Equipe e Pipeline', items: [
          'Até 3 usuários',
          '2 funis de vendas configuráveis',
          'Até 8 etapas por funil',
          'Kanban visual drag-and-drop',
          'Visualização em tabela de dados',
          'Campos customizados e tags',
          'Importação e exportação de dados (CSV)'
        ]},
        { heading: 'WhatsApp e Multiatendimento', items: [
          '2 conexões WhatsApp (Cluster WAHA)',
          'Multiatendimento incluso (toda a equipe no mesmo número)',
          'Transcrição automática de áudio por IA (Whisper)',
          'Envio de imagem, vídeo, documento e áudio',
          'Chat ao vivo com WebSockets (mensagens em tempo real)'
        ]},
        { heading: 'Inteligência Artificial', items: [
          '1 Agente autônomo de IA',
          '50.000 tokens de IA/mês',
          'Copiloto de vendas em tempo real (sugestões inteligentes)',
          'Base de conhecimento RAG (upload de PDFs, FAQs e documentos)',
          '8 templates de agente especializados (SDR, Qualificação, Pós-Venda...)',
          'Transbordo inteligente IA → humano (6 camadas de proteção)'
        ]},
        { heading: 'Automações e Workflows', items: [
          '5 workflows ativos',
          '10 tipos de ações automáticas',
          'Construtor visual de fluxos em grafo (DAG)'
        ]},
        { heading: 'Comercial e Vendas', items: [
          'Propostas comerciais em PDF (envio direto no WhatsApp)',
          'Catálogo de produtos e serviços',
          'Pedidos de venda',
          'Formulário público de captura de leads',
          'Widget incorporável para sites'
        ]},
        { heading: 'Relatórios e Gestão', items: [
          'Dashboard com KPIs principais (Receita, Conversão, Ticket Médio)',
          'Gráficos de vendas e conversão',
          'Ranking de vendedores',
          'Atribuição manual e por regra de vendedor'
        ]},
        { heading: 'Segurança e Infraestrutura', items: [
          'Criptografia AES-256-GCM',
          'Multi-tenancy com RLS PostgreSQL',
          'Agenda integrada com lembretes'
        ]},
        { heading: 'Suporte', items: [
          'Chat e e-mail (48h úteis)',
          'Onboarding autoguiado (tutoriais in-app)'
        ]},
        { heading: 'Não incluído neste plano', unavailable: true, items: [
          'Few-Shot Learning (IA aprende com conversas reais)',
          'Personalização avançada do tom de voz (edição de prompt)',
          'Contratos e faturas recorrentes',
          'Ordens de compra e gestão de fornecedores',
          'Equipes com metas e distribuição Round-Robin',
          'Exportação de relatórios gerenciais em Excel/PDF',
          'Captura de leads via Meta Ads e Google Ads',
          'API REST',
          'Webhooks de saída',
          'White-Label e SMTP customizado',
          'BYOK (Chave de IA própria)'
        ]}
      ]
    },
    crescimento: {
      title: 'Plano Crescimento — R$ 997/mês',
      annualTitle: 'Plano Crescimento — R$ 9.970/ano (16% desc.)',
      sections: [
        { heading: 'Equipe e Pipeline', items: [
          'Até 10 usuários (3x mais que Essencial)',
          '10 funis de vendas (5x mais que Essencial)',
          'Até 15 etapas por funil',
          'Kanban visual drag-and-drop',
          'Visualização em tabela de dados',
          'Campos customizados e tags ilimitados',
          'Importação e exportação de dados (CSV)',
          'Filtros avançados de busca e segmentação'
        ]},
        { heading: 'WhatsApp e Multiatendimento', items: [
          '5 conexões WhatsApp',
          'Multiatendimento incluso (toda a equipe no mesmo número)',
          'Multiatendimento com filas e roteamento por setor/vendedor',
          'Transcrição automática de áudio por IA (Whisper)',
          'Envio de imagem, vídeo, documento e áudio',
          'Chat ao vivo com WebSockets (mensagens em tempo real)',
          'Proteção contra banimento (Warmup de chips)',
          'Debouncing inteligente de 60s para respostas da IA'
        ]},
        { heading: 'Inteligência Artificial', items: [
          '3 Agentes autônomos de IA',
          '500.000 tokens de IA/mês (10x mais que Essencial)',
          'Copiloto de vendas em tempo real (sugestões inteligentes)',
          'Base de conhecimento RAG (upload de PDFs, FAQs e documentos)',
          '8 templates de agente especializados (SDR, Qualificação, Pós-Venda...)',
          'Transbordo inteligente IA → humano (6 camadas de proteção)',
          'Personalização total do tom de voz (edição livre do prompt)',
          'Análise de sentimento das conversas',
          'Geração automática de orçamento em PDF pela IA',
          'Envio automático de dados de pagamento PIX pela IA'
        ]},
        { heading: 'Automações e Workflows', items: [
          '30 workflows ativos',
          '15 tipos de ações automáticas (inclui webhooks de saída)',
          'Construtor visual de fluxos em grafo (DAG)',
          'Gatilhos por comportamento do lead',
          'Transfers inteligentes entre setores e equipes'
        ]},
        { heading: 'Comercial e Vendas', items: [
          'Propostas comerciais em PDF (envio direto no WhatsApp)',
          'Catálogo de produtos e serviços',
          'Pedidos de venda',
          'Formulário público de captura + Widget incorporável',
          'Contratos e faturas recorrentes (cobrança mensal automática)',
          'Ordens de compra + Gestão de fornecedores',
          'Captura automática de leads Meta Ads e Google Ads',
          'Google Forms webhook automático'
        ]},
        { heading: 'Gestão de Equipe', items: [
          'Atribuição manual e por regra de vendedor',
          'Equipes de vendas com metas mensais e progresso',
          'Distribuição Round-Robin automática de leads',
          'Setores organizacionais (Vendas, Suporte, Financeiro)'
        ]},
        { heading: 'Relatórios e BI', items: [
          'Dashboard completo em tempo real (cache Redis)',
          'Gráficos de vendas e conversão',
          'Ranking gamificado de vendedores',
          'Drill-down analítico em todos os KPIs',
          'Análise de motivos de perda de negócios',
          'Exportação de relatórios gerenciais em CSV, Excel e PDF'
        ]},
        { heading: 'Integrações e Segurança', items: [
          '10 webhooks de entrada + webhooks de saída',
          'API REST (somente leitura)',
          'Logs de auditoria completos',
          'Criptografia AES-256-GCM',
          'Multi-tenancy com RLS PostgreSQL',
          'Agenda integrada com lembretes'
        ]},
        { heading: 'Suporte', items: [
          'WhatsApp prioritário (12h úteis)',
          'Onboarding assistido (1 sessão de 1h com especialista)'
        ]},
        { heading: 'Não incluído neste plano', unavailable: true, items: [
          'Few-Shot Learning (IA treina com conversas reais)',
          'BYOK (Chave de IA própria OpenAI/Gemini/Claude)',
          'API REST de escrita',
          'White-Label e SMTP customizado',
          'Roles e permissões customizados',
          'SSO (Single Sign-On)'
        ]}
      ]
    },
    enterprise: {
      title: 'Plano Enterprise — R$ 2.997/mês',
      sections: [
        { heading: 'Equipe e Pipeline', items: [
          'Usuários ilimitados',
          'Funis de vendas ilimitados',
          'Até 25 etapas por funil',
          'Kanban visual drag-and-drop',
          'Visualização em tabela de dados',
          'Campos customizados e tags ilimitados',
          'Importação e exportação de dados (CSV e JSON)',
          'Filtros avançados de busca e segmentação',
          'Roles e permissões customizados (granulares por usuário)',
          'Perfis de acesso: Admin, Gestor, Financeiro, Funcionário, Vendedor + customizados'
        ]},
        { heading: 'WhatsApp e Multiatendimento', items: [
          '20 conexões WhatsApp simultâneas',
          'Multiatendimento incluso (toda a equipe no mesmo número)',
          'Multiatendimento completo com filas e roteamento inteligente por setor/vendedor',
          'Transcrição automática de áudio por IA (Whisper)',
          'Envio de imagem, vídeo, documento e áudio',
          'Chat ao vivo com WebSockets (mensagens em tempo real)',
          'Proteção contra banimento (Warmup de chips)',
          'Warmup avançado anti-banimento',
          'Debouncing inteligente de 60s para respostas da IA',
          'Cluster WAHA multi-nó com balanceamento de carga'
        ]},
        { heading: 'Inteligência Artificial', items: [
          'Agentes de IA ilimitados',
          '5.000.000+ tokens de IA/mês',
          'Copiloto de vendas em tempo real (sugestões inteligentes)',
          'Base de conhecimento RAG completa (upload de PDFs, FAQs e documentos)',
          '8 templates de agente especializados (SDR, Qualificação, Pós-Venda...)',
          'Transbordo inteligente IA → humano (6 camadas de proteção)',
          'Personalização total do tom de voz (edição livre do prompt)',
          'Análise de sentimento das conversas',
          'Geração automática de orçamento em PDF pela IA',
          'Envio automático de dados de pagamento PIX pela IA',
          'Few-Shot Learning (IA aprende e treina com suas conversas de sucesso)',
          'BYOK: Traga sua própria chave (OpenAI, Gemini ou Claude)',
          'Orquestrador de 6 camadas configurável (limiares, governança)',
          'Multi-provedor: GPT-4o, Gemini 2.5 Flash, Claude 3.5'
        ]},
        { heading: 'Automações e Workflows', items: [
          'Workflows ilimitados',
          'Todos os 17 tipos de ações automáticas',
          'Construtor visual de fluxos em grafo (DAG)',
          'Gatilhos por comportamento do lead',
          'Transfers inteligentes entre setores e equipes',
          'Nós de webhook externo, execução de ferramentas e espera programada'
        ]},
        { heading: 'Comercial e Vendas', items: [
          'Propostas comerciais em PDF (envio direto no WhatsApp)',
          'Catálogo de produtos e serviços',
          'Pedidos de venda',
          'Formulário público de captura + Widget incorporável',
          'Contratos e faturas recorrentes (cobrança mensal automática)',
          'Ordens de compra + Gestão de fornecedores',
          'Captura automática de leads Meta Ads e Google Ads',
          'Google Forms webhook automático',
          'Relatório de ROI da IA (leads qualificados/convertidos pela IA)'
        ]},
        { heading: 'Gestão de Equipe', items: [
          'Atribuição manual e por regra de vendedor',
          'Equipes de vendas com metas mensais e progresso',
          'Distribuição Round-Robin automática de leads',
          'Setores organizacionais (Vendas, Suporte, Financeiro)',
          'Permissões e papéis de acesso granulares por usuário'
        ]},
        { heading: 'Relatórios e BI', items: [
          'Dashboard completo em tempo real (cache Redis)',
          'Gráficos de vendas e conversão',
          'Ranking gamificado de vendedores',
          'Drill-down analítico em todos os KPIs',
          'Análise de motivos de perda de negócios',
          'Exportação completa em CSV, Excel, PDF e JSON',
          'Relatórios customizáveis sob medida'
        ]},
        { heading: 'Integrações, White-Label e Segurança', items: [
          'Webhooks de entrada e saída ilimitados',
          'API REST completa (leitura + escrita)',
          'White-Label completo (sua marca, logo, cores, favicon, domínio)',
          'SMTP customizado (envio de e-mails com seu domínio)',
          'SSO (Single Sign-On corporativo)',
          'Logs de auditoria completos',
          'Criptografia AES-256-GCM',
          'Multi-tenancy com RLS PostgreSQL',
          'Agenda integrada com lembretes'
        ]},
        { heading: 'Suporte VIP', items: [
          'Atendimento VIP 24/7 (WhatsApp + Ligação)',
          'Gestor de conta dedicado',
          'SLA contratual de resposta (4h úteis)',
          'Onboarding completo (3 sessões + configuração assistida)'
        ]}
      ]
    }
  };

  function openModal(planKey) {
    var overlay = document.getElementById('plan-detail-overlay');
    var titleEl = document.getElementById('plan-detail-title');
    var bodyEl = document.getElementById('plan-detail-body');
    if (!overlay || !titleEl || !bodyEl) return;

    var plan = planData[planKey];
    if (!plan) return;

    var isAnnual = document.querySelector('.pricing-segmented-control')?.classList.contains('is-annual') || false;
    var titleText = (isAnnual && plan.annualTitle) ? plan.annualTitle : plan.title;

    titleEl.textContent = titleText;
    var html = '';
    
    plan.sections.forEach(function(section) {
      var isUnavailable = section.unavailable || false;
      var sectionClass = isUnavailable ? 'plan-detail-section unavailable-section' : 'plan-detail-section';
      var iconSvg = isUnavailable 
        ? '<svg class="item-icon-unavail" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="even-odd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="even-odd"/></svg>'
        : '<svg class="item-icon-check" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="even-odd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="even-odd"/></svg>';

      html += '<div class="' + sectionClass + '">';
      html += '<div class="section-badge-header"><span>' + section.heading + '</span></div>';
      html += '<ul class="modal-feature-list">';
      section.items.forEach(function(item) {
        if (isUnavailable) {
          html += '<li class="unavailable">' + iconSvg + '<span>' + item + '</span></li>';
        } else {
          html += '<li>' + iconSvg + '<span>' + item + '</span></li>';
        }
      });
      html += '</ul></div>';
    });

    html += '<div class="modal-cta-footer">';
    html += '<a href="#demonstracao" class="btn btn-primary modal-cta-btn" onclick="document.getElementById(\'plan-detail-overlay\').classList.remove(\'active\');document.body.style.overflow=\'\';">Quero iniciar com este plano →</a>';
    html += '</div>';

    bodyEl.innerHTML = html;
    bodyEl.scrollTop = 0;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var overlay = document.getElementById('plan-detail-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Delegacao global de clique na janela: GARANTIDO funcionar sempre
  window.addEventListener('click', function(e) {
    var btn = e.target.closest('.pricing-see-more');
    if (btn) {
      e.preventDefault();
      var planKey = btn.getAttribute('data-plan');
      openModal(planKey);
      return;
    }

    var closeBtn = e.target.closest('#plan-detail-close');
    if (closeBtn) {
      e.preventDefault();
      closeModal();
      return;
    }

    var overlay = document.getElementById('plan-detail-overlay');
    if (overlay && e.target === overlay) {
      closeModal();
    }
  });

  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
})();

// ─── SEGMENTED PRICING TOGGLE ───
(function() {
  const btnMonthly = document.getElementById('btn-monthly');
  const btnAnnual = document.getElementById('btn-annual');
  const segmentedControl = document.querySelector('.pricing-segmented-control');
  const pricingAmounts = document.querySelectorAll('.pricing-amount');
  const annualNotes = document.querySelectorAll('.pricing-annual-note');

  if (btnMonthly && btnAnnual && segmentedControl) {
    function setBilling(mode) {
      if (mode === 'annual') {
        btnAnnual.classList.add('active');
        btnAnnual.setAttribute('aria-selected', 'true');
        btnMonthly.classList.remove('active');
        btnMonthly.setAttribute('aria-selected', 'false');
        segmentedControl.classList.add('is-annual');

        pricingAmounts.forEach(el => {
          if (el.dataset.annual) el.textContent = el.dataset.annual;
        });
        annualNotes.forEach(el => {
          el.style.display = 'block';
        });
      } else {
        btnMonthly.classList.add('active');
        btnMonthly.setAttribute('aria-selected', 'true');
        btnAnnual.classList.remove('active');
        btnAnnual.setAttribute('aria-selected', 'false');
        segmentedControl.classList.remove('is-annual');

        pricingAmounts.forEach(el => {
          if (el.dataset.monthly) el.textContent = el.dataset.monthly;
        });
        annualNotes.forEach(el => {
          el.style.display = 'none';
        });
      }
    }

    btnMonthly.addEventListener('click', () => setBilling('monthly'));
    btnAnnual.addEventListener('click', () => setBilling('annual'));
  }
})();
