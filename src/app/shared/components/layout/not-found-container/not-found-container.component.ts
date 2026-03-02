import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { StateResetService } from '../../../../core/services/state-reset.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './not-found-container.component.html',
  styleUrl: './not-found-container.component.scss'
})
export class NotFoundComponent {
  private router = inject(Router);
  private location = inject(Location);
  private stateResetService = inject(StateResetService);

  goBack(): void {
    // Volta para a página anterior mantendo o estado
    this.location.back();
  }

  goHome(): void {
    this.stateResetService.resetAndGoHome();
  }
}
