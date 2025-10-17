import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AdminService } from '../services/admin-service';
import { AllRequest } from '../model/allRequest';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-request-component',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, FormsModule],
  templateUrl: './admin-request-component.html',
  styleUrl: './admin-request-component.css'
})
export class AdminRequestComponent implements OnInit {
  svc = inject(AdminService);
  Math = Math; // Make Math available in template

  // Data
  allRequests: AllRequest[] = [];
  loading = false;
  error = '';

  // Search and Filters
  searchTerm = '';
  statusFilter = '';
  typeFilter = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'requestDate';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.error = '';
    
    // Always use the getRequestByCompany endpoint as it handles all cases
    // including status-only, type-only, or combined filters
    this.getCompanyByParameters({
      search: this.searchTerm.trim() || '', // Send empty string if no search term
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortBy,
      type: this.typeFilter || undefined,
      status: this.statusFilter || undefined
    });
  }

  getCompanyByParameters(params: {search: string, page: number, size: number, sort: string, type?: string, status?: string}) {
    this.loading = true;
    this.error = '';
    
    this.svc.getRequestByCompanyName(params).subscribe({
      next: (data) => {
        this.allRequests = data.content;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
        this.error = 'Failed to load requests. Please try again later.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    // Debounce search to avoid too many API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0; // Reset to first page when searching
      this.loadRequests(); // This will handle both search and filters
    }, 300);
  }

  onFilterChange() {
    this.currentPage = 0; // Reset to first page when filters change
    this.loadRequests(); // This will handle both search and filters
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRequests(); // This will maintain current search and filters
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadRequests();
  }

  onSortChange(sortField: string) {
    this.sortBy = sortField;
    this.loadRequests();
  }

  clearFilters() {
    this.searchTerm = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.currentPage = 0;
    this.loadRequests();
  }
}