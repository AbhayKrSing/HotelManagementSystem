import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createReview(review: Review): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${this.apiUrl}/reviews`, review);
  }

  getHotelReviews(hotelId: string): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.apiUrl}/hotels/${hotelId}/reviews`);
  }

  addHostResponse(reviewId: string, response: string): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(
      `${this.apiUrl}/reviews/${reviewId}/response`,
      { response }
    );
  }
}
