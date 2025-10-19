import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { RaiseConcernedResponse, RaiseConcernedPageResponse } from '../../model/raise-concerned-response.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-concerns-component',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './concerns-component.html',
  styleUrl: './concerns-component.css'
})
export class ConcernsComponent implements OnInit {
  concerns: RaiseConcernedResponse[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 15, 20];
  
  // Filter properties
  selectedFilter = 'all'; // 'all', 'pending', 'solved'
  filterOptions = [
    { value: 'all', label: 'All Concerns' },
    { value: 'pending', label: 'Pending Only' },
    { value: 'solved', label: 'Solved Only' }
  ];
  
  // Action processing
  processingConcernId: number | null = null;
  actionType: 'solve' | 'delete' | null = null;
  
  // Expose Math to template
  Math = Math;

  constructor(
    private organizationService: OrganizationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadConcerns();
      }, 0);
    } else {
      this.isLoading = false;
    }
  }

  loadConcerns(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Loading raised concerns with filter:', this.selectedFilter);
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.cdr.markForCheck();

    // Convert filter to boolean parameter
    let solvedFilter: boolean | undefined;
    if (this.selectedFilter === 'pending') {
      solvedFilter = false;
    } else if (this.selectedFilter === 'solved') {
      solvedFilter = true;
    }
    // For 'all', solvedFilter remains undefined

    this.organizationService.getAllRaisedConcerns(this.currentPage, this.pageSize, 'raiseAt', solvedFilter).subscribe({
      next: (response: RaiseConcernedPageResponse) => {
        this.handleConcernsResponse(response);
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

  private handleConcernsResponse(response: RaiseConcernedPageResponse): void {
    console.log('Concerns loaded:', response);
    this.concerns = response.content || [];
    this.totalElements = response.totalElements || 0;
    this.totalPages = response.totalPages || 0;
    this.isLoading = false;
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  private handleError(error: any): void {
    this.isLoading = false;
    console.error('Error loading concerns:', error);
    
    if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied. You do not have permission to view concerns.';
    } else if (error.status === 0) {
      this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
    } else {
      this.errorMessage = error.error?.message || 'Failed to load concerns. Please try again.';
    }
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  refreshConcerns(): void {
    this.currentPage = 0;
    this.loadConcerns();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadConcerns();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadConcerns();
    }
  }

  onFilterChange(): void {
    console.log('Filter changed to:', this.selectedFilter);
    this.currentPage = 0; // Reset to first page when filter changes
    this.loadConcerns();
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

  markAsSolved(concern: RaiseConcernedResponse): void {
    if (concern.solved) {
      return; // Already solved
    }

    console.log('Marking concern as solved:', concern);
    console.log('Request URL will be:', `http://localhost:8080/portal/organizations/solvedRaiseConcern?concernId=${concern.concernId}`);
    this.processingConcernId = concern.concernId;
    this.actionType = 'solve';
    this.errorMessage = '';
    this.successMessage = '';
    
    this.organizationService.markConcernAsSolved(concern.concernId).subscribe({
      next: (response: RaiseConcernedResponse) => {
        console.log('Concern marked as solved:', response);
        this.processingConcernId = null;
        this.actionType = null;
        
        // Update the concern in the local array
        const index = this.concerns.findIndex(c => c.concernId === concern.concernId);
        if (index !== -1) {
          this.concerns[index].solved = true;
        }
        
        this.successMessage = `Concern #${response.concernId} has been marked as solved successfully. Employee has been notified via email.`;
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error marking concern as solved:', error);
        console.error('Error status:', error.status);
        console.error('Error response:', error.error);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        this.processingConcernId = null;
        this.actionType = null;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid request. Please check the concern details.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to solve concerns.';
        } else if (error.status === 404) {
          this.errorMessage = 'Concern not found or does not belong to your organization.';
        } else if (error.status === 500) {
          this.errorMessage = `Server error: ${error.error?.message || 'The server encountered an internal error while processing the request. Please check the backend logs for more details.'}`; 
        } else {
          this.errorMessage = error.error?.message || 'Failed to mark concern as solved. Please try again.';
        }
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  deleteConcern(concern: RaiseConcernedResponse): void {
    if (concern.solved) {
      this.errorMessage = 'Cannot delete a solved concern.';
      return;
    }

    if (!confirm(`Are you sure you want to delete concern #${concern.concernId}? This action cannot be undone.`)) {
      return;
    }

    console.log('Deleting concern:', concern);
    this.processingConcernId = concern.concernId;
    this.actionType = 'delete';
    this.errorMessage = '';
    this.successMessage = '';
    
    this.organizationService.deleteConcern(concern.concernId).subscribe({
      next: () => {
        console.log('Concern deleted successfully');
        this.processingConcernId = null;
        this.actionType = null;
        
        // Remove the concern from the local array
        this.concerns = this.concerns.filter(c => c.concernId !== concern.concernId);
        this.totalElements--;
        
        this.successMessage = `Concern #${concern.concernId} has been deleted successfully.`;
        
        // If current page is empty and not the first page, go to previous page
        if (this.concerns.length === 0 && this.currentPage > 0) {
          this.currentPage--;
          this.loadConcerns();
          return;
        }
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error deleting concern:', error);
        this.processingConcernId = null;
        this.actionType = null;
        
        if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Cannot delete this concern. It may already be solved.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to delete concerns.';
        } else if (error.status === 404) {
          this.errorMessage = 'Concern not found or does not belong to your organization.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to delete concern. Please try again.';
        }
        
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      }
    });
  }

  isProcessing(concernId: number, type: 'solve' | 'delete'): boolean {
    return this.processingConcernId === concernId && this.actionType === type;
  }

  canPerformAction(concern: RaiseConcernedResponse): boolean {
    return this.processingConcernId === null || this.processingConcernId !== concern.concernId;
  }

  getStatusBadgeClass(solved: boolean): string {
    return solved ? 'badge bg-success' : 'badge bg-warning text-dark';
  }

  getStatusText(solved: boolean): string {
    return solved ? 'Solved' : 'Pending';
  }

  get showPagination(): boolean {
    return this.totalPages > 1 && !this.isLoading;
  }

  trackByConcernId(index: number, concern: RaiseConcernedResponse): number {
    return concern.concernId;
  }
}
