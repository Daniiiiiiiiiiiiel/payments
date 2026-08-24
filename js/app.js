/**
 * app.js — Inicialización, routing y orquestación principal de la aplicación
 */

// ─────────────────────────────────────────────
// DEMO DATA
// ─────────────────────────────────────────────
const DEMO_DATA = {
  transactions: (() => {
    const today = new Date();
    const d = (offset, h = 0) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - offset);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };
    return [
      { id: 'demo_t1', type: 'income', amount: 3200, description: 'Salario mensual', categoryId: 'cat_salary', date: d(22), paymentMethod: 'bank', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t2', type: 'income', amount: 450, description: 'Proyecto freelance', categoryId: 'cat_freelance', date: d(15), paymentMethod: 'paypal', accountName: '', note: 'Diseño web', createdAt: new Date().toISOString() },
      { id: 'demo_t3', type: 'expense', amount: 850, description: 'Alquiler', categoryId: 'cat_housing', date: d(20), paymentMethod: 'bank', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t4', type: 'expense', amount: 120, description: 'Supermercado', categoryId: 'cat_food', date: d(1), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t5', type: 'expense', amount: 45.50, description: 'Gasolina', categoryId: 'cat_transport', date: d(2), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t6', type: 'expense', amount: 15.99, description: 'Netflix', categoryId: 'cat_subscriptions', date: d(3), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t7', type: 'expense', amount: 68, description: 'Restaurante', categoryId: 'cat_food', date: d(4), paymentMethod: 'cash', accountName: '', note: 'Cena con amigos', createdAt: new Date().toISOString() },
      { id: 'demo_t8', type: 'expense', amount: 9.99, description: 'Spotify', categoryId: 'cat_subscriptions', date: d(5), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t9', type: 'expense', amount: 200, description: 'Electricidad y agua', categoryId: 'cat_services', date: d(6), paymentMethod: 'bank', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t10', type: 'expense', amount: 35, description: 'Libros', categoryId: 'cat_education', date: d(7), paymentMethod: 'card', accountName: 'Visa Principal', note: 'JavaScript: The Good Parts', createdAt: new Date().toISOString() },
      { id: 'demo_t11', type: 'expense', amount: 89, description: 'Compras ropa', categoryId: 'cat_shopping', date: d(8), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t12', type: 'expense', amount: 55, description: 'Médico', categoryId: 'cat_health', date: d(9), paymentMethod: 'cash', accountName: '', note: 'Consulta general', createdAt: new Date().toISOString() },
      { id: 'demo_t13', type: 'expense', amount: 25, description: 'Cinema', categoryId: 'cat_entertainment', date: d(10), paymentMethod: 'cash', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t14', type: 'expense', amount: 180, description: 'Internet', categoryId: 'cat_services', date: d(11), paymentMethod: 'bank', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t15', type: 'income', amount: 200, description: 'Venta artículos usados', categoryId: 'cat_sale', date: d(12), paymentMethod: 'cash', accountName: '', note: 'Celular antiguo', createdAt: new Date().toISOString() },
      { id: 'demo_t16', type: 'expense', amount: 42, description: 'Taxi / Uber', categoryId: 'cat_transport', date: d(0), paymentMethod: 'card', accountName: 'Visa Principal', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t17', type: 'expense', amount: 12.50, description: 'Café y snacks', categoryId: 'cat_food', date: d(0), paymentMethod: 'cash', accountName: '', note: '', createdAt: new Date().toISOString() },
      { id: 'demo_t18', type: 'expense', amount: 299, description: 'Software anual', categoryId: 'cat_tech', date: d(14), paymentMethod: 'card', accountName: 'Visa Principal', note: 'Licencia Adobe', createdAt: new Date().toISOString() },
      { id: 'demo_t19', type: 'expense', amount: 75, description: 'Gimnasio', categoryId: 'cat_health', date: d(16), paymentMethod: 'card', accountName: 'Visa Principal', note: 'Mensualidad', createdAt: new Date().toISOString() },
      { id: 'demo_t20', type: 'income', amount: 120, description: 'Reembolso seguro', categoryId: 'cat_refund', date: d(18), paymentMethod: 'bank', accountName: '', note: '', createdAt: new Date().toISOString() },
    ];
  })(),
  budgets: [
    { id: 'demo_b1', name: 'Presupuesto General', categoryId: null, amount: 2500, month: Utils.currentMonth(), isGeneral: true, createdAt: new Date().toISOString() },
    { id: 'demo_b2', name: 'Comida', categoryId: 'cat_food', amount: 350, month: Utils.currentMonth(), isGeneral: false, createdAt: new Date().toISOString() },
    { id: 'demo_b3', name: 'Transporte', categoryId: 'cat_transport', amount: 150, month: Utils.currentMonth(), isGeneral: false, createdAt: new Date().toISOString() },
  ],
  goals: [
    { id: 'demo_g1', name: 'Computadora nueva', targetAmount: 1500, currentAmount: 650, targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 4); return d.toISOString().split('T')[0]; })(), color: '#0A84FF', icon: '💻', createdAt: new Date().toISOString() },
    { id: 'demo_g2', name: 'Viaje a Europa', targetAmount: 3000, currentAmount: 800, targetDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 8); return d.toISOString().split('T')[0]; })(), color: '#FF6B6B', icon: '✈️', createdAt: new Date().toISOString() },
  ],
  subscriptions: [
    { id: 'demo_s1', name: 'Netflix', amount: 15.99, frequency: 'monthly', nextDate: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })(), categoryId: 'cat_subscriptions', paymentMethod: 'card', accountName: 'Visa Principal', active: true, createdAt: new Date().toISOString() },
    { id: 'demo_s2', name: 'Spotify', amount: 9.99, frequency: 'monthly', nextDate: (() => { const d = new Date(); d.setDate(d.getDate() + 8); return d.toISOString().split('T')[0]; })(), categoryId: 'cat_subscriptions', paymentMethod: 'card', accountName: 'Visa Principal', active: true, createdAt: new Date().toISOString() },
    { id: 'demo_s3', name: 'Hosting Web', amount: 12, frequency: 'monthly', nextDate: (() => { const d = new Date(); d.setDate(d.getDate() + 12); return d.toISOString().split('T')[0]; })(), categoryId: 'cat_tech', paymentMethod: 'card', accountName: 'Visa Principal', active: true, createdAt: new Date().toISOString() },
    { id: 'demo_s4', name: 'Internet', amount: 60, frequency: 'monthly', nextDate: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString().split('T')[0]; })(), categoryId: 'cat_services', paymentMethod: 'bank', accountName: '', active: true, createdAt: new Date().toISOString() },
  ],
};

