import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { VendorService } from '../../services/vendor.service';
import { VendorResponse } from '../../model/vendor-response.model';
import { VendorUpdateRequest } from '../../model/vendor-update-request.model';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';

@Component({
  selector: 'app-edit-vendor-component',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar],
  templateUrl: './edit-vendor-component.html',
  styleUrl: './edit-vendor-component.css'
})
export class EditVendorComponent implements OnInit {
  editVendorForm!: FormGroup;
  vendorId!: number;
  vendor: VendorResponse | null = null;
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: VendorService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.vendorId = Number(this.route.snapshot.paramMap.get('id'));
      if (this.vendorId) {
        this.initializeForm();
        this.loadVendor();
      } else {
        this.errorMessage = 'Invalid vendor ID';
        this.isLoading = false;
      }
    }
  }

  private initializeForm(): void {
    this.editVendorForm = this.fb.group({
      vendorName: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-z ]+$/),
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

  loadVendor(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vendorService.searchVendorById(this.vendorId).subscribe({
      next: (vendor: VendorResponse) => {
        console.log('Vendor loaded for editing:', vendor);
        this.vendor = vendor;
        this.populateForm(vendor);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading vendor:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.errorMessage = `Vendor not found with ID: ${this.vendorId}`;
        } else if (error.status === 400) {
          this.errorMessage = 'This vendor does not belong to the given organization.';
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load vendor. Please try again.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  private populateForm(vendor: VendorResponse): void {
    this.editVendorForm.patchValue({
      vendorName: vendor.vendorName,
      email: vendor.email,
      phoneNumber: vendor.phoneNumber,
      accountNumber: vendor.accountNumber,
      ifsc: vendor.ifsc,
      city: vendor.address.city,
      state: vendor.address.state,
      pinCode: vendor.address.pinCode
    });
  }

  onSubmit(): void {
    if (!this.editVendorForm.valid || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.editVendorForm.value;
    const updateRequest: VendorUpdateRequest = {
      vendorName: formValue.vendorName?.trim(),
      email: formValue.email?.trim(),
      phoneNumber: formValue.phoneNumber?.trim(),
      accountNumber: formValue.accountNumber?.trim(),
      ifsc: formValue.ifsc?.trim().toUpperCase(),
      address: {
        city: formValue.city?.trim(),
        state: formValue.state?.trim(),
        pinCode: formValue.pinCode?.trim()
      }
    };

    console.log('Submitting vendor update:', updateRequest);

    this.vendorService.updateVendor(this.vendorId, updateRequest).subscribe({
      next: (response: VendorResponse) => {
        console.log('Vendor updated successfully:', response);
        this.isSubmitting = false;
        this.successMessage = `Vendor "${response.vendorName}" updated successfully!`;
        
        // Navigate back to manage vendors after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/org-dashboard/manage-vendor']);
        }, 2000);
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error updating vendor:', error);
        this.isSubmitting = false;
        
        if (error.status === 404) {
          this.errorMessage = `Vendor not found with ID: ${this.vendorId}`;
        } else if (error.status === 400) {
          // Extract specific backend error messages
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.error && typeof error.error === 'object') {
            const backendMessage = error.error.details || error.error.error || error.error;
            this.errorMessage = typeof backendMessage === 'string' ? backendMessage : 'Invalid data provided.';
          } else {
            this.errorMessage = 'Invalid data provided.';
          }
        } else if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to edit vendors.';
        } else {
          if (error.error && typeof error.error === 'string') {
            this.errorMessage = error.error;
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'Failed to update vendor. Please try again.';
          }
        }
        
        this.cdr.markForCheck();
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/org-dashboard/manage-vendor']);
  }

  // Form field error getters
  get vendorName() { return this.editVendorForm.get('vendorName'); }
  get email() { return this.editVendorForm.get('email'); }
  get phoneNumber() { return this.editVendorForm.get('phoneNumber'); }
  get accountNumber() { return this.editVendorForm.get('accountNumber'); }
  get ifsc() { return this.editVendorForm.get('ifsc'); }
  get city() { return this.editVendorForm.get('city'); }
  get state() { return this.editVendorForm.get('state'); }
  get pinCode() { return this.editVendorForm.get('pinCode'); }
}
