import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-booking-success',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="success-page">
      <div class="ambient" aria-hidden="true"></div>
      <div class="success-shell">
        <header class="topbar">
          <a routerLink="/" class="brand">StayEase</a>
          <app-logout-button />
        </header>

        <div class="success-panel">
          <div class="mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="rgba(11,110,106,0.12)"/>
              <path d="M14 24.5l6.5 6.5L34 17.5" stroke="#0b6e6a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <p class="eyebrow">You’re all set</p>
          <h1>Booking confirmed</h1>
          <p class="subtitle">Payment succeeded and your stay is reserved. A confirmation is ready in your bookings.</p>

          <div class="booking-ref">
            <span class="ref-label">Booking reference</span>
            <span class="ref-id">{{ shortId() }}</span>
          </div>

          <div class="actions">
            <a routerLink="/bookings/my" class="btn-primary">View my bookings</a>
            <a routerLink="/search" class="btn-ghost">Explore more stays</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --ink: #14241f;
      --muted: #5f716a;
      --line: rgba(20, 36, 31, 0.1);
      --teal: #0b6e6a;
      --teal-deep: #085652;
      display: block;
      min-height: 100vh;
      font-family: 'Sora', sans-serif;
      color: var(--ink);
      background: #f3f7f5;
    }

    .success-page {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
    }

    .ambient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(800px 420px at 15% 0%, rgba(11, 110, 106, 0.16), transparent 55%),
        radial-gradient(640px 360px at 90% 20%, rgba(212, 83, 60, 0.08), transparent 50%),
        linear-gradient(180deg, #f7faf8 0%, #eef4f1 100%);
      pointer-events: none;
    }

    .success-shell {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.25rem;
    }

    .topbar {
      position: absolute;
      top: 1.5rem;
      left: 1.5rem;
      right: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      font-family: 'Fraunces', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ink);
      text-decoration: none;
      letter-spacing: -0.03em;
    }

    .success-panel {
      width: min(480px, 100%);
      text-align: center;
      padding: 2.5rem 2rem;
      border-radius: 28px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.86);
      backdrop-filter: blur(14px);
      box-shadow: 0 22px 60px rgba(20, 36, 31, 0.08);
      animation: rise 0.55s ease both;
    }

    .mark {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.35rem;
      animation: pop 0.55s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
    }
    .mark svg { width: 100%; height: 100%; }

    .eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--teal);
    }

    h1 {
      margin: 0 0 0.65rem;
      font-family: 'Fraunces', serif;
      font-size: clamp(1.9rem, 4vw, 2.4rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.15;
    }

    .subtitle {
      margin: 0 0 1.6rem;
      color: var(--muted);
      font-size: 0.98rem;
      line-height: 1.55;
    }

    .booking-ref {
      margin-bottom: 1.75rem;
      padding: 1rem 1.1rem;
      border-radius: 16px;
      background: rgba(11, 110, 106, 0.08);
      border: 1px solid rgba(11, 110, 106, 0.16);
    }
    .ref-label {
      display: block;
      margin-bottom: 0.3rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .ref-id {
      font-family: 'Fraunces', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--teal);
      letter-spacing: 0.04em;
      word-break: break-all;
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .btn-primary,
    .btn-ghost {
      display: block;
      padding: 0.95rem 1.2rem;
      border-radius: 14px;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s ease, background 0.2s ease;
    }
    .btn-primary {
      background: var(--teal);
      color: #fff;
    }
    .btn-primary:hover {
      background: var(--teal-deep);
      transform: translateY(-1px);
    }
    .btn-ghost {
      border: 1px solid var(--line);
      color: var(--ink);
      background: transparent;
    }
    .btn-ghost:hover {
      background: rgba(20, 36, 31, 0.04);
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pop {
      from { opacity: 0; transform: scale(0.7); }
      to { opacity: 1; transform: scale(1); }
    }

    @media (max-width: 640px) {
      .topbar { left: 1.1rem; right: 1.1rem; top: 1.1rem; }
      .brand { font-size: 1.3rem; }
      .success-panel { padding: 2rem 1.35rem; }
    }
  `]
})
export class BookingSuccessComponent implements OnInit {
  bookingId = signal<string | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.bookingId.set(this.route.snapshot.queryParams['id']);
  }

  shortId(): string {
    const id = this.bookingId();
    if (!id) return '—';
    return id.length > 12 ? `#${id.slice(0, 8).toUpperCase()}` : `#${id}`;
  }
}
