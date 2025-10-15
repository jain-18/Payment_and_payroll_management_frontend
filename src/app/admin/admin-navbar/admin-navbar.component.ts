import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../services/admin-service';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.css']
})
export class AdminNavbarComponent {
  private adminService = inject(AdminService);

  constructor(private router: Router) { }

  logout() {
    this.adminService.onLogout();
    this.router.navigate(['/admin-login']);

  }
}