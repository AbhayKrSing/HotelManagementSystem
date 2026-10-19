import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="logout-btn" *ngIf="auth.isLoggedIn()" (click)="logout()">Log out</button>
  `,
  styles: [`
    :host { display: contents; }
    .logout-btn {
      border: 1px solid rgba(212, 83, 60, 0.35);
      background: #fff;
      color: #d4533c;
      border-radius: 999px;
      padding: 0.5rem 0.95rem;
      font: inherit;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .logout-btn:hover {
      background: rgba(212, 83, 60, 0.08);
      border-color: #d4533c;
    }
  `]
})
export class LogoutButtonComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
