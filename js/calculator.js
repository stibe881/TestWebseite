// Webseitenrechner — live pricing
(function () {
  'use strict';

  const form = document.querySelector('[data-calc]');
  if (!form) return;

  const totalEl = form.querySelector('[data-out-total]');
  const monthlyHostingEl = form.querySelector('[data-out-monthly-hosting]');
  const monthlyMaintEl = form.querySelector('[data-out-monthly-maint]');
  const breakdownEl = form.querySelector('[data-out-breakdown]');
  const ctaEl = form.querySelector('[data-mailto]');

  const fmtChf = (n) => 'CHF ' + n.toLocaleString('de-CH').replace(/,/g, "'");

  // Round to nearest whole number
  const round = (n) => Math.round(n);

  // Discount multipliers: Unternehmen 0%, Verein 25%, Privat 50%
  function getDiscount() {
    const input = form.querySelector('input[name="customer"]:checked');
    return input ? (Number(input.dataset.discount) || 0) / 100 : 0;
  }

  function getCustomerLabel() {
    const input = form.querySelector('input[name="customer"]:checked');
    if (!input) return 'Unternehmen / KMU';
    const el = input.parentElement.querySelector('.calc-option__title');
    return el ? el.textContent.trim() : 'Unternehmen / KMU';
  }

  function applyDiscount(price, discount) {
    return round(price * (1 - discount));
  }

  // Update all visible price tags in the form when customer type changes
  function updateDisplayedPrices(discount) {
    // Base type radio prices
    form.querySelectorAll('input[name="type"][data-price]').forEach((input) => {
      const basePrice = Number(input.dataset.price);
      const discounted = applyDiscount(basePrice, discount);
      const priceEl = input.parentElement.querySelector('.calc-option__price');
      if (priceEl) {
        const prefix = input.value === 'webapp' ? 'ab ' : '';
        priceEl.textContent = prefix + fmtChf(discounted);
      }
    });

    // Checkbox add-on prices
    form.querySelectorAll('input[type="checkbox"][data-price]').forEach((input) => {
      const basePrice = Number(input.dataset.price);
      const discounted = applyDiscount(basePrice, discount);
      const priceEl = input.parentElement.querySelector('.calc-check__price');
      if (priceEl) priceEl.textContent = '+ ' + fmtChf(discounted);
    });

    // Language stepper hint
    const langInput = form.querySelector('input[name="languages"]');
    if (langInput) {
      const each = Number(langInput.dataset.extraEach) || 0;
      const discounted = applyDiscount(each, discount);
      const hintEl = langInput.parentElement.querySelector('.calc-stepper__hint');
      if (hintEl) hintEl.innerHTML = 'Erste Sprache inklusive &middot; jede weitere +&nbsp;' + fmtChf(discounted);
    }

    // Hosting & Maintenance radio prices
    form.querySelectorAll('input[name="hosting"][data-monthly], input[name="maint"][data-monthly]').forEach((input) => {
      const baseMonthly = Number(input.dataset.monthly);
      const discounted = applyDiscount(baseMonthly, discount);
      const priceEl = input.parentElement.querySelector('.calc-option__price');
      if (priceEl) priceEl.textContent = fmtChf(discounted) + '\u00a0/\u00a0Mt.';
    });
  }

  function compute() {
    const items = [];
    let total = 0;
    let monthlyHosting = 0;
    let monthlyMaint = 0;

    // Customer type & discount
    const customerInput = form.querySelector('input[name="customer"]:checked');
    const customerValue = customerInput ? customerInput.value : 'unternehmen';
    const discount = getDiscount();
    const customerLabel = getCustomerLabel();

    // Hide E-Commerce option for Privatperson
    const shopLabel = form.querySelector('input[name="type"][value="shop"]');
    if (shopLabel) {
      const shopOption = shopLabel.closest('.calc-option');
      if (customerValue === 'privat') {
        shopOption.style.display = 'none';
        // If shop was selected, switch to landing
        if (shopLabel.checked) {
          shopLabel.checked = false;
          const fallback = form.querySelector('input[name="type"][value="landing"]');
          if (fallback) fallback.checked = true;
        }
      } else {
        shopOption.style.display = '';
      }
    }

    // Update all visible prices in the form
    updateDisplayedPrices(discount);

    // Base type
    const baseInput = form.querySelector('input[name="type"]:checked');
    if (baseInput) {
      const price = applyDiscount(Number(baseInput.dataset.price), discount);
      total += price;
      const labelEl = baseInput.parentElement.querySelector('.calc-option__title');
      items.push({ label: labelEl ? labelEl.textContent.trim() : 'Grundpaket', price });
    }

    // Languages — first inclusive, each additional +800 (discounted)
    const langInput = form.querySelector('input[name="languages"]');
    if (langInput) {
      const count = Math.max(1, Number(langInput.value) || 1);
      const each = applyDiscount(Number(langInput.dataset.extraEach) || 0, discount);
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
      const price = applyDiscount(Number(cb.dataset.price), discount);
      total += price;
      const titleEl = cb.parentElement.querySelector('.calc-check__title');
      items.push({ label: titleEl ? titleEl.textContent.trim() : 'Option', price });
    });

    // Hosting (radio with data-monthly)
    const hostingInput = form.querySelector('input[name="hosting"]:checked');
    if (hostingInput) {
      monthlyHosting = applyDiscount(Number(hostingInput.dataset.monthly) || 0, discount);
    }

    // Maintenance (radio with data-monthly)
    const maintInput = form.querySelector('input[name="maint"]:checked');
    if (maintInput) {
      monthlyMaint = applyDiscount(Number(maintInput.dataset.monthly) || 0, discount);
    }

    // Discount line in breakdown
    const discountPct = Math.round(discount * 100);

    // Render
    if (totalEl) totalEl.textContent = fmtChf(total);
    if (monthlyHostingEl) monthlyHostingEl.textContent = fmtChf(monthlyHosting);
    if (monthlyMaintEl) monthlyMaintEl.textContent = fmtChf(monthlyMaint);

    if (breakdownEl) {
      let html = '';

      // Show customer type + discount badge
      html += `
        <li class="calc-summary__row calc-summary__row--type">
          <span class="calc-summary__row-label">${escapeHtml(customerLabel)}</span>
          <span class="calc-summary__row-price">${discountPct > 0 ? '−' + discountPct + ' %' : '—'}</span>
        </li>`;

      html += items
        .map((it) => `
          <li class="calc-summary__row">
            <span class="calc-summary__row-label">${escapeHtml(it.label)}</span>
            <span class="calc-summary__row-price">${fmtChf(it.price)}</span>
          </li>`)
        .join('');

      breakdownEl.innerHTML = html;
    }

    // mailto link
    if (ctaEl) {
      const lines = [
        'Konfiguration aus dem Webseitenrechner:',
        '',
        `Kundentyp: ${customerLabel}` + (discountPct > 0 ? ` (−${discountPct} %)` : ''),
        '',
        ...items.map((it) => `• ${it.label}: ${fmtChf(it.price)}`),
        '',
        `Festpreis: ${fmtChf(total)}`,
        `Hosting monatlich: ${fmtChf(monthlyHosting)}`,
        `Wartung monatlich: ${fmtChf(monthlyMaint)}`,
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
