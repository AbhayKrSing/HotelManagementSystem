import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';
import { Booking, BookingStatus } from '../../../core/models/booking.model';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-container">
        <header class="topbar">
          <a routerLink="/search" class="brand">StayEase</a>
          <div class="top-actions">
            <a routerLink="/search" class="back-link">Explore stays</a>
            <app-logout-button />
          </div>
        </header>
        <p class="eyebrow">Your trips</p>
        <h1>My bookings</h1>

        <!-- TABS -->
        <div class="tabs">
          <button class="tab" *ngFor="let t of tabs" [class.active]="activeTab() === t.status" (click)="filterBookings(t.status)">
            {{ t.label }}
          </button>
        </div>

        <div *ngIf="loading()" class="loading-container">
          <div class="loader"></div>
        </div>

        <div *ngIf="!loading() && filteredBookings().length" class="bookings-list">
          <div class="booking-card" *ngFor="let b of filteredBookings()">
            <div class="booking-img">
              <img [src]="b.roomPhoto || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=300'" alt="Room" />
            </div>
            <div class="booking-info">
              <div class="booking-top">
                <div>
                  <h3>{{ b.hotelName }}</h3>
                  <p class="room-type">{{ b.roomType }}</p>
                </div>
                <span class="status-badge" [class]="'status-' + (b.status ? b.status.toLowerCase() : '')">{{ b.status }}</span>
              </div>
              <div class="booking-dates">
                <div class="date-chip">📅 {{ b.checkIn | date:'mediumDate' }} → {{ b.checkOut | date:'mediumDate' }}</div>
                <div class="guests-chip">👥 {{ b.guests }} guests</div>
              </div>
              <div class="booking-footer">
                <span class="total">₹{{ b.totalAmount | number:'1.0-0' }}</span>
                <div class="booking-actions">
                  <button class="btn-sm" [routerLink]="['/hotels', b.hotelId]">View Hotel</button>
                  <button class="btn-sm danger" *ngIf="b.status === 'CONFIRMED'" (click)="cancelBooking(b.id)">Cancel</button>
                  <button class="btn-sm outline" *ngIf="b.status === 'COMPLETED'" [routerLink]="['/reviews/write']" [queryParams]="{bookingId: b.id}">
                    Write Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading() && !filteredBookings().length" class="empty-state">
          <div class="empty-icon">🧳</div>
          <h3>No bookings found</h3>
          <p>Looks like you haven't booked anything yet.</p>
          <a routerLink="/search" class="btn-primary">Start Exploring</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .page-wrapper { padding:1.5rem 1.25rem 3.5rem; }
    .page-container { max-width:920px; margin:0 auto; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.75rem; }
    .top-actions { display:flex; align-items:center; gap:.85rem; }
    .brand { font-family:'Fraunces',serif; font-size:1.65rem; font-weight:700; letter-spacing:-0.03em; }
    .back-link { color:var(--muted); font-weight:500; }
    .back-link:hover { color:var(--teal); }
    .eyebrow { margin:0 0 .35rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h1 { font-family:'Fraunces',serif; font-size:clamp(2rem,4vw,2.6rem); letter-spacing:-0.03em; margin:0 0 1.25rem; }
    .tabs { display:flex; gap:.45rem; flex-wrap:wrap; margin-bottom:1.5rem; }
    .tab { padding:.45rem .9rem; background:#fff; border:1px solid var(--line); border-radius:999px; color:var(--muted); font:inherit; font-size:.82rem; font-weight:600; }
    .tab.active { border-color:rgba(11,110,106,.35); color:var(--teal); background:rgba(11,110,106,.08); }
    .loading-container { display:flex; justify-content:center; padding:4rem; }
    .loader { width:42px; height:42px; border:3px solid rgba(11,110,106,.15); border-top-color:var(--teal); border-radius:50%; animation:spin .75s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .bookings-list { display:grid; gap:1rem; }
    .booking-card { display:grid; grid-template-columns:160px 1fr; background:var(--surface); border:1px solid var(--line); border-radius:24px; overflow:hidden; box-shadow:0 18px 50px rgba(20,36,31,.05); }
    .booking-img img { width:160px; height:100%; min-height:150px; object-fit:cover; display:block; }
    .booking-info { padding:1.15rem 1.25rem; }
    .booking-top { display:flex; justify-content:space-between; gap:.75rem; margin-bottom:.7rem; }
    .booking-top h3 { font-family:'Fraunces',serif; font-size:1.2rem; margin:0 0 .2rem; }
    .room-type { color:var(--muted); font-size:.85rem; margin:0; }
    .status-badge { padding:.28rem .7rem; border-radius:999px; font-size:.72rem; font-weight:700; letter-spacing:.04em; height:fit-content; }
    .status-confirmed { background:rgba(11,110,106,.12); color:var(--teal); }
    .status-pending { background:rgba(180,130,40,.12); color:#8a6418; }
    .status-cancelled { background:rgba(212,83,60,.1); color:var(--coral); }
    .status-completed { background:rgba(20,36,31,.08); color:var(--ink); }
    .booking-dates { display:flex; gap:.5rem; flex-wrap:wrap; margin-bottom:.85rem; }
    .date-chip, .guests-chip { background:#fff; border:1px solid var(--line); padding:.35rem .7rem; border-radius:999px; font-size:.8rem; color:var(--muted); }
    .booking-footer { display:flex; justify-content:space-between; align-items:center; gap:.75rem; }
    .total { font-family:'Fraunces',serif; font-size:1.25rem; color:var(--teal); }
    .booking-actions { display:flex; gap:.45rem; flex-wrap:wrap; }
    .btn-sm { padding:.4rem .8rem; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:12px; font:inherit; font-size:.8rem; font-weight:600; }
    .btn-sm.danger { border-color:rgba(212,83,60,.3); color:var(--coral); background:rgba(212,83,60,.06); }
    .btn-sm.outline { border-color:rgba(11,110,106,.3); color:var(--teal); background:rgba(11,110,106,.06); }
    .empty-state { text-align:center; padding:3.5rem 1rem; }
    .empty-state h3 { font-family:'Fraunces',serif; font-size:1.5rem; margin:0 0 .4rem; }
    .empty-state p { color:var(--muted); margin-bottom:1.25rem; }
    .btn-primary { display:inline-block; padding:.9rem 1.4rem; background:var(--teal); color:#fff; border-radius:14px; font-weight:600; }
    @media (max-width:700px) { .booking-card { grid-template-columns:1fr; } .booking-img img { width:100%; height:160px; } }
  `]
})
export class MyBookingsComponent implements OnInit {
  bookings = signal<Booking[]>([]);
  filteredBookings = signal<Booking[]>([]);
  loading = signal(true);
  activeTab = signal<string | null>(null);

  tabs = [
    { label: 'All', status: null },
    { label: 'Confirmed', status: 'CONFIRMED' },
    { label: 'Pending', status: 'PENDING' },
    { label: 'Completed', status: 'COMPLETED' },
    { label: 'Cancelled', status: 'CANCELLED' }
  ];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        this.bookings.set(res.data || []);
        this.filteredBookings.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterBookings(status: string | null): void {
    this.activeTab.set(status);
    if (!status) {
      this.filteredBookings.set(this.bookings());
    } else {
      this.filteredBookings.set(this.bookings().filter(b => b.status === status));
    }
  }

  cancelBooking(id?: string): void {
    if (!id) return;
    this.bookingService.cancelBooking(id).subscribe({
      next: () => {
        const updated = this.bookings().map(b => b.id === id ? { ...b, status: 'CANCELLED' as BookingStatus } : b);
        this.bookings.set(updated);
        this.filterBookings(this.activeTab());
      }
    });
  }
}
