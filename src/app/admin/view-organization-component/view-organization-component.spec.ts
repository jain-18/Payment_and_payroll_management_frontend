import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOrganizationComponent } from './view-organization-component';

describe('ViewOrganizationComponent', () => {
  let component: ViewOrganizationComponent;
  let fixture: ComponentFixture<ViewOrganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOrganizationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
