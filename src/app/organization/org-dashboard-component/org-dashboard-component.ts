import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { EmployeeService } from '../../services/employee.service';
import { VendorService } from '../../services/vendor.service';

@Component({
  selector: 'app-org-dashboard-component',
  imports: [OrgDashboardNavbar, RouterModule, CommonModule],
  templateUrl: './org-dashboard-component.html',
  styleUrl: './org-dashboard-component.css'
})
export class OrgDashboardComponent implements OnInit {
  totalEmployees = 0;
  totalVendors = 0;
  pendingPayments = 0;
  monthlyTotal = 0;
  
  isLoadingStats = false;

  constructor(
    private employeeService: EmployeeService,
    private vendorService: VendorService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardStats();
    }
  }

  loadDashboardStats(): void {
    this.isLoadingStats = true;
    let loadedCount = 0;
    const totalRequests = 3; // Updated to 3 requests
    
    const checkLoadingComplete = () => {
      loadedCount++;
      if (loadedCount >= totalRequests) {
        this.isLoadingStats = false;
      }
    };
    
    // Load total employees count
    this.employeeService.getAllEmployees(0, 1).subscribe({
      next: (response) => {
        this.totalEmployees = response.totalElements;
        console.log('Total employees loaded:', this.totalEmployees);
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading employee count:', error);
        this.totalEmployees = 0;
        checkLoadingComplete();
      }
    });
    
    // Load total vendors count
    this.vendorService.getAllVendors(0, 1).subscribe({
      next: (response) => {
        this.totalVendors = response.totalElements;
        console.log('Total vendors loaded:', this.totalVendors);
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading vendor count with pagination, trying simple method:', error);
        // Fallback to simple method if pagination is not supported
        this.vendorService.getAllVendorsSimple().subscribe({
          next: (vendors) => {
            this.totalVendors = vendors.length;
            console.log('Total vendors loaded (simple method):', this.totalVendors);
          },
          error: (simpleError) => {
            console.error('Error loading vendor count (simple method):', simpleError);
            this.totalVendors = 0;
          },
          complete: () => {
            checkLoadingComplete();
          }
        });
      }
    });

    // Load pending vendor payments count (NOT_PAID status)
    this.vendorService.getPaymentsByStatus('NOT_PAID', 0, 1).subscribe({
      next: (response) => {
        this.pendingPayments = response.totalElements;
        console.log('Pending vendor payments loaded:', this.pendingPayments);
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading pending payments count:', error);
        this.pendingPayments = 0;
        checkLoadingComplete();
      }
    });
  }
}
