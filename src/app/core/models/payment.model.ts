export interface RazorpayOrderDTO {
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
}

export interface PaymentDTO {
  id?: string;
  bookingId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount?: number;
  paymentStatus?: string;
}
