import { inject, Injectable } from "@angular/core";
import { NotificationService } from "../notification/notification.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
import { ApiProduct, PaginatedResponse, Product, ProductFormData, ProductHelper, ProductImage } from "../../models/products/product.model";
import { ApiCategory, ApiSuccessResponse, Category } from "../../models/category/category.model";
import { catchError, map, Observable, of } from "rxjs";
import { ProductAdminHelper, ProductFilters } from "../../models/products/product-admin.model";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private notificationService = inject(NotificationService);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/product`;

  // ========== 🛍️ MÉTODOS PÚBLICOS - CLIENTE ==========

  getProducts(
    page: number = 0,
    size: number = 9,
    name?: string,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): Observable<{ products: Product[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<ApiSuccessResponse<PaginatedResponse<ApiProduct>>>(this.apiUrl, { params }).pipe(
      map(response => ({
        products: this.transformApiProducts(response.data.content),
        total: response.data.totalElements
      })),
      catchError(error => this.handleError('Erro ao carregar produtos', error))
    );
  }

  getProductsByCategorySlug(
    slug: string,
    page: number = 0,
    size: number = 9,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): Observable<{ products: Product[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    return this.http.get<ApiSuccessResponse<PaginatedResponse<ApiProduct>>>(
      `${this.apiUrl}/category/slug/${slug}`,
      { params }
    ).pipe(
      map(response => ({
        products: this.transformApiProducts(response.data.content),
        total: response.data.totalElements
      })),
      catchError(error => this.handleError('Erro ao filtrar produtos por categoria', error))
    );
  }

  getProductsByCategoryId(
    categoryId: string,
    page: number = 0,
    size: number = 9,
    name?: string,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): Observable<{ products: Product[], total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (name) {
      params = params.set('name', name);
    }

    return this.http.get<ApiSuccessResponse<PaginatedResponse<ApiProduct>>>(
      `${this.apiUrl}/category/${categoryId}/products`,
      { params }
    ).pipe(
      map(response => ({
        products: this.transformApiProducts(response.data.content),
        total: response.data.totalElements
      })),
      catchError(error => this.handleError('Erro ao filtrar produtos por categoria', error))
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    return this.http.get<ApiSuccessResponse<ApiProduct>>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.transformApiProduct(response.data)),
      catchError(error => {
        console.error('Erro ao buscar produto por ID:', error);
        this.notificationService.showError('Produto não encontrado');
        return of(undefined);
      })
    );
  }

  searchProductsWithParams(params: {
    q: string;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    size?: number;
  }): Observable<{ products: Product[], total: number }> {

    // ✅ CORREÇÃO: Usa POST em vez de GET
    return this.http.post<ApiSuccessResponse<PaginatedResponse<ApiProduct>>>(
      `${this.apiUrl}/search`,
      params // ✅ Envia no body
    ).pipe(
      map(response => ({
        products: this.transformApiProducts(response.data.content),
        total: response.data.totalElements
      })),
      catchError(error => this.handleError('Erro na busca', error))
    );
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    if (!searchTerm.trim()) {
      return this.getProducts(0, 100).pipe(map(result => result.products));
    }

    return this.searchProductsWithParams({ q: searchTerm }).pipe(
      map(result => result.products)
    );
  }

  getFeaturedProducts(limit: number = 6): Observable<Product[]> {
    return this.getProducts(0, limit, undefined, 'dtCreated', 'desc').pipe(
      map(result => result.products.slice(0, limit)),
      catchError(error => this.handleError('Erro ao carregar produtos em destaque', error))
    );
  }

  // ========== ⚙️ MÉTODOS PÚBLICOS - ADMIN ==========

  getProductsWithFilters(
    filters: ProductFilters,
    page: number = 0,
    pageSize: number = 9
  ): Observable<{ products: Product[], total: number }> {
    const params = this.buildFilterParams(filters, page, pageSize);

    return this.http.get<ApiSuccessResponse<{ products: ApiProduct[], total: number }>>(
      `${this.apiUrl}/admin/filtered`, { params }
    ).pipe(
      map(response => ({
        products: this.transformApiProducts(response.data.products),
        total: response.data.total
      })),
      catchError(error => this.handleError('Erro ao filtrar produtos', error))
    );
  }

  createProduct(productData: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(productData);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    // 🆕 Validação específica para options
    const optionsValidation = ProductHelper.validateOptions(productData.options || []);
    if (!optionsValidation.isValid) {
      this.notificationService.showError(optionsValidation.errors[0]);
      throw new Error(optionsValidation.errors[0]);
    }

    const apiData = ProductHelper.prepareProductForApi(productData);

    return this.http.post<ApiSuccessResponse<ApiProduct>>(this.apiUrl, apiData).pipe(
      map(response => {
        const newProduct = this.transformApiProduct(response.data);
        this.notificationService.showSuccess('Produto criado com sucesso!');
        return newProduct;
      }),
      catchError(error => this.handleError('Erro ao criar produto', error, true))
    );
  }

  updateProduct(id: string, updates: ProductFormData): Observable<Product> {
    const validation = ProductAdminHelper.validateProductForm(updates);
    if (!validation.isValid) {
      this.notificationService.showError(validation.errors[0]);
      throw new Error(validation.errors[0]);
    }

    const apiData = ProductHelper.prepareProductForApi(updates);

    return this.http.put<ApiSuccessResponse<ApiProduct>>(`${this.apiUrl}/${id}`, apiData).pipe(
      map(response => {
        const updatedProduct = this.transformApiProduct(response.data);
        this.notificationService.showSuccess('Produto atualizado com sucesso!');
        return updatedProduct;
      }),
      catchError(error => this.handleError('Erro ao atualizar produto', error, true))
    );
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.http.delete<ApiSuccessResponse<boolean>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        this.notificationService.showSuccess('Produto excluído com sucesso!');
        return response.data;
      }),
      catchError(error => this.handleError('Erro ao excluir produto', error, true))
    );
  }

  // ========== 🔧 MÉTODOS DE TRANSFORMAÇÃO ==========

  private transformApiProducts(apiProducts: ApiProduct[]): Product[] {
    return apiProducts.map(apiProduct => this.transformApiProduct(apiProduct));
  }

  private transformApiProduct(apiProduct: ApiProduct): Product {
    // Transforma images da API para formato do frontend
    const productImages: ProductImage[] = (apiProduct.productImage || []).map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      imageOrder: img.imageOrder || 0,
      isPrimary: img.isPrimary || false,
      altText: img.altText || `Imagem do produto ${apiProduct.name}`
    }));

    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: apiProduct.description,
      price: apiProduct.price,
      stockQuantity: apiProduct.stockQuantity,
      isActive: apiProduct.isActive ?? true,
      dtCreated: new Date(apiProduct.dtCreated),
      dtUpdated: new Date(apiProduct.dtUpdated),
      category: this.transformApiCategory(apiProduct.category),
      productImage: productImages,
      options: apiProduct.options || [],
      inStock: (apiProduct.stockQuantity > 0) && (apiProduct.isActive ?? true)
    };
  }

  private transformApiCategory(apiCategory: ApiCategory): Category {
    // Reutilize a lógica do CategoryService se necessário
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      description: apiCategory.description,
      slug: apiCategory.slug, // Já deve vir mapeado do backend
      icon: apiCategory.icon,
      isActive: apiCategory.isActive,
      dtCreated: new Date(apiCategory.dtCreated),
      dtUpdated: new Date(apiCategory.dtUpdated)
    };
  }

  // ========== 🛠️ MÉTODOS AUXILIARES ==========

  private buildFilterParams(filters: ProductFilters, page: number, pageSize: number): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.priceRange.min !== undefined) {
      params = params.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max !== undefined) {
      params = params.set('maxPrice', filters.priceRange.max.toString());
    }
    if (filters.stockStatus !== undefined) {
      params = params.set('inStock', filters.stockStatus.toString());
    }

    return params;
  }

  private handleError(message: string, error: any, rethrow: boolean = false): Observable<any> {
    console.error(message, error);
    this.notificationService.showError(message);

    if (rethrow) {
      throw error;
    }

    return of([]); // Ou o valor padrão apropriado
  }
}
