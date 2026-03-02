import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type NotificationType = 'success' | 'error' | 'warn' | 'info';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  // Método genérico
  show(message: string, type: NotificationType = 'info', title?: string) {
    this.messageService.add({
      severity: type,
      summary: title || this.getDefaultTitle(type),
      detail: message,
      life: type === 'error' ? 5000 : 3000
    });
  }

  // Métodos específicos para compatibilidade com código existente
  showSuccess(message: string, title?: string) {
    this.show(message, 'success', title);
  }

  showError(message: string, title?: string) {
    this.show(message, 'error', title);
  }

  showWarning(message: string, title?: string) {
    this.show(message, 'warn', title);
  }

  showInfo(message: string, title?: string) {
    this.show(message, 'info', title);
  }

  // Aliases para manter compatibilidade
  success(message: string, title?: string) {
    this.showSuccess(message, title);
  }

  error(message: string, title?: string) {
    this.showError(message, title);
  }

  warning(message: string, title?: string) {
    this.showWarning(message, title);
  }

  info(message: string, title?: string) {
    this.showInfo(message, title);
  }

  private getDefaultTitle(type: NotificationType): string {
    const titles = {
      success: 'Sucesso!',
      error: 'Erro',
      warn: 'Aviso',
      info: 'Informação'
    };
    return titles[type];
  }
}