// ─────────────────────────────────────────────
// APP STATE
// ─────────────────────────────────────────────
const AppState = {
  currentView: 'dashboard',
  settings: null,
  charts: {},
  statsperiod: 'current',
  txFilters: { type: 'all', categoryId: '', search: '' },
  editingCategoryId: null,
};

// ─────────────────────────────────────────────
// CHARTS MANAGER
// ─────────────────────────────────────────────
const Charts = {
  instances: {},

  destroy(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  destroyAll() {
    Object.keys(this.instances).forEach(id => this.destroy(id));
  },

  baseOptions(isDark) {
    const textColor = isDark ? '#a1a1a6' : '#6e6e73';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: textColor, font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 16 } },
        tooltip: {
          backgroundColor: isDark ? '#2c2c2e' : '#fff',
          titleColor: isDark ? '#f2f2f7' : '#1c1c1e',
          bodyColor: isDark ? '#a1a1a6' : '#6e6e73',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: ctx => ` ${Utils.formatCurrency(ctx.parsed.y ?? ctx.parsed, AppState.settings?.currencySymbol || '$')}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: textColor, font: { family: 'Inter', size: 11 } }, grid: { display: false } },
        y: { ticks: { color: textColor, font: { family: 'Inter', size: 11 }, callback: v => Utils.formatCurrency(v, AppState.settings?.currencySymbol || '$') }, grid: { color: gridColor } },
      },
    };
  },

  renderDonut(canvasId, data, isDark) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const textColor = isDark ? '#a1a1a6' : '#6e6e73';
    this.instances[canvasId] = new Chart(canvas, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { position: 'right', labels: { color: textColor, font: { family: 'Inter', size: 12 }, boxWidth: 12, padding: 12, usePointStyle: true } },
          tooltip: {
            backgroundColor: isDark ? '#2c2c2e' : '#fff',
            titleColor: isDark ? '#f2f2f7' : '#1c1c1e',
            bodyColor: isDark ? '#a1a1a6' : '#6e6e73',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${Utils.formatCurrency(ctx.raw, AppState.settings?.currencySymbol || '$')}`,
            },
          },
        },
      },
    });
  },

  renderLine(canvasId, data, isDark) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const opts = this.baseOptions(isDark);
    opts.plugins.tooltip.callbacks = {
      label: ctx => ` ${ctx.dataset.label}: ${Utils.formatCurrency(ctx.parsed.y, AppState.settings?.currencySymbol || '$')}`,
    };
    this.instances[canvasId] = new Chart(canvas, { type: 'line', data, options: opts });
  },

  renderBar(canvasId, data, isDark) {
    this.destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const opts = this.baseOptions(isDark);
    opts.plugins.tooltip.callbacks = {
      label: ctx => ` ${ctx.dataset.label}: ${Utils.formatCurrency(ctx.parsed.y, AppState.settings?.currencySymbol || '$')}`,
    };
    this.instances[canvasId] = new Chart(canvas, { type: 'bar', data, options: opts });
  },
};

// ─────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────
const Theme = {
  apply(theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    Charts.destroyAll();
    return isDark;
  },

  isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  },
};

