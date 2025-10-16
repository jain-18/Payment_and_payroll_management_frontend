import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-org-dashboard-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './org-dashboard-navbar.html',
  styleUrl: './org-dashboard-navbar.css'
})
export class OrgDashboardNavbar {

  constructor(private router: Router) {}

  logout() {
    // Clear any stored authentication tokens/data
    localStorage.removeItem('token');
    localStorage.removeItem('organizationData');
    
    // Navigate to home page
    this.router.navigate(['/home']);
  }
}
