/**
 * categories.js — Gestión de categorías
 */

const Categories = {
  KEY: Storage.KEYS.CATEGORIES,

  /** Categorías predeterminadas del sistema */
  DEFAULTS: [
    { id: 'cat_food', name: 'Comida', icon: '🍽️', color: '#FF6B6B', type: 'expense', isDefault: true },
    { id: 'cat_transport', name: 'Transporte', icon: '🚗', color: '#4ECDC4', type: 'expense', isDefault: true },
    { id: 'cat_housing', name: 'Vivienda', icon: '🏠', color: '#45B7D1', type: 'expense', isDefault: true },
    { id: 'cat_services', name: 'Servicios', icon: '💡', color: '#96CEB4', type: 'expense', isDefault: true },
    { id: 'cat_entertainment', name: 'Entretenimiento', icon: '🎬', color: '#FFEAA7', type: 'expense', isDefault: true },
    { id: 'cat_shopping', name: 'Compras', icon: '🛍️', color: '#DDA0DD', type: 'expense', isDefault: true },
    { id: 'cat_tech', name: 'Tecnología', icon: '💻', color: '#98D8C8', type: 'expense', isDefault: true },
    { id: 'cat_education', name: 'Educación', icon: '📚', color: '#F7DC6F', type: 'expense', isDefault: true },
    { id: 'cat_health', name: 'Salud', icon: '🏥', color: '#82E0AA', type: 'expense', isDefault: true },
    { id: 'cat_travel', name: 'Viajes', icon: '✈️', color: '#85C1E9', type: 'expense', isDefault: true },
    { id: 'cat_subscriptions', name: 'Suscripciones', icon: '📱', color: '#BB8FCE', type: 'expense', isDefault: true },
    { id: 'cat_other', name: 'Otros', icon: '📦', color: '#AEB6BF', type: 'expense', isDefault: true },
    // Income categories
    { id: 'cat_salary', name: 'Salario', icon: '💼', color: '#58D68D', type: 'income', isDefault: true },
    { id: 'cat_freelance', name: 'Freelance', icon: '🖥️', color: '#5DADE2', type: 'income', isDefault: true },
    { id: 'cat_sale', name: 'Venta', icon: '🏷️', color: '#F0B27A', type: 'income', isDefault: true },
    { id: 'cat_refund', name: 'Reembolso', icon: '↩️', color: '#76D7C4', type: 'income', isDefault: true },
    { id: 'cat_other_income', name: 'Otro ingreso', icon: '💰', color: '#A9CCE3', type: 'income', isDefault: true },
  ],

  /** Obtiene todas las categorías */
  getAll() {
    return Storage.getList(this.KEY);
  },

  /** Obtiene categorías filtradas por tipo */
  getByType(type) {
    return this.getAll().filter(c => c.type === type || c.type === 'both');
  },

  /** Obtiene una categoría por id */
  getById(id) {
    return this.getAll().find(c => c.id === id) || null;
  },

  /** Crea una nueva categoría */
  create(data) {
    const cat = {
      id: Utils.generateId(),
      name: data.name.trim(),
      icon: data.icon || '📦',
      color: data.color || '#AEB6BF',
      type: data.type || 'expense',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    Storage.addItem(this.KEY, cat);
    return cat;
  },

  /** Actualiza una categoría existente */
  update(id, data) {
    return Storage.updateItem(this.KEY, id, {
      name: data.name?.trim(),
      icon: data.icon,
      color: data.color,
      type: data.type,
    });
  },

  /** Elimina una categoría (solo si no es default) */
  delete(id) {
    const cat = this.getById(id);
    if (!cat) return false;
    return Storage.deleteItem(this.KEY, id);
  },

  /** Inicializa las categorías por defecto (solo si no hay ninguna) */
  initDefaults() {
    const existing = this.getAll();
    if (existing.length === 0) {
      Storage.saveData(this.KEY, this.DEFAULTS);
    }
  },

  /** Devuelve la categoría de gastos "fallback" */
  fallback() {
    return this.DEFAULTS.find(c => c.id === 'cat_other') || this.DEFAULTS[0];
  },

  /** Renderiza un badge de categoría con color e ícono */
  renderBadge(category) {
    if (!category) return '<span class="cat-badge">–</span>';
    return `<span class="cat-badge" style="background:${category.color}20; color:${category.color}">
      ${category.icon} ${category.name}
    </span>`;
  },

  /** Íconos predefinidos para el selector */
  ICON_OPTIONS: [
    '🍽️','🍕','🍔','☕','🛒','🚗','🚌','✈️','🏠','💡','📱','💻',
    '🎬','🎮','🎵','📚','🏥','💊','🏋️','🛍️','👕','👟','💼','📦',
    '💰','💳','🏷️','↩️','🖥️','🎯','🌟','🔑','🎁','🌈','🍀','⚡',
  ],
};
