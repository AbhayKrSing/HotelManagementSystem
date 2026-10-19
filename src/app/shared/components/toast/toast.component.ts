import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toastService.toast() as toast">
      <div class="toast" [ngClass]="toast.type">
        {{ toast.message }}
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    }
    .toast {
      padding: .95rem 1.15rem;
      border-radius: 16px;
      color: var(--ink);
      font-family: 'Sora', sans-serif;
      font-weight: 600;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.94);
      box-shadow: 0 18px 40px rgba(20,36,31,.12);
      animation: slideIn 0.3s ease-out;
    }
    .success { border-color: rgba(11,110,106,.28); color: #085652; }
    .error { border-color: rgba(212,83,60,.3); color: #d4533c; }
    .info { border-color: rgba(11,110,106,.2); color: #14241f; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
