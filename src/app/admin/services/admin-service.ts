import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminData } from '../model/adminData';
import { OrganizationResponse } from '../model/organizationResponse';
import { PageableRequest } from '../model/pageableRequest';
import { PageResponse } from '../model/pageResponse';
import { Observable } from 'rxjs';
import { OrgInfoResponse } from '../model/orgInfoResponse';
import { AllRequest } from '../model/allRequest';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  apiUrlofAdmin = `http://localhost:8080/api/admin`;
  apiUrlOfOrg = `http://localhost:8080/portal/organizations`;


  constructor(private http: HttpClient, private router: Router) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  getAdminData(): Observable<AdminData> {
    return this.http.get<AdminData>(`${this.apiUrlofAdmin}/dashboard-data`, this.getHeaders());
  }

  onLogout() {
    localStorage.removeItem('token'); // removed leading slash
  }

  listOrganizations(request: PageableRequest = {}): Observable<PageResponse<OrganizationResponse>> {
    let params = new HttpParams()
      .set('page', (request.page ?? 0).toString())
      .set('size', (request.size ?? 10).toString())
      .set('sortBy', request.sortBy ?? 'organizationName');

    if (request.active !== undefined) {
      params = params.set('active', request.active.toString());
    }

    if (request.searchTerm) {
      params = params.set('name', request.searchTerm);
    }

    return this.http.get<PageResponse<OrganizationResponse>>(`${this.apiUrlOfOrg}`, { 
      ...this.getHeaders(),
      params 
    });
  }

  changeOrganizationStatus(orgId: number, status: boolean): Observable<void> {
    console.log('Sending status change request:', { orgId, status });

    // Using URL parameters
    const params = new HttpParams()
      .set('id', orgId.toString())
      .set('status', status.toString());

    console.log('Request URL:', `${this.apiUrlOfOrg}/status`);
    console.log('Request params:', params.toString());

    // Send as URL parameters with empty body
    return this.http.post<void>(`${this.apiUrlOfOrg}/status`, null, { 
      ...this.getHeaders(),
      params 
    });
  }

  searchOrganizations(searchTerm: string): Observable<PageResponse<OrganizationResponse>> {
    const params = new HttpParams()
      .set('organizationName', searchTerm)
      .set('page', '0')
      .set('size', '10');
    return this.http.get<PageResponse<OrganizationResponse>>(`${this.apiUrlOfOrg}/by-name`, { 
      ...this.getHeaders(),
      params 
    });
  }

  getOrganizationById(orgId: number): Observable<OrgInfoResponse> {
    const params = new HttpParams()
      .set('id', orgId.toString());
    return this.http.get<OrgInfoResponse>(`${this.apiUrlOfOrg}/orgInfo`, { 
      ...this.getHeaders(),
      params 
    });
  }

  getAllRequests(page: number = 0, size: number = 10, sortBy: string = 'requestDate'): Observable<PageResponse<AllRequest>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', 'DESC');

    return this.http.get<PageResponse<AllRequest>>(`${this.apiUrlofAdmin}/all-request`, { 
      ...this.getHeaders(),
      params 
    });
  }
}