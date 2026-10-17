import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  ShoppingBag,
  Receipt,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Lock,
  Store,
  FileText,
  AlertCircle,
  Share2,
  Phone,
  User,
  ExternalLink,
  Search,
  MapPin,
  Navigation,
  Clock,
  Truck,
  ArrowRight,
  X,
  Copy,
  Check,
  Filter,
  Bell,
  BellRing
} from 'lucide-react';
import { CATALOG, formatNaira } from './catalogData.ts';
import { SAMPLE_PHOTOS, convertToRasterBase64, SamplePhoto } from './utils/imageHelper.ts';
import { STORE_BRANCHES, DELIVERY_ZONES, reverseGeocodeCoordinates } from './locationData.ts';
import { CatalogItem, CompletedOrder, ParseApiResponse, OrderLocation } from './types.ts';
import { OrderTimeline, OrderStatusPill, OrderStatus } from './components/OrderTimeline.tsx';
import { NotificationToast, AppNotification, playNotificationChime } from './components/NotificationToast.tsx';

const STORAGE_ORDERS_KEY = 'quickcart_orders_v4';
const STORAGE_CART_KEY = 'quickcart_active_cart_v4';
const STORAGE_NOTIFICATIONS_KEY = 'quickcart_notifications_v1';

// Sample initial seed orders in Moniya & Ibadan to showcase the visual timeline in all stages
const INITIAL_SEED_ORDERS: CompletedOrder[] = [
  {
    id: 'ORD-104',
    orderNumber: 104,
    createdAt: 'Today, 11:42 AM',
    customerName: 'Amina Bello',
    customerPhone: '0802 345 6789',
    sourceType: 'photo',
    transcription: '✓ 1 carton indomie, 1 bag rice 5kg, 2kg ijebu garri, 3 tin peak milk',
    items: [
      { catalogId: 'indomie_carton', name: 'Indomie Instant Noodles (Carton - 40pcs)', quantity: 1, price: 9500, total: 9500 },
      { catalogId: 'rice_5kg', name: 'Rice (5kg Bag)', quantity: 1, price: 8500, total: 8500 },
      { catalogId: 'garri_1kg', name: 'Ijebu Garri (1kg)', quantity: 2, price: 1200, total: 2400 },
      { catalogId: 'peak_milk_tin', name: 'Peak Evaporated Milk (Tin 160g)', quantity: 3, price: 1500, total: 4500 }
    ],
    subtotal: 24900,
    deliveryFee: 400,
    total: 25300,
    location: {
      type: 'delivery',
      zoneId: 'zone_moniya',
      area: 'Moniya Central, Train Station & Akinyele',
      address: 'Plot 18, Moniya Train Station Road, Moniya, Ibadan',
      landmark: 'Opposite Railway Quarters, Moniya',
      deliveryFee: 400,
      estimatedTime: '10 – 20 mins'
    },
    status: 'Received',
    notes: 'Urgent order before lunch rush'
  },
  {
    id: 'ORD-103',
    orderNumber: 103,
    createdAt: 'Today, 11:15 AM',
    customerName: 'Chidi Okonkwo',
    customerPhone: '0803 890 1234',
    sourceType: 'text',
    transcription: '1 bottle kings veg oil, 2 spaghetti, 1 box st louis sugar',
    items: [
      { catalogId: 'veg_oil_1l', name: 'Kings Vegetable Oil (1L)', quantity: 1, price: 2800, total: 2800 },
      { catalogId: 'spaghetti_500g', name: 'Golden Penny Spaghetti (500g)', quantity: 2, price: 1100, total: 2200 },
      { catalogId: 'sugar_500g', name: 'St. Louis Cube Sugar (500g Box)', quantity: 1, price: 900, total: 900 }
    ],
    subtotal: 5900,
    deliveryFee: 500,
    total: 6400,
    location: {
      type: 'delivery',
      zoneId: 'zone_ojoo',
      area: 'Ojoo, Shasha & Akingbile',
      address: 'Old Barracks Road, Near Ojoo Interchange, Ibadan',
      landmark: 'Behind Ojoo Central Market',
      deliveryFee: 500,
      estimatedTime: '15 – 25 mins'
    },
    status: 'Packing',
    notes: 'Packing bags from shelves'
  },
  {
    id: 'ORD-102',
    orderNumber: 102,
    createdAt: 'Today, 10:30 AM',
    customerName: 'Oluwaseun Davies',
    customerPhone: '0805 678 9012',
    sourceType: 'photo',
    transcription: '✓ 1 crate of eggs, 2 peak milk, 1 family sliced bread',
    items: [
      { catalogId: 'eggs_crate', name: 'Farm Fresh Eggs (Crate of 30)', quantity: 1, price: 4500, total: 4500 },
      { catalogId: 'peak_milk_tin', name: 'Peak Evaporated Milk (Tin 160g)', quantity: 2, price: 1500, total: 3000 },
      { catalogId: 'sliced_bread', name: 'Fresh Special Sliced Bread (Family Loaf)', quantity: 1, price: 1800, total: 1800 }
    ],
    subtotal: 9300,
    deliveryFee: 0,
    total: 9300,
    location: {
      type: 'pickup',
      branchId: 'branch_moniya',
      branchName: 'QuickCart Supermarket — Moniya Flagship (Ibadan)',
      area: 'Moniya',
      address: 'Plot 12, Oyo-Ibadan Expressway, Moniya Central (Opposite Train Station Road), Moniya, Ibadan, Oyo State',
      deliveryFee: 0,
      estimatedTime: 'Ready for Pickup at Moniya Store'
    },
    status: 'Ready for Pickup',
    notes: 'Customer arriving at Moniya store shortly for pickup'
  },
  {
    id: 'ORD-101',
    orderNumber: 101,
    createdAt: 'Today, 09:10 AM',
    customerName: 'Zainab Danjuma',
    customerPhone: '0810 112 2334',
    sourceType: 'text',
    transcription: '2 bags of rice 5kg and 1 carton indomie',
    items: [
      { catalogId: 'rice_5kg', name: 'Rice (5kg Bag)', quantity: 2, price: 8500, total: 17000 },
      { catalogId: 'indomie_carton', name: 'Indomie Instant Noodles (Carton - 40pcs)', quantity: 1, price: 9500, total: 9500 }
    ],
    subtotal: 26500,
    deliveryFee: 900,
    total: 27400,
    location: {
      type: 'delivery',
      zoneId: 'zone_bodija',
      area: 'Bodija (Old & New Bodija) & Housing',
      address: '14 Osuntokun Avenue, Old Bodija, Ibadan',
      landmark: 'Near Bodija Market Junction',
      deliveryFee: 900,
      estimatedTime: '25 – 35 mins'
    },
    status: 'Delivered',
    notes: 'Handed over by dispatch rider'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'catalog' | 'admin'>('shop');
  const [inputMode, setInputMode] = useState<'photo' | 'text'>('photo');

  // Input states
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    dataUrl: string;
    name: string;
    sampleId?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Cart: { [catalogId]: quantity }
  const [cart, setCart] = useState<{ [catalogId: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // AI response metadata
  const [lastParseResult, setLastParseResult] = useState<ParseApiResponse | null>(null);

  // Customer Checkout Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // LOCATION & FULFILLMENT STATE
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(STORE_BRANCHES[0].id);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(DELIVERY_ZONES[0].id);
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState<string | null>(null);

  // Orders State (initialized with seed orders if none exist)
  const [orders, setOrders] = useState<CompletedOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SEED_ORDERS;
    } catch {
      return INITIAL_SEED_ORDERS;
    }
  });

  const [confirmedOrder, setConfirmedOrder] = useState<CompletedOrder | null>(null);

  // Admin lock & filter
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<'All' | OrderStatus>('All');

  // Catalog search & filter
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Mock Browser Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Save notifications to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save orders to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Location helpers
  const currentBranch = STORE_BRANCHES.find((b) => b.id === selectedBranchId) || STORE_BRANCHES[0];
  const currentZone = DELIVERY_ZONES.find((z) => z.id === selectedZoneId) || DELIVERY_ZONES[0];
  const deliveryFee = fulfillmentType === 'delivery' ? currentZone.fee : 0;

  // Calculate cart items & totals
  const cartEntries = Object.entries(cart).filter(([_, qty]) => qty > 0);
  const cartItems = cartEntries
    .map(([id, qty]) => {
      const item = CATALOG.find((c) => c.id === id);
      if (!item) return null;
      return {
        ...item,
        quantity: qty,
        lineTotal: item.price * qty,
      };
    })
    .filter(Boolean) as (CatalogItem & { quantity: number; lineTotal: number })[];

  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.lineTotal, 0);
  const orderGrandTotal = cartSubtotal + deliveryFee;
  const cartItemCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // Cart modifiers
  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[id];
      } else {
        updated[id] = next;
      }
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    setLastParseResult(null);
    setSelectedImage(null);
    setTextInput('');
  };

  // Status Updater with Mock Browser Notification trigger
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    // Trigger mock browser notification when changed to 'Ready for Pickup' or 'Delivered'
    if (
      targetOrder &&
      targetOrder.status !== newStatus &&
      (newStatus === 'Ready for Pickup' || newStatus === 'Delivered')
    ) {
      const isDelivered = newStatus === 'Delivered';
      const isPickup = targetOrder.location?.type === 'pickup';

      const title = isDelivered
        ? `Order #${targetOrder.orderNumber} Delivered! 🎉`
        : isPickup
        ? `Order #${targetOrder.orderNumber} is Ready for Pickup! 🛍️`
        : `Order #${targetOrder.orderNumber} is Ready for Dispatch! 🛵`;

      const body = isDelivered
        ? `Your groceries have been delivered to ${targetOrder.location?.address || 'your delivery address'}. Thank you for shopping with QuickCart!`
        : isPickup
        ? `Your groceries are packed and awaiting pickup at ${targetOrder.location?.branchName || 'the store'}!`
        : `Your order is packed and dispatched for delivery to ${targetOrder.location?.area || 'your area'}!`;

      const newNotif: AppNotification = {
        id: 'NOTIF-' + Date.now(),
        orderNumber: targetOrder.orderNumber,
        title,
        body,
        status: newStatus,
        createdAt: 'Just now',
        read: false,
      };

      // Play pleasant audio chime
      playNotificationChime();

      // Show floating browser notification toast
      setActiveToasts((prev) => [newNotif, ...prev]);

      // Add to notifications list
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // GPS Current Location Detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMsg('Accessing device GPS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoordinates({ lat: latitude, lon: longitude });
        setGpsStatusMsg('Coordinates found! Resolving street & neighborhood...');

        const geoResult = await reverseGeocodeCoordinates(latitude, longitude);
        setIsDetectingGps(false);

        if (geoResult) {
          setStreetAddress(geoResult.address);
          setGpsStatusMsg(`📍 Found: ${geoResult.area}, ${geoResult.city}`);

          const lowerAddr = (geoResult.address + ' ' + geoResult.area).toLowerCase();
          const matchedZone = DELIVERY_ZONES.find((z) =>
            z.name.toLowerCase().split(/[,&]/).some((part) => lowerAddr.includes(part.trim()))
          );
          if (matchedZone) {
            setSelectedZoneId(matchedZone.id);
          }
        } else {
          setGpsStatusMsg(`📍 Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('Geolocation error:', err);
        setGpsStatusMsg('Could not detect location automatically. Please select your neighborhood below.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle Photo File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSelectedImage({
        dataUrl: result,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Sample Photo Selection
  const handleSelectSamplePhoto = (sample: SamplePhoto) => {
    setErrorMsg(null);
    setSelectedImage({
      dataUrl: sample.dataUrl,
      name: sample.title,
      sampleId: sample.id,
    });
  };

  // Process through /api/parse
  const handleParse = async () => {
    setErrorMsg(null);
    if (inputMode === 'photo' && !selectedImage) {
      setErrorMsg('Please snap a photo or choose a sample grocery list above.');
      return;
    }
    if (inputMode === 'text' && !textInput.trim()) {
      setErrorMsg('Please enter your grocery list text or click an example.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Reading grocery items...');

    try {
      let payloadImage: { data: string; mimeType: string } | undefined = undefined;

      if (inputMode === 'photo' && selectedImage) {
        setProcessingStatus('Pre-processing photo & reading handwriting...');
        payloadImage = await convertToRasterBase64(selectedImage.dataUrl);
      }

      setProcessingStatus('Matching items against supermarket catalog & calculating prices...');

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputMode === 'text' ? textInput : undefined,
          image: payloadImage,
        }),
      });

      const data: ParseApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error((data as any).error || 'Failed to parse grocery list.');
      }

      setLastParseResult(data);

      setCart((prev) => {
        const next = { ...prev };
        for (const [id, qty] of Object.entries(data.cart)) {
          next[id] = (next[id] || 0) + qty;
        }
        return next;
      });

      setProcessingStatus('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with AI parser. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm order
  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      setErrorMsg('Your cart is empty. Add items first.');
      return;
    }

    if (fulfillmentType === 'delivery' && !streetAddress.trim()) {
      setErrorMsg('Please enter your delivery street address or landmark.');
      return;
    }

    const orderLocation: OrderLocation =
      fulfillmentType === 'pickup'
        ? {
            type: 'pickup',
            branchId: currentBranch.id,
            branchName: currentBranch.name,
            area: currentBranch.area,
            address: currentBranch.address,
            deliveryFee: 0,
            estimatedTime: 'Ready in 15 mins',
          }
        : {
            type: 'delivery',
            zoneId: currentZone.id,
            area: currentZone.name,
            address: streetAddress.trim(),
            landmark: landmark.trim() || undefined,
            latitude: gpsCoordinates?.lat,
            longitude: gpsCoordinates?.lon,
            deliveryFee: currentZone.fee,
            estimatedTime: currentZone.estimatedMinutes,
            detectedViaGps: !!gpsCoordinates,
          };

    const newOrderNumber = orders.length > 0 ? Math.max(...orders.map((o) => o.orderNumber)) + 1 : 105;
    const newOrder: CompletedOrder = {
      id: 'ORD-' + Date.now(),
      orderNumber: newOrderNumber,
      createdAt: 'Just now',
      customerName: customerName.trim() || 'Valued Customer',
      customerPhone: customerPhone.trim() || undefined,
      sourceType: selectedImage ? 'photo' : 'text',
      transcription: lastParseResult?.transcription,
      items: cartItems.map((i) => ({
        catalogId: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.lineTotal,
      })),
      subtotal: cartSubtotal,
      deliveryFee,
      total: orderGrandTotal,
      location: orderLocation,
      status: 'Received',
      notes:
        fulfillmentType === 'delivery'
          ? `Delivery to ${currentZone.name}: ${streetAddress}${landmark ? ` (Landmark: ${landmark})` : ''}`
          : `Pickup at ${currentBranch.name}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrder(newOrder);
    setCart({});
  };

  // WhatsApp order share format
  const generateWhatsAppMessage = (order: CompletedOrder) => {
    const loc = order.location;
    const locationLines =
      loc.type === 'pickup'
        ? [
            `🏪 *STORE PICKUP:*`,
            `Branch: ${loc.branchName}`,
            `Address: ${loc.address}`,
            `ETA: ${loc.estimatedTime}`,
          ]
        : [
            `🛵 *HOME DELIVERY:*`,
            `Zone: ${loc.area}`,
            `Address: ${loc.address}`,
            loc.landmark ? `Landmark: ${loc.landmark}` : '',
            loc.latitude && loc.longitude
              ? `GPS: https://maps.google.com/?q=${loc.latitude},${loc.longitude}`
              : '',
            `Delivery ETA: ${loc.estimatedTime}`,
          ];

    const lines = [
      `🛒 *QuickCart Order #${order.orderNumber}*`,
      `Customer: ${order.customerName}`,
      order.customerPhone ? `Phone: ${order.customerPhone}` : '',
      `Status: ${order.status}`,
      '',
      ...locationLines.filter(Boolean),
      '',
      `*ORDER ITEMS:*`,
      ...order.items.map((i) => `• ${i.quantity}x ${i.name} — ${formatNaira(i.total)}`),
      '',
      `Items Subtotal: ${formatNaira(order.subtotal)}`,
      order.deliveryFee > 0 ? `Delivery Fee: ${formatNaira(order.deliveryFee)}` : `Delivery: FREE (Pickup)`,
      `*GRAND TOTAL: ${formatNaira(order.total)}*`,
      '',
      `_Sent via QuickCart Supermarket AI_`,
    ];

    return encodeURIComponent(lines.join('\n'));
  };

  const categories = ['All', 'Grains & Staples', 'Noodles & Pasta', 'Cooking & Spices', 'Breakfast & Dairy', 'Drinks & Water', 'Household'];

  const filteredCatalog = CATALOG.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      item.aliases.some((a) => a.toLowerCase().includes(catalogSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Admin filtered orders by status
  const filteredOrders = orders.filter((o) => {
    if (adminStatusFilter === 'All') return true;
    return o.status === adminStatusFilter;
  });

  const countByStatus = {
    All: orders.length,
    Received: orders.filter((o) => o.status === 'Received').length,
    Packing: orders.filter((o) => o.status === 'Packing').length,
    'Ready for Pickup': orders.filter((o) => o.status === 'Ready for Pickup').length,
    Delivered: orders.filter((o) => o.status === 'Delivered').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">QuickCart Supermarket</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-700" />
                  Moniya, Ibadan
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Moniya Flagship Store & Express Delivery in Ibadan • Snap handwritten lists or receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItemCount > 0 && (
              <button
                onClick={() => setActiveTab('shop')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition"
              >
                <span>Cart:</span>
                <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded-full text-[11px]">
                  {cartItemCount}
                </span>
                <span className="font-bold">{formatNaira(cartSubtotal)}</span>
              </button>
            )}

            {/* Notification Bell with Badge & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                className={`relative p-2 rounded-lg border transition ${
                  notifications.filter((n) => !n.read).length > 0
                    ? 'border-amber-300 bg-amber-50/70 text-amber-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
                title="Browser Notifications"
              >
                {notifications.filter((n) => !n.read).length > 0 ? (
                  <BellRing className="w-4 h-4 text-amber-600 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-500" />
                )}
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {showNotificationMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">
                        Browser Push Notifications
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => {
                          setNotifications([]);
                          setShowNotificationMenu(false);
                        }}
                        className="text-[11px] text-slate-400 hover:text-red-600 transition"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet. When an admin updates an order to &ldquo;Ready for Pickup&rdquo; or &ldquo;Delivered&rdquo;, a mock browser notification will chime here!
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <span>{notif.title}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{notif.body}</p>
                          <div className="pt-1 flex justify-end">
                            <button
                              onClick={() => {
                                const ord = orders.find((o) => o.orderNumber === notif.orderNumber);
                                if (ord) setConfirmedOrder(ord);
                                setShowNotificationMenu(false);
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              View Order #{notif.orderNumber} &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="max-w-4xl mx-auto px-4 flex gap-1 border-t border-slate-100 pt-1 pb-1 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'shop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Order (Photo & Text)</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Catalog ({CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Store Admin & Timeline</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-amber-500 text-white font-bold">
                {orders.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: SHOP & ORDER FLOW */}
        {activeTab === 'shop' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-3 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pickup in Moniya or Express Delivery across Ibadan</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  <span className="block">Snap your grocery list.</span>
                  <span className="block text-blue-200 mt-1">Get your bill in seconds.</span>
                </h1>
                <p className="mt-2 text-sm text-blue-100 leading-relaxed">
                  Snap a photo of your handwritten paper list or old receipt, or type your items in
                  Pidgin or English. Pick up at our Moniya store or get doorstep delivery across Ibadan!
                </p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                <Receipt className="w-64 h-64 text-white" />
              </div>
            </div>

            {/* Input Selection Tabs: Photo vs Text */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">Input Mode:</span>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setInputMode('photo')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        inputMode === 'photo'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload / Snap Photo</span>
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        inputMode === 'text'
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Type Messy Text / Pidgin</span>
                    </button>
                  </div>
                </div>

                {cartItemCount > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                )}
              </div>

              {/* PHOTO MODE */}
              {inputMode === 'photo' && (
                <div className="space-y-4">
                  {/* Photo Upload Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                      selectedImage
                        ? 'border-blue-400 bg-blue-50/40'
                        : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {selectedImage ? (
                      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                        <div className="relative group">
                          <img
                            src={selectedImage.dataUrl}
                            alt="Uploaded grocery note"
                            className="w-36 h-36 object-cover rounded-xl border border-slate-200 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-left space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm">
                              {selectedImage.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold">
                              Ready to Scan
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Click here to choose a different photo, or press the button below to
                            extract items.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Camera className="w-6 h-6" />
                        </div>
                        <div className="font-semibold text-slate-800 text-sm">
                          Snap your handwritten list or click to upload
                        </div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Supports phone camera snaps of lined paper, notepad scribbles, or old receipts.
                        </p>
                        <div className="pt-2">
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-700 transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Photo / Use Camera</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preloaded Sample Photos to test immediately */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        ⚡ Or test instantly with a sample list:
                      </span>
                      <span className="text-xs text-slate-400">1-click test</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {SAMPLE_PHOTOS.map((sample) => {
                        const isSelected = selectedImage?.sampleId === sample.id;
                        return (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSelectSamplePhoto(sample)}
                            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <img
                              src={sample.dataUrl}
                              alt={sample.title}
                              className="w-12 h-14 object-cover rounded-md border border-slate-200 shrink-0 bg-white"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-xs text-slate-800 truncate">
                                {sample.title}
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                {sample.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TEXT MODE */}
              {inputMode === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Type your grocery list (Standard English or Nigerian Pidgin):
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="e.g. 2 bags of rice, 3 indomie, 1 tin tomato paste, 2 peak milk and one crate of eggs"
                      rows={3}
                      className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                  </div>

                  {/* Example chips */}
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Quick test examples:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setTextInput('2 bags of rice, 3 indomie, one tomato paste and 2 eggs crate')
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        🌾 2 rice, 3 indomie, tomato, 2 eggs
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTextInput(
                            'Abeg give me 1 carton indomie, 1 mudu of beans, 2kg ijebu garri and 3 peak milk'
                          )
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        🇳🇬 Pidgin: 1 carton indomie, beans, garri, milk
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTextInput(
                            '1 family loaf bread, 1 tin peak milk, 1 box sugar and 1 Milo refill'
                          )
                        }
                        className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        ☕ Breakfast: Bread, Milk, Sugar, Milo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {inputMode === 'photo'
                    ? selectedImage
                      ? 'Photo ready for multimodal scan'
                      : 'Choose photo or sample above'
                    : 'Text ready for processing'}
                </span>

                <button
                  type="button"
                  onClick={handleParse}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{processingStatus || 'Scanning...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{inputMode === 'photo' ? 'Scan & Build Bill' : 'Build My Order'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* AI Scan Feedback Bubble */}
            {lastParseResult && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-900">
                        {lastParseResult.summary}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
                        Items Scanned
                      </span>
                    </div>

                    {lastParseResult.transcription && (
                      <div className="mt-1 text-xs text-slate-700 bg-white/70 rounded-lg p-2.5 border border-emerald-100 font-mono">
                        <span className="font-semibold text-emerald-800">Identified Items: </span>
                        {lastParseResult.transcription}
                      </div>
                    )}

                    {lastParseResult.unmatchedNotes && lastParseResult.unmatchedNotes.length > 0 && (
                      <div className="mt-2 text-xs text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <span className="font-semibold">Items not in catalog: </span>
                          {lastParseResult.unmatchedNotes.join('; ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* GENERATED BILL / ORDER SUMMARY & LOCATION SELECTION */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="font-bold text-base text-slate-800">Your Supermarket Order & Bill</h2>
                    <p className="text-xs text-slate-500">
                      Review items, choose delivery location or store pickup
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Grand Total</div>
                  <div className="text-xl font-extrabold text-blue-700">{formatNaira(orderGrandTotal)}</div>
                </div>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                  <div className="font-semibold text-sm">No items in your order yet</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Snap a photo of your handwritten grocery list above, or browse the Store Catalog
                    to add items directly.
                  </p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition mt-2"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Table of Items */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="py-2.5 pr-2">Item</th>
                          <th className="py-2.5 px-2 text-right">Unit Price</th>
                          <th className="py-2.5 px-2 text-center">Qty</th>
                          <th className="py-2.5 pl-2 text-right">Total</th>
                          <th className="py-2.5 pl-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cartItems.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 pr-2">
                              <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                              <div className="text-xs text-slate-400">{item.unit}</div>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-600 text-sm">
                              {formatNaira(item.price)}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, -1)}
                                  className="w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                                  title="Reduce quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-bold text-sm text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQty(item.id, 1)}
                                  className="w-7 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 pl-2 text-right font-bold text-slate-900 text-sm">
                              {formatNaira(item.lineTotal)}
                            </td>
                            <td className="py-3 pl-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* LOCATION & FULFILLMENT SECTION */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-sm text-slate-800">
                          Location & Fulfillment Method
                        </span>
                      </div>

                      {/* Delivery vs Pickup Toggle */}
                      <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-xs self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setFulfillmentType('delivery')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            fulfillmentType === 'delivery'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Home Delivery</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFulfillmentType('pickup')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            fulfillmentType === 'pickup'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Store Pickup (Free)</span>
                        </button>
                      </div>
                    </div>

                    {/* FULFILLMENT TYPE: HOME DELIVERY */}
                    {fulfillmentType === 'delivery' && (
                      <div className="space-y-3.5">
                        {/* GPS Auto-Detect Button */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200/80">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-blue-600 shrink-0" />
                            <div>
                              <div className="text-xs font-bold text-blue-900">
                                Auto-Detect My Current Location
                              </div>
                              <p className="text-[11px] text-blue-700">
                                Use device GPS to pinpoint your street address & calculate delivery
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetectingGps}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-60"
                          >
                            {isDetectingGps ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Detecting GPS...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-3.5 h-3.5" />
                                <span>Detect Location</span>
                              </>
                            )}
                          </button>
                        </div>

                        {gpsStatusMsg && (
                          <div className="text-xs px-3 py-2 rounded-lg bg-white border border-blue-100 text-blue-800 font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{gpsStatusMsg}</span>
                          </div>
                        )}

                        {/* Delivery Zone Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Delivery Area / Zone:
                            </label>
                            <select
                              value={selectedZoneId}
                              onChange={(e) => setSelectedZoneId(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                              {DELIVERY_ZONES.map((zone) => (
                                <option key={zone.id} value={zone.id}>
                                  {zone.name} — {formatNaira(zone.fee)} ({zone.estimatedMinutes})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Estimated Delivery Time & Fee:
                            </label>
                            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs">
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <Clock className="w-3.5 h-3.5 text-blue-600" />
                                {currentZone.estimatedMinutes}
                              </span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                {formatNaira(currentZone.fee)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address & Landmark Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Street Address / House No. <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="e.g. Plot 15, Akinyele Secretariat Road, Moniya, Ibadan"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Closest Landmark / Building (Optional):
                            </label>
                            <input
                              type="text"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              placeholder="e.g. Near Moniya Train Station, beside Central Mosque"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FULFILLMENT TYPE: STORE PICKUP */}
                    {fulfillmentType === 'pickup' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Choose Supermarket Pickup Branch:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {STORE_BRANCHES.map((branch) => {
                            const isSelected = branch.id === selectedBranchId;
                            return (
                              <button
                                key={branch.id}
                                type="button"
                                onClick={() => setSelectedBranchId(branch.id)}
                                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs text-slate-900">
                                      {branch.name}
                                    </span>
                                    {isSelected && (
                                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-1">{branch.address}</p>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>{branch.operatingHours}</span>
                                  <span className="font-semibold text-emerald-600">FREE PICKUP</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Customer Contact */}
                    <div className="border-t border-slate-200 pt-3">
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Customer Contact Information:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Your full name"
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Phone / WhatsApp (e.g. 0803 123 4567)"
                              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total & Confirmation Card */}
                  <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left space-y-0.5">
                      <div className="text-xs text-slate-500">
                        Groceries: {formatNaira(cartSubtotal)} · Delivery:{' '}
                        {deliveryFee > 0 ? formatNaira(deliveryFee) : 'FREE'}
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {formatNaira(orderGrandTotal)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleConfirmOrder}
                        className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Confirm & Place Order</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: STORE CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Supermarket Catalog</h2>
                <p className="text-xs text-slate-500">
                  All items in stock with standard Nigerian retail prices
                </p>
              </div>

              {/* Search */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Search rice, indomie, oil..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredCatalog.map((item) => {
                const inCartQty = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>
                        {item.popular && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            Popular
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-2">{item.name}</h3>
                      <p className="text-xs text-slate-400">{item.unit}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="font-extrabold text-sm text-slate-900">
                        {formatNaira(item.price)}
                      </div>

                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg p-1">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs font-bold shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-blue-800 px-1">{inCartQty}</span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="w-6 h-6 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center text-xs font-bold shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: STORE ADMIN WITH ORDER PROGRESS TIMELINE */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Supermarket Owner Login</h2>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Enter manager passcode to view incoming customer orders & manage order progress timeline.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPassword === 'admin123') {
                      setIsAdminLoggedIn(true);
                      setAdminLoginError('');
                    } else {
                      setAdminLoginError('Incorrect passcode. Demo passcode is admin123');
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter password (admin123)"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {adminLoginError && (
                    <div className="text-xs text-red-600 font-medium">{adminLoginError}</div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition"
                  >
                    Unlock Admin Dashboard
                  </button>

                  <p className="text-[11px] text-slate-400">Default demo password: admin123</p>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Header Stats */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">Store Order Operations</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                        Authenticated
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Live order tracking: Received &rarr; Packing &rarr; Ready &rarr; Delivered
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsAdminLoggedIn(false);
                        setAdminPassword('');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                    >
                      Log out
                    </button>
                  </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Total Orders</span>
                    <div className="text-2xl font-black text-slate-900 mt-1">{orders.length}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Total Revenue</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {formatNaira(orders.reduce((acc, o) => acc + o.total, 0))}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Active / In Progress</span>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                      {orders.filter((o) => o.status !== 'Delivered').length}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">Completed (Delivered)</span>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      {orders.filter((o) => o.status === 'Delivered').length}
                    </div>
                  </div>
                </div>

                {/* Orders List Container */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Status Pipeline Filter Tabs */}
                  <div className="p-4 border-b border-slate-100 bg-slate-50/60 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <h3 className="font-bold text-sm text-slate-800">
                          Order Progress Pipeline ({filteredOrders.length})
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400">
                        Click on any timeline step to advance status
                      </span>
                    </div>

                    {/* Filter Pills with Counts */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                      {(['All', 'Received', 'Packing', 'Ready for Pickup', 'Delivered'] as const).map(
                        (st) => {
                          const isSelected = adminStatusFilter === st;
                          const count = countByStatus[st];
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAdminStatusFilter(st)}
                              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                                isSelected
                                  ? 'bg-slate-900 text-white shadow-xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{st === 'Ready for Pickup' ? 'Ready' : st}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Order Cards */}
                  {filteredOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No orders found in the &ldquo;{adminStatusFilter}&rdquo; status.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="p-5 hover:bg-slate-50/40 transition space-y-4">
                          {/* Order Top Bar */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                                  Order #{order.orderNumber}
                                </span>
                                <OrderStatusPill
                                  status={order.status}
                                  orderType={order.location?.type || 'delivery'}
                                />
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    order.sourceType === 'photo'
                                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {order.sourceType === 'photo' ? '📷 Photo' : '✍️ Text'}
                                </span>
                                <span className="text-xs text-slate-400">· {order.createdAt}</span>
                              </div>

                              <div className="text-xs text-slate-600 mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-slate-900">
                                  👤 {order.customerName}
                                </span>
                                {order.customerPhone && (
                                  <span className="text-slate-500">📞 {order.customerPhone}</span>
                                )}
                              </div>

                              {/* Order Location Badge */}
                              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-700">
                                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="font-medium">
                                  {order.location?.type === 'pickup'
                                    ? `Store Pickup: ${order.location.branchName}`
                                    : `Delivery: ${order.location?.address} (${order.location?.area})`}
                                </span>
                                {order.location?.landmark && (
                                  <span className="text-slate-500 text-[11px]">
                                    · Landmark: {order.location.landmark}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Total and Status Selector */}
                            <div className="flex items-center gap-3 self-start sm:self-auto">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                                  Order Total
                                </span>
                                <span className="text-lg font-black text-blue-700">
                                  {formatNaira(order.total)}
                                </span>
                              </div>

                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                className="text-xs border border-slate-300 font-semibold rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                              >
                                <option value="Received">Received</option>
                                <option value="Packing">Packing</option>
                                <option value="Ready for Pickup">Ready for Pickup</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>
                          </div>

                          {/* VISUAL ORDER TIMELINE COMPONENT */}
                          <OrderTimeline
                            status={order.status}
                            orderType={order.location?.type || 'delivery'}
                            onStatusChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                          />

                          {/* Items Breakdown Accordion */}
                          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                            <div className="flex items-center justify-between font-semibold text-slate-600 text-[11px]">
                              <span>Items Ordered ({order.items.reduce((a, b) => a + b.quantity, 0)}):</span>
                              <span className="text-slate-500">
                                Subtotal: {formatNaira(order.subtotal)} · Delivery:{' '}
                                {order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'FREE'}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                              {order.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-slate-700">
                                  <span>
                                    {it.quantity}x {it.name}
                                  </span>
                                  <span className="font-medium text-slate-900">{formatNaira(it.total)}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {order.transcription && (
                            <div className="text-[11px] text-slate-500 italic">
                              Scanned transcription: &ldquo;{order.transcription}&rdquo;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* CONFIRMED ORDER SUCCESS MODAL */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Order #{confirmedOrder.orderNumber} Confirmed! 🎉
              </h3>
              <p className="text-xs text-slate-500">
                The supermarket owner has received your grocery order and is preparing it.
              </p>
            </div>

            {/* Visual Timeline in Confirmation Modal */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <OrderTimeline
                status={confirmedOrder.status}
                orderType={confirmedOrder.location.type}
                onStatusChange={(newStatus) => {
                  updateOrderStatus(confirmedOrder.id, newStatus);
                  setConfirmedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
                }}
                compact={true}
              />
            </div>

            {/* Receipt Card with Location Details */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold">Customer:</span>
                <span>{confirmedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{confirmedOrder.createdAt}</span>
              </div>

              {/* Location details */}
              <div className="border-t border-slate-200 pt-2 pb-2 border-b border-dashed space-y-1">
                <div className="font-bold text-blue-900">
                  {confirmedOrder.location.type === 'pickup' ? '🏪 STORE PICKUP:' : '🛵 HOME DELIVERY:'}
                </div>
                {confirmedOrder.location.type === 'pickup' ? (
                  <>
                    <div>Branch: {confirmedOrder.location.branchName}</div>
                    <div className="text-[11px] text-slate-500">{confirmedOrder.location.address}</div>
                  </>
                ) : (
                  <>
                    <div>Zone: {confirmedOrder.location.area}</div>
                    <div>Address: {confirmedOrder.location.address}</div>
                    {confirmedOrder.location.landmark && (
                      <div className="text-[11px] text-slate-500">Landmark: {confirmedOrder.location.landmark}</div>
                    )}
                    {confirmedOrder.location.latitude && confirmedOrder.location.longitude && (
                      <div className="text-[11px] text-blue-600">
                        GPS: {confirmedOrder.location.latitude.toFixed(4)}, {confirmedOrder.location.longitude.toFixed(4)}
                      </div>
                    )}
                  </>
                )}
                <div className="text-slate-500">ETA: {confirmedOrder.location.estimatedTime}</div>
              </div>

              {/* Items */}
              <div className="pt-1 space-y-1">
                {confirmedOrder.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span>{formatNaira(i.total)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>{formatNaira(confirmedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee:</span>
                  <span>{confirmedOrder.deliveryFee > 0 ? formatNaira(confirmedOrder.deliveryFee) : 'FREE'}</span>
                </div>
              </div>

              <div className="border-t-2 border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-900">
                <span>TOTAL:</span>
                <span>{formatNaira(confirmedOrder.total)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 pt-2">
              <a
                href={`https://wa.me/?text=${generateWhatsAppMessage(confirmedOrder)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Send Receipt to Supermarket on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setConfirmedOrder(null)}
                className="w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition"
              >
                Close & Return to Shop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Mock Browser Notification Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {activeToasts.map((notif) => (
          <NotificationToast
            key={notif.id}
            notification={notif}
            onDismiss={(id) => setActiveToasts((prev) => prev.filter((t) => t.id !== id))}
            onViewOrder={(orderNum) => {
              const ord = orders.find((o) => o.orderNumber === orderNum);
              if (ord) setConfirmedOrder(ord);
              setActiveToasts((prev) => prev.filter((t) => t.id !== notif.id));
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuickCart Supermarket • Moniya, Ibadan, Oyo State</span>
          <span>Prices in Nigerian Naira (₦)</span>
        </div>
      </footer>
    </div>
  );
}
