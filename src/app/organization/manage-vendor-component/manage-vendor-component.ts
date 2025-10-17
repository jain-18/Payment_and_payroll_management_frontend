import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorResponse } from '../../model/vendor-response.model';
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
  isSearching = false;
  searchResults: VendorResponse[] = [];
  isSearchMode = false;
  
  // Delete functionality
  deletingVendorId: number | null = null;
  
  // Expose Math to template
  Math = Math;

  constructor(
    private vendorService: VendorService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

    this.vendorService.getAllVendors().subscribe({
      next: (vendors: VendorResponse[]) => {
        console.log('Vendors loaded:', vendors);
        this.vendors = vendors || [];
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
    if (!this.searchId || !isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Starting search for vendor ID:', this.searchId);
    this.isSearching = true;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    this.vendorService.searchVendorById(this.searchId).subscribe({
      next: (vendor: VendorResponse) => {
        console.log('Vendor found:', vendor);
        this.searchResults = [vendor];
        this.isSearchMode = true;
        this.isSearching = false;
        console.log('Search completed. isSearching:', this.isSearching, 'isSearchMode:', this.isSearchMode);
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error searching vendor:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.isSearchMode = true;
        
        if (error.status === 404) {
          this.errorMessage = `Vendor not found with ID: ${this.searchId}`;
        } else if (error.status === 400) {
          this.errorMessage = 'This vendor does not belong to the given organization.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to search vendor. Please try again.';
        }
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      complete: () => {
        this.isSearching = false;
        console.log('Search request completed. isSearching:', this.isSearching);
        this.cdr.markForCheck();
      }
    });
  }

  clearSearch(): void {
    console.log('Clearing search');
    this.searchId = null;
    this.searchResults = [];
    this.isSearchMode = false;
    this.errorMessage = '';
    this.isSearching = false;
    console.log('Search cleared. isSearchMode:', this.isSearchMode);
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
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
    this.loadVendors();
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
          this.vendors = this.vendors.filter(vendor => vendor.vendorId !== vendorId);
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
