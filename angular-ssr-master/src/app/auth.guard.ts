import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Replace with your actual auth service
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  canActivate(): boolean {

    if (isPlatformBrowser(this.platformId)) {
    
      // Check if the user is authenticated using the auth service
      const isLoggedIn = this.authService.isLoggedIn(); // Replace with your actual method
    
      if (isLoggedIn) {
    
        return true; // Allow navigation if authenticated
      } else {
    
        this.router.navigate(['/login']); // Redirect to login if not authenticated
        return false;
      }
    }

    // For non-browser platforms, deny access by default
    return false;
  }
}
