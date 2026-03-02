// src/app/core/services/state-reset.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class StateResetService {
  private router = inject(Router);

  resetAndGoHome(): void {
    // Limpa localStorage/sessionStorage se necessário
    localStorage.removeItem('searchTerm');
    localStorage.removeItem('filters');

    // Navega para home substituindo a URL atual
    this.router.navigate(['/'], {
      replaceUrl: true
    });
  }
}
