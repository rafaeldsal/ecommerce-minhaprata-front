import { ApiCategory, Category } from '../category/category.model';

export interface ApiSuccessResponse<T> {
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  dtCreated: string;
  dtUpdated: string;
  category: ApiCategory;
  productImage: ApiProductImage[];
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  dtCreated: Date;
  dtUpdated: Date;
  category: Category;
  productImage: ProductImage[];
  options: ProductOption[];
  inStock: boolean
}

export interface ProductImage {
  id: string;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
  altText: string;
}

export interface ApiProductImage {
  id: string;
  imageUrl: string;
  imageOrder: number;
  isPrimary: boolean;
  altText: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  categoryId: string;
  images: ProductImageRequest[];
  options: ProductOption[];
}

export interface ProductImageRequest {
  imageUrl: string;
  imageOrder?: number;
  isPrimary?: boolean;
  altText?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 📋 CONSTANTES E CONFIGURAÇÕES
export const PRODUCT_OPTIONS_BY_CATEGORY: {
  [key: string]: ProductOption[]
} = {
  aneis: [
    {
      name: 'Tamanho',
      values: ['16', '17', '18', '19']
    },
    {
      name: 'Material',
      values: ['Prata 925', 'Prata Banhada', 'Prata com Safira']
    }
  ],
  braceletes: [
    {
      name: 'Tamanho',
      values: ['Pequeno', 'Médio', 'Grande']
    },
    {
      name: 'Fecho',
      values: ['Imã', 'Elástico', 'Fivela']
    }
  ],
  colares: [
    {
      name: 'Comprimento',
      values: ['40cm', '45cm', '50cm', '55cm', '60cm']
    },
    {
      name: 'Tipo de Corrente',
      values: ['Figaro', 'Cobra', 'Box', 'Anel']
    }
  ],
  brincos: [
    {
      name: 'Tipo',
      values: ['Argola', 'Pino', 'Pérola', 'Stud', 'Pendente']
    },
    {
      name: 'Tamanho',
      values: ['Pequeno', 'Médio', 'Grande']
    }
  ]
};

// 📋 MÉTODOS AUXILIARES
export class ProductHelper {
  private static readonly JEWELRY_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmOGY4ZjgiLz4KICA8cGF0aCBkPSJNMjAwIDEyMEMyMzEuMzYgMTIwIDI1NiAxNDQuNjQgMjU2IDE3NkMyNTYgMTg3LjQ2IDI1Mi42NCAxOTguMTIgMjQ2LjQgMjA3LjA0TDI2NS4yIDI1MS4wNEMyNjcuMDQgMjU1LjQ0IDI2NS4yOCAyNjAuNTIgMjYwLjg4IDI2Mi4zNkMyNTkuMzYgMjYyLjkyIDI1Ny43NiAyNjMuMiAyNTYuMTYgMjYzLjJIMTQzLjg0QzEzOC42NCAyNjMuMiAxMzQuNCAyNTguOTYgMTM0LjQgMjUzLjc2QzEzNC40IDI1Mi4xNiAxMzQuNjggMjUwLjU2IDEzNS4yNCAyNDkuMDRMMTUzLjYgMjA3LjA0QzE0Ny4zNiAxOTguMTIgMTQ0IDE4Ny40NiAxNDQgMTc2QzE0NCAxNDQuNjQgMTY4LjY0IDEyMCAyMDAgMTIwWiIgZmlsbD0iI2UxZTFlMSIvPgogIDxjaXJjbGUgY3g9IjIwMCIgY3k9IjE3NiIgcj0iMjQiIGZpbGw9IiNjY2MiLz4KICA8dGV4dCB4PSIyMDAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij4KICAgIEpvaWEgbsOjbyBkaXNwb27DrXZlbAogIDwvdGV4dD4KPC9zdmc+';

  static getProductImages(product: Product): string[] {
    if (!product?.productImage || !Array.isArray(product.productImage) || product.productImage.length === 0) {
      return [];
    }

    const validImages = product.productImage
      .filter(img => img && img.imageUrl && typeof img.imageUrl === 'string' && img.imageUrl.trim() !== '')
      .sort((a, b) => (a.imageOrder || 0) - (b.imageOrder || 0))
      .map(img => img.imageUrl.trim());

    return validImages;
  }

  static getPlaceholderImage(): string {
    return this.JEWELRY_PLACEHOLDER;
  }

  static getMainImage(product: Product): string {
    const images = this.getProductImages(product);
    return images.length > 0 ? images[0] : this.JEWELRY_PLACEHOLDER;
  }

  static isInStock(product: Product): boolean {
    return product.stockQuantity > 0 && product.isActive;
  }

  static getStockStatus(product: Product): 'in_stock' | 'low_stock' | 'out_of_stock' {
    if (product.stockQuantity === 0) return 'out_of_stock';
    if (product.stockQuantity <= 10) return 'low_stock';
    return 'in_stock';
  }

