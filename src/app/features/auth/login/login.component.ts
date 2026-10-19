import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-wrapper">
      <a routerLink="/search" class="brand">StayEase</a>
      <div class="auth-card">
        <p class="eyebrow">Welcome back</p>
        <h2>Sign in</h2>
        <p class="auth-subtitle">Continue to your trips, listings, and checkout.</p>

        <form [formGroup]="loginForm" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" class="form-input" />
            <div class="field-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              Valid email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" class="form-input" />
            <div class="field-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              Password is required
            </div>
          </div>

          <div class="error-alert" *ngIf="errorMsg()">{{ errorMsg() }}</div>

          <button type="submit" class="btn-primary" [disabled]="loading() || loginForm.invalid">
            <span *ngIf="!loading()">Sign In</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Sign Up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .auth-wrapper { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:4.5rem 1rem 2rem; position:relative; }
    .brand { position:absolute; top:1.5rem; left:1.5rem; font-family:'Fraunces',serif; font-size:1.5rem; font-weight:700; letter-spacing:-0.03em; }
    .auth-card { width:min(440px,100%); padding:2.25rem 2rem; border-radius:28px; border:1px solid var(--line); background:rgba(255,255,255,.86); backdrop-filter:blur(14px); box-shadow:0 22px 60px rgba(20,36,31,.08); }
    .eyebrow { margin:0 0 .4rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h2 { font-family:'Fraunces',serif; font-size:2rem; letter-spacing:-0.03em; margin:0 0 .4rem; }
    .auth-subtitle { color:var(--muted); margin:0 0 1.6rem; line-height:1.5; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.4rem; font-size:.8rem; font-weight:600; color:var(--muted); }
    .form-input { width:100%; padding:.8rem .95rem; border:1px solid var(--line); border-radius:14px; background:#fff; color:var(--ink); font:inherit; }
    .form-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .field-error, .error-alert { color:var(--coral); font-size:.82rem; margin-top:.35rem; }
    .error-alert { background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.2); padding:.75rem 1rem; border-radius:14px; margin-bottom:1rem; }
    .btn-primary { width:100%; margin-top:.4rem; padding:.95rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .btn-primary:hover:not(:disabled) { background:var(--teal-deep); transform:translateY(-1px); }
    .btn-primary:disabled { opacity:.5; cursor:not-allowed; }
    .auth-footer { text-align:center; margin-top:1.35rem; color:var(--muted); font-size:.9rem; }
    .auth-footer a { color:var(--teal); font-weight:600; }
    .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMsg = signal('');

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading.set(false);
        const roles = res.data.role;
        const roleArr = Array.isArray(roles) ? roles : [roles];
        if (roleArr.includes('ADMIN')) this.router.navigate(['/admin']);
        else if (roleArr.includes('HOST')) this.router.navigate(['/host']);
        else this.router.navigate(['/search']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set('Invalid email or password');
      }
    });
  }
}
