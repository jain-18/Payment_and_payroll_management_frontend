import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { OrgDashboardComponent } from '../../org-dashboard-component/org-dashboard-component';
import { OrgDashboardNavbar } from '../../org-dashboard-navbar/org-dashboard-navbar';
import { OrganizationService, PagedSalarySlipResponse, SalarySlipFilters } from '../../services/organization-service';
import { SalaryRequestOfMonth } from '../../model/salaryRequestOfMonth';
import { EmployeeUpdateRequest } from '../../../model/employee-update-request.model';
import { EmployeeService } from '../../../services/employee.service';

@Component({
  selector: 'app-employee-salary-component',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar],
  templateUrl: './employee-salary-component.html',
  styleUrls: ['./employee-salary-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeSalaryComponent implements OnInit, OnDestroy {

  private organizationService = inject(OrganizationService);
  private employeeService = inject(EmployeeService)

  employeeUpdateRequest !: EmployeeUpdateRequest;

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Data properties
  salaryStructures: SalaryRequestOfMonth[] = [];
  pagedResponse!: PagedSalarySlipResponse;

  // UI state properties
  isLoading = false;
  isCreating = false;
  isSendingRequest = false;
  isSendingGeneralRequest = false;

  // Pagination properties
  currentPage = 0;
  pageSize = 5; // Reduced for faster loading
  totalElements = 0;
  totalPages = 0;

  // Filter form
  filterForm!: FormGroup;

  // Edit salary form and modal state
  editForm!: FormGroup;
  showEditModal = false;
  selectedStructure: SalaryRequestOfMonth | null = null;
  isUpdating = false;

  // Make Math available in template
  Math = Math;

  // Track by function for better performance
  trackBySlipId(index: number, item: SalaryRequestOfMonth): any {
    return item.slipId || index;
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadSalarySlips();
    this.setupFilterSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        const formValue = this.filterForm.value;
        const filters: SalarySlipFilters = {
          status: formValue.status || undefined,
          sortBy: formValue.sortBy
        };
        this.loadSalarySlips(filters);
      });
  }

  private initializeForm(): void {
    this.filterForm = new FormGroup({
      status: new FormControl(''),
      sortBy: new FormControl('createdAt')
    });

    this.editForm = new FormGroup({
      salary: new FormControl('', []),
      employeeName: new FormControl({ value: '', disabled: true }),
      employeeId: new FormControl({ value: '', disabled: true })
    });
  }

  loadSalarySlips(filters?: SalarySlipFilters): void {
    this.isLoading = true;

    const searchFilters: SalarySlipFilters = {
      page: this.currentPage,
      size: this.pageSize,
      ...filters
    };

    this.organizationService.getAllSalarySlips(searchFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: PagedSalarySlipResponse) => {
          this.pagedResponse = data;
          this.salaryStructures = data.content || [];
          this.totalElements = data.totalElements || 0;
          this.totalPages = data.totalPages || 0;
          this.currentPage = data.number || 0;
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error fetching salary slips:', err);
          this.salaryStructures = [];
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  createSalaryStructures(): void {
    this.isCreating = true;

    this.organizationService.createSalaryStructure().subscribe({
      next: (message) => {
        console.log('Salary structures created successfully:', message);
        this.isCreating = false;
        this.cdr.markForCheck();
        // Reload the salary slips to show newly created structures
        this.loadSalarySlips();
        alert('Salary structures created successfully!');
      },
      error: (err) => {
        console.error('Error creating salary structures:', err);
        this.isCreating = false;
        this.cdr.markForCheck();
        alert('Failed to create salary structures. Please try again.');
      }
    });
  }

  sendUpdateRequestToAdmin(): void {
    this.isSendingRequest = true;

    this.organizationService.sendUpdateSalaryToAdmin().subscribe({
      next: () => {
        console.log('Salary update request sent to admin successfully');
        this.isSendingRequest = false;
        this.cdr.markForCheck();
        alert('Salary update request sent to admin for approval!');
      },
      error: (err) => {
        console.error('Error sending salary update request to admin:', err);
        this.isSendingRequest = false;
        this.cdr.markForCheck();

        // Check if the error status is 409 (Conflict)
        if (err.status === 409) {
          alert('There is no updated salary slip to send to admin.');
        } else {
          alert('Failed to send request to admin. Please try again.');
        }
      }
    });
  }

  sendGeneralRequestToAdmin(): void {
    this.isSendingGeneralRequest = true;

    this.organizationService.sendRequestToAdmin().subscribe({
      next: () => {
        console.log('General request sent to admin successfully');
        this.isSendingGeneralRequest = false;
        this.cdr.markForCheck();
        alert('Request sent to admin successfully!');
      },
      error: (err) => {
        console.error('Error sending general request to admin:', err);
        this.isSendingGeneralRequest = false;
        this.cdr.markForCheck();
        
        // Check if the error status is 409 (Conflict)
        if (err.status === 409) {
          alert('Request already sent to admin.');
        } else {
          alert('Failed to send request to admin. Please try again.');
        }
      }
    });
  }

  // onFilterChange is now handled by setupFilterSubscription

  onClearFilters(): void {
    this.filterForm.reset({
      status: '',
      sortBy: 'createdAt'
    });
    this.currentPage = 0;
    this.loadSalarySlips();
  }

  onPageChange(page: number): void {
    if (page !== this.currentPage) {
      this.currentPage = page;
      const formValue = this.filterForm.value;
      const filters: SalarySlipFilters = {
        status: formValue.status || undefined,
        sortBy: formValue.sortBy
      };
      this.loadSalarySlips(filters);
    }
  }

  viewDetails(structure: SalaryRequestOfMonth): void {
    console.log('Viewing details for:', structure);
    // Implement view details logic
  }

  editStructure(structure: SalaryRequestOfMonth): void {
    console.log('Opening edit modal for:', structure);

    this.selectedStructure = structure;

    // Pre-populate the form with current values
    this.editForm.patchValue({
      salary: structure.salary,
      employeeName: structure.employee,
      employeeId: structure.employeeId
    });

    this.showEditModal = true;
  }

  submitEdit(): void {
    if (this.editForm.valid && this.selectedStructure) {
      this.isUpdating = true;

      // Create update request with new salary
      const updateRequest: EmployeeUpdateRequest = {
        salary: this.editForm.get('salary')?.value
      };

      console.log('Submitting salary update:', updateRequest);

      // First, update the employee's salary through employee service
      this.employeeService.updateEmployee(this.selectedStructure.employeeId, updateRequest).subscribe({
        next: (employeeResponse) => {
          console.log('Employee salary updated successfully:', employeeResponse);

          // Update the selected structure with new salary
          this.selectedStructure!.salary = updateRequest.salary!;

          // Then update the salary structure
          this.updateStructure(this.selectedStructure!);
        },
        error: (err) => {
          console.error('Error updating employee salary:', err);
          this.isUpdating = false;
          // Optionally show error message to user
        }
      });
    }
  }

  updateStructure(structure: SalaryRequestOfMonth): void {
    this.organizationService.updateSalaryStructure(structure.slipId).subscribe({
      next: (response) => {
        console.log('Salary structure updated successfully:', response);
        this.isUpdating = false;
        this.closeEditModal();

        // Reload salary slips to show updated data
        this.loadSalarySlips();

        // Optionally show success message to user
        // this.showSuccessMessage('Salary updated successfully!');
      },
      error: (err) => {
        console.error('Error updating salary structure:', err);
        this.isUpdating = false;

        // Optionally show error message to user
        // this.showErrorMessage('Failed to update salary. Please try again.');
      }
    });
  }

  deleteStructure(structure: SalaryRequestOfMonth): void {
    console.log('Deleting structure:', structure);
    // Implement delete logic
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedStructure = null;
    this.isUpdating = false;
    this.editForm.reset();
  }

  cancelEdit(): void {
    this.closeEditModal();
  }

  onSalaryInput(event: any): void {
    const value = event.target.value;
    // Convert string to number to ensure proper handling
    const numericValue = value ? parseFloat(value) : 0;
    this.editForm.patchValue({ salary: numericValue });
  }

  getEmployeeInitials(name: string): string {
    if (!name) return 'N/A';
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-warning text-dark';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      case 'PROCESSED': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bi-clock-fill';
      case 'APPROVED': return 'bi-check-circle-fill';
      case 'REJECTED': return 'bi-x-circle-fill';
      case 'PROCESSED': return 'bi-check2-all';
      default: return 'bi-question-circle-fill';
    }
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
