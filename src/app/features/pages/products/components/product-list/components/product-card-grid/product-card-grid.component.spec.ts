import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardGridComponent } from './product-card-grid.component';

describe('ProductCardGridComponent', () => {
  let component: ProductCardGridComponent;
  let fixture: ComponentFixture<ProductCardGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCardGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
