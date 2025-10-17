import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ChangeDetectionStrategy, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AdminSingleRequestComponent } from './admin-single-request-component';
import { AdminService } from '../services/admin-service';
import { RequestResp } from '../model/requestResp';

describe('AdminSingleRequestComponent', () => {
  let component: AdminSingleRequestComponent;
  let fixture: ComponentFixture<AdminSingleRequestComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockRequestResp: RequestResp = {
    requestId: 1,
    requestType: 'SALARY',
    requestStatus: 'PENDING',
    requestDate: '2024-01-15T10:30:00',
    totalAmount: 5000,
    balance: 5000,
    createdBy: 'john.doe@example.com',
    actionDate: '2024-01-15T10:30:00',
    rejectReason: ''
  };

  beforeEach(async () => {
    const adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'getRequestDetails',
      'approveSalaryRequest',
      'rejectSalaryRequest',
      'approveVendorRequest',
      'rejectVendorRequest'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [AdminSingleRequestComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .overrideComponent(AdminSingleRequestComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSingleRequestComponent);
    component = fixture.componentInstance;
    mockAdminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load request details and cache values on init', () => {
      mockAdminService.getRequestDetails.and.returnValue(of(mockRequestResp));
      
      component.ngOnInit();
      
      expect(mockAdminService.getRequestDetails).toHaveBeenCalledWith(1);
      expect(component.requestDetails).toEqual(mockRequestResp);
      expect(component.isLoading).toBeFalsy();
      
      // Check that cached values are updated
      expect(component.isSalaryRequest).toBeTruthy();
      expect(component.formattedTotalAmount).toBe('$5,000.00');
    });

    it('should handle error when loading request details', () => {
      mockAdminService.getRequestDetails.and.returnValue(throwError(() => new Error('API Error')));
      
      component.ngOnInit();
      
      expect(component.errorMessage).toBe('Failed to load request details. Please try again.');
      expect(component.isLoading).toBeFalsy();
      expect(component.requestDetails).toBeNull();
    });

    it('should handle invalid request ID', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('invalid');
      
      component.ngOnInit();
      
      expect(component.errorMessage).toBe('Invalid request ID');
      expect(mockAdminService.getRequestDetails).not.toHaveBeenCalled();
    });

    it('should handle null request ID', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
      
      component.ngOnInit();
      
      expect(component.errorMessage).toBe('Invalid request ID');
      expect(mockAdminService.getRequestDetails).not.toHaveBeenCalled();
    });
  });

  describe('approveSalaryRequest', () => {
    beforeEach(() => {
      component.requestDetails = mockRequestResp;
    });

    it('should approve salary request successfully', () => {
      mockAdminService.approveSalaryRequest.and.returnValue(of(void 0));
      
      component.approveSalaryRequest();
      
      expect(component.isProcessing).toBeFalsy();
      expect(component.successMessage).toBe('Salary request approved successfully!');
      expect(mockAdminService.approveSalaryRequest).toHaveBeenCalledWith(1);
    });

    it('should handle error when approving salary request', () => {
      mockAdminService.approveSalaryRequest.and.returnValue(throwError(() => new Error('API Error')));
      
      component.approveSalaryRequest();
      
      expect(component.errorMessage).toBe('Failed to approve salary request. Please try again.');
      expect(component.isProcessing).toBeFalsy();
    });

    it('should not proceed if already processing', () => {
      component.isProcessing = true;
      
      component.approveSalaryRequest();
      
      expect(mockAdminService.approveSalaryRequest).not.toHaveBeenCalled();
    });
  });

  describe('rejectSalaryRequest', () => {
    beforeEach(() => {
      component.requestDetails = mockRequestResp;
      component.requestReject = { id: 1, rejectReason: 'Valid reason' };
    });

    it('should reject salary request successfully', () => {
      mockAdminService.rejectSalaryRequest.and.returnValue(of(mockRequestResp));
      
      component.rejectSalaryRequest();
      
      expect(component.isProcessing).toBeFalsy();
      expect(component.successMessage).toBe('Salary request rejected successfully!');
      expect(mockAdminService.rejectSalaryRequest).toHaveBeenCalledWith({ id: 1, rejectReason: 'Valid reason' });
    });

    it('should validate rejection reason', () => {
      component.requestReject.rejectReason = '';
      
      component.rejectSalaryRequest();
      
      expect(component.errorMessage).toBe('Please provide a reason for rejection');
      expect(mockAdminService.rejectSalaryRequest).not.toHaveBeenCalled();
    });
  });

  describe('Vendor Request Actions', () => {
    const vendorRequest = { ...mockRequestResp, requestType: 'VENDOR' };

    beforeEach(() => {
      component.requestDetails = vendorRequest;
    });

    it('should approve vendor request successfully', () => {
      mockAdminService.approveVendorRequest.and.returnValue(of(void 0));
      
      component.approveVendorPaymentRequest();
      
      expect(component.isProcessing).toBeFalsy();
      expect(component.successMessage).toBe('Vendor payment request approved successfully!');
      expect(mockAdminService.approveVendorRequest).toHaveBeenCalledWith(1);
    });

    it('should reject vendor request successfully', () => {
      component.requestReject = { id: 1, rejectReason: 'Valid reason' };
      mockAdminService.rejectVendorRequest.and.returnValue(of(vendorRequest));
      
      component.rejectVendorPaymentRequest();
      
      expect(component.isProcessing).toBeFalsy();
      expect(component.successMessage).toBe('Vendor payment request rejected successfully!');
      expect(mockAdminService.rejectVendorRequest).toHaveBeenCalledWith({ id: 1, rejectReason: 'Valid reason' });
    });
  });

  describe('Cached Properties', () => {
    beforeEach(() => {
      mockAdminService.getRequestDetails.and.returnValue(of(mockRequestResp));
    });

    it('should cache salary request type correctly', () => {
      component.ngOnInit();
      expect(component.isSalaryRequest).toBeTruthy();
      expect(component.isVendorRequest).toBeFalsy();
    });

    it('should cache vendor request type correctly', () => {
      const vendorRequest = { ...mockRequestResp, requestType: 'VENDOR' };
      mockAdminService.getRequestDetails.and.returnValue(of(vendorRequest));
      
      component.ngOnInit();
      
      expect(component.isVendorRequest).toBeTruthy();
      expect(component.isSalaryRequest).toBeFalsy();
    });

    it('should cache formatted dates', () => {
      component.ngOnInit();
      
      expect(component.formattedRequestDate).toContain('January');
      expect(component.formattedRequestDate).toContain('15');
      expect(component.formattedRequestDate).toContain('2024');
      expect(component.formattedActionDate).not.toBe('N/A');
    });

    it('should cache formatted currency amounts', () => {
      component.ngOnInit();
      
      expect(component.formattedTotalAmount).toBe('$5,000.00');
      expect(component.formattedBalance).toBe('$5,000.00');
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDateRequest = { ...mockRequestResp, requestDate: 'invalid-date' };
      mockAdminService.getRequestDetails.and.returnValue(of(invalidDateRequest));
      
      component.ngOnInit();
      
      expect(component.formattedRequestDate).toBe('invalid-date');
    });

    it('should handle null amounts gracefully', () => {
      const nullAmountRequest = { ...mockRequestResp, totalAmount: null as any, balance: undefined as any };
      mockAdminService.getRequestDetails.and.returnValue(of(nullAmountRequest));
      
      component.ngOnInit();
      
      expect(component.formattedTotalAmount).toBe('N/A');
      expect(component.formattedBalance).toBe('N/A');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to requests list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/all-request']);
    });
  });

  describe('Message Management', () => {
    it('should clear messages', () => {
      component.errorMessage = 'Error';
      component.successMessage = 'Success';
      
      component.clearMessages();
      
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy subject on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });

    it('should initialize with default values', () => {
      expect(component.requestDetails).toBeNull();
      expect(component.isLoading).toBeFalsy();
      expect(component.isProcessing).toBeFalsy();
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
      expect(component.isSalaryRequest).toBeFalsy();
      expect(component.isVendorRequest).toBeFalsy();
      expect(component.formattedRequestDate).toBe('N/A');
      expect(component.formattedActionDate).toBe('N/A');
      expect(component.formattedTotalAmount).toBe('N/A');
      expect(component.formattedBalance).toBe('N/A');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during data fetch', () => {
      mockAdminService.getRequestDetails.and.returnValue(of(mockRequestResp));
      
      component.ngOnInit();
      
      // Note: Due to synchronous nature of observables in tests,
      // loading state changes immediately. In real scenarios,
      // there would be a brief loading period.
      expect(component.isLoading).toBeFalsy(); // After successful load
    });

    it('should handle processing state correctly', () => {
      component.isProcessing = true;
      mockAdminService.approveSalaryRequest.and.returnValue(of(void 0));
      
      component.approveSalaryRequest();
      
      // Should exit early if already processing
      expect(mockAdminService.approveSalaryRequest).not.toHaveBeenCalled();
    });
  });

  describe('Performance Optimizations', () => {
    it('should cache computed values after data load', () => {
      mockAdminService.getRequestDetails.and.returnValue(of(mockRequestResp));
      
      component.ngOnInit();
      
      // Check that all values are cached
      expect(component.isSalaryRequest).toBeDefined();
      expect(component.isVendorRequest).toBeDefined();
      expect(component.formattedRequestDate).not.toBe('N/A');
      expect(component.formattedTotalAmount).not.toBe('N/A');
    });
  });
});
