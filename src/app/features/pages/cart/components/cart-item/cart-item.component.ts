import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CartItem } from '../../../../../core/models/cart/cart.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ProductHelper } from '../../../../../core/models/products/product.model';

@Component({
  selector: 'app-cart-item',
  imports: [
    ButtonModule
  ],
  standalone: true,
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.scss'
})
export class CartItemComponent {
  private router = inject(Router);

  @Input({ required: true }) item!: CartItem;
  @Output() quantityChange = new EventEmitter<number>();
  @Output() remove = new EventEmitter<void>();

  itemSignal = signal<CartItem | null>(null);

  itemTotal = computed(() => {
    const item = this.itemSignal();
    return item ? item.product.price * item.quantity : 0;
  });

  optionsText = computed(() => {
    const item = this.itemSignal();
    if (!item?.selectedOptions) return '';

    return Object.entries(item.selectedOptions)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  });

  imgUrl = computed(() => {
    const product = this.itemSignal()?.product;
    return product ? ProductHelper.getMainImage(product) : '';
  });
  productId = computed(() => this.itemSignal()?.product.id ?? '');
  productName = computed(() => this.itemSignal()?.product.name ?? '');
  productPrice = computed(() => this.itemSignal()?.product.price.toFixed(2));
  quantity = computed(() => this.itemSignal()?.quantity ?? 1);
  quantityInStock = computed(() => this.itemSignal()?.product.stockQuantity ?? 1);

  ngOnChanges(): void {
    if (this.item) {
      this.itemSignal.set(this.item);
    }
  }

  onQuantityChange(newQuantity: number): void {
    this.quantityChange.emit(newQuantity);
  }

  onRemove(): void {
    this.remove.emit();
  }

  goToProduct(id: string): void {
    this.router.navigate(['/product', id]);
  }

}
