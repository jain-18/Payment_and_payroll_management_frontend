import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmployeeRequest } from '../model/employee-request.model';
import { EmployeeResponse } from '../model/employee-response.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api/employees';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
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

  getAllEmployees(page: number = 0, size: number = 10, sortBy: string = 'employeeName'): Observable<any> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<any>(
      `${this.baseUrl}${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateEmployee(id: number, employeeRequest: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.put<EmployeeResponse>(
      `${this.baseUrl}/${id}`, 
      employeeRequest, 
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