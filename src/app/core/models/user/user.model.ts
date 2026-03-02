import { UserAddress } from "../shared/address.model";

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone_number: string;
  dt_birth: string;
  role: UserRole;
  avatar?: string;
  addresses?: UserAddress[];
}

// 🏷️ VALIDAÇÕES
export class UserValidator {
  static isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11;
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export class UserHelper {
  static isAdmin(user: User): boolean {
    return user.role === UserRole.ADMIN;
  }

  static getUserInitials(user: User): string {
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
}
