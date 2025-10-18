import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeNavbarComponent } from '../employee-navbar-component/employee-navbar-component';
import { EmployeeService } from '../../services/employee-service';
import { EmployeeDetail } from '../../model/employeeDetail';

@Component({
  selector: 'app-employee-dashboard',
  imports: [EmployeeNavbarComponent, CommonModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css'
})
export class EmployeeDashboard implements OnInit {

  svc = inject(EmployeeService);
  employeeDetail !: EmployeeDetail;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadEmployeeDetails();
  }

  loadEmployeeDetails() {
    this.svc.getEmployeeDetails().subscribe({
      next: (data) => {
        console.log('Employee Details:', data);
        this.employeeDetail = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching employee details:', err);
        // Handle error scenario
      }
    });
  }
}
