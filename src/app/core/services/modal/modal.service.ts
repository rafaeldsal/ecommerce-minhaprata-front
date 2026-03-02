import { Injectable, ComponentRef, ViewContainerRef, Injector, ApplicationRef, createComponent, EnvironmentInjector } from '@angular/core';
import { UserMobileModalComponent } from '../../../features/pages/auth/components/user-mobile-modal/user-mobile-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalRef?: ComponentRef<UserMobileModalComponent>;
  private modalContainer?: ViewContainerRef;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) { }

  // Método para registrar o container global
  registerModalContainer(container: ViewContainerRef) {
    this.modalContainer = container;
  }

  openUserMobileModal(data: any) {
    this.closeAllModals();

    if (!this.modalContainer) {
      console.error('Modal container não registrado!');
      return;
    }

    // Criar o modal no container global
    this.modalRef = this.modalContainer.createComponent(UserMobileModalComponent);

    // Configurar as propriedades
    this.modalRef.setInput('isOpen', true);
    this.modalRef.setInput('user', data.user);
    this.modalRef.setInput('pendingOrders', data.pendingOrders);
    this.modalRef.setInput('isLoggingOut', false);

    // Configurar eventos
    this.modalRef.instance.closed.subscribe(() => {
      this.closeAllModals();
    });

    this.modalRef.instance.logout.subscribe(() => {
      data.onLogout();
      this.closeAllModals();
    });

    this.modalRef.instance.navigate.subscribe((route: string) => {
      this.closeAllModals();
    });

    // Garantir que a detecção de mudanças seja executada
    this.modalRef.changeDetectorRef.detectChanges();
  }

  closeAllModals() {
    if (this.modalRef) {
      this.modalRef.destroy();
      this.modalRef = undefined;
    }
  }

  // Método alternativo usando ApplicationRef (fallback)
  private createModalWithAppRef(component: any, data: any): ComponentRef<any> {
    const componentRef = createComponent(component, {
      environmentInjector: this.injector,
    });

    this.appRef.attachView(componentRef.hostView);
    document.body.appendChild(componentRef.location.nativeElement);

    return componentRef;
  }
}
