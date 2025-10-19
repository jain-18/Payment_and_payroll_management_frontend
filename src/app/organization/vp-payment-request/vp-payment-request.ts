import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { RequestResponse, RequestPageResponse } from '../../model/request-response.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-vp-payment-request',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './vp-payment-request.html',
  styleUrl: './vp-payment-request.css'
})
export class VpPaymentRequest implements OnInit {
  requests: RequestResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  
  // Filter functionality
  selectedStatus = '';
  statusOptions = [
    { value: '', label: 'All Requests' },
    { value: 'ALL', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];
  
  // Sorting functionality
  sortBy = 'actionDate';
  sortDir = 'ASC';
  sortOptions = [
    { value: 'actionDate', label: 'Action Date' },
    { value: 'requestDate', label: 'Request Date' },
    { value: 'totalAmount', label: 'Amount' },
    { value: 'requestStatus', label: 'Status' }
  ];
  
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
        this.loadRequests();
      }, 0);
    } else {
      this.isLoading = false;
    }
  }

  loadRequests(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Loading vendor payment requests...');
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.cdr.markForCheck();

    this.vendorService.getVendorPaymentRequests(
      this.selectedStatus, 
      this.currentPage, 
      this.pageSize, 
      this.sortBy, 
      this.sortDir
    ).subscribe({
      next: (response: RequestPageResponse) => {
        this.handleRequestsResponse(response);
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

  private handleRequestsResponse(response: RequestPageResponse): void {
    console.log('Requests loaded:', response);
    this.requests = response.content || [];
    this.totalElements = response.totalElements || 0;
    this.totalPages = response.totalPages || 0;
    this.isLoading = false;
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    console.error('Error loading requests:', error);
    
    if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied. You do not have permission to view payment requests.';
    } else if (error.status === 0) {
      this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to load payment requests. Please try again.';
    }
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onStatusFilterChange(): void {
    console.log('Status filter changed to:', this.selectedStatus);
    this.currentPage = 0;
    this.loadRequests();
  }

  onSortChange(): void {
    console.log('Sort changed to:', this.sortBy, this.sortDir);
    this.currentPage = 0;
    this.loadRequests();
  }

  refreshRequests(): void {
    this.currentPage = 0;
    this.loadRequests();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadRequests();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRequests();
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

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'badge bg-success';
      case 'PENDING':
        return 'badge bg-warning text-dark';
      case 'REJECTED':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getRequestTypeClass(type: string): string {
    switch (type) {
      case 'VendorPayment':
        return 'badge bg-info text-dark';
      case 'EmployeePayment':
        return 'badge bg-primary';
      default:
        return 'badge bg-light text-dark';
    }
  }

  get showPagination(): boolean {
    return this.totalPages > 1 && !this.isLoading;
  }

  trackByRequestId(index: number, request: RequestResponse): number {
    return request.requestId;
  }
}
