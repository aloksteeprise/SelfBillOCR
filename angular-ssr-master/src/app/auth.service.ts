import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  isLoggedIn() {
    var token = null; // get token from local storage
    if (this.isBrowser) {
      token = localStorage.getItem('token');
    }

    if (token != null) {

      const payload = atob(token.split('.')[1]); // decode payload of token

      const parsedPayload = JSON.parse(payload); // convert payload into an Object

      return parsedPayload.exp > Date.now() / 1000; // check if token is expired
    }

    return false;
  }

  // Log in the user
  login(): void {
    
  }

  // Log out the user
  logout(): void {
    
    localStorage.clear();
  }
}