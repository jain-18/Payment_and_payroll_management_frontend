import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { EmployeeDetail } from '../model/employeeDetail';
import { isPlatformBrowser } from '@angular/common';
import { catchError, tap, map } from 'rxjs/operators';
import { SalarySlip } from '../model/salarySlip';
import { RaiseConcernResp } from '../model/raiseConcernResp';

// Interface for paginated response
export interface PagedSalarySlipResponse {
  content: SalarySlip[];
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

// Interface for paginated concern response
export interface PagedConcernResponse {
  content: RaiseConcernResp[];
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
  month?: string;
  year?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

// Interface for concern filter parameters
export interface ConcernFilters {
  page?: number;
  size?: number;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpClient) { }

  apiUrl = `http://localhost:8080/api/employees`;
  private platformId = inject(PLATFORM_ID);

  // BehaviorSubject to cache employee details
  private employeeDetailsSubject = new BehaviorSubject<EmployeeDetail | null>(null);
  public employeeDetails$ = this.employeeDetailsSubject.asObservable();

  /**
   * Get comprehensive user information combining localStorage and API data
   * @returns Promise with complete user information or null if not available
   */
  async getUserInfo(): Promise<{
    userId: string;
    username: string;
    role: string;
    employeeDetails?: EmployeeDetail;
    isAuthenticated: boolean;
  } | null> {

    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    // Get basic info from localStorage
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!userId || !username || !role || !token) {
      console.warn('Incomplete user session data found');
      return null;
    }

    const basicUserInfo = {
      userId,
      username,
      role,
      isAuthenticated: this.isTokenValid()
    };

    try {
      // Try to get cached employee details first
      const cachedDetails = this.employeeDetailsSubject.value;
      if (cachedDetails) {
        return {
          ...basicUserInfo,
          employeeDetails: cachedDetails
        };
      }

      // Fetch fresh employee details from API
      const employeeDetails = await this.getEmployeeDetails().toPromise();

      if (employeeDetails) {
        // Cache the details
        this.employeeDetailsSubject.next(employeeDetails);

        // Update localStorage with fresh data if needed
        this.updateLocalStorageFromEmployeeDetails(employeeDetails);

        return {
          ...basicUserInfo,
          employeeDetails
        };
      }

      // Return basic info if API call fails
      return basicUserInfo;

    } catch (error) {
      console.error('Error fetching employee details:', error);
      // Return basic user info even if API fails
      return basicUserInfo;
    }
  }

  /**
   * Get basic user info synchronously from localStorage
   * @returns Basic user info or null
   */
  getBasicUserInfo(): { userId: string; username: string; role: string } | null {
    if (isPlatformBrowser(this.platformId)) {
      const userId = localStorage.getItem('userId');
      const username = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');

      if (userId && username && role) {
        return { userId, username, role };
      }
    }
    return null;
  }

  /**
   * Fetch employee details from API with proper authentication
   * @returns Observable of employee details
   */
  getEmployeeDetails(): Observable<EmployeeDetail> {
    const headers = this.getHeaders();

    return this.http.get<EmployeeDetail>(`${this.apiUrl}/get-employee-detail`, { headers })
      .pipe(
        tap(details => {
          console.log('Employee details fetched:', details);
          this.employeeDetailsSubject.next(details);
        }),
        catchError(error => {
          console.error('Error fetching employee details:', error);

          if (error.status === 401) {
            // Token might be expired, clear session
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }

          return throwError(() => error);
        })
      );
  }

  /**
   * Update employee details cache
   * @param details Employee details to cache
   */
  updateEmployeeDetails(details: EmployeeDetail): void {
    this.employeeDetailsSubject.next(details);
    this.updateLocalStorageFromEmployeeDetails(details);
  }

  /**
   * Get cached employee details
   * @returns Cached employee details or null
   */
  getCachedEmployeeDetails(): EmployeeDetail | null {
    return this.employeeDetailsSubject.value;
  }

  /**
   * Check if user is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('token');
    return token !== null && this.isTokenValid();
  }

  /**
   * Validate token expiration
   * @returns boolean indicating if token is still valid
   */
  private isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (!token || !tokenExpiry) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = parseInt(tokenExpiry);

