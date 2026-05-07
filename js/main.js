// ============================================
// GROSS ICT — Site Behavior
// ============================================

(function () {
  'use strict';

  // ---- Header scroll state ----
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav__toggle');
  const navLinks = document.querySelector('.nav__links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (navLinks.classList.contains('is-open')) {
          navLinks.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  }

  // ---- Reveal-on-scroll ----
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Year in footer ----
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---- Contact form: AJAX submission ----
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      const status = form.querySelector('[data-form-status]');
      const btn = form.querySelector('button[type="submit"]');

      if (!name || !email || !message) {
        if (status) {
          status.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
          status.style.color = '#c8943a';
        }
        return;
      }

      if (status) {
        status.textContent = 'Wird gesendet...';
        status.style.color = 'inherit';
      }
      if (btn) btn.disabled = true;

      try {
        const response = await fetch('send_mail.php', {
          method: 'POST',
          body: fd
        });

        const data = await response.json();

        if (response.ok) {
          if (status) {
            status.textContent = data.success || 'Ihre Anfrage wurde erfolgreich gesendet.';
            status.style.color = '#4caf50'; // Green success color
          }
          form.reset();
        } else {
          throw new Error(data.error || 'Fehler beim Senden.');
        }
      } catch (err) {
        if (status) {
          status.textContent = err.message || 'Beim Senden ist ein Fehler aufgetreten.';
          status.style.color = '#e53935'; // Red error color
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // ---- Ticket form: AJAX submission to CRM ----
  const ticketForm = document.querySelector('[data-ticket-form]');
  if (ticketForm) {
    ticketForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(ticketForm);
      const firstname = (fd.get('firstname') || '').toString().trim();
      const lastname = (fd.get('lastname') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const message = (fd.get('message') || '').toString().trim();

      const status = ticketForm.querySelector('[data-ticket-status]');
      const btn = ticketForm.querySelector('button[type="submit"]');

      if (!firstname || !lastname || !email || !message) {
        if (status) {
          status.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
          status.style.color = '#c8943a';
        }
        return;
      }

      if (status) {
        status.textContent = 'Ticket wird erstellt...';
        status.style.color = 'inherit';
      }
      if (btn) btn.disabled = true;

      try {
        const response = await fetch('create_ticket.php', {
          method: 'POST',
          body: fd
        });

        const data = await response.json();

        if (response.ok) {
          if (status) {
            status.textContent = data.success || 'Ihr Ticket wurde erfolgreich erstellt.';
            status.style.color = '#4caf50';
          }
          ticketForm.reset();
        } else {
          throw new Error(data.error || 'Fehler beim Erstellen des Tickets.');
        }
      } catch (err) {
        if (status) {
          status.textContent = err.message || 'Beim Erstellen des Tickets ist ein Fehler aufgetreten.';
          status.style.color = '#e53935';
        }
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // ---- Auto-play showcase video when its frame is fully visible ----
  const showcaseVideo = document.querySelector('.video-frame .video-frame__media');
  if (showcaseVideo && 'IntersectionObserver' in window && !reduce) {
    // Use the <figure> wrapper as observation target so we react to the whole frame,
    // not just the inner <video> (browsers may report the video element height oddly
    // before metadata is loaded).
    const target = showcaseVideo.closest('.video-frame') || showcaseVideo;
    let userInterrupted = false;

    // If the user manually pauses, don't fight them — disable auto-play for the rest of the session.
    showcaseVideo.addEventListener('pause', () => {
      // Distinguish user-initiated pause from observer-driven pause:
      // we set `data-auto-pausing` right before calling pause() ourselves.
      if (showcaseVideo.dataset.autoPausing === '1') {
        delete showcaseVideo.dataset.autoPausing;
        return;
      }
      userInterrupted = true;
    });
    showcaseVideo.addEventListener('play', () => {
      // If user actively presses play, clear the interruption flag.
      userInterrupted = false;
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Fully visible (>= 95% covers very tall frames on short viewports too)
        if (entry.intersectionRatio >= 0.95) {
          if (!userInterrupted && showcaseVideo.paused) {
            const p = showcaseVideo.play();
            // .play() returns a Promise on modern browsers — swallow rejections silently
            if (p && typeof p.catch === 'function') p.catch(() => {});
          }
        } else if (entry.intersectionRatio < 0.4) {
          if (!showcaseVideo.paused) {
            showcaseVideo.dataset.autoPausing = '1';
            showcaseVideo.pause();
          }
        }
      });
    }, { threshold: [0, 0.4, 0.95, 1] });
    io.observe(target);

    // Pause when tab is hidden, resume when it comes back into view
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !showcaseVideo.paused) {
        showcaseVideo.dataset.autoPausing = '1';
        showcaseVideo.pause();
      }
    });
  }
})();
