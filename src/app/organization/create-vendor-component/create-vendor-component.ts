import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorRequest } from '../../model/vendor-request.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { TokenUtils } from '../../utils/token-utils';

@Component({
  selector: 'app-create-vendor-component',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar],
  templateUrl: './create-vendor-component.html',
  styleUrl: './create-vendor-component.css'
})
export class CreateVendorComponent implements OnInit {
  createVendorForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeForm();
      this.setupFormValueChanges();
    }
  }

  private initializeForm(): void {
    this.createVendorForm = this.fb.group({
      vendorName: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z][A-Za-z0-9 ]*$/),
        Validators.maxLength(50)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[6-9]\d{9}$/)
      ]],
      accountNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,20}$/)
      ]],
      ifsc: ['', [
        Validators.required,
        Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      ]],
      // Address fields
      city: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      state: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      pinCode: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{6}$/)
      ]]
    });
  }

  private setupFormValueChanges(): void {
    // Auto-uppercase IFSC code
    this.createVendorForm.get('ifsc')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        const upperValue = value.toUpperCase();
        if (upperValue !== value) {
          this.createVendorForm.patchValue({ ifsc: upperValue }, { emitEvent: false });
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.createVendorForm.valid || !isPlatformBrowser(this.platformId)) {
      return;
    }

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

    const formValue = this.createVendorForm.value;
    const vendorRequest: VendorRequest = {
      vendorName: formValue.vendorName.trim(),
      email: formValue.email.trim(),
      phoneNumber: formValue.phoneNumber.trim(),
      accountNumber: formValue.accountNumber.trim(),
      ifsc: formValue.ifsc.trim().toUpperCase(),
      address: {
        city: formValue.city.trim(),
        state: formValue.state.trim(),
        pinCode: formValue.pinCode.trim()
      }
    };

    console.log('Submitting vendor request:', vendorRequest);

    this.vendorService.createVendor(vendorRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = `Vendor "${response.vendorName}" created successfully with ID: ${response.vendorId}`;
        
        // Navigate to manage vendors page after successful creation
        setTimeout(() => {
          this.router.navigate(['/org-dashboard/manage-vendor']);
        }, 2000);
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating vendor:', error);
        
        if (error.status === 400) {
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Invalid data provided. Please check your input.';
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 409) {
          this.errorMessage = 'Vendor with this information already exists.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to create vendor. Please try again.';
        }
        
        this.cdr.markForCheck();
      }
    });
  }

  resetForm(): void {
    this.createVendorForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Form field getters for validation
  get vendorName() { return this.createVendorForm.get('vendorName'); }
  get email() { return this.createVendorForm.get('email'); }
  get phoneNumber() { return this.createVendorForm.get('phoneNumber'); }
  get accountNumber() { return this.createVendorForm.get('accountNumber'); }
  get ifsc() { return this.createVendorForm.get('ifsc'); }
  get city() { return this.createVendorForm.get('city'); }
  get state() { return this.createVendorForm.get('state'); }
  get pinCode() { return this.createVendorForm.get('pinCode'); }
}
