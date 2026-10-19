import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/users`);
  }

  setUserStatus(id: string, enabled: boolean): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('enabled', enabled.toString());
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/users/${id}/status`, {}, { params });
  }

  getAllBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/bookings`);
  }

  forceCancelBooking(id: string): Observable<ApiResponse<Booking>> {
    return this.http.put<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${id}/cancel`, {});
  }

  getAnalytics(): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http.get<ApiResponse<Record<string, unknown>>>(`${this.apiUrl}/analytics`);
  }

  updateCommission(rate: number): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('rate', rate.toString());
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/commission`, {}, { params });
  }
}
