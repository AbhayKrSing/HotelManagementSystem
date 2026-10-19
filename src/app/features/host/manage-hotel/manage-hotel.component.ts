import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../core/services/hotel.service';
import { UploadPhotoDTO } from '../../../core/models/hotel.model';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-manage-hotel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoutButtonComponent],
  template: `
    <div class="page-wrapper">
      <div class="page-container">
        <header class="topbar">
          <a routerLink="/search" class="brand">StayEase</a>
          <div class="top-actions">
            <a routerLink="/host" class="back-link">Host dashboard</a>
            <app-logout-button />
          </div>
        </header>
        <p class="eyebrow">{{ isEdit() ? 'Update listing' : 'New listing' }}</p>
        <h1>{{ isEdit() ? 'Edit property' : 'List your property' }}</h1>

        <div class="form-card">
          <form [formGroup]="hotelForm" (ngSubmit)="onSubmit()">
            <!-- BASIC INFO -->
            <div class="form-section">
              <h2>📍 Basic Information</h2>
              <div class="form-row">
                <div class="form-group">
                  <label>Property Name *</label>
                  <input type="text" formControlName="name" class="form-input" placeholder="e.g. The Ocean View Villa" />
                </div>
                <div class="form-group">
                  <label>Property Type *</label>
                  <select formControlName="hotelType" class="form-input">
                    <option value="">Select type</option>
                    <option value="HOTEL">Hotel</option>
                    <option value="VILLA">Villa</option>
                    <option value="RESORT">Resort</option>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="BOUTIQUE">Boutique Hotel</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Description *</label>
                <textarea formControlName="description" rows="4" class="form-input" placeholder="Describe your property..."></textarea>
              </div>
            </div>

            <!-- LOCATION -->
            <div class="form-section">
              <h2>🌍 Location</h2>
              <div class="form-row">
                <div class="form-group">
                  <label>City *</label>
                  <input type="text" formControlName="city" class="form-input" placeholder="Mumbai" />
                </div>
                <div class="form-group">
                  <label>Country *</label>
                  <input type="text" formControlName="country" class="form-input" placeholder="India" />
                </div>
              </div>
              <div class="form-group">
                <label>Full Address</label>
                <input type="text" formControlName="address" class="form-input" placeholder="Street, Area, ZIP" />
              </div>
            </div>

            <!-- PRICING -->
            <div class="form-section">
              <h2>💰 Pricing</h2>
              <div class="form-row">
                <div class="form-group">
                  <label>Starting Price (₹/night) *</label>
                  <input type="number" formControlName="startingPrice" class="form-input" placeholder="2500" min="0" />
                </div>
                <div class="form-group">
                  <label>Commission Rate (%)</label>
                  <input type="number" formControlName="commissionRate" class="form-input" placeholder="15" min="0" max="100" />
                </div>
              </div>
            </div>

            <!-- AMENITIES -->
            <div class="form-section">
              <h2>✨ Amenities</h2>
              <div class="amenities-grid">
                <label class="amenity-check" *ngFor="let a of allAmenities">
                  <input type="checkbox" [checked]="selectedAmenities().has(a)" (change)="toggleAmenity(a)" />
                  <span class="checkmark">{{ amenityIcons[a] || '✓' }} {{ a }}</span>
                </label>
              </div>
            </div>

            <!-- PHOTOS -->
            <div class="form-section">
              <h2>📷 Photos</h2>

              <!-- Existing photos (edit mode only) -->
              <div *ngIf="isEdit() && existingPhotos().length" class="existing-photos-section">
                <p class="section-label">Current photos — click ✕ to remove</p>
                <div class="photo-preview">
                  <div class="photo-thumb" *ngFor="let p of existingPhotos()">
                    <img [src]="p.photoUrl" alt="Hotel photo" />
                    <button type="button" class="delete-btn"
                            (click)="deleteExistingPhoto(p)"
                            [disabled]="deletingPhotoId() === p.id">
                      {{ deletingPhotoId() === p.id ? '…' : '✕' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- Upload area -->
              <div class="upload-area" (click)="photoInput.click()">
                <span>📷 {{ isEdit() ? 'Add more photos' : 'Click to upload photos' }}</span>
                <small>JPG, PNG up to 10MB each</small>
                <input #photoInput type="file" accept="image/*" multiple hidden (change)="onPhotos($event)" />
              </div>

              <!-- Newly selected (not-yet-uploaded) previews -->
              <div *ngIf="newPhotoPreviews().length">
                <p class="section-label" style="margin-top:.75rem">New photos to upload</p>
                <div class="photo-preview">
                  <div class="photo-thumb" *ngFor="let p of newPhotoPreviews(); let i = index">
                    <img [src]="p" alt="Preview" />
                    <button type="button" class="delete-btn" (click)="removeNewPhoto(i)">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="error-alert" *ngIf="errorMsg()">{{ errorMsg() }}</div>

            <div class="form-actions">
              <button type="button" routerLink="/host" class="btn-cancel">Cancel</button>
              <button type="submit" class="btn-submit" [disabled]="loading() || hotelForm.invalid">
                <span *ngIf="!loading()">{{ isEdit() ? 'Save Changes' : 'List Property' }}</span>
                <span *ngIf="loading()" class="spinner"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; min-height:100vh; color:var(--ink); font-family:'Sora',sans-serif; }
    .page-wrapper { padding:1.5rem 1.25rem 3.5rem; }
    .page-container { max-width:820px; margin:0 auto; }
    .topbar { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.5rem; }
    .top-actions { display:flex; align-items:center; gap:.85rem; }
    .brand { font-family:'Fraunces',serif; font-size:1.65rem; font-weight:700; letter-spacing:-0.03em; }
    .back-link { color:var(--muted); font-weight:500; }
    .eyebrow { margin:0 0 .35rem; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--teal); }
    h1 { font-family:'Fraunces',serif; font-size:clamp(1.8rem,4vw,2.4rem); letter-spacing:-0.03em; margin:0 0 1.4rem; }
    h2 { font-family:'Fraunces',serif; font-size:1.2rem; margin:0 0 1rem; }
    .form-card { background:var(--surface); border:1px solid var(--line); border-radius:24px; overflow:hidden; box-shadow:0 18px 50px rgba(20,36,31,.06); }
    .form-section { padding:1.4rem 1.5rem; border-bottom:1px solid var(--line); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; font-size:.8rem; font-weight:600; color:var(--muted); margin-bottom:.4rem; }
    .form-input { width:100%; padding:.8rem .95rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--ink); font:inherit; }
    .form-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    textarea.form-input { resize:vertical; }
    .amenities-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:.6rem; }
    .amenity-check { display:flex; align-items:center; gap:.45rem; }
    .amenity-check input { accent-color:var(--teal); }
    .checkmark { font-size:.85rem; color:var(--muted); }
    .section-label { font-size:.8rem; color:var(--muted); margin:0 0 .55rem; }
    .upload-area { border:1px dashed rgba(20,36,31,.22); border-radius:16px; padding:1.6rem; text-align:center; color:var(--muted); background:#fff; display:flex; flex-direction:column; gap:.35rem; }
    .upload-area:hover { border-color:var(--teal); color:var(--teal); }
    .photo-preview { display:flex; gap:.7rem; flex-wrap:wrap; }
    .photo-thumb { position:relative; }
    .photo-thumb img { width:100px; height:75px; object-fit:cover; border-radius:12px; display:block; }
    .delete-btn { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:var(--coral); color:#fff; border:none; font-size:.7rem; }
    .error-alert { background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.2); color:var(--coral); padding:.75rem 1rem; border-radius:14px; margin:1rem 1.5rem; }
    .form-actions { display:flex; gap:.7rem; padding:1.2rem 1.5rem; justify-content:flex-end; }
    .btn-cancel { padding:.8rem 1.2rem; background:#fff; border:1px solid var(--line); color:var(--ink); border-radius:14px; font:inherit; font-weight:600; }
    .btn-submit { padding:.8rem 1.3rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; min-width:140px; }
    .btn-submit:disabled { opacity:.5; cursor:not-allowed; }
    .spinner { display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    @media (max-width:640px) { .form-row { grid-template-columns:1fr; } }
  `]
})
export class ManageHotelComponent implements OnInit {
  hotelForm: FormGroup;
  isEdit = signal(false);
  loading = signal(false);
  errorMsg = signal('');
  selectedAmenities = signal<Set<string>>(new Set());

