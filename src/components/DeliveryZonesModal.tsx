import React, { useState } from 'react';
import { X, Truck, Clock, MapPin, Search } from 'lucide-react';
import { DELIVERY_ZONES } from '../locationData.ts';
import { formatNaira } from '../catalogData.ts';

interface DeliveryZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone?: (zoneId: string) => void;
}

export const DeliveryZonesModal: React.FC<DeliveryZonesModalProps> = ({
  isOpen,
  onClose,
  onSelectZone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = DELIVERY_ZONES.filter((z) =>
    z.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Ibadan Delivery Zones & Rates
              </h3>
              <p className="text-xs text-slate-500">
                Transparent flat-rate motorcycle dispatch from our Moniya hub
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

        {/* Search zone */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your neighborhood (e.g. Moniya, Bodija, UI, Ojoo, Dugbe)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        {/* Zones Grid */}
        <div className="space-y-2">
          {filtered.map((zone) => (
            <div
              key={zone.id}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold text-xs text-slate-900">{zone.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 pl-5.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>ETA: {zone.estimatedMinutes}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                <span className="font-black text-sm text-slate-900">
                  {formatNaira(zone.fee)}
                </span>
                {onSelectZone && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectZone(zone.id);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold transition"
                  >
                    Select Zone
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
          <strong>Note:</strong> Delivery rates are fixed flat-fees with zero surge pricing. If your specific estate is outside listed areas, select &ldquo;Other Ibadan Neighborhoods&rdquo; (₦1,500) and our rider will coordinate with your gate security.
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