// ─────────────────────────────────────────────
// VIEWS — Dashboard
// ─────────────────────────────────────────────
function renderDashboard() {
  const settings = AppState.settings;
  const symbol = settings.currencySymbol || '$';
  const isDark = Theme.isDark();

  // Summary
  const { income, expenses, savings } = Transactions.currentMonthSummary();
  const balance = Transactions.totalBalance();
  const savingsRate = Utils.percentage(savings, income);
  const todayExp = Transactions.todayExpenses();
  const weekExp = Transactions.weekExpenses();
  const prevExp = Transactions.previousMonthExpenses();
  const dailyAvg = Transactions.dailyAverage();

  // Balance
  setText('dash-balance', Utils.formatCurrency(balance, symbol));
  setText('dash-income', Utils.formatCurrency(income, symbol));
  setText('dash-expenses', Utils.formatCurrency(expenses, symbol));
  setText('dash-savings', Utils.formatCurrency(savings, symbol));
  setText('dash-savings-rate', `${savingsRate}%`);
  setText('dash-today', Utils.formatCurrency(todayExp, symbol));
  setText('dash-week', Utils.formatCurrency(weekExp, symbol));
  setText('dash-month', Utils.formatCurrency(expenses, symbol));
  setText('dash-daily-avg', Utils.formatCurrency(dailyAvg, symbol));

  // vs Mes anterior
  const vsEl = document.getElementById('dash-vs-prev');
  if (vsEl) {
    const diff = expenses - prevExp;
    const sign = diff >= 0 ? '+' : '';
    vsEl.textContent = `${sign}${Utils.formatCurrency(Math.abs(diff), symbol)} vs mes anterior`;
    vsEl.className = `stat-compare ${diff > 0 ? 'text-danger' : diff < 0 ? 'text-success' : ''}`;
  }

  // Presupuesto general
  const budgets = Budgets.getStatusForMonth();
  const genBudget = budgets.find(b => b.budget.isGeneral);
  const budgetEl = document.getElementById('dash-budget-bar-fill');
  const budgetTextEl = document.getElementById('dash-budget-text');
  if (genBudget && budgetEl && budgetTextEl) {
    const pct = Utils.clamp(genBudget.percentage, 0, 100);
    budgetEl.style.width = pct + '%';
    budgetEl.className = 'progress-fill budget-fill-' + genBudget.status;
    budgetTextEl.textContent = `${Utils.formatCurrency(expenses, symbol)} de ${Utils.formatCurrency(genBudget.budget.amount, symbol)} (${genBudget.percentage}%)`;
  } else if (budgetEl) {
    budgetEl.style.width = '0%';
    if (budgetTextEl) budgetTextEl.textContent = 'Sin presupuesto configurado';
  }

  // Actividad reciente
  const recentEl = document.getElementById('dash-recent');
  if (recentEl) {
    const recent = Transactions.getAll().slice(0, 8);
    const categories = Categories.getAll();
    recentEl.innerHTML = recent.length
      ? recent.map(tx => Transactions.renderItem(tx, categories, settings)).join('')
      : UI.emptyState('📭', 'Sin movimientos recientes', 'Registra tu primer gasto o ingreso');
  }

  // Próximas suscripciones (dashboard)
  const upcomingEl = document.getElementById('dash-upcoming');
  if (upcomingEl) {
    const upcoming = Subscriptions.upcoming(30).slice(0, 4);
    const categories = Categories.getAll();
    if (upcoming.length) {
      upcomingEl.innerHTML = upcoming.map(sub => {
        const cat = categories.find(c => c.id === sub.categoryId);
        const days = Subscriptions.daysUntilNext(sub);
        const daysLabel = days <= 0 ? 'Hoy' : days === 1 ? 'Mañana' : `${days}d`;
        return `<div class="upcoming-item">
          <span class="upcoming-icon" style="background:${cat?.color || '#AEB6BF'}20;color:${cat?.color || '#AEB6BF'}">${cat?.icon || '📱'}</span>
          <span class="upcoming-name">${sub.name}</span>
          <span class="upcoming-days ${days <= 3 ? 'urgent' : ''}">${daysLabel}</span>
          <span class="upcoming-amount">${Utils.formatCurrency(sub.amount, symbol)}</span>
        </div>`;
      }).join('');
    } else {
      upcomingEl.innerHTML = '<p class="text-muted" style="font-size:0.85rem;text-align:center">Sin pagos próximos</p>';
    }
  }

  // Insights
  const insightsEl = document.getElementById('dash-insights');
  if (insightsEl) {
    const insights = Statistics.getInsights();
    insightsEl.innerHTML = insights.length
      ? insights.map(i => `<div class="insight-item insight-${i.type}"><span>${i.icon}</span><p>${i.text}</p></div>`).join('')
      : '<p class="text-muted" style="font-size:0.85rem">Añade más datos para ver insights.</p>';
  }

  // Charts
  const monthData = Transactions.expensesByMonth(6);
  const { txs } = Transactions.currentMonthSummary();
  const catChartData = Statistics.getCategoryChartData(txs, 'expense');
  const evoChartData = Statistics.getEvolutionChartData(monthData);

  if (catChartData.labels.length > 0) {
    Charts.renderDonut('chart-category', catChartData, isDark);
  } else {
    const canvas = document.getElementById('chart-category');
    if (canvas) canvas.parentElement.innerHTML = UI.emptyState('📊', 'Sin datos', 'Registra gastos para ver el gráfico');
  }
  Charts.renderLine('chart-evolution', evoChartData, isDark);
}