  /** Actual File objects selected by user — sent to Cloudinary on submit */
  selectedFiles: File[] = [];
  /** Base64 previews of newly selected (not yet uploaded) files */
  newPhotoPreviews = signal<string[]>([]);

  /** Photos already persisted in the DB — shown in edit mode */
  existingPhotos = signal<UploadPhotoDTO[]>([]);
  /** ID of the photo currently being deleted (shows a spinner on that thumb) */
  deletingPhotoId = signal<string | null>(null);

  allAmenities = ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Parking', 'AC', 'Room Service', 'Beach Access', 'Pet Friendly', 'Airport Shuttle'];
  amenityIcons: Record<string, string> = {
    WiFi: '📶', Pool: '🏊', Gym: '🏋️', Spa: '💆', Restaurant: '🍽️', Bar: '🍹',
    Parking: '🅿️', AC: '❄️', 'Room Service': '🛎️', 'Beach Access': '🏖️', 'Pet Friendly': '🐾', 'Airport Shuttle': '✈️'
  };

  private hotelId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.hotelForm = this.fb.group({
      name: ['', Validators.required],
      hotelType: ['', Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      address: [''],
      startingPrice: ['', Validators.required],
      commissionRate: [15]
    });
  }

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id');
    if (this.hotelId) {
      this.isEdit.set(true);

      // Load hotel details
      this.hotelService.getHotelById(this.hotelId).subscribe({
        next: (res) => {
          const h = res.data;
          this.hotelForm.patchValue(h);
          const amenitiesList = typeof h.amenities === 'string'
            ? h.amenities.split(',')
            : (h.amenities || []);
          this.selectedAmenities.set(new Set(amenitiesList));
        }
      });

      // Load existing photos for the edit view
      this.hotelService.getHotelPhotos(this.hotelId).subscribe({
        next: (res) => this.existingPhotos.set(res.data || []),
        error: () => { /* silently ignore — photos section just stays empty */ }
      });
    }
  }

  toggleAmenity(a: string): void {
    const set = new Set(this.selectedAmenities());
    if (set.has(a)) set.delete(a); else set.add(a);
    this.selectedAmenities.set(set);
  }

  /** Store selected files AND generate local previews */
  onPhotos(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    const newFiles = Array.from(files);
    this.selectedFiles = [...this.selectedFiles, ...newFiles];

    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) =>
        this.newPhotoPreviews.set([...this.newPhotoPreviews(), e.target?.result as string]);
      reader.readAsDataURL(f);
    });

    // Reset so the same file can be picked again
    (event.target as HTMLInputElement).value = '';
  }

  /** Dequeue a not-yet-uploaded file */
  removeNewPhoto(index: number): void {
    this.selectedFiles.splice(index, 1);
    const previews = [...this.newPhotoPreviews()];
    previews.splice(index, 1);
    this.newPhotoPreviews.set(previews);
  }

  /** Delete a persisted photo via the backend API */
  deleteExistingPhoto(photo: UploadPhotoDTO): void {
    if (!this.hotelId || !photo.id) return;
    this.deletingPhotoId.set(photo.id);
    this.hotelService.deleteHotelPhoto(this.hotelId, photo.id).subscribe({
      next: () => {
        this.existingPhotos.set(this.existingPhotos().filter(p => p.id !== photo.id));
        this.deletingPhotoId.set(null);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to delete photo');
        this.deletingPhotoId.set(null);
      }
    });
  }

  onSubmit(): void {
    if (this.hotelForm.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');

    const fv = this.hotelForm.value;
    const payload = {
      name: fv.name,
      hotelType: fv.hotelType,
      description: fv.description,
      city: fv.city,
      country: fv.country,
      address: fv.address,
      startingPrice: fv.startingPrice,
      commissionRate: fv.commissionRate,
      amenities: Array.from(this.selectedAmenities())
    };

    const action$ = this.hotelId
      ? this.hotelService.updateHotel(this.hotelId, payload)
      : this.hotelService.createHotel(payload);

    action$.pipe(
      switchMap((res) => {
        // After hotel is created/updated, upload any newly selected photos
        const savedId = res.data?.id ?? this.hotelId!;
        if (this.selectedFiles.length > 0) {
          return this.hotelService.uploadHotelPhotos(savedId, this.selectedFiles);
        }
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/host']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Failed to save property');
      }
    });
  }
}
