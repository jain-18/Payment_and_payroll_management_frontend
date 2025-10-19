import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VendorRequest } from '../model/vendor-request.model';
import { VendorResponse } from '../model/vendor-response.model';
import { VendorUpdateRequest } from '../model/vendor-update-request.model';
import { VendorPageResponse } from '../model/pageable-response.model';
import { VendorPaymentRequest } from '../model/vendor-payment-request.model';
import { VendorPaymentResponse } from '../model/vendor-payment-response.model';

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

  getAllVendors(page: number = 0, size: number = 10, sortBy: string = 'vendorName'): Observable<VendorPageResponse> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<VendorPageResponse>(
      `${this.baseUrl}${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  // Keep the old method for backward compatibility
  getAllVendorsSimple(): Observable<VendorResponse[]> {
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

  searchVendorByName(vendorName: string, page: number = 0, size: number = 10, sortBy: string = 'vendorName'): Observable<VendorPageResponse> {
    const params = `?vendorName=${encodeURIComponent(vendorName)}&page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<VendorPageResponse>(
      `${this.baseUrl}/by-name${params}`, 
      { headers: this.getAuthHeaders() }
    );
  }

  initiatePayment(paymentRequest: VendorPaymentRequest): Observable<VendorPaymentResponse> {
    return this.http.post<VendorPaymentResponse>(
      `${this.baseUrl}/payments`, 
      paymentRequest, 
      { headers: this.getAuthHeaders() }
    );
  }
}