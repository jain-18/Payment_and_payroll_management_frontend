import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { SalaryRequestOfMonth } from '../model/salaryRequestOfMonth';
import { TokenUtils } from '../../utils/token-utils';

// Interface for paginated salary slip response
export interface PagedSalarySlipResponse {
  content: SalaryRequestOfMonth[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// Interface for salary slip filter parameters
export interface SalarySlipFilters {
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  private platformId = inject(PLATFORM_ID);
  apiUrlOfSalaryStructure = `http://localhost:8080/api/salary-structures`;

  constructor(private http: HttpClient) { }

  /**
   * Get headers with authorization token
   * @returns Headers object with authorization
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = TokenUtils.getToken();
      if (token && TokenUtils.isValidToken()) {
        headers = headers.set('Authorization', `Bearer ${token}`);
        console.log('Token found and valid, adding to headers');
      } else {
        console.log('No valid token found, skipping auth header');
        if (token) {
          console.log('Token exists but is invalid - clearing session');
          this.clearSession();
        }
      }
    }

    return headers;
  }

  /**
   * Clear user session data
   */
  private clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('orgId');
      console.log('Session cleared due to authentication failure');
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
  }

  /**
   * Get all salary slips with pagination and filtering
   * @param filters - Filter parameters including status, pagination
   * @returns Observable of paginated salary slip response
   */
  getAllSalarySlips(filters?: SalarySlipFilters): Observable<PagedSalarySlipResponse> {
    const headers = this.getHeaders();

    // Build query parameters
    const params: { [key: string]: string } = {
      page: (filters?.page ?? 0).toString(),
      size: (filters?.size ?? 10).toString(),
      sortBy: filters?.sortBy ?? 'createdAt'
    };

    // Add status filter if provided
    if (filters?.status) {
      params['status'] = filters.status;
    }

    // Convert params to URLSearchParams
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();

    console.log('Fetching salary slips with filters:', filters);

    return this.http.get<PagedSalarySlipResponse>(`${this.apiUrlOfSalaryStructure}/allsalarySlip?${queryString}`, { headers })
      .pipe(
        tap(response => {
          console.log('Salary slips fetched:', {
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.number,
            size: response.size
          });
        }),
        catchError(error => {
          console.error('Error fetching salary slips:', error);

          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Create salary structures for all employees in the organization
   * @returns Observable of success message
   */
  createSalaryStructure(): Observable<string> {
    const headers = this.getHeaders();

    console.log('Creating salary structures for all employees');

    return this.http.post(`${this.apiUrlOfSalaryStructure}/createAllSalaryStructure`, null, { 
      headers, 
      responseType: 'text' 
    })
      .pipe(
        tap(response => {
          console.log('Salary structures created successfully:', response);
        }),
        catchError(error => {
          console.error('Error creating salary structures:', error);

          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Update salary structure by slip ID
   * @param slipId - The slip ID to update
   * @returns Observable of salary structure response
   */
  updateSalaryStructure(slipId: number): Observable<any> {
    const headers = this.getHeaders();

    console.log('Updating salary structure with slipId:', slipId);

    return this.http.put<any>(`${this.apiUrlOfSalaryStructure}/${slipId}`, null, { headers })
      .pipe(
        tap(response => {
          console.log('Salary structure updated successfully:', response);
        }),
        catchError(error => {
          console.error('Error updating salary structure:', error);

          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Send salary update request to admin for approval
   * @returns Observable of void response
   */
  sendUpdateSalaryToAdmin(): Observable<void> {
    const headers = this.getHeaders();

    console.log('Sending salary update request to admin');

    return this.http.post<void>(`${this.apiUrlOfSalaryStructure}/sendSalaryUpdatedRequest`, null, { headers })
      .pipe(
        tap(() => {
          console.log('Salary update request sent to admin successfully');
        }),
        catchError(error => {
          console.error('Error sending salary update request to admin:', error);

          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Send salary request to admin for approval
   * @returns Observable of void response
   */
  sendRequestToAdmin(): Observable<void> {
    const headers = this.getHeaders();
    
    console.log('Sending salary request to admin');
    
    return this.http.post<void>(`${this.apiUrlOfSalaryStructure}/sendRequest`, null, { headers })
      .pipe(
        tap(() => {
          console.log('Salary request sent to admin successfully');
        }),
        catchError(error => {
          console.error('Error sending salary request to admin:', error);
          
          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }
          
          return throwError(() => error);
        })
      );
  }

  /**
   * Get salary slips for a specific employee
   * @param empId - Employee ID
   * @param month - Optional month filter
   * @param year - Optional year filter
   * @param page - Page number (default: 0)
   * @param size - Page size (default: 10)
   * @param sortBy - Sort field (default: createdAt)
   * @param sortDir - Sort direction (default: DESC)
   * @returns Observable of paginated salary slip response
   */
  getEmployeeSalarySlips(
    empId: number,
    month?: string,
    year?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'DESC'
  ): Observable<any> {
    const headers = this.getHeaders();
    let params = `?empId=${empId}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    
    if (month) {
      params += `&month=${month}`;
    }
    if (year) {
      params += `&year=${year}`;
    }

    console.log('Fetching employee salary slips with params:', params);

    return this.http.get<any>(`${this.apiUrlOfSalaryStructure}/employee-salary-slips${params}`, { headers })
      .pipe(
        tap(response => {
          console.log('Employee salary slips fetched successfully:', response);
        }),
        catchError(error => {
          console.error('Error fetching employee salary slips:', error);

          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }


}
