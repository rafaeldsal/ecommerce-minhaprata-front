// user-mobile-modal.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { User, UserRole } from '../../../../../core/models/user/user.model';

@Component({
  selector: 'app-user-mobile-modal',
  imports: [
    CommonModule,
    ProgressSpinnerModule
  ],
  standalone: true,
  templateUrl: './user-mobile-modal.component.html',
  styleUrl: './user-mobile-modal.component.scss'
})
export class UserMobileModalComponent {
  private router = inject(Router);

  @Input() isOpen = false;
  @Input() user: User | null = null;
  @Input() pendingOrders = 0;
  @Input() isLoggingOut = false;

  @Output() closed = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() navigate = new EventEmitter<string>();

  @HostListener('document:keydown.escape')
  handleEscapeKey() {
    if (this.isOpen) {
      this.close();
    }
  }

  close() {
    this.closed.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  // ✅ Métodos específicos para cada navegação
  onNavigateToProfile() {
    this.navigate.emit('/user/profile');
    this.closeAndNavigate('/user/profile');
  }

  onNavigateToOrders() {
    this.navigate.emit('/user/orders');
    this.closeAndNavigate('/user/orders');
  }

  onNavigateToAddresses() {
    this.navigate.emit('/user/addresses');
    this.closeAndNavigate('/user/addresses');
  }

  onNavigateToSettings() {
    this.navigate.emit('/user/settings');
    this.closeAndNavigate('/user/settings');
  }

  onNavigateToHelp() {
    this.navigate.emit('/user/help');
    this.closeAndNavigate('/user/help');
  }

  private closeAndNavigate(route: string) {
    this.close();
    this.router.navigate([route]);
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  getInitials(name: string): string {
    if (!name || name.trim().length === 0) return 'U';

    return name
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Método para obter a foto do usuário
  getUserPhoto(): string | null {
    return this.user?.avatar || null;
  }

  isAdmin(): boolean {
    return this.user?.role === UserRole.ADMIN;
  }
}
