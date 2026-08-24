/**
 * ui.js — Componentes de interfaz: modales, toasts, confirmaciones, formularios
 */

const UI = {
  // ────────────────────────────────
  // TOAST NOTIFICATIONS
  // ────────────────────────────────
  _toastQueue: [],
  _toastActive: false,

  toast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || '✓'}</span><span>${message}</span>`;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast-show'));
    setTimeout(() => {
      toast.classList.remove('toast-show');
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // ────────────────────────────────
  // MODAL SYSTEM
  // ────────────────────────────────
  _modalStack: [],
  _ignoreNextPopState: 0, // cuántos popstate ignorar (generados por history.back() propio)

  openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('modal-open');
    document.body.classList.add('modal-active');
    this._modalStack.push(id);
    // Registrar entrada en el historial para capturar el gesto/botón de atrás
    history.pushState({ modalId: id }, '');
  },

  closeModal(id, _fromPopState = false) {
    const targetId = id || this._modalStack[this._modalStack.length - 1];
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.remove('modal-open');
    }
    this._modalStack = this._modalStack.filter(m => m !== targetId);
    if (this._modalStack.length === 0) {
      document.body.classList.remove('modal-active');
    }
    // Si el cierre fue manual (no desde popstate), retroceder en el historial
    // y marcar que el próximo popstate debe ignorarse
    if (!_fromPopState) {
      this._ignoreNextPopState++;
      history.back();
    }
  },

  closeAllModals(_fromPopState = false) {
    const count = this._modalStack.length;
    document.querySelectorAll('.modal.modal-open').forEach(m => m.classList.remove('modal-open'));
    this._modalStack = [];
    document.body.classList.remove('modal-active');
    if (!_fromPopState && count > 0) {
      this._ignoreNextPopState += count;
      history.go(-count);
    }
  },

  // ────────────────────────────────
  // CONFIRMATION DIALOG
  // ────────────────────────────────
  confirm(message, onConfirm, onCancel) {
    const msgEl = document.getElementById('confirm-message');
    if (!msgEl) return;
    msgEl.textContent = message;

    // Abrir usando el sistema unificado (registra historial)
    this.openModal('confirm-modal');

    const confirmBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');

    const cleanup = (fromPopState = false) => {
      this.closeModal('confirm-modal', fromPopState);
      // Re-clonar botones para limpiar listeners
      const okFresh = document.getElementById('confirm-ok');
      const cancelFresh = document.getElementById('confirm-cancel');
      if (okFresh) okFresh.replaceWith(okFresh.cloneNode(true));
      if (cancelFresh) cancelFresh.replaceWith(cancelFresh.cloneNode(true));
    };

    document.getElementById('confirm-ok').addEventListener('click', () => {
      cleanup();
      onConfirm?.();
    }, { once: true });

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      cleanup();
      onCancel?.();
    }, { once: true });
  },

  // ────────────────────────────────
  // FORM HELPERS
  // ────────────────────────────────

  /** Obtiene valores de un formulario como objeto */
  getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    const data = {};
    new FormData(form).forEach((val, key) => { data[key] = val; });
    return data;
  },

  /** Rellena un formulario con valores */
  fillForm(formId, data) {
    const form = document.getElementById(formId);
    if (!form) return;
    Object.entries(data).forEach(([key, val]) => {
      const el = form.elements[key];
      if (!el) return;
      if (el.type === 'checkbox') el.checked = !!val;
      else el.value = val ?? '';
    });
  },

  /** Limpia un formulario */
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) form.reset();
  },

  /** Muestra un error en un campo de formulario */
  showFieldError(fieldId, message) {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.classList.add('input-error');
    let errEl = el.parentNode.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      el.parentNode.appendChild(errEl);
    }
    errEl.textContent = message;
  },

  clearFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    form.querySelectorAll('.field-error').forEach(el => el.remove());
  },

  // ────────────────────────────────
  // CATEGORY SELECTOR
  // ────────────────────────────────

  /** Construye opciones <option> para un <select> de categorías */
  buildCategoryOptions(selectId, type = 'expense', selectedId = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const categories = type === 'all'
      ? Categories.getAll()
      : Categories.getByType(type);
    select.innerHTML = '<option value="">Seleccionar categoría</option>' +
      categories.map(c => `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('');
  },

  /** Construye opciones de método de pago */
  buildPaymentOptions(selectId, selected = '') {
    const select = document.getElementById(selectId);
    if (!select) return;
    const options = [
      { value: 'cash', label: '💵 Efectivo' },
      { value: 'card', label: '💳 Tarjeta' },
      { value: 'bank', label: '🏦 Banco' },
      { value: 'paypal', label: '🅿️ PayPal' },
      { value: 'other', label: '📦 Otro' },
    ];
    select.innerHTML = options.map(o => `<option value="${o.value}" ${o.value === selected ? 'selected' : ''}>${o.label}</option>`).join('');
  },

  // ────────────────────────────────
  // QUICK ADD FAB
  // ────────────────────────────────

  openQuickAdd(type = 'expense', prefill = {}) {
    const modal = document.getElementById('quick-add-modal');
    if (!modal) return;

    // Reset form
    this.resetForm('quick-add-form');
    this.clearFieldErrors('quick-add-form');

    // Set type toggle
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });
    document.getElementById('qa-type').value = type;

    // Build category options
    this.buildCategoryOptions('qa-category', type);
    this.buildPaymentOptions('qa-payment');

    // Set default date
    document.getElementById('qa-date').value = prefill.date || Utils.todayStr();

    // Prefill if editing
    if (prefill.id) {
      document.getElementById('qa-edit-id').value = prefill.id;
      if (prefill.amount) document.getElementById('qa-amount').value = prefill.amount;
      if (prefill.description) document.getElementById('qa-description').value = prefill.description;
      if (prefill.date) document.getElementById('qa-date').value = prefill.date;
      if (prefill.note) document.getElementById('qa-note').value = prefill.note;
      if (prefill.paymentMethod) {
        this.buildPaymentOptions('qa-payment', prefill.paymentMethod);
      }
      if (prefill.accountName) document.getElementById('qa-account').value = prefill.accountName;
      // Category needs to be set after rebuilding options
      setTimeout(() => {
        this.buildCategoryOptions('qa-category', type, prefill.categoryId);
      }, 0);
    } else {
      document.getElementById('qa-edit-id').value = '';
    }

    // Update modal title
    const titleEl = document.getElementById('quick-add-title');
    if (titleEl) titleEl.textContent = prefill.id ? 'Editar movimiento' : 'Nuevo movimiento';

    this.openModal('quick-add-modal');
    setTimeout(() => document.getElementById('qa-amount')?.focus(), 100);
  },

  // ────────────────────────────────
  // EMPTY STATE
  // ────────────────────────────────

  emptyState(icon, title, subtitle = '') {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <p class="empty-title">${title}</p>
        ${subtitle ? `<p class="empty-subtitle">${subtitle}</p>` : ''}
      </div>
    `;
  },

  // ────────────────────────────────
  // LOADING STATE
  // ────────────────────────────────

  showLoading(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '<div class="loading-spinner"></div>';
  },

  // ────────────────────────────────
  // ICON PICKER
  // ────────────────────────────────

  renderIconPicker(containerId, selected, onSelect) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = Categories.ICON_OPTIONS.map(icon =>
      `<button type="button" class="icon-pick-btn ${icon === selected ? 'selected' : ''}" data-icon="${icon}">${icon}</button>`
    ).join('');
    container.addEventListener('click', e => {
      const btn = e.target.closest('.icon-pick-btn');
      if (!btn) return;
      container.querySelectorAll('.icon-pick-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      onSelect?.(btn.dataset.icon);
    });
  },

  // ────────────────────────────────
  // NAVIGATION ACTIVE STATE
  // ────────────────────────────────

  setActiveNav(view) {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.classList.toggle('active', el.dataset.nav === view);
    });
  },

  // ────────────────────────────────
  // VIEW SWITCHING
  // ────────────────────────────────

  showView(viewId) {
    document.querySelectorAll('.view').forEach(v => {
      v.classList.toggle('view-active', v.id === viewId);
    });
  },

  // ────────────────────────────────
  // STATS PERIOD SELECTOR
  // ────────────────────────────────
  buildPeriodSelector(containerId, periods, selected, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = periods.map(p =>
      `<button class="period-btn ${p.value === selected ? 'active' : ''}" data-period="${p.value}">${p.label}</button>`
    ).join('');
    container.addEventListener('click', e => {
      const btn = e.target.closest('.period-btn');
      if (!btn) return;
      container.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange?.(btn.dataset.period);
    });
  },
};
