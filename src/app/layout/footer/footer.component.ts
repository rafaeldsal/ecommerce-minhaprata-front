import { Component } from '@angular/core';
import { PageContainerComponent } from '../../shared/components/layout/page-container/page-container.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    PageContainerComponent
  ]
})
export class FooterComponent { }
