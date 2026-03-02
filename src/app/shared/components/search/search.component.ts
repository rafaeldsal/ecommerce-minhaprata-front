import { Component, ElementRef, EventEmitter, HostListener, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Product, ProductHelper } from '../../../core/models/products/product.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap, tap, catchError, of, map } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { SearchService } from '../../../core/services/search/search.service';
import { ProductService } from '../../../core/services/product/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, Search, X, ArrowRight, SearchX } from 'lucide-angular';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    ProgressSpinnerModule,
    InputIconModule,
    IconFieldModule,
    ButtonModule,
    LucideAngularModule
  ],
  standalone: true
})
export class SearchComponent implements OnInit, OnDestroy {
  readonly XIcon = X;
  readonly searchIcon = Search;
  readonly SearchX = SearchX;
  readonly ArrowRightIcon = ArrowRight;

  @ViewChild('searchInput') searchInput!: ElementRef;

  @Output() searchChange = new EventEmitter<string>();
  @Output() productSelected = new EventEmitter<Product>();

  searchTerm: string = '';
  showResults: boolean = false;
  isLoading: boolean = false;
  hasSearched: boolean = false;

  filteredProducts: Product[] = [];

  searchSuggestions: string[] = [
    'anel', 'bracelete', 'brinco', 'colar'
  ];

  private searchSubject = new Subject<string>();
  private subscriptions = new Subscription();
  private isClickingResult: boolean = false;

  private router = inject(Router);
  private searchService = inject(SearchService);
  private productService = inject(ProductService);

  ngOnInit(): void {
    const searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.hasSearched = true;
      }),
      switchMap(searchTerm => this.performSearch(searchTerm))
    ).subscribe({
      next: (products) => {
        this.filteredProducts = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Erro na busca por produto: ", error);
        this.isLoading = false;
        this.filteredProducts = [];
      }
    });

    this.subscriptions.add(searchSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const searchBox = this.searchInput.nativeElement.closest('.search-box');

    if (!searchBox?.contains(target) && !this.isClickingResult) {
      this.showResults = false;
    }
    this.isClickingResult = true;
  }

  onBlur(): void {
    // Pequeno delay para permitir cliques nos resultados
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  onSearchInput(event: any): void {
    const value = event.target.value;
    this.searchTerm = value;

    console.log('🔍 Input de busca:', value);

    if (value.length === 0) {
      this.clearSearch();
      return;
    }

    this.searchSubject.next(value);
  }

  onInputFocus(): void {
    if (this.hasSearched && this.searchTerm.length >= 3 && this.filteredProducts.length > 0) {
      this.showResults = true;
    }
  }

  private performSearch(searchTerm: string) {
    if (searchTerm.length < 3) {
      this.showResults = false;
      this.filteredProducts = [];
      this.searchChange.emit(searchTerm);
      return of([]);
    }

    console.log('🎯 Executando busca por:', searchTerm);

    this.showResults = true;
    this.searchService.searchProducts(searchTerm);

    return this.searchService.searchState$.pipe(
      map(state => state.results),
      distinctUntilChanged(),
      tap(products => {
        console.log('📦 Resultados da busca:', products.length);
        this.filteredProducts = products;
        this.searchChange.emit(searchTerm);
      }),
      catchError((error: any) => {
        console.error('❌ Erro ao buscar produtos:', error);
        this.searchChange.emit(searchTerm);
        return of([]);
      })
    );
  }

  selectProduct(product: Product): void {
    this.isClickingResult = true;
    this.productSelected.emit(product);
    this.showResults = false;
    this.searchTerm = product.name;

    this.router.navigate(['/product', product.id]);

    setTimeout(() => {
      this.isClickingResult = false;
    }, 100);
  }

  applySuggestion(suggestion: string): void {
    this.searchTerm = suggestion;
    this.searchInput.nativeElement.value = suggestion;
    this.searchSubject.next(suggestion);
    this.searchInput.nativeElement.focus();
  }

  clearSearch(): void {
    console.log('🧹 Limpando busca...');

    this.searchTerm = '';
    this.showResults = false;
    this.hasSearched = false;
    this.filteredProducts = [];

    // ✅ IMPORTANTE: Emite evento vazio E limpa o serviço
    this.searchChange.emit('');
    this.searchService.clearSearch();

    // ✅ Foca no input para melhor UX
    setTimeout(() => {
      this.searchInput.nativeElement.focus();
    }, 100);
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.showResults = false;
        this.searchInput.nativeElement.blur();
        break;
      case 'Enter':
        if (this.filteredProducts.length === 1) {
          this.selectProduct(this.filteredProducts[0]);
        } else if (this.filteredProducts.length > 0) {
          this.showResults = true;
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Implementar navegação por teclado se necessário
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Implementar navegação por teclado se necessário
        break;
    }
  }

  getProductImage(product: Product): string {
    return ProductHelper.getMainImage(product);
  }

  getProductAriaLabel(product: Product): string {
    const category = product.category?.name || 'Categoria';
    const price = product.price.toFixed(2);
    const stockStatus = product.inStock ? 'em estoque' : 'fora de estoque';
    return `${product.name}, ${category}, R$ ${price}, ${stockStatus}`;
  }

  viewAllResults(): void {
    // Navega para página de busca com o termo atual
    this.router.navigate(['/busca'], {
      queryParams: { q: this.searchTerm }
    });
    this.showResults = false;
  }
}
