export class TokenUtils {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  static getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
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
      console.log('TokenUtils: No token found in localStorage');
      return false;
    }

    if (token.trim() === '') {
      console.log('TokenUtils: Token is empty string');
      return false;
    }

    // Check if token has proper JWT format (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('TokenUtils: Token does not have proper JWT format');
      return false;
    }

    if (this.isTokenExpired(token)) {
      console.log('TokenUtils: Token is expired');
      return false;
    }

    console.log('TokenUtils: Token is valid');
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
    console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token parts count:', token.split('.').length);
      console.log('Token expired:', this.isTokenExpired(token));
      console.log('Token payload:', this.getTokenPayload());
      
      // Additional checks
      if (token.trim() === '') {
        console.log('⚠️ Token is empty string');
      }
      if (token.split('.').length !== 3) {
        console.log('⚠️ Token does not have proper JWT format');
      }
    }
    console.log('Is Valid:', this.isValidToken());
    console.log('========================');
  }
}