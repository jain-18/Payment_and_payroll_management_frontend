export class TokenUtils {
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return decodedPayload.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  static isValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('No token found in localStorage');
      return false;
    }

    if (this.isTokenExpired(token)) {
      console.log('Token is expired');
      return false;
    }

    console.log('Token is valid');
    return true;
  }

  static getTokenPayload(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      return JSON.parse(atob(payloadBase64));
    } catch (error) {
      console.error('Error decoding token payload:', error);
      return null;
    }
  }

  static debugToken(): void {
    const token = this.getToken();
    console.log('=== Token Debug Info ===');
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token expired:', this.isTokenExpired(token));
      console.log('Token payload:', this.getTokenPayload());
    }
    console.log('========================');
  }
}