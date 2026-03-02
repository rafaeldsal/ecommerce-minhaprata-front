import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import {
  Category,
  CategoryFormData,
  CategoryHelper,
  CategorySlug,
  CategoryFilters,
  ApiCategory,
  ApiSuccessResponse
} from '../../models/category/category.model';
import { NotificationService } from '../notification/notification.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  selectedCategories: string[];
  filters: {
    search: string;
    status: 'all' | 'active' | 'inactive';
    parent: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CategoryDataService {
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  private apiUrl = `${environment.apiUrl}/category`;

  // Estado local para gerenciamento interno
  private state = new BehaviorSubject<CategoryState>({
    categories: [],
    loading: false,
    selectedCategories: [],
    filters: {
      search: '',
      status: 'all',
      parent: ''
    }
  });

  public state$ = this.state.asObservable();

  // ========== CRUD OPERATIONS ==========

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiSuccessResponse<ApiCategory[]>>(this.apiUrl).pipe(
      map(response => this.transformApiCategories(response.data)),
      catchError(error => {
        console.error('Erro ao buscar categorias:', error);
        this.notificationService.showError('Erro ao carregar categorias');
        return of([]);
      })
    );
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.http.get<ApiSuccessResponse<ApiCategory>>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.transformApiCategory(response.data)),
      catchError(error => {
        console.error('Erro ao buscar categoria por ID: ', error);
        this.notificationService.showError('Erro ao buscar categoria');
        return of(undefined);
      })
    );
  }

  createCategory(categoryData: CategoryFormData): Observable<Category> {
    const apiData = this.prepareCategoryForApi(categoryData);

    return this.http.post<ApiSuccessResponse<ApiCategory>>(this.apiUrl, apiData).pipe(
      map(response => {
        const newCategory = this.transformApiCategory(response.data);
        this.notificationService.showSuccess('Categoria criada com sucesso!');
        return newCategory;
      }),
      catchError(error => {
        console.error('Erro ao criar categoria:', error);
        this.notificationService.showError('Erro ao criar categoria');
        throw error;
      })
    );
  }

  updateCategory(id: string, updates: Partial<CategoryFormData>): Observable<Category> {
    const validation = CategoryHelper.validateCategoryForm(updates as CategoryFormData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const apiData = this.prepareCategoryForApi(updates as CategoryFormData);

    return this.http.put<ApiSuccessResponse<ApiCategory>>(`${this.apiUrl}/${id}`, apiData).pipe(
      map(response => {
        const updatedCategory = this.transformApiCategory(response.data); // ⬅️ E aqui
        this.notificationService.showSuccess('Categoria atualizada com sucesso!');
        return updatedCategory;
      }),
      catchError(error => {
        console.error('Erro ao atualizar categoria:', error);
        this.notificationService.showError('Erro ao atualizar categoria');
        throw error;
      })
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        this.notificationService.showSuccess('Categoria excluída com sucesso!');
        return true;
      }),
      catchError(error => {
        console.error('Erro ao excluir categoria:', error);
        this.notificationService.showError('Erro ao excluir categoria');
        throw error;
      })
    );
  }

  // ========== MÉTODOS DE TRANSFORMAÇÃO ==========

  private transformApiCategories(apiCategories: ApiCategory[]): Category[] {
    return apiCategories.map(apiCat => this.transformApiCategory(apiCat));
  }

  private transformApiCategory(apiCategory: ApiCategory): Category {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      description: apiCategory.description,
      icon: apiCategory.icon,
      slug: this.mapSlugToEnum(apiCategory.slug),
      isActive: apiCategory.isActive,
      dtCreated: new Date(apiCategory.dtCreated),
      dtUpdated: new Date(apiCategory.dtUpdated)
    };
  }

  private mapSlugToEnum(slug: string): CategorySlug {
    const slugMap: Record<string, CategorySlug> = {
      'ANEIS': CategorySlug.ANEIS,
      'BRINCOS': CategorySlug.BRINCOS,
      'COLARES': CategorySlug.COLARES,
      'BRACELETES': CategorySlug.BRACELETES
    };

    return slugMap[slug] || CategorySlug.ALL;
  }

  private prepareCategoryForApi(categoryData: CategoryFormData): any {
    return {
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      slug: categoryData.slug,
      isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
    };
  }

  // ========== MÉTODOS AUXILIARES ==========

  sanitizeSvg(svgString: string) {
    return this.sanitizer.bypassSecurityTrustHtml(svgString);
  }

  searchCategories(term: string): Observable<Category[]> {
    return this.getCategories().pipe(
      map(categories =>
        categories.filter(cat =>
          cat.name.toLowerCase().includes(term.toLowerCase()) ||
          cat.description.toLowerCase().includes(term.toLowerCase())
        )
      )
    );
  }

  // ========== STATE MANAGEMENT ==========

  setLoading(loading: boolean): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      loading
    });
  }

  setSelectedCategories(selectedCategories: string[]): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      selectedCategories
    });
  }

  setFilters(filters: Partial<CategoryFilters>): void {
    const currentState = this.state.value;
    this.state.next({
      ...currentState,
      filters: {
        ...currentState.filters,
        ...filters
      }
    });
  }

  // ========== UTILITY GETTERS ==========

  hasSelectedCategories(): boolean {
    return this.state.value.selectedCategories.length > 0;
  }

  getSelectedCount(): number {
    return this.state.value.selectedCategories.length;
  }

  isAllSelected(categories: Category[]): boolean {
    return this.state.value.selectedCategories.length === categories.length;
  }

  toggleCategorySelection(categoryId: string): void {
    const currentSelected = this.state.value.selectedCategories;
    const selectedCategories = currentSelected.includes(categoryId)
      ? currentSelected.filter(id => id !== categoryId)
      : [...currentSelected, categoryId];

    this.setSelectedCategories(selectedCategories);
  }

  selectAllCategories(categories: Category[]): void {
    const allIds = categories.map(cat => cat.id);
    this.setSelectedCategories(allIds);
  }

  clearSelection(): void {
    this.setSelectedCategories([]);
  }
}
