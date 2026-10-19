import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { Room } from '../../../core/models/room.model';
import { LogoutButtonComponent } from '../../../shared/components/logout-button/logout-button.component';

@Component({
  selector: 'app-manage-rooms',
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
        <p class="eyebrow">Inventory</p>
        <h1>Manage rooms</h1>

        <!-- ROOM LIST -->
        <div class="rooms-list" *ngIf="rooms().length">
          <div class="room-row" *ngFor="let room of rooms()">
            <img [src]="room.photos?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=200'" [alt]="room.roomTypes" />
            <div class="room-details">
              <h3>{{ room.roomTypes }}</h3>
              <div class="room-meta">
                <span>🛏️ {{ room.noOfUnits }} rooms</span>
                <span>👥 {{ room.guestCapacity }} max guests</span>
                <span>₹{{ room.pricePerNight | number:'1.0-0' }}/night</span>
              </div>
            </div>
            <div class="room-actions">
              <button class="btn-sm" (click)="editRoom(room)">Edit</button>
              <button class="btn-sm danger" (click)="deleteRoom(room.id)">Delete</button>
            </div>
          </div>
        </div>

        <!-- ADD ROOM FORM -->
        <div class="add-room-card">
          <h2>{{ editingRoom() ? 'Edit Room' : 'Add New Room Type' }}</h2>
          <form [formGroup]="roomForm" (ngSubmit)="saveRoom()">
            <div class="form-row">
              <div class="form-group">
                <label>Room Type</label>
                <select formControlName="roomType" class="form-input">
                  <option value="">Select</option>
                  <option value="STANDARD">Standard</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="SUITE">Suite</option>
                  <option value="PRESIDENTIAL">Presidential Suite</option>
                  <option value="FAMILY">Family Room</option>
                  <option value="DORMITORY">Dormitory</option>
                </select>
              </div>
              <div class="form-group">
                <label>Number of Rooms</label>
                <input type="number" formControlName="totalCount" class="form-input" placeholder="10" min="1" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Max Capacity (guests)</label>
                <input type="number" formControlName="capacity" class="form-input" placeholder="2" min="1" />
              </div>
              <div class="form-group">
                <label>Base Price (₹/night)</label>
                <input type="number" formControlName="price" class="form-input" placeholder="3500" min="0" />
              </div>
            </div>
            <div class="form-group">
              <label>Room Amenities</label>
              <div class="amenities-inline">
                <label *ngFor="let a of roomAmenities" class="check-label">
                  <input type="checkbox" [checked]="selectedRoomAmenities().has(a)" (change)="toggleRoomAmenity(a)" />
                  {{ a }}
                </label>
              </div>
            </div>
            <div class="error-alert" *ngIf="errorMsg()">{{ errorMsg() }}</div>
            <div class="form-actions">
              <button type="button" *ngIf="editingRoom()" class="btn-cancel" (click)="cancelEdit()">Cancel</button>
              <button type="submit" class="btn-submit" [disabled]="loading() || roomForm.invalid">
                {{ editingRoom() ? 'Update Room' : 'Add Room' }}
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
    h2 { font-family:'Fraunces',serif; font-size:1.25rem; margin:0 0 1.1rem; }
    .rooms-list { display:grid; gap:.75rem; margin-bottom:1.25rem; }
    .room-row { display:flex; align-items:center; gap:1rem; background:var(--surface); border:1px solid var(--line); border-radius:18px; padding:.85rem; }
    .room-row img { width:84px; height:64px; object-fit:cover; border-radius:12px; }
    .room-details { flex:1; }
    .room-details h3 { font-family:'Fraunces',serif; font-size:1.05rem; margin:0 0 .3rem; }
    .room-meta { display:flex; gap:.8rem; flex-wrap:wrap; color:var(--muted); font-size:.82rem; }
    .room-actions { display:flex; gap:.4rem; }
    .btn-sm { padding:.35rem .7rem; background:#fff; border:1px solid var(--line); color:var(--ink); border-radius:10px; font:inherit; font-size:.78rem; font-weight:600; }
    .btn-sm.danger { border-color:rgba(212,83,60,.3); color:var(--coral); background:rgba(212,83,60,.06); }
    .add-room-card { background:var(--surface); border:1px solid var(--line); border-radius:24px; padding:1.4rem; box-shadow:0 18px 50px rgba(20,36,31,.05); }
    .form-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .form-group { margin-bottom:1rem; }
    label { display:block; font-size:.8rem; font-weight:600; color:var(--muted); margin-bottom:.4rem; }
    .form-input { width:100%; padding:.8rem .95rem; background:#fff; border:1px solid var(--line); border-radius:14px; color:var(--ink); font:inherit; }
    .form-input:focus { outline:none; border-color:rgba(11,110,106,.55); box-shadow:0 0 0 4px rgba(11,110,106,.12); }
    .amenities-inline { display:flex; flex-wrap:wrap; gap:.7rem; }
    .check-label { display:flex; align-items:center; gap:.4rem; font-size:.85rem; color:var(--muted); }
    .check-label input { accent-color:var(--teal); }
    .error-alert { background:rgba(212,83,60,.08); border:1px solid rgba(212,83,60,.2); color:var(--coral); padding:.75rem 1rem; border-radius:14px; margin-bottom:1rem; }
    .form-actions { display:flex; gap:.7rem; justify-content:flex-end; }
    .btn-cancel { padding:.75rem 1.1rem; background:#fff; border:1px solid var(--line); border-radius:14px; font:inherit; font-weight:600; }
    .btn-submit { padding:.75rem 1.2rem; background:var(--teal); color:#fff; border:none; border-radius:14px; font:inherit; font-weight:600; }
    .btn-submit:disabled { opacity:.5; cursor:not-allowed; }
    @media (max-width:640px) { .form-row, .room-row { grid-template-columns:1fr; } .room-row { flex-wrap:wrap; } }
  `]
})
export class ManageRoomsComponent implements OnInit {
  roomForm: FormGroup;
  rooms = signal<Room[]>([]);
  editingRoom = signal<Room | null>(null);
  selectedRoomAmenities = signal<Set<string>>(new Set());
  loading = signal(false);
  errorMsg = signal('');
  hotelId = '';

  roomAmenities = ['AC', 'TV', 'Mini Bar', 'Balcony', 'Ocean View', 'Bathtub', 'WiFi', 'Safe'];

  constructor(private fb: FormBuilder, private roomService: RoomService, private route: ActivatedRoute, private router: Router) {
    this.roomForm = this.fb.group({
      roomType: ['', Validators.required],
      totalCount: ['', Validators.required],
      capacity: ['', Validators.required],
      price: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('hotelId') || '';
    if (this.hotelId) {
      this.roomService.getRoomsByHotel(this.hotelId).subscribe({
        next: (res) => this.rooms.set(res.data || [])
      });
    }
  }

  toggleRoomAmenity(a: string): void {
    const set = new Set(this.selectedRoomAmenities());
    if (set.has(a)) set.delete(a); else set.add(a);
    this.selectedRoomAmenities.set(set);
  }

  editRoom(room: Room): void {
    this.editingRoom.set(room);
    this.roomForm.patchValue({
      roomType: room.roomTypes || room.roomType || '',
      totalCount: room.noOfUnits || room.totalCount || '',
      capacity: room.guestCapacity || room.capacity || '',
      price: room.pricePerNight || room.price || ''
    });
    this.selectedRoomAmenities.set(new Set(room.amenities || []));
  }

  cancelEdit(): void {
    this.editingRoom.set(null);
    this.roomForm.reset();
    this.selectedRoomAmenities.set(new Set());
  }

  saveRoom(): void {
    if (this.roomForm.invalid) return;
    this.loading.set(true);
    const fv = this.roomForm.value;
    const payload = {
      roomTypes: fv.roomType,
      noOfUnits: fv.totalCount,
      guestCapacity: fv.capacity,
      pricePerNight: fv.price,
      amenities: Array.from(this.selectedRoomAmenities())
    };
    const editRoom = this.editingRoom();
    const action = editRoom
      ? this.roomService.updateRoom(editRoom.id!, payload)
      : this.roomService.createRoom(this.hotelId, payload);
    action.subscribe({
      next: (res) => {
        this.loading.set(false);
        const r = res.data;
        if (this.editingRoom()) {
          this.rooms.set(this.rooms().map(x => x.id === r.id ? r : x));
        } else {
          this.rooms.set([...this.rooms(), r]);
        }
        this.cancelEdit();
      },
      error: (err) => { this.loading.set(false); this.errorMsg.set(err.error?.message || 'Failed to save room'); }
    });
  }

  deleteRoom(id?: string): void {
    if (!id) return;
    this.roomService.deleteRoom(id).subscribe({
      next: () => this.rooms.set(this.rooms().filter(r => r.id !== id))
    });
  }
}
