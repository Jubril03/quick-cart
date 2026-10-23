export type PaymentMethodType = 'pay_on_delivery' | 'bank_transfer' | 'card_pos';

export interface CatalogItem {
  id: string;
  name: string;
  category: 'Grains & Staples' | 'Noodles & Pasta' | 'Cooking & Spices' | 'Breakfast & Dairy' | 'Drinks & Water' | 'Household';
  price: number;
  unit: string;
  aliases: string[];
  imagePlaceholderColor?: string;
  popular?: boolean;
  stockCount?: number;
  marketEquivalents?: string;
  tag?: string;
  sellerName?: string;
  sellerLocation?: string;
}

export interface ParsedItemResult {
  catalogId: string;
  quantity: number;
  matchedName: string;
  originalQuery: string;
  unitPrice: number;
  lineTotal: number;
  note?: string;
}

export interface GemmaVisionMetadata {
  modelName: string;
  architecture: string;
  latencyMs: number;
  tokensProcessed: number;
  confidenceScore: number;
  visionModality: 'multimodal-vision-ocr' | 'text-pidgin-nlp';
  ocrDetectedRegions: number;
}

export interface ParseApiResponse {
  success: boolean;
  transcription?: string;
  cart: { [catalogId: string]: number };
  detectedItems: ParsedItemResult[];
  unmatchedNotes: string[];
  summary: string;
  isAiPowered: boolean;
  gemmaMetadata?: GemmaVisionMetadata;
}

export interface OrderItem {
  catalogId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface StoreBranch {
  id: string;
  name: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  operatingHours: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  fee: number;
  estimatedMinutes: string;
}

export interface OrderLocation {
  type: 'pickup' | 'delivery';
  branchId?: string;
  branchName?: string;
  zoneId?: string;
  area: string;
  address: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  deliveryFee: number;
  estimatedTime: string;
  detectedViaGps?: boolean;
}

export interface CompletedOrder {
  id: string;
  orderNumber: number;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  sourceType: 'photo' | 'text' | 'manual';
  transcription?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  location: OrderLocation;
  status: 'Received' | 'Packing' | 'Ready for Pickup' | 'Delivered';
  notes?: string;
  paymentMethod?: PaymentMethodType;
  deliveryInstructions?: string;
}

