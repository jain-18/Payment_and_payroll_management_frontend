import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService } from '../../services/organization.service';
import { OrganizationUpdateRequest } from '../../model/organization-update-request.model';
import { OrgInfoResponse } from '../../admin/model/orgInfoResponse';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { TokenUtils } from '../../utils/token-utils';

@Component({
  selector: 'app-update-info',
  imports: [CommonModule, ReactiveFormsModule, OrgDashboardNavbar, RouterLink],
  templateUrl: './update-info.html',
  styleUrl: './update-info.css'
})
export class UpdateInfo implements OnInit {
  updateForm!: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  organizationInfo: OrgInfoResponse | null = null;

  // File upload related
  selectedPancard: File | null = null;
  selectedCancelledCheque: File | null = null;
  selectedCompanyRegistration: File | null = null;
  
  pancardPreview: string | null = null;
  cancelledChequePreview: string | null = null;
  companyRegistrationPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeForm();
      this.loadOrganizationInfo();
    }
  }

  private initializeForm(): void {
    this.updateForm = this.fb.group({
      organizationName: ['', [
        Validators.pattern(/^[A-Za-z][A-Za-z0-9 ]*$/),
        Validators.maxLength(50)
      ]],
      organizationEmail: ['', [
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      // Address fields
      city: ['', [Validators.minLength(2)]],
      state: ['', [Validators.minLength(2)]],
      pinCode: ['', [Validators.pattern(/^[0-9]{6}$/)]],
      // Account fields
      accountNumber: ['', [Validators.pattern(/^[0-9]{9,18}$/)]],
      ifsc: ['', [Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      // File fields
      pancard: [null],
      cancelledCheque: [null],
      companyRegistrationCertificate: [null]
    });
  }

  private loadOrganizationInfo(): void {
    if (!TokenUtils.isValidToken()) {
      this.errorMessage = 'Authentication session expired. Please login again.';
      setTimeout(() => {
        this.router.navigate(['/organization-login']);
      }, 2000);
      return;
    }

    this.isLoading = true;
    this.organizationService.getCurrentOrganizationInfo().subscribe({
      next: (orgInfo) => {
        console.log('Organization info received in component:', orgInfo);
        console.log('Active status in component:', orgInfo.active);
        console.log('Type of active:', typeof orgInfo.active);
        
        this.organizationInfo = orgInfo;
        this.populateForm(orgInfo);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading organization info:', error);
        if (error.status === 401) {
          this.errorMessage = 'Session expired. Please login again.';
          setTimeout(() => {
            this.router.navigate(['/organization-login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to load organization information.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  private populateForm(orgInfo: OrgInfoResponse): void {
    console.log('Populating form with org info:', orgInfo);
    console.log('Active status:', orgInfo.active);
    console.log('Document:', orgInfo.document);
    
    this.updateForm.patchValue({
      organizationName: orgInfo.organizationName || '',
      organizationEmail: orgInfo.organizationEmail || '',
      city: orgInfo.address?.city || '',
      state: orgInfo.address?.state || '',
      pinCode: orgInfo.address?.pinCode || '',
      accountNumber: orgInfo.account?.accountNumber || '',
      ifsc: orgInfo.account?.ifsc || ''
    });

    // Set document URLs for preview
    if (orgInfo.document) {
      this.pancardPreview = orgInfo.document.panUrl || null;
      this.cancelledChequePreview = orgInfo.document.cancelledCheque || null;
      this.companyRegistrationPreview = orgInfo.document.companyRegistrationCertificate || null;
      
      console.log('Document previews set:');
      console.log('PAN:', this.pancardPreview);
      console.log('Cancelled Cheque:', this.cancelledChequePreview);
      console.log('Company Registration:', this.companyRegistrationPreview);
    }
  }

  onFileSelected(event: any, fileType: 'pancard' | 'cancelledCheque' | 'companyRegistration'): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only JPEG, PNG, and PDF files are allowed.';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 5MB.';
        return;
      }

      switch (fileType) {
        case 'pancard':
          this.selectedPancard = file;
          this.createFilePreview(file, 'pancard');
          break;
        case 'cancelledCheque':
          this.selectedCancelledCheque = file;
          this.createFilePreview(file, 'cancelledCheque');
          break;
        case 'companyRegistration':
          this.selectedCompanyRegistration = file;
          this.createFilePreview(file, 'companyRegistration');
          break;
      }
      
      this.errorMessage = '';
    }
  }

  private createFilePreview(file: File, type: string): void {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        switch (type) {
          case 'pancard':
            this.pancardPreview = e.target.result;
            break;
          case 'cancelledCheque':
            this.cancelledChequePreview = e.target.result;
            break;
          case 'companyRegistration':
            this.companyRegistrationPreview = e.target.result;
            break;
        }
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    } else {
      // For PDF files, show a placeholder
      switch (type) {
        case 'pancard':
          this.pancardPreview = 'PDF_SELECTED';
          break;
        case 'cancelledCheque':
          this.cancelledChequePreview = 'PDF_SELECTED';
          break;
        case 'companyRegistration':
          this.companyRegistrationPreview = 'PDF_SELECTED';
          break;
      }
    }
  }

  onSubmit(): void {
    if (!this.updateForm.valid || !isPlatformBrowser(this.platformId)) {
      this.markFormGroupTouched();
      return;
    }

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

    const formValue = this.updateForm.value;
    const updateRequest: OrganizationUpdateRequest = {};

    // Only include fields that have been changed
    if (formValue.organizationName && formValue.organizationName.trim()) {
      updateRequest.organizationName = formValue.organizationName.trim();
    }

    if (formValue.organizationEmail && formValue.organizationEmail.trim()) {
      updateRequest.organizationEmail = formValue.organizationEmail.trim();
    }

    // Address
    if (formValue.city || formValue.state || formValue.pinCode) {
      updateRequest.address = {
        city: formValue.city?.trim() || '',
        state: formValue.state?.trim() || '',
        pinCode: formValue.pinCode?.trim() || ''
      };
    }

    // Account
    if (formValue.accountNumber || formValue.ifsc) {
      updateRequest.account = {
        accountNumber: formValue.accountNumber?.trim() || '',
        ifsc: formValue.ifsc?.trim().toUpperCase() || ''
      };
    }

    // Files
    if (this.selectedPancard) {
      updateRequest.pancard = this.selectedPancard;
    }
    if (this.selectedCancelledCheque) {
      updateRequest.cancelledCheque = this.selectedCancelledCheque;
    }
    if (this.selectedCompanyRegistration) {
      updateRequest.companyRegistrationCertificate = this.selectedCompanyRegistration;
    }

    console.log('Submitting update request:', updateRequest);

    this.organizationService.updateOrganization(updateRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Organization information updated successfully! Admin will verify the changes and activate your account. You will receive an email notification.';
        this.organizationInfo = response;
        this.populateForm(response);
        
        // Clear file selections
        this.selectedPancard = null;
        this.selectedCancelledCheque = null;
        this.selectedCompanyRegistration = null;
        
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating organization:', error);
        
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
          setTimeout(() => {
            this.router.navigate(['/organization-login']);
          }, 2000);
        } else {
          this.errorMessage = error.error?.message || 'Failed to update organization information. Please try again.';
        }
        
        this.cdr.markForCheck();
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.updateForm.controls).forEach(key => {
      const control = this.updateForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm(): void {
    if (this.organizationInfo) {
      this.populateForm(this.organizationInfo);
    } else {
      this.updateForm.reset();
    }
    this.selectedPancard = null;
    this.selectedCancelledCheque = null;
    this.selectedCompanyRegistration = null;
    this.pancardPreview = this.organizationInfo?.document?.panUrl || null;
    this.cancelledChequePreview = this.organizationInfo?.document?.cancelledCheque || null;
    this.companyRegistrationPreview = this.organizationInfo?.document?.companyRegistrationCertificate || null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Form field getters for validation
  get organizationName() { return this.updateForm.get('organizationName'); }
  get organizationEmail() { return this.updateForm.get('organizationEmail'); }
  get city() { return this.updateForm.get('city'); }
  get state() { return this.updateForm.get('state'); }
  get pinCode() { return this.updateForm.get('pinCode'); }
  get accountNumber() { return this.updateForm.get('accountNumber'); }
  get ifsc() { return this.updateForm.get('ifsc'); }
}
