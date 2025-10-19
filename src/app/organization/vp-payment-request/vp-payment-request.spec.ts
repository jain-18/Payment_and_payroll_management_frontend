import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpPaymentRequest } from './vp-payment-request';

describe('VpPaymentRequest', () => {
  let component: VpPaymentRequest;
  let fixture: ComponentFixture<VpPaymentRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VpPaymentRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VpPaymentRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
