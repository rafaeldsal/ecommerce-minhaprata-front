import { Component, computed, inject, signal } from '@angular/core';

import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';

import { CartService } from '../../../../../core/services/product/cart.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './cart-icon.component.html',
  styleUrl: './cart-icon.component.scss'
})
export class CartIconComponent {
  private readonly cartService = inject(CartService);

  cartItemsCount = computed(() => this.cartService.cartState().itemsCount);

  badgeClass = computed(() => {
    const count = this.cartItemsCount();
    return count > 9 ? 'cart-badge double-digit' : 'cart-badge';
  });

}
