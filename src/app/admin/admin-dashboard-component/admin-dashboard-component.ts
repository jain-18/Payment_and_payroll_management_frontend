import { Component, OnInit, inject, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AdminService } from '../services/admin-service';
import { AdminData } from '../model/adminData';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-dashboard-component',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent], // This will be handled by the module
  templateUrl: './admin-dashboard-component.html',
  styleUrls: ['./admin-dashboard-component.css']
})
export class AdminDashboardComponent implements OnInit {
  adminData: AdminData = {
    totalOrganizations: 0,
    totalActiveOrganizations: 0,
    totalInActiveOrganizations: 0,
    totalPendingRequest: 0
  };
  isLoading: boolean = true;
  error: string = '';

  svc = inject(AdminService);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // Only trigger the client-side fetch when running in the browser.
    // This avoids SSR/client hydration mismatch where server fetched but
    // client template remains in loading state.
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running in browser - fetching admin data from client');
      this.loadDashboardData();
    } else {
      console.log('Running on server - skipping client fetch');
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    this.error = '';

    this.svc.getAdminData().subscribe({
      next: (data) => {
        console.log('Admin data fetched:', data);
        this.adminData = {...data};  // Create a new object reference
        this.isLoading = false;
        this.cdr.detectChanges();  // Force change detection
        console.log('Updated admin data:', this.adminData);
      },
      error: (error) => {
        console.error('Error fetching admin data:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        this.isLoading = false;
        this.cdr.detectChanges();  // Force change detection
      }
    });
  }

  viewAllRequests() {
    // TODO: Implement navigation to all requests view
    console.log('Navigating to all requests view...');
  }
}
