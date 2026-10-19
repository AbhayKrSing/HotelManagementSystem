import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <a routerLink="/search" class="brand">StayEase</a>
      <div class="auth-card">
        <p class="eyebrow">Join StayEase</p>
        <h2>Create your account</h2>
        <p class="auth-subtitle">Travel as a guest, or list a place of your own.</p>

        <form [formGroup]="registerForm" (ngSubmit)="onRegister()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" formControlName="fullName" placeholder="John Doe" class="form-input" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com" class="form-input" />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" placeholder="••••••••" class="form-input" />
          </div>
          <div class="form-group">
            <label>I want to</label>
            <div class="role-selector">
              <button type="button" class="role-btn" [class.active]="selectedRole() === 'GUEST'" (click)="selectedRole.set('GUEST')">
                🧳 Travel as Guest
              </button>
              <button type="button" class="role-btn" [class.active]="selectedRole() === 'HOST'" (click)="selectedRole.set('HOST')">
                🏡 Host Properties
              </button>
            </div>
          </div>

          <div class="error-alert" *ngIf="errorMsg()">{{ errorMsg() }}</div>
          <div class="success-alert" *ngIf="successMsg()">{{ successMsg() }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading() || registerForm.invalid">
            <span *ngIf="!loading()">Create Account</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .auth-wrapper { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:4.5rem 1rem 2rem; position:relative; }
    .brand { position:absolute; top:1.5rem; left:1.5rem; font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; letter-spacing:-0.03em; }
    .auth-card { width:min(480px,100%); padding:2.25rem 2rem; border-radius:28px; border:1px solid var(--line); background:rgba(255,255,255,.86); backdrop-filter:blur(14px); box-shadow:0 22px 60px rgba(20,36,31,.08); }
    .eyebrow { margin:0 0 .4rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h2 { font-family:'Fraunces',serif; font-size:2rem; letter-spacing:-0.03em; margin:0 0 .4rem; }
    .auth-subtitle { color:var(--muted); margin:0 0 1.5rem; line-height:1.5; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.4rem; font-size:.8rem; font-weight:600; color:var(--muted); }
    .form-input { width:100%; padding:.8rem .95rem; border:1px solid var(--line); border-radius:14px; background:#fff; color:var(--ink); font:inherit; }
    .form-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .role-selector { display:grid; grid-template-columns:1fr 1fr; gap:.7rem; }
    .role-btn { padding:.8rem .6rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--muted); font:inherit; font-weight:600; font-size:.88rem; }
    .role-btn.active { border-color:rgba(11,110,106,.4); background:rgba(11,110,106,.08); color:var(--teal); }
    .error-alert { background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.2); color:var(--coral); padding:.75rem 1rem; border-radius:14px; margin-bottom:1rem; font-size:.9rem; }
    .success-alert { background:rgba(11,110,106,.08); border:1px solid rgba(11,110,106,.18); color:var(--teal); padding:.75rem 1rem; border-radius:14px; margin-bottom:1rem; font-size:.9rem; }
    .btn-primary { width:100%; padding:.95rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .btn-primary:hover:not(:disabled) { background:var(--teal-deep); }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .auth-footer { text-align:center; margin-top:1.35rem; color:var(--muted); font-size:.9rem; }
    .auth-footer a { color:var(--teal); font-weight:600; }
    .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedRole = signal<'GUEST' | 'HOST'>('GUEST');
  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const payload = {
      ...this.registerForm.value,
      roles: [this.selectedRole()]
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Account created! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
