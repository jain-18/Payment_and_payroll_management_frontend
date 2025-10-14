import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginNavbar } from './login-navbar';

describe('LoginNavbar', () => {
  let component: LoginNavbar;
  let fixture: ComponentFixture<LoginNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
