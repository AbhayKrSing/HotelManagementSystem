import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Inventory } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getRoomInventory(roomId: string, start: string, end: string): Observable<ApiResponse<Inventory[]>> {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http.get<ApiResponse<Inventory[]>>(`${this.apiUrl}/${roomId}`, { params });
  }

  blockInventory(roomId: string, start: string, end: string): Observable<ApiResponse<void>> {
    const params = new HttpParams().set('roomId', roomId).set('start', start).set('end', end);
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/block`, {}, { params });
  }

  setSeasonalPrice(roomId: string, start: string, end: string, price: number): Observable<ApiResponse<void>> {
    const params = new HttpParams()
      .set('roomId', roomId)
      .set('start', start)
      .set('end', end)
      .set('price', price.toString());
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/price`, {}, { params });
  }
}
