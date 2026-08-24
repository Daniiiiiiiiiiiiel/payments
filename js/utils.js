/**
 * utils.js — Funciones de utilidad general
 */

const Utils = {
  /** Genera un ID único simple */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  },

  /** Formatea un número como moneda */
  formatCurrency(amount, symbol = '$') {
    const num = parseFloat(amount) || 0;
    return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  /** Formatea una fecha según el formato configurado */
  formatDate(dateStr, format = 'DD/MM/YYYY') {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    switch (format) {
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'D MMM': return `${d.getDate()} ${months[d.getMonth()]}`;
      case 'MMM D': return `${months[d.getMonth()]} ${d.getDate()}`;
      default: return `${day}/${month}/${year}`;
    }
  },

  /** Fecha relativa: "Hoy", "Ayer", o la fecha formateada */
  formatRelativeDate(dateStr) {
    if (!dateStr) return '';
    const today = this.todayStr();
    const yesterday = this.offsetDateStr(today, -1);
    if (dateStr === today) return 'Hoy';
    if (dateStr === yesterday) return 'Ayer';
    return this.formatDate(dateStr, 'D MMM');
  },

  /** Devuelve la fecha de hoy como string YYYY-MM-DD */
  todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  /** Desplaza una fecha YYYY-MM-DD por N días */
  offsetDateStr(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  /** Devuelve el mes actual como YYYY-MM */
  currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  /** Devuelve el mes anterior como YYYY-MM */
  previousMonth(monthStr) {
    const [y, m] = (monthStr || this.currentMonth()).split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  },

  /** Nombre largo de un mes YYYY-MM */
  monthName(monthStr) {
    const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    if (!monthStr) return '';
    const m = parseInt(monthStr.split('-')[1]) - 1;
    const y = monthStr.split('-')[0];
    return `${names[m]} ${y}`;
  },

  /** Nombre corto de un mes YYYY-MM */
  monthShortName(monthStr) {
    const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    if (!monthStr) return '';
    const m = parseInt(monthStr.split('-')[1]) - 1;
    return names[m];
  },

  /** Obtiene el rango de fechas del mes actual */
  currentMonthRange() {
    const month = this.currentMonth();
    return this.monthRange(month);
  },

  /** Rango de fechas de un mes YYYY-MM */
  monthRange(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  },

  /** Filtra transacciones por rango de fechas */
  filterByDateRange(transactions, start, end) {
    return transactions.filter(t => t.date >= start && t.date <= end);
  },

  /** Filtra transacciones del mes actual */
  currentMonthTransactions(transactions) {
    const { start, end } = this.currentMonthRange();
    return this.filterByDateRange(transactions, start, end);
  },

  /** Suma los gastos de un array de transacciones */
  sumExpenses(transactions) {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  },

  /** Suma los ingresos de un array de transacciones */
  sumIncome(transactions) {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  },

  /** Agrupa transacciones por categoría y devuelve { categoryId: total } */
  groupByCategory(transactions, type = 'expense') {
    const result = {};
    transactions
      .filter(t => t.type === type)
      .forEach(t => {
        result[t.categoryId] = (result[t.categoryId] || 0) + (parseFloat(t.amount) || 0);
      });
    return result;
  },

  /** Obtiene los últimos N meses como array de strings YYYY-MM */
  lastNMonths(n) {
    const months = [];
    const d = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  },

  /** Calcula el porcentaje de forma segura */
  percentage(part, total) {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100);
  },

  /** Clasifica el nivel de gasto respecto a presupuesto */
  budgetStatus(spent, budget) {
    const pct = this.percentage(spent, budget);
    if (pct >= 100) return 'over';
    if (pct >= 80) return 'warning';
    return 'ok';
  },

  /** Trunca texto largo */
  truncate(str, maxLen = 24) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
  },

  /** Valida que un monto sea numérico y positivo */
  isValidAmount(val) {
    const n = parseFloat(val);
    return !isNaN(n) && n > 0;
  },

  /** Valida formato de fecha YYYY-MM-DD */
  isValidDate(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    return !isNaN(d.getTime());
  },

  /** Descarga un objeto como archivo JSON */
  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  /** Lee un File como texto JSON */
  readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          resolve(JSON.parse(e.target.result));
        } catch {
          reject(new Error('El archivo no es un JSON válido.'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsText(file);
    });
  },

  /** Devuelve el día de la semana en español */
  dayName(dateStr) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(dateStr + 'T00:00:00');
    return days[d.getDay()];
  },

  /** Calcula frecuencia mensual equivalente de una suscripción */
  monthlyEquivalent(amount, frequency) {
    switch (frequency) {
      case 'weekly': return amount * 4.33;
      case 'biweekly': return amount * 2.17;
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'yearly': return amount / 12;
      default: return amount;
    }
  },

  /** Nombre de frecuencia en español */
  frequencyName(freq) {
    const names = {
      weekly: 'Semanal',
      biweekly: 'Quincenal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual',
    };
    return names[freq] || freq;
  },

  /** Clamp value between min and max */
  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },
};