// ─────────────────────────────────────────────
// VIEWS — Transactions
// ─────────────────────────────────────────────
function renderTransactions() {
  const settings = AppState.settings;
  const categories = Categories.getAll();
  const filters = AppState.txFilters;
  const list = Transactions.getFiltered(filters);

  // Category filter options
  const catFilter = document.getElementById('tx-filter-cat');
  if (catFilter) {
    catFilter.innerHTML = '<option value="">Todas las categorías</option>' +
      categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
    catFilter.value = filters.categoryId || '';
  }

  const container = document.getElementById('tx-list');
  if (container) {
    container.innerHTML = list.length
      ? Transactions.renderGrouped(list, categories, settings)
      : UI.emptyState('📭', 'Sin movimientos', 'Usa el botón + para añadir tu primer movimiento');
  }

  // Count
  setText('tx-count', `${list.length} movimiento${list.length !== 1 ? 's' : ''}`);
}

// ─────────────────────────────────────────────
// VIEWS — Budgets
// ─────────────────────────────────────────────
function renderBudgets() {
  const settings = AppState.settings;
  const items = Budgets.getStatusForMonth();
  const container = document.getElementById('budgets-list');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = UI.emptyState('📊', 'Sin presupuestos', 'Crea un presupuesto para controlar tus gastos');
    return;
  }

  // General first, then by category
  const sorted = [
    ...items.filter(i => i.budget.isGeneral),
    ...items.filter(i => !i.budget.isGeneral),
  ];
  container.innerHTML = sorted.map(item => Budgets.renderCard(item, settings)).join('');
}

// ─────────────────────────────────────────────
// VIEWS — Goals
// ─────────────────────────────────────────────
function renderGoals() {
  const settings = AppState.settings;
  const goals = Goals.getAll();
  const container = document.getElementById('goals-list');
  if (!container) return;
  container.innerHTML = goals.length
    ? goals.map(g => Goals.renderCard(g, settings)).join('')
    : UI.emptyState('🎯', 'Sin metas', 'Crea tu primera meta de ahorro');
}

// ─────────────────────────────────────────────
// VIEWS — Subscriptions
// ─────────────────────────────────────────────
function renderSubscriptions() {
  const settings = AppState.settings;
  const symbol = settings.currencySymbol || '$';
  const categories = Categories.getAll();
  const subs = Subscriptions.getAll();

  const container = document.getElementById('subs-list');
  if (container) {
    container.innerHTML = subs.length
      ? subs.map(s => Subscriptions.renderCard(s, categories, settings)).join('')
      : UI.emptyState('🔔', 'Sin suscripciones', 'Registra tus pagos recurrentes');
  }

  setText('subs-monthly-total', Utils.formatCurrency(Subscriptions.monthlyTotal(), symbol));
  setText('subs-yearly-total', Utils.formatCurrency(Subscriptions.yearlyTotal(), symbol));
}

// ─────────────────────────────────────────────
// VIEWS — Statistics
// ─────────────────────────────────────────────
function renderStatistics() {
  const settings = AppState.settings;
  const symbol = settings.currencySymbol || '$';
  const isDark = Theme.isDark();
  const period = AppState.statsPeriod || 'current';
  const summary = Statistics.getSummary(period);

  setText('stats-total-income', Utils.formatCurrency(summary.income, symbol));
  setText('stats-total-expenses', Utils.formatCurrency(summary.expenses, symbol));
  setText('stats-total-savings', Utils.formatCurrency(summary.savings, symbol));
  setText('stats-savings-rate', `${summary.savingsRate}%`);
  setText('stats-daily-avg', Utils.formatCurrency(summary.dailyAvg, symbol));
  setText('stats-top-cat', summary.topCat ? `${summary.topCat.icon} ${summary.topCat.name}` : '—');

  // Charts
  const catData = Statistics.getCategoryChartData(summary.txs, 'expense');
  if (catData.labels.length > 0) {
    Charts.renderDonut('stats-chart-cat', catData, isDark);
  }
  const evoData = Statistics.getEvolutionChartData(summary.monthlyData);
  Charts.renderBar('stats-chart-evo', evoData, isDark);
}

// ─────────────────────────────────────────────
// VIEWS — Categories
// ─────────────────────────────────────────────
function renderCategories() {
  const cats = Categories.getAll();
  const expenseCats = cats.filter(c => c.type === 'expense');
  const incomeCats = cats.filter(c => c.type === 'income');

  renderCatList('cats-expense-list', expenseCats);
  renderCatList('cats-income-list', incomeCats);
}

function renderCatList(containerId, cats) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (cats.length === 0) {
    container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;padding:8px 0">Sin categorías</p>';
    return;
  }
  container.innerHTML = cats.map(cat => `
    <div class="cat-item" data-id="${cat.id}">
      <div class="cat-icon" style="background:${cat.color}20;color:${cat.color}">${cat.icon}</div>
      <span class="cat-name">${cat.name}</span>
      <div class="cat-actions">
        <button class="btn-icon" data-action="edit-cat" data-id="${cat.id}" title="Editar">✏️</button>
        ${!cat.isDefault ? `<button class="btn-icon" data-action="delete-cat" data-id="${cat.id}" title="Eliminar">🗑️</button>` : ''}
      </div>
    </div>
  `).join('');
}

