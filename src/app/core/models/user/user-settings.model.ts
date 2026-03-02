export interface UserSettings {
  account: AccountSettings;
  privacy: PrivacySettings;
  notifications: NotificationSettings;
  devices: DeviceSession[];
}

export interface AccountSettings {
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface PrivacySettings {
  // Dados de Compras e Perfil
  showPurchaseHistory: boolean;
  showWishlist: boolean;
  hideOrderPrices: boolean;

  // Marketing e Recomendações
  personalizedRecommendations: boolean;
  priceDropNotifications: boolean;
  abandonedCartReminders: boolean;
  productReviewReminders: boolean;

  // Compartilhamento de Dados
  dataSharing: boolean;
  thirdPartyMarketing: boolean;
  browserTracking: boolean;

  // Segurança e Pagamentos
  savePaymentMethods: boolean;
  quickCheckout: boolean;
  orderTrackingAlerts: boolean;
}

export interface NotificationSettings {
  email: EmailNotifications;
  push: PushNotifications;
  sms: SMSNotifications;
}

export interface EmailNotifications {
  promotions: boolean;
  security: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
}

export interface PushNotifications {
  orderUpdates: boolean;
  priceDrops: boolean;
  newFeatures: boolean;
}

export interface SMSNotifications {
  orderUpdates: boolean;
  securityAlerts: boolean;
}

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
  ipAddress: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone_number?: string;
  dt_birth?: string;
  avatar?: string;
  notifications_enabled?: boolean;
}

// 📋 MÉTODOS AUXILIARES
export class SettingsHelper {
  static getDefaultSettings(): UserSettings {
    return {
      account: {
        email: '',
        phone: '',
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false
      },
      privacy: {
        showPurchaseHistory: true,
        showWishlist: false,
        hideOrderPrices: false,
        personalizedRecommendations: true,
        priceDropNotifications: true,
        abandonedCartReminders: true,
        productReviewReminders: true,
        dataSharing: false,
        thirdPartyMarketing: false,
        browserTracking: true,
        savePaymentMethods: true,
        quickCheckout: false,
        orderTrackingAlerts: true
      },
      notifications: {
        email: {
          promotions: true,
          security: true,
          orderUpdates: true,
          newsletter: false
        },
        push: {
          orderUpdates: true,
          priceDrops: false,
          newFeatures: true
        },
        sms: {
          orderUpdates: false,
          securityAlerts: true
        }
      },
      devices: []
    };
  }

  static isNotificationEnabled(settings: UserSettings, type: keyof NotificationSettings, channel: string): boolean {
    const notificationGroup = settings.notifications[type as keyof NotificationSettings];
    if (typeof notificationGroup === 'object' && notificationGroup !== null) {
      return (notificationGroup as any)[channel] === true;
    }
    return false;
  }

  static formatDeviceInfo(device: DeviceSession): string {
    return `${device.device} (${device.browser}) - ${device.location}`;
  }

  static getActiveSessions(devices: DeviceSession[]): DeviceSession[] {
    return devices.filter(device => device.isCurrent);
  }

  static getOtherSessions(devices: DeviceSession[]): DeviceSession[] {
    return devices.filter(device => !device.isCurrent);
  }
}