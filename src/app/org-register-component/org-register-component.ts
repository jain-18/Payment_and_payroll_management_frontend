import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginNavbar } from '../login-navbar/login-navbar';
import { CommonModule } from '@angular/common';
import { OrgRegistrationService } from '../services/org-registration.service';
import { RegistrationRequest } from '../model/registration.model';

@Component({
  selector: 'app-org-register-component',
  standalone: true,
  imports: [ReactiveFormsModule, LoginNavbar, CommonModule, RouterLink],
  templateUrl: './org-register-component.html',
  styleUrls: ['./org-register-component.css']
})
export class OrgRegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private orgRegistrationService = inject(OrgRegistrationService);

  registerForm: FormGroup;
  isLoading = false;
  registerError = '';
  uploadedFiles: { [key: string]: File } = {};
  showOtpForm = false;
  otpForm: FormGroup;

  constructor() {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/)
      ]],
      organizationName: ['', [
        Validators.required,
        Validators.pattern('^[A-Za-z][A-Za-z0-9 ]*$'),
        Validators.maxLength(50)
      ]],
      organizationEmail: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      address: this.fb.group({
        city: ['', [Validators.required, Validators.minLength(2)]],
        state: ['', [Validators.required, Validators.minLength(2)]],
        pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      }),
      accountNo: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{9,18}$')
      ]],
      ifsc: ['', [
        Validators.required,
        Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')
      ]],
      pancard: [null, Validators.required],
      cancelledCheque: [null, Validators.required],
      companyRegistrationCertificate: [null, Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  // Getters for form controls
  get userNameControl() { return this.registerForm.get('userName'); }
  get passwordControl() { return this.registerForm.get('password'); }
  get organizationNameControl() { return this.registerForm.get('organizationName'); }
  get organizationEmailControl() { return this.registerForm.get('organizationEmail'); }
  get addressControl() { return this.registerForm.get('address'); }
  get cityControl() { return this.addressControl?.get('city'); }
  get stateControl() { return this.addressControl?.get('state'); }
  get pinCodeControl() { return this.addressControl?.get('pinCode'); }
  get accountNoControl() { return this.registerForm.get('accountNo'); }
  get ifscControl() { return this.registerForm.get('ifsc'); }
  get pancardControl() { return this.registerForm.get('pancard'); }
  get cancelledChequeControl() { return this.registerForm.get('cancelledCheque'); }
  get companyRegistrationCertificateControl() { return this.registerForm.get('companyRegistrationCertificate'); }
  get otpControl() { return this.otpForm.get('otp'); }

  // Password validation methods
  hasUpperCase(value: string | null): boolean {
    return value ? /[A-Z]/.test(value) : false;
  }

  hasLowerCase(value: string | null): boolean {
    return value ? /[a-z]/.test(value) : false;
  }

  hasNumber(value: string | null): boolean {
    return value ? /[0-9]/.test(value) : false;
  }

  hasSpecialChar(value: string | null): boolean {
    return value ? /[@$!%*?&]/.test(value) : false;
  }

  meetsMinLength(value: string | null): boolean {
    return value ? value.length >= 6 : false;
  }

  onFileSelected(event: Event, fieldName: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      
      if (validTypes.includes(file.type)) {
        this.uploadedFiles[fieldName] = file;
        // Don't set the value for file inputs
        this.registerForm.get(fieldName)?.setErrors(null);
      } else {
        this.registerForm.get(fieldName)?.setErrors({ invalidFileType: true });
      }
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.showOtpForm = false;
    
    // Reset specific field errors
    this.registerForm.get('userName')?.setErrors(null);
    this.registerForm.get('organizationName')?.setErrors(null);
    this.registerForm.get('organizationEmail')?.setErrors(null);
    this.registerForm.get('accountNo')?.setErrors(null);

    const formData = new FormData();
    
    // Add text fields
    formData.append('userName', this.registerForm.get('userName')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('organizationName', this.registerForm.get('organizationName')?.value);
    formData.append('organizationEmail', this.registerForm.get('organizationEmail')?.value);
    
    // Add address fields
    const address = this.registerForm.get('address')?.value;
    formData.append('address.city', address.city);
    formData.append('address.state', address.state);
    formData.append('address.pinCode', address.pinCode);
    
    formData.append('accountNo', this.registerForm.get('accountNo')?.value);
    formData.append('ifsc', this.registerForm.get('ifsc')?.value);

    // Add files
    if (this.uploadedFiles['pancard']) {
      formData.append('pancard', this.uploadedFiles['pancard']);
    }
    if (this.uploadedFiles['cancelledCheque']) {
      formData.append('cancelledCheque', this.uploadedFiles['cancelledCheque']);
    }
    if (this.uploadedFiles['companyRegistrationCertificate']) {
      formData.append('companyRegistrationCertificate', this.uploadedFiles['companyRegistrationCertificate']);
    }

    this.orgRegistrationService.register(formData).subscribe({
      next: (response) => {
        console.log('Registration response:', response);
        this.isLoading = false;
        this.registerForm.disable(); // Disable the registration form
        this.showOtpForm = true;
        this.registerError = ''; // Clear any previous errors
      },
      error: (error) => {
        console.error('Registration error:', error);
        // If it's a successful response but treated as error due to responseType mismatch
        if (error.status === 200 && error.error?.text) {
          this.isLoading = false;
          this.registerForm.disable(); // Disable the registration form
          this.showOtpForm = true;
          this.registerError = ''; // Clear any previous errors
          return;
        }

        this.isLoading = false;
        const errorMessage = error.message || error.error?.message || 'Registration failed. Please try again later.';

        // Handle specific backend errors
        if (errorMessage.includes('Username is already taken')) {
          this.registerForm.get('userName')?.setErrors({ duplicate: true });
          this.registerError = 'Username is already taken. Please choose another one.';
        } else if (errorMessage.includes('Organization name already exists')) {
          this.registerForm.get('organizationName')?.setErrors({ duplicate: true });
          this.registerError = 'Organization name already exists.';
        } else if (errorMessage.includes('Email is already registered')) {
          this.registerForm.get('organizationEmail')?.setErrors({ duplicate: true });
          this.registerError = 'Email is already registered.';
        } else if (errorMessage.includes('Account number is already linked')) {
          this.registerForm.get('accountNo')?.setErrors({ duplicate: true });
          this.registerError = 'Account number is already linked to another organization.';
        } else {
          this.registerError = errorMessage;
        }
      }
    });
  }

  onOtpSubmit() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    const otpData = {
      email: this.registerForm.get('organizationEmail')?.value,
      otp: this.otpForm.get('otp')?.value
    };

    this.orgRegistrationService.verifyOtp(otpData).subscribe({
      next: (response) => {
        console.log('Verification successful:', response);
        this.isLoading = false;
        // Show success message before navigation
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success text-center animate__animated animate__fadeIn';
        successMessage.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          Registration successful! Redirecting to login...
        `;
        const formElement = document.querySelector('form');
        if (formElement) {
          formElement.innerHTML = '';
          formElement.appendChild(successMessage);
        }
        // Navigate after a short delay to show the success message
        setTimeout(() => {
          this.router.navigate(['/organization-login']);
        }, 2000);
      },
      error: (error) => {
        console.error('OTP verification error:', error);
        this.isLoading = false;
        const errorMessage = error.message || error.error?.message || 'OTP verification failed';
        
        if (error.status === 200) {
          // If the backend returns 200 but it's caught as error due to response format
          // Show success message before navigation
          const successMessage = document.createElement('div');
          successMessage.className = 'alert alert-success text-center animate__animated animate__fadeIn';
          successMessage.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i>
            Registration successful! Redirecting to login...
          `;
          const formElement = document.querySelector('form');
          if (formElement) {
            formElement.innerHTML = '';
            formElement.appendChild(successMessage);
          }
          // Navigate after a short delay to show the success message
          setTimeout(() => {
            this.router.navigate(['/organization-login']);
          }, 2000);
        } else {
          // Handle specific OTP errors
          this.isLoading = false; // Ensure loading state is reset
          
          if (errorMessage.includes('Invalid OTP') || errorMessage.includes('Invalid Otp')) {
            this.otpForm.get('otp')?.setErrors({ invalid: true });
            this.registerError = 'Invalid OTP. Please try again.';
          } else if (errorMessage.includes('OTP expired')) {
            this.otpForm.get('otp')?.setErrors({ expired: true });
            this.registerError = 'OTP has expired. Please request a new one.';
          } else {
            this.registerError = errorMessage;
          }
          // Clear error message when user starts typing
          this.otpForm.get('otp')?.valueChanges.subscribe(() => {
            if (this.registerError) {
              this.registerError = '';
            }
          });
        }
      }
    });
  }
}
