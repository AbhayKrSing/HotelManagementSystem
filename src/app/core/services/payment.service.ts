import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { PaymentDTO, RazorpayOrderDTO } from '../models/payment.model';

declare var Razorpay: any;

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createRazorpayOrder(bookingId: string): Observable<ApiResponse<RazorpayOrderDTO>> {
    return this.http.post<ApiResponse<RazorpayOrderDTO>>(`${this.apiUrl}/create-order/${bookingId}`, {});
  }

  verifyPayment(payment: PaymentDTO): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/verify`, payment);
  }

  processPayment(payment: PaymentDTO): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(this.apiUrl, payment);
  }

  refundPayment(id: string): Observable<ApiResponse<PaymentDTO>> {
    return this.http.post<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${id}/refund`, {});
  }

  getPayment(id: string): Observable<ApiResponse<PaymentDTO>> {
    return this.http.get<ApiResponse<PaymentDTO>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Initiates Razorpay payment flow:
   * 1. Creates a Razorpay order on backend
   * 2. Opens the Razorpay checkout modal
   * 3. Verifies payment signature with backend
   * Returns an Observable that resolves after successful verification.
   */
  initiatePayment(bookingId: string, options: { amount: number }): Observable<ApiResponse<PaymentDTO>> {
    return new Observable(observer => {
      this.createRazorpayOrder(bookingId).subscribe({
        next: (res) => {
          const order = res.data;
          const rzpOptions = {
            key: environment.razorpayKeyId,
            amount: order.amount,
            currency: order.currency || 'INR',
            order_id: order.orderId,
            name: 'StayEase',
            description: 'Hotel Booking Payment',
            theme: { color: '#0b6e6a' },
            handler: (response: any) => {
              const paymentDTO: PaymentDTO = {
                bookingId: bookingId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                amount: order.amount
              };
              this.verifyPayment(paymentDTO).subscribe({
                next: (verifyRes) => { observer.next(verifyRes); observer.complete(); },
                error: (err) => observer.error(err)
              });
            },
            modal: {
              ondismiss: () => observer.error({ message: 'Payment cancelled by user' })
            }
          };
          // Load Razorpay SDK if not present then open modal
          if (typeof Razorpay !== 'undefined') {
            const rzp = new Razorpay(rzpOptions);
            rzp.open();
          } else {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
              const rzp = new Razorpay(rzpOptions);
              rzp.open();
            };
            script.onerror = () => observer.error({ message: 'Failed to load Razorpay SDK' });
            document.body.appendChild(script);
          }
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
