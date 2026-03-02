import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonSocialLoginComponent } from './button-social-login.component';

describe('ButtonSocialLoginComponent', () => {
  let component: ButtonSocialLoginComponent;
  let fixture: ComponentFixture<ButtonSocialLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonSocialLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonSocialLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
