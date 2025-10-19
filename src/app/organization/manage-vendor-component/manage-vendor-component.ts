import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorResponse } from '../../model/vendor-response.model';
import { VendorPageResponse } from '../../model/pageable-response.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-manage-vendor-component',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './manage-vendor-component.html',
  styleUrl: './manage-vendor-component.css'
})
export class ManageVendorComponent implements OnInit {
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
  
  // Delete functionality
  deletingVendorId: number | null = null;
  
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
    // If the backend expects different field names, map them here
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
          
          // Remove the problematic field from safe fields if it was there
          const index = this.safeSortFields.indexOf(problematicField);
          if (index > -1) {
            this.safeSortFields.splice(index, 1);
          }
          
          // Reset to default safe sort field
          this.sortBy = 'vendorName';
          
          // Update sortOptions to only include safe fields
          this.sortOptions = this.sortOptions.filter(option => 
            this.safeSortFields.includes(option.value)
          );
          
          // Try loading again with the default sort after a brief delay
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
    console.log('Clearing search');
    this.searchId = null;
    this.searchName = '';
    this.searchResults = [];
    this.isSearchMode = false;
    this.errorMessage = '';
    this.isSearching = false;
    this.currentPage = 0;
    console.log('Search cleared. isSearchMode:', this.isSearchMode);
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
    this.loadVendors();
  }

  onSearchTypeChange(): void {
    this.searchId = null;
    this.searchName = '';
    this.errorMessage = '';
    if (this.isSearchMode) {
      this.clearSearch();
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchVendor();
    }
  }

  refreshVendors(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.currentPage = 0;
    this.loadVendors();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
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
  }

  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when changing page size
    if (this.isSearchMode) {
      this.searchVendor();
    } else {
      this.loadVendors();
    }
  }

  onSortChange(): void {
    this.currentPage = 0; // Reset to first page when changing sort
    this.errorMessage = ''; // Clear any previous errors
    if (this.isSearchMode) {
      this.searchVendor();
    } else {
      this.loadVendors();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  get showPagination(): boolean {
    return !this.isSearchMode && this.totalPages > 1 && !this.isLoading && this.vendors.length > 0;
  }

  deleteVendor(vendorId: number, vendorName: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete vendor "${vendorName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    console.log('Starting delete for vendor ID:', vendorId);
    this.deletingVendorId = vendorId;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    this.vendorService.deleteVendor(vendorId).subscribe({
      next: () => {
        console.log('Vendor deleted successfully:', vendorId);
        this.deletingVendorId = null;
        
        if (this.isSearchMode) {
          this.clearSearch();
        } else {
          // Remove from vendors array
          this.vendors = this.vendors.filter(vendor => vendor.vendorId !== vendorId);
          this.totalElements = Math.max(0, this.totalElements - 1);
          
          // If current page becomes empty and it's not the first page, go to previous page
          if (this.vendors.length === 0 && this.currentPage > 0) {
            this.currentPage--;
          }
        }
        
        this.loadVendors();
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error deleting vendor:', error);
        this.deletingVendorId = null;
        
        if (error.status === 404) {
          this.errorMessage = `Vendor not found with ID: ${vendorId}`;
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'This vendor does not belong to the given organization.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to delete vendors.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to delete vendor. Please try again.';
        }
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      complete: () => {
        this.deletingVendorId = null;
        console.log('Delete request completed');
        this.cdr.markForCheck();
      }
    });
  }

  isDeleting(vendorId: number): boolean {
    return this.deletingVendorId === vendorId;
  }

  get displayedVendors(): VendorResponse[] {
    return this.isSearchMode ? this.searchResults : this.vendors;
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
