import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeResponse } from '../../model/employee-response.model';
import { EmployeeUpdateRequest } from '../../model/employee-update-request.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-edit-employee-component',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar],
  templateUrl: './edit-employee-component.html',
  styleUrl: './edit-employee-component.css'
})
export class EditEmployeeComponent implements OnInit {
  editEmployeeForm!: FormGroup;
  employeeId!: number;
  employee: EmployeeResponse | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.employeeId) {
        this.initializeForm();
        this.loadEmployee();
      } else {
        this.errorMessage = 'Invalid employee ID';
        this.isLoading = false;
      }
    }
  }

  private initializeForm(): void {
    this.editEmployeeForm = this.fb.group({
      employeeName: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        Validators.maxLength(50)
      ]],
      employeeRole: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      department: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
        Validators.maxLength(50)
      ]],
      salary: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      joinedDate: ['', [
        Validators.required
      ]],
      accountNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{9,18}$/)
      ]],
      ifsc: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      ]]
    });
  }

  private loadEmployee(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee: EmployeeResponse) => {
        console.log('Employee loaded for editing:', employee);
        this.employee = employee;
        this.populateForm(employee);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.errorMessage = `Employee not found with ID: ${this.employeeId}`;
        } else if (error.status === 400) {
          this.errorMessage = 'This employee does not belong to the given organization.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load employee. Please try again.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  private populateForm(employee: EmployeeResponse): void {
    this.editEmployeeForm.patchValue({
      employeeName: employee.employeeName,
      employeeRole: employee.employeeRole,
      email: employee.email,
      department: employee.department,
      salary: employee.salary,
      joinedDate: employee.joinedDate,
      accountNumber: employee.accountNumber,
      ifsc: employee.ifsc
    });
  }

  onSubmit(): void {
    if (!this.editEmployeeForm.valid || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.editEmployeeForm.value;
    const updateRequest: EmployeeUpdateRequest = {
      employeeName: formValue.employeeName?.trim(),
      employeeRole: formValue.employeeRole?.trim(),
      email: formValue.email?.trim(),
      department: formValue.department?.trim(),
      salary: parseFloat(formValue.salary),
      joinedDate: formValue.joinedDate,
      accountNumber: formValue.accountNumber?.trim(),
      ifsc: formValue.ifsc?.trim().toUpperCase()
    };

    console.log('Submitting employee update:', updateRequest);

    this.employeeService.updateEmployee(this.employeeId, updateRequest).subscribe({
      next: (response: EmployeeResponse) => {
        console.log('Employee updated successfully:', response);
        this.isSubmitting = false;
        this.successMessage = `Employee "${response.employeeName}" updated successfully!`;
        
        // Navigate back to manage employees after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/org-dashboard/manage-employee']);
        }, 2000);
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating employee:', error);
        this.isSubmitting = false;
        
        if (error.status === 404) {
          this.errorMessage = `Employee not found with ID: ${this.employeeId}`;
        } else if (error.status === 400) {
          // Extract specific backend error messages
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'object') {
            // Handle validation errors or specific backend messages
            const backendMessage = error.error.details || error.error.error || error.error;
            this.errorMessage = typeof backendMessage === 'string' ? backendMessage : 'Invalid data provided.';
          } else {
            this.errorMessage = 'Invalid data provided.';
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to edit employees.';
        } else {
          // For any other error, try to extract the backend message
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Failed to update employee. Please try again.';
          }
        }
        
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/org-dashboard/manage-employee']);
  }

  // Form field error getters
  get employeeName() { return this.editEmployeeForm.get('employeeName'); }
  get employeeRole() { return this.editEmployeeForm.get('employeeRole'); }
  get email() { return this.editEmployeeForm.get('email'); }
  get department() { return this.editEmployeeForm.get('department'); }
  get salary() { return this.editEmployeeForm.get('salary'); }
  get joinedDate() { return this.editEmployeeForm.get('joinedDate'); }
  get accountNumber() { return this.editEmployeeForm.get('accountNumber'); }
  get ifsc() { return this.editEmployeeForm.get('ifsc'); }
}
