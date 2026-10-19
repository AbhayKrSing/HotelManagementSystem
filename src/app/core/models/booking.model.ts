export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface BookingRoom {
  roomId: string;
  unitsBooked?: number;
  pricePerNight?: number;
}

export interface BookingOccupant {
  fullName?: string;
  name?: string;
  age?: number;
  gender?: string;
  isPrimary?: boolean;
  idProofNumber?: string;
  idProofType?: string;
}

export interface Booking {
  id?: string;
  hotelId: string;
  hotelName?: string;
  guestName?: string;
  roomType?: string;
  roomPhoto?: string;
  userId?: string;
  checkInDate?: string;
  checkIn?: string;
  checkOutDate?: string;
  checkOut?: string;
  guestCount?: number;
  guests?: number;
  totalPrice?: number;
  totalAmount?: number;
  bookingStatus?: BookingStatus;
  status?: BookingStatus | string;
  expiresAt?: string;
  bookingRooms?: BookingRoom[];
  bookingOccupants?: BookingOccupant[];
  createdAt?: string;
  updatedAt?: string;
}
