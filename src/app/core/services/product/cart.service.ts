import { computed, Injectable, signal } from '@angular/core';
import { CartHelper, CartItem, CartState } from '../../models/cart/cart.model';
import { NotificationService } from '../notification/notification.service';
import { Product, ProductHelper } from '../../models/products/product.model';
import { CategorySlug } from '../../models/category/category.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'minhaprata_cart';

  private readonly _cartState = signal<CartState>(CartHelper.createInitialCartState());
  readonly cartState = this._cartState.asReadonly();

  readonly items = computed(() => this._cartState().items);
  readonly itemsCount = computed(() => this._cartState().itemsCount);
  readonly total = computed(() => this._cartState().total);

  constructor(
    private notificationService: NotificationService
  ) {
    this.loadFromStorage();
  }

  // ========== 🛒 MÉTODOS PÚBLICOS PRINCIPAIS ==========

  /**
   * Adiciona produto ao carrinho
   */
  addToCart(product: Product, quantity: number = 1, selectedOptions?: { [key: string]: string }): void {
    const state = this._cartState();
    // Valida o produto antes de adicionar
    const validation = CartHelper.validateCartItem({ product, quantity, selectedOptions } as CartItem);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      return;
    }

    const newItems = CartHelper.addOrUpdateItem(state.items, {
      product,
      quantity,
      selectedOptions,
      addedAt: new Date()
    });

    this.updateCartState(newItems);
  }

  /**
   * Remove produto do carrinho
   */
  removeFromCart(productId: string, selectedOptions?: { [key: string]: string }): void {
    const state = this._cartState();
    const newItems = CartHelper.removeItem(state.items, productId, selectedOptions);
    this.updateCartState(newItems);
    this.notificationService.showInfo('Item removido do carrinho 🗑️');
  }

  /**
   * Atualiza quantidade de um produto no carrinho
   */
  updateQuantity(productId: string, quantity: number, selectedOptions?: { [key: string]: string }): void {
    if (quantity <= 0) {
      this.removeFromCart(productId, selectedOptions);
      return;
    }

    const state = this._cartState();
    const newItems = CartHelper.updateItemQuantity(state.items, productId, selectedOptions, quantity);

    this.updateCartState(newItems);
  }

  /**
   * Limpa todo o carrinho
   */
  clearCart(): void {
    this.updateCartState([]);
    this.notificationService.showInfo('Carrinho limpo 🗑️');
  }

  /**
   * Adiciona múltiplos itens ao carrinho
   */
  addMultipleToCart(items: { product: Product, quantity: number, selectedOptions?: { [key: string]: string } }[]): void {
    const state = this._cartState();
    let newItems = [...state.items];

    items.forEach(newItem => {
      const validation = CartHelper.validateCartItem({
        product: newItem.product,
        quantity: newItem.quantity,
        selectedOptions: newItem.selectedOptions
      } as CartItem);

      if (validation.isValid) {
        newItems = CartHelper.addOrUpdateItem(newItems, {
          product: newItem.product,
          quantity: newItem.quantity,
          selectedOptions: newItem.selectedOptions,
          addedAt: new Date()
        });
      } else {
        console.warn(`Item inválido não adicionado: ${newItem.product.name}`, validation.errors);
      }
    });

    this.updateCartState(newItems);
    this.notificationService.showSuccess(`${items.length} item(ns) adicionado(s) ao carrinho! 🛒`);
  }

  // ========== 🔍 MÉTODOS DE CONSULTA ==========

  /**
   * Retorna quantidade total de itens no carrinho
   */
  getItemsCount(): number {
    return this._cartState().itemsCount;
  }

  /**
   * Retorna preço total do carrinho
   */
  getTotalPrice(): number {
    return this._cartState().total
  }

  /**
   * Retorna quantidade de um produto específico
   */
  getItemQuantity(productId: string, selectedOptions?: { [key: string]: string }): number {
    const item = this._cartState().items.find(item =>
      item.product.id === productId &&
      CartHelper.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
    return item ? item.quantity : 0;
  }

  /**
   * Verifica se produto está no carrinho
   */
  isProductInCart(productId: string, selectedOptions?: { [key: string]: string }): boolean {
    return this._cartState().items.some(item =>
      item.product.id === productId &&
      CartHelper.areOptionsEqual(item.selectedOptions, selectedOptions)
    );
  }

  /**
   * Retorna resumo do carrinho (subtotal, frete, total)
   */
  getCartSummary() {
    return CartHelper.getCartSummary(this._cartState().items);
  }

  /**
   * Retorna todos os itens do carrinho
   */
  getCartItems(): CartItem[] {
    return [...this._cartState().items];
  }

  /**
   * Verifica se o carrinho está vazio
   */
  isEmpty(): boolean {
    return this._cartState().items.length === 0;
  }

  // ========== 🎁 MÉTODOS DE PROMOÇÃO/DESCONTO ==========

  /**
   * Aplica cupom de desconto (para implementação futura)
   */
  applyDiscountCode(code: string): { success: boolean; message: string; discount?: number } {
    // TODO: Implementar lógica de cupons
    // Mock por enquanto
    if (code === 'MINHAPRATA10') {
      const discount = this._cartState().total * 0.1; // 10% de desconto
      this.notificationService.showSuccess(`Cupom aplicado! Desconto de ${ProductHelper.formatPrice(discount)}`);
      return { success: true, message: 'Cupom aplicado com sucesso', discount };
    }

    this.notificationService.showError('Cupom inválido ou expirado');
    return { success: false, message: 'Cupom inválido' };
  }

  /**
   * Calcula frete (mock - integrar com API de frete depois)
   */
  calculateShipping(zipCode: string): { price: number; days: number; name: string } {
    // TODO: Integrar com API de cálculo de frete
    const total = this._cartState().total;

    if (total > 100) {
      return { price: 0, days: 5, name: 'Frete Grátis' };
    } else if (total > 50) {
      return { price: 9.90, days: 3, name: 'Entrega Econômica' };
    } else {
      return { price: 14.90, days: 2, name: 'Entrega Expressa' };
    }
  }

  // ========== 💾 MÉTODOS PRIVADOS - STORAGE ==========

  /**
   * Atualiza estado do carrinho e salva no storage
   */
  private updateCartState(items: CartItem[]): void {
    const total = CartHelper.calculateCartTotal(items);
    const itemsCount = CartHelper.calculateItemsCount(items);

    const newState: CartState = {
      items,
      total,
      itemsCount
    };

    this._cartState.set(newState);
    this.saveToStorage(newState);
  }

  /**
   * Salva carrinho no localStorage
   */
  private saveToStorage(state: CartState): void {
    try {
      const storageState = {
        ...state,
        items: state.items.map(item => ({
          ...item,
          addedAt: item.addedAt.toISOString(),
          product: { ...item.product }
        }))
      };
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(storageState));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }

  /**
   * Carrega carrinho do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.CART_STORAGE_KEY);
      if (!stored) return;

      const parsedState = JSON.parse(stored);
      const state: CartState = {
        ...parsedState,
        items: parsedState.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
          product: item.product as Product
        }))
      };

      const validItems = state.items.filter(item => CartHelper.validateCartItem(item).isValid);
      this.updateCartState(validItems);
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
    }
  }

  /**
   * Limpa storage do carrinho
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar storage do carrinho:', error);
    }
  }
}
