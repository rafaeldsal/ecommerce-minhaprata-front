import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalService } from '../../../../core/services/modal/modal.service';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modal-container.component.html',
  styleUrl: './modal-container.component.scss'
})
export class ModalContainerComponent {
  private modalService = inject(ModalService);

  @ViewChild('modalContainer', { read: ViewContainerRef })
  modalContainerRef!: ViewContainerRef;

  ngAfterViewInit() {
    this.modalService.registerModalContainer(this.modalContainerRef);
  }

  ngOnDestroy() {
    this.modalService.closeAllModals();
  }

}
