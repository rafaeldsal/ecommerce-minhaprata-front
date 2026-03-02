import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService } from 'primeng/api';

import { CartItemComponent } from '../components/cart-item/cart-item.component';

import { CartService } from '../../../../core/services/product/cart.service';
import { CartItem } from '../../../../core/models/cart/cart.model';
import { PageContainerComponent } from "../../../../shared/components/layout/page-container/page-container.component";

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    SkeletonModule,
    TableModule,
    PageContainerComponent,
    CartItemComponent
  ],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.scss'
})
export class CartPageComponent {

  private cartService = inject(CartService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  cartState = this.cartService.cartState;
  skeletonItems = Array.from({ length: 3 }, (_, i) => i);

  isCartEmpty = computed(() => this.cartState().items.length === 0);
  totalItems = computed(() => this.cartState().itemsCount);
  totalPrice = computed(() => this.cartState().total);

  ngOnInit(): void {
    // Simula loading inicial
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  getItemTrackBy(index: number, item: CartItem): string {
    return `${item.product.id}-${JSON.stringify(item.selectedOptions)}`;
  }

  onQuantityChange(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.onRemoveItem(item);
      return
    }

    this.cartService.updateQuantity(
      item.product.id,
      newQuantity,
      item.selectedOptions
    );
  }

  onRemoveItem(item: CartItem): void {
    this.confirmationService.confirm({
      message: "Tem certeza que deseja remover este item do carrinho?",
      header: 'Confirmar remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.cartService.removeFromCart(
          item.product.id,
          item.selectedOptions
        );
      }
    });
  }

  clearCart(): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja limpar todo o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, limpar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.cartService.clearCart();
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  formatOptions(selectedOptions: { [key: string]: string }): string {
    return Object.values(selectedOptions).join(', ');
  }

  hasOptions(selectedOptions: { [key: string]: string }): boolean {
    return selectedOptions && Object.keys(selectedOptions).length > 0;
  }

}
