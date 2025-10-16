import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrgainzationComponent } from './admin-orgainzation-component';

describe('AdminOrgainzationComponent', () => {
  let component: AdminOrgainzationComponent;
  let fixture: ComponentFixture<AdminOrgainzationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrgainzationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrgainzationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
