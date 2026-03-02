import { Component, computed, inject, input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

import { SelectModule } from 'primeng/select';
import { DataViewModule } from 'primeng/dataview';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';

import { Product, ProductHelper } from '../../../../../core/models/products/product.model';
import { ProductService } from '../../../../../core/services/product/product.service';
import { SearchService } from '../../../../../core/services/search/search.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductCardGridComponent } from "./components/product-card-grid/product-card-grid.component";
import { ProductCardListComponent } from "./components/product-card-list/product-card-list.component";

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataViewModule,
    SelectModule,
    SkeletonModule,
    SelectButtonModule,
    ProgressSpinnerModule,
    TagModule,
    ButtonModule,
    PaginatorModule,
    ProductCardGridComponent,
    ProductCardListComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnChanges, OnDestroy {
  private productService = inject(ProductService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  categoryFilter = input<string>('all');

  // ✅ NOVO: Input para forçar refresh vindo do home component
  forceRefresh = input<number>(0);

  products = signal<Product[]>([]);
  loading = signal<boolean>(true);

  currentPage = signal<number>(0);
  rowsPerPage = signal<number>(9);
  layout = signal<'list' | 'grid'>('grid');
  sortKey = signal<string>('name');

  isSearching = signal<boolean>(false);
  searchTerm = signal<string>('');
  searchResultsCount = signal<number>(0);
  totalRecords = signal<number>(0)
  lastRefreshTime = signal<number>(0);

  skeletonItems = Array.from({ length: 6 }, (_, i) => i);

  shouldShowNormalProducts = computed(() => {
    return !this.isSearching() || !this.searchTerm();
  });

  displayedProducts = computed(() => {
    return this.products();
  });

  totalPages = computed(() => {
    return Math.ceil(this.totalRecords() / this.rowsPerPage());
  });

  displayText = computed(() => {
    const total = this.totalRecords();
    const start = (this.currentPage() * this.rowsPerPage()) + 1;
    const end = Math.min((this.currentPage() + 1) * this.rowsPerPage(), total);

    const refreshIndicator = this.isRecentlyRefreshed() ? ' 🔄' : '';

    if (this.isSearching() && this.searchTerm()) {
      return `Mostrando ${start}-${end} de ${total} resultados para "${this.searchTerm()}"${refreshIndicator}`;
    } else if (this.categoryFilter() && this.categoryFilter() !== 'all') {
      const categoryName = this.getCategoryDisplayName(this.categoryFilter());
      return `Mostrando ${start}-${end} de ${total} produtos em ${categoryName}${refreshIndicator}`;
    } else {
      return `Mostrando ${start}-${end} de ${total} produtos${refreshIndicator}`;
    }
  });

  isRecentlyRefreshed = computed(() => {
    const lastRefresh = this.lastRefreshTime();
    return lastRefresh > 0 && (Date.now() - lastRefresh) < 3000;
  });

  sortOptions = signal<any[]>([
    { label: 'Nome A-Z', value: 'name' },
    { label: 'Nome Z-A', value: 'name-desc' },
    { label: 'Preço: Menor para Maior', value: 'price' },
    { label: 'Preço: Maior para Menor', value: 'price-desc' },
    { label: 'Em Estoque', value: 'stock' }
  ]);

  sortOptionsForSelect = computed(() => this.sortOptions());

  layoutOptions = signal([
    { label: 'Lista', value: 'list', icon: 'pi-bars' },
    { label: 'Grid', value: 'grid', icon: 'pi-table' }
  ]);

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.loadProducts();
    this.subscribeToSearchState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // ✅ DETECTA MUDANÇAS NA CATEGORIA
    if (changes['categoryFilter']) {
      this.currentPage.set(0);
      this.loadProducts();
    }

    // ✅ DETECTA FORÇA DE REFRESH VINDA DO HOME COMPONENT
    if (changes['forceRefresh'] && this.forceRefresh() > 0) {
      console.log('🔄 Refresh forçado detectado!');
      this.refreshProducts();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSortChange(event: any) {
    this.sortKey.set(event.value);
    this.currentPage.set(0);
    this.loadProducts();
  }

  onPageChange(event: any) {
    this.currentPage.set(event.page);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onProductClick(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  clearSearch(): void {
    this.searchService.clearSearch();
  }

  // ✅ NOVO: Método público para refresh manual
  refreshProducts(): void {
    console.log('🔄 Recarregando produtos...');
    this.lastRefreshTime.set(Date.now());
    this.currentPage.set(0);
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  sortedSearchProducts = computed(() => {
    if (!this.isSearching()) return this.products();

    const products = this.products();
    const sortKey = this.sortKey();

    if (!products.length) return [];

    return [...products].sort((a, b) => {
      switch (sortKey) {
        case 'name': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price': return (a.price || 0) - (b.price || 0);
        case 'price-desc': return (b.price || 0) - (a.price || 0);
        case 'stock':
          if (a.inStock && !b.inStock) return -1;
          if (!a.inStock && b.inStock) return 1;
          return 0;
        default: return 0;
      }
    });
  });

  getSeverity(product: Product): string {
    return product.inStock ? 'success' : 'danger';
  }

  getCategoryDisplayName(categorySlug: string): string {
    const categoryMap: { [key: string]: string } = {
      'aneis': 'Anéis',
      'braceletes': 'Braceletes',
      'colares': 'Colares',
      'brincos': 'Brincos',
      'all': 'Todos os Produtos'
    };
    return categoryMap[categorySlug] || categorySlug;
  }

  getProductImage(product: Product): string {
    return ProductHelper.getMainImage(product);
  }

  private loadProducts(): void {
    // Não carrega produtos normais se está em meio a uma busca
    if (this.isSearching() && this.searchTerm()) {
      console.log('⏸️  Ignorando loadProducts - em modo busca');
      return;
    }

    this.loading.set(true);

    const categoryFilter = this.categoryFilter();

    console.log('🔄 Carregando produtos para categoria:', categoryFilter);

    const sortMapping: { [key: string]: { sortBy: string, sortOrder: string } } = {
      'name': { sortBy: 'name', sortOrder: 'asc' },
      'name-desc': { sortBy: 'name', sortOrder: 'desc' },
      'price': { sortBy: 'price', sortOrder: 'asc' },
      'price-desc': { sortBy: 'price', sortOrder: 'desc' },
      'stock': { sortBy: 'stockQuantity', sortOrder: 'desc' }
    };

    const sortConfig = sortMapping[this.sortKey()] || { sortBy: 'name', sortOrder: 'asc' };

    if (categoryFilter && categoryFilter !== 'all') {
      this.loadProductsByCategory(categoryFilter, sortConfig);
    } else {
      this.loadAllProducts(sortConfig);
    }
  }


  private loadAllProducts(sortConfig: { sortBy: string, sortOrder: string }): void {
    this.productService.getProducts(
      this.currentPage(),
      this.rowsPerPage(),
      undefined,
      sortConfig.sortBy,
      sortConfig.sortOrder
    ).subscribe({
      next: (result) => {
        this.handleProductsLoaded(result.products, result.total);
      },
      error: (error) => {
        console.error('Erro ao carregar os produtos:', error);
        this.loading.set(false);
      }
    });
  }

  private loadProductsByCategory(categorySlug: string, sortConfig: { sortBy: string, sortOrder: string }): void {
    this.productService.getProductsByCategorySlug(
      categorySlug,
      this.currentPage(),
      this.rowsPerPage(),
      sortConfig.sortBy,
      sortConfig.sortOrder
    ).subscribe({
      next: (result) => {
        this.handleProductsLoaded(result.products, result.total);
      },
      error: (error) => {
        console.error('Erro ao filtrar produtos:', error);
        this.loading.set(false);
      }
    });
  }

  private handleProductsLoaded(products: Product[], total: number): void {
    this.products.set(products);
    this.totalRecords.set(total); // ✅ AGORA FUNCIONA - totalRecords é WritableSignal
    this.loading.set(false);

    console.log(`📊 Página ${this.currentPage() + 1}: ${products.length} produtos de ${total} total`);

    if (this.isRecentlyRefreshed()) {
      console.log('✅ Produtos atualizados com sucesso!');
    }
  }

  private subscribeToSearchState(): void {
    const searchStateSub = this.searchService.searchState$.subscribe(
      state => {
        console.log('🔍 SearchState atualizado:', {
          isSearching: state.isSearching,
          term: state.term,
          hasSearched: state.hasSearched,
          resultsCount: state.resultsCount
        });

        this.isSearching.set(state.isSearching);
        this.searchTerm.set(state.term);
        this.searchResultsCount.set(state.resultsCount);

        if (state.isSearching) {
          this.loading.set(true);
        }
        else if (state.hasSearched && state.term) {
          // ✅ BUSCA COM RESULTADOS
          console.log('🎯 Mostrando resultados da busca:', state.results.length);
          this.products.set(state.results);
          this.totalRecords.set(state.resultsCount);
          this.loading.set(false);
        }
        else if (state.hasSearched && !state.term) {
          // ✅ BUSCA LIMPA - volta para produtos normais
          console.log('🔄 Busca limpa - voltando para produtos normais');
          this.currentPage.set(0);
          this.loadProducts();
        }
      }
    );

    this.subscriptions.add(searchStateSub);
  }
}
