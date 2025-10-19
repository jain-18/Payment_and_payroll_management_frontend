import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeNavbarComponent } from '../employee-navbar-component/employee-navbar-component';
import { EmployeeService, PagedSalarySlipResponse, SalarySlipFilters } from '../../services/employee-service';
import { SalarySlip } from '../../model/salarySlip';
import { Router } from '@angular/router';

export interface ConcernRequest {
  salarySlipId: number;
  concern: string;
}

@Component({
  selector: 'app-employee-salary-slip-component',
  imports: [CommonModule, ReactiveFormsModule, EmployeeNavbarComponent],
  templateUrl: './employee-salary-slip-component.html',
  styleUrl: './employee-salary-slip-component.css'
})
export class EmployeeSalarySlipComponent implements OnInit {

  private employeeService = inject(EmployeeService);
  private router = inject(Router);

  // Data properties
  salarySlips: SalarySlip[] = [];
  pagedResponse!: PagedSalarySlipResponse;
  
  // User info
  currentUser: any = null;
  
  // UI state properties
  isLoading = false;
  isSearching = false;
  showFilters = false;
  selectedSlip: SalarySlip | null = null;
  showSlipModal = false;
  showConcernModal = false;
  showConfirmationModal = false;
  isSubmittingConcern = false;
  
  // Pagination properties
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // Filter form
  filterForm!: FormGroup;
  
  // Filter options
  months: { value: string; label: string }[] = [];
  years: string[] = [];
  
  // Concern form
  concernForm!: FormGroup;
  concernTypes = [
    { value: 'salary_calculation', label: 'Salary Calculation Error' },
    { value: 'missing_allowance', label: 'Missing Allowance' },
    { value: 'incorrect_deduction', label: 'Incorrect Deduction' },
    { value: 'late_payment', label: 'Late Payment' },
    { value: 'other', label: 'Other Issue' }
  ];

  constructor(private cdr: ChangeDetectorRef) {
    this.initializeForms();
  }

  async ngOnInit() {
    this.initializeFilterOptions();
    await this.initializeUser();
    if (this.currentUser?.isAuthenticated) {
      this.loadSalarySlips();
    }
  }

