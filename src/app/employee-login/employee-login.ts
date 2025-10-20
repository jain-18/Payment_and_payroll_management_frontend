import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { LoginNavbar } from '../login-navbar/login-navbar';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginViewModel } from '../model/loginViewModel';
import { EmployeeLoginService } from '../services/employee-login';
import { Router } from '@angular/router';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [LoginNavbar, CommonModule, ReactiveFormsModule],
  templateUrl: './employee-login.html',
  styleUrls: ['./employee-login.css']
})
export class EmployeeLogin implements OnInit {
  
  loginForm !: FormGroup;
  svc = inject(EmployeeLoginService);
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit() {
    this.initializeForm();
    // Clear any existing tokens on login page
    this.clearExistingSession();
  }

  constructor(private cdr: ChangeDetectorRef, private router: Router) { }
  
  private initializeForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ])
    });
  }

  private clearExistingSession() {
    // Clear any existing session data
    const token = this.svc.getToken();
    if (token) {
      // Optional: Could redirect if already logged in
      // this.router.navigate(['/employee/employee-dashboard']);
    }
  }
  
  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    const loginData: LoginViewModel = {
      username: this.loginForm.get('username')?.value?.trim(),
      password: this.loginForm.get('password')?.value
    };

    console.log('Attempting employee login:', { username: loginData.username });

    this.svc.loginEmployee(loginData).subscribe({
      next: (response: LoginResponseViewModel) => {
        console.log('Login response:', response);
        
        if (response != null) {
          // Save token and user data
          this.svc.saveToken(response);
          
          // Show success message briefly
          console.log('Login successful for employee:', response);
          
          // Navigate to employee dashboard
          this.router.navigate(['/employee/employee-dashboard']).then(() => {
            console.log('Navigation to employee dashboard successful');
          }).catch(navError => {
            console.error('Navigation error:', navError);
            this.errorMessage = 'Login successful but navigation failed. Please refresh the page.';
          });
        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Login error:', error);
        
        this.isLoading = false;
        
        // Handle different types of errors
        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Your account has been suspended. Please contact administrator.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
        
        // Clear password field on error
        this.loginForm.get('password')?.setValue('');
        this.cdr.detectChanges();
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
      }
    }
    return '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  clearError() {
    this.errorMessage = '';
  }

}
