/**
 * storage.js — Capa de abstracción para localStorage
 * Centraliza toda interacción con el almacenamiento local.
 */

const STORAGE_KEYS = {
  TRANSACTIONS: 'fp_transactions',
  CATEGORIES: 'fp_categories',
  BUDGETS: 'fp_budgets',
  GOALS: 'fp_goals',
  SUBSCRIPTIONS: 'fp_subscriptions',
  ACCOUNTS: 'fp_accounts',
  SETTINGS: 'fp_settings',
  VERSION: 'fp_version',
};

const CURRENT_VERSION = '1.0.0';

const Storage = {
  /** Obtiene datos de localStorage de forma segura */
  getData(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn(`[Storage] Error al leer "${key}":`, e);
      return null;
    }
  },

  /** Guarda datos en localStorage */
  saveData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`[Storage] Error al guardar "${key}":`, e);
      return false;
    }
  },

  /** Obtiene un array; si no existe, devuelve [] */
  getList(key) {
    const data = this.getData(key);
    return Array.isArray(data) ? data : [];
  },

  /** Añade un ítem a un array en localStorage */
  addItem(key, item) {
    const list = this.getList(key);
    list.push(item);
    return this.saveData(key, list);
  },

  /** Actualiza un ítem por id en un array */
  updateItem(key, id, updates) {
    const list = this.getList(key);
    const idx = list.findIndex(item => item.id === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.saveData(key, list);
  },

  /** Elimina un ítem por id de un array */
  deleteItem(key, id) {
    const list = this.getList(key);
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length === list.length) return false;
    return this.saveData(key, filtered);
  },

  /** Obtiene la configuración actual con valores por defecto */
  getSettings() {
    const defaults = {
      theme: 'auto',
      currency: 'USD',
      currencySymbol: '$',
      dateFormat: 'DD/MM/YYYY',
      firstDayOfWeek: 1,
      monthlyBudget: 0,
    };
    const saved = this.getData(STORAGE_KEYS.SETTINGS);
    return { ...defaults, ...(saved || {}) };
  },

  /** Guarda configuración (merge con existente) */
  saveSettings(updates) {
    const current = this.getSettings();
    return this.saveData(STORAGE_KEYS.SETTINGS, { ...current, ...updates });
  },

  /** Exporta todos los datos como objeto JSON */
  exportAll() {
    const data = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      transactions: this.getList(STORAGE_KEYS.TRANSACTIONS),
      categories: this.getList(STORAGE_KEYS.CATEGORIES),
      budgets: this.getList(STORAGE_KEYS.BUDGETS),
      goals: this.getList(STORAGE_KEYS.GOALS),
      subscriptions: this.getList(STORAGE_KEYS.SUBSCRIPTIONS),
      accounts: this.getList(STORAGE_KEYS.ACCOUNTS),
      settings: this.getSettings(),
    };
    return data;
  },

  /** Importa datos desde un objeto JSON (sobrescribe todo) */
  importAll(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Datos de importación inválidos.');
    }
    const keys = ['transactions', 'categories', 'budgets', 'goals', 'subscriptions', 'accounts'];
    const keyMap = {
      transactions: STORAGE_KEYS.TRANSACTIONS,
      categories: STORAGE_KEYS.CATEGORIES,
      budgets: STORAGE_KEYS.BUDGETS,
      goals: STORAGE_KEYS.GOALS,
      subscriptions: STORAGE_KEYS.SUBSCRIPTIONS,
      accounts: STORAGE_KEYS.ACCOUNTS,
    };
    keys.forEach(k => {
      if (Array.isArray(data[k])) {
        this.saveData(keyMap[k], data[k]);
      }
    });
    if (data.settings) {
      this.saveData(STORAGE_KEYS.SETTINGS, data.settings);
    }
    return true;
  },

  /** Borra todos los datos de la aplicación */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  },

  /** Verifica si es la primera vez que se abre la app */
  isFirstRun() {
    return localStorage.getItem(STORAGE_KEYS.VERSION) === null;
  },

  /** Marca la app como inicializada */
  markInitialized() {
    this.saveData(STORAGE_KEYS.VERSION, CURRENT_VERSION);
  },
};

// Expone las claves para uso externo
Storage.KEYS = STORAGE_KEYS;
