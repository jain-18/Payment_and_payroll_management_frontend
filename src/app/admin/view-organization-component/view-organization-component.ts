import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { AdminService } from '../services/admin-service';
import { OrganizationResponse } from '../model/organizationResponse';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { finalize, Subscription, filter } from 'rxjs';
import { OrgInfoResponse } from '../model/orgInfoResponse';

@Component({
  selector: 'app-view-organization-component',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminNavbarComponent],
  templateUrl: './view-organization-component.html',
  styleUrl: './view-organization-component.css'
})
export class ViewOrganizationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private subscriptions = new Subscription();
  
  orgInfo : OrgInfoResponse = {} as OrgInfoResponse;
  loading = false;
  error = '';
  statusLoading = false;
    private platformId = inject(PLATFORM_ID);

  runBeforePageUnload(): void {
    this.loadCurrentOrganization();
  }

  constructor(private cdr: ChangeDetectorRef) {
    // Subscribe to router events to handle page refreshes and navigation
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.loadCurrentOrganization();
      })
    );
  }

  ngOnInit() {
    // Initial load of organization details
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running in browser - fetching admin data from client');
      this.loadCurrentOrganization();
    } else {
      console.log('Running on server - skipping client fetch');
    }
  }

  private loadCurrentOrganization() {
    const orgIdParam = this.route.snapshot.paramMap.get('id');
    if (orgIdParam) {
      const orgId = Number(orgIdParam);
      console.log("Loading organization details...");
      this.loadOrganizationDetails(orgId);
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.unsubscribe();
  }
  loadOrganizationDetails(orgId: number) {
    this.loading = true;
    this.error = '';
    this.adminService.getOrganizationById(orgId).subscribe({
      next: (data) => {
        this.orgInfo = data;
        this.loading = false;
        console.log(this.orgInfo)
        this.cdr.detectChanges();  // Force change detection
      },
      error: (error) => {
        console.error('Error fetching organization details:', error);
        this.error = 'Failed to load organization details. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleStatus() {
    if (!this.orgInfo || this.statusLoading) return;

    this.statusLoading = true;
    const newStatus = !this.orgInfo.isActive;

    this.adminService.changeOrganizationStatus(this.orgInfo.organizationId, newStatus).pipe(
      finalize(() => {
        this.statusLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.orgInfo.isActive = newStatus;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error changing organization status:', error);
        this.error = 'Failed to change organization status. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

}
