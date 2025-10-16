import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDashboardNavbar } from './org-dashboard-navbar';

describe('OrgDashboardNavbar', () => {
  let component: OrgDashboardNavbar;
  let fixture: ComponentFixture<OrgDashboardNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgDashboardNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgDashboardNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
