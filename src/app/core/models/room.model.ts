export interface Room {
  id?: string;
  hotelId?: string;
  description?: string;
  roomTypes?: string;
  roomType?: string;
  guestCapacity?: number;
  capacity?: number;
  bedType?: string;
  status?: string;
  noOfUnits?: number;
  totalCount?: number;
  pricePerNight?: number;
  price?: number;
  photoUrls?: string[];
  photos?: string[];
  amenities?: string[];
}

export const ROOM_PLACEHOLDER =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
