import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SearchComponent } from '../../../shared/components/search/search.component';
import { PageContainerComponent } from '../../../shared/components/layout/page-container/page-container.component';
import { ProductListComponent } from '../products/components/product-list/product-list.component';
import { Category } from '../../../core/models/category/category.model';
import { Product } from '../../../core/models/products/product.model';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    SearchComponent,
    PageContainerComponent,
    ProductListComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true
})
export class HomeComponent {

  featuredProducts = [
    {
      id: 1,
      name: 'Anel Solitário Prata 925',
      price: 89.90,
      image: 'https://via.placeholder.com/300x300?text=Anel+Prata',
      category: 'Anéis',
      rating: 4.8
    },
    {
      id: 2,
      name: 'Brinco Argola Prata',
      price: 67.50,
      image: 'https://via.placeholder.com/300x300?text=Brinco+Argola',
      category: 'Brincos',
      rating: 4.6
    },
    {
      id: 3,
      name: 'Colar Coração Prata',
      price: 120.00,
      image: 'https://via.placeholder.com/300x300?text=Colar+Coração',
      category: 'Colares',
      rating: 4.9
    }
  ];

  constructor(private router: Router) { }

  // ✅ MODIFICADO: Usando signal para categoria ativa
  selectedCategory = signal<string>('all');

  // ✅ NOVO: Signal para forçar refresh no product-list
  forceRefresh = signal<number>(0);

  onProductClick(product: Product | number): void {
    const productId = typeof product === 'number' ? product : product.id;
    this.router.navigate(['/product', productId]);
  }

  onSearchChange(searchTerm: string): void {
    console.log('🔍 Search no Home:', searchTerm);

    if (!searchTerm) {
      // Se search foi limpo, força recarregamento dos produtos
      this.forceRefresh.update(val => val + 1);
    }
  }

  onCategoryClick(category: string): void {
    this.router.navigate(['/product'], {
      queryParams: { categoria: category.toLowerCase() }
    });
  }

  // ✅ NOVO: Handler para eventos de categoria do header
  onCategorySelected(event: { slug: string; isRefresh: boolean; category: Category }): void {
    console.log('🎯 Categoria selecionada:', event.slug, 'Refresh:', event.isRefresh);

    this.selectedCategory.set(event.slug);

    // ✅ SE FOR UM REFRESH, FORÇA O RELOAD NO PRODUCT-LIST
    if (event.isRefresh) {
      console.log('🔄 Forçando refresh no product-list...');
      this.forceRefresh.update(val => val + 1);
    }
  }
}