    return currentTime < expiryTime;
  }

  /**
   * Update localStorage with data from employee details
   * @param details Employee details to sync
   */
  private updateLocalStorageFromEmployeeDetails(details: EmployeeDetail): void {
    if (isPlatformBrowser(this.platformId)) {
      // Update username if it differs (in case of profile updates)
      if (details.employeeName && details.employeeName !== localStorage.getItem('username')) {
        localStorage.setItem('username', details.employeeName);
      }

      // Update role if it differs
      if (details.employeeRole && details.employeeRole !== localStorage.getItem('userRole')) {
        localStorage.setItem('userRole', details.employeeRole);
      }

      // Store additional employee info for quick access
      localStorage.setItem('employeeEmail', details.email);
      localStorage.setItem('employeeDepartment', details.department);
      localStorage.setItem('organizationName', details.organizationName);
    }
  }

  /**
   * Get HTTP headers for API requests
   * @returns Headers object with authorization
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
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
      localStorage.removeItem('tokenType');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('employeeEmail');
      localStorage.removeItem('employeeDepartment');
      localStorage.removeItem('organizationName');

      // Clear cached data
      this.employeeDetailsSubject.next(null);
    }
  }

  /**
   * Logout user and clear all session data
   */
  logout(): void {
    this.clearSession();
    console.log('Employee session cleared');
  }

  /**
   * Get salary slips for the authenticated employee with pagination and filtering
   * @param filters Optional filters for month, year, pagination, and sorting
   * @returns Observable of paginated salary slip response
   */
  getSalarySlips(filters?: SalarySlipFilters): Observable<PagedSalarySlipResponse> {
    const headers = this.getHeaders();

    // Build query parameters
    let params: { [key: string]: string } = {
      page: (filters?.page ?? 0).toString(),
      size: (filters?.size ?? 10).toString(),
      sortBy: filters?.sortBy ?? 'createdAt',
      sortDir: filters?.sortDir ?? 'DESC'
    };

    // Add optional filters
    if (filters?.month) {
      params['month'] = filters.month;
    }
    if (filters?.year) {
      params['year'] = filters.year;
    }

    // Convert params to URLSearchParams
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();

    console.log('Fetching salary slips with filters:', filters);

    return this.http.get<PagedSalarySlipResponse>(`http://localhost:8080/api/salary-structures/salary-slip-of-emp?${queryString}`, { headers })
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
   * Get salary slips for a specific month and year
   * @param month Month (1-12 or month name)
   * @param year Year (e.g., 2025)
   * @param page Page number (default: 0)
   * @param size Page size (default: 10)
   * @returns Observable of paginated salary slip response
   */
  getSalarySlipsByPeriod(month: string, year: string, page: number = 0, size: number = 10): Observable<PagedSalarySlipResponse> {
    return this.getSalarySlips({
      month,
      year,
      page,
      size,
      sortBy: 'createdAt',
      sortDir: 'DESC'
    });
  }

  /**
   * Get latest salary slips (most recent first)
   * @param size Number of salary slips to fetch (default: 5)
   * @returns Observable of paginated salary slip response
   */
  getLatestSalarySlips(size: number = 5): Observable<PagedSalarySlipResponse> {
    return this.getSalarySlips({
      page: 0,
      size,
      sortBy: 'createdAt',
      sortDir: 'DESC'
    });
  }

  /**
   * Get salary slips for current year
   * @param page Page number (default: 0)
   * @param size Page size (default: 12) - to show all months
   * @returns Observable of paginated salary slip response
   */
  getCurrentYearSalarySlips(page: number = 0, size: number = 12): Observable<PagedSalarySlipResponse> {
    const currentYear = new Date().getFullYear().toString();
    return this.getSalarySlips({
      year: currentYear,
      page,
      size,
      sortBy: 'periodMonth',
      sortDir: 'DESC'
    });
  }

  /**
   * Search salary slips by year with sorting
   * @param year Year to filter by
   * @param sortBy Field to sort by (default: periodMonth)
   * @param sortDir Sort direction (default: DESC)
   * @returns Observable of paginated salary slip response
   */
  getSalarySlipsByYear(year: string, sortBy: string = 'periodMonth', sortDir: 'ASC' | 'DESC' = 'DESC'): Observable<PagedSalarySlipResponse> {
    return this.getSalarySlips({
      year,
      page: 0,
      size: 12, // Usually 12 months max per year
      sortBy,
      sortDir
    });
  }

  /**
   * Helper method to get months array for dropdown/selection
   * @returns Array of month objects with value and label
   */
  getMonthsArray(): { value: string; label: string }[] {
    return [
      { value: '1', label: 'January' },
      { value: '2', label: 'February' },
      { value: '3', label: 'March' },
      { value: '4', label: 'April' },
      { value: '5', label: 'May' },
      { value: '6', label: 'June' },
      { value: '7', label: 'July' },
      { value: '8', label: 'August' },
      { value: '9', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];
  }

  /**
   * Helper method to get years array for dropdown/selection
   * @param startYear Starting year (default: 5 years ago)
   * @param endYear Ending year (default: current year)
   * @returns Array of year strings
   */
  getYearsArray(startYear?: number, endYear?: number): string[] {
    const currentYear = new Date().getFullYear();
    const start = startYear ?? currentYear - 5;
    const end = endYear ?? currentYear;

    const years: string[] = [];
    for (let year = end; year >= start; year--) {
      years.push(year.toString());
    }

    return years;
  }

  /**
   * Helper method to format month number to month name
   * @param monthNumber Month number (1-12)
   * @returns Month name
   */
  getMonthName(monthNumber: number): string {
    const months = this.getMonthsArray();
    const month = months.find(m => m.value === monthNumber.toString());
    return month?.label ?? 'Unknown';
  }

  /**
   * Raise a concern about a salary slip
   * @param concernRequest The concern request with slip ID and concern text
   * @returns Observable of the response
   */
  raiseConcern(concernRequest: { salarySlipId: number; concern: string }): Observable<any> {
    const headers = this.getHeaders();

    return this.http.post<any>(
      `http://localhost:8080/api/salary-structures/salary-slip/${concernRequest.salarySlipId}/concern`,
      { concern: concernRequest.concern },
      { headers }
    ).pipe(
      tap(response => {
        console.log('Concern raised successfully:', response);
      }),
      catchError(error => {
        console.error('Error raising concern:', error);

        if (error.status === 401) {
          this.clearSession();
          throw new Error('Authentication expired. Please login again.');
        }

        return throwError(() => error);
      })
    );
  }


  getAllConcerns(filters?: ConcernFilters): Observable<PagedConcernResponse> {
    const headers = this.getHeaders();
    
    // Build query parameters
    const params: { [key: string]: string } = {
      page: (filters?.page ?? 0).toString(),
      size: (filters?.size ?? 10).toString(),
      sortBy: filters?.sortBy ?? 'raiseAt'
    };
    
    // Convert params to URLSearchParams
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    
    console.log('Fetching concerns with filters:', filters);
    
    return this.http.get<PagedConcernResponse>(`${this.apiUrl}/raised-concerns?${queryString}`, { headers })
      .pipe(
        tap(response => {
          console.log('Concerns fetched:', {
            totalElements: response.totalElements,
            totalPages: response.totalPages,
            currentPage: response.number,
            size: response.size
          });
        }),
        catchError(error => {
          console.error('Error fetching concerns:', error);
          
          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }
          
          return throwError(() => error);
        })
      );
  }

  raiseConcernByEmployee(slipId: number): Observable<any> {
    const headers = this.getHeaders();
    const params = new HttpParams().set('slipId', slipId.toString());
    
    return this.http.post(`${this.apiUrl}/raise-concerns`, null, { headers, params })
      .pipe(
        tap(response => {
          console.log('Concern raised by employee:', response);
        }),
        catchError(error => {
          console.error('Error raising concern:', error);
          if (error.status === 401) {
            this.clearSession();
            throw new Error('Authentication expired. Please login again.');
          }
          return throwError(() => error);
        })
      );
  }
}
