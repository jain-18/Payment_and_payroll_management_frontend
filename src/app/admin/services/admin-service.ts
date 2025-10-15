import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminData } from '../model/adminData';
import { OrganizationResponse } from '../model/organizationResponse';
import { PageableRequest } from '../model/pageableRequest';
import { PageResponse } from '../model/pageResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  apiUrlofAdmin = `http://localhost:8080/api/admin`;
  apiUrlOfOrg = `http://localhost:8080/portal/organizations`;

  
  constructor(private http: HttpClient,private router:Router) { }

  getAdminData(): Observable<AdminData> {
    return this.http.get<AdminData>(`${this.apiUrlofAdmin}/dashboard-data`);
  }

  onLogout(){
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

    return this.http.get<PageResponse<OrganizationResponse>>(`${this.apiUrlOfOrg}`, { params });
  }

  getSingleOrganization(orgId: number): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(`${this.apiUrlOfOrg}/organizations/orgInfo/${orgId}`);
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
    return this.http.post<void>(`${this.apiUrlOfOrg}/status`, null, { params });
  }
}