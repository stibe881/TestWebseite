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

  // ---- Contact form: client-side validation + mailto fallback ----
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const subject = (fd.get('subject') || 'Anfrage über Webseite').toString().trim();
      const message = (fd.get('message') || '').toString().trim();
      const company = (fd.get('company') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();

      const status = form.querySelector('[data-form-status]');
      if (!name || !email || !message) {
        if (status) {
          status.textContent = 'Bitte füllen Sie alle Pflichtfelder aus.';
          status.style.color = '#c8943a';
        }
        return;
      }

      const body = [
        'Name: ' + name,
        'E-Mail: ' + email,
        company ? 'Firma: ' + company : '',
        phone ? 'Telefon: ' + phone : '',
        '',
        'Nachricht:',
        message,
      ].filter(Boolean).join('\n');

      const mailto = 'mailto:info@gross-ict.ch'
        + '?subject=' + encodeURIComponent('[Webseite] ' + subject)
        + '&body=' + encodeURIComponent(body);

      if (status) {
        status.textContent = 'E-Mail-Programm wird geöffnet …';
        status.style.color = '#1f2429';
      }
      window.location.href = mailto;
    });
  }
})();
