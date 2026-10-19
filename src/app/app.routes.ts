import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/search', pathMatch: 'full' },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Hotels (public)
  {
    path: 'search',
    loadComponent: () =>
      import('./features/hotels/hotel-search/hotel-search.component').then(m => m.HotelSearchComponent)
  },
  {
    path: 'hotels/:id',
    loadComponent: () =>
      import('./features/hotels/hotel-detail/hotel-detail.component').then(m => m.HotelDetailComponent)
  },

  // Bookings (guest)
  {
    path: 'bookings/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/booking-form/booking-form.component').then(m => m.BookingFormComponent)
  },
  {
    path: 'bookings/my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent)
  },
  {
    path: 'bookings/success',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bookings/booking-success/booking-success.component').then(m => m.BookingSuccessComponent)
  },

  // Reviews
  {
    path: 'reviews/write',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reviews/write-review/write-review.component').then(m => m.WriteReviewComponent)
  },

  // Host
  {
    path: 'host',
    canActivate: [authGuard, roleGuard(['HOST'])],
    loadComponent: () =>
      import('./features/host/host-dashboard/host-dashboard.component').then(m => m.HostDashboardComponent)
  },
  {
    path: 'host/hotels/new',
    canActivate: [authGuard, roleGuard(['HOST'])],
    loadComponent: () =>
      import('./features/host/manage-hotel/manage-hotel.component').then(m => m.ManageHotelComponent)
  },
  {
    path: 'host/hotels/:id/edit',
    canActivate: [authGuard, roleGuard(['HOST'])],
    loadComponent: () =>
      import('./features/host/manage-hotel/manage-hotel.component').then(m => m.ManageHotelComponent)
  },
  {
    path: 'host/hotels/:hotelId/rooms',
    canActivate: [authGuard, roleGuard(['HOST'])],
    loadComponent: () =>
      import('./features/host/manage-rooms/manage-rooms.component').then(m => m.ManageRoomsComponent)
  },

  // Admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    loadComponent: () =>
      import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },

  // Fallback
  { path: '**', redirectTo: '/search' }
];
