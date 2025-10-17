import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../services/admin-service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RequestReasonDto } from '../model/RequestReasonDto';
import { RequestResp } from '../model/requestResp';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-single-request-component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-single-request-component.html',
  styleUrl: './admin-single-request-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSingleRequestComponent implements OnInit, OnDestroy {

  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  requestDetails: RequestResp | null = null;
  requestReject: RequestReasonDto = { id: 0, rejectReason: '' };
  isLoading = false;
  isProcessing = false;
  errorMessage = '';
  successMessage = '';
  
  // Cached computed properties for better performance
  isSalaryRequest = false;
  isVendorRequest = false;
  formattedRequestDate = 'N/A';
  formattedActionDate = 'N/A';
  formattedTotalAmount = 'N/A';
  formattedBalance = 'N/A';
  
  // UI state for rejection workflow
  showRejectForm = false;

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRequestDetails(): void {
    const requestId = this.route.snapshot.paramMap.get('id');

    if (!requestId || isNaN(Number(requestId))) {
      this.errorMessage = 'Invalid request ID';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getRequestDetails(Number(requestId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.requestDetails = data;
          this.requestReject.id = data.requestId;
          this.isLoading = false;
          
          // Cache computed values for better performance
          this.updateCachedValues(data);
          
          // Trigger change detection for OnPush strategy
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.errorMessage = 'Failed to load request details. Please try again.';
          this.isLoading = false;
          console.error('Error fetching request details:', err);
        }
      });
  }

  approveSalaryRequest(): void {
    if (this.isProcessing) return;

    const requestId = this.route.snapshot.paramMap.get('id');

    if (!requestId || isNaN(Number(requestId))) {
      this.errorMessage = 'Invalid request ID';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';
    console.log('Approving salary request with ID:', requestId);
    this.adminService.approveSalaryRequest(Number(requestId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.successMessage = 'Salary request approved successfully!';
          this.isProcessing = false;
          console.log('Request approved successfully:', data);

          // Navigate back to requests list after a short delay
          setTimeout(() => {
            this.router.navigate(['/admin/all-request']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to approve salary request. Please try again.';
          this.isProcessing = false;
          console.error('Error approving request:', err);
        }
      });
  }

  rejectSalaryRequest(): void {
    if (this.isProcessing) return;

    const requestId = this.route.snapshot.paramMap.get('id');

    if (!requestId || isNaN(Number(requestId))) {
      this.errorMessage = 'Invalid request ID';
      return;
    }

    if (!this.requestReject.rejectReason?.trim()) {
      this.errorMessage = 'Please provide a reason for rejection';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create the RequestReasonDto object as expected by AdminService
    const requestReasonDto = {
      id: Number(requestId),
      rejectReason: this.requestReject.rejectReason.trim()
    };

    this.adminService.rejectSalaryRequest(requestReasonDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.successMessage = 'Salary request rejected successfully!';
          this.isProcessing = false;
          console.log('Request rejected successfully:', data);

          // Navigate back to requests list after a short delay
          setTimeout(() => {
            this.router.navigate(['/admin/all-request']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to reject salary request. Please try again.';
          this.isProcessing = false;
          console.error('Error rejecting request:', err);
        }
      });
  }

  approveVendorPaymentRequest(): void {
    if (this.isProcessing) return;

    const requestId = this.route.snapshot.paramMap.get('id');

    if (!requestId || isNaN(Number(requestId))) {
      this.errorMessage = 'Invalid request ID';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminService.approveVendorRequest(Number(requestId))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.successMessage = 'Vendor payment request approved successfully!';
          this.isProcessing = false;
          console.log('Vendor payment request approved successfully:', data);

          // Navigate back to requests list after a short delay
          setTimeout(() => {
            this.router.navigate(['/admin/all-request']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to approve vendor payment request. Please try again.';
          this.isProcessing = false;
          console.error('Error approving vendor payment request:', err);
        }
      });
  }

  rejectVendorPaymentRequest(): void {
    if (this.isProcessing) return;

    const requestId = this.route.snapshot.paramMap.get('id');

    if (!requestId || isNaN(Number(requestId))) {
      this.errorMessage = 'Invalid request ID';
      return;
    }

    if (!this.requestReject.rejectReason?.trim()) {
      this.errorMessage = 'Please provide a reason for rejection';
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Create the RequestReasonDto object as expected by AdminService
    const requestReasonDto = {
      id: Number(requestId),
      rejectReason: this.requestReject.rejectReason.trim()
    };

    this.adminService.rejectVendorRequest(requestReasonDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.successMessage = 'Vendor payment request rejected successfully!';
          this.isProcessing = false;
          console.log('Vendor payment request rejected successfully:', data);

          // Navigate back to requests list after a short delay
          setTimeout(() => {
            this.router.navigate(['/admin/all-request']);
          }, 2000);
        },
        error: (err) => {
          this.errorMessage = 'Failed to reject vendor payment request. Please try again.';
          this.isProcessing = false;
          console.error('Error rejecting vendor payment request:', err);
        }
      });
  }



  /**
   * Handles the approve button click - determines request type and calls appropriate method
   */
  approveRequest(): void {
    // Prevent multiple simultaneous requests
    if (this.isProcessing) {
      return;
    }
    
    // Check if we have request details
    if (!this.requestDetails) {
      this.errorMessage = 'Request details not loaded. Please refresh the page.';
      this.cdr.markForCheck();
      return;
    }
    
    // Route to appropriate approval method
    if (this.isSalaryRequest) {
      this.approveSalaryRequest();
    } else if (this.isVendorRequest) {
      this.approveVendorPaymentRequest();
    } else {
      const requestType = this.requestDetails.requestType || 'Unknown';
      this.errorMessage = `Unsupported request type: "${requestType}". Please contact support if this issue persists.`;
      this.cdr.markForCheck();
    }
  }

  /**
   * Shows the rejection form when reject button is clicked
   */
  selectReject(): void {
    this.showRejectForm = true;
    this.requestReject.rejectReason = ''; // Clear any previous reason
    this.clearMessages();
    this.cdr.markForCheck();
  }

  /**
   * Confirms the rejection after reason is provided
   */
  confirmReject(): void {
    if (!this.requestReject.rejectReason?.trim()) {
      this.errorMessage = 'Please provide a reason for rejection';
      this.cdr.markForCheck();
      return;
    }

    if (this.isSalaryRequest) {
      this.rejectSalaryRequest();
    } else if (this.isVendorRequest) {
      this.rejectVendorPaymentRequest();
    }
  }

  /**
   * Cancels the rejection and goes back to the main action buttons
   */
  cancelReject(): void {
    this.showRejectForm = false;
    this.requestReject.rejectReason = '';
    this.clearMessages();
    this.cdr.markForCheck();
  }

  /**
   * Clears any displayed messages
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Navigates back to the requests list
   */
  goBack(): void {
    this.router.navigate(['/admin/all-request']);
  }

  /**
   * Updates cached computed values for better performance
   */
  private updateCachedValues(data: RequestResp): void {
    // Cache request type checks with comprehensive matching
    const requestType = data.requestType?.toLowerCase() || '';
    
    // Handle various possible request type formats
    this.isSalaryRequest = requestType.includes('salary') || 
                          requestType.includes('employee') || 
                          requestType === 'sal' ||
                          requestType === 'emp';
                          
    this.isVendorRequest = requestType.includes('vendor') || 
                          requestType.includes('payment') || 
                          requestType.includes('supplier') ||
                          requestType === 'vend' ||
                          requestType === 'pay';
    
    // Cache formatted dates
    this.formattedRequestDate = this.formatDate(data.requestDate);
    this.formattedActionDate = this.formatDate(data.actionDate);
    
    // Cache formatted amounts
    this.formattedTotalAmount = this.formatCurrency(data.totalAmount);
    this.formattedBalance = this.formatCurrency(data.balance);
  }

  /**
   * Formats the request date for display (private method for caching)
   */
  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Formats currency for display (private method for caching)
   */
  private formatCurrency(amount: number): string {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
