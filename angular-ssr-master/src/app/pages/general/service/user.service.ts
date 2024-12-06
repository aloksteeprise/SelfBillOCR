import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSubject = new BehaviorSubject<string | null>(null); // Initial value is null
  username$ = this.usernameSubject.asObservable(); // Expose as observable

  setUsername(username: string): void {
    this.usernameSubject.next(username); // Update the BehaviorSubject
  }

  getUsername(): string | null {
    return this.usernameSubject.getValue(); // Get the current value
  }
}
