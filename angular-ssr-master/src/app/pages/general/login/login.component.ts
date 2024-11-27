import { Component } from '@angular/core';
import { LoginService } from '../login/login.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  visible: boolean = true;
  changetype: boolean = true;

  viewpass() {

    this.visible = !this.visible
    this.changetype = !this.changetype
  }

  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private loginService: LoginService,
    private router: Router) { }

  onLogin() {

    this.errorMessage = '';

    const loginData = {

      username: this.username,
      password: this.password
    };

    if (!this.username || !this.password) {

      this.errorMessage = 'Username and password are required';

      return;
    }

    this.loginService.postData(loginData).subscribe({
      next: (response: any) => {

        if (response.succeeded) {

          console.log('Login successful', response);

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('code', response.data.ccode);
          localStorage.setItem('username', response.data.username);

          this.router.navigate(['/invoice']);

        } else {

          console.warn('Login failed:', response.messages[0]);

          this.errorMessage = response.messages[0] || 'Login failed. Please try again.';
        }
      },
      error: (error: any) => {

        console.error('HTTP Error:', error);

        this.errorMessage = 'An unexpected error occurred. Please try again later.';
      }
    });
  }
}