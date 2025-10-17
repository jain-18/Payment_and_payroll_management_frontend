import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { EmployeeRequest } from '../../model/employee-request.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { TokenUtils } from '../../utils/token-utils';

@Component({
  selector: 'app-create-employee-component',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar],
  templateUrl: './create-employee-component.html',
  styleUrl: './create-employee-component.css'
})
export class CreateEmployeeComponent implements OnInit {
  createEmployeeForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormValueChanges();
  }

  private initializeForm(): void {
    this.createEmployeeForm = this.fb.group({
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
        Validators.pattern(/^[A-Za-z ]+$/)
      ]],
      salary: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      joinedDate: ['', [
        Validators.required,
        this.pastOrPresentDateValidator
      ]],
      accountNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{9,18}$/)
      ]],
      ifsc: ['', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      ]]
    });
  }

  private setupFormValueChanges(): void {
    // Clear duplicate errors when user starts typing in email field
    this.createEmployeeForm.get('email')?.valueChanges.subscribe(() => {
      const emailControl = this.createEmployeeForm.get('email');
      if (emailControl?.errors && emailControl.errors['duplicate']) {
        const errors = { ...emailControl.errors };
        delete errors['duplicate'];
        emailControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    // Clear duplicate errors when user starts typing in account number field
    this.createEmployeeForm.get('accountNumber')?.valueChanges.subscribe(() => {
      const accountControl = this.createEmployeeForm.get('accountNumber');
      if (accountControl?.errors && accountControl.errors['duplicate']) {
        const errors = { ...accountControl.errors };
        delete errors['duplicate'];
        accountControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    });

    // Clear general error message when user starts editing any field
    this.createEmployeeForm.valueChanges.subscribe(() => {
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    });
  }

  private pastOrPresentDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.createEmployeeForm.valid) {
      // Debug token information
      TokenUtils.debugToken();
      
      // Check if token exists and is valid before making API call
      if (!TokenUtils.isValidToken()) {
        this.errorMessage = 'Authentication session expired. Please login again.';
        setTimeout(() => {
          this.router.navigate(['/organization-login']);
        }, 2000);
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.createEmployeeForm.value;
      const employeeRequest: EmployeeRequest = {
        employeeName: formValue.employeeName.trim(),
        employeeRole: formValue.employeeRole.trim(),
        email: formValue.email.trim(),
        department: formValue.department.trim(),
        salary: parseFloat(formValue.salary),
        joinedDate: formValue.joinedDate,
        accountNumber: formValue.accountNumber.trim(),
        ifsc: formValue.ifsc.trim().toUpperCase()
      };

      console.log('Submitting employee request:', employeeRequest);

      this.employeeService.createEmployee(employeeRequest).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.successMessage = `Employee "${response.employeeName}" created successfully with ID: ${response.employeeId}`;
          
          // Navigate to manage employees page after successful creation
          setTimeout(() => {
            this.router.navigate(['/org-dashboard/manage-employee']);
          }, 2000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating employee:', error);
          console.log('Error status:', error.status);
          console.log('Error details:', error.error);
          
          // Extract the actual error message from backend
          let errorMessage = '';
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          if (error.status === 400) {
            // Handle specific backend validation errors
            if (errorMessage.includes('Email already exists')) {
              this.createEmployeeForm.get('email')?.setErrors({ duplicate: true });
              this.errorMessage = 'Email already exists. Please use a different email address.';
            } else if (errorMessage.includes('Account number already exists')) {
              this.createEmployeeForm.get('accountNumber')?.setErrors({ duplicate: true });
              this.errorMessage = 'Account number already exists. Please use a different account number.';
            } else if (errorMessage.includes('Employee name must contain only alphabets and spaces')) {
              this.createEmployeeForm.get('employeeName')?.setErrors({ pattern: true });
              this.errorMessage = 'Employee name must contain only alphabets and spaces.';
            } else if (errorMessage.includes('Employee role must contain only alphabets and spaces')) {
              this.createEmployeeForm.get('employeeRole')?.setErrors({ pattern: true });
              this.errorMessage = 'Employee role must contain only alphabets and spaces.';
            } else if (errorMessage.includes('Department must contain only alphabets and spaces')) {
              this.createEmployeeForm.get('department')?.setErrors({ pattern: true });
              this.errorMessage = 'Department must contain only alphabets and spaces.';
            } else if (errorMessage.includes('email should be appropiate')) {
              this.createEmployeeForm.get('email')?.setErrors({ pattern: true });
              this.errorMessage = 'Please enter a valid email address.';
            } else if (errorMessage.includes('Account number must be 9–18 digits')) {
              this.createEmployeeForm.get('accountNumber')?.setErrors({ pattern: true });
              this.errorMessage = 'Account number must be 9-18 digits.';
            } else if (errorMessage.includes('Salary must be greater than 0')) {
              this.createEmployeeForm.get('salary')?.setErrors({ min: true });
              this.errorMessage = 'Salary must be greater than 0.';
            } else if (errorMessage.includes('Join Date should be present or past')) {
              this.createEmployeeForm.get('joinedDate')?.setErrors({ futureDate: true });
              this.errorMessage = 'Joined date cannot be in the future.';
            } else {
              // Display the exact backend error message
              this.errorMessage = errorMessage || 'Invalid data provided. Please check all fields.';
            }
          } else if (error.status === 409) {
            // Conflict - duplicate data
            if (errorMessage.includes('Email already exists')) {
              this.createEmployeeForm.get('email')?.setErrors({ duplicate: true });
              this.errorMessage = 'Email already exists. Please use a different email address.';
            } else if (errorMessage.includes('Account number already exists')) {
              this.createEmployeeForm.get('accountNumber')?.setErrors({ duplicate: true });
              this.errorMessage = 'Account number already exists. Please use a different account number.';
            } else {
              this.errorMessage = errorMessage || 'Email or account number already exists.';
            }
          } else if (error.status === 401) {
            this.errorMessage = 'Session expired. Please login again.';
            // Check if we have a token in localStorage
            const token = localStorage.getItem('token');
            console.log('Token in localStorage:', token ? 'Exists' : 'Missing');
            setTimeout(() => {
              this.router.navigate(['/organization-login']);
            }, 2000);
          } else if (error.status === 403) {
            this.errorMessage = 'Access denied. You do not have permission to create employees.';
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
          } else {
            // Display the backend error message if available, otherwise show a generic message
            this.errorMessage = errorMessage || `Failed to create employee. Error: ${error.status}`;
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createEmployeeForm.controls).forEach(key => {
      const control = this.createEmployeeForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createEmployeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.createEmployeeForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) return `${this.getFieldDisplayName(fieldName)} is required`;
      if (field.errors['email']) return 'Please enter a valid email address';
      if (field.errors['pattern']) return this.getPatternError(fieldName);
      if (field.errors['maxlength']) return `${this.getFieldDisplayName(fieldName)} is too long`;
      if (field.errors['minlength']) return `${this.getFieldDisplayName(fieldName)} is too short`;
      if (field.errors['min']) return `${this.getFieldDisplayName(fieldName)} must be greater than 0`;
      if (field.errors['futureDate']) return 'Joined date cannot be in the future';
      if (field.errors['duplicate']) {
        if (fieldName === 'email') return 'This email is already registered';
        if (fieldName === 'accountNumber') return 'This account number is already in use';
        return `This ${this.getFieldDisplayName(fieldName).toLowerCase()} is already in use`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      employeeName: 'Employee Name',
      employeeRole: 'Employee Role',
      email: 'Email',
      department: 'Department',
      salary: 'Salary',
      joinedDate: 'Joined Date',
      accountNumber: 'Account Number',
      ifsc: 'IFSC Code'
    };
    return displayNames[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    switch (fieldName) {
      case 'employeeName':
      case 'employeeRole':
      case 'department':
        return `${this.getFieldDisplayName(fieldName)} must contain only alphabets and spaces`;
      case 'email':
        return 'Please enter a valid email address';
      case 'salary':
        return 'Salary must be a valid decimal number';
      case 'accountNumber':
        return 'Account number must be 9-18 digits';
      case 'ifsc':
        return 'IFSC code must be 11 characters (e.g., ABCD0123456)';
      default:
        return 'Invalid format';
    }
  }

  onCancel(): void {
    this.router.navigate(['/org-dashboard']);
  }
}
