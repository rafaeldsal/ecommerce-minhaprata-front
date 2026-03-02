import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification/notification.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = this.addAuthHeader(req);

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !req.url.includes('/auth/refresh')) {
          return this.handle401Error(req, next);
        }

        if (error.status === 403) {
          this.notificationService.showError('Acesso negado.');
          this.router.navigate(['/access-denied']);
          return throwError(() => error);
        }

        if (error.status === 0) {
          this.notificationService.showError('Erro de conexão. Verifique sua internet.');
        } else if (error.status >= 500) {
          this.notificationService.showError('Erro interno do servidor.');
        }

        return throwError(() => error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();

    if (token && this.shouldAddToken(request)) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return request;
  }

  private shouldAddToken(request: HttpRequest<any>): boolean {
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/refresh', '/public/'];
    return !publicRoutes.some(route => request.url.includes(route));
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      return this.authService.refreshTokenFromServer().pipe(
        switchMap((newToken: string) => {
          this.isRefreshing = false;
          this.notificationService.showSuccess('Sessão renovada com sucesso!');
          return next.handle(this.addAuthHeader(request));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          this.router.navigate(['/auth/login']);
          this.notificationService.showError('Falha ao renovar sessão.');
          return throwError(() => err);
        })
      );
    } else {
      // Se já estiver renovando token, só reenvia requisição com o token atual
      return next.handle(this.addAuthHeader(request));
    }
  }
}
