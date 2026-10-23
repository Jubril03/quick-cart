import React from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { STORE_BRANCHES } from '../locationData.ts';

interface StoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreInfoModal: React.FC<StoreInfoModalProps> = ({ isOpen, onClose }) => {
  const [copiedBank, setCopiedBank] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyAccount = (accountNo: string) => {
    navigator.clipboard.writeText(accountNo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const flagship = STORE_BRANCHES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">
                About QuickCart
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Marketplace Bridge • Ibadan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Bridging local market sellers & buyers across Ibadan — just like Bolt bridges riders and drivers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* The Marketplace Bridge Concept Banner */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
              How QuickCart Works
            </span>
            <span className="text-xs text-slate-300 font-semibold">The Bolt for Groceries</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg leading-snug">
            We are the technology bridge connecting open-market sellers with busy buyers.
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            QuickCart is not a single store. Just as Bolt connects passengers with independent car drivers without owning the vehicles, QuickCart connects everyday households and shoppers with vetted market traders, grain merchants, and wholesalers across Moniya Central Market, Bodija, and Ojoo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <span>1. For Buyers</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Snap a handwritten scrap, type Pidgin, or speak. Avoid open-market stress, dust, and haggling.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
              <div className="font-bold text-blue-300 flex items-center gap-1.5">
                <span>2. For Sellers</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Market stall traders get instant verified digital demand and faster stock turnover.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>3. Express Dispatch</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Independent dispatch riders collect from stalls and deliver directly to your doorstep in 10 to 45 mins.
              </p>
            </div>
          </div>
        </div>

        {/* Flagship Partner & Fulfillment Hub Card */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-700" />
            <h4 className="font-bold text-sm text-blue-950">Moniya Central Fulfillment & Pickup Partner Hub</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {flagship.address}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Hours: {flagship.operatingHours}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Hotline: {flagship.phone}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="https://maps.google.com/?q=Moniya+Ibadan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100/50 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View on Google Maps</span>
            </a>
            <a
              href="https://wa.me/2348083918979?text=Hello%20QuickCart%20Moniya%2C%20I%20have%20an%20inquiry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat with Customer Care on WhatsApp (+2348083918979)</span>
            </a>
          </div>
        </div>

        {/* Official Bank Transfer Details */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-sm text-slate-900">Official Bank Accounts</h4>
            </div>
            <span className="text-[11px] text-slate-400">Instant Automated Verification</span>
          </div>
          <p className="text-xs text-slate-500">
            For bank transfer orders, please transfer to either of the accounts below using your Order Number (e.g. <code>ORD-105</code>) as payment narration:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">OPay</div>
              <div className="text-xs text-slate-700 font-medium">QuickCart Nig Ltd</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-black text-slate-900 tracking-wider">8155379789</span>
                <button
                  type="button"
                  onClick={() => handleCopyAccount('8155379789')}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  {copiedBank ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBank ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="text-[11px] font-bold text-orange-600 uppercase">Guaranty Trust Bank (GTB)</div>
              <div className="text-xs text-slate-700 font-medium">QuickCart Nig Ltd</div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-black text-slate-900 tracking-wider">0561627855</span>
                <button
                  type="button"
                  onClick={() => handleCopyAccount('0561627855')}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Guarantees & Policies */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <Truck className="w-4 h-4" />
              <span>Speedy Dispatch</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              10 to 20 mins in Moniya, 20 to 40 mins across UI, Bodija, Ojoo & Ibadan central.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Freshness Pledge</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Direct factory sealed cartons & fresh farm eggs and yams sourced from Oyo farms.
            </p>
          </div>

          <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
              <RotateCcw className="w-4 h-4" />
              <span>24hr Replacement</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Damaged seals or incorrect items are replaced immediately upon delivery inspection.
            </p>
          </div>
        </div>

        {/* Other Pickup Outlets */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            All 6 Ibadan Pickup & Fulfillment Hubs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {STORE_BRANCHES.map((b) => (
              <div key={b.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 space-y-0.5">
                <div className="font-bold text-slate-900">{b.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{b.address}</div>
                <div className="text-[10px] text-slate-400">🕒 {b.operatingHours}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Close Store Info
          </button>
        </div>
      </div>
    </div>
  );
};