// ─────────────────────────────────────────────
// VIEWS — Settings
// ─────────────────────────────────────────────
function renderSettings() {
  const settings = AppState.settings;
  const themeSelect = document.getElementById('settings-theme');
  const currencySelect = document.getElementById('settings-currency');
  const dateFormatSelect = document.getElementById('settings-date-format');

  if (themeSelect) themeSelect.value = settings.theme || 'auto';
  if (currencySelect) currencySelect.value = settings.currency || 'USD';
  if (dateFormatSelect) dateFormatSelect.value = settings.dateFormat || 'DD/MM/YYYY';

  // Stats
  const txCount = Storage.getList(Storage.KEYS.TRANSACTIONS).length;
  const catCount = Storage.getList(Storage.KEYS.CATEGORIES).length;
  setText('settings-tx-count', txCount);
  setText('settings-cat-count', catCount);
}

// ─────────────────────────────────────────────
// ROUTING
// ─────────────────────────────────────────────
function navigate(view) {
  AppState.currentView = view;
  UI.showView(view + '-view');
  UI.setActiveNav(view);
  window.location.hash = view;

  // Render the active view
  switch (view) {
    case 'dashboard': renderDashboard(); break;
    case 'transactions': renderTransactions(); break;
    case 'budgets': renderBudgets(); break;
    case 'goals': renderGoals(); break;
    case 'subscriptions': renderSubscriptions(); break;
    case 'statistics': renderStatistics(); break;
    case 'categories': renderCategories(); break;
    case 'settings': renderSettings(); break;
  }
}

