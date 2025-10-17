import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { EmployeeRequest } from '../model/employee-request.model';
import { EmployeeResponse } from '../model/employee-response.model';
import { EmployeeUpdateRequest } from '../model/employee-update-request.model';
import { EmployeePageResponse } from '../model/pageable-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api/employees';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createEmployee(employeeRequest: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.post<EmployeeResponse>(
      this.baseUrl, 
      employeeRequest, 
      { headers: this.getAuthHeaders() }
    );
  }

  getEmployeeById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  searchEmployeeById(id: number): Observable<EmployeeResponse> {
    return this.http.get<EmployeeResponse>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  getAllEmployees(page: number = 0, size: number = 10, sortBy: string = 'employeeName'): Observable<EmployeePageResponse> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<EmployeePageResponse>(
      `${this.baseUrl}${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateEmployee(id: number, employeeUpdateRequest: EmployeeUpdateRequest): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(
      `${this.baseUrl}/${id}`, 
      employeeUpdateRequest, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }
}