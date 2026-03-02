import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonSocialLoginComponent } from "../components/button-social-login/button-social-login.component";
import { AuthService } from '../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../core/services/notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
    DividerModule,
    SkeletonModule,
    RippleModule,
    ButtonSocialLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  private authSubscription?: Subscription;

  // Signals
  loading = signal(false);
  authState = signal<any>(null);

  // Login Form
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  // Mock users para teste rápido
  mockUsers = [
    {
      email: 'admin@minhaprata.com',
      password: 'admin123',
      label: '👑 Admin',
      description: 'Acesso total ao sistema'
    },
    {
      email: 'rafael@minhaprata.com',
      password: 'cliente123',
      label: '👤 Cliente',
      description: 'Usuário comum'
    }
  ];

  // Social login providers
  socialProviders = [
    {
      name: 'Google',
      icon: 'pi pi-google',
      color: 'bg-red-500 hover:bg-red-600',
      provider: 'google'
    }
  ];

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.authState.set(state);

      if (state.isAuthenticated && !state.isLoading) {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  // Check if field is invalid
  isInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  // Get field error message
  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.errors?.['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (field?.errors?.['email']) {
      return 'Por favor, insira um email válido';
    }

    if (field?.errors?.['minlength']) {
      return `A senha deve ter pelo menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  // Get field label for error messages
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Senha'
    };
    return labels[fieldName] || fieldName;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.loading.set(true);

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      rememberMe: this.loginForm.value.rememberMe
    };

    this.authService.login(credentials).subscribe({
      next: (success) => {
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.showError('Erro ao fazer login');
      }
    });
  }

  // Preencher com usuário mock para teste rápido - Apagar depois
  fillMockUser(user: any): void {
    this.loginForm.patchValue({
      email: user.email,
      password: user.password
    });
    this.notificationService.showInfo(`Preenchido: ${user.label}`);
  }

  // Mark all fields as touched to show validation errors
  private markAllFieldsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  // Handle password change
  onPasswordChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.loginForm.patchValue({ password: input.value });
  }

  get rememberMeControl(): FormControl {
    return this.loginForm.get('rememberMe') as FormControl;
  }

  // Handle social login
  onSocialLogin(provider: string): void {
    this.loading.set(true);

    this.authService.loginWithSocial(provider as 'google').subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.showSuccess(`Login com ${provider} realizado!`);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.showError(`Erro no login com ${provider}`);
      }
    });
  }

  // Forgot password
  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // Navigate to forgot password page
    // this.router.navigate(['/forgot-password']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
