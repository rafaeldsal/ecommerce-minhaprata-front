import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMobileModalComponent } from './user-mobile-modal.component';

describe('UserMobileModalComponent', () => {
  let component: UserMobileModalComponent;
  let fixture: ComponentFixture<UserMobileModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMobileModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMobileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
