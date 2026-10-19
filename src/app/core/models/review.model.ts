export interface Review {
  id?: string;
  bookingId: string;
  hotelId?: string;
  userId?: string;
  reviewMessage?: string;
  comment?: string;
  rating: number;
  guestName?: string;
  hostResponse?: string;
  createdAt?: string;
}
