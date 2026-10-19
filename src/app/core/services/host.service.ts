import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Booking, BookingStatus } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class HostService {
  private apiUrl = `${environment.apiUrl}/host`;

  constructor(private http: HttpClient) {}

  getHostBookings(): Observable<ApiResponse<Booking[]>> {
    return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/bookings`);
  }

  updateBookingStatus(id: string, status: BookingStatus): Observable<ApiResponse<Booking>> {
    const params = new HttpParams().set('status', status);
    return this.http.put<ApiResponse<Booking>>(`${this.apiUrl}/bookings/${id}/status`, {}, { params });
  }

  getEarnings(): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http.get<ApiResponse<Record<string, unknown>>>(`${this.apiUrl}/earnings`);
  }
}
