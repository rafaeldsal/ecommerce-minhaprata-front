import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/services/auth/auth.service';
import { NotificationService } from '../../../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
import { SocialUser } from '../../../../../core/models/user/user-auth.model';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-button-social-login',
  standalone: true,
  imports: [
    ProgressSpinnerModule,
    ButtonModule
  ],
  templateUrl: './button-social-login.component.html',
  styleUrl: './button-social-login.component.scss'
})
export class ButtonSocialLoginComponent implements OnInit {
  @ViewChild('googleButtonContainer') googleButtonContainer!: ElementRef;

  isLoading = false;
  currentProvider: 'google' | null = null;

  private googleClientId = environment.googleClientId;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.validateGoogleConfig();
  }

  private validateGoogleConfig(): void {
    if (!this.googleClientId || this.googleClientId === 'SEU_GOOGLE_CLIENT_ID_AQUI') {
      console.warn('⚠️ Google Client ID não configurado em environment.ts');
      this.notificationService.showWarning('Configuração do Google não encontrada');
    } else {
      console.log('✅ Google Client ID configurado');
    }
  }

  signInWithGoogle(): void {
    if (this.isLoading) return;

    console.log('🔐 Iniciando autenticação Google...');
    this.isLoading = true;
    this.currentProvider = 'google';

    this.authService.loginWithGoogle().subscribe({
      next: (socialUser: SocialUser) => {
        console.log('✅ Login Google bem-sucedido:', socialUser.name);
        this.handleSocialLoginSuccess(socialUser);
      },
      error: (error) => {
        console.error('❌ Erro no login Google:', error);

        // Tratamento mais específico de erros
        if (error.message?.includes('popup')) {
          this.handlePopupBlocked();
        } else if (error.message?.includes('Tempo limite')) {
          this.handleTimeoutError();
        } else {
          this.handleSocialLoginError(error);
        }

        this.isLoading = false;
        this.currentProvider = null;
      }
    });
  }

  useGoogleButton(): void {
    if (this.isLoading) return;

    console.log('🔐 Usando botão Google renderizado...');
    this.isLoading = true;
    this.currentProvider = 'google';

    if (this.googleButtonContainer?.nativeElement) {
      this.googleButtonContainer.nativeElement.style.display = 'block';
    }

    this.signInWithGoogle();
  }

  private handleSocialLoginSuccess(socialUser: SocialUser): void {
    this.authService.loginWithSocial('google').subscribe({
      next: (success) => {
        this.isLoading = false;
        this.currentProvider = null;

        if (success) {
          this.notificationService.showSuccess('Login com Google realizado com sucesso!');

          this.ngZone.run(() => {
            this.router.navigate(['/']);
          });
        } else {
          this.handleSocialLoginError('Falha na integração com o sistema');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.currentProvider = null;
        this.handleSocialLoginError(error);
      }
    });
  }

  private handleSocialLoginError(error: any): void {
    console.error('🔍 Analisando erro:', error);

    let errorMessage = 'Erro no login social';

    if (error?.message?.includes('Tempo limite')) {
      errorMessage = 'Tempo limite excedido. Tente novamente.';
    } else if (error?.message?.includes('popup') || error?.message?.includes('bloqueado')) {
      errorMessage = 'Popup bloqueado. Permita popups para este site.';
    } else if (error?.message?.includes('CORS')) {
      errorMessage = 'Erro de configuração. Verifique as credenciais do Google.';
    } else if (error?.message?.includes('cancelado') || error?.message?.includes('canceled')) {
      errorMessage = 'Login cancelado pelo usuário.';
      return; // Não mostra notificação para cancelamento
    } else if (error?.message?.includes('não inicializado')) {
      errorMessage = 'Serviço de autenticação não inicializado. Recarregue a página.';
    }

    this.notificationService.showError(errorMessage);
  }

  private handlePopupBlocked(): void {
    this.notificationService.showWarning(
      'Popup bloqueado. Por favor, permita popups para este site e tente novamente.'
    );
  }

  private handleTimeoutError(): void {
    this.notificationService.showWarning(
      'Tempo limite excedido. Recarregue a página e tente novamente.'
    );
  }
}
