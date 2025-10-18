import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { EmployeeService } from '../../services/employee-service';
import { EmployeeLoginService } from '../../../services/employee-login';
import { Subscription, interval } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-employee-navbar-component',
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-navbar-component.html',
  styleUrl: './employee-navbar-component.css'
})
export class EmployeeNavbarComponent implements OnInit, OnDestroy {

  private platformId = inject(PLATFORM_ID);
  private employeeService = inject(EmployeeService);
  private employeeLoginService = inject(EmployeeLoginService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  employeeName: string = '';
  employeeRole: string = '';
  employeeEmail: string = '';
  organizationName: string = '';
  isDropdownOpen = false;
  isMobileMenuOpen = false;
  isLoading = true;
  
  private subscriptions = new Subscription();
  private userInfoCheckInterval: any;

  navigationItems = [
    {
      label: 'Home',
      icon: 'bi-house-fill',
      route: '/employee/employee-dashboard',
      isActive: true
    },
    {
      label: 'Salary Slip',
      icon: 'bi-file-earmark-text-fill',
      route: '/employee/salary-slips',
      isActive: false
    },
    {
      label: 'My Concerns',
      icon: 'bi-chat-dots-fill',
      route: '/employee/concerns',
      isActive: false
    }
  ];

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.userInfoCheckInterval) {
      clearInterval(this.userInfoCheckInterval);
    }
  }

  private initializeComponent(): void {
    // Load user info immediately
    this.loadUserInfo();
    
    // Set up reactive authentication monitoring
    this.setupAuthenticationMonitoring();
    
    // Listen for route changes to update active navigation
    this.setupRouteChangeListener();
    
    // Set up periodic check for user info updates (every 30 seconds)
    this.setupPeriodicUserInfoCheck();
  }

  private setupAuthenticationMonitoring(): void {
    // Subscribe to employee details changes from employee service
    const employeeDetailsSubscription = this.employeeService.employeeDetails$
      .pipe(filter(details => details !== null))
      .subscribe(details => {
        if (details) {
          this.updateUserInfoFromDetails(details);
          this.cdr.detectChanges();
        }
      });
    
    // Subscribe to authentication state changes from login service
    const authStateSubscription = this.employeeLoginService.authenticationState$
      .subscribe(isAuthenticated => {
        console.log('Authentication state changed:', isAuthenticated);
        if (isAuthenticated) {
          // User just logged in, reload user info immediately
          setTimeout(() => this.loadUserInfo(), 100);
        } else {
          // User logged out, clear user info
          this.clearUserInfo();
        }
      });
    
    this.subscriptions.add(employeeDetailsSubscription);
    this.subscriptions.add(authStateSubscription);
  }

  private setupRouteChangeListener(): void {
    const routeSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveNavigation(event.url);
      });
    
    this.subscriptions.add(routeSubscription);
  }

  private setupPeriodicUserInfoCheck(): void {
    // Check for user info updates every 30 seconds
    this.userInfoCheckInterval = setInterval(() => {
      if (isPlatformBrowser(this.platformId) && this.employeeService.isAuthenticated()) {
        this.refreshUserInfo();
      }
    }, 30000);
  }

  private clearUserInfo(): void {
    this.employeeName = '';
    this.employeeRole = '';
    this.employeeEmail = '';
    this.organizationName = '';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private updateActiveNavigation(url: string): void {
    this.navigationItems.forEach(item => {
      item.isActive = url.includes(item.route.split('/').pop() || '');
    });
  }

  private updateUserInfoFromDetails(details: any): void {
    this.employeeName = details.employeeName || this.employeeName;
    this.employeeRole = details.employeeRole || this.employeeRole;
    this.employeeEmail = details.email || this.employeeEmail;
    this.organizationName = details.organizationName || this.organizationName;
    
    console.log('User info updated from employee details:', {
      name: this.employeeName,
      role: this.employeeRole
    });
  }

  private async loadUserInfo(): Promise<void> {
    this.isLoading = true;
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        // First try to get basic info synchronously for immediate display
        const basicUserInfo = this.employeeService.getBasicUserInfo();
        if (basicUserInfo) {
          this.employeeName = basicUserInfo.username;
          this.employeeRole = basicUserInfo.role;
          this.cdr.detectChanges(); // Trigger change detection for immediate display
        }

        // Then get comprehensive user info with employee details
        const userInfo = await this.employeeService.getUserInfo();
        
        if (userInfo && userInfo.isAuthenticated) {
          this.employeeName = userInfo.username;
          this.employeeRole = userInfo.role;
          
          // If employee details are available, use them for enhanced info
          if (userInfo.employeeDetails) {
            this.employeeName = userInfo.employeeDetails.employeeName || userInfo.username;
            this.employeeRole = userInfo.employeeDetails.employeeRole || userInfo.role;
            this.employeeEmail = userInfo.employeeDetails.email;
            this.organizationName = userInfo.employeeDetails.organizationName;
            
            console.log('Enhanced user info loaded:', {
              name: this.employeeName,
              role: this.employeeRole,
              email: this.employeeEmail,
              organization: this.organizationName
            });
          }
          
          this.cdr.detectChanges(); // Ensure UI updates
        } else {
          // If no user info or not authenticated, redirect to login
          console.warn('User not authenticated, redirecting to login');
          this.router.navigate(['/employee-login']);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
        
        // Try basic user info as fallback
        const basicUserInfo = this.employeeService.getBasicUserInfo();
        if (basicUserInfo) {
          this.employeeName = basicUserInfo.username;
          this.employeeRole = basicUserInfo.role;
          this.cdr.detectChanges();
        } else {
          // If no fallback available, redirect to login
          this.router.navigate(['/employee-login']);
        }
      }
    }
    
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  /**
   * Refresh user info without showing loading state
   */
  private async refreshUserInfo(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const userInfo = await this.employeeService.getUserInfo();
        
        if (userInfo && userInfo.isAuthenticated && userInfo.employeeDetails) {
          const hasChanges = 
            this.employeeName !== userInfo.employeeDetails.employeeName ||
            this.employeeRole !== userInfo.employeeDetails.employeeRole ||
            this.employeeEmail !== userInfo.employeeDetails.email;
            
          if (hasChanges) {
            this.updateUserInfoFromDetails(userInfo.employeeDetails);
            this.cdr.detectChanges();
          }
        }
      } catch (error) {
        console.error('Error refreshing user info:', error);
      }
    }
  }

  /**
   * Force reload user information (called externally if needed)
   */
  public forceReloadUserInfo(): void {
    this.loadUserInfo();
  }

  navigateTo(route: string): void {
    // Update active state
    this.navigationItems.forEach(item => {
      item.isActive = item.route === route;
    });
    
    // Close mobile menu if open
    this.isMobileMenuOpen = false;
    
    // Navigate to route
    this.router.navigate([route]);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  logout(): void {
    // Close any open dropdowns
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
    
    // Clear session data
    this.employeeService.logout();
    this.employeeLoginService.logout();
    
    // Navigate to login page
    this.router.navigate(['/employee-login']).then(() => {
      console.log('Employee logged out successfully');
    });
  }

  // Close dropdowns when clicking outside
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isDropdownOpen = false;
    }
    if (!target.closest('.mobile-menu-container')) {
      this.isMobileMenuOpen = false;
    }
  }

  /**
   * Check if user data is loaded and available
   */
  get hasUserData(): boolean {
    return !this.isLoading && this.employeeName !== '';
  }

  /**
   * Get display name for user (fallback if employee name not available)
   */
  get displayName(): string {
    return this.employeeName || 'Employee';
  }

  /**
   * Get display role for user (fallback if employee role not available)
   */
  get displayRole(): string {
    return this.employeeRole || 'Staff';
  }
}
