import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { AdminService } from '../services/admin-service';
import { AllRequest } from '../model/allRequest';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-request-component',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, FormsModule],
  templateUrl: './admin-request-component.html',
  styleUrl: './admin-request-component.css'
})
export class AdminRequestComponent implements OnInit {
  svc = inject(AdminService);

  // Data
  allRequests: AllRequest[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  sortBy = 'requestDate';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.error = '';

    this.svc.getAllRequests(this.currentPage, this.pageSize, this.sortBy).subscribe({
      next: (response) => {
        this.allRequests = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching requests:', error);
        this.error = 'Failed to load requests. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadRequests();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadRequests();
  }

  onSortChange(sortField: string) {
    this.sortBy = sortField;
    this.loadRequests();
  }

}
