import { Component, inject, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LucideAngularModule, X, Menu, User, ShoppingCart } from 'lucide-angular';

// Services
import { CategoryDataService } from '../../core/services/category/category.service';
import { NotificationService } from '../../core/services/notification/notification.service';

// Models
import { Category, CategorySlug } from '../../core/models/category/category.model';
import { PageContainerComponent } from '../../shared/components/layout/page-container/page-container.component';
import { CartIconComponent } from "../../features/pages/cart/components/cart-icon/cart-icon.component";
import { UserAuthIconComponent } from "../../features/pages/auth/components/user-auth-icon/user-auth-icon.component";
import { SearchService } from '../../core/services/search/search.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [
    LucideAngularModule,
    PageContainerComponent,
    CartIconComponent,
    UserAuthIconComponent
  ],
  standalone: true
})
export class HeaderComponent implements OnInit {
  readonly XIcon = X;
  readonly MenuIcon = Menu;
  readonly UserIcon = User;
  readonly CartIcon = ShoppingCart;

  // Services
  private router = inject(Router);
  private categoryDataService = inject(CategoryDataService);
  private notificationService = inject(NotificationService);
  private searchService = inject(SearchService);

  // ✅ MODIFICADO: Agora emite objeto com informações de refresh
  @Output() categorySelected = new EventEmitter<{
    slug: string;
    isRefresh: boolean;
    category: Category;
  }>();

  // State
  categories: Category[] = [];
  activeCategory: CategorySlug | string = CategorySlug.ALL;
  isMobileMenuOpen = false;
  isScrollingToTop = false;
  isScrolled = false;

  // ✅ NOVO: Controla a última categoria selecionada para detectar refresh
  private lastSelectedCategory: CategorySlug | string = CategorySlug.ALL;

  // Categoria "Todos" fixa
  private readonly allCategory: Category = {
    id: 'all-category',
    name: 'Todos',
    description: 'Todos os produtos disponíveis',
    slug: CategorySlug.ALL,
    icon: 'home',
    isActive: true,
    dtCreated: new Date(),
    dtUpdated: new Date()
  };

  ngOnInit(): void {
    this.loadCategories();
    this.checkScroll();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveCategoryFromRoute();
      });
  }

  private updateActiveCategoryFromRoute(): void {
    const url = this.router.url;

    if (url === '/' || url.startsWith('/?')) {
      this.activeCategory = CategorySlug.ALL;
    } else if (url.startsWith('/category/')) {
      const categorySlug = url.split('/')[2];
      this.activeCategory = categorySlug || CategorySlug.ALL;
    } else {
      this.activeCategory = CategorySlug.ALL;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScroll();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth >= 768 && this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isMobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  private checkScroll(): void {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isScrolled = scrollTop > 50;
  }

  private scrollToTop(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > 0) {
      this.isScrollingToTop = true;

      const duration = Math.max(400, Math.min(800, currentScroll * 1.2));
      const startTime = performance.now();
      const startPosition = currentScroll;

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const scrollY = startPosition * (1 - easeOutCubic(progress));
        window.scrollTo(0, scrollY);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          this.isScrollingToTop = false;
        }
      };

      requestAnimationFrame(animateScroll);
    }
  }

  // ========== CATEGORIES ==========
  loadCategories(): void {
    this.categoryDataService.getCategories().subscribe({
      next: (categories) => {
        this.categories = [this.allCategory, ...categories];
      },
      error: (error) => {
        console.error('Erro ao carregar categorias: ', error);
        this.categories = [this.allCategory];
      }
    });
  }

  // ========== MOBILE MENU ==========
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.updateBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.updateBodyScroll();
  }

  private updateBodyScroll(): void {
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  }

  // ========== NAVIGATION ==========
  onLogoClick(): void {
    this.navigateToHome();
    this.scrollToTop();
    this.searchService.clearSearch();
  }

  onCategorySelect(category: Category): void {
    const categorySlug = category.slug || CategorySlug.ALL;

    // ✅ DETECTA SE É UM REFRESH (mesma categoria clicada novamente)
    const isRefresh = this.lastSelectedCategory === categorySlug;
    this.lastSelectedCategory = categorySlug;

    this.activeCategory = categorySlug;

    // ✅ EMITE INFORMAÇÕES COMPLETAS PARA O COMPONENTE PAI
    this.categorySelected.emit({
      slug: categorySlug,
      isRefresh,
      category
    });

    this.scrollToTop();

    // ✅ CORREÇÃO: Lógica simplificada para navegação
    if (category.slug === CategorySlug.ALL || categorySlug === 'all') {
      // ✅ SEMPRE navega para home quando é "Todos"
      if (isRefresh) {
        // Força recarregamento da home com parâmetro de refresh
        this.router.navigate(['/'], {
          queryParams: { refresh: Date.now() }
        });
      } else {
        this.router.navigate(['/']);
      }
    } else {
      // ✅ Para categorias específicas
      if (isRefresh) {
        // Força recarregamento da mesma categoria
        this.router.navigate(['/category', category.slug], {
          queryParams: { refresh: Date.now() }
        });
      } else {
        this.router.navigate(['/category', category.slug]);
      }
    }

    // ✅ FEEDBACK VISUAL PARA REFRESH
    if (isRefresh) {
      console.log('🔄 Refresh da categoria:', category.name);
    }
  }

  onMobileCategorySelect(category: Category): void {
    this.onCategorySelect(category);
    this.closeMobileMenu();
  }

  trackByCategory(index: number, category: Category): string {
    return category.slug || `category-${index}`;
  }

  onCartClick(): void {
    this.router.navigate(['/cart']);
    this.scrollToTop();
    this.notificationService.showInfo('Abrindo carrinho...');
  }

  getCategoryIcon(materialIcon: string | undefined): string {
    if (!materialIcon) return 'circle';

    const iconMap: { [key: string]: string } = {
      'home': 'home',
      'category': 'grid',
      'shopping_bag': 'shopping-bag',
      'favorite': 'heart',
      'person': 'user',
      'settings': 'settings',
      'search': 'search',
      'menu': 'menu',
      'fa-solid fa-box': 'package',
      'box': 'package',
      'all': 'grid'
    };

    return iconMap[materialIcon] || 'circle';
  }

  private navigateToHome(): void {
    this.router.navigate(['/'], {
      replaceUrl: true
    });

    this.activeCategory = CategorySlug.ALL;
    this.lastSelectedCategory = CategorySlug.ALL;
    this.categorySelected.emit({
      slug: CategorySlug.ALL,
      isRefresh: false,
      category: this.allCategory
    });
    this.closeMobileMenu();
  }
}
