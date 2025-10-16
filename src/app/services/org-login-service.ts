import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginViewModel } from '../model/loginViewModel';
import { LoginResponseViewModel } from '../model/loginResponseViewModel';

@Injectable({
  providedIn: 'root'
})
export class orgLoginService {
  apiUrl = "http://localhost:8080/login/organization"

  constructor(private http: HttpClient) {

  }
  loginUser(user: LoginViewModel): Observable<LoginResponseViewModel> {
    console.log("login service called");
    return this.http.post<LoginResponseViewModel>(this.apiUrl, user)
  }

  saveToken(loginResponse: LoginResponseViewModel) {
    // localStorage is available only in browser; guard for SSR
    if (typeof window !== 'undefined' && window?.localStorage) {
      try {
        window.localStorage.setItem('token', loginResponse.accessToken);
        const payLoadBase64 = loginResponse.accessToken.split('.')[1];
        const decodedPayload = JSON.parse(atob(payLoadBase64));
        console.log('token saved');
        console.log(decodedPayload);
      } catch (err) {
        console.warn('Failed to save token or decode payload:', err);
      }
    }
  }

  getRole(token: string): string[] {
    const payLoadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payLoadBase64));
    console.log(decodedPayload)
    const roles = decodedPayload["role"] || decodedPayload["authorities"];

    if (Array.isArray(roles)) {
      // Extract only the 'authority' strings → ["ROLE_ADMIN", "ROLE_USER"]
      return roles.map(r => r.authority);
    }

    return [];
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window?.localStorage) {
      return window.localStorage.getItem('token');
    }
    return null;
  }

  // getTest():Observable<string>{
  //   return this.http.get<string>(this.apiUrl + '/', { responseType : 'text'})
  // }
}