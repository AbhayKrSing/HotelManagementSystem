import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { Booking } from '../../../core/models/booking.model';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="admin-layout">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="sidebar-logo"><span>🏠</span> Admin</div>
        <nav>
          <a class="nav-item" [class.active]="activeSection() === 'overview'" (click)="activeSection.set('overview')">📊 Overview</a>
          <a class="nav-item" [class.active]="activeSection() === 'users'" (click)="loadUsersSection()">👤 Users</a>
          <a class="nav-item" [class.active]="activeSection() === 'bookings'" (click)="loadBookingsSection()">📅 Bookings</a>
          <a class="nav-item" [class.active]="activeSection() === 'analytics'" (click)="loadAnalytics()">📈 Analytics</a>
        </nav>
        <div class="sidebar-bottom">
          <app-logout-button />
        </div>
      </aside>

      <nav class="mobile-nav">
        <button type="button" [class.active]="activeSection() === 'overview'" (click)="activeSection.set('overview')">Overview</button>
        <button type="button" [class.active]="activeSection() === 'users'" (click)="loadUsersSection()">Users</button>
        <button type="button" [class.active]="activeSection() === 'bookings'" (click)="loadBookingsSection()">Bookings</button>
        <button type="button" [class.active]="activeSection() === 'analytics'" (click)="loadAnalytics()">Analytics</button>
        <app-logout-button />
      </nav>

      <!-- MAIN -->
      <main class="admin-main">
        <div class="admin-header">
          <h1>Admin Dashboard</h1>
          <span class="admin-badge">Administrator</span>
        </div>

        <!-- OVERVIEW -->
        <div *ngIf="activeSection() === 'overview'">
          <div class="stats-grid">
            <div class="stat-card blue">
              <div class="stat-icon">👤</div>
              <div class="stat-num">{{ stats().totalUsers }}</div>
              <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card green">
              <div class="stat-icon">🏡</div>
              <div class="stat-num">{{ stats().totalHotels }}</div>
              <div class="stat-label">Properties</div>
            </div>
            <div class="stat-card orange">
              <div class="stat-icon">📅</div>
              <div class="stat-num">{{ stats().totalBookings }}</div>
              <div class="stat-label">Bookings</div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon">💰</div>
              <div class="stat-num">₹{{ (stats().totalRevenue || 0) | number:'1.0-0' }}</div>
              <div class="stat-label">Revenue</div>
            </div>
          </div>

          <div class="commission-widget">
            <h2>Platform Commission Rate</h2>
            <div class="commission-row">
              <input type="number" [(ngModel)]="commissionRate" class="comm-input" min="0" max="100" step="0.5" />
              <span class="comm-unit">%</span>
              <button class="btn-update" (click)="updateCommission()">Update</button>
            </div>
          </div>
        </div>

        <!-- USERS -->
        <div *ngIf="activeSection() === 'users'">
          <h2>User Management</h2>
          <div class="search-bar">
            <input type="text" placeholder="Search users..." class="search-input" (input)="filterUsers($event)" />
          </div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of filteredUsers()">
                  <td>{{ u.fullName }}</td>
                  <td>{{ u.email }}</td>
                  <td><span class="role-badge role-{{ (u.roles?.[0] || 'GUEST').toLowerCase() }}">{{ u.roles?.[0] || 'GUEST' }}</span></td>
                  <td><span class="status-indicator" [class.active]="u.enabled">{{ u.enabled ? 'Active' : 'Blocked' }}</span></td>
                  <td>
                    <button class="btn-sm" [class.danger]="u.enabled" (click)="toggleUser(u)">
                      {{ u.enabled ? 'Block' : 'Unblock' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- BOOKINGS -->
        <div *ngIf="activeSection() === 'bookings'">
          <h2>All Bookings</h2>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr><th>ID</th><th>Guest</th><th>Hotel</th><th>Dates</th><th>Amount</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of allBookings()">
                  <td class="mono">{{ b.id?.slice(0, 8) }}...</td>
                  <td>{{ b.guestName || 'Guest' }}</td>
                  <td>{{ b.hotelName }}</td>
                  <td>{{ b.checkIn | date:'shortDate' }} – {{ b.checkOut | date:'shortDate' }}</td>
                  <td>₹{{ b.totalAmount | number:'1.0-0' }}</td>
                  <td><span class="status-badge" [class]="'status-' + (b.status ? b.status.toLowerCase() : '')">{{ b.status }}</span></td>
                  <td>
                    <button class="btn-sm danger" *ngIf="b.status !== 'CANCELLED'" (click)="forceCancel(b.id)">Force Cancel</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ANALYTICS -->
        <div *ngIf="activeSection() === 'analytics'">
          <h2>Platform Analytics</h2>
          <div class="analytics-grid">
            <div class="analytic-card" *ngFor="let item of analyticsItems()">
              <div class="analytic-label">{{ item.label }}</div>
              <div class="analytic-val">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .admin-layout { display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
    .admin-sidebar { background:rgba(255,255,255,.72); border-right:1px solid var(--line); display:flex; flex-direction:column; padding:.75rem; }
    .sidebar-logo { font-family:'Fraunces',serif; font-size:1.35rem; font-weight:700; padding:.7rem .8rem 1rem; border-bottom:1px solid var(--line); margin-bottom:.5rem; }
    .nav-item { display:block; padding:.7rem .9rem; color:var(--muted); font-size:.88rem; font-weight:600; border-radius:12px; margin-bottom:.2rem; }
    .nav-item:hover, .nav-item.active { background:rgba(11,110,106,.1); color:var(--teal); }
    .nav-item.danger:hover { background:rgba(212,83,60,.08); color:var(--coral); }
    .sidebar-bottom { margin-top:auto; padding-top:.75rem; border-top:1px solid var(--line); }
    .mobile-nav { display:none; }
    .admin-main { padding:1.75rem 1.5rem 3rem; }
    .admin-header { display:flex; align-items:center; gap:.8rem; margin-bottom:1.5rem; }
    h1 { font-family:'Fraunces',serif; font-size:2rem; letter-spacing:-0.03em; margin:0; }
    .admin-badge { background:rgba(11,110,106,.1); color:var(--teal); padding:.3rem .75rem; border-radius:999px; font-size:.72rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
    h2 { font-family:'Fraunces',serif; font-size:1.35rem; margin:0 0 1.1rem; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
    .stat-card, .commission-widget, .table-wrapper, .analytic-card { background:var(--surface); border:1px solid var(--line); border-radius:20px; }
    .stat-card { padding:1.2rem; text-align:center; }
    .stat-card.blue, .stat-card.green, .stat-card.orange, .stat-card.purple { background:rgba(11,110,106,.07); border-color:rgba(11,110,106,.16); }
    .stat-icon { font-size:1.3rem; margin-bottom:.35rem; }
    .stat-num, .analytic-val { font-family:'Fraunces',serif; font-size:1.5rem; color:var(--teal); }
    .stat-label, .analytic-label { color:var(--muted); font-size:.82rem; margin-top:.2rem; }
    .commission-widget { padding:1.25rem; }
    .commission-row { display:flex; align-items:center; gap:.7rem; margin-top:.9rem; }
    .comm-input, .search-input { padding:.7rem .9rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--ink); font:inherit; }
    .comm-input { width:100px; text-align:center; font-weight:700; }
    .comm-input:focus, .search-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .comm-unit { color:var(--muted); }
    .btn-update { padding:.7rem 1.1rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .search-bar { margin-bottom:1rem; }
    .search-input { width:min(420px,100%); }
    .table-wrapper { overflow:auto; }
    .data-table { width:100%; border-collapse:collapse; min-width:700px; }
    .data-table th { padding:.75rem 1rem; text-align:left; font-size:.72rem; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--line); }
    .data-table td { padding:.75rem 1rem; font-size:.88rem; border-bottom:1px solid var(--line); }
    .mono { font-family:ui-monospace,monospace; font-size:.8rem; }
    .role-badge, .status-indicator, .status-badge { padding:.25rem .6rem; border-radius:999px; font-size:.72rem; font-weight:700; }
    .role-admin { background:rgba(212,83,60,.1); color:var(--coral); }
    .role-host { background:rgba(180,130,40,.12); color:#8a6418; }
    .role-guest, .status-indicator.active, .status-confirmed { background:rgba(11,110,106,.12); color:var(--teal); }
    .status-indicator:not(.active), .status-cancelled { background:rgba(212,83,60,.1); color:var(--coral); }
    .status-pending { background:rgba(180,130,40,.12); color:#8a6418; }
    .status-completed { background:rgba(20,36,31,.08); color:var(--ink); }
    .btn-sm { padding:.35rem .7rem; background:#fff; border:1px solid var(--line); color:var(--ink); border-radius:10px; font:inherit; font-size:.78rem; font-weight:600; }
    .btn-sm.danger { border-color:rgba(212,83,60,.3); color:var(--coral); background:rgba(212,83,60,.06); }
    .analytics-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:1rem; }
    .analytic-card { padding:1.25rem; text-align:center; }
    @media (max-width:900px) {
      .admin-layout { grid-template-columns:1fr; }
      .admin-sidebar { display:none; }
      .mobile-nav { display:flex; gap:.45rem; overflow:auto; padding:.85rem 1rem 0; }
      .mobile-nav button { padding:.45rem .8rem; border-radius:999px; border:1px solid var(--line); background:#fff; color:var(--muted); font:inherit; font-size:.8rem; font-weight:600; white-space:nowrap; }
      .mobile-nav button.active { background:rgba(11,110,106,.1); color:var(--teal); border-color:rgba(11,110,106,.3); }
      .stats-grid { grid-template-columns:1fr 1fr; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeSection = signal('overview');
  allUsers = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  allBookings = signal<Booking[]>([]);
  analyticsItems = signal<{ label: string; value: any }[]>([]);
  stats = signal<any>({});
  commissionRate = 15;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getAnalytics().subscribe({
      next: (res) => {
        const data = res.data || {};
        this.stats.set(data);
        this.analyticsItems.set(Object.entries(data).map(([k, v]) => ({ label: k, value: v })));
      }
    });
  }

  loadUsersSection(): void {
    this.activeSection.set('users');
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.allUsers.set(res.data || []);
        this.filteredUsers.set(res.data || []);
      }
    });
  }

  loadBookingsSection(): void {
    this.activeSection.set('bookings');
    this.adminService.getAllBookings().subscribe({
      next: (res) => this.allBookings.set(res.data || [])
    });
  }

  loadAnalytics(): void {
    this.activeSection.set('analytics');
    this.adminService.getAnalytics().subscribe({
      next: (res) => {
        const data = res.data || {};
        this.analyticsItems.set(Object.entries(data).map(([k, v]) => ({ label: k, value: v })));
      }
    });
  }

  filterUsers(event: Event): void {
    const q = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers.set(this.allUsers().filter(u => u.email.toLowerCase().includes(q) || u.fullName?.toLowerCase().includes(q)));
  }

  toggleUser(user: User): void {
    if (!user.id) return;
    this.adminService.setUserStatus(user.id, !user.enabled).subscribe({
      next: () => {
        const updated = this.allUsers().map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u);
        this.allUsers.set(updated);
        this.filteredUsers.set(updated);
      }
    });
  }

  forceCancel(id?: string): void {
    if (!id) return;
    this.adminService.forceCancelBooking(id).subscribe({
      next: () => this.allBookings.set(this.allBookings().map(b => b.id === id ? { ...b, status: 'CANCELLED' as any } : b))
    });
  }

  updateCommission(): void {
    this.adminService.updateCommission(this.commissionRate).subscribe();
  }
}
