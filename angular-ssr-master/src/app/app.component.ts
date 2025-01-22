import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router,ActivatedRoute, NavigationStart } from '@angular/router';

import { Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { UserService } from './pages/general/service/user.service'
import {RouterModule} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet,RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title = 'angular-routing';
  footerUrl = ''; //https://www.steeprise.com
  footerLink = ''; //https://www.steeprise.com
  showHeader = true;
  username: string | null = null;
  token: string | null = null;
  selfBillNotificationLink: string | null = null;
  remittanceNotificationLink : string | null = null;

  constructor(

    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router,
    private userService: UserService,
    public authService: AuthService,
    private dialog: MatDialog ,// Use MatDialog service
    private route: ActivatedRoute) { }
    


    ngOnInit(): void {
      this.router.events.subscribe(event => {
        // Check if the current URL is not '/login' and update showHeader
        this.showHeader = this.router.url !== '/login';
    
        // Subscribe to username updates
        this.userService.username$.subscribe((username) => {
          this.username = username;
        });
    
        // Check if the event is a NavigationStart event and close dialogs
        if (event instanceof NavigationStart) {
          this.closeAllDialogs(); // Close dialogs when navigation starts
        }
      });
    
    



    if (isPlatformBrowser(this.platformId)) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        this.userService.setUsername(storedUsername);
      }

      this.route.queryParams.subscribe(params => {
        var urlToken = localStorage.getItem('token');
        // var urlToken = params['token'];      
        if (urlToken) {
          console.log('Token exists. Updating state.');
          this.token = urlToken;
          this.selfBillNotificationLink = `/afsselfbillnotification?token=${this.token}`;
          this.remittanceNotificationLink = `/remittancenotification?token=${this.token}`;         
          this.sendLinkViaEmail();
        }
      });

      // this.username = localStorage.getItem('username') || '';

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

  sendLinkViaEmail() {
    const selfBillNotification = `Access the Self Bill Notification Component here: ${window.location.origin}${this.selfBillNotificationLink}`;
    const remittanceNotification = `Access the Remittance Notification Component here: ${window.location.origin}${this.remittanceNotificationLink}`;
    console.log(selfBillNotification);
    console.log(remittanceNotification);
  }

  getTruncatedUsername(): string {
    if (this.username && this.username.length > 10) {
      return this.username.substring(0, 10) + '...'; // Truncate and add '...'
    }
    return this.username || ''; // Return full username or empty if not present
  }

  logout(): void {

    this.authService.logout();

    this.router.navigate(['/login']);
  }

  closeAllDialogs(): void {
    this.dialog.closeAll(); // Closes all open dialogs
  }
}
