import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BrowserService {
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getLocalStorage(): Storage | null {
    if (this.isBrowser() && typeof window !== 'undefined') {
      return window.localStorage;
    }
    return null;
  }

  setItem(key: string, value: string): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    const storage = this.getLocalStorage();
    return storage ? storage.getItem(key) : null;
  }

  removeItem(key: string): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.removeItem(key);
    }
  }

  clear(): void {
    const storage = this.getLocalStorage();
    if (storage) {
      storage.clear();
    }
  }
}