import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ToastService } from '../../../core/services/toast.service';
import { RoomService } from '../../../core/services/room.service';
import { Room } from '../../../core/models/room.model';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LogoutButtonComponent,
  ],
  template: `
    <div class="booking-page">
      <div class="ambient" aria-hidden="true"></div>

      <div class="booking-shell">
        <header class="topbar">
          <a routerLink="/" class="brand">StayEase</a>
          <div class="top-actions">
            <a routerLink="/search" class="back-link">Back to search</a>
            <app-logout-button />
          </div>
        </header>

        <div class="intro">
          <p class="eyebrow">Secure checkout</p>
          <h1>Complete your stay</h1>
          <p class="lede">
            A few details, a quick review, then pay within your 15-minute hold.
          </p>
        </div>

        <nav class="steps" aria-label="Booking progress">
          <div
            class="step"
            [class.active]="step() === 1"
            [class.done]="step() > 1"
          >
            <span class="step-num">{{ step() > 1 ? '✓' : '1' }}</span>
            <span class="step-label">Guests</span>
          </div>
          <div class="step-rail" [class.filled]="step() > 1"></div>
          <div
            class="step"
            [class.active]="step() === 2"
            [class.done]="step() > 2"
          >
            <span class="step-num">{{ step() > 2 ? '✓' : '2' }}</span>
            <span class="step-label">Review</span>
          </div>
          <div class="step-rail" [class.filled]="step() > 2"></div>
          <div class="step" [class.active]="step() === 3" [class.done]="false">
            <span class="step-num">3</span>
            <span class="step-label">Payment</span>
          </div>
        </nav>

        <div class="booking-layout">
          <section class="form-panel">
            <div class="panel-inner">
              <!-- STEP 1 -->
              <div *ngIf="step() === 1" class="step-content">
                <h2>Who is staying?</h2>
                <p class="section-copy">
                  Tell us about each guest so check-in is effortless.
                </p>
                <form [formGroup]="guestForm">
                  <div formArrayName="occupants">
                    <div
                      *ngFor="let occ of occupantsControls; let i = index"
                      [formGroupName]="i"
                      class="guest-block"
                    >
                      <div class="guest-block-head">
                        <h3>Guest {{ i + 1 }}</h3>
                        <span *ngIf="i === 0" class="chip">Primary</span>
                      </div>
                      <div class="form-row">
                        <div class="form-group">
                          <label>Full name</label>
                          <input
                            type="text"
                            formControlName="fullName"
                            placeholder="Alex Rivera"
                            class="form-input"
                          />
                          <small
                            class="error"
                            *ngIf="
                              occ.get('fullName')?.invalid &&
                              occ.get('fullName')?.touched
                            "
                          >
                            Full name is required
                          </small>
                        </div>
                        <div class="form-group">
                          <label>Age</label>
                          <input
                            type="number"
                            formControlName="age"
                            placeholder="28"
                            class="form-input"
                          />
                          <small
                            class="error"
                            *ngIf="
                              occ.get('age')?.invalid && occ.get('age')?.touched
                            "
                          >
                            Age is required
                          </small>
                        </div>
                      </div>
                      <div class="form-row">
                        <div class="form-group">
                          <label>ID proof type</label>
                          <select
                            formControlName="idProofType"
                            class="form-input"
                          >
                            <option value="">Select</option>
                            <option value="AADHAAR">Aadhaar</option>
                            <option value="PASSPORT">Passport</option>
                            <option value="DRIVING_LICENSE">
                              Driving License
                            </option>
                            <option value="VOTER_ID">Voter ID</option>
                          </select>
                        </div>

                        <div class="form-group">
                          <label>ID proof number</label>
                          <input
                            type="text"
                            formControlName="idProofNumber"
                            placeholder="XXXX-XXXX-1234"
                            class="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label
                      >Special requests
                      <span class="optional">(optional)</span></label
                    >
                    <textarea
                      formControlName="specialRequests"
                      rows="3"
                      class="form-input"
                      placeholder="Early check-in, quiet room, crib…"
                    ></textarea>
                  </div>
                  <button type="button" class="btn-primary" (click)="goStep(2)">
                    Continue
                  </button>
                </form>
              </div>

              <!-- STEP 2 -->
              <div *ngIf="step() === 2" class="step-content">
                <h2>Review your booking</h2>
                <p class="section-copy">
                  Confirm the details. Your room will be held for 15 minutes
                  after you continue.
                </p>
                <div class="review-list">
                  <div class="review-row">
                    <span>Check-in</span><strong>{{ checkIn }}</strong>
                  </div>
                  <div class="review-row">
                    <span>Check-out</span><strong>{{ checkOut }}</strong>
                  </div>
                  <div class="review-row">
                    <span>Nights</span><strong>{{ nights }}</strong>
                  </div>
                  <div class="review-row">
                    <span>Guests</span><strong>{{ guests }}</strong>
                  </div>
                  <div class="review-row total">
                    <span>Total</span>
                    <strong>₹{{ totalAmount() | number: '1.0-0' }}</strong>
                  </div>
                </div>
                <div class="btn-row">
                  <button type="button" class="btn-ghost" (click)="goStep(1)">
                    Back
                  </button>
                  <button
                    type="button"
                    class="btn-primary"
                    (click)="createBooking()"
                  >
                    Confirm &amp; pay
                  </button>
                </div>
              </div>

              <!-- STEP 3 -->
              <div *ngIf="step() === 3" class="step-content">
                <h2>Secure payment</h2>
                <p class="section-copy">
                  You’ll complete payment in Razorpay’s secure checkout.
                </p>

                <div *ngIf="paymentExpired()" class="expired-panel">
                  <h3>Hold expired</h3>
                  <p>
                    Your 15-minute booking window has ended and the room was
                    released. Start again to reserve availability.
                  </p>
                  <button
                    type="button"
                    class="btn-primary"
                    (click)="restartBooking()"
                  >
                    Start new booking
                  </button>
                </div>

                <div
                  *ngIf="!paymentExpired() && paymentLoading()"
                  class="loading-panel"
                >
                  <div class="loader" aria-hidden="true"></div>
                  <p>Opening secure payment…</p>
                </div>

                <div
                  *ngIf="!paymentExpired() && !paymentLoading() && bookingId()"
                  class="payment-panel"
                >
                  <div class="timer" [class.urgent]="remainingSeconds() <= 60">
                    <span class="timer-label">Room held for</span>
                    <span class="timer-value">{{ countdownLabel() }}</span>
                  </div>

                  <div class="pay-methods" aria-hidden="true">
                    <span class="method active">Card</span>
                    <span class="method">UPI</span>
                    <span class="method">Net banking</span>
                  </div>

                  <p class="secure-note">
                    Payment is processed by Razorpay. We never store your card
                    details.
                  </p>

                  <button
                    type="button"
                    class="btn-pay"
                    [disabled]="paymentExpired()"
                    (click)="processPayment()"
                  >
                    Pay ₹{{ totalAmount() | number: '1.0-0' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <aside class="summary-panel" *ngIf="room()">
            <div class="stay-summary">
              <div class="stay-media">
                <img
                  [src]="
                    room()!.photos?.[0] ||
                    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'
                  "
                  [alt]="room()!.roomType || 'Room'"
                />
              </div>
              <div class="stay-body">
                <p class="stay-kicker">Your stay</p>
                <h3>{{ room()!.roomType || 'Selected room' }}</h3>
                <div class="stay-dates">
                  <div>
                    <span>Check-in</span>
                    <strong>{{ checkIn }}</strong>
                  </div>
                  <div>
                    <span>Check-out</span>
                    <strong>{{ checkOut }}</strong>
                  </div>
                </div>
                <div class="price-lines">
                  <div class="price-line">
                    <span
                      >₹{{
                        room()?.pricePerNight || room()?.price || 0
                          | number: '1.0-0'
                      }}
                      × {{ nights }} nights</span
                    >
                    <span
                      >₹{{
                        (room()?.pricePerNight || room()?.price || 0) * nights
                          | number: '1.0-0'
                      }}</span
                    >
                  </div>
                  <div class="price-line">
                    <span>Service fee</span>
                    <span>₹{{ serviceFee() | number: '1.0-0' }}</span>
                  </div>
                  <div class="price-total">
                    <span>Total</span>
                    <span>₹{{ totalAmount() | number: '1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        --ink: #14241f;
        --muted: #5f716a;
        --line: rgba(20, 36, 31, 0.1);
        --surface: rgba(255, 255, 255, 0.82);
        --teal: #0b6e6a;
        --teal-deep: #085652;
        --sand: #f3f7f5;
        --coral: #d4533c;
        display: block;
        min-height: 100vh;
        font-family: 'Sora', sans-serif;
        color: var(--ink);
        background: var(--sand);
      }

      .booking-page {
        position: relative;
        min-height: 100vh;
        overflow: hidden;
      }

      .ambient {
        position: absolute;
        inset: 0;
        background:
          radial-gradient(
            900px 480px at 8% -10%,
            rgba(11, 110, 106, 0.18),
            transparent 55%
          ),
          radial-gradient(
            700px 420px at 100% 0%,
            rgba(212, 83, 60, 0.1),
            transparent 50%
          ),
          linear-gradient(180deg, #f7faf8 0%, #eef4f1 45%, #f6f1ea 100%);
        pointer-events: none;
      }

      .booking-shell {
        position: relative;
        z-index: 1;
        max-width: 1120px;
        margin: 0 auto;
        padding: 1.5rem 1.25rem 3.5rem;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .top-actions {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .brand {
        font-family: 'Fraunces', serif;
        font-size: 1.65rem;
        font-weight: 700;
        color: var(--ink);
        text-decoration: none;
        letter-spacing: -0.03em;
      }

      .back-link {
        color: var(--muted);
        text-decoration: none;
        font-size: 0.9rem;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      .back-link:hover {
        color: var(--teal);
      }

      .intro {
        margin-bottom: 1.75rem;
        max-width: 36rem;
      }
      .eyebrow {
        margin: 0 0 0.4rem;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--teal);
      }
      h1 {
        margin: 0 0 0.55rem;
        font-family: 'Fraunces', serif;
        font-size: clamp(2rem, 4vw, 2.75rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.1;
        color: var(--ink);
        animation: rise 0.55s ease both;
      }
      .lede {
        margin: 0;
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.55;
        animation: rise 0.65s ease both;
      }

      .steps {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-bottom: 2rem;
        padding: 0.85rem 1rem;
        border: 1px solid var(--line);
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(10px);
      }
      .step {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: var(--muted);
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .step.active {
        color: var(--ink);
        font-weight: 600;
      }
      .step.done {
        color: var(--teal);
      }
      .step-num {
        width: 1.7rem;
        height: 1.7rem;
        border-radius: 50%;
        display: grid;
        place-items: center;
        font-size: 0.75rem;
        font-weight: 700;
        background: rgba(20, 36, 31, 0.06);
        transition:
          background 0.25s ease,
          color 0.25s ease,
          transform 0.25s ease;
      }
      .step.active .step-num {
        background: var(--teal);
        color: #fff;
        transform: scale(1.05);
      }
      .step.done .step-num {
        background: rgba(11, 110, 106, 0.15);
        color: var(--teal);
      }
      .step-rail {
        flex: 1;
        height: 2px;
        background: rgba(20, 36, 31, 0.08);
        border-radius: 2px;
        min-width: 1.5rem;
      }
      .step-rail.filled {
        background: rgba(11, 110, 106, 0.45);
      }

      .booking-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 340px;
        gap: 1.5rem;
        align-items: start;
      }

      .form-panel,
      .stay-summary {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 24px;
        backdrop-filter: blur(14px);
        box-shadow: 0 18px 50px rgba(20, 36, 31, 0.06);
      }

      .panel-inner {
        padding: 1.75rem 1.75rem 2rem;
      }
      .step-content {
        animation: rise 0.4s ease both;
      }

      h2 {
        margin: 0 0 0.4rem;
        font-family: 'Fraunces', serif;
        font-size: 1.55rem;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .section-copy {
        margin: 0 0 1.5rem;
        color: var(--muted);
        font-size: 0.95rem;
        line-height: 1.5;
      }

      .guest-block {
        padding: 1.15rem 0 0.25rem;
        border-top: 1px solid var(--line);
        margin-bottom: 0.5rem;
      }
      .guest-block:first-child {
        border-top: none;
        padding-top: 0;
      }
      .guest-block-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.85rem;
      }
      .guest-block h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }
      .chip {
        font-size: 0.72rem;
        font-weight: 600;
        color: var(--teal);
        background: rgba(11, 110, 106, 0.1);
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.9rem;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.4rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--muted);
      }
      .optional {
        font-weight: 400;
        opacity: 0.8;
      }
      .form-input {
        width: 100%;
        box-sizing: border-box;
        padding: 0.8rem 0.95rem;
        border: 1px solid var(--line);
        border-radius: 14px;
        background: #fff;
        color: var(--ink);
        font: inherit;
        font-size: 0.92rem;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .form-input:focus {
        outline: none;
        border-color: rgba(11, 110, 106, 0.55);
        box-shadow: 0 0 0 4px rgba(11, 110, 106, 0.12);
      }
      textarea.form-input {
        resize: vertical;
        min-height: 96px;
      }
      select.form-input {
        cursor: pointer;
      }

      .btn-primary,
      .btn-pay,
      .btn-ghost {
        border: none;
        border-radius: 14px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        transition:
          transform 0.2s ease,
          background 0.2s ease,
          opacity 0.2s ease;
      }
      .btn-primary {
        width: 100%;
        margin-top: 0.35rem;
        padding: 0.95rem 1.25rem;
        background: var(--teal);
        color: #fff;
      }
      .btn-primary:hover {
        background: var(--teal-deep);
        transform: translateY(-1px);
      }
      .btn-ghost {
        padding: 0.95rem 1.25rem;
        background: transparent;
        border: 1px solid var(--line);
        color: var(--ink);
      }
      .btn-ghost:hover {
        background: rgba(20, 36, 31, 0.04);
      }
      .btn-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }

      .review-list {
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 0.35rem 1.1rem;
        margin-bottom: 1.35rem;
        background: #fff;
      }
      .review-row {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.85rem 0;
        border-bottom: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.92rem;
      }
      .review-row:last-child {
        border-bottom: none;
      }
      .review-row strong {
        color: var(--ink);
        font-weight: 600;
      }
      .review-row.total {
        padding-top: 1rem;
        font-size: 1rem;
      }
      .review-row.total strong {
        font-family: 'Fraunces', serif;
        font-size: 1.35rem;
        color: var(--teal);
      }

      .timer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.95rem 1.1rem;
        margin-bottom: 1.25rem;
        border-radius: 16px;
        background: rgba(11, 110, 106, 0.08);
        border: 1px solid rgba(11, 110, 106, 0.18);
        animation: softIn 0.45s ease both;
      }
      .timer-label {
        color: var(--muted);
        font-size: 0.88rem;
      }
      .timer-value {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        font-size: 1.25rem;
        color: var(--teal);
      }
      .timer.urgent {
        background: rgba(212, 83, 60, 0.08);
        border-color: rgba(212, 83, 60, 0.22);
        animation: pulse 1.2s ease-in-out infinite;
      }
      .timer.urgent .timer-value {
        color: var(--coral);
      }

      .pay-methods {
        display: flex;
        gap: 0.55rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
      }
      .method {
        padding: 0.45rem 0.85rem;
        border-radius: 999px;
        border: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 600;
        background: #fff;
      }
      .method.active {
        border-color: rgba(11, 110, 106, 0.35);
        color: var(--teal);
        background: rgba(11, 110, 106, 0.08);
      }

      .secure-note {
        margin: 0 0 1.15rem;
        color: var(--muted);
        font-size: 0.86rem;
        line-height: 1.45;
      }

      .btn-pay {
        width: 100%;
        padding: 1rem 1.25rem;
        background: var(--ink);
        color: #fff;
        font-size: 1rem;
      }
      .btn-pay:hover:not(:disabled) {
        background: #0d1a16;
        transform: translateY(-1px);
      }
      .btn-pay:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        transform: none;
      }

      .expired-panel,
      .loading-panel {
        text-align: center;
        padding: 1.5rem 0.5rem;
      }
      .expired-panel h3 {
        margin: 0 0 0.5rem;
        font-family: 'Fraunces', serif;
        color: var(--coral);
      }
      .expired-panel p,
      .loading-panel p {
        margin: 0 0 1.25rem;
        color: var(--muted);
        line-height: 1.5;
      }
      .loader {
        width: 42px;
        height: 42px;
        margin: 0 auto 1rem;
        border-radius: 50%;
        border: 3px solid rgba(11, 110, 106, 0.15);
        border-top-color: var(--teal);
        animation: spin 0.75s linear infinite;
      }

      .summary-panel {
        position: sticky;
        top: 1.25rem;
      }
      .stay-summary {
        overflow: hidden;
      }
      .stay-media {
        position: relative;
        height: 210px;
        overflow: hidden;
      }
      .stay-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transform: scale(1.02);
        transition: transform 0.6s ease;
      }
      .stay-summary:hover .stay-media img {
        transform: scale(1.06);
      }
      .stay-body {
        padding: 1.25rem 1.3rem 1.45rem;
      }
      .stay-kicker {
        margin: 0 0 0.25rem;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--teal);
      }
      .stay-body h3 {
        margin: 0 0 1rem;
        font-family: 'Fraunces', serif;
        font-size: 1.35rem;
        letter-spacing: -0.02em;
      }
      .stay-dates {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1.1rem;
        padding-bottom: 1.1rem;
        border-bottom: 1px solid var(--line);
      }
      .stay-dates span {
        display: block;
        font-size: 0.72rem;
        color: var(--muted);
        margin-bottom: 0.2rem;
      }
      .stay-dates strong {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .price-line {
        display: flex;
        justify-content: space-between;
        gap: 0.75rem;
        color: var(--muted);
        font-size: 0.88rem;
        padding: 0.35rem 0;
      }
      .price-total {
        display: flex;
        justify-content: space-between;
        margin-top: 0.55rem;
        padding-top: 0.85rem;
        border-top: 1px solid var(--line);
        font-weight: 700;
        font-size: 1.05rem;
      }

      @keyframes rise {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes softIn {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.01);
        }
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 900px) {
        .booking-layout {
          grid-template-columns: 1fr;
        }
        .summary-panel {
          position: static;
          order: -1;
        }
        .stay-media {
          height: 180px;
        }
        .step-label {
          display: none;
        }
        .steps {
          justify-content: space-between;
        }
      }

      @media (max-width: 640px) {
        .form-row {
          grid-template-columns: 1fr;
        }
        .btn-row {
          grid-template-columns: 1fr;
        }
        .panel-inner {
          padding: 1.35rem;
        }
        .brand {
          font-size: 1.4rem;
        }
      }
    `,
  ],
})
export class BookingFormComponent implements OnInit, OnDestroy {
  guestForm: FormGroup;
  step = signal(1);
  room = signal<Room | null>(null);
  bookingId = signal<string | null>(null);
  paymentLoading = signal(false);
  remainingSeconds = signal(0);
  paymentExpired = signal(false);

