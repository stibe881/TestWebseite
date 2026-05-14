// Webseitenrechner — live pricing
(function () {
  'use strict';

  const form = document.querySelector('[data-calc]');
  if (!form) return;

  const totalEl = form.querySelector('[data-out-total]');
  const yearlyHostingEl = form.querySelector('[data-out-yearly-hosting]');
  const monthlyMaintEl = form.querySelector('[data-out-monthly-maint]');
  const breakdownEl = form.querySelector('[data-out-breakdown]');
  
  let currentCalculation = {};
  let previousCustomerValue = 'unternehmen';

  function triggerHeartExplosion(sourceEl) {
    const rect = sourceEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const count = 15 + Math.random() * 10;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.textContent = '❤️';
      heart.className = 'heart-particle';
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 60 + Math.random() * 140;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity - 60; // slight upward bias
      
      heart.style.setProperty('--tx', `${tx}px`);
      heart.style.setProperty('--ty', `${ty}px`);
      heart.style.setProperty('--rot', `${(Math.random() - 0.5) * 180}deg`);
      
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;
      
      heart.style.animationDuration = `${0.6 + Math.random() * 0.4}s`;
      
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1200);
    }
  }

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
      const customerInput = form.querySelector('input[name="customer"]:checked');
      const customerValue = customerInput ? customerInput.value : 'unternehmen';
      
      let baseEach = Number(langInput.dataset.extraEach) || 0;
      if (customerValue === 'wedding') {
        baseEach = 100;
      }

      const discounted = applyDiscount(baseEach, discount);
      const hintEl = langInput.parentElement.querySelector('.calc-stepper__hint');
      if (hintEl) hintEl.innerHTML = 'Erste Sprache inklusive &middot; jede weitere +&nbsp;' + fmtChf(discounted);
    }

    // Hosting radio prices (no discount)
    form.querySelectorAll('input[name="hosting"][data-yearly]').forEach((input) => {
      const baseYearly = Number(input.dataset.yearly);
      const priceEl = input.parentElement.querySelector('.calc-option__price');
      if (priceEl) priceEl.textContent = fmtChf(baseYearly) + '\u00a0/\u00a0Jahr';
    });

    // Maintenance radio prices (discount applies)
    form.querySelectorAll('input[name="maint"][data-monthly]').forEach((input) => {
      const baseMonthly = Number(input.dataset.monthly);
      const discounted = applyDiscount(baseMonthly, discount);
      const priceEl = input.parentElement.querySelector('.calc-option__price');
      if (priceEl) priceEl.textContent = fmtChf(discounted) + '\u00a0/\u00a0Mt.';
    });
  }

  function compute() {
    const items = [];
    let total = 0;
    let yearlyHosting = 0;
    let monthlyMaint = 0;

    // Customer type & discount
    const customerInput = form.querySelector('input[name="customer"]:checked');
    const customerValue = customerInput ? customerInput.value : 'unternehmen';
    const discount = getDiscount();
    const customerLabel = getCustomerLabel();

    // Trigger Heart Explosion if changing to 'wedding'
    if (customerValue === 'wedding' && previousCustomerValue !== 'wedding') {
      const sourceEl = customerInput.closest('.calc-option') || customerInput;
      triggerHeartExplosion(sourceEl);
    }
    previousCustomerValue = customerValue;

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

    // Toggle Wedding vs Standard options
    const stdOptions = document.getElementById('options-standard');
    const wedOptions = document.getElementById('options-wedding');

    if (stdOptions && wedOptions) {
      if (customerValue === 'wedding') {
        stdOptions.style.display = 'none';
        wedOptions.style.display = '';
        
        // Ensure a wedding option is checked, and uncheck standard options
        const wedChecked = wedOptions.querySelector('input[name="type"]:checked');
        if (!wedChecked) {
          const defaultWed = wedOptions.querySelector('input[name="type"][value="wedding-premium"]');
          if (defaultWed) defaultWed.checked = true;
        }
        // Uncheck all standard options so we only have one value for "type"
        stdOptions.querySelectorAll('input[name="type"]').forEach(r => r.checked = false);
      } else {
        stdOptions.style.display = '';
        wedOptions.style.display = 'none';
        
        // Ensure a standard option is checked, and uncheck wedding options
        const stdChecked = stdOptions.querySelector('input[name="type"]:checked');
        if (!stdChecked) {
          const defaultStd = stdOptions.querySelector('input[name="type"][value="landing"]');
          if (defaultStd) defaultStd.checked = true;
        }
        // Uncheck all wedding options
        wedOptions.querySelectorAll('input[name="type"]').forEach(r => r.checked = false);
      }
    }

    // Toggle Wedding Examples Preview
    const wedPreview = document.getElementById('wedding-preview');
    if (wedPreview) {
      if (customerValue === 'wedding') {
        wedPreview.style.display = '';
        // Re-trigger animation
        wedPreview.style.animation = 'none';
        wedPreview.offsetHeight; // force reflow
        wedPreview.style.animation = '';
      } else {
        wedPreview.style.display = 'none';
      }
    }

    // Toggle Wedding vs Standard addons and groups
    const stdAddons = document.getElementById('addons-standard');
    const wedAddons = document.getElementById('addons-wedding');
    const groupHosting = document.getElementById('group-hosting');
    const groupMaint = document.getElementById('group-maint');
    const summaryHosting = document.getElementById('summary-hosting');
    const summaryMaint = document.getElementById('summary-maint');

    if (stdAddons && wedAddons) {
      if (customerValue === 'wedding') {
        stdAddons.style.display = 'none';
        wedAddons.style.display = '';
        if (groupHosting) groupHosting.style.display = 'none';
        if (groupMaint) groupMaint.style.display = 'none';
        if (summaryHosting) summaryHosting.style.display = 'none';
        if (summaryMaint) summaryMaint.style.display = 'none';
        
        // Uncheck all standard addons
        stdAddons.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
      } else {
        stdAddons.style.display = '';
        wedAddons.style.display = 'none';
        if (groupHosting) groupHosting.style.display = '';
        if (groupMaint) groupMaint.style.display = '';
        if (summaryHosting) summaryHosting.style.display = '';
        if (summaryMaint) summaryMaint.style.display = '';
        
        // Uncheck all wedding addons
        wedAddons.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
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
      
      let baseEach = Number(langInput.dataset.extraEach) || 0;
      if (customerValue === 'wedding') {
        baseEach = 100;
      }

      const each = applyDiscount(baseEach, discount);
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

    // Hosting (radio with data-yearly)
    const hostingInput = form.querySelector('input[name="hosting"]:checked');
    if (hostingInput && customerValue !== 'wedding') {
      yearlyHosting = Number(hostingInput.dataset.yearly) || 0;
    }

    // Maintenance (radio with data-monthly)
    const maintInput = form.querySelector('input[name="maint"]:checked');
    if (maintInput && customerValue !== 'wedding') {
      monthlyMaint = applyDiscount(Number(maintInput.dataset.monthly) || 0, discount);
    }

    // Discount line in breakdown
    const discountPct = Math.round(discount * 100);

    // Render
    if (totalEl) totalEl.textContent = fmtChf(total);
    if (yearlyHostingEl) yearlyHostingEl.textContent = fmtChf(yearlyHosting);
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

    // Speichere die aktuelle Berechnung für den AJAX Request
    currentCalculation = {
      customerLabel,
      discountPct,
      items,
      total,
      yearlyHosting,
      monthlyMaint
    };
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

  // Quote Request Logic
  const btnShowEmailForm = document.getElementById('btn-show-email-form');
  const quoteEmailForm = document.getElementById('quote-email-form');
  const btnSubmitQuote = document.getElementById('btn-submit-quote');
  const quoteEmailInput = document.getElementById('quote-email-input');
  const quoteFormStatus = document.getElementById('quote-form-status');
  const quoteActions = document.getElementById('quote-actions');

  if (btnShowEmailForm && quoteEmailForm) {
    btnShowEmailForm.addEventListener('click', () => {
      quoteActions.style.display = 'none';
      quoteEmailForm.style.display = 'block';
      quoteEmailInput.focus();
    });
  }

  if (btnSubmitQuote && quoteEmailInput) {
    btnSubmitQuote.addEventListener('click', async () => {
      const email = quoteEmailInput.value.trim();
      
      if (!email || !email.includes('@')) {
        quoteFormStatus.style.display = 'block';
        quoteFormStatus.style.color = '#EF4444';
        quoteFormStatus.textContent = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        return;
      }

      // Button state
      const originalText = btnSubmitQuote.innerHTML;
      btnSubmitQuote.disabled = true;
      btnSubmitQuote.innerHTML = 'Wird gesendet...';
      quoteFormStatus.style.display = 'none';

      try {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('calculation', JSON.stringify(currentCalculation));

        const response = await fetch('create_quote_request.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString()
        });

        const result = await response.json();

        if (response.ok) {
          quoteFormStatus.style.display = 'block';
          quoteFormStatus.style.color = '#10B981';
          quoteFormStatus.textContent = result.success || 'Vielen Dank! Ihre Anfrage wurde gesendet.';
          quoteEmailInput.value = '';
          btnSubmitQuote.style.display = 'none';
          quoteEmailInput.style.display = 'none';
        } else {
          throw new Error(result.error || 'Ein Fehler ist aufgetreten.');
        }
      } catch (err) {
        quoteFormStatus.style.display = 'block';
        quoteFormStatus.style.color = '#EF4444';
        quoteFormStatus.textContent = err.message;
        btnSubmitQuote.disabled = false;
        btnSubmitQuote.innerHTML = originalText;
      }
    });
  }
})();
