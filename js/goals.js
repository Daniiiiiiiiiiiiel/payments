/**
 * goals.js — Metas de ahorro
 */

const Goals = {
  KEY: Storage.KEYS.GOALS,

  getAll() {
    return Storage.getList(this.KEY);
  },

  getById(id) {
    return this.getAll().find(g => g.id === id) || null;
  },

  create(data) {
    if (!data.name?.trim()) throw new Error('El nombre de la meta es obligatorio.');
    if (!Utils.isValidAmount(data.targetAmount)) throw new Error('El monto objetivo no es válido.');
    const goal = {
      id: Utils.generateId(),
      name: data.name.trim(),
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: parseFloat(data.currentAmount) || 0,
      targetDate: data.targetDate || null,
      color: data.color || '#0A84FF',
      icon: data.icon || '🎯',
      createdAt: new Date().toISOString(),
    };
    Storage.addItem(this.KEY, goal);
    return goal;
  },

  update(id, data) {
    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.targetAmount !== undefined) updates.targetAmount = parseFloat(data.targetAmount);
    if (data.currentAmount !== undefined) updates.currentAmount = parseFloat(data.currentAmount);
    if (data.targetDate !== undefined) updates.targetDate = data.targetDate;
    if (data.color !== undefined) updates.color = data.color;
    if (data.icon !== undefined) updates.icon = data.icon;
    return Storage.updateItem(this.KEY, id, updates);
  },

  /** Añade una cantidad al monto actual de una meta */
  addAmount(id, amount) {
    const goal = this.getById(id);
    if (!goal) return false;
    const newAmount = Math.max(0, (goal.currentAmount || 0) + parseFloat(amount));
    return Storage.updateItem(this.KEY, id, { currentAmount: newAmount });
  },

  delete(id) {
    return Storage.deleteItem(this.KEY, id);
  },

  /** Calcula el progreso de una meta */
  progress(goal) {
    const pct = Utils.percentage(goal.currentAmount, goal.targetAmount);
    const remaining = goal.targetAmount - goal.currentAmount;
    const isComplete = pct >= 100;
    return { pct: Utils.clamp(pct, 0, 100), remaining: Math.max(0, remaining), isComplete };
  },

  /** Días restantes hasta la fecha objetivo */
  daysRemaining(goal) {
    if (!goal.targetDate) return null;
    const now = new Date();
    const target = new Date(goal.targetDate + 'T00:00:00');
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff;
  },

  /** Renderiza una tarjeta de meta */
  renderCard(goal, settings) {
    const symbol = settings?.currencySymbol || '$';
    const { pct, remaining, isComplete } = this.progress(goal);
    const days = this.daysRemaining(goal);
    const daysText = days !== null ? (days > 0 ? `${days} días restantes` : 'Fecha alcanzada') : '';

    return `
      <div class="goal-card ${isComplete ? 'goal-complete' : ''}" data-id="${goal.id}">
        <div class="goal-header">
          <div class="goal-icon" style="background:${goal.color}20; color:${goal.color}">${goal.icon}</div>
          <div class="goal-info">
            <span class="goal-name">${goal.name}</span>
            ${daysText ? `<span class="goal-days">${daysText}</span>` : ''}
          </div>
          <div class="goal-actions">
            <button class="btn-icon" data-action="add-to-goal" data-id="${goal.id}" title="Añadir dinero">➕</button>
            <button class="btn-icon" data-action="edit-goal" data-id="${goal.id}" title="Editar">✏️</button>
            <button class="btn-icon" data-action="delete-goal" data-id="${goal.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
        <div class="goal-amounts">
          <span class="goal-current">${Utils.formatCurrency(goal.currentAmount, symbol)}</span>
          <span class="goal-target">de ${Utils.formatCurrency(goal.targetAmount, symbol)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%; background:${goal.color}"></div>
        </div>
        <div class="goal-footer">
          <span class="goal-pct">${pct}%</span>
          ${!isComplete ? `<span class="goal-remaining">Faltan ${Utils.formatCurrency(remaining, symbol)}</span>` : '<span class="goal-complete-label">✅ Completada</span>'}
        </div>
      </div>
    `;
  },
};
