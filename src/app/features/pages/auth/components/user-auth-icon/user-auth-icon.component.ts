import { Component, OnInit, OnDestroy, signal, inject, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ModalService } from '../../../../../core/services/modal/modal.service';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';
import { User, UserRole } from '../../../../../core/models/user/user.model';

@Component({
  selector: 'app-user-auth-icon',
  templateUrl: './user-auth-icon.component.html',
  styleUrls: ['./user-auth-icon.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ProgressSpinnerModule]
})
export class UserAuthIconComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  private authSubscription?: Subscription;

  // Signals
  isLoading = signal(true);
  isDropdownOpen = signal(false);
  isNavigating = signal(false);
  isLoggingOut = signal(false);

  user = signal<User | null>(null);
  pendingOrders = signal(0);

  private clickListener?: (event: Event) => void;

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.user.set(state.user);
      this.isLoading.set(state.isLoading);

      // Só mostra loading inicial por 1 segundo para melhor UX
      if (state.isLoading) {
        setTimeout(() => {
          this.isLoading.set(false);
        }, 1000);
      }
    });

    this.setupClickOutsideListener();

    // Simular pedidos pendentes (em produção viria da API)
    this.simulatePendingOrders();
  }


  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.removeClickOutsideListener();
    this.modalService.closeAllModals();
  }

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    this.closeDropdown();
  }

  private simulatePendingOrders() {
    // Simula 0-3 pedidos pendentes baseado no ID do usuário
    const user = this.user();
    if (user) {
      const seed = user.id.charCodeAt(0) % 4; // 0-3
      this.pendingOrders.set(seed);
    }
  }

  navigateToLogin() {
    this.isNavigating.set(true);
    this.router.navigate(['/auth/login']).finally(() => {
      this.isNavigating.set(false);
    });
  }

  toggleDropdown() {
    if (this.isDropdownOpen()) {
      this.closeDropdown();
    } else {
      this.isDropdownOpen.set(true);

      // Em dispositivos mobile, abrir o modal global
      if (window.innerWidth < 768) {
        this.modalService.openUserMobileModal({
          user: this.user(),
          pendingOrders: this.pendingOrders(),
          onLogout: () => this.logout(),
          onNavigate: () => this.closeDropdown()
        });
      }
    }
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
    this.modalService.closeAllModals();
  }

  logout() {
    this.isLoggingOut.set(true);
    this.authService.logout();

    // Reset states após logout
    setTimeout(() => {
      this.isLoggingOut.set(false);
      this.closeDropdown();
    }, 1000);
  }


  getUserFirstName(): string {
    const user = this.user();
    return user?.name?.split(' ')[0] || 'Usuário';
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getUserPhoto(): string | null {
    const user = this.user();
    return user?.avatar || null;
  }

  private setupClickOutsideListener() {
    this.clickListener = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-trigger')) {
        this.closeDropdown();
      }
    };

    document.addEventListener('click', this.clickListener);
  }

  private removeClickOutsideListener() {
    if (this.clickListener) {
      document.removeEventListener('click', this.clickListener);
    }
  }

  isAdmin(): boolean {
    return this.user()?.role === UserRole.ADMIN;
  }
}
