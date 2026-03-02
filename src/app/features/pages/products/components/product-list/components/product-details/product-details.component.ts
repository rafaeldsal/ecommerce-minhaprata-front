import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';

import { ProductService } from '../../../../../../../core/services/product/product.service';
import { CartService } from '../../../../../../../core/services/product/cart.service';
import { NotificationService } from '../../../../../../../core/services/notification/notification.service';
import { Product, ProductHelper } from '../../../../../../../core/models/products/product.model';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ImageModule,
    GalleriaModule,
    ButtonModule,
    CardModule,
    TagModule,
    ProgressSpinnerModule,
    ToastModule,
    SkeletonModule
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productDataService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  product = signal<Product | undefined>(undefined);
  loading = signal<boolean>(true);
  quantity = signal<number>(1);
  selectedOptions = signal<{ [key: string]: string }>({});
  showZoomModal = signal<boolean>(false);
  currentImageIndex = signal<number>(0);
  imageLoadErrors = signal<Set<string>>(new Set()); // Rastreia imagens com erro

  // Computed properties refatoradas
  productImages = computed(() => {
    const product = this.product();
    return product ? ProductHelper.getProductImages(product) : [];
  });

  currentImage = computed(() => {
    const images = this.productImages();
    const currentIndex = this.currentImageIndex();

    if (images.length === 0 || currentIndex >= images.length) {
      return ProductHelper.getPlaceholderImage();
    }

    const imageUrl = images[currentIndex];
    return this.imageLoadErrors().has(imageUrl)
      ? ProductHelper.getPlaceholderImage()
      : imageUrl;
  });

  shouldShowPlaceholder = computed(() => {
    const images = this.productImages();
    const currentIndex = this.currentImageIndex();

    return images.length === 0 ||
      currentIndex >= images.length ||
      this.imageLoadErrors().has(images[currentIndex]);
  });

  isProductInStock = computed(() => {
    const product = this.product();
    return product ? product.inStock : false;
  });

  productImagesLength = computed(() => {
    return this.productImages().length;
  });

  canShowImageNavigation = computed(() => {
    return this.productImagesLength() > 1;
  });

  ngOnInit(): void {
    this.loadProduct();
  }

  private loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.router.navigate(['/']);
      return;
    }

    this.loading.set(true);
    this.productDataService.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        if (product) {
          this.initializeDefaultSelections(product);
          this.currentImageIndex.set(0);
          this.imageLoadErrors.set(new Set()); // Reseta erros ao carregar novo produto
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar produto:', error);
        this.loading.set(false);
      }
    });
  }

  private initializeDefaultSelections(product: Product): void {
    const options: { [key: string]: string } = {};

    if (product.options) {
      product.options.forEach(option => {
        if (option.values && option.values.length > 0) {
          options[option.name] = option.values[0];
        }
      });
    }

    this.selectedOptions.set(options);
  }

  // Métodos de imagem refatorados
  selectImage(index: number) {
    if (index >= 0 && index < this.productImagesLength()) {
      this.currentImageIndex.set(index);
    }
  }

  nextImage() {
    const imagesLength = this.productImagesLength();
    if (imagesLength > 0) {
      this.currentImageIndex.update(index =>
        index < imagesLength - 1 ? index + 1 : 0
      );
    }
  }

  previousImage() {
    const imagesLength = this.productImagesLength();
    if (imagesLength > 0) {
      this.currentImageIndex.update(index =>
        index > 0 ? index - 1 : imagesLength - 1
      );
    }
  }

  openZoomModal() {
    this.showZoomModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeZoomModal() {
    this.showZoomModal.set(false);
    document.body.style.overflow = 'auto';
  }

  // Handler de erro de imagem simplificado e eficiente
  handleImageError(event: any) {
    const target = event.target as HTMLImageElement;
    const failedImageUrl = target.src;

    // Evita loop infinito - não processa se já é o placeholder
    if (failedImageUrl === ProductHelper.getPlaceholderImage()) {
      return;
    }

    console.warn('🖼️ Erro ao carregar imagem:', failedImageUrl);

    // Marca a imagem como com erro
    this.imageLoadErrors.update(errors => {
      const newErrors = new Set(errors);
      newErrors.add(failedImageUrl);
      return newErrors;
    });

    // Força atualização da computed property
    this.currentImage();
  }

  // Métodos de produto (mantidos iguais)
  hasProductOptions(): boolean {
    const product = this.product();
    return !!(product?.options && product.options.length > 0);
  }

  isOptionSelected(optionName: string, value: string): boolean {
    return this.selectedOptions()[optionName] === value;
  }

  selectOption(optionName: string, value: string): void {
    this.selectedOptions.update(options => ({
      ...options,
      [optionName]: value
    }));
  }

  areAllOptionsSelected(): boolean {
    const product = this.product();
    if (!product?.options) return true;

    return product.options.every(option =>
      this.selectedOptions()[option.name] !== undefined
    );
  }

  increaseQuantity(): void {
    const product = this.product();
    if (product && this.quantity() < (product.stockQuantity || 1)) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart(): void {
    const product = this.product();

    if (product && this.isProductInStock() && this.areAllOptionsSelected()) {
      this.cartService.addToCart(
        product,
        this.quantity(),
        this.selectedOptions()
      );

      this.notificationService.showSuccess(
        `${product.name} adicionado ao carrinho! 🛒`
      );
    } else if (!this.areAllOptionsSelected()) {
      this.notificationService.showWarning(
        'Por favor, selecione todas as opções antes de adicionar ao carrinho.'
      );
    } else if (!this.isProductInStock()) {
      this.notificationService.showError(
        'Este produto está fora de estoque.'
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
