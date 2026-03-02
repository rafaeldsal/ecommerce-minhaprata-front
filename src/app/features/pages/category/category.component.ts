import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageContainerComponent } from "../../../shared/components/layout/page-container/page-container.component";
import { ProductListComponent } from "../products/components/product-list/product-list.component";
import { CategoryDataService } from '../../../core/services/category/category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    ProductListComponent
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private categoryDataService = inject(CategoryDataService);

  categorySlug: string = ''; // Mudei para categorySlug
  categoryName: string = '';

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('slug') || ''; // Agora pega 'slug'
      this.loadCategoryName();
    });
  }

  loadCategoryName(): void {
    // ✅ CORREÇÃO: Busca todas as categorias e filtra pela slug
    this.categoryDataService.getCategories().subscribe({
      next: (categories) => {
        // Encontra a categoria com o slug correspondente
        const category = categories.find(cat =>
          cat.slug.toLowerCase() === this.categorySlug.toLowerCase()
        );

        this.categoryName = category?.name || 'Categoria';
      },
      error: (error) => {
        console.error('Erro ao carregar categoria:', error);
        this.categoryName = 'Categoria';
      }
    });
  }
}
