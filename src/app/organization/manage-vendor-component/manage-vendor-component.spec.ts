import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageVendorComponent } from './manage-vendor-component';

describe('ManageVendorComponent', () => {
  let component: ManageVendorComponent;
  let fixture: ComponentFixture<ManageVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageVendorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
