import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginViewModel } from '../model/loginViewModel';
import { HttpClient } from '@angular/common/http';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminLoginService {
  apiUrl = `http://localhost:8080/login/admin`
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {

  }
  loginUser(user: LoginViewModel): Observable<LoginResponseViewModel> {
    return this.http.post<LoginResponseViewModel>(this.apiUrl, user)
  }

  saveToken(loginResponse: LoginResponseViewModel) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', loginResponse.accessToken);
    }
    const payLoadBase64 = loginResponse.accessToken.split('.')[1];
    const decodedPayload = JSON.parse(atob(payLoadBase64));
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

}
