import { StoreBranch, DeliveryZone } from './types.ts';

export const STORE_BRANCHES: StoreBranch[] = [
  {
    id: 'branch_moniya',
    name: 'QuickCart Supermarket — Moniya Flagship (Ibadan)',
    city: 'Ibadan',
    area: 'Moniya',
    address: 'Plot 12, Oyo-Ibadan Expressway, Moniya Central (Opposite Train Station Road), Moniya, Ibadan, Oyo State',
    phone: '+234 802 345 6789',
    operatingHours: '7:30 AM – 9:30 PM (Mon–Sun)',
  },
  {
    id: 'branch_ojoo',
    name: 'QuickCart Express — Ojoo / Shasha',
    city: 'Ibadan',
    area: 'Ojoo',
    address: 'Ojoo Interchange Commercial Hub, Near Shasha Junction, Ibadan',
    phone: '+234 803 456 7890',
    operatingHours: '8:00 AM – 9:00 PM (Mon–Sun)',
  },
  {
    id: 'branch_ui',
    name: 'QuickCart Mart — UI / Agbowo',
    city: 'Ibadan',
    area: 'Agbowo',
    address: 'Commercial Strip, Opposite University of Ibadan Main Gate, Agbowo, Ibadan',
    phone: '+234 805 567 8901',
    operatingHours: '8:00 AM – 10:00 PM (Mon–Sun)',
  },
  {
    id: 'branch_bodija',
    name: 'QuickCart Outlet — Bodija',
    city: 'Ibadan',
    area: 'Bodija',
    address: '45 Osuntokun Avenue, Old Bodija, Ibadan',
    phone: '+234 807 678 9012',
    operatingHours: '8:00 AM – 9:30 PM (Mon–Sun)',
  },
  {
    id: 'branch_dugbe',
    name: 'QuickCart Hub — Dugbe Commercial',
    city: 'Ibadan',
    area: 'Dugbe',
    address: 'Bank Road, Close to Cocoa House, Dugbe Central, Ibadan',
    phone: '+234 809 789 0123',
    operatingHours: '8:00 AM – 8:30 PM (Mon–Sat)',
  },
  {
    id: 'branch_ringroad',
    name: 'QuickCart Mart — Challenge / Ring Road',
    city: 'Ibadan',
    area: 'Ring Road',
    address: 'Near Mobil Roundabout, Ring Road, Challenge, Ibadan',
    phone: '+234 810 890 1234',
    operatingHours: '8:00 AM – 9:30 PM (Mon–Sun)',
  },
];

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone_moniya',
    name: 'Moniya Central, Train Station & Akinyele',
    city: 'Ibadan',
    fee: 400,
    estimatedMinutes: '10 – 20 mins',
  },
  {
    id: 'zone_ojoo',
    name: 'Ojoo, Shasha & Akingbile',
    city: 'Ibadan',
    fee: 500,
    estimatedMinutes: '15 – 25 mins',
  },
  {
    id: 'zone_ui',
    name: 'UI Campus, Agbowo & Sango',
    city: 'Ibadan',
    fee: 700,
    estimatedMinutes: '20 – 30 mins',
  },
  {
    id: 'zone_bodija',
    name: 'Bodija (Old & New Bodija) & Housing',
    city: 'Ibadan',
    fee: 900,
    estimatedMinutes: '25 – 35 mins',
  },
  {
    id: 'zone_samonda',
    name: 'Samonda, The Polytechnic & Eleyele',
    city: 'Ibadan',
    fee: 900,
    estimatedMinutes: '25 – 35 mins',
  },
  {
    id: 'zone_mokola',
    name: 'Mokola, Adamasingba & Sabo',
    city: 'Ibadan',
    fee: 1000,
    estimatedMinutes: '25 – 40 mins',
  },
  {
    id: 'zone_dugbe',
    name: 'Dugbe, Cocoa House, Gbagi & Iwo Road',
    city: 'Ibadan',
    fee: 1200,
    estimatedMinutes: '30 – 45 mins',
  },
  {
    id: 'zone_akobo',
    name: 'Akobo, General Gas & Basorun',
    city: 'Ibadan',
    fee: 1200,
    estimatedMinutes: '30 – 45 mins',
  },
  {
    id: 'zone_ringroad',
    name: 'Ring Road, Challenge, Molete & Oluyole',
    city: 'Ibadan',
    fee: 1400,
    estimatedMinutes: '35 – 50 mins',
  },
  {
    id: 'zone_alata',
    name: 'IITA, Alata & Olorisaoko Axis',
    city: 'Ibadan',
    fee: 800,
    estimatedMinutes: '20 – 35 mins',
  },
  {
    id: 'zone_other_ibadan',
    name: 'Other Ibadan Neighborhoods',
    city: 'Ibadan',
    fee: 1500,
    estimatedMinutes: '40 – 60 mins',
  },
];

/**
 * Reverse geocodes latitude & longitude into a human-readable street address using OpenStreetMap Nominatim
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<{ address: string; area: string; city: string; state: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'QuickCart-Supermarket-App/1.0',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};

    const street = addr.road || addr.pedestrian || addr.suburb || '';
    const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.village || 'Moniya';
    const city = addr.city || addr.town || addr.county || 'Ibadan';
    const state = addr.state || 'Oyo State';

    const fullParts = [street, neighborhood, city, state].filter(Boolean);
    const fullAddress = fullParts.join(', ') || data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

    return {
      address: fullAddress,
      area: neighborhood || street || 'Moniya, Ibadan',
      city,
      state,
    };
  } catch (e) {
    console.warn('Geolocation reverse geocode failed or timed out:', e);
    return null;
  }
}
