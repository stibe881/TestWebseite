// Webseitenrechner — live pricing
(function () {
  'use strict';

  const form = document.querySelector('[data-calc]');
  if (!form) return;

  const totalEl = form.querySelector('[data-out-total]');
  const monthlyEl = form.querySelector('[data-out-monthly]');
  const breakdownEl = form.querySelector('[data-out-breakdown]');
  const ctaEl = form.querySelector('[data-mailto]');

  const fmtChf = (n) => 'CHF ' + n.toLocaleString('de-CH').replace(/,/g, "'");

  function compute() {
    const items = [];
    let total = 0;
    let monthly = 0;

    // Base type
    const baseInput = form.querySelector('input[name="type"]:checked');
    if (baseInput) {
      const price = Number(baseInput.dataset.price);
      total += price;
      const labelEl = baseInput.parentElement.querySelector('.calc-option__title');
      items.push({ label: labelEl ? labelEl.textContent.trim() : 'Grundpaket', price });
    }

    // Languages — first inclusive, each additional +800
    const langInput = form.querySelector('input[name="languages"]');
    if (langInput) {
      const count = Math.max(1, Number(langInput.value) || 1);
      const each = Number(langInput.dataset.extraEach) || 0;
      const from = Number(langInput.dataset.extraFrom) || 2;
      const extra = Math.max(0, count - (from - 1));
      if (extra > 0) {
        const sum = extra * each;
        total += sum;
        items.push({ label: extra + ' weitere Sprache' + (extra > 1 ? 'n' : ''), price: sum });
      }
    }

    // Add-ons (checkboxes)
    form.querySelectorAll('input[type="checkbox"][data-price]:checked').forEach((cb) => {
      const price = Number(cb.dataset.price);
      total += price;
      const titleEl = cb.parentElement.querySelector('.calc-check__title');
      items.push({ label: titleEl ? titleEl.textContent.trim() : 'Option', price });
    });

    // Maintenance (radio with data-monthly)
    const maintInput = form.querySelector('input[name="maint"]:checked');
    if (maintInput) {
      monthly = Number(maintInput.dataset.monthly) || 0;
    }

    // Render
    if (totalEl) totalEl.textContent = fmtChf(total);
    if (monthlyEl) monthlyEl.textContent = fmtChf(monthly);

    if (breakdownEl) {
      breakdownEl.innerHTML = items
        .map((it) => `
          <li class="calc-summary__row">
            <span class="calc-summary__row-label">${escapeHtml(it.label)}</span>
            <span class="calc-summary__row-price">${fmtChf(it.price)}</span>
          </li>`)
        .join('');
    }

    // mailto link
    if (ctaEl) {
      const lines = [
        'Konfiguration aus dem Webseitenrechner:',
        '',
        ...items.map((it) => `• ${it.label}: ${fmtChf(it.price)}`),
        '',
        `Festpreis: ${fmtChf(total)}`,
        `Wartung monatlich: ${fmtChf(monthly)}`,
        '',
        'Bitte senden Sie mir ein verbindliches Angebot.',
      ];
      const body = lines.join('\n');
      const subject = `[Rechner] Konfiguration ${fmtChf(total)}`;
      ctaEl.href = 'mailto:info@gross-ict.ch?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  // Stepper buttons
  form.querySelectorAll('[data-step]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input[type="number"]');
      if (!input) return;
      const step = Number(btn.dataset.step) || 0;
      const min = Number(input.min) || 0;
      const max = Number(input.max) || Infinity;
      const next = Math.max(min, Math.min(max, (Number(input.value) || 0) + step));
      input.value = String(next);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  // Listen for any change inside the form
  form.addEventListener('input', compute);
  form.addEventListener('change', compute);
  form.addEventListener('submit', (e) => e.preventDefault());

  // Initial paint
  compute();
})();
