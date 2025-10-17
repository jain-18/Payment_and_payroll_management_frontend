import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { EmployeeService } from '../../services/employee.service';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardStats();
    }
  }

  loadDashboardStats(): void {
    this.isLoadingStats = true;
    
    // Load total employees count
    this.employeeService.getAllEmployees(0, 1).subscribe({
      next: (response) => {
        this.totalEmployees = response.totalElements;
        console.log('Total employees loaded:', this.totalEmployees);
      },
      error: (error) => {
        console.error('Error loading employee count:', error);
        this.totalEmployees = 0;
      },
      complete: () => {
        this.isLoadingStats = false;
      }
    });
  }
}
