/**
 * subscriptions.js — Suscripciones y pagos recurrentes
 */

const Subscriptions = {
  KEY: Storage.KEYS.SUBSCRIPTIONS,

  getAll() {
    return Storage.getList(this.KEY).sort((a, b) => {
      if (!a.nextDate) return 1;
      if (!b.nextDate) return -1;
      return a.nextDate.localeCompare(b.nextDate);
    });
  },

  getById(id) {
    return this.getAll().find(s => s.id === id) || null;
  },

  getActive() {
    return this.getAll().filter(s => s.active !== false);
  },

  create(data) {
    if (!data.name?.trim()) throw new Error('El nombre es obligatorio.');
    if (!Utils.isValidAmount(data.amount)) throw new Error('El monto no es válido.');
    const sub = {
      id: Utils.generateId(),
      name: data.name.trim(),
      amount: parseFloat(data.amount),
      frequency: data.frequency || 'monthly',
      nextDate: data.nextDate || Utils.todayStr(),
      categoryId: data.categoryId || 'cat_subscriptions',
      paymentMethod: data.paymentMethod || 'card',
      accountName: data.accountName?.trim() || '',
      active: true,
      createdAt: new Date().toISOString(),
    };
    Storage.addItem(this.KEY, sub);
    return sub;
  },

  update(id, data) {
    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.amount !== undefined) updates.amount = parseFloat(data.amount);
    if (data.frequency !== undefined) updates.frequency = data.frequency;
    if (data.nextDate !== undefined) updates.nextDate = data.nextDate;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;
    if (data.accountName !== undefined) updates.accountName = data.accountName.trim();
    if (data.active !== undefined) updates.active = data.active;
    return Storage.updateItem(this.KEY, id, updates);
  },

  delete(id) {
    return Storage.deleteItem(this.KEY, id);
  },

  /** Calcula el total mensual aproximado de todas las suscripciones activas */
  monthlyTotal() {
    return this.getActive().reduce((sum, s) => {
      return sum + Utils.monthlyEquivalent(s.amount, s.frequency);
    }, 0);
  },

  /** Calcula el total anual aproximado */
  yearlyTotal() {
    return this.monthlyTotal() * 12;
  },

  /** Obtiene suscripciones con próximos pagos en los próximos N días */
  upcoming(days = 30) {
    const today = Utils.todayStr();
    const futureDate = Utils.offsetDateStr(today, days);
    return this.getActive()
      .filter(s => s.nextDate && s.nextDate >= today && s.nextDate <= futureDate)
      .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  },

  /** Días hasta el próximo pago */
  daysUntilNext(sub) {
    if (!sub.nextDate) return null;
    const today = new Date();
    const next = new Date(sub.nextDate + 'T00:00:00');
    return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  },

  /** Avanza la fecha al siguiente período */
  advanceNextDate(frequency, fromDate) {
    const d = new Date(fromDate + 'T00:00:00');
    switch (frequency) {
      case 'weekly': d.setDate(d.getDate() + 7); break;
      case 'biweekly': d.setDate(d.getDate() + 14); break;
      case 'monthly': d.setMonth(d.getMonth() + 1); break;
      case 'quarterly': d.setMonth(d.getMonth() + 3); break;
      case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    }
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  /** Renderiza una tarjeta de suscripción */
  renderCard(sub, categories, settings) {
    const symbol = settings?.currencySymbol || '$';
    const cat = categories.find(c => c.id === sub.categoryId);
    const days = this.daysUntilNext(sub);
    let urgencyClass = '';
    if (days !== null) {
      if (days <= 3) urgencyClass = 'sub-urgent';
      else if (days <= 7) urgencyClass = 'sub-soon';
    }
    const daysLabel = days === null ? '' : days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : `en ${days} días`;

    return `
      <div class="sub-card ${urgencyClass} ${sub.active === false ? 'sub-inactive' : ''}" data-id="${sub.id}">
        <div class="sub-icon" style="background:${cat?.color || '#AEB6BF'}20; color:${cat?.color || '#AEB6BF'}">${cat?.icon || '📱'}</div>
        <div class="sub-info">
          <span class="sub-name">${sub.name}</span>
          <span class="sub-meta">${Utils.frequencyName(sub.frequency)} · ${daysLabel}</span>
        </div>
        <div class="sub-right">
          <span class="sub-amount">${Utils.formatCurrency(sub.amount, symbol)}</span>
          <div class="sub-actions">
            <button class="btn-icon" data-action="edit-sub" data-id="${sub.id}" title="Editar">✏️</button>
            <button class="btn-icon" data-action="delete-sub" data-id="${sub.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>
    `;
  },
};
