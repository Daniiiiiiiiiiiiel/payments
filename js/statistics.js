/**
 * statistics.js — Cálculos estadísticos y generación de insights
 */

const Statistics = {
  /**
   * Obtiene un resumen estadístico para un período dado.
   * period: 'current' | 'previous' | '3m' | '6m' | 'year' | { start, end }
   */
  getSummary(period = 'current') {
    const all = Storage.getList(Storage.KEYS.TRANSACTIONS);
    const { start, end } = this.getPeriodRange(period);
    const txs = Utils.filterByDateRange(all, start, end);
    const expenses = Utils.sumExpenses(txs);
    const income = Utils.sumIncome(txs);
    const savings = income - expenses;
    const savingsRate = Utils.percentage(savings, income);

    // Categoría con mayor gasto
    const byCat = Utils.groupByCategory(txs, 'expense');
    const topCatId = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topCat = topCatId ? Categories.getById(topCatId) : null;

    // Promedio diario
    const days = this.daysBetween(start, end);
    const dailyAvg = days > 0 ? expenses / days : 0;

    // Datos mensuales para gráfico
    const monthlyData = this.getMonthlyData(period);

    return { start, end, txs, expenses, income, savings, savingsRate, topCat, topCatId, byCat, dailyAvg, monthlyData };
  },

  /** Obtiene rango de fechas para un período */
  getPeriodRange(period) {
    const today = Utils.todayStr();
    const currentMonth = Utils.currentMonth();
    if (typeof period === 'object' && period.start) return period;
    switch (period) {
      case 'current': return Utils.monthRange(currentMonth);
      case 'previous': return Utils.monthRange(Utils.previousMonth(currentMonth));
      case '3m': {
        const months = Utils.lastNMonths(3);
        return { start: Utils.monthRange(months[0]).start, end: Utils.monthRange(months[months.length - 1]).end };
      }
      case '6m': {
        const months = Utils.lastNMonths(6);
        return { start: Utils.monthRange(months[0]).start, end: Utils.monthRange(months[months.length - 1]).end };
      }
      case 'year': {
        const y = new Date().getFullYear();
        return { start: `${y}-01-01`, end: `${y}-12-31` };
      }
      default: return Utils.monthRange(currentMonth);
    }
  },

  /** Número de días entre dos fechas */
  daysBetween(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    return Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1);
  },

  /** Obtiene datos mensuales para gráfico según el período */
  getMonthlyData(period) {
    let n = 6;
    if (period === 'current' || period === 'previous') n = 1;
    else if (period === '3m') n = 3;
    else if (period === '6m') n = 6;
    else if (period === 'year') n = 12;
    return Transactions.expensesByMonth(n);
  },

  /** Genera insights automáticos a partir de los datos locales */
  getInsights() {
    const insights = [];
    const settings = Storage.getSettings();
    const symbol = settings.currencySymbol || '$';
    const all = Storage.getList(Storage.KEYS.TRANSACTIONS);
    const currentMonth = Utils.currentMonth();
    const prevMonth = Utils.previousMonth(currentMonth);

    // Datos mes actual
    const { start: cs, end: ce } = Utils.monthRange(currentMonth);
    const currentTxs = Utils.filterByDateRange(all, cs, ce);
    const currentExpenses = Utils.sumExpenses(currentTxs);
    const currentIncome = Utils.sumIncome(currentTxs);

    // Datos mes anterior
    const { start: ps, end: pe } = Utils.monthRange(prevMonth);
    const prevTxs = Utils.filterByDateRange(all, ps, pe);
    const prevExpenses = Utils.sumExpenses(prevTxs);

    // Comparación gastos vs mes anterior
    if (prevExpenses > 0 && currentExpenses > 0) {
      const diff = currentExpenses - prevExpenses;
      if (diff > 0) {
        insights.push({
          type: 'warning',
          icon: '📈',
          text: `Este mes gastaste ${Utils.formatCurrency(diff, symbol)} más que el mes anterior.`,
        });
      } else if (diff < 0) {
        insights.push({
          type: 'positive',
          icon: '📉',
          text: `Este mes gastaste ${Utils.formatCurrency(Math.abs(diff), symbol)} menos que el mes anterior. ¡Buen trabajo!`,
        });
      }
    }

    // Gasto por categoría
    const byCat = Utils.groupByCategory(currentTxs, 'expense');
    const topEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
    if (topEntry && currentExpenses > 0) {
      const cat = Categories.getById(topEntry[0]);
      const pct = Utils.percentage(topEntry[1], currentExpenses);
      if (cat) {
        insights.push({
          type: 'info',
          icon: cat.icon,
          text: `${cat.name} representa el ${pct}% de tus gastos este mes.`,
        });
      }
    }

    // Presupuesto mensual
    const budgets = Budgets.getStatusForMonth(currentMonth);
    const generalBudget = budgets.find(b => b.budget.isGeneral);
    if (generalBudget) {
      const { percentage, status } = generalBudget;
      if (status === 'over') {
        insights.push({ type: 'danger', icon: '🚨', text: `Has superado tu presupuesto mensual en ${100 - percentage}%.` });
      } else if (status === 'warning') {
        insights.push({ type: 'warning', icon: '⚠️', text: `Llevas gastado el ${percentage}% de tu presupuesto mensual.` });
      } else {
        insights.push({ type: 'info', icon: '📊', text: `Llevas gastado el ${percentage}% de tu presupuesto mensual.` });
      }
    }

    // Promedio diario
    const dayOfMonth = new Date().getDate();
    const dailyAvg = dayOfMonth > 0 ? currentExpenses / dayOfMonth : 0;
    if (dailyAvg > 0) {
      insights.push({
        type: 'info',
        icon: '📅',
        text: `Tu gasto promedio diario este mes es de ${Utils.formatCurrency(dailyAvg, symbol)}.`,
      });
    }

    // Tasa de ahorro
    if (currentIncome > 0) {
      const savings = currentIncome - currentExpenses;
      const rate = Utils.percentage(savings, currentIncome);
      if (rate > 0) {
        insights.push({ type: 'positive', icon: '💰', text: `Estás ahorrando el ${rate}% de tus ingresos este mes.` });
      } else {
        insights.push({ type: 'danger', icon: '💸', text: `Tus gastos superan tus ingresos este mes.` });
      }
    }

    // Suscripciones próximas
    const upcoming = Subscriptions.upcoming(7);
    if (upcoming.length > 0) {
      const total = upcoming.reduce((s, sub) => s + sub.amount, 0);
      insights.push({
        type: 'info',
        icon: '🔔',
        text: `Tienes ${upcoming.length} suscripción${upcoming.length > 1 ? 'es' : ''} por cobrar en los próximos 7 días (${Utils.formatCurrency(total, symbol)} total).`,
      });
    }

    return insights.slice(0, 5); // máximo 5 insights
  },

  /** Prepara datos para Chart.js - donut de categorías */
  getCategoryChartData(txs, type = 'expense') {
    const categories = Categories.getAll();
    const byCat = Utils.groupByCategory(txs, type);
    const sorted = Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return {
      labels: sorted.map(([id]) => categories.find(c => c.id === id)?.name || 'Otro'),
      datasets: [{
        data: sorted.map(([, v]) => parseFloat(v.toFixed(2))),
        backgroundColor: sorted.map(([id]) => categories.find(c => c.id === id)?.color || '#AEB6BF'),
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };
  },

  /** Prepara datos para Chart.js - línea de evolución mensual */
  getEvolutionChartData(monthlyData) {
    return {
      labels: monthlyData.map(d => d.label),
      datasets: [
        {
          label: 'Gastos',
          data: monthlyData.map(d => parseFloat(d.expenses.toFixed(2))),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#FF6B6B',
          pointRadius: 4,
        },
        {
          label: 'Ingresos',
          data: monthlyData.map(d => parseFloat(d.income.toFixed(2))),
          borderColor: '#0A84FF',
          backgroundColor: 'rgba(10, 132, 255, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#0A84FF',
          pointRadius: 4,
        },
      ],
    };
  },
};
