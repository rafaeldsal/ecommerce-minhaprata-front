import { Product, ProductHelper } from '../products/product.model'

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: { [key: string]: string };
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemsCount: number;
}

export class CartHelper {
  static calculateCartTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  static calculateItemsCount(items: CartItem[]): number {
    return items.reduce((count, item) => count + item.quantity, 0);
  }

  static createInitialCartState(): CartState {
    return {
      items: [],
      total: 0,
      itemsCount: 0
    };
  }

  static findCartItem(
    items: CartItem[],
    productId: string,
    selectedOptions?: { [key: string]: string }
  ): CartItem | undefined {
    return items.find(item => {
      const sameProduct = item.product.id === productId;
      const sameOptions = this.areOptionsEqual(item.selectedOptions, selectedOptions);
      return sameProduct && sameOptions;
    });
  }

  static areOptionsEqual(
    opts1?: { [key: string]: string },
    opts2?: { [key: string]: string }
  ): boolean {
    if (!opts1 && !opts2) return true;
    if (!opts1 || !opts2) return false;

    const keys1 = Object.keys(opts1);
    const keys2 = Object.keys(opts2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => opts1[key] === opts2[key]);
  }

  static addOrUpdateItem(
    items: CartItem[],
    newItem: CartItem
  ): CartItem[] {
    const existingItem = this.findCartItem(items, newItem.product.id, newItem.selectedOptions);

    if (existingItem) {
      return items.map(item =>
        item === existingItem
          ? { ...item, quantity: item.quantity + newItem.quantity }
          : item
      );
    } else {
      return [...items, { ...newItem, addedAt: new Date() }];
    }
  }

  static updateItemQuantity(
    items: CartItem[],
    productId: string,
    selectedOptions: { [key: string]: string } | undefined,
    newQuantity: number
  ): CartItem[] {
    if (newQuantity <= 0) {
      return this.removeItem(items, productId, selectedOptions);
    }

    return items.map(item => {
      if (item.product.id === productId && this.areOptionsEqual(item.selectedOptions, selectedOptions)) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
  }

  static removeItem(
    items: CartItem[],
    productId: string,
    selectedOptions?: { [key: string]: string }
  ): CartItem[] {
    return items.filter(item =>
      !(item.product.id === productId && this.areOptionsEqual(item.selectedOptions, selectedOptions))
    );
  }

  static clearCart(): CartState {
    return this.createInitialCartState();
  }

  static getCartSummary(items: CartItem[]): {
    subtotal: number;
    shipping: number;
    total: number;
    itemsCount: number;
  } {
    const subtotal = this.calculateCartTotal(items);
    const shipping = subtotal > 100 ? 0 : 15; // Frete grátis acima de R$ 100
    const total = subtotal + shipping;
    const itemsCount = this.calculateItemsCount(items);

    return {
      subtotal,
      shipping,
      total,
      itemsCount
    };
  }

  static validateCartItem(item: CartItem): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (item.quantity <= 0) {
      errors.push('Quantidade deve ser maior que zero');
    }

    if (item.quantity > item.product.stockQuantity) {
      errors.push(`Quantidade indisponível. Estoque: ${item.product.stockQuantity}`);
    }

    if (!ProductHelper.isInStock(item.product)) {
      errors.push('Produto fora de estoque');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
