export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  title?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface NotificationOptions {
  duration?: number;
  title?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

// 📋 MÉTODOS AUXILIARES
export class NotificationHelper {
  static getDefaultDuration(type: ToastNotification['type']): number {
    const durations = {
      success: 3000,
      error: 5000,
      info: 4000,
      warning: 4500
    };
    return durations[type];
  }

  static getNotificationIcon(type: ToastNotification['type']): string {
    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️'
    };
    return icons[type];
  }

  static getNotificationColor(type: ToastNotification['type']): string {
    const colors = {
      success: 'var(--success-color, #10b981)',
      error: 'var(--error-color, #ef4444)',
      info: 'var(--info-color, #3b82f6)',
      warning: 'var(--warning-color, #f59e0b)'
    };
    return colors[type];
  }

  static createNotification(
    type: ToastNotification['type'],
    message: string,
    options: NotificationOptions = {}
  ): ToastNotification {
    return {
      id: Date.now() + Math.random(),
      type,
      message,
      duration: options.duration || this.getDefaultDuration(type),
      title: options.title,
      action: options.action
    };
  }

  static createSuccess(message: string, options?: NotificationOptions): ToastNotification {
    return this.createNotification('success', message, options);
  }

  static createError(message: string, options?: NotificationOptions): ToastNotification {
    return this.createNotification('error', message, options);
  }

  static createInfo(message: string, options?: NotificationOptions): ToastNotification {
    return this.createNotification('info', message, options);
  }

  static createWarning(message: string, options?: NotificationOptions): ToastNotification {
    return this.createNotification('warning', message, options);
  }

  static shouldAutoClose(notification: ToastNotification): boolean {
    return notification.duration !== 0 && notification.duration !== undefined;
  }

  static formatNotificationMessage(message: string, params?: Record<string, any>): string {
    if (!params) return message;

    return message.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
}