export enum CategorySlug {
  ALL = 'all',
  ANEIS = 'aneis',
  BRINCOS = 'brincos',
  BRACELETES = 'braceletes',
  COLARES = 'colares'
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: CategorySlug | string;
  icon?: string; // Agora será classe do Font Awesome
  isActive: boolean;
  productCount?: number;
  dtCreated: Date;
  dtUpdated: Date;
}

export interface ApiSuccessResponse<T> {
  message: string;
  data: T,
  timestamp: string
}

export interface ApiCategory {
  id: string;
  name: string;
  description: string;
  slug: CategorySlug | string;
  icon: string;
  isActive: boolean;
  dtCreated: string;
  dtUpdated: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  icon: string;
  parentId?: string;
  isActive: boolean;
}

export interface CategoryFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  parent: string;
}

export interface BulkCategoryAction {
  type: 'activate' | 'deactivate' | 'delete';
  categoryIds: string[];
}

export interface CategoryReorder {
  categoryId: string;
  newOrder: number;
  parentId?: string;
}

// 📋 MÉTODOS AUXILIARES
export class CategoryHelper {
  private static categoryIcons: Record<CategorySlug, string> = {
    [CategorySlug.ANEIS]: '💍', // Anel
    [CategorySlug.BRINCOS]: '👂', // Brinco
    [CategorySlug.BRACELETES]: '📿', // Bracelete
    [CategorySlug.COLARES]: '📿', // Colar
    [CategorySlug.ALL]: '💎' // Todos
  };

  static getIconBySlug(slug: CategorySlug): string {
    return this.categoryIcons[slug] || 'fa-solid fa-box';
  }

  static getCategoryBySlug(categories: Category[], slug: string): Category | undefined {
    return categories.find(cat => cat.slug === slug || cat.name.toLowerCase() === slug.toLowerCase());
  }

  static getDisplayName(category: Category): string {
    return category.name.charAt(0).toUpperCase() + category.name.slice(1);
  }

  static isValidCategory(category: Partial<Category>): boolean {
    return !!(category.name && category.description);
  }

  static getDefaultCategories(): Category[] {
    const now = new Date();
    return [
      {
        id: '1',
        name: 'Anéis',
        description: 'Anéis em prata 925',
        slug: CategorySlug.ANEIS,
        icon: 'fa-regular fa-gem',
        isActive: true,
        productCount: 15,
        dtCreated: now,
        dtUpdated: now
      },
      {
        id: '2',
        name: 'Braceletes',
        description: 'Braceletes em prata',
        slug: CategorySlug.BRACELETES,
        icon: 'fa-solid fa-hands-bubbles',
        isActive: true,
        productCount: 8,
        dtCreated: now,
        dtUpdated: now
      },
      {
        id: '3',
        name: 'Colares',
        description: 'Colares em prata',
        slug: CategorySlug.COLARES,
        icon: 'fa-solid fa-medal',
        isActive: true,
        productCount: 12,
        dtCreated: now,
        dtUpdated: now
      },
      {
        id: '4',
        name: 'Brincos',
        description: 'Brincos em prata',
        slug: CategorySlug.BRINCOS,
        icon: 'fa-solid fa-ring',
        isActive: true,
        productCount: 20,
        dtCreated: now,
        dtUpdated: now
      }
    ];
  }

  // Novos métodos para hierarquia
  static buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const roots: Category[] = [];

    // Primeiro, mapeia todas as categorias
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category });
    });

    // Retorna todas como raiz (para estrutura plana)
    // Se quiser implementar hierarquia futuramente, adicione a lógica aqui
    return Array.from(categoryMap.values());
  }

  static validateCategoryForm(data: CategoryFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name?.trim()) errors.push('Nome da categoria é obrigatório');
    if (!data.description?.trim()) errors.push('Descrição é obrigatória');
    if (!data.slug?.trim()) errors.push('Slug é obrigatório');
    if (!data.icon?.trim()) errors.push('Ícone é obrigatório');

    if (data.name && data.name.length > 50) errors.push('Nome deve ter no máximo 50 caracteres');
    if (data.description && data.description.length > 200) errors.push('Descrição deve ter no máximo 200 caracteres');

    // Validação de slug
    const slugRegex = /^[a-z0-9-]+$/;
    if (data.slug && !slugRegex.test(data.slug)) {
      errors.push('Slug deve conter apenas letras minúsculas, números e hífens');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  static getCategoryIconOptions(): { value: string; label: string }[] {
    return [
      { value: 'fa-regular fa-gem', label: '💎 Gema' },
      { value: 'fa-solid fa-ring', label: '💍 Anel' },
      { value: 'fa-solid fa-hands-bubbles', label: '✨ Bracelete' },
      { value: 'fa-solid fa-medal', label: '🏅 Medalha' },
      { value: 'fa-solid fa-wristwatch', label: '⌚ Pulseira' },
      { value: 'fa-solid fa-ankh', label: '☥ Tornozeleira' },
      { value: 'fa-solid fa-crown', label: '👑 Coroa' },
      { value: 'fa-solid fa-star', label: '⭐ Estrela' },
      { value: 'fa-solid fa-heart', label: '❤️ Coração' },
      { value: 'fa-solid fa-moon', label: '🌙 Lua' },
      { value: 'fa-solid fa-sun', label: '☀️ Sol' },
      { value: 'fa-solid fa-cloud', label: '☁️ Nuvem' },
      { value: 'fa-solid fa-flower', label: '🌺 Flor' },
      { value: 'fa-solid fa-bolt', label: '⚡ Raio' },
      { value: 'fa-solid fa-feather', label: '🪶 Pena' }
    ];
  }

  static getIconLabel(iconClass: string): string {
    const options = this.getCategoryIconOptions();
    const option = options.find(opt => opt.value === iconClass);
    return option ? option.label : '📦 Caixa';
  }
}
