import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { AuthService } from '../../../core/services/auth.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';
import { Hotel } from '../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="page">
    <header class="topbar">
      <a routerLink="/search" class="brand">StayEase</a>
      <nav class="top-links">
        <a routerLink="/bookings/my" *ngIf="auth.isLoggedIn()">My trips</a>
        <a routerLink="/host" *ngIf="auth.hasAnyRole(['HOST'])">Host</a>
        <a routerLink="/admin" *ngIf="auth.hasAnyRole(['ADMIN'])">Admin</a>
        <a routerLink="/login" *ngIf="!auth.isLoggedIn()" class="signin">Sign in</a>
        <app-logout-button />
      </nav>
    </header>

    <section class="hero">
      <p class="eyebrow">Find a stay</p>
      <h1>Places that feel like home</h1>
      <p class="lede">Search cities, dates, and guests. Every listing uses the same calm checkout you already know.</p>

      <div class="search-card">
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
          <div class="search-field">
            <label>Where</label>
            <input formControlName="city" type="text" placeholder="City or region" class="search-input" />
          </div>
          <div class="search-field">
            <label>Check-in</label>
            <input formControlName="checkIn" type="date" class="search-input" />
          </div>
          <div class="search-field">
            <label>Check-out</label>
            <input formControlName="checkOut" type="date" class="search-input" />
          </div>
          <div class="search-field">
            <label>Guests</label>
            <input formControlName="guests" type="number" placeholder="2" min="1" class="search-input" />
          </div>
          <button type="submit" class="search-btn">Search</button>
        </form>
      </div>
    </section>

    <!-- FILTERS -->
    <div class="filters-bar">
      <button class="filter-chip" [class.active]="activeFilter() === cat" *ngFor="let cat of categories" (click)="filterByCategory(cat)">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- HOTEL GRID -->
    <section class="hotels-section">
      <div *ngIf="loading()" class="loading-grid">
        <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
      </div>

      <div *ngIf="!loading() && hotels().length" class="hotels-grid">
        <div class="hotel-card" *ngFor="let hotel of hotels()" [routerLink]="['/hotels', hotel.id]">
          <div class="card-image">
            <img [src]="hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'" [alt]="hotel.name" />
            <button class="wishlist-btn" (click)="toggleWishlist($event, hotel.id)">
              {{ isWishlisted(hotel.id) ? '❤️' : '🤍' }}
            </button>
            <span class="badge" *ngIf="hotel.rating && hotel.rating >= 4.7">⭐ Top Rated</span>
          </div>
          <div class="card-body">
            <div class="card-header-row">
              <h3>{{ hotel.name }}</h3>
              <div class="rating">⭐ {{ hotel.rating | number:'1.1-1' }}</div>
            </div>
            <p class="card-location">📍 {{ hotel.city }}, {{ hotel.country }}</p>
            <p class="card-type">{{ hotel.hotelType }}</p>
            <div class="card-footer">
              <div class="price">
                <span class="price-amount">₹{{ hotel.startingPrice | number:'1.0-0' }}</span>
                <span class="price-label"> / night</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading() && !hotels().length" class="empty-state">
        <h3>No properties found</h3>
        <p>Try another city, dates, or a different stay type.</p>
      </div>
    </section>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .page { max-width:1120px; margin:0 auto; padding:1.5rem 1.25rem 3.5rem; }
    .topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:2.25rem; gap:1rem; }
    .brand { font-family:'Fraunces',serif; font-size:1.65rem; font-weight:700; letter-spacing:-0.03em; color:var(--ink); }
    .top-links { display:flex; align-items:center; gap:1rem; color:var(--muted); font-size:.9rem; font-weight:500; }
    .top-links a:hover { color:var(--teal); }
    .signin { padding:.55rem .95rem; border-radius:999px; background:var(--teal); color:#fff !important; font-weight:600; }
    .hero { max-width:46rem; margin-bottom:1.75rem; }
    .eyebrow { margin:0 0 .4rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h1 { margin:0 0 .55rem; font-family:'Fraunces',serif; font-size:clamp(2rem,4vw,3rem); font-weight:700; letter-spacing:-0.03em; line-height:1.1; }
    .lede { margin:0 0 1.5rem; color:var(--muted); line-height:1.55; }
    .search-card { background:var(--surface); border:1px solid var(--line); border-radius:24px; padding:1rem; backdrop-filter:blur(14px); box-shadow:0 18px 50px rgba(20,36,31,.06); }
    .search-form { display:grid; grid-template-columns:1.6fr 1fr 1fr .7fr auto; gap:.75rem; align-items:end; }
    .search-field { display:flex; flex-direction:column; gap:.35rem; }
    .search-field label { font-size:.75rem; font-weight:600; color:var(--muted); }
    .search-input { width:100%; padding:.8rem .95rem; border:1px solid var(--line); border-radius:14px; background:#fff; color:var(--ink); font:inherit; font-size:.92rem; }
    .search-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .search-btn { padding:.85rem 1.35rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font-weight:600; font:inherit; }
    .search-btn:hover { background:var(--teal-deep); transform:translateY(-1px); }
    .filters-bar { display:flex; gap:.55rem; padding:1.35rem 0; overflow-x:auto; }
    .filter-chip { padding:.45rem .9rem; background:#fff; border:1px solid var(--line); border-radius:999px; color:var(--muted); font-size:.82rem; font-weight:600; white-space:nowrap; }
    .filter-chip.active, .filter-chip:hover { border-color:rgba(11,110,106,.35); color:var(--teal); background:rgba(11,110,106,.08); }
    .hotels-section { padding:.5rem 0 2rem; }
    .hotels-grid, .loading-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; }
    .hotel-card { background:var(--surface); border:1px solid var(--line); border-radius:24px; overflow:hidden; cursor:pointer; box-shadow:0 18px 50px rgba(20,36,31,.05); transition:transform .25s ease; }
    .hotel-card:hover { transform:translateY(-4px); }
    .card-image { position:relative; height:210px; overflow:hidden; }
    .card-image img { width:100%; height:100%; object-fit:cover; transition:transform .5s ease; }
    .hotel-card:hover .card-image img { transform:scale(1.05); }
    .wishlist-btn { position:absolute; top:.75rem; right:.75rem; background:rgba(255,255,255,.9); border:none; border-radius:50%; width:36px; height:36px; font-size:1rem; }
    .badge { position:absolute; bottom:.75rem; left:.75rem; background:rgba(11,110,106,.92); color:#fff; padding:.25rem .7rem; border-radius:999px; font-size:.72rem; font-weight:600; }
    .card-body { padding:1.15rem 1.2rem 1.3rem; }
    .card-header-row { display:flex; justify-content:space-between; gap:.75rem; align-items:flex-start; }
    .card-header-row h3 { margin:0; font-family:'Fraunces',serif; font-size:1.2rem; letter-spacing:-0.02em; }
    .rating { color:var(--teal); font-weight:700; font-size:.88rem; white-space:nowrap; }
    .card-location, .card-type { color:var(--muted); font-size:.85rem; margin:.3rem 0 0; }
    .card-type { font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:var(--teal); }
    .card-footer { margin-top:.9rem; padding-top:.85rem; border-top:1px solid var(--line); }
    .price-amount { font-family:'Fraunces',serif; font-size:1.3rem; color:var(--teal); }
    .price-label { color:var(--muted); font-size:.85rem; }
    .skeleton-card { height:340px; border-radius:24px; background:linear-gradient(90deg,rgba(20,36,31,.04) 25%,rgba(20,36,31,.08) 50%,rgba(20,36,31,.04) 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    .empty-state { text-align:center; padding:4rem 1rem; }
    .empty-state h3 { font-family:'Fraunces',serif; font-size:1.5rem; margin:0 0 .4rem; }
    .empty-state p { color:var(--muted); }
    @media (max-width:900px) { .search-form { grid-template-columns:1fr 1fr; } .search-btn { grid-column:1 / -1; } }
    @media (max-width:640px) { .search-form { grid-template-columns:1fr; } .top-links { gap:.7rem; font-size:.82rem; } }
  `]
})
export class HotelSearchComponent implements OnInit {
  searchForm: FormGroup;
  hotels = signal<Hotel[]>([]);
  loading = signal(true);
  activeFilter = signal<any>(null);
  wishlist = signal<Set<string>>(new Set());

  categories = [
    { icon: '🏠', label: 'All', type: null },
    { icon: '🏖️', label: 'Beach', type: 'BEACH' },
    { icon: '🏔️', label: 'Mountain', type: 'MOUNTAIN' },
    { icon: '🏙️', label: 'City', type: 'CITY' },
    { icon: '🛕', label: 'Heritage', type: 'HERITAGE' },
    { icon: '🌿', label: 'Nature', type: 'NATURE' },
    { icon: '💎', label: 'Luxury', type: 'LUXURY' },
  ];

  constructor(private fb: FormBuilder, private hotelService: HotelService, public auth: AuthService) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    this.searchForm = this.fb.group({
      city: [''],
      checkIn: [today.toISOString().split('T')[0]],
      checkOut: [tomorrow.toISOString().split('T')[0]],
      guests: [2]
    });
  }

  ngOnInit(): void {
    this.loadHotels();
  }

  loadHotels(): void {
    this.loading.set(true);
    this.hotelService.getAllHotels().subscribe({
      next: (res) => {
        this.hotels.set(res.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.hotels.set([]);
      }
    });
  }

  onSearch(): void {
    const { city, checkIn, checkOut, guests } = this.searchForm.value;
    this.loading.set(true);
    this.hotelService.searchAvailableHotels(city, checkIn, checkOut, guests).subscribe({
      next: (res) => {
        this.hotels.set(res.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByCategory(cat: any): void {
    this.activeFilter.set(cat);
    if (!cat.type) {
      this.loadHotels();
    } else {
      this.loading.set(true);
      this.hotelService.getAllHotels().subscribe({
        next: (res) => {
          this.hotels.set((res.data || []).filter((h: Hotel) => h.hotelType === cat.type));
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  toggleWishlist(e: Event, id?: string): void {
    if (!id) return;
    e.stopPropagation();
    const current = new Set(this.wishlist());
    if (current.has(id)) current.delete(id);
    else current.add(id);
    this.wishlist.set(current);
  }

  isWishlisted(id?: string): boolean {
    return id ? this.wishlist().has(id) : false;
  }

}
