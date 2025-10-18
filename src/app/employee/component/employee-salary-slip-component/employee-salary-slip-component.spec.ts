import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalarySlipComponent } from './employee-salary-slip-component';

describe('EmployeeSalarySlipComponent', () => {
  let component: EmployeeSalarySlipComponent;
  let fixture: ComponentFixture<EmployeeSalarySlipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeSalarySlipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