  checkIn = '';
  checkOut = '';
  guests = 1;
  nights = 1;

  private expiresAt: Date | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  get occupantsArray(): FormArray {
    return this.guestForm.get('occupants') as FormArray;
  }

  get occupantsControls(): FormGroup[] {
    return this.occupantsArray.controls as FormGroup[];
  }

  serviceFee = signal(0);
  totalAmount = signal(0);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private roomService: RoomService,
    private toastService: ToastService,
  ) {
    this.guestForm = this.fb.group({
      occupants: this.fb.array([]),
      specialRequests: [''],
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.checkIn = params['checkIn'] || '';
    this.checkOut = params['checkOut'] || '';
    this.guests = parseInt(params['guests'] || '1');

    if (this.checkIn && this.checkOut) {
      const d1 = new Date(this.checkIn);
      const d2 = new Date(this.checkOut);
      this.nights = Math.max(
        1,
        Math.ceil((d2.getTime() - d1.getTime()) / 86400000),
      );
    }

    const roomId = params['roomId'];
    if (roomId) {
      this.roomService.getRoomById(roomId).subscribe({
        next: (res) => {
          this.room.set(res.data);
          const roomPrice = res.data?.price || res.data?.pricePerNight || 0;
          this.serviceFee.set(roomPrice * this.nights * 0.15);
          this.totalAmount.set(roomPrice * this.nights + this.serviceFee());
          this.buildOccupants();
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  buildOccupants(): void {
    const arr = this.guestForm.get('occupants') as FormArray;
    arr.clear();

    for (let i = 0; i < this.guests; i++) {
      arr.push(
        this.fb.group({
          fullName: ['', Validators.required],
          age: ['', [Validators.required, Validators.min(1)]],
          idProofType: [''], // e.g. "AADHAAR", "PASSPORT"
          idProofNumber: [''],
          isPrimary: [i === 0], // guest #1 is primary
        }),
      );
    }
  }

  goStep(n: number): void {
    this.step.set(n);
  }

  countdownLabel(): string {
    const total = Math.max(0, this.remainingSeconds());
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  createBooking(): void {
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      this.toastService.show(
        'Please fill all required guest details.',
        'error',
      );
      return;
    }

    const qp = this.route.snapshot.queryParams;
    const room = this.room();
    const hotelId =
      (room as any)?.hotel ??
      (room as any)?.hotelId ??
      (room as any)?.hotel?.id ??
      qp['hotelId'] ?? // fallback: from query params
      null;
    const pricePerNight = room?.pricePerNight ?? room?.price ?? 0;

    const payload = {
      // ---- match BookingDTO field names exactly ----
      hotelId,
      checkInDate: this.toIsoDateTime(this.checkIn),
      checkOutDate: this.toIsoDateTime(this.checkOut),
      totalPrice: this.totalAmount(),
      guestCount: this.guests,
      bookingRooms: [
        {
          roomId: qp['roomId'],
          unitsBooked: 1,
          pricePerNight: pricePerNight,
        },
      ],

      bookingOccupants: this.guestForm.value.occupants.map(
        (o: any, i: number) => ({
          fullName: o.fullName,
          age: o.age,
          isPrimary: i === 0,
          idProofType: o.idProofType || null,
          idProofNumber: o.idProofNumber || null,
        }),
      ),
    };

    console.log('Booking payload:', JSON.stringify(payload, null, 2));

    this.bookingService.createBooking(payload).subscribe({
      next: (res) => {
        this.bookingId.set(res.data?.id || null);
        this.startCountdown(res.data?.expiresAt);
        this.step.set(3);
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.toastService.show('Booking failed. Please try again.', 'error');
      },
    });
  }

  processPayment(): void {
    if (!this.bookingId() || this.paymentExpired()) return;
    this.paymentLoading.set(true);
    this.paymentService
      .initiatePayment(this.bookingId()!, { amount: this.totalAmount() })
      .subscribe({
        next: () => {
          this.paymentLoading.set(false);
          this.clearCountdown();
          this.router.navigate(['/bookings/success'], {
            queryParams: { id: this.bookingId() },
          });
        },
        error: (err) => {
          this.paymentLoading.set(false);
          const message = this.extractErrorMessage(err);
          if (this.isPaymentWindowExpired(message)) {
            this.markPaymentExpired();
            this.toastService.show(
              'Payment window expired. Please start a new booking.',
              'error',
            );
            return;
          }
          this.toastService.show(
            message || 'Payment failed. Please try again.',
            'error',
          );
        },
      });
  }

  restartBooking(): void {
    this.clearCountdown();
    this.bookingId.set(null);
    this.paymentExpired.set(false);
    this.remainingSeconds.set(0);
    this.step.set(2);
  }

  private startCountdown(expiresAt?: string): void {
    this.clearCountdown();
    this.paymentExpired.set(false);

    if (!expiresAt) {
      this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    } else {
      this.expiresAt = new Date(expiresAt);
    }

    this.tickCountdown();
    this.countdownTimer = setInterval(() => this.tickCountdown(), 1000);
  }

  private tickCountdown(): void {
    if (!this.expiresAt) return;
    const remainingMs = this.expiresAt.getTime() - Date.now();
    const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
    this.remainingSeconds.set(seconds);
    if (seconds <= 0) {
      this.markPaymentExpired();
    }
  }

  private markPaymentExpired(): void {
    this.paymentExpired.set(true);
    this.remainingSeconds.set(0);
    this.clearCountdown();
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  private extractErrorMessage(err: any): string {
    return err?.error?.message || err?.message || '';
  }

  private isPaymentWindowExpired(message: string): boolean {
    return (
      typeof message === 'string' &&
      message.toLowerCase().includes('payment window expired')
    );
  }

  private toIsoDateTime(date: string): string {
    // "2025-06-01" -> "2025-06-01T00:00:00"
    if (!date) return '';
    return date.includes('T') ? date : `${date}T00:00:00`;
  }
}
