import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorPaymentResponse } from '../../model/vendor-payment-response.model';
import { VendorPaymentPageResponse } from '../../model/vendor-payment-page-response.model';
import { VendorPaymentUpdate, VendorPaymentUpdateResponse } from '../../model/vendor-payment-update.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-vp-payment',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './vp-payment.html',
  styleUrl: './vp-payment.css'
})
export class VpPayment implements OnInit {
  payments: VendorPaymentResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  
  // Filter functionality
  selectedStatus = '';
  statusOptions = [
    { value: '', label: 'All Payments' },
    { value: 'NOT_PAID', label: 'Not Paid' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PAID', label: 'Paid' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'UPDATED', label: 'Updated' }
  ];
  
  // Action processing
  processingPaymentId: number | null = null;
  
  // Edit payment modal properties
  showEditModal = false;
  editingPayment: VendorPaymentResponse | null = null;
  editAmount: number = 0;
  editErrorMessage = '';
  isUpdatingPayment = false;
  
  // Expose Math to template
  Math = Math;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 15, 20];

  constructor(
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadPayments();
      }, 0);
    } else {
      this.isLoading = false;
    }
  }

  loadPayments(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Loading vendor payments...');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    if (this.selectedStatus) {
      this.vendorService.getPaymentsByStatus(this.selectedStatus, this.currentPage, this.pageSize).subscribe({
        next: (response: VendorPaymentPageResponse) => {
          this.handlePaymentsResponse(response);
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.vendorService.getAllVendorPayments(this.currentPage, this.pageSize).subscribe({
        next: (response: VendorPaymentPageResponse) => {
          this.handlePaymentsResponse(response);
        },
        error: (error) => {
          this.handleError(error);
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  private handlePaymentsResponse(response: VendorPaymentPageResponse): void {
    console.log('Payments loaded:', response);
    this.payments = response.content || [];
    this.totalElements = response.totalElements || 0;
    this.totalPages = response.totalPages || 0;
    this.isLoading = false;
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    console.error('Error loading payments:', error);
    
    if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied. You do not have permission to view payments.';
    } else if (error.status === 0) {
      this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to load payments. Please try again.';
    }
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onStatusFilterChange(): void {
    console.log('Status filter changed to:', this.selectedStatus);
    this.currentPage = 0;
    this.loadPayments();
  }

  refreshPayments(): void {
    this.currentPage = 0;
    this.loadPayments();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadPayments();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPayments();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const halfMax = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(0, this.currentPage - halfMax);
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Action methods
  canSendRequest(payment: VendorPaymentResponse): boolean {
    return payment.status === 'NOT_PAID';
  }

  canEdit(payment: VendorPaymentResponse): boolean {
    return payment.status === 'REJECTED';
  }

  sendRequest(payment: VendorPaymentResponse): void {
    console.log('Sending request for payment:', payment);
    this.processingPaymentId = payment.vpId;
    this.errorMessage = '';
    
    this.vendorService.sendPaymentRequest(payment.vpId).subscribe({
      next: (response: VendorPaymentResponse) => {
        console.log('Payment request sent successfully:', response);
        this.processingPaymentId = null;
        
        // Update the payment in the local array
        const index = this.payments.findIndex(p => p.vpId === payment.vpId);
        if (index !== -1) {
          this.payments[index] = response;
        }
        
        // Show success message
        this.successMessage = `Payment request sent successfully! Payment ID: ${response.vpId}. Status: ${response.status}`;
        
        // Refresh the data to get latest state
        this.loadPayments();
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error sending payment request:', error);
        this.processingPaymentId = null;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid request. Please check the payment details.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to send payment requests.';
        } else if (error.status === 404) {
          this.errorMessage = 'Payment not found or does not belong to your organization.';
        } else if (error.status === 500) {
          if (error.error?.message?.includes('already been sent')) {
            this.errorMessage = 'A request for this vendor payment has already been sent to admin.';
          } else if (error.error?.message?.includes('not active')) {
            this.errorMessage = 'Organization is not active for this operation.';
          } else {
            this.errorMessage = error.error?.message || 'Failed to send payment request. Please try again.';
          }
        } else {
          this.errorMessage = error.error?.message || 'Failed to send payment request. Please try again.';
        }
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      complete: () => {
        this.processingPaymentId = null;
        this.cdr.markForCheck();
      }
    });
  }

  editPayment(payment: VendorPaymentResponse): void {
    console.log('Editing payment:', payment);
    this.editingPayment = payment;
    this.editAmount = payment.amount;
    this.editErrorMessage = '';
    this.showEditModal = true;
    this.cdr.markForCheck();
  }

  submitEditPayment(): void {
    if (!this.editingPayment || this.editAmount <= 0) {
      this.editErrorMessage = 'Please enter a valid amount greater than 0.';
      return;
    }

    this.isUpdatingPayment = true;
    this.editErrorMessage = '';

    const updateRequest: VendorPaymentUpdate = {
      id: this.editingPayment.vpId,
      amount: this.editAmount
    };

    this.vendorService.updateRejectedPayment(updateRequest).subscribe({
      next: (response: VendorPaymentUpdateResponse) => {
        console.log('Payment updated successfully:', response);
        this.isUpdatingPayment = false;
        
        // Update the payment in the local array
        const index = this.payments.findIndex(p => p.vpId === this.editingPayment!.vpId);
        if (index !== -1) {
          this.payments[index].amount = response.amount;
          this.payments[index].status = response.status;
        }
        
        // Show success message
        this.successMessage = `Payment updated successfully! New amount: $${response.amount}. Status: ${response.status}`;
        
        // Close modal and refresh data
        this.closeEditModal();
        this.loadPayments();
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error updating payment:', error);
        this.isUpdatingPayment = false;
        
        if (error.status === 400) {
          this.editErrorMessage = error.error?.message || 'Invalid payment data. Please check the amount.';
        } else if (error.status === 401) {
          this.editErrorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.editErrorMessage = 'Access denied. You do not have permission to update payments.';
        } else if (error.status === 404) {
          this.editErrorMessage = 'Payment not found or does not belong to your organization.';
        } else if (error.status === 500) {
          if (error.error?.message?.includes('Only rejected payments')) {
            this.editErrorMessage = 'Only rejected payments can be updated.';
          } else if (error.error?.message?.includes('not active')) {
            this.editErrorMessage = 'Organization is not active for this operation.';
          } else {
            this.editErrorMessage = error.error?.message || 'Failed to update payment. Please try again.';
          }
        } else {
          this.editErrorMessage = error.error?.message || 'Failed to update payment. Please try again.';
        }
        
        this.cdr.markForCheck();
      }
    });
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingPayment = null;
    this.editAmount = 0;
    this.editErrorMessage = '';
    this.isUpdatingPayment = false;
    this.cdr.markForCheck();
  }

  isProcessing(paymentId: number): boolean {
    return this.processingPaymentId === paymentId;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PAID':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning';
      case 'NOT_PAID':
        return 'badge bg-secondary';
      case 'REJECTED':
        return 'badge bg-danger';
      case 'UPDATED':
        return 'badge bg-info';
      default:
        return 'badge bg-light text-dark';
    }
  }

  get showPagination(): boolean {
    return this.totalPages > 1 && !this.isLoading;
  }
}
