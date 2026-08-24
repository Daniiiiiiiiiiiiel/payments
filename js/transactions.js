/**
 * transactions.js — CRUD de transacciones (gastos e ingresos)
 */

const Transactions = {
  KEY: Storage.KEYS.TRANSACTIONS,

  /** Obtiene todas las transacciones ordenadas por fecha descendente */
  getAll() {
    return Storage.getList(this.KEY).sort((a, b) => {
      if (b.date !== a.date) return b.date.localeCompare(a.date);
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });
  },

  /** Obtiene transacciones con filtros aplicados */
  getFiltered({ type, categoryId, startDate, endDate, paymentMethod, search } = {}) {
    let list = this.getAll();
    if (type && type !== 'all') list = list.filter(t => t.type === type);
    if (categoryId) list = list.filter(t => t.categoryId === categoryId);
    if (startDate) list = list.filter(t => t.date >= startDate);
    if (endDate) list = list.filter(t => t.date <= endDate);
    if (paymentMethod) list = list.filter(t => t.paymentMethod === paymentMethod);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.description || '').toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q)
      );
    }
    return list;
  },

  /** Obtiene una transacción por id */
  getById(id) {
    return Storage.getList(this.KEY).find(t => t.id === id) || null;
  },

  /** Crea una nueva transacción */
  create(data) {
    if (!Utils.isValidAmount(data.amount)) throw new Error('El monto no es válido.');
    if (!data.description?.trim()) throw new Error('La descripción es obligatoria.');
    if (!data.categoryId) throw new Error('La categoría es obligatoria.');
    if (!Utils.isValidDate(data.date)) throw new Error('La fecha no es válida.');

    const tx = {
      id: Utils.generateId(),
      type: data.type === 'income' ? 'income' : 'expense',
      amount: parseFloat(data.amount),
      description: data.description.trim(),
      categoryId: data.categoryId,
      date: data.date,
      paymentMethod: data.paymentMethod || 'cash',
      accountName: data.accountName?.trim() || '',
      note: data.note?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    Storage.addItem(this.KEY, tx);
    return tx;
  },

  /** Actualiza una transacción existente */
  update(id, data) {
    if (data.amount !== undefined && !Utils.isValidAmount(data.amount)) {
      throw new Error('El monto no es válido.');
    }
    const updates = {};
    if (data.amount !== undefined) updates.amount = parseFloat(data.amount);
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
    if (data.date !== undefined) updates.date = data.date;
    if (data.paymentMethod !== undefined) updates.paymentMethod = data.paymentMethod;
    if (data.accountName !== undefined) updates.accountName = data.accountName.trim();
    if (data.note !== undefined) updates.note = data.note.trim();
    if (data.type !== undefined) updates.type = data.type;
    return Storage.updateItem(this.KEY, id, updates);
  },

  /** Duplica una transacción (con fecha hoy) */
  duplicate(id) {
    const tx = this.getById(id);
    if (!tx) return null;
    const copy = {
      ...tx,
      id: Utils.generateId(),
      date: Utils.todayStr(),
      createdAt: new Date().toISOString(),
    };
    delete copy.updatedAt;
    Storage.addItem(this.KEY, copy);
    return copy;
  },

  /** Elimina una transacción */
  delete(id) {
    return Storage.deleteItem(this.KEY, id);
  },

  // ---- Cálculos rápidos ----

  /** Calcula el balance total (ingresos - gastos) */
  totalBalance() {
    const all = Storage.getList(this.KEY);
    return Utils.sumIncome(all) - Utils.sumExpenses(all);
  },

  /** Ingresos y gastos del mes actual */
  currentMonthSummary() {
    const all = Storage.getList(this.KEY);
    const txs = Utils.currentMonthTransactions(all);
    const income = Utils.sumIncome(txs);
    const expenses = Utils.sumExpenses(txs);
    return { income, expenses, savings: income - expenses, txs };
  },

  /** Gastos del mes anterior */
  previousMonthExpenses() {
    const all = Storage.getList(this.KEY);
    const prev = Utils.previousMonth();
    const { start, end } = Utils.monthRange(prev);
    const txs = Utils.filterByDateRange(all, start, end);
    return Utils.sumExpenses(txs);
  },

  /** Gastado hoy */
  todayExpenses() {
    const today = Utils.todayStr();
    const all = Storage.getList(this.KEY);
    return Utils.sumExpenses(all.filter(t => t.date === today));
  },

  /** Gastado esta semana */
  weekExpenses() {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    const start = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    const all = Storage.getList(this.KEY);
    return Utils.sumExpenses(all.filter(t => t.date >= start && t.date <= Utils.todayStr()));
  },

  /** Datos de gastos por mes para los últimos N meses */
  expensesByMonth(n = 6) {
    const months = Utils.lastNMonths(n);
    const all = Storage.getList(this.KEY);
    return months.map(m => {
      const { start, end } = Utils.monthRange(m);
      const txs = Utils.filterByDateRange(all, start, end);
      return {
        month: m,
        label: Utils.monthShortName(m),
        expenses: Utils.sumExpenses(txs),
        income: Utils.sumIncome(txs),
      };
    });
  },

  /** Gastos por categoría en el mes actual */
  currentMonthByCategory() {
    const { txs } = this.currentMonthSummary();
    return Utils.groupByCategory(txs, 'expense');
  },

  /** Promedio diario de gastos en el mes actual */
  dailyAverage() {
    const { expenses } = this.currentMonthSummary();
    const dayOfMonth = new Date().getDate();
    return dayOfMonth > 0 ? expenses / dayOfMonth : 0;
  },

  /** Renderiza un ítem de transacción en HTML */
  renderItem(tx, categories, settings) {
    const cat = categories.find(c => c.id === tx.categoryId) || Categories.fallback();
    const symbol = settings?.currencySymbol || '$';
    const sign = tx.type === 'expense' ? '-' : '+';
    const amountClass = tx.type === 'expense' ? 'amount-expense' : 'amount-income';

    // — Iconos de método de pago
    const paymentIcons = { cash: '💵', card: '💳', bank: '🏦', paypal: '🅿️', other: '📦' };
    const paymentLabels = { cash: 'Efectivo', card: 'Tarjeta', bank: 'Banco', paypal: 'PayPal', other: 'Otro' };
    const payIcon = paymentIcons[tx.paymentMethod] || '💳';
    const payLabel = paymentLabels[tx.paymentMethod] || tx.paymentMethod || '';

    // — Pills de metadatos extras
    const pills = [];
    if (tx.paymentMethod) {
      pills.push(`<span class="tx-pill tx-pill-pay">${payIcon} ${payLabel}</span>`);
    }
    if (tx.accountName) {
      pills.push(`<span class="tx-pill tx-pill-account">🪪 ${tx.accountName}</span>`);
    }
    const pillsHtml = pills.length ? `<div class="tx-pills">${pills.join('')}</div>` : '';

    // — Nota / comentario
    const noteHtml = tx.note
      ? `<span class="tx-note">💬 ${tx.note}</span>`
      : '';

    return `
      <div class="tx-item" data-id="${tx.id}">
        <div class="tx-icon" style="background:${cat.color}20; color:${cat.color}">${cat.icon}</div>
        <div class="tx-info">
          <span class="tx-desc">${tx.description}</span>
          <span class="tx-meta">${cat.name} · ${Utils.formatRelativeDate(tx.date)}</span>
          ${pillsHtml}
          ${noteHtml}
        </div>
        <div class="tx-right">
          <span class="tx-amount ${amountClass}">${sign}${Utils.formatCurrency(tx.amount, symbol)}</span>
          <div class="tx-actions">
            <button class="btn-icon" data-action="edit" data-id="${tx.id}" title="Editar">✏️</button>
            <button class="btn-icon" data-action="delete" data-id="${tx.id}" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>
    `;
  },

  /** Agrupa una lista de transacciones por fecha para renderizado */
  groupByDate(list) {
    const groups = {};
    list.forEach(tx => {
      const label = Utils.formatRelativeDate(tx.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    return groups;
  },

  /** Renderiza lista agrupada por fecha */
  renderGrouped(list, categories, settings) {
    if (list.length === 0) return '<div class="empty-state"><span>📭</span><p>Sin movimientos</p></div>';
    const groups = this.groupByDate(list);
    return Object.entries(groups).map(([label, txs]) => `
      <div class="tx-group">
        <div class="tx-group-label">${label}</div>
        ${txs.map(tx => this.renderItem(tx, categories, settings)).join('')}
      </div>
    `).join('');
  },
};
