import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  ShoppingBag,
  History,
  RotateCcw,
  Check,
  Package,
  MapPin,
  Clock,
  Phone,
  Receipt,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  CheckCircle2,
  Calendar,
  Store,
  Truck
} from 'lucide-react';
import { CompletedOrder, CatalogItem } from '../types.ts';
import { CATALOG, formatNaira } from '../catalogData.ts';
import { OrderStatusPill } from './OrderTimeline.tsx';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CompletedOrder[];
  initialPhone?: string;
  onSelectOrderReceipt: (order: CompletedOrder) => void;
  onAddToCart: (item: CatalogItem, quantity?: number) => void;
  onReorderEntireOrder: (order: CompletedOrder) => void;
  onReorderFrequentItems: (items: { catalogItem: CatalogItem; quantity: number }[]) => void;
  currentCart: { [catalogId: string]: number };
}

// Phone normalization helper (strips spaces, dashes, +234)
export const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('234') && digits.length >= 13) {
    return '0' + digits.slice(3);
  }
  return digits;
};

interface FrequentItemStat {
  catalogId: string;
  catalogItem: CatalogItem;
  orderCount: number;
  totalQuantity: number;
  lastOrderedDate: string;
}

const STORAGE_SAVED_PHONE_KEY = 'quickcart_saved_customer_phone';

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialPhone = '',
  onSelectOrderReceipt,
  onAddToCart,
  onReorderEntireOrder,
  onReorderFrequentItems,
  currentCart,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    return localStorage.getItem(STORAGE_SAVED_PHONE_KEY) || initialPhone || '';
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Sync initialPhone if provided and phone input is empty
  useEffect(() => {
    if (initialPhone && !phoneNumber) {
      setPhoneNumber(initialPhone);
    }
  }, [initialPhone]);

  // Persist phone to localStorage when updated
  useEffect(() => {
    if (phoneNumber.trim()) {
      localStorage.setItem(STORAGE_SAVED_PHONE_KEY, phoneNumber.trim());
    }
  }, [phoneNumber]);

  // Auto-dismiss feedback message after 4 seconds
  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // Extract unique customer profiles from existing orders for fast one-tap demo selection
  const savedCustomerProfiles = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; count: number }>();
    orders.forEach((o) => {
      if (o.customerPhone) {
        const norm = normalizePhone(o.customerPhone);
        if (!map.has(norm)) {
          map.set(norm, {
            name: o.customerName || 'Customer',
            phone: o.customerPhone,
            count: 1,
          });
        } else {
          const entry = map.get(norm)!;
          entry.count += 1;
        }
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const normalizedInput = normalizePhone(phoneNumber);

  // Filter orders matching the phone number
  const userOrders = useMemo(() => {
    if (!normalizedInput || normalizedInput.length < 3) return [];
    return orders.filter((o) => {
      const orderPhoneNorm = normalizePhone(o.customerPhone);
      return orderPhoneNorm.includes(normalizedInput) || normalizedInput.includes(orderPhoneNorm);
    });
  }, [orders, normalizedInput]);

  // Calculate frequent grocery items across user orders
  const frequentItems: FrequentItemStat[] = useMemo(() => {
    if (userOrders.length === 0) return [];

    const statsMap = new Map<
      string,
      { orderCount: number; totalQuantity: number; lastOrderedDate: string; itemName: string; price: number }
    >();

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.catalogId;
        const existing = statsMap.get(key);
        if (existing) {
          existing.orderCount += 1;
          existing.totalQuantity += item.quantity;
        } else {
          statsMap.set(key, {
            orderCount: 1,
            totalQuantity: item.quantity,
            lastOrderedDate: order.createdAt,
            itemName: item.name,
            price: item.price,
          });
        }
      });
    });

    const list: FrequentItemStat[] = [];
    statsMap.forEach((stat, catalogId) => {
      // Find matching item in catalog or fallback
      let item = CATALOG.find((c) => c.id === catalogId);
      if (!item) {
        // Fallback catalog item
        item = {
          id: catalogId,
          name: stat.itemName,
          category: 'Grains & Staples',
          price: stat.price,
          unit: 'item',
          aliases: [],
        };
      }

      list.push({
        catalogId,
        catalogItem: item,
        orderCount: stat.orderCount,
        totalQuantity: stat.totalQuantity,
        lastOrderedDate: stat.lastOrderedDate,
      });
    });

    // Sort by order occurrence first (most frequent), then total quantity
    list.sort((a, b) => {
      if (b.orderCount !== a.orderCount) {
        return b.orderCount - a.orderCount;
      }
      return b.totalQuantity - a.totalQuantity;
    });

    return list;
  }, [userOrders]);

  if (!isOpen) return null;

  // Handler for adding single frequent item
  const handleAddSingleItem = (item: CatalogItem) => {
    onAddToCart(item, 1);
    setFeedbackMsg({
      text: `Added 1x ${item.name} to active cart!`,
      type: 'success',
    });
  };

  // Handler for reordering all top frequent items
  const handleReorderAllFrequent = () => {
    if (frequentItems.length === 0) return;
    const itemsToReorder = frequentItems.slice(0, 6).map((f) => ({
      catalogItem: f.catalogItem,
      quantity: 1,
    }));
    onReorderFrequentItems(itemsToReorder);
    setFeedbackMsg({
      text: `Added ${itemsToReorder.length} frequent essentials to your cart!`,
      type: 'success',
    });
  };

  // Handler for reordering an entire previous order
  const handleReorderOrder = (order: CompletedOrder) => {
    onReorderEntireOrder(order);
    setFeedbackMsg({
      text: `All items from Order #${order.orderNumber} added to your cart!`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  My Orders & Frequent Groceries
                </h3>
                {userOrders.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                    {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Filter by your phone number to check past orders and one-click reorder your favorite staples
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Feedback Banner */}
        {feedbackMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shrink-0 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs underline font-normal"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-6 pt-4 pr-1">
          {/* Phone Lookup & Quick-Select Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Your Nigerian Phone Number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone (e.g. 0802 345 6789 or 0805 678 9012)"
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  {phoneNumber && (
                    <button
                      type="button"
                      onClick={() => setPhoneNumber('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      title="Clear phone"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Demo Customer Profiles */}
            {savedCustomerProfiles.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Or select a demo customer profile:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {savedCustomerProfiles.map((profile) => {
                    const isSelected = normalizePhone(phoneNumber) === normalizePhone(profile.phone);
                    return (
                      <button
                        key={profile.phone}
                        type="button"
                        onClick={() => setPhoneNumber(profile.phone)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{profile.name}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                          ({profile.phone})
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {profile.count} {profile.count === 1 ? 'order' : 'orders'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STATE 1: Empty Phone Input */}
          {!normalizedInput && (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Enter Your Phone Number</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Enter your mobile number above or tap one of the customer profiles to view your order history, delivery status across Ibadan, and quickly reorder recurring staples.
              </p>
            </div>
          )}

          {/* STATE 2: Phone Input Entered but No Orders Found */}
          {normalizedInput && userOrders.length === 0 && (
            <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Previous Orders Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn&apos;t find any completed grocery orders for phone number{' '}
                <strong className="text-slate-700">{phoneNumber}</strong>.
              </p>
              <div className="text-xs text-slate-400 pt-1">
                Tip: If you are trying out the app, select <button onClick={() => setPhoneNumber('0802 345 6789')} className="text-emerald-600 font-bold hover:underline">Amina Bello (0802 345 6789)</button> or <button onClick={() => setPhoneNumber('0805 678 9012')} className="text-emerald-600 font-bold hover:underline">Oluwaseun Davies (0805 678 9012)</button> above to inspect their history!
              </div>
            </div>
          )}

          {/* STATE 3: Matching Orders Found */}
          {userOrders.length > 0 && (
            <>
              {/* SECTION: FREQUENT GROCERY ITEMS & REORDER */}
              <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white rounded-2xl border border-emerald-200 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                        <span>Most Frequent Groceries</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-bold">
                          Quick Reorder
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Calculated from your past {userOrders.length} orders: tap to reorder instantly
                      </p>
                    </div>
                  </div>

                  {frequentItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReorderAllFrequent}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder Top Essentials ({Math.min(frequentItems.length, 6)})</span>
                    </button>
                  )}
                </div>

                {/* Frequent Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {frequentItems.slice(0, 6).map((item) => {
                    const inCartQty = currentCart[item.catalogId] || 0;
                    return (
                      <div
                        key={item.catalogId}
                        className="bg-white rounded-xl border border-emerald-100 p-3 shadow-xs hover:border-emerald-300 hover:shadow-sm transition flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                              {item.catalogItem.name}
                            </span>
                          </div>

                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>
                              Ordered {item.orderCount} {item.orderCount === 1 ? 'time' : 'times'} ({item.totalQuantity} total)
                            </span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 pt-0.5">
                            {formatNaira(item.catalogItem.price)}
                            <span className="text-[10px] font-normal text-slate-500 ml-1">
                              / {item.catalogItem.unit}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          {inCartQty > 0 ? (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                              <Check className="w-3.5 h-3.5" />
                              <span>{inCartQty} in active cart</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Not in cart</span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddSingleItem(item.catalogItem)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-xs font-bold transition flex items-center gap-1"
                            title="Add to cart"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: PREVIOUS ORDERS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span>Order History ({userOrders.length})</span>
                  </h4>
                  <span className="text-xs text-slate-500">Sorted newest first</span>
                </div>

                <div className="space-y-3.5">
                  {userOrders.map((order) => {
                    const isPickup = order.location?.type === 'pickup';
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition space-y-3.5"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-extrabold text-sm text-slate-900">
                              Order #{order.orderNumber}
                            </span>
                            <OrderStatusPill status={order.status} />
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{order.createdAt}</span>
                          </div>
                        </div>

                        {/* Order Destination / Location */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-1.5 font-medium">
                            {isPickup ? (
                              <>
                                <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Pickup at Moniya Flagship Store</span>
                              </>
                            ) : (
                              <>
                                <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>Delivery to {order.location?.area || 'Ibadan'}</span>
                              </>
                            )}
                          </div>

                          {order.location?.address && (
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              • {order.location.address}
                            </span>
                          )}
                        </div>

                        {/* Items Breakdown */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
                          </span>
                          <div className="divide-y divide-slate-100 text-xs">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="py-1.5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                                    {item.quantity}×
                                  </span>
                                  <span className="font-medium text-slate-800">{item.name}</span>
                                </div>
                                <span className="font-bold text-slate-900">{formatNaira(item.total)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Totals & Financials */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="text-slate-500 space-x-2">
                            <span>Subtotal: {formatNaira(order.subtotal)}</span>
                            <span>•</span>
                            <span>
                              Delivery:{' '}
                              {order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'FREE (Pickup)'}
                            </span>
                          </div>

                          <div className="text-sm font-black text-slate-900">
                            Total: <span className="text-emerald-700">{formatNaira(order.total)}</span>
                          </div>
                        </div>

                        {/* Action Buttons: Reorder Entire Order & View Receipt */}
                        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectOrderReceipt(order);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Full Receipt</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReorderOrder(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reorder Entire Order ({order.items.length} items)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <span>QuickCart Moniya Ibadan • Instant Reorder</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
