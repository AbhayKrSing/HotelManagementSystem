import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Hotel, UploadPhotoDTO } from '../models/hotel.model';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private apiUrl = `${environment.apiUrl}/hotels`;

  constructor(private http: HttpClient) {}

  /** Get all active hotels (no filter) */
  getAllHotels(): Observable<ApiResponse<Hotel[]>> {
    return this.http.get<ApiResponse<Hotel[]>>(this.apiUrl);
  }

  /** Search hotels by city/keyword/guestCount */
  searchHotels(city?: string, keyword?: string, guestCount?: number): Observable<ApiResponse<Hotel[]>> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (keyword) params = params.set('keyword', keyword);
    if (guestCount) params = params.set('guestCount', guestCount.toString());
    return this.http.get<ApiResponse<Hotel[]>>(`${this.apiUrl}/search`, { params });
  }

  /** Search available hotels for given dates and guest count */
  searchAvailableHotels(city: string, checkIn: string, checkOut: string, guestCount: number): Observable<ApiResponse<Hotel[]>> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (checkIn) params = params.set('checkIn', checkIn);
    if (checkOut) params = params.set('checkOut', checkOut);
    if (guestCount) params = params.set('guestCount', guestCount.toString());
    return this.http.get<ApiResponse<Hotel[]>>(`${this.apiUrl}/search`, { params });
  }

  getHotelById(id: string): Observable<ApiResponse<Hotel>> {
    return this.http.get<ApiResponse<Hotel>>(`${this.apiUrl}/${id}`);
  }

  getHotelRooms(hotelId: string): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/${hotelId}/rooms`);
  }

  getAvailableRooms(hotelId: string, checkIn: string, checkOut: string, guestCount: number = 1): Observable<ApiResponse<Room[]>> {
    const params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut)
      .set('guestCount', guestCount.toString());
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/${hotelId}/available-rooms`, { params });
  }

  /** Search available rooms for a specific hotel */
  searchAvailableRooms(hotelId: string, checkIn: string, checkOut: string, guestCount: number = 1): Observable<ApiResponse<Room[]>> {
    const params = new HttpParams()
      .set('checkIn', checkIn)
      .set('checkOut', checkOut)
      .set('guestCount', guestCount.toString());
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/${hotelId}/available-rooms`, { params });
  }

  createHotel(hotel: Partial<Hotel>): Observable<ApiResponse<Hotel>> {
    return this.http.post<ApiResponse<Hotel>>(this.apiUrl, hotel);
  }

  updateHotel(id: string, hotel: Partial<Hotel>): Observable<ApiResponse<Hotel>> {
    return this.http.put<ApiResponse<Hotel>>(`${this.apiUrl}/${id}`, hotel);
  }

  getMyHotels(): Observable<ApiResponse<Hotel[]>> {
    return this.http.get<ApiResponse<Hotel[]>>(`${this.apiUrl}/my-hotels`);
  }

  uploadHotelPhotos(hotelId: string, files: File[]): Observable<ApiResponse<UploadPhotoDTO[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<ApiResponse<UploadPhotoDTO[]>>(`${this.apiUrl}/${hotelId}/photos`, formData);
  }

  getHotelPhotos(hotelId: string): Observable<ApiResponse<UploadPhotoDTO[]>> {
    return this.http.get<ApiResponse<UploadPhotoDTO[]>>(`${this.apiUrl}/${hotelId}/photos`);
  }

  deleteHotelPhoto(hotelId: string, photoId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${hotelId}/photos/${photoId}`);
  }
}
