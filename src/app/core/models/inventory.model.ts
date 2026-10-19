export interface Inventory {
  id?: string;
  roomId: string;
  date: string;
  availableUnits: number;
  pricePerNight: number;
  isClosed?: boolean;
}
