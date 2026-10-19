import { Room } from './room.model';

export type HotelStatus = 'ACTIVE' | 'INACTIVE';

export interface Hotel {
  id?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  phoneNumber?: string;
  status?: HotelStatus;
  cancellationPolicy?: string;
  checkInTime?: string;
  checkOutTime?: string;
  starRating?: number;
  rating?: number;
  hotelType?: string;
  startingPrice?: number;
  commissionRate?: number;
  isVerified?: boolean;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
  hostId?: string;
  hostName?: string;
  hostEmail?: string;
  mainPhotoUrl?: string;
  photos?: string[];
  amenities?: string[] | any;
  createdAt?: string;
  updatedAt?: string;
  rooms?: Room[];
}

export interface UploadPhotoDTO {
  id?: string;
  hotelId?: string;
  roomId?: string;
  photoUrl: string;
}

export const HOTEL_PLACEHOLDER =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200';
