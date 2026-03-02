import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

import { Product, ProductHelper } from '../../../../../../../core/models/products/product.model';
import { NotificationService } from '../../../../../../../core/services/notification/notification.service';
import { CartService } from '../../../../../../../core/services/product/cart.service';

@Component({
  selector: 'app-product-card-grid',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    RippleModule
  ],
  templateUrl: './product-card-grid.component.html',
  styleUrl: './product-card-grid.component.scss'
})
export class ProductCardGridComponent {
  product = input<Product>();
  productClick = output<Product>();

  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private cartService = inject(CartService);

  // Signal para controlar erros de imagem
  imageError = signal<boolean>(false);

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
    return product ? ProductHelper.getMainImage(product) : ProductHelper.getPlaceholderImage();
  }

  handleImageError(event: any): void {
    console.warn('🖼️ Erro ao carregar imagem do produto:', this.product()?.name);
    this.imageError.set(true);

    const target = event.target as HTMLImageElement;
    if (target.src !== ProductHelper.getPlaceholderImage()) {
      target.src = ProductHelper.getPlaceholderImage();
    }
  }

  // Método para verificar se deve mostrar placeholder
  shouldShowPlaceholder(): boolean {
    const product = this.product();
    return !product || this.imageError() || !ProductHelper.getProductImages(product).length;
  }
}
