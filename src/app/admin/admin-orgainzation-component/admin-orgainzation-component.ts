import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { AdminService } from '../services/admin-service';
import { OrganizationResponse } from '../model/organizationResponse';
import { OrgInfoResponse } from '../model/orgInfoResponse';
import { PageResponse } from '../model/pageResponse';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-orgainzation-component',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminNavbarComponent],
  templateUrl: './admin-orgainzation-component.html',
  styleUrl: './admin-orgainzation-component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrgainzationComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  // Reactive state
  private organizationsSubject = new BehaviorSubject<OrganizationResponse[]>([]);
  organizations$ = this.organizationsSubject.asObservable();
  
  // Data
  organizations: OrganizationResponse[] = [];
  orgInfoResponse !: OrgInfoResponse;
  loading = true;
  error = '';
  dataLoaded = false;
  loadStartTime = 0;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  pageNumbers: number[] = [];

  // Filtering
  currentFilter: boolean | undefined;
  searchTerm: string = '';

  // Initial load handled in the updated ngOnInit below

  loadOrganizations() {
    this.loading = true;
    this.error = '';
    this.loadStartTime = Date.now();
    console.log('Fetching organizations with params:', {
      page: this.currentPage,
      size: this.pageSize,
      active: this.currentFilter
    });

    this.adminService.listOrganizations({
      page: this.currentPage,
      size: this.pageSize,
      active: this.currentFilter
    }).subscribe({
      next: (response) => {
        console.log('Raw API response:', response);
        // Update the BehaviorSubject
        this.organizationsSubject.next(response.content);
        this.organizations = response.content;
        this.totalPages = response.totalPages;
        const loadTime = Date.now() - this.loadStartTime;
        console.log(`Organizations loaded in ${loadTime}ms:`, this.organizations);
        
        // Only update page numbers if they've changed
        if (this.pageNumbers.length !== this.totalPages) {
          this.pageNumbers = Array.from({length: this.totalPages}, (_, i) => i);
        }
        
        // Update state and trigger change detection
        this.loading = false;
        this.dataLoaded = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.error = `Failed to load organizations: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadOrganizations();
    }
  }

  onPageSizeChange() {
    this.currentPage = 0; // Reset to first page
    this.loadOrganizations();
  }

  filterOrganizations() {
    this.currentPage = 0; // Reset to first page
    this.loadOrganizations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.loadOrganizations();

    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after last input
      distinctUntilChanged(), // Only emit if value changed
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      if (!searchTerm.trim()) {
        // If search is empty, load all organizations
        this.loadOrganizations();
        return;
      }
      
      this.loading = true;
      this.error = '';
      
      this.adminService.searchOrganizations(searchTerm).subscribe({
        next: (response) => {
          console.log('Search results:', response);
          if (response && response.content) {
            this.organizationsSubject.next(response.content);
            this.totalPages = response.totalPages || 1;
            this.pageNumbers = Array.from({length: this.totalPages}, (_, i) => i);
          } else {
            this.organizationsSubject.next([]);
            this.totalPages = 0;
            this.pageNumbers = [];
          }
          this.loading = false;
          this.dataLoaded = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Search error:', err);
          this.error = 'No organizations found';
          this.loading = false;
          this.organizationsSubject.next([]);
          this.cdr.detectChanges();
        }
      });
    });
  }

  searchTermChanged(term: string) {
    this.searchSubject.next(term);
  }

  toggleStatus(orgId: number, newStatus: boolean) {
    this.loading = true;
    this.error = '';
    console.log(`Attempting to change organization ${orgId} status to ${newStatus}`);

    const currentOrgs = this.organizationsSubject.getValue();
    const orgIndex = currentOrgs.findIndex(org => org.organizationId === orgId);
    
    if (orgIndex === -1) {
      console.error(`Organization ${orgId} not found`);
      this.error = 'Organization not found';
      this.loading = false;
      return;
    }

    const org = currentOrgs[orgIndex];
    console.log('Current organization:', org);

    this.adminService.changeOrganizationStatus(orgId, newStatus).subscribe({
      next: () => {
        console.log('Status changed successfully');
        
        // Create a new array with the updated organization
        const updatedOrgs = [...currentOrgs];
        updatedOrgs[orgIndex] = { ...updatedOrgs[orgIndex], active: newStatus };
        
        // Update the BehaviorSubject with the new array
        this.organizationsSubject.next(updatedOrgs);
        
        // Reload the data to ensure consistency
        this.loadOrganizations();
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.error = `Failed to update status: ${err.error?.message || err.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewDetails(orgId: number) {
    this.router.navigate(['/admin/organizations', orgId]);
  }

  trackByOrgId(index: number, org: OrganizationResponse): number {
    return org.organizationId;
  }

  searchOrganizations(searchTerm: string): Observable<PageResponse<OrganizationResponse>> {
    return this.adminService.searchOrganizations(searchTerm);
  }
}
