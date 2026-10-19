import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { LoginRequest, LoginResponse, RegisterRequest, Role, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  register(request: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.apiUrl}/register`, request);
  }

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}/login`, request).pipe(
      tap((res) => {
        if (res.data?.token) {
          localStorage.setItem('auth_token', res.data.token);
          const rolesArray = this.normalizeRoles(res.data.role);
          const user: User = {
            email: res.data.email,
            roles: rolesArray
          };
          localStorage.setItem('auth_user', JSON.stringify(user));
          this.currentUser.set(user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  hasAnyRole(roles: Role[]): boolean {
    const user = this.currentUser();
    if (!user?.roles) return false;
    return user.roles.some((r) => roles.includes(r));
  }

  normalizeRoles(role: LoginResponse['role']): Role[] {
    if (!role) return [];
    if (Array.isArray(role)) return role;
    return [role];
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
}
