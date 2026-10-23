import React, { useState } from 'react';
import {
  X,
  Search,
  Package,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Receipt,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CompletedOrder } from '../types.ts';
import { formatNaira } from '../catalogData.ts';
import { OrderTimeline, OrderStatusPill } from './OrderTimeline.tsx';

interface CustomerOrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CompletedOrder[];
  onOpenOrderReceipt: (order: CompletedOrder) => void;
}

export const CustomerOrderTrackerModal: React.FC<CustomerOrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onOpenOrderReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(
    orders.length > 0 ? orders[0] : null
  );

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().replace('#', '').toLowerCase();
    if (!query) return;

    const matched = orders.find(
      (o) =>
        o.orderNumber.toString() === query ||
        o.id.toLowerCase().includes(query) ||
        (o.customerPhone && o.customerPhone.includes(query)) ||
        (o.customerName && o.customerName.toLowerCase().includes(query))
    );

    if (matched) {
      setSelectedOrder(matched);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Track Supermarket Order
              </h3>
              <p className="text-xs text-slate-500">
                Live packing & delivery progress across Moniya & Ibadan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Order # (e.g. 104) or Phone Number"
              className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
          >
            Track
          </button>
        </form>

        {/* Quick Recent Order Chips */}
        {orders.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Recent Orders on This Device:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {orders.slice(0, 5).map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>Order #{ord.orderNumber}</span>
                    <span className="text-[10px] opacity-80">({ord.status})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Tracked Order View */}
        {selectedOrder ? (
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 bg-slate-50/50">
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900">
                    Order #{selectedOrder.orderNumber}
                  </span>
                  <OrderStatusPill
                    status={selectedOrder.status}
                    orderType={selectedOrder.location.type}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  Placed {selectedOrder.createdAt} · Customer: {selectedOrder.customerName}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[11px] text-slate-400">Total Bill</div>
                <div className="text-lg font-black text-blue-700">
                  {formatNaira(selectedOrder.total)}
                </div>
              </div>
            </div>

            {/* Visual Timeline */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <OrderTimeline
                status={selectedOrder.status}
                orderType={selectedOrder.location.type}
              />
            </div>

            {/* Location & Delivery Info */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  {selectedOrder.location.type === 'pickup'
                    ? `Store Pickup: ${selectedOrder.location.branchName}`
                    : `Home Delivery: ${selectedOrder.location.area}`}
                </span>
              </div>
              <p className="text-slate-600 pl-6">{selectedOrder.location.address}</p>
              {selectedOrder.location.landmark && (
                <p className="text-slate-500 pl-6 text-[11px]">
                  Landmark: {selectedOrder.location.landmark}
                </p>
              )}
              <div className="flex items-center gap-1.5 pl-6 text-slate-500 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>ETA: {selectedOrder.location.estimatedTime}</span>
              </div>
            </div>

            {/* Ordered Items Preview */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
                Order Items ({selectedOrder.items.reduce((a, b) => a + b.quantity, 0)}):
              </div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-slate-700">
                  <span>
                    {it.quantity}x {it.name}
                  </span>
                  <span className="font-semibold text-slate-900">{formatNaira(it.total)}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-2 flex justify-between text-slate-500 font-medium">
                <span>Delivery:</span>
                <span>{selectedOrder.deliveryFee > 0 ? formatNaira(selectedOrder.deliveryFee) : 'FREE (Pickup)'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrderReceipt(selectedOrder);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Receipt className="w-4 h-4" />
                <span>View Full Receipt / Invoice</span>
              </button>

              <a
                href={`https://wa.me/2348083918979?text=Hello%20QuickCart%2C%20checking%20status%20for%20Order%20%23${selectedOrder.orderNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Support (+2348083918979)</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Enter your order number above to inspect live preparation and delivery status.
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
