import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmployeeService } from './employee.service';
import { EmployeeRequest } from '../model/employee-request.model';
import { EmployeeResponse } from '../model/employee-response.model';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmployeeService]
    });
    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create employee', () => {
    const mockRequest: EmployeeRequest = {
      employeeName: 'John Doe',
      employeeRole: 'Developer',
      email: 'john@example.com',
      department: 'IT',
      salary: 50000,
      joinedDate: '2025-01-01',
      accountNumber: '1234567890',
      ifsc: 'ABCD0123456'
    };

    const mockResponse: EmployeeResponse = {
      employeeId: 1,
      ...mockRequest,
      active: true
    };

    service.createEmployee(mockRequest).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/employees');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRequest);
    req.flush(mockResponse);
  });
});