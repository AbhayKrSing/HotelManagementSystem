import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Room } from '../models/room.model';
import { UploadPhotoDTO } from '../models/hotel.model';
import { Inventory } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoomsByHotel(hotelId: string): Observable<ApiResponse<Room[]>> {
    return this.http.get<ApiResponse<Room[]>>(`${this.apiUrl}/hotels/${hotelId}/rooms`);
  }

  getRoomById(roomId: string): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`${this.apiUrl}/rooms/${roomId}`);
  }

  createRoom(hotelId: string, room: Partial<Room>): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>(`${this.apiUrl}/hotels/${hotelId}/rooms`, room);
  }

  updateRoom(roomId: string, room: Partial<Room>): Observable<ApiResponse<Room>> {
    return this.http.put<ApiResponse<Room>>(`${this.apiUrl}/rooms/${roomId}`, room);
  }

  deleteRoom(roomId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/rooms/${roomId}`);
  }

  uploadRoomPhotos(roomId: string, files: File[]): Observable<ApiResponse<UploadPhotoDTO[]>> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<ApiResponse<UploadPhotoDTO[]>>(`${this.apiUrl}/rooms/${roomId}/photos`, formData);
  }

  getRoomInventory(roomId: string, start: string, end: string): Observable<ApiResponse<Inventory[]>> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<ApiResponse<Inventory[]>>(`${this.apiUrl}/rooms/${roomId}/inventory`, { params });
  }
}
