import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeConcernComponent } from './employee-concern-component';

describe('EmployeeConcernComponent', () => {
  let component: EmployeeConcernComponent;
  let fixture: ComponentFixture<EmployeeConcernComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeConcernComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeConcernComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
