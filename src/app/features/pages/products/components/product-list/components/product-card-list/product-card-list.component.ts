import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { Product, ProductHelper } from '../../../../../../../core/models/products/product.model';
import { NotificationService } from '../../../../../../../core/services/notification/notification.service';
import { CartService } from '../../../../../../../core/services/product/cart.service';

@Component({
  selector: 'app-product-card-list',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    RippleModule
  ],
  templateUrl: './product-card-list.component.html',
  styleUrl: './product-card-list.component.scss'
})
export class ProductCardListComponent {
  product = input<Product>();
  productClick = output<Product>();

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cartService = inject(CartService);

  onViewDetails(event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/product', this.product()?.id])
  }

  onCardClick(): void {
    this.productClick.emit(this.product()!);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();

    const product = this.product();
    if (product?.inStock) {
      this.cartService.addToCart(product, 1);
      this.notificationService.showSuccess(
        `${product?.name} adicionado ao carrinho!`
      )
    } else {
      this.notificationService.showError(
        `${product?.name} está fora de estoque!`
      );
    }
  }

  getProductImage(product: Product | undefined): string {
    return product ? ProductHelper.getMainImage(product) : '/assets/images/placeholder-product.jpg';
  }
}
