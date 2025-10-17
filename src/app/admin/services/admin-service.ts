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

  getAllRequests(params: {
    page: number,
    size: number,
    sort: string,
    search?: string,
    status?: string,
    type?: string
  }): Observable<PageResponse<AllRequest>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString())
      .set('sortBy', params.sort)
      .set('sortDir', 'DESC');

    // Add filters regardless of search term
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.type) {
      httpParams = httpParams.set('requestType', params.type);
    }
    
    // Choose endpoint and add search parameter if needed
    if (params.search) {
      httpParams = httpParams.set('companyName', params.search);
      // Use company search endpoint when search term is provided
      return this.http.get<PageResponse<AllRequest>>(`${this.apiUrlofAdmin}/getRequestByCompany`, {
        ...this.getHeaders(),
        params: httpParams
      });
    } else {
      // Use all requests endpoint when no search term
      return this.http.get<PageResponse<AllRequest>>(`${this.apiUrlofAdmin}/all-request`, {
        ...this.getHeaders(),
        params: httpParams
      });
    }
  }

  getRequestByCompanyName(params: {
    search: string,
    page: number,
    size: number,
    sort: string,
    type?: string,
    status?: string
  }): Observable<PageResponse<AllRequest>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString())
      .set('sortBy', params.sort)
      .set('sortDir', 'DESC');
    
    // Only add companyName parameter if search term is provided
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('companyName', params.search.trim());
    }
    
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.type) {
      httpParams = httpParams.set('requestType', params.type);
    }
    
    return this.http.get<PageResponse<AllRequest>>(`${this.apiUrlofAdmin}/getRequestByCompany`, {
      ...this.getHeaders(),
      params: httpParams
    });
  }
}