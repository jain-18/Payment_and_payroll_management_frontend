import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorResponse } from '../../model/vendor-response.model';
import { VendorPageResponse } from '../../model/pageable-response.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-vendor-payments-component',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './vendor-payments-component.html',
  styleUrl: './vendor-payments-component.css'
})
export class VendorPaymentsComponent implements OnInit {
  vendors: VendorResponse[] = [];
  isLoading = true;
  errorMessage = '';
  
  // Search functionality
  searchId: number | null = null;
  searchName: string = '';
  searchType: 'id' | 'name' = 'id';
  isSearching = false;
  searchResults: VendorResponse[] = [];
  isSearchMode = false;
  
  // Payment processing
  processingPaymentId: number | null = null;
  
  // Expose Math to template
  Math = Math;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 15, 20];
  
  // Sorting properties
  sortBy = 'vendorName';
  sortDirection = 'asc';
  sortOptions = [
    { value: 'vendorName', label: 'Vendor Name' },
    { value: 'email', label: 'Email' },
    { value: 'phoneNumber', label: 'Phone Number' }
  ];

  constructor(
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // List of safe sort fields that are known to work with the backend
  private safeSortFields = ['vendorName', 'email', 'phoneNumber'];
  
  // Map frontend sort field names to backend field names if needed
  private getSortFieldForBackend(frontendField: string): string {
    const fieldMapping: { [key: string]: string } = {
      'vendorName': 'vendorName',
      'email': 'email', 
      'phoneNumber': 'phoneNumber',
      'accountNumber': 'accountNumber',
      'ifsc': 'ifsc'
    };
    
    return fieldMapping[frontendField] || 'vendorName';
  }

  // Check if sort field is safe to use
  private isSafeSortField(field: string): boolean {
    return this.safeSortFields.includes(field);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadVendors();
      }, 0);
    } else {
      this.isLoading = false;
    }
  }

  loadVendors(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Starting to load vendors, setting isLoading to true');
    this.isLoading = true;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    const backendSortField = this.getSortFieldForBackend(this.sortBy);
    this.vendorService.getAllVendors(this.currentPage, this.pageSize, backendSortField).subscribe({
      next: (response: VendorPageResponse) => {
        console.log('Vendors loaded:', response);
        this.vendors = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        console.log('Loading state set to false, vendors count:', this.vendors.length);
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading vendors:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to view vendors.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.status === 500) {
          const problematicField = this.sortBy;
          this.errorMessage = `Sorting by "${problematicField}" is not supported by the server.`;
          
          const index = this.safeSortFields.indexOf(problematicField);
          if (index > -1) {
            this.safeSortFields.splice(index, 1);
          }
          
          this.sortBy = 'vendorName';
          
          this.sortOptions = this.sortOptions.filter(option => 
            this.safeSortFields.includes(option.value)
          );
          
          setTimeout(() => {
            this.errorMessage = '';
            this.loadVendors();
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load vendors. Please try again.';
        }
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      complete: () => {
        this.isLoading = false;
        console.log('Request completed, isLoading:', this.isLoading);
        this.cdr.markForCheck();
      }
    });
  }

  searchVendor(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.searchType === 'id' && !this.searchId) {
      return;
    }

    if (this.searchType === 'name' && !this.searchName.trim()) {
      return;
    }

    console.log('Starting search for vendor');
    this.isSearching = true;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    if (this.searchType === 'id') {
      this.vendorService.searchVendorById(this.searchId!).subscribe({
        next: (vendor: VendorResponse) => {
          console.log('Vendor found:', vendor);
          this.searchResults = [vendor];
          this.isSearchMode = true;
          this.isSearching = false;
          this.cdr.markForCheck();
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (error) => {
          this.handleSearchError(error);
        },
        complete: () => {
          this.isSearching = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.vendorService.searchVendorByName(this.searchName.trim(), 0, this.pageSize, this.sortBy).subscribe({
        next: (response: VendorPageResponse) => {
          console.log('Vendors found by name:', response);
          this.searchResults = response.content || [];
          this.isSearchMode = true;
          this.isSearching = false;
          // Update pagination for search results
          this.totalElements = response.totalElements || 0;
          this.totalPages = response.totalPages || 0;
          this.currentPage = 0;
          this.cdr.markForCheck();
          setTimeout(() => this.cdr.detectChanges(), 0);
        },
        error: (error) => {
          this.handleSearchError(error);
        },
        complete: () => {
          this.isSearching = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  private handleSearchError(error: any): void {
    console.error('Error searching vendor:', error);
    this.isSearching = false;
    this.searchResults = [];
    this.isSearchMode = true;
    
    if (error.status === 404) {
      this.errorMessage = this.searchType === 'id' 
        ? `Vendor not found with ID: ${this.searchId}`
        : `No vendors found with name containing: ${this.searchName}`;
    } else if (error.status === 400) {
      this.errorMessage = 'This vendor does not belong to the given organization.';
    } else if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to search vendor. Please try again.';
    }
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  clearSearch(): void {
    this.searchId = null;
    this.searchName = '';
    this.isSearchMode = false;
    this.searchResults = [];
    this.errorMessage = '';
    this.currentPage = 0;
    this.loadVendors();
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchVendor();
    }
  }

  onSearchTypeChange(): void {
    this.searchId = null;
    this.searchName = '';
    this.errorMessage = '';
    if (this.isSearchMode) {
      this.clearSearch();
    }
  }

  initiatePayment(vendorId: number, vendorName: string): void {
    // TODO: Implement payment initiation logic
    console.log(`Initiating payment for vendor: ${vendorName} (ID: ${vendorId})`);
    this.processingPaymentId = vendorId;
    
    // Simulate payment processing
    setTimeout(() => {
      this.processingPaymentId = null;
      // Show success message or navigate to payment page
      alert(`Payment initiated for ${vendorName}`);
    }, 2000);
  }

  isProcessingPayment(vendorId: number): boolean {
    return this.processingPaymentId === vendorId;
  }

  navigateToPayments(): void {
    // TODO: Navigate to payments history page
    console.log('Navigate to payments history');
  }

  navigateToPaymentRequests(): void {
    // TODO: Navigate to payment requests page
    console.log('Navigate to payment requests');
  }

  refreshVendors(): void {
    this.currentPage = 0;
    this.loadVendors();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    if (this.isSearchMode) {
      this.searchVendor();
    } else {
      this.loadVendors();
    }
  }

  onSortChange(): void {
    this.currentPage = 0;
    if (this.isSearchMode) {
      this.searchVendor();
    } else {
      this.loadVendors();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.isSearchMode) {
      if (this.searchType === 'name') {
        // For name search, we can paginate
        this.vendorService.searchVendorByName(this.searchName.trim(), page, this.pageSize, this.sortBy).subscribe({
          next: (response: VendorPageResponse) => {
            this.searchResults = response.content || [];
            this.totalElements = response.totalElements || 0;
            this.totalPages = response.totalPages || 0;
            this.cdr.markForCheck();
          },
          error: (error) => {
            this.handleSearchError(error);
          }
        });
      }
      // For ID search, no pagination needed as it returns single result
    } else {
      this.loadVendors();
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

  get displayedVendors(): VendorResponse[] {
    return this.isSearchMode ? this.searchResults : this.vendors;
  }

  get showPagination(): boolean {
    return this.totalPages > 1 && !this.isLoading && !this.isSearching;
  }
}
