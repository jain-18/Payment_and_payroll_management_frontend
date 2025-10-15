import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { RegistrationRequest, RegistrationResponse, OtpVerificationRequest } from '../model/registration.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrgRegistrationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  register(registrationData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/portal/register`, registrationData, {
      responseType: 'text'
    }).pipe(
      catchError((error) => {
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          throw new Error('Network error occurred');
        } else {
          // Server-side error
          const errorMessage = error.error?.message || error.error || error.message;
          throw new Error(errorMessage);
        }
      })
    );
  }

  verifyOtp(otpData: OtpVerificationRequest): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.baseUrl}/portal/verify-otp`, otpData).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error instanceof ErrorEvent) {
          throw new Error('Network error occurred');
        } else {
          // For specific backend errors
          const errorMessage = error.error?.message || error.error;
          if (errorMessage === 'Invalid Otp') {
            throw new Error('Invalid OTP. Please try again.');
          } else if (typeof errorMessage === 'string' && errorMessage.includes('Invalid Otp')) {
            throw new Error('Invalid OTP. Please try again.');
          }
          throw new Error(errorMessage || 'OTP verification failed');
        }
      })
    );
  }

  // Helper method to convert registration request to FormData
  prepareFormData(request: RegistrationRequest): FormData {
    const formData = new FormData();
    
    // Add text fields
    formData.append('userName', request.userName);
    formData.append('password', request.password);
    formData.append('organizationName', request.organizationName);
    formData.append('organizationEmail', request.organizationEmail);
    formData.append('address.city', request.address.city);
    formData.append('address.state', request.address.state);
    formData.append('address.pinCode', request.address.pinCode);
    formData.append('accountNo', request.accountNo);
    formData.append('ifsc', request.ifsc);

    // Add files
    formData.append('pancard', request.pancard);
    formData.append('cancelledCheque', request.cancelledCheque);
    formData.append('companyRegistrationCertificate', request.companyRegistrationCertificate);

    return formData;
  }
}