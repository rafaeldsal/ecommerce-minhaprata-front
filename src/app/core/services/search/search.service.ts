import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../../models/products/product.model';
import { ProductService } from '../product/product.service';

export interface SearchState {
  term: string;
  results: Product[];
  isSearching: boolean;
  hasSearched: boolean;
  lastSearchTime?: Date;
  resultsCount: number;
  activeFilters: SearchFilters;
}

export interface SearchFilters {
  categories: string[]; // IDs de categoria
  priceRange?: { min: number; max: number };
  inStockOnly: boolean;
  sortBy: 'name' | 'price' | 'dtCreated' | 'stockQuantity'; // ✅ Compatível com API
  sortOrder: 'asc' | 'desc'; // ✅ Adicionado para API
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly SEARCH_HISTORY_KEY = 'minhaprata_search_history';
  private readonly MAX_SEARCH_HISTORY = 10;

  private productService = inject(ProductService);

  // 🎯 ESTADOS DA BUSCA
  private searchState = new BehaviorSubject<SearchState>(this.getInitialState());
  public searchState$: Observable<SearchState> = this.searchState.asObservable();

  // 🔍 HISTÓRICO DE BUSCAS
  private searchHistory = new BehaviorSubject<string[]>(this.loadSearchHistory());
  public searchHistory$: Observable<string[]> = this.searchHistory.asObservable();

  // ⚡ SUGESTÕES EM TEMPO REAL
  private searchSuggestions = new BehaviorSubject<string[]>([]);
  public searchSuggestions$: Observable<string[]> = this.searchSuggestions.asObservable();

  // ========== 🔍 MÉTODOS PÚBLICOS PRINCIPAIS ==========

  /**
   * ✅ REFATORADO: Busca real usando API
   */
  searchProducts(term: string, filters?: Partial<SearchFilters>): void {
    const trimmedTerm = term.trim();

    if (!trimmedTerm) {
      this.clearSearch();
      return;
    }

    this.setIsSearching(true);
    this.setSearchTerm(trimmedTerm);
    this.addToSearchHistory(trimmedTerm);

    // ✅ Prepara parâmetros para API
    const searchParams = this.buildSearchParams(trimmedTerm, filters);

    // ✅ Chama API real
    this.productService.searchProductsWithParams(searchParams).subscribe({
      next: (response) => {
        this.setSearchResults(response.products);
        this.updateSearchStateFilters({
          ...this.searchState.value.activeFilters,
          ...filters
        });
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        this.setSearchResults([]);
      }
    });
  }

  /**
   * ✅ NOVO: Busca com filtros aplicados na API
   */
  searchWithFilters(term: string, filters: SearchFilters): void {
    this.searchProducts(term, filters);
  }

  /**
   * ✅ MELHORADO: Aplica filtros à busca atual (frontend apenas para filtros simples)
   */
  applyFiltersToCurrentSearch(filters: Partial<SearchFilters>): void {
    const currentState = this.searchState.value;

    if (currentState.term) {
      // Refaz a busca com novos filtros
      this.searchProducts(currentState.term, {
        ...currentState.activeFilters,
        ...filters
      });
    }
  }

  /**
   * ✅ CORRIGIDO: Define o termo de busca
   */
  setSearchTerm(term: string): void {
    const trimmedTerm = term.trim();
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      term: trimmedTerm,
      hasSearched: trimmedTerm.length > 0
    });

    if (trimmedTerm.length > 0) {
      this.updateSearchSuggestions(trimmedTerm);
    }
  }

  /**
   * ✅ CORRIGIDO: Define os resultados da busca
   */
  setSearchResults(products: Product[]): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      results: products,
      isSearching: false,
      lastSearchTime: new Date(),
      resultsCount: products.length
    });
  }

  /**
   * ✅ CORRIGIDO: Limpa toda a busca
   */
  clearSearch(): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...this.getInitialState(),
      // Mantém o histórico de que já buscou, mas sem termo
      hasSearched: currentState.hasSearched
    });

    this.searchSuggestions.next([]);

    console.log('🔍 Busca limpa - estado restaurado');
  }

  resetSearch(): void {
    this.searchState.next(this.getInitialState());
    this.searchSuggestions.next([]);
    console.log('🔍 Busca completamente resetada');
  }

  // ========== 🎛️ MÉTODOS DE FILTRO SIMPLIFICADOS ==========

  /**
   * ✅ SIMPLIFICADO: Limpa todos os filtros
   */
  clearFilters(): void {
    const currentState = this.searchState.value;
    const term = currentState.term;

    if (term) {
      // Refaz a busca sem filtros
      this.searchProducts(term);
    }
  }

  // ========== 📚 HISTÓRICO DE BUSCAS (MANTIDO) ==========

  /**
   * Adiciona termo ao histórico
   */
  addToSearchHistory(term: string): void {
    const currentHistory = this.searchHistory.value;
    const filteredHistory = currentHistory.filter(item => item !== term);
    const newHistory = [term, ...filteredHistory].slice(0, this.MAX_SEARCH_HISTORY);

    this.searchHistory.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Remove termo do histórico
   */
  removeFromSearchHistory(term: string): void {
    const currentHistory = this.searchHistory.value;
    const newHistory = currentHistory.filter(item => item !== term);

    this.searchHistory.next(newHistory);
    this.saveSearchHistory(newHistory);
  }

  /**
   * Limpa todo o histórico
   */
  clearSearchHistory(): void {
    this.searchHistory.next([]);
    localStorage.removeItem(this.SEARCH_HISTORY_KEY);
  }

  /**
   * ✅ ATUALIZADO: Termos de busca reais
   */
  getPopularSearches(): string[] {
    return [
      'anel prata 925',
      'colar coração',
      'brinco pedra',
      'pulseira prata',
      'bracelete feminino',
      'conjunto prata'
    ];
  }

  // ========== 💡 SUGESTÕES EM TEMPO REAL (MANTIDO) ==========

  /**
   * Atualiza sugestões de busca
   */
  private updateSearchSuggestions(term: string): void {
    if (term.length < 2) {
      this.searchSuggestions.next([]);
      return;
    }

    const suggestions = this.generateSearchSuggestions(term);
    this.searchSuggestions.next(suggestions);
  }

  /**
   * Gera sugestões de busca
   */
  private generateSearchSuggestions(term: string): string[] {
    const popularSearches = this.getPopularSearches();
    const history = this.searchHistory.value;

    const allSuggestions = [...popularSearches, ...history];

    return allSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 5);
  }

  // ========== 🔧 MÉTODOS AUXILIARES ==========

  /**
   * ✅ NOVO: Constrói parâmetros para API
   */
  private buildSearchParams(term: string, filters?: Partial<SearchFilters>): any {
    const activeFilters = {
      ...this.searchState.value.activeFilters,
      ...filters
    };

    return {
      q: term,
      categories: activeFilters.categories?.length > 0 ? activeFilters.categories : undefined,
      minPrice: activeFilters.priceRange?.min,
      maxPrice: activeFilters.priceRange?.max,
      inStock: activeFilters.inStockOnly || undefined,
      sortBy: activeFilters.sortBy,
      sortOrder: activeFilters.sortOrder,
      page: 0, // Sempre começa na página 0 para search
      size: 50 // Busca mais resultados para permitir filtros frontend
    };
  }

  /**
   * ✅ CORRIGIDO: Define estado de "buscando"
   */
  setIsSearching(searching: boolean): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      isSearching: searching
    });
  }

  /**
   * ✅ CORRIGIDO: Atualiza filtros no estado
   */
  private updateSearchStateFilters(filters: SearchFilters): void {
    const currentState = this.searchState.value;

    this.searchState.next({
      ...currentState,
      activeFilters: filters
    });
  }

  // ========== 💾 GERENCIAMENTO DE STORAGE (MANTIDO) ==========

  private loadSearchHistory(): string[] {
    try {
      const stored = localStorage.getItem(this.SEARCH_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar histórico de busca:', error);
      return [];
    }
  }

  private saveSearchHistory(history: string[]): void {
    try {
      localStorage.setItem(this.SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erro ao salvar histórico de busca:', error);
    }
  }

  private getInitialState(): SearchState {
    return {
      term: '',
      results: [],
      isSearching: false,
      hasSearched: false,
      resultsCount: 0,
      activeFilters: {
        categories: [],
        inStockOnly: false,
        sortBy: 'name',
        sortOrder: 'asc'
      }
    };
  }

  // ========== 🔧 MÉTODOS DE CONSULTA ==========

  get isSearching(): boolean {
    return this.searchState.value.isSearching;
  }

  get searchTerm(): string {
    return this.searchState.value.term;
  }

  get hasResults(): boolean {
    return this.searchState.value.resultsCount > 0;
  }

  get resultsCount(): number {
    return this.searchState.value.resultsCount;
  }

  get activeFilters(): SearchFilters {
    return this.searchState.value.activeFilters;
  }

  get currentSearchState(): SearchState {
    return this.searchState.value;
  }
}
