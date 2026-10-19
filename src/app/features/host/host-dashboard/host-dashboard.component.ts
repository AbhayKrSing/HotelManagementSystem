import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { BookingService } from '../../../core/services/booking.service';
import { HostService } from '../../../core/services/host.service';
import { Hotel } from '../../../core/models/hotel.model';
import { Booking } from '../../../core/models/booking.model';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="host-layout">
      <!-- SIDEBAR -->
      <aside class="host-sidebar">
        <div class="sidebar-logo">
          <span>🏠</span> <span>StayEase</span>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item" [class.active]="activeSection() === 'overview'" (click)="activeSection.set('overview')">
            📊 Overview
          </a>
          <a class="nav-item" [class.active]="activeSection() === 'properties'" (click)="activeSection.set('properties')">
            🏡 My Properties
          </a>
          <a class="nav-item" [class.active]="activeSection() === 'bookings'" (click)="activeSection.set('bookings')">
            📅 Bookings
          </a>
          <a class="nav-item" [class.active]="activeSection() === 'earnings'" (click)="activeSection.set('earnings')">
            💰 Earnings
          </a>
          <a class="nav-item" routerLink="/host/hotels/new">
            ➕ Add Property
          </a>
        </nav>
        <div class="sidebar-footer">
          <a routerLink="/search" class="nav-item">🔍 Browse</a>
          <app-logout-button />
        </div>
      </aside>

      <nav class="mobile-nav">
        <button type="button" [class.active]="activeSection() === 'overview'" (click)="activeSection.set('overview')">Overview</button>
        <button type="button" [class.active]="activeSection() === 'properties'" (click)="activeSection.set('properties')">Properties</button>
        <button type="button" [class.active]="activeSection() === 'bookings'" (click)="activeSection.set('bookings')">Bookings</button>
        <button type="button" [class.active]="activeSection() === 'earnings'" (click)="activeSection.set('earnings')">Earnings</button>
        <a routerLink="/host/hotels/new">Add</a>
        <a routerLink="/search">Browse</a>
        <app-logout-button />
      </nav>

      <!-- MAIN CONTENT -->
      <main class="host-main">
        <!-- HEADER -->
        <div class="host-header">
          <div>
            <h1>Host Dashboard</h1>
            <p class="welcome">Welcome back, Host! 👋</p>
          </div>
          <button routerLink="/host/hotels/new" class="btn-add">+ Add Property</button>
        </div>

        <!-- OVERVIEW -->
        <div *ngIf="activeSection() === 'overview'">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">🏡</div>
              <div class="stat-num">{{ hotels().length }}</div>
              <div class="stat-label">Properties</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-num">{{ totalBookings() }}</div>
              <div class="stat-label">Total Bookings</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-icon">💰</div>
              <div class="stat-num">₹{{ totalEarnings() | number:'1.0-0' }}</div>
              <div class="stat-label">Total Earnings</div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⭐</div>
              <div class="stat-num">{{ avgRating() | number:'1.1-1' }}</div>
              <div class="stat-label">Avg Rating</div>
            </div>
          </div>

          <!-- RECENT BOOKINGS -->
          <div class="section">
            <div class="section-header">
              <h2>Recent Bookings</h2>
              <button class="link-btn" (click)="activeSection.set('bookings')">View all →</button>
            </div>
            <div class="table-wrapper">
              <table class="bookings-table">
                <thead>
                  <tr><th>Guest</th><th>Property</th><th>Dates</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let b of bookings().slice(0, 5)">
                    <td>{{ b.guestName || 'Guest' }}</td>
                    <td>{{ b.hotelName }}</td>
                    <td>{{ b.checkIn | date:'shortDate' }} – {{ b.checkOut | date:'shortDate' }}</td>
                    <td>₹{{ b.totalAmount | number:'1.0-0' }}</td>
                    <td><span class="status-badge" [class]="'status-' + (b.status ? b.status.toLowerCase() : '')">{{ b.status }}</span></td>
                    <td>
                      <button class="btn-approve" *ngIf="b.status === 'PENDING'" (click)="rejectBooking(b.id)">Reject</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- PROPERTIES -->
        <div *ngIf="activeSection() === 'properties'">
          <div class="section-header">
            <h2>My Properties</h2>
            <button routerLink="/host/hotels/new" class="btn-add">+ Add New</button>
          </div>
          <div class="properties-grid">
            <div class="property-card" *ngFor="let h of hotels()">
              <div class="prop-image">
                <img [src]="h.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'" [alt]="h.name" />
                <span class="prop-status" [class.active]="h.status === 'ACTIVE'">{{ h.status === 'ACTIVE' ? 'Active' : 'Inactive' }}</span>
              </div>
              <div class="prop-info">
                <h3>{{ h.name }}</h3>
                <p>📍 {{ h.city }}, {{ h.country }}</p>
                <div class="prop-meta">
                  <span>⭐ {{ h.rating | number:'1.1-1' }}</span>
                  <span>₹{{ h.startingPrice | number:'1.0-0' }}/night</span>
                </div>
                <div class="prop-actions">
                  <button class="btn-sm" [routerLink]="['/host/hotels', h.id, 'edit']">Edit</button>
                  <button class="btn-sm" [routerLink]="['/host/hotels', h.id, 'rooms']">Rooms</button>
                  <button class="btn-sm" [routerLink]="['/hotels', h.id]">View</button>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="!hotels().length" class="empty-state">
            <div class="empty-icon">🏡</div>
            <h3>No properties yet</h3>
            <p>Start by listing your first property</p>
            <button routerLink="/host/hotels/new" class="btn-add">Add Property</button>
          </div>
        </div>

        <!-- BOOKINGS -->
        <div *ngIf="activeSection() === 'bookings'">
          <h2>All Bookings</h2>
          <div class="table-wrapper">
            <table class="bookings-table">
              <thead>
                <tr><th>Guest</th><th>Property</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of bookings()">
                  <td>{{ b.guestName || 'Guest' }}</td>
                  <td>{{ b.hotelName }}</td>
                  <td>{{ b.checkIn | date:'shortDate' }}</td>
                  <td>{{ b.checkOut | date:'shortDate' }}</td>
                  <td>₹{{ b.totalAmount | number:'1.0-0' }}</td>
                  <td><span class="status-badge" [class]="'status-' + (b.status ? b.status.toLowerCase() : '')">{{ b.status }}</span></td>
                  <td>
                    <button class="btn-approve" *ngIf="b.status === 'PENDING'" (click)="rejectBooking(b.id)">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- EARNINGS -->
        <div *ngIf="activeSection() === 'earnings'">
          <h2>Earnings Overview</h2>
          <div class="earnings-cards">
            <div class="earning-card">
              <div class="earning-label">This Month</div>
              <div class="earning-amount">₹{{ monthEarnings() | number:'1.0-0' }}</div>
            </div>
            <div class="earning-card">
              <div class="earning-label">Last Month</div>
              <div class="earning-amount">₹{{ lastMonthEarnings() | number:'1.0-0' }}</div>
            </div>
            <div class="earning-card green">
              <div class="earning-label">Total Earnings</div>
              <div class="earning-amount">₹{{ totalEarnings() | number:'1.0-0' }}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .host-layout { display:grid; grid-template-columns:240px 1fr; min-height:100vh; }
    .host-sidebar { background:rgba(255,255,255,.72); border-right:1px solid var(--line); display:flex; flex-direction:column; backdrop-filter:blur(12px); }
    .sidebar-logo { padding:1.4rem 1.2rem; font-family:'Fraunces',serif; font-size:1.4rem; font-weight:700; letter-spacing:-0.03em; border-bottom:1px solid var(--line); }
    .sidebar-nav { flex:1; padding:.75rem; }
    .nav-item { display:block; padding:.7rem .9rem; color:var(--muted); font-size:.9rem; font-weight:600; border-radius:12px; margin-bottom:.2rem; }
    .nav-item:hover, .nav-item.active { background:rgba(11,110,106,.1); color:var(--teal); }
    .nav-item.danger:hover { background:rgba(212,83,60,.08); color:var(--coral); }
    .sidebar-footer { padding:.75rem; border-top:1px solid var(--line); }
    .mobile-nav { display:none; }
    .host-main { padding:1.75rem 1.5rem 3rem; }
    .host-header, .section-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.5rem; }
    h1 { font-family:'Fraunces',serif; font-size:2rem; letter-spacing:-0.03em; margin:0 0 .3rem; }
    .welcome { color:var(--muted); margin:0; }
    h2 { font-family:'Fraunces',serif; font-size:1.35rem; margin:0; }
    .btn-add { padding:.7rem 1.1rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .btn-add:hover { background:var(--teal-deep); }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
    .stat-card, .earning-card, .property-card, .table-wrapper { background:var(--surface); border:1px solid var(--line); border-radius:20px; box-shadow:0 12px 36px rgba(20,36,31,.04); }
    .stat-card { padding:1.25rem; text-align:center; }
    .stat-card.highlight { background:rgba(11,110,106,.08); border-color:rgba(11,110,106,.18); }
    .stat-icon { font-size:1.4rem; margin-bottom:.4rem; }
    .stat-num { font-family:'Fraunces',serif; font-size:1.55rem; margin-bottom:.2rem; }
    .stat-label, .earning-label { color:var(--muted); font-size:.82rem; }
    .section { margin-bottom:2rem; }
    .link-btn { background:none; border:none; color:var(--teal); font:inherit; font-weight:600; }
    .table-wrapper { overflow:auto; }
    .bookings-table { width:100%; border-collapse:collapse; min-width:720px; }
    .bookings-table th { padding:.8rem 1rem; text-align:left; font-size:.72rem; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--line); }
    .bookings-table td { padding:.8rem 1rem; font-size:.9rem; border-bottom:1px solid var(--line); }
    .status-badge { padding:.25rem .65rem; border-radius:999px; font-size:.72rem; font-weight:700; }
    .status-confirmed { background:rgba(11,110,106,.12); color:var(--teal); }
    .status-pending { background:rgba(180,130,40,.12); color:#8a6418; }
    .status-cancelled { background:rgba(212,83,60,.1); color:var(--coral); }
    .status-completed { background:rgba(20,36,31,.08); color:var(--ink); }
    .btn-approve { padding:.35rem .75rem; background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.25); color:var(--coral); border-radius:10px; font:inherit; font-size:.78rem; font-weight:600; }
    .properties-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1rem; }
    .property-card { overflow:hidden; }
    .prop-image { position:relative; height:160px; }
    .prop-image img { width:100%; height:100%; object-fit:cover; }
    .prop-status { position:absolute; top:.6rem; left:.6rem; padding:.2rem .6rem; border-radius:999px; font-size:.72rem; font-weight:700; background:rgba(212,83,60,.9); color:#fff; }
    .prop-status.active { background:rgba(11,110,106,.9); }
    .prop-info { padding:1rem; }
    .prop-info h3 { font-family:'Fraunces',serif; font-size:1.1rem; margin:0 0 .25rem; }
    .prop-info p, .prop-meta { color:var(--muted); font-size:.82rem; }
    .prop-meta { display:flex; gap:.75rem; margin:.5rem 0 .75rem; }
    .prop-actions { display:flex; gap:.4rem; }
    .btn-sm { padding:.35rem .7rem; background:#fff; border:1px solid var(--line); color:var(--ink); border-radius:10px; font:inherit; font-size:.78rem; font-weight:600; }
    .earnings-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; }
    .earning-card { padding:1.4rem; text-align:center; }
    .earning-card.green { background:rgba(11,110,106,.08); border-color:rgba(11,110,106,.18); }
    .earning-amount { font-family:'Fraunces',serif; font-size:1.8rem; color:var(--teal); margin-top:.4rem; }
    .empty-state { text-align:center; padding:3rem 1rem; }
    .empty-state h3 { font-family:'Fraunces',serif; margin:0 0 .4rem; }
    .empty-state p { color:var(--muted); margin-bottom:1rem; }
    @media (max-width:900px) {
      .host-layout { grid-template-columns:1fr; }
      .host-sidebar { display:none; }
      .mobile-nav { display:flex; gap:.45rem; overflow:auto; padding:.85rem 1rem 0; }
      .mobile-nav button, .mobile-nav a { padding:.45rem .8rem; border-radius:999px; border:1px solid var(--line); background:#fff; color:var(--muted); font:inherit; font-size:.8rem; font-weight:600; white-space:nowrap; }
      .mobile-nav button.active { background:rgba(11,110,106,.1); color:var(--teal); border-color:rgba(11,110,106,.3); }
      .stats-grid, .earnings-cards { grid-template-columns:1fr 1fr; }
    }
  `]
})
export class HostDashboardComponent implements OnInit {
  activeSection = signal('overview');
  hotels = signal<Hotel[]>([]);
  bookings = signal<Booking[]>([]);
  totalBookings = signal(0);
  totalEarnings = signal(0);
  avgRating = signal(0);
  monthEarnings = signal(0);
  lastMonthEarnings = signal(0);

  constructor(
    private hotelService: HotelService,
    private hostService: HostService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.hotelService.getMyHotels().subscribe({
      next: (res) => {
        const hotelList = res.data || [];
        this.hotels.set(hotelList);
        this.avgRating.set(
          hotelList.reduce((sum: number, h: Hotel) => sum + (h.rating || 0), 0) / (hotelList.length || 1)
        );
      },
      error: (err) => {
        console.error('Failed to load hotels:', err);
        this.router.navigate(['/login']);
      }
    });

    this.hostService.getHostBookings().subscribe({
      next: (res) => {
        const blist = res.data || [];
        this.bookings.set(blist);
        this.totalBookings.set(blist.length);
        const total = blist.reduce((s: number, b: Booking) => s + (b.totalAmount || 0), 0);
        this.totalEarnings.set(total);
        this.monthEarnings.set(total * 0.3);
        this.lastMonthEarnings.set(total * 0.25);
      }
    });
  }

  rejectBooking(id?: string): void {
    if (!id) return;
    this.hostService.updateBookingStatus(id, 'CANCELLED' as any).subscribe({
      next: () => {
        const updated = this.bookings().map(b => b.id === id ? { ...b, status: 'CANCELLED' as any } : b);
        this.bookings.set(updated);
      }
    });
  }
}
