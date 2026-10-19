import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-write-review',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="page-wrapper">
      <div class="review-container">
        <header class="topbar">
          <a routerLink="/search" class="brand">StayEase</a>
          <div class="top-actions">
            <a routerLink="/bookings/my" class="back-link">My bookings</a>
            <app-logout-button />
          </div>
        </header>
        <p class="eyebrow">After your stay</p>
        <h1>Write a review</h1>
        <p class="subtitle">A few honest notes help the next guest.</p>

        <form [formGroup]="reviewForm" (ngSubmit)="submitReview()" class="review-form">
          <!-- STAR RATING -->
          <div class="rating-group">
            <label>Overall Rating</label>
            <div class="stars">
              <button type="button" class="star" *ngFor="let i of [1,2,3,4,5]"
                [class.filled]="selectedRating() >= i"
                (click)="selectedRating.set(i)"
                (mouseenter)="hoverRating.set(i)"
                (mouseleave)="hoverRating.set(0)">
                {{ (hoverRating() || selectedRating()) >= i ? '⭐' : '☆' }}
              </button>
            </div>
            <span class="rating-label">{{ ratingLabel() }}</span>
          </div>

          <!-- REVIEW CATEGORIES -->
          <div class="review-categories">
            <div class="cat-rating" *ngFor="let cat of categories">
              <span>{{ cat.icon }} {{ cat.label }}</span>
              <div class="cat-stars">
                <button type="button" *ngFor="let i of [1,2,3,4,5]" class="cat-star" [class.filled]="cat.value >= i" (click)="cat.value = i">★</button>
              </div>
            </div>
          </div>

          <!-- COMMENT -->
          <div class="form-group">
            <label>Your Review</label>
            <textarea formControlName="comment" rows="6" class="form-textarea" placeholder="Tell us about your stay — the room, the host, the amenities..."></textarea>
          </div>

          <div class="form-group">
            <label>Upload Photos (optional)</label>
            <div class="upload-area" (click)="photoInput.click()">
              <span>📷 Click to add photos</span>
              <input #photoInput type="file" accept="image/*" multiple hidden (change)="onPhotos($event)" />
            </div>
          </div>

          <div class="error-alert" *ngIf="errorMsg()">{{ errorMsg() }}</div>

          <button type="submit" class="btn-submit" [disabled]="loading() || reviewForm.invalid || !selectedRating()">
            <span *ngIf="!loading()">Submit Review</span>
            <span *ngIf="loading()" class="spinner"></span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .page-wrapper { padding:1.5rem 1.25rem 3.5rem; }
    .review-container { max-width:680px; margin:0 auto; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.75rem; }
    .top-actions { display:flex; align-items:center; gap:.85rem; }
    .brand { font-family:'Fraunces',serif; font-size:1.65rem; font-weight:700; letter-spacing:-0.03em; }
    .back-link { color:var(--muted); font-weight:500; }
    .eyebrow { margin:0 0 .35rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h1 { font-family:'Fraunces',serif; font-size:clamp(2rem,4vw,2.5rem); letter-spacing:-0.03em; margin:0 0 .4rem; }
    .subtitle { color:var(--muted); margin:0 0 1.5rem; }
    .review-form { background:var(--surface); border:1px solid var(--line); border-radius:24px; padding:1.6rem; box-shadow:0 18px 50px rgba(20,36,31,.06); }
    .rating-group { margin-bottom:1.4rem; }
    label { display:block; font-size:.8rem; font-weight:600; color:var(--muted); margin-bottom:.5rem; }
    .stars { display:flex; gap:.25rem; margin-bottom:.35rem; }
    .star { background:none; border:none; font-size:1.7rem; }
    .rating-label { color:var(--teal); font-weight:600; font-size:.9rem; }
    .review-categories { display:grid; grid-template-columns:1fr 1fr; gap:.85rem; margin-bottom:1.25rem; padding:1rem; background:#fff; border:1px solid var(--line); border-radius:16px; }
    .cat-rating { display:flex; justify-content:space-between; align-items:center; gap:.5rem; }
    .cat-rating span { font-size:.84rem; color:var(--muted); }
    .cat-stars { display:flex; gap:1px; }
    .cat-star { background:none; border:none; color:rgba(20,36,31,.2); font-size:1.05rem; }
    .cat-star.filled { color:var(--teal); }
    .form-group { margin-bottom:1.15rem; }
    .form-textarea { width:100%; padding:.85rem .95rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--ink); font:inherit; resize:vertical; }
    .form-textarea:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .upload-area { border:1px dashed rgba(20,36,31,.2); border-radius:14px; padding:1.5rem; text-align:center; color:var(--muted); background:#fff; }
    .upload-area:hover { border-color:var(--teal); color:var(--teal); }
    .error-alert { background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.2); color:var(--coral); padding:.75rem 1rem; border-radius:14px; margin-bottom:1rem; }
    .btn-submit { width:100%; padding:.95rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .btn-submit:hover:not(:disabled) { background:var(--teal-deep); }
    .btn-submit:disabled { opacity:.5; cursor:not-allowed; }
    .spinner { display:inline-block; width:18px; height:18px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @media (max-width:640px) { .review-categories { grid-template-columns:1fr; } }
  `]
})
export class WriteReviewComponent {
  reviewForm: FormGroup;
  selectedRating = signal(0);
  hoverRating = signal(0);
  loading = signal(false);
  errorMsg = signal('');

  categories = [
    { icon: '🛌', label: 'Cleanliness', value: 0 },
    { icon: '📍', label: 'Location', value: 0 },
    { icon: '🏷️', label: 'Value', value: 0 },
    { icon: '✅', label: 'Accuracy', value: 0 }
  ];

  ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  get ratingLabel() {
    return () => this.ratingLabels[this.selectedRating()] || '';
  }

  constructor(private fb: FormBuilder, private reviewService: ReviewService, private route: ActivatedRoute, private router: Router) {
    this.reviewForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  onPhotos(event: Event): void {
    // Photo upload stub
  }

  submitReview(): void {
    if (!this.selectedRating()) return;
    this.loading.set(true);
    const bookingId = this.route.snapshot.queryParams['bookingId'];
    const payload = {
      bookingId,
      rating: this.selectedRating(),
      comment: this.reviewForm.value.comment
    };
    this.reviewService.createReview(payload as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/bookings/my']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to submit review');
      }
    });
  }
}
