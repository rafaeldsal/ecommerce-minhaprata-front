// src/app/core/services/layout.service.ts
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isMobileMenuOpen = signal(false);
  private bodyScrollLocked = signal(false);

  isMobileMenuOpen$ = this.isMobileMenuOpen.asReadonly();
  bodyScrollLocked$ = this.bodyScrollLocked.asReadonly();

  constructor() {
    // Efeito para controlar o scroll do body
    effect(() => {
      const isLocked = this.bodyScrollLocked();
      if (isLocked) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
      }
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(state => !state);
    this.bodyScrollLocked.set(this.isMobileMenuOpen());
  }

  openMobileMenu() {
    this.isMobileMenuOpen.set(true);
    this.bodyScrollLocked.set(true);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    this.bodyScrollLocked.set(false);
  }

  handleEscapeKey() {
    if (this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }

  handleWindowResize() {
    if (window.innerWidth >= 768 && this.isMobileMenuOpen()) {
      this.closeMobileMenu();
    }
  }
}
