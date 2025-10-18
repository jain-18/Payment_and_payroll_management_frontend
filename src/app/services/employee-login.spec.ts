import { TestBed } from '@angular/core/testing';

import { EmployeeLoginService } from './employee-login';

describe('EmployeeLogin', () => {
  let service: EmployeeLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
