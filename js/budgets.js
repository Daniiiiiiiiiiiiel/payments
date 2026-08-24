/**
 * budgets.js — Gestión de presupuestos mensuales
 */

const Budgets = {
  KEY: Storage.KEYS.BUDGETS,

  getAll() {
    return Storage.getList(this.KEY);
  },

  /** Obtiene presupuestos del mes especificado (o actual) */
  getForMonth(month) {
    const m = month || Utils.currentMonth();
    return this.getAll().filter(b => b.month === m);
  },

  getById(id) {
    return this.getAll().find(b => b.id === id) || null;
  },

  create(data) {
    if (!Utils.isValidAmount(data.amount)) throw new Error('El monto del presupuesto no es válido.');
    const budget = {
      id: Utils.generateId(),
      name: data.name?.trim() || 'Presupuesto',
      categoryId: data.categoryId || null,
      amount: parseFloat(data.amount),
      month: data.month || Utils.currentMonth(),
      isGeneral: data.isGeneral === true,
      createdAt: new Date().toISOString(),
    };
    Storage.addItem(this.KEY, budget);
    return budget;
  },

  update(id, data) {
    if (data.amount !== undefined && !Utils.isValidAmount(data.amount)) {
      throw new Error('El monto del presupuesto no es válido.');
    }
    const updates = {};
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.amount !== undefined) updates.amount = parseFloat(data.amount);
    if (data.month !== undefined) updates.month = data.month;
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    return Storage.updateItem(this.KEY, id, updates);
  },

  delete(id) {
    return Storage.deleteItem(this.KEY, id);
  },

  /**
   * Calcula el estado de un presupuesto dado un monto gastado.
   * Devuelve { spent, remaining, percentage, status }
   */
  calculateStatus(budget, spent) {
    const s = parseFloat(spent) || 0;
    const remaining = budget.amount - s;
    const pct = Utils.percentage(s, budget.amount);
    return {
      spent: s,
      remaining,
      percentage: pct,
      status: Utils.budgetStatus(s, budget.amount),
    };
  },

  /**
   * Calcula el gasto correspondiente a cada presupuesto del mes actual.
   * Devuelve array de { budget, category, spent, remaining, percentage, status }
   */
  getStatusForMonth(month) {
    const m = month || Utils.currentMonth();
    const budgets = this.getForMonth(m);
    const categories = Categories.getAll();
    const { start, end } = Utils.monthRange(m);
    const allTxs = Storage.getList(Storage.KEYS.TRANSACTIONS);
    const monthTxs = Utils.filterByDateRange(allTxs, start, end).filter(t => t.type === 'expense');

    return budgets.map(b => {
      let spent;
      if (b.isGeneral || !b.categoryId) {
        // General budget: sum all expenses
        spent = Utils.sumExpenses(monthTxs);
      } else {
        spent = monthTxs
          .filter(t => t.categoryId === b.categoryId)
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      }
      const cat = categories.find(c => c.id === b.categoryId) || null;
      return {
        budget: b,
        category: cat,
        ...this.calculateStatus(b, spent),
      };
    });
  },

  /** Renderiza una tarjeta de presupuesto */
  renderCard(item, settings) {
    const symbol = settings?.currencySymbol || '$';
    const { budget, category, spent, remaining, percentage, status } = item;
    const statusClass = status === 'over' ? 'budget-over' : status === 'warning' ? 'budget-warning' : 'budget-ok';
    const icon = category ? category.icon : '📊';
    const name = budget.isGeneral ? 'Presupuesto General' : (category?.name || budget.name);
    const pctClamped = Utils.clamp(percentage, 0, 100);

    return `
      <div class="budget-card ${statusClass}" data-id="${budget.id}">
        <div class="budget-header">
          <div class="budget-icon">${icon}</div>
          <div class="budget-info">
            <span class="budget-name">${name}</span>
            <span class="budget-meta">${Utils.formatCurrency(spent, symbol)} de ${Utils.formatCurrency(budget.amount, symbol)}</span>
          </div>
          <div class="budget-actions">
            <button class="btn-icon" data-action="edit-budget" data-id="${budget.id}">✏️</button>
            <button class="btn-icon" data-action="delete-budget" data-id="${budget.id}">🗑️</button>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pctClamped}%"></div>
        </div>
        <div class="budget-footer">
          <span class="budget-pct">${percentage}%</span>
          <span class="budget-remaining ${remaining < 0 ? 'text-danger' : ''}">
            ${remaining >= 0 ? 'Disponible: ' + Utils.formatCurrency(remaining, symbol) : 'Excedido: ' + Utils.formatCurrency(Math.abs(remaining), symbol)}
          </span>
        </div>
      </div>
    `;
  },
};