  static getStockStatusText(product: Product): string {
    const status = this.getStockStatus(product);
    const statusMap = {
      in_stock: 'Em estoque',
      low_stock: 'Estoque baixo',
      out_of_stock: 'Sem estoque'
    };
    return statusMap[status];
  }

  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  static calculateDiscount(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  static isValidProduct(product: Partial<Product>): boolean {
    return !!(product.name && product.description && product.price && product.category);
  }

  static sortByPrice(products: Product[], ascending: boolean = true): Product[] {
    return [...products].sort((a, b) =>
      ascending ? a.price - b.price : b.price - a.price
    );
  }

  static filterByCategory(products: Product[], categoryId: string): Product[] {
    if (!categoryId) return products;
    return products.filter(product => product.category.id === categoryId);
  }

  static prepareProductForApi(formData: ProductFormData): any {
    return {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      stockQuantity: formData.stockQuantity,
      isActive: formData.isActive,
      categoryId: formData.categoryId,
      images: formData.images.map((img, index) => ({
        imageUrl: img.imageUrl,
        imageOrder: img.imageOrder || index,
        isPrimary: img.isPrimary || index === 0,
        altText: img.altText || `Imagem ${index + 1} do produto ${formData.name}`
      })),
      options: this.prepareOptionsForApi(formData.options || []) // 🆕 Incluir options
    };
  }

  static prepareOptionsForApi(options: ProductOption[]): ProductOption[] {
    return options.map(option => ({
      name: option.name.trim(),
      values: option.values.filter(value => value.trim().length > 0)
    })).filter(option =>
      option.name.length > 0 && option.values.length > 0
    );
  }

  static validateOptions(options: ProductOption[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    options.forEach((option, index) => {
      if (!option.name || option.name.trim().length === 0) {
        errors.push(`Opção ${index + 1}: nome é obrigatório`);
      }
      if (!option.values || option.values.length === 0) {
        errors.push(`Opção ${index + 1}: pelo menos um valor é obrigatório`);
      }
      if (option.values.some(value => !value || value.trim().length === 0)) {
        errors.push(`Opção ${index + 1}: valores não podem estar vazios`);
      }
    });

    // Verificar nomes duplicados
    const optionNames = options.map(opt => opt.name.toLowerCase().trim());
    const uniqueNames = new Set(optionNames);
    if (uniqueNames.size !== optionNames.length) {
      errors.push('Não é permitido ter opções com nomes duplicados');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static createEmptyOption(): ProductOption {
    return {
      name: '',
      values: ['']
    };
  }

  static createEmptyFormData(): ProductFormData {
    return {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      isActive: true,
      categoryId: '',
      images: [],
      options: [] // 🆕 Options vazio
    };
  }

  static searchProducts(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.name.toLowerCase().includes(term)
    );
  }

  // 📋 NOVOS MÉTODOS PARA OPÇÕES DE PRODUTO
  static getOptionsForCategory(categorySlug: string): ProductOption[] {
    return PRODUCT_OPTIONS_BY_CATEGORY[categorySlug] || [];
  }

  static getOptionsForProduct(product: Product): ProductOption[] {
    // Prioridade 1: Opções específicas do produto vinda da API
    if (product.options && product.options.length > 0) {
      return product.options;
    }

    // Prioridade 2: Opções padrão da categoria (fallback)
    const categorySlug = product.category.slug || product.category.name.toLowerCase();
    return this.getOptionsForCategory(categorySlug);
  }

  static hasOptions(product: Product): boolean {
    return this.getOptionsForProduct(product).length > 0;
  }

  static getDefaultSelectedOptions(product: Product): { [key: string]: string } {
    const options = this.getOptionsForProduct(product);
    const selected: { [key: string]: string } = {};

    options.forEach(option => {
      if (option.values.length > 0) {
        selected[option.name] = option.values[0];
      }
    });

    return selected;
  }

  static validateSelectedOptions(
    product: Product,
    selectedOptions: { [key: string]: string }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const availableOptions = this.getOptionsForProduct(product);

    availableOptions.forEach(option => {
      const selectedValue = selectedOptions[option.name];

      if (!selectedValue) {
        errors.push(`Opção "${option.name}" é obrigatória`);
      } else if (!option.values.includes(selectedValue)) {
        errors.push(`Valor "${selectedValue}" não é válido para "${option.name}"`);
      }
    });

    // Verificar opções extras não permitidas
    Object.keys(selectedOptions).forEach(selectedKey => {
      const hasOption = availableOptions.some(option => option.name === selectedKey);
      if (!hasOption) {
        errors.push(`Opção "${selectedKey}" não está disponível para este produto`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static generateProductVariantName(
    product: Product,
    selectedOptions: { [key: string]: string }
  ): string {
    const optionValues = Object.values(selectedOptions);
    if (optionValues.length === 0) return product.name;

    return `${product.name} - ${optionValues.join(', ')}`;
  }

  static getAvailableOptionValues(product: Product, optionName: string): string[] {
    const options = this.getOptionsForProduct(product);
    const option = options.find(opt => opt.name === optionName);
    return option ? option.values : [];
  }

  static isOptionAvailable(
    product: Product,
    optionName: string,
    value: string
  ): boolean {
    const availableValues = this.getAvailableOptionValues(product, optionName);
    return availableValues.includes(value);
  }
}
