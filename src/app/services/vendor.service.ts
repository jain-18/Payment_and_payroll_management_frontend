import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorRequest } from '../model/vendor-request.model';
import { VendorResponse } from '../model/vendor-response.model';
import { VendorUpdateRequest } from '../model/vendor-update-request.model';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private baseUrl = 'http://localhost:8080/api/vendors';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createVendor(vendorRequest: VendorRequest): Observable<VendorResponse> {
    return this.http.post<VendorResponse>(
      this.baseUrl, 
      vendorRequest, 
      { headers: this.getAuthHeaders() }
    );
  }

  getVendorById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  searchVendorById(id: number): Observable<VendorResponse> {
    return this.http.get<VendorResponse>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  getAllVendors(): Observable<VendorResponse[]> {
    return this.http.get<VendorResponse[]>(
      this.baseUrl, 
      { headers: this.getAuthHeaders() }
    );
  }

  updateVendor(id: number, vendorUpdateRequest: VendorUpdateRequest): Observable<VendorResponse> {
    return this.http.put<VendorResponse>(
      `${this.baseUrl}/${id}`, 
      vendorUpdateRequest, 
      { headers: this.getAuthHeaders() }
    );
  }

  deleteVendor(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${id}`, 
      { headers: this.getAuthHeaders() }
    );
  }
}