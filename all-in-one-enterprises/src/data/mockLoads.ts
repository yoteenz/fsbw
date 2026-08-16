import type { AioLoadPreview } from '../types';

export const mockActiveLoad: AioLoadPreview = {
  id: 'LD-2847',
  origin: 'Atlanta, GA',
  destination: 'Dallas, TX',
  pickup: 'Mar 12, 2026 · 08:00',
  delivery: 'Mar 14, 2026 · 14:00',
  rate: '$2.06/mi',
  mileage: '781 mi',
  status: 'In Transit',
};

/** Delivered load — used for load-to-factoring integration preview. */
export const mockDeliveredLoad: AioLoadPreview = {
  id: 'LD-2047',
  origin: 'Chicago, IL',
  destination: 'Nashville, TN',
  pickup: 'Mar 08, 2026 · 06:00',
  delivery: 'Mar 10, 2026 · 16:30',
  rate: '$2.14/mi',
  mileage: '472 mi',
  status: 'Delivered',
  delivered: true,
  invoiceAmount: 3100,
};

export const mockBrokerageQuoteFields = [
  { id: 'origin', label: 'Origin', placeholder: 'City, State' },
  { id: 'destination', label: 'Destination', placeholder: 'City, State' },
  { id: 'equipment', label: 'Equipment Type', placeholder: 'Dry Van, Reefer…' },
  { id: 'weight', label: 'Weight', placeholder: '42,000 lbs' },
  { id: 'pickup', label: 'Pickup Date', placeholder: 'MM/DD/YYYY' },
  { id: 'delivery', label: 'Delivery Date', placeholder: 'MM/DD/YYYY' },
];

export const mockShipperTimeline = [
  { id: 'booked', label: 'Booked', complete: true },
  { id: 'picked', label: 'Picked Up', complete: true },
  { id: 'transit', label: 'In Transit', complete: true, current: true },
  { id: 'delivered', label: 'Delivered', complete: false },
];

export const mockShipperLoadNumber = 'SHP-9184';
