// Support — quick-connect ID handling
(function () {
  'use strict';

  const form = document.querySelector('[data-qc-form]');
  if (!form) return;

  const input = form.querySelector('[data-qc-input]');
  const hint = form.querySelector('[data-qc-hint]');

  // Auto-format: insert spaces every 3 digits
  const format = (raw) => {
    const digits = (raw || '').replace(/\D/g, '').slice(0, 9);
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  };

  if (input) {
    input.addEventListener('input', () => {
      const cursorAtEnd = input.selectionStart === input.value.length;
      const formatted = format(input.value);
      if (formatted !== input.value) {
        input.value = formatted;
        if (cursorAtEnd) input.setSelectionRange(formatted.length, formatted.length);
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = (input && input.value || '').replace(/\s+/g, '');
    if (!/^\d{9}$/.test(id)) {
      if (hint) {
        hint.textContent = 'Bitte geben Sie eine gültige 9-stellige ID ein (z. B. 123 456 789).';
        hint.style.color = 'var(--gold-deep)';
      }
      input && input.focus();
      return;
    }
    if (hint) {
      hint.textContent = 'Verbindung wird aufgebaut … Sollte sich kein Fenster öffnen, bitte die TeamViewer Quick Support-App ausführen.';
      hint.style.color = '';
    }
    // TeamViewer protocol handler — opens TV with the entered ID
    window.location.href = 'teamviewer8://control?device=' + id;
  });
})();
