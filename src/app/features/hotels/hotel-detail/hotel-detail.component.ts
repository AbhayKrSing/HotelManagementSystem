import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomService } from '../../../core/services/room.service';
import { ReviewService } from '../../../core/services/review.service';
import { Hotel } from '../../../core/models/hotel.model';
import { Room } from '../../../core/models/room.model';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="detail-wrapper" *ngIf="hotel(); else loading">
      <header class="topbar">
        <a routerLink="/search" class="brand">StayEase</a>
        <div class="top-actions">
          <a routerLink="/search" class="back-link">Back to search</a>
          <app-logout-button />
        </div>
      </header>
      <!-- PHOTO GALLERY -->
      <div class="gallery">
        <div class="gallery-main">
          <img [src]="hotel()!.photos?.[activePhoto()] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'" [alt]="hotel()!.name" />
        </div>
        <div class="gallery-thumbs" *ngIf="hotel()!.photos?.length! > 1">
          <img *ngFor="let p of hotel()!.photos; let i = index" [src]="p" [class.active]="activePhoto() === i" (click)="activePhoto.set(i)" />
        </div>
      </div>

      <div class="detail-content">
        <div class="detail-main">
          <!-- HEADER -->
          <div class="hotel-header">
            <div>
              <span class="hotel-type">{{ hotel()!.hotelType }}</span>
              <h1>{{ hotel()!.name }}</h1>
              <p class="location">📍 {{ hotel()!.city }}, {{ hotel()!.country }}</p>
            </div>
            <div class="hotel-meta">
              <div class="rating-pill">⭐ {{ hotel()!.rating | number:'1.1-1' }}</div>
            </div>
          </div>

          <!-- DESCRIPTION -->
          <div class="section">
            <p class="description">{{ hotel()!.description }}</p>
          </div>

          <!-- AMENITIES -->
          <div class="section">
            <h2>Amenities</h2>
            <div class="amenities-grid">
              <span class="amenity" *ngFor="let a of hotel()!.amenities">✓ {{ a }}</span>
            </div>
          </div>

          <!-- ROOMS -->
          <div class="section">
            <h2>Available Rooms</h2>
            <form [formGroup]="roomSearchForm" (ngSubmit)="searchRooms()" class="room-search-bar">
              <input formControlName="checkIn" type="date" class="date-input" />
              <input formControlName="checkOut" type="date" class="date-input" />
              <input formControlName="guests" type="number" min="1" class="guests-input" placeholder="Guests" />
              <button type="submit" class="search-btn">Check Availability</button>
            </form>

            <div class="rooms-grid" *ngIf="rooms().length">
              <div class="room-card" *ngFor="let room of rooms()">
                <img [src]="room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400'" [alt]="room.roomType" />
                <div class="room-info">
                  <div class="room-type">{{ room.roomTypes }}</div>
                  <div class="room-details">
                    <span>🛏️ {{ room.noOfUnits }} rooms</span>
                    <span>👥 Up to {{ room.guestCapacity }} guests</span>
                  </div>
                  <div class="room-price">
                    <span class="price">₹{{ room.pricePerNight | number:'1.0-0' }}</span>
                    <span class="per-night">/night</span>
                  </div>
                  <button class="book-btn" (click)="bookRoom(room)">Book Now</button>
                </div>
              </div>
            </div>
          </div>

          <!-- REVIEWS -->
          <div class="section">
            <h2>Guest Reviews</h2>
            <div class="reviews-list" *ngIf="reviews().length">
              <div class="review-card" *ngFor="let review of reviews()">
                <div class="review-header">
                  <div class="reviewer-avatar">{{ review.guestName?.[0] || 'G' }}</div>
                  <div>
                    <div class="reviewer-name">{{ review.guestName || 'Guest' }}</div>
                    <div class="review-stars">{{ '⭐'.repeat(review.rating) }}</div>
                  </div>
                  <div class="review-date">{{ review.createdAt | date:'mediumDate' }}</div>
                </div>
                <p class="review-text">{{ review.comment }}</p>
                <div class="host-response" *ngIf="review.hostResponse">
                  <strong>Host response:</strong> {{ review.hostResponse }}
                </div>
              </div>
            </div>
            <div class="no-reviews" *ngIf="!reviews().length">No reviews yet. Be the first to review!</div>
          </div>
        </div>

        <!-- STICKY SIDEBAR (mini booking widget) -->
        <aside class="sticky-sidebar">
          <div class="booking-widget">
            <div class="widget-price">
              <span>From ₹{{ hotel()!.startingPrice | number:'1.0-0' }}</span>
              <span class="per-night">/night</span>
            </div>
            <div class="widget-rating">⭐ {{ hotel()!.rating | number:'1.1-1' }}</div>
            <button class="book-widget-btn" (click)="scrollToRooms()">Reserve</button>
            <p class="no-charge">You won't be charged yet</p>
          </div>

          <div class="host-card">
            <div class="host-avatar">🧑‍💼</div>
            <div>
              <div class="host-name">{{ hotel()!.hostName || 'Your Host' }}</div>
              <div class="host-label">Property Host</div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-full">
        <div class="loader"></div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .detail-wrapper { max-width:1120px; margin:0 auto; padding:1.5rem 1.25rem 3.5rem; }
    .topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; gap:1rem; }
    .top-actions { display:flex; align-items:center; gap:.85rem; }
    .brand { font-family:'Fraunces',serif; font-size:1.65rem; font-weight:700; letter-spacing:-0.03em; }
    .back-link { color:var(--muted); font-size:.9rem; font-weight:500; }
    .back-link:hover { color:var(--teal); }
    .gallery { border-radius:24px; overflow:hidden; border:1px solid var(--line); background:#fff; box-shadow:0 18px 50px rgba(20,36,31,.06); }
    .gallery-main img { width:100%; height:420px; object-fit:cover; display:block; }
    .gallery-thumbs { display:flex; gap:.5rem; padding:.75rem; overflow-x:auto; background:rgba(255,255,255,.9); }
    .gallery-thumbs img { width:84px; height:64px; object-fit:cover; border-radius:12px; cursor:pointer; opacity:.7; }
    .gallery-thumbs img.active { opacity:1; outline:2px solid var(--teal); }
    .detail-content { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:1.5rem; margin-top:1.5rem; }
    .hotel-header { display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; margin-bottom:1.25rem; }
    .hotel-type { font-size:.75rem; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); font-weight:600; }
    h1 { font-family:'Fraunces',serif; font-size:clamp(1.8rem,3vw,2.4rem); letter-spacing:-0.03em; margin:.3rem 0 .4rem; }
    .location { color:var(--muted); }
    .rating-pill { background:rgba(11,110,106,.1); color:var(--teal); padding:.4rem .85rem; border-radius:999px; font-weight:700; }
    .section { margin-bottom:1.75rem; padding-bottom:1.75rem; border-bottom:1px solid var(--line); }
    h2 { font-family:'Fraunces',serif; font-size:1.4rem; margin:0 0 1rem; }
    .description { color:var(--muted); line-height:1.65; }
    .amenities-grid { display:flex; flex-wrap:wrap; gap:.5rem; }
    .amenity { background:#fff; border:1px solid var(--line); padding:.4rem .85rem; border-radius:999px; font-size:.82rem; font-weight:600; color:var(--muted); }
    .room-search-bar { display:flex; gap:.7rem; flex-wrap:wrap; margin-bottom:1.25rem; padding:1rem; background:var(--surface); border:1px solid var(--line); border-radius:18px; }
    .date-input, .guests-input { padding:.75rem .9rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--ink); font:inherit; }
    .search-btn, .book-btn, .book-widget-btn { background:var(--teal); color:#fff; border:none; border-radius:14px; font-weight:600; cursor:pointer; font:inherit; }
    .search-btn { padding:.75rem 1.1rem; }
    .search-btn:hover, .book-btn:hover, .book-widget-btn:hover { background:var(--teal-deep); }
    .rooms-grid { display:grid; gap:1rem; }
    .room-card { display:grid; grid-template-columns:190px 1fr; background:var(--surface); border:1px solid var(--line); border-radius:20px; overflow:hidden; }
    .room-card img { width:100%; height:100%; min-height:150px; object-fit:cover; }
    .room-info { padding:1.1rem 1.2rem; }
    .room-type { font-family:'Fraunces',serif; font-size:1.15rem; margin-bottom:.4rem; }
    .room-details { display:flex; gap:1rem; color:var(--muted); font-size:.85rem; margin-bottom:.7rem; }
    .price { font-family:'Fraunces',serif; font-size:1.35rem; color:var(--teal); }
    .per-night { color:var(--muted); font-size:.85rem; }
    .book-btn { padding:.65rem 1.15rem; }
    .reviews-list { display:grid; gap:1rem; }
    .review-card { background:#fff; border:1px solid var(--line); border-radius:18px; padding:1.1rem; }
    .review-header { display:flex; align-items:center; gap:.75rem; margin-bottom:.65rem; }
    .reviewer-avatar { width:40px; height:40px; border-radius:50%; background:rgba(11,110,106,.12); color:var(--teal); display:grid; place-items:center; font-weight:700; }
    .reviewer-name { font-weight:600; }
    .review-date { margin-left:auto; color:var(--muted); font-size:.8rem; }
    .review-text { color:var(--muted); line-height:1.55; margin:0; }
    .host-response { margin-top:.75rem; padding:.75rem; background:rgba(11,110,106,.06); border-radius:12px; font-size:.85rem; color:var(--muted); }
    .no-reviews { color:var(--muted); text-align:center; padding:1.5rem; }
    .sticky-sidebar { position:sticky; top:1.25rem; align-self:start; }
    .booking-widget, .host-card { background:var(--surface); border:1px solid var(--line); border-radius:24px; box-shadow:0 18px 50px rgba(20,36,31,.06); }
    .booking-widget { padding:1.4rem; margin-bottom:1rem; }
    .widget-price { font-family:'Fraunces',serif; font-size:1.55rem; margin-bottom:.25rem; }
    .widget-rating { color:var(--teal); font-weight:700; margin-bottom:1rem; }
    .book-widget-btn { width:100%; padding:.9rem; margin-bottom:.7rem; }
    .no-charge { text-align:center; color:var(--muted); font-size:.8rem; margin:0; }
    .host-card { padding:1.15rem; display:flex; align-items:center; gap:.9rem; }
    .host-avatar { width:48px; height:48px; border-radius:50%; background:rgba(11,110,106,.1); display:grid; place-items:center; font-size:1.4rem; }
    .host-name { font-weight:600; }
    .host-label { color:var(--muted); font-size:.82rem; }
    .loading-full { min-height:80vh; display:grid; place-items:center; }
    .loader { width:42px; height:42px; border:3px solid rgba(11,110,106,.15); border-top-color:var(--teal); border-radius:50%; animation:spin .75s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @media (max-width:900px) {
      .detail-content { grid-template-columns:1fr; }
      .sticky-sidebar { position:static; }
      .room-card { grid-template-columns:1fr; }
      .gallery-main img { height:260px; }
    }
  `]
})
export class HotelDetailComponent implements OnInit {
  hotel = signal<Hotel | null>(null);
  rooms = signal<Room[]>([]);
  reviews = signal<Review[]>([]);
  activePhoto = signal(0);
  roomSearchForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelService: HotelService,
    private roomService: RoomService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.roomSearchForm = this.fb.group({
      checkIn: [today.toISOString().split('T')[0]],
      checkOut: [tomorrow.toISOString().split('T')[0]],
      guests: [2]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.hotelService.getHotelById(id).subscribe({
      next: (res) => this.hotel.set(res.data),
      error: () => { }
    });
    this.loadRooms(id);
    this.loadReviews(id);
  }

  loadRooms(hotelId: string): void {
    this.roomService.getRoomsByHotel(hotelId).subscribe({
      next: (res) => this.rooms.set(res.data || []),
      error: (res) => { console.log(res) }
    });
  }

  searchRooms(): void {
    const { checkIn, checkOut, guests } = this.roomSearchForm.value;
    const id = this.route.snapshot.paramMap.get('id')!;
    this.hotelService.searchAvailableRooms(id, checkIn, checkOut, guests).subscribe({
      next: (res) => {
        this.rooms.set(res.data || [])
      },
      error: () => { }
    });
  }

  loadReviews(hotelId: string): void {
    this.reviewService.getHotelReviews(hotelId).subscribe({
      next: (res) => this.reviews.set(res.data || []),
      error: () => { }
    });
  }

  bookRoom(room: Room): void {
    this.router.navigate(['/bookings/new'], {
      queryParams: {
        roomId: room.id,
        checkIn: this.roomSearchForm.value.checkIn,
        checkOut: this.roomSearchForm.value.checkOut,
        guests: this.roomSearchForm.value.guests
      }
    });
  }

  scrollToRooms(): void {
    document.querySelector('.rooms-grid')?.scrollIntoView({ behavior: 'smooth' });
  }
}
