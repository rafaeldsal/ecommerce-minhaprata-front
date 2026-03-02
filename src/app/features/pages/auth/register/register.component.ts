import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
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

// Validator personalizado para confirmar senha
function passwordMatchValidator(control: AbstractControl) {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'] // Usará o mesmo CSS do login
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  private authSubscription?: Subscription;

  // Signals
  loading = signal(false);
  authState = signal<any>(null);

  // Register Form
  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.authSubscription = this.authService.authState$.subscribe(state => {
      this.authState.set(state);

      if (state.isAuthenticated && !state.isLoading) {
        // ✅ Redireciona para completar perfil após registro
        this.router.navigate(['/user/profile'], {
          queryParams: { completeProfile: 'true' }
        });
      }
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
  }

  // ✅ Método para voltar para home
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Check if field is invalid
  isInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  // Get field error message
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.errors?.['required']) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }

    if (field?.errors?.['email']) {
      return 'Por favor, insira um email válido';
    }

    if (field?.errors?.['minlength']) {
      if (fieldName === 'name') {
        return 'Nome deve ter pelo menos 2 caracteres';
      }
      return `A senha deve ter pelo menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }

    if (field?.errors?.['passwordMismatch']) {
      return 'As senhas não coincidem';
    }

    if (field?.errors?.['requiredTrue']) {
      return 'Você deve aceitar os termos para continuar';
    }

    return 'Campo inválido';
  }

  // Get field label for error messages
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Nome completo',
      email: 'Email',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      acceptTerms: 'Termos de serviço'
    };
    return labels[fieldName] || fieldName;
  }

  // Handle form submission
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.loading.set(true);

    const userData = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      rememberMe: true, // ✅ Sempre lembrar após registro
      cpf: '',
      phone_number: '',
      dt_birth: ''
    };

    this.authService.register(userData).subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.showSuccess('Conta criada com sucesso!');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.showError('Erro ao criar conta');
      }
    });
  }

  // Mark all fields as touched to show validation errors
  private markAllFieldsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });
  }

  get acceptTermsControl(): FormControl {
    return this.registerForm.get('acceptTerms') as FormControl;
  }

  // Handle social login (registro com Google)
  onSocialLogin(provider: string): void {
    this.loading.set(true);

    this.authService.loginWithSocial(provider as 'google').subscribe({
      next: (success) => {
        this.loading.set(false);
        if (success) {
          this.notificationService.showSuccess(`Cadastro com ${provider} realizado!`);
          // ✅ Redireciona para completar perfil
          this.router.navigate(['/user/profile'], {
            queryParams: { completeProfile: 'true' }
          });
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.showError(`Erro no cadastro com ${provider}`);
      }
    });
  }
}
