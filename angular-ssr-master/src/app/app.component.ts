import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

import { Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'angular-routing';
  footerUrl = 'https://steeprise.com';
  footerLink = 'https://www.steeprise.com';
  showHeader = true;

  constructor(

    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    public authService: AuthService) { }

  ngOnInit(): void {

    this.router.events.subscribe(() => {

      this.showHeader = this.router.url !== '/login';
    });

    if (isPlatformBrowser(this.platformId)) {

      const navMain = this.document.getElementById('navbarCollapse');

      if (navMain) {

        navMain.onclick = function onClick() {

          if (navMain) {

            navMain.classList.remove("show");
          }
        }
      }
    }
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }
} 
