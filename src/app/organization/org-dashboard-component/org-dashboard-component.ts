import { Component } from '@angular/core';
import { OrgDashboardNavbar } from '../org-dashboard-navbar/org-dashboard-navbar';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-org-dashboard-component',
  imports: [OrgDashboardNavbar, RouterModule, CommonModule],
  templateUrl: './org-dashboard-component.html',
  styleUrl: './org-dashboard-component.css'
})
export class OrgDashboardComponent {

}
