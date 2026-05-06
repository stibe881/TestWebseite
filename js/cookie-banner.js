// Cookie-Banner — minimal, DSGVO/revDSG-konform
(function () {
  'use strict';

  var STORAGE_KEY = 'grossict_cookie_consent';

  // Already consented? Don't show.
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Build banner
  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie-Hinweis');
  banner.innerHTML =
    '<div class="cookie-banner__card">' +
      '<div class="cookie-banner__icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>' +
          '<path d="M9 9h.01M15 9h.01M8 13s1.5 2 4 2 4-2 4-2"/>' +
        '</svg>' +
      '</div>' +
      '<div class="cookie-banner__content">' +
        '<p class="cookie-banner__title">Kein Tracking. Versprochen.</p>' +
        '<p class="cookie-banner__text">' +
          'Wir verwenden keine Tracking-Cookies — nur das Nötigste für den Betrieb. ' +
          '<a href="datenschutz.html">Mehr erfahren</a>' +
        '</p>' +
      '</div>' +
      '<div class="cookie-banner__actions">' +
        '<button class="cookie-banner__btn cookie-banner__btn--accept" type="button">Alles klar</button>' +
      '</div>' +
    '</div>';

  document.body.appendChild(banner);

  // Animate in after a short delay
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      banner.classList.add('cookie-banner--visible');
    });
  });

  // Accept handler
  banner.querySelector('.cookie-banner__btn--accept').addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    banner.classList.remove('cookie-banner--visible');
    banner.addEventListener('transitionend', function () {
      banner.remove();
    });
  });
})();
