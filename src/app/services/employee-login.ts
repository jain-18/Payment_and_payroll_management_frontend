import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { LoginViewModel } from '../model/loginViewModel';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';
import { Observable, Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EmployeeLoginService {

  private platformId = inject(PLATFORM_ID); 
  
  apiUrl = `http://localhost:8080/login/employee`;
  
  // Subject to notify when user authentication state changes
  private authenticationStateSubject = new Subject<boolean>();
  public authenticationState$ = this.authenticationStateSubject.asObservable();

  constructor(private http: HttpClient) { }

  loginEmployee(loginDto: LoginViewModel):Observable<LoginResponseViewModel>{
    // Implementation for employee login
    return this.http.post<LoginResponseViewModel>(this.apiUrl, loginDto);
  }
  saveToken(loginResponse: LoginResponseViewModel) {
    if (isPlatformBrowser(this.platformId)) {
      // Save token and user information
      localStorage.setItem('token', loginResponse.accessToken);
      localStorage.setItem('tokenType', loginResponse.tokenType);
      localStorage.setItem('userId', loginResponse.userId);
      localStorage.setItem('username', loginResponse.username);
      localStorage.setItem('userRole', loginResponse.role);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Decode and store additional payload information
      try {
        const payLoadBase64 = loginResponse.accessToken.split('.')[1];
        const decodedPayload = JSON.parse(atob(payLoadBase64));
        console.log('Token payload:', decodedPayload);
        
        // Store expiration time if available
        if (decodedPayload.exp) {
          localStorage.setItem('tokenExpiry', decodedPayload.exp.toString());
        }
      } catch (error) {
        console.error('Error decoding token payload:', error);
      }
      
      // Notify that authentication state has changed
      this.authenticationStateSubject.next(true);
      console.log('Authentication state updated - user logged in');
    }
  }

  getRole(token: string): string[] {
    const payLoadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payLoadBase64));
    console.log(decodedPayload)
    const roles = decodedPayload["role"] || decodedPayload["authorities"];

    if (Array.isArray(roles)) {
      return roles.map(r => r.authority);
    }

    return [];
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isTokenValid(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    
    const token = this.getToken();
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) {
      return false;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = parseInt(tokenExpiry);
    
    return currentTime < expiryTime;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null && this.isTokenValid();
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Clear all stored user data
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
      
      // Notify that authentication state has changed
      this.authenticationStateSubject.next(false);
      console.log('Employee logged out successfully');
    }
  }

  getHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
}
