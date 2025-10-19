import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeResponse } from '../../model/employee-response.model';
import { EmployeePageResponse } from '../../model/pageable-response.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-manage-employee-component',
  imports: [CommonModule, FormsModule, RouterModule, OrgDashboardNavbar],
  templateUrl: './manage-employee-component.html',
  styleUrl: './manage-employee-component.css'
})
export class ManageEmployeeComponent implements OnInit {
  employees: EmployeeResponse[] = [];
  isLoading = true; // Start with loading true to handle SSR properly
  errorMessage = '';
  
  // Search functionality
  searchId: number | null = null;
  searchName: string = '';
  searchType: 'id' | 'name' = 'name'; // Default to name search for employees
  isSearching = false;
  searchResults: EmployeeResponse[] = [];
  isSearchMode = false;
  
  // Delete functionality
  deletingEmployeeId: number | null = null;
  
  // Expose Math to template
  Math = Math;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pageSizes = [5, 10, 15, 20];
  
  // Sorting properties
  sortBy = 'employeeName';
  sortDirection = 'asc';
  sortOptions = [
    { value: 'employeeName', label: 'Employee Name' },
    { value: 'employeeRole', label: 'Role' },
    { value: 'department', label: 'Department' },
    { value: 'email', label: 'Email' },
    { value: 'joinedDate', label: 'Joined Date' },
    { value: 'salary', label: 'Salary' }
  ];

  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only load employees if we're in the browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to ensure this runs after hydration
      setTimeout(() => {
        this.loadEmployees();
      }, 0);
    } else {
      // On server, set loading to false to prevent loading spinner
      this.isLoading = false;
    }
  }

  loadEmployees(): void {
    // Ensure we're in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.log('Starting to load employees, setting isLoading to true');
    this.isLoading = true;
    this.errorMessage = '';
    
    // Force change detection to update UI immediately
    this.cdr.detectChanges();

    this.employeeService.getAllEmployees(this.currentPage, this.pageSize, this.sortBy).subscribe({
      next: (response: EmployeePageResponse) => {
        console.log('Employees loaded:', response);
        this.employees = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        console.log('Loading state set to false, employees count:', this.employees.length);
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading employees:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to view employees.';
        } else if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load employees. Please try again.';
        }
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      complete: () => {
        // Ensure loading is set to false even if there are any issues
        this.isLoading = false;
        console.log('Request completed, isLoading:', this.isLoading);
        // Manually trigger change detection
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadEmployees();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadEmployees();
  }

  onSortChange(): void {
    this.currentPage = 0; // Reset to first page when changing sort
    this.loadEmployees();
  }

  refreshEmployees(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.currentPage = 0;
    this.loadEmployees();
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

  formatSalary(salary: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge bg-success' : 'badge bg-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  searchEmployee(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.searchType === 'id' && !this.searchId) {
      return;
    }

    if (this.searchType === 'name' && !this.searchName.trim()) {
      return;
    }

    console.log('Starting search for employee');
    this.isSearching = true;
    this.errorMessage = '';
    
    this.cdr.markForCheck();

    if (this.searchType === 'id') {
      this.employeeService.searchEmployeeById(this.searchId!).subscribe({
        next: (employee: EmployeeResponse) => {
          console.log('Employee found by ID:', employee);
          this.searchResults = [employee];
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
      this.employeeService.searchEmployeeByName(this.searchName.trim(), 0, 50, this.sortBy).subscribe({
        next: (response: EmployeePageResponse) => {
          console.log('Employees found by name:', response);
          this.searchResults = response.content || [];
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
    }
  }

  handleSearchError(error: any): void {
    console.error('Search error:', error);
    this.isSearching = false;
    this.searchResults = [];
    this.isSearchMode = true;
    
    if (error.status === 404) {
      this.errorMessage = this.searchType === 'id' 
        ? `No employee found with ID: ${this.searchId}`
        : `No employees found with name containing: "${this.searchName}"`;
    } else if (error.status === 400) {
      this.errorMessage = 'This employee does not belong to the given organization.';
    } else if (error.status === 401) {
      this.errorMessage = 'Session expired. Please login again.';
    } else if (error.status === 403) {
      this.errorMessage = 'Access denied. You do not have permission to search employees.';
    } else {
      this.errorMessage = error.error?.message || 'Search failed. Please try again.';
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
    console.log('Search cleared. isSearchMode:', this.isSearchMode);
    this.cdr.markForCheck();
    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchEmployee();
    }
  }

  onSearchTypeChange(): void {
    // Clear previous search when switching types
    this.clearSearch();
  }

  get displayedEmployees(): EmployeeResponse[] {
    return this.isSearchMode ? this.searchResults : this.employees;
  }

  get showPagination(): boolean {
    return !this.isSearchMode && this.totalPages > 1 && !this.isLoading && this.employees.length > 0;
  }

  deleteEmployee(employeeId: number, employeeName: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete employee "${employeeName}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    console.log('Starting delete for employee ID:', employeeId);
    this.deletingEmployeeId = employeeId;
    this.errorMessage = '';
    
    // Force change detection to show loading state
    this.cdr.markForCheck();

    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: () => {
        console.log('Employee deleted successfully:', employeeId);
        this.deletingEmployeeId = null;
        
        // Remove from current display
        if (this.isSearchMode) {
          // If in search mode, clear search and reload all
          this.clearSearch();
        } else {
          // Remove from employees array
          this.employees = this.employees.filter(emp => emp.employeeId !== employeeId);
          this.totalElements = Math.max(0, this.totalElements - 1);
          
          // If current page becomes empty and it's not the first page, go to previous page
          if (this.employees.length === 0 && this.currentPage > 0) {
            this.currentPage--;
          }
        }
        
        // Reload data to ensure consistency
        this.loadEmployees();
        
        // Force change detection
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.deletingEmployeeId = null;
        
        if (error.status === 404) {
          this.errorMessage = `Employee not found with ID: ${employeeId}`;
        } else if (error.status === 400) {
          this.errorMessage = 'This employee does not belong to the given organization.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to delete employees.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to delete employee. Please try again.';
        }
        
        // Force change detection
        this.cdr.markForCheck();
        setTimeout(() => this.cdr.detectChanges(), 0);
      },
      complete: () => {
        this.deletingEmployeeId = null;
        console.log('Delete request completed');
        this.cdr.markForCheck();
      }
    });
  }

  isDeleting(employeeId: number): boolean {
    return this.deletingEmployeeId === employeeId;
  }
}
