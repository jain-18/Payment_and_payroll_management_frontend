import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService, PagedConcernResponse, ConcernFilters } from '../../services/employee-service';
import { RaiseConcernResp } from '../../model/raiseConcernResp';
import { EmployeeNavbarComponent } from '../employee-navbar-component/employee-navbar-component';

@Component({
  selector: 'app-employee-concern-component',
  imports: [CommonModule, ReactiveFormsModule, EmployeeNavbarComponent],
  templateUrl: './employee-concern-component.html',
  styleUrl: './employee-concern-component.css'
})
export class EmployeeConcernComponent implements OnInit {
    private employeeService = inject(EmployeeService);

    // Data properties
    allConcerns: RaiseConcernResp[] = [];
    pagedResponse!: PagedConcernResponse;
    
    // UI state properties
    isLoading = false;
    
    // Pagination properties
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    
    // Filter form
    filterForm!: FormGroup;

  // Make Math available in template
  Math = Math;

  constructor(private cdr: ChangeDetectorRef) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadConcerns();
  }
  
  private initializeForm(): void {
    this.filterForm = new FormGroup({
      sortBy: new FormControl('raiseAt')
    });
  }
  
  loadConcerns(filters?: ConcernFilters): void {
    this.isLoading = true;
    
    const searchFilters: ConcernFilters = {
      page: this.currentPage,
      size: this.pageSize,
      ...filters
    };
    
    console.log('Loading concerns with filters:', searchFilters);
    
    this.employeeService.getAllConcerns(searchFilters).subscribe({
      next: (data: PagedConcernResponse) => {
        console.log('Concerns Response:', data);
        this.pagedResponse = data;
        this.allConcerns = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.currentPage = data.number;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching employee concerns:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
  
  onPageChange(page: number): void {
    this.currentPage = page;
    const formValue = this.filterForm.value;
    const filters: ConcernFilters = {
      sortBy: formValue.sortBy
    };
    this.loadConcerns(filters);
  }
  
  onSortChange(): void {
    this.currentPage = 0; // Reset to first page
    const formValue = this.filterForm.value;
    const filters: ConcernFilters = {
      sortBy: formValue.sortBy
    };
    this.loadConcerns(filters);
  }
  
  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