function refreshCurrentView() {
  navigate(AppState.currentView);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

// ─────────────────────────────────────────────
// QUICK ADD FORM HANDLER
// ─────────────────────────────────────────────
function handleQuickAddSubmit(e) {
  e.preventDefault();
  UI.clearFieldErrors('quick-add-form');

  const form = document.getElementById('quick-add-form');
  const editId = document.getElementById('qa-edit-id').value;
  const data = {
    type: document.getElementById('qa-type').value,
    amount: document.getElementById('qa-amount').value,
    description: document.getElementById('qa-description').value,
    categoryId: document.getElementById('qa-category').value,
    date: document.getElementById('qa-date').value,
    paymentMethod: document.getElementById('qa-payment').value,
    accountName: document.getElementById('qa-account').value,
    note: document.getElementById('qa-note').value,
  };

  try {
    if (editId) {
      Transactions.update(editId, data);
      UI.toast('Movimiento actualizado', 'success');
    } else {
      Transactions.create(data);
      UI.toast(`${data.type === 'income' ? 'Ingreso' : 'Gasto'} registrado`, 'success');
    }
    UI.closeModal('quick-add-modal');
    form.reset();
    refreshCurrentView();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// BUDGET FORM HANDLER
// ─────────────────────────────────────────────
function handleBudgetSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('budget-edit-id').value;
  const data = {
    name: document.getElementById('budget-name').value,
    amount: document.getElementById('budget-amount').value,
    categoryId: document.getElementById('budget-category').value || null,
    month: document.getElementById('budget-month').value || Utils.currentMonth(),
    isGeneral: document.getElementById('budget-general')?.checked || false,
  };

  try {
    if (editId) {
      Budgets.update(editId, data);
      UI.toast('Presupuesto actualizado', 'success');
    } else {
      Budgets.create(data);
      UI.toast('Presupuesto creado', 'success');
    }
    UI.closeModal('budget-modal');
    renderBudgets();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// GOAL FORM HANDLER
// ─────────────────────────────────────────────
function handleGoalSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('goal-edit-id').value;
  const data = {
    name: document.getElementById('goal-name').value,
    targetAmount: document.getElementById('goal-target').value,
    currentAmount: document.getElementById('goal-current').value,
    targetDate: document.getElementById('goal-date').value,
    color: document.getElementById('goal-color').value,
    icon: document.getElementById('goal-icon-selected').value || '🎯',
  };

  try {
    if (editId) {
      Goals.update(editId, data);
      UI.toast('Meta actualizada', 'success');
    } else {
      Goals.create(data);
      UI.toast('Meta creada', 'success');
    }
    UI.closeModal('goal-modal');
    renderGoals();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// SUBSCRIPTION FORM HANDLER
// ─────────────────────────────────────────────
function handleSubSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('sub-edit-id').value;
  const data = {
    name: document.getElementById('sub-name').value,
    amount: document.getElementById('sub-amount').value,
    frequency: document.getElementById('sub-frequency').value,
    nextDate: document.getElementById('sub-next-date').value,
    categoryId: document.getElementById('sub-category').value,
    paymentMethod: document.getElementById('sub-payment').value,
    accountName: document.getElementById('sub-account').value,
  };

  try {
    if (editId) {
      Subscriptions.update(editId, data);
      UI.toast('Suscripción actualizada', 'success');
    } else {
      Subscriptions.create(data);
      UI.toast('Suscripción creada', 'success');
    }
    UI.closeModal('sub-modal');
    renderSubscriptions();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// CATEGORY FORM HANDLER
// ─────────────────────────────────────────────
function handleCatSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById('cat-edit-id').value;
  const data = {
    name: document.getElementById('cat-name').value,
    icon: document.getElementById('cat-icon-selected').value || '📦',
    color: document.getElementById('cat-color').value,
    type: document.getElementById('cat-type').value,
  };

  try {
    if (editId) {
      Categories.update(editId, data);
      UI.toast('Categoría actualizada', 'success');
    } else {
      Categories.create(data);
      UI.toast('Categoría creada', 'success');
    }
    UI.closeModal('cat-modal');
    renderCategories();
  } catch (err) {
    UI.toast(err.message, 'error');
  }
}

// ─────────────────────────────────────────────
// OPEN FORMS (pre-fill for edit)
// ─────────────────────────────────────────────
function openBudgetModal(editId = null) {
  document.getElementById('budget-edit-id').value = editId || '';
  UI.buildCategoryOptions('budget-category', 'expense', '');
  document.getElementById('budget-month').value = Utils.currentMonth();
  const genCheckbox = document.getElementById('budget-general');

  if (editId) {
    const b = Budgets.getById(editId);
    if (b) {
      document.getElementById('budget-name').value = b.name;
      document.getElementById('budget-amount').value = b.amount;
      document.getElementById('budget-month').value = b.month;
      if (genCheckbox) genCheckbox.checked = b.isGeneral;
      setTimeout(() => UI.buildCategoryOptions('budget-category', 'expense', b.categoryId || ''), 0);
    }
    document.getElementById('budget-modal-title').textContent = 'Editar Presupuesto';
  } else {
    document.getElementById('budget-modal-title').textContent = 'Nuevo Presupuesto';
    document.getElementById('budget-name').value = '';
    document.getElementById('budget-amount').value = '';
    if (genCheckbox) genCheckbox.checked = false;
  }
  UI.openModal('budget-modal');
}

function openGoalModal(editId = null) {
  document.getElementById('goal-edit-id').value = editId || '';
  document.getElementById('goal-icon-selected').value = '🎯';
  UI.renderIconPicker('goal-icon-picker', '🎯', icon => {
    document.getElementById('goal-icon-selected').value = icon;
  });

  if (editId) {
    const g = Goals.getById(editId);
    if (g) {
      document.getElementById('goal-name').value = g.name;
      document.getElementById('goal-target').value = g.targetAmount;
      document.getElementById('goal-current').value = g.currentAmount;
      document.getElementById('goal-date').value = g.targetDate || '';
      document.getElementById('goal-color').value = g.color || '#0A84FF';
      document.getElementById('goal-icon-selected').value = g.icon || '🎯';
      UI.renderIconPicker('goal-icon-picker', g.icon, icon => {
        document.getElementById('goal-icon-selected').value = icon;
      });
    }
    document.getElementById('goal-modal-title').textContent = 'Editar Meta';
  } else {
    document.getElementById('goal-modal-title').textContent = 'Nueva Meta';
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('goal-current').value = '0';
    document.getElementById('goal-date').value = '';
    document.getElementById('goal-color').value = '#0A84FF';
  }
  UI.openModal('goal-modal');
}

function openAddToGoalModal(goalId) {
  const goal = Goals.getById(goalId);
  if (!goal) return;
  document.getElementById('add-goal-id').value = goalId;
  document.getElementById('add-goal-name').textContent = goal.name;
  document.getElementById('add-goal-amount').value = '';
  UI.openModal('add-goal-modal');
}

function openSubModal(editId = null) {
  document.getElementById('sub-edit-id').value = editId || '';
  UI.buildCategoryOptions('sub-category', 'expense', 'cat_subscriptions');
  UI.buildPaymentOptions('sub-payment', 'card');
  document.getElementById('sub-next-date').value = Utils.todayStr();

  if (editId) {
    const s = Subscriptions.getById(editId);
    if (s) {
      document.getElementById('sub-name').value = s.name;
      document.getElementById('sub-amount').value = s.amount;
      document.getElementById('sub-frequency').value = s.frequency;
      document.getElementById('sub-next-date').value = s.nextDate || Utils.todayStr();
      document.getElementById('sub-account').value = s.accountName || '';
      setTimeout(() => {
        UI.buildCategoryOptions('sub-category', 'expense', s.categoryId);
        UI.buildPaymentOptions('sub-payment', s.paymentMethod);
      }, 0);
    }
    document.getElementById('sub-modal-title').textContent = 'Editar Suscripción';
  } else {
    document.getElementById('sub-modal-title').textContent = 'Nueva Suscripción';
    document.getElementById('sub-name').value = '';
    document.getElementById('sub-amount').value = '';
    document.getElementById('sub-frequency').value = 'monthly';
    document.getElementById('sub-account').value = '';
  }
  UI.openModal('sub-modal');
}

function openCatModal(editId = null) {
  document.getElementById('cat-edit-id').value = editId || '';
  document.getElementById('cat-icon-selected').value = '📦';
  UI.renderIconPicker('cat-icon-picker', '📦', icon => {
    document.getElementById('cat-icon-selected').value = icon;
  });

  if (editId) {
    const cat = Categories.getById(editId);
    if (cat) {
      document.getElementById('cat-name').value = cat.name;
      document.getElementById('cat-color').value = cat.color;
      document.getElementById('cat-type').value = cat.type;
      document.getElementById('cat-icon-selected').value = cat.icon;
      UI.renderIconPicker('cat-icon-picker', cat.icon, icon => {
        document.getElementById('cat-icon-selected').value = icon;
      });
    }
    document.getElementById('cat-modal-title').textContent = 'Editar Categoría';
  } else {
    document.getElementById('cat-modal-title').textContent = 'Nueva Categoría';
    document.getElementById('cat-name').value = '';
    document.getElementById('cat-color').value = '#0A84FF';
    document.getElementById('cat-type').value = 'expense';
  }
  UI.openModal('cat-modal');
}

// ─────────────────────────────────────────────
// GLOBAL DELEGATION — clicks en listas
// ─────────────────────────────────────────────
function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  switch (action) {
    // Transactions
    case 'edit': {
      const tx = Transactions.getById(id);
      if (tx) UI.openQuickAdd(tx.type, tx);
      break;
    }
    case 'delete': {
      UI.confirm('¿Eliminar este movimiento?', () => {
        Transactions.delete(id);
        UI.toast('Movimiento eliminado', 'success');
        refreshCurrentView();
      });
      break;
    }
    // Budgets
    case 'edit-budget': openBudgetModal(id); break;
    case 'delete-budget': {
      UI.confirm('¿Eliminar este presupuesto?', () => {
        Budgets.delete(id);
        UI.toast('Presupuesto eliminado', 'success');
        renderBudgets();
      });
      break;
    }
    // Goals
    case 'edit-goal': openGoalModal(id); break;
    case 'add-to-goal': openAddToGoalModal(id); break;
    case 'delete-goal': {
      UI.confirm('¿Eliminar esta meta?', () => {
        Goals.delete(id);
        UI.toast('Meta eliminada', 'success');
        renderGoals();
      });
      break;
    }
    // Subscriptions
    case 'edit-sub': openSubModal(id); break;
    case 'delete-sub': {
      UI.confirm('¿Eliminar esta suscripción?', () => {
        Subscriptions.delete(id);
        UI.toast('Suscripción eliminada', 'success');
        renderSubscriptions();
      });
      break;
    }
    // Categories
    case 'edit-cat': openCatModal(id); break;
    case 'delete-cat': {
      UI.confirm('¿Eliminar esta categoría?', () => {
        Categories.delete(id);
        UI.toast('Categoría eliminada', 'success');
        renderCategories();
      });
      break;
    }
  }
}

// ─────────────────────────────────────────────
// IMPORT / EXPORT / CLEAR
// ─────────────────────────────────────────────
function exportData() {
  const data = Storage.exportAll();
  Utils.downloadJSON(data, `finanzas-backup-${Utils.todayStr()}.json`);
  UI.toast('Datos exportados correctamente', 'success');
}

async function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await Utils.readJSONFile(file);
      UI.confirm('¿Sobrescribir todos los datos actuales con el archivo importado? Esta acción no se puede deshacer.', () => {
        Storage.importAll(data);
        AppState.settings = Storage.getSettings();
        Theme.apply(AppState.settings.theme);
        UI.toast('Datos importados correctamente', 'success');
        refreshCurrentView();
      });
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  };
  input.click();
}

function clearAllData() {
  UI.confirm('¿Borrar TODOS los datos? Esta acción es irreversible.', () => {
    UI.confirm('Confirma de nuevo: ¿Estás seguro de borrar todo?', () => {
      Storage.clearAll();
      Categories.initDefaults();
      Storage.markInitialized();
      AppState.settings = Storage.getSettings();
      UI.toast('Todos los datos eliminados', 'success');
      navigate('dashboard');
    });
  });
}

function loadDemoData() {
  UI.confirm('¿Cargar datos de demostración? Esto añadirá transacciones, presupuestos y metas de ejemplo.', () => {
    // Keep existing categories, just add transactions/budgets/goals/subs
    const existingTxs = Storage.getList(Storage.KEYS.TRANSACTIONS);
    const demoIds = DEMO_DATA.transactions.map(t => t.id);
    const hasDemo = existingTxs.some(t => demoIds.includes(t.id));
    if (hasDemo) {
      UI.toast('Los datos de demo ya están cargados', 'warning');
      return;
    }
    Storage.saveData(Storage.KEYS.TRANSACTIONS, [...existingTxs, ...DEMO_DATA.transactions]);
    Storage.saveData(Storage.KEYS.BUDGETS, [...Storage.getList(Storage.KEYS.BUDGETS), ...DEMO_DATA.budgets]);
    Storage.saveData(Storage.KEYS.GOALS, [...Storage.getList(Storage.KEYS.GOALS), ...DEMO_DATA.goals]);
    Storage.saveData(Storage.KEYS.SUBSCRIPTIONS, [...Storage.getList(Storage.KEYS.SUBSCRIPTIONS), ...DEMO_DATA.subscriptions]);
    UI.toast('Datos de demostración cargados', 'success');
    navigate('dashboard');
  });
}

// ─────────────────────────────────────────────
// EVENT LISTENERS SETUP
// ─────────────────────────────────────────────
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.nav));
  });

  // FAB + quick add
  document.getElementById('fab-btn')?.addEventListener('click', () => UI.openQuickAdd('expense'));
  document.getElementById('fab-income-btn')?.addEventListener('click', () => UI.openQuickAdd('income'));

  // Type toggle in quick add
  document.querySelectorAll('.type-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      document.getElementById('qa-type').value = type;
      UI.buildCategoryOptions('qa-category', type);
    });
  });

  // Quick add form
  document.getElementById('quick-add-form')?.addEventListener('submit', handleQuickAddSubmit);

  // Budget form
  document.getElementById('budget-form')?.addEventListener('submit', handleBudgetSubmit);
  document.getElementById('new-budget-btn')?.addEventListener('click', () => openBudgetModal());

  // Goal form
  document.getElementById('goal-form')?.addEventListener('submit', handleGoalSubmit);
  document.getElementById('new-goal-btn')?.addEventListener('click', () => openGoalModal());

  // Add to goal form
  document.getElementById('add-goal-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const goalId = document.getElementById('add-goal-id').value;
    const amount = document.getElementById('add-goal-amount').value;
    if (!Utils.isValidAmount(amount)) {
      UI.toast('Ingresa un monto válido', 'error');
      return;
    }
    Goals.addAmount(goalId, parseFloat(amount));
    UI.closeModal('add-goal-modal');
    UI.toast('Monto añadido a la meta', 'success');
    renderGoals();
  });

  // Subscription form
  document.getElementById('sub-form')?.addEventListener('submit', handleSubSubmit);
  document.getElementById('new-sub-btn')?.addEventListener('click', () => openSubModal());

  // Category form
  document.getElementById('cat-form')?.addEventListener('submit', handleCatSubmit);
  document.getElementById('new-cat-btn')?.addEventListener('click', () => openCatModal());

  // Settings
  document.getElementById('settings-theme')?.addEventListener('change', e => {
    const theme = e.target.value;
    Storage.saveSettings({ theme });
    AppState.settings = Storage.getSettings();
    Theme.apply(theme);
  });

  document.getElementById('settings-currency')?.addEventListener('change', e => {
    const currency = e.target.value;
    const symbols = { USD: '$', EUR: '€', GBP: '£', MXN: '$', CRC: '₡', COP: '$', ARS: '$', JPY: '¥' };
    Storage.saveSettings({ currency, currencySymbol: symbols[currency] || '$' });
    AppState.settings = Storage.getSettings();
    UI.toast('Moneda actualizada', 'success');
  });

  document.getElementById('settings-date-format')?.addEventListener('change', e => {
    Storage.saveSettings({ dateFormat: e.target.value });
    AppState.settings = Storage.getSettings();
  });

  document.getElementById('export-btn')?.addEventListener('click', exportData);
  document.getElementById('import-btn')?.addEventListener('click', importData);
  document.getElementById('clear-btn')?.addEventListener('click', clearAllData);
  document.getElementById('demo-btn')?.addEventListener('click', loadDemoData);
  document.getElementById('settings-demo-btn')?.addEventListener('click', loadDemoData);

  // Transaction filters
  document.getElementById('tx-search')?.addEventListener('input', e => {
    AppState.txFilters.search = e.target.value;
    renderTransactions();
  });
  document.getElementById('tx-filter-type')?.addEventListener('change', e => {
    AppState.txFilters.type = e.target.value;
    renderTransactions();
  });
  document.getElementById('tx-filter-cat')?.addEventListener('change', e => {
    AppState.txFilters.categoryId = e.target.value;
    renderTransactions();
  });

  // Stats period
  document.getElementById('stats-period')?.addEventListener('change', e => {
    AppState.statsPeriod = e.target.value;
    renderStatistics();
  });

  // Global list delegation
  document.body.addEventListener('click', handleListClick);

  // Close modals on backdrop click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) UI.closeModal(modal.id);
    });
  });

  // Close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => UI.closeModal(btn.dataset.closeModal));
  });

  // Keyboard: Escape closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') UI.closeAllModals();
  });

  // System theme change
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (AppState.settings?.theme === 'auto') {
      Theme.apply('auto');
      refreshCurrentView();
    }
  });

  // PWA install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if (installBtn) installBtn.style.display = 'flex';
  });
  document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') UI.toast('App instalada', 'success');
    deferredPrompt = null;
    document.getElementById('install-btn').style.display = 'none';
  });
}

// ─────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────
function init() {
  // Init categories defaults
  Categories.initDefaults();

  // Load settings
  AppState.settings = Storage.getSettings();

  // Apply theme
  Theme.apply(AppState.settings.theme);

  // Mark as initialized
  if (Storage.isFirstRun()) {
    Storage.markInitialized();
  }

  // Setup all event listeners
  setupEventListeners();

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('SW registration failed:', err);
    });
  }

  // Navigate to initial view from hash or default
  const hash = window.location.hash.replace('#', '');
  const validViews = ['dashboard', 'transactions', 'budgets', 'goals', 'subscriptions', 'statistics', 'categories', 'settings'];
  navigate(validViews.includes(hash) ? hash : 'dashboard');
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