  private async initializeUser(): Promise<void> {
    try {
      this.currentUser = await this.employeeService.getUserInfo();
      if (!this.currentUser || !this.currentUser.isAuthenticated) {
        console.warn('User not authenticated, redirecting to login');
        this.router.navigate(['/employee-login']);
        return;
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      this.router.navigate(['/employee-login']);
    }
  }

  private initializeForms(): void {
    this.filterForm = new FormGroup({
      month: new FormControl(''),
      year: new FormControl(''),
      sortBy: new FormControl('createdAt'),
      sortDir: new FormControl('DESC')
    });
    
    this.concernForm = new FormGroup({
      concernType: new FormControl(''),
      subject: new FormControl(''),
      description: new FormControl(''),
      slipId: new FormControl('')
    });
  }

  private initializeFilterOptions(): void {
    this.months = this.getMonthsArray();
    this.years = this.getYearsArray();
  }

  loadSalarySlips(filters?: SalarySlipFilters): void {
    this.isLoading = true;
    
    const searchFilters: SalarySlipFilters = {
      page: this.currentPage,
      size: this.pageSize,
      ...filters
    };
    
    console.log('Loading salary slips with filters:', searchFilters);
    
    this.employeeService.getSalarySlips(searchFilters).subscribe({
      next: (data: PagedSalarySlipResponse) => {
        console.log('Salary Slips Response:', data);
        this.pagedResponse = data;
        this.salarySlips = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.currentPage = data.number;
        this.isLoading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching salary slips:', err);
        this.isLoading = false;
        this.isSearching = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.isSearching = true;
    this.currentPage = 0; // Reset to first page
    
    const formValue = this.filterForm.value;
    const filters: SalarySlipFilters = {
      month: formValue.month || undefined,
      year: formValue.year || undefined,
      sortBy: formValue.sortBy,
      sortDir: formValue.sortDir,
      page: 0,
      size: this.pageSize
    };
    
    this.loadSalarySlips(filters);
  }

  onClearFilters(): void {
    this.filterForm.reset({
      month: '',
      year: '',
      sortBy: 'createdAt',
      sortDir: 'DESC'
    });
    this.currentPage = 0;
    this.loadSalarySlips();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    const formValue = this.filterForm.value;
    const filters: SalarySlipFilters = {
      month: formValue.month || undefined,
      year: formValue.year || undefined,
      sortBy: formValue.sortBy,
      sortDir: formValue.sortDir
    };
    this.loadSalarySlips(filters);
  }

  viewSlipDetails(slip: SalarySlip): void {
    this.selectedSlip = slip;
    this.showSlipModal = true;
  }

  closeSlipModal(): void {
    this.showSlipModal = false;
    this.selectedSlip = null;
  }

  raiseConcern(slip: SalarySlip): void {
    this.selectedSlip = slip;
    this.showConfirmationModal = true;
  }

  confirmRaiseConcern(): void {
    if (this.selectedSlip) {
      this.showConfirmationModal = false;
      this.submitConcern();
    }
  }

  cancelRaiseConcern(): void {
    this.showConfirmationModal = false;
    this.selectedSlip = null;
  }

  submitConcern(): void {
    if (this.selectedSlip) {
      this.isSubmittingConcern = true;
      
      const concernRequest = {
        salarySlipId: this.selectedSlip.slipId,
        concern: `Concern raised for salary slip - ${this.getMonthName(this.selectedSlip.periodMonth)} ${this.selectedSlip.periodYear}`
      };
      
      console.log('Submitting concern:', concernRequest);
      
      this.employeeService.raiseConcernByEmployee(this.selectedSlip.slipId).subscribe({
        next: (response) => {
          console.log('Concern submitted successfully:', response);
          this.isSubmittingConcern = false;
          this.selectedSlip = null;
          alert('Concern raised successfully!');
        },
        error: (err) => {
          console.error('Error submitting concern:', err);
          this.isSubmittingConcern = false;
          this.selectedSlip = null;
          
          // Check if the error status is 500 (Internal Server Error)
          if (err.status === 500) {
            alert('Concern already raised for this salary slip.');
          } else {
            alert('Failed to raise concern. Please try again.');
          }
        }
      });
    }
  }

  closeConcernModal(): void {
    this.showConcernModal = false;
    this.selectedSlip = null;
    this.concernForm.reset();
  }

  downloadPDF(slip: SalarySlip): void {
    console.log('Downloading PDF for slip:', slip.slipId);
    
    // Create PDF content
    this.generatePDF(slip);
  }

  private generatePDF(slip: SalarySlip): void {
    // Simple PDF generation using HTML content
    const pdfContent = this.createPDFContent(slip);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    }
  }

  private createPDFContent(slip: SalarySlip): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Slip - ${this.getMonthName(slip.periodMonth)} ${slip.periodYear}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .slip-title { font-size: 18px; margin-top: 10px; }
          .employee-info { margin: 20px 0; }
          .salary-details { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .salary-details th, .salary-details td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .salary-details th { background-color: #f8f9fa; font-weight: bold; }
          .earnings { background-color: #d4edda; }
          .deductions { background-color: #f8d7da; }
          .net-salary { background-color: #cce5ff; font-weight: bold; font-size: 16px; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${slip.organizationName}</div>
          <div class="slip-title">Salary Slip for ${this.getMonthName(slip.periodMonth)} ${slip.periodYear}</div>
        </div>
        
        <div class="employee-info">
          <p><strong>Employee Name:</strong> ${slip.employeeName}</p>
          <p><strong>Period:</strong> ${this.getMonthName(slip.periodMonth)} ${slip.periodYear}</p>
          <p><strong>Generated On:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table class="salary-details">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="earnings">
              <td><strong>EARNINGS</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>Basic Salary</td>
              <td>${slip.basicSalary.toFixed(2)}</td>
            </tr>
            <tr>
              <td>House Rent Allowance (HRA)</td>
              <td>${slip.hra.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Dearness Allowance (DA)</td>
              <td>${slip.da.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Other Allowances</td>
              <td>${slip.otherAllowances.toFixed(2)}</td>
            </tr>
            <tr class="deductions">
              <td><strong>DEDUCTIONS</strong></td>
              <td></td>
            </tr>
            <tr>
              <td>Provident Fund (PF)</td>
              <td>${slip.pf.toFixed(2)}</td>
            </tr>
            <tr class="net-salary">
              <td><strong>NET SALARY</strong></td>
              <td><strong>₹${slip.netSalary.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is a computer-generated salary slip and does not require a signature.</p>
          <p>For any queries, please contact HR department.</p>
        </div>
      </body>
      </html>
    `;
  }



  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Utility methods
  getMonthsArray(): { value: string; label: string }[] {
    return [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
  }

  getYearsArray(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = currentYear; i >= currentYear - 10; i--) {
      years.push(i.toString());
    }
    return years;
  }

  getMonthName(monthNumber: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1] || 'Unknown';
  }
}
