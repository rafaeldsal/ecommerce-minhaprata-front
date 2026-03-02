import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAuthIconComponent } from './user-auth-icon.component';

describe('UserAuthIconComponent', () => {
  let component: UserAuthIconComponent;
  let fixture: ComponentFixture<UserAuthIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAuthIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAuthIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
