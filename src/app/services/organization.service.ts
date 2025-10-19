import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationUpdateRequest } from '../model/organization-update-request.model';
import { OrgInfoResponse } from '../admin/model/orgInfoResponse';
import { RaiseConcernedPageResponse, RaiseConcernedResponse } from '../model/raise-concerned-response.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private baseUrl = 'http://localhost:8080/portal/organizations';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getMultipartAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for multipart/form-data, let the browser set it
    });
  }

  getCurrentOrganizationInfo(): Observable<OrgInfoResponse> {
    return this.http.get<OrgInfoResponse>(
      `${this.baseUrl}/me`,
      { headers: this.getAuthHeaders() }
    );
  }

  updateOrganization(updateRequest: OrganizationUpdateRequest): Observable<OrgInfoResponse> {
    const formData = new FormData();

    // Add text fields
    if (updateRequest.organizationName) {
      formData.append('organizationName', updateRequest.organizationName);
    }
    
    if (updateRequest.organizationEmail) {
      formData.append('organizationEmail', updateRequest.organizationEmail);
    }

    // Add address fields
    if (updateRequest.address) {
      if (updateRequest.address.city) {
        formData.append('address.city', updateRequest.address.city);
      }
      if (updateRequest.address.state) {
        formData.append('address.state', updateRequest.address.state);
      }
      if (updateRequest.address.pinCode) {
        formData.append('address.pinCode', updateRequest.address.pinCode);
      }
    }

    // Add account fields
    if (updateRequest.account) {
      if (updateRequest.account.accountNumber) {
        formData.append('account.accountNumber', updateRequest.account.accountNumber);
      }
      if (updateRequest.account.ifsc) {
        formData.append('account.ifsc', updateRequest.account.ifsc);
      }
    }

    // Add file uploads
    if (updateRequest.pancard) {
      formData.append('pancard', updateRequest.pancard);
    }
    
    if (updateRequest.cancelledCheque) {
      formData.append('cancelledCheque', updateRequest.cancelledCheque);
    }
    
    if (updateRequest.companyRegistrationCertificate) {
      formData.append('companyRegistrationCertificate', updateRequest.companyRegistrationCertificate);
    }

    return this.http.patch<OrgInfoResponse>(
      this.baseUrl,
      formData,
      { headers: this.getMultipartAuthHeaders() }
    );
  }

  getAllRaisedConcerns(page: number = 0, size: number = 10, sortBy: string = 'raiseAt', solved?: boolean): Observable<RaiseConcernedPageResponse> {
    let params = `?page=${page}&size=${size}&sortBy=${sortBy}`;
    if (solved !== undefined) {
      params += `&solved=${solved}`;
    }
    return this.http.get<RaiseConcernedPageResponse>(
      `${this.baseUrl}/org-raised-concerns${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  markConcernAsSolved(concernId: number): Observable<RaiseConcernedResponse> {
    const params = `?concernId=${concernId}`;
    return this.http.post<RaiseConcernedResponse>(
      `${this.baseUrl}/solvedRaiseConcern${params}`, 
      null,
      { headers: this.getAuthHeaders() }
    );
  }

  deleteConcern(concernId: number): Observable<void> {
    const params = `?concernId=${concernId}`;
    return this.http.delete<void>(
      `${this.baseUrl}/concerns${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }
}