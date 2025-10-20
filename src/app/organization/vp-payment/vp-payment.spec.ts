import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpPayment } from './vp-payment';

describe('VpPayment', () => {
  let component: VpPayment;
  let fixture: ComponentFixture<VpPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VpPayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VpPayment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
