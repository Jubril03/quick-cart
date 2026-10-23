import React from 'react';
import { X, Scale, Info, CheckCircle2 } from 'lucide-react';

interface UnitGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitGuideModal: React.FC<UnitGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const unitGuides = [
    {
      unit: 'Congo (Standard Market Measurement)',
      equivalent: '≈ 1.2 kg to 1.3 kg',
      appliesTo: 'Rice, Brown Beans, White Garri, Guinea Corn',
      description:
        'Standard metal measurement bowl used across Moniya, Bodija, and Ojoo markets. When you order "2 congo of rice", we pack 2.4kg to 2.5kg of stone-free rice.',
    },
    {
      unit: 'Derica (Derica Tin)',
      equivalent: '≈ 850 grams (0.85 kg)',
      appliesTo: 'Ijebu Garri, Egusi, Crayfish, Beans',
      description:
        'Originally adapted from the tomato paste tin. Commonly used for Ijebu garri, groundnut, and soup condiments. 1 paint rubber contains approximately 4 to 5 dericas.',
    },
    {
      unit: 'Paint Rubber (4-Litre Plastic Bucket)',
      equivalent: '≈ 4.0 kg dry grains',
      appliesTo: 'Garri, Beans, Rice, Sweet Potatoes',
      description:
        'The ubiquitous 4L plastic paint container used in Nigerian open markets for medium bulk family shopping.',
    },
    {
      unit: 'Crate of Eggs',
      equivalent: '30 Fresh Farm Eggs',
      appliesTo: 'Farm Fresh Layer Eggs',
      description:
        'A full cardboard interlocking tray with 30 graded, unwashed fresh poultry eggs sourced directly from farms in Akinyele/Ibadan.',
    },
    {
      unit: 'Carton (Instant Noodles)',
      equivalent: '40 Single Packs (70g each)',
      appliesTo: 'Indomie Onion Chicken, Hungry Man',
      description:
        'Original sealed corrugated cardboard box containing 40 individual sachets with complete seasoning oil and chili sachets.',
    },
    {
      unit: 'Yam Tuber (Oyo White Yam)',
      equivalent: '≈ 2.5 kg to 3.5 kg per tuber',
      appliesTo: 'White Pounded Yam, Fried Yam (Dundun)',
      description:
        'Firm, fresh-cut white yam tubers harvested in Oyo/Saki rural belt, free from rot and hollows.',
    },
    {
      unit: 'Tin (Tomato Paste)',
      equivalent: '70 grams net weight',
      appliesTo: 'Gino, Sonia, De Rica tomato paste',
      description:
        'Double-concentrated thick tomato puree canned in airtight tin with pull-tab or puncture rim.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Nigerian Market Unit Guide
              </h3>
              <p className="text-xs text-slate-500">
                How QuickCart AI understands Congo, Derica, Paint Rubber, Crates & Cartons
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

        {/* Tip Box */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Pidgin & Local Slang Friendly:</strong> You don’t need metric kilograms! You can snap your paper list with &ldquo;2 congo of beans and 1 carton indomie&rdquo; or type it directly. QuickCart will automatically calculate the precise supermarket quantity and price.
          </div>
        </div>

        {/* Unit Cards List */}
        <div className="space-y-3">
          {unitGuides.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition space-y-1.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-slate-900">{item.unit}</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-900 border border-amber-200 self-start sm:self-auto">
                  {item.equivalent}
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 font-medium">
                Common for: {item.appliesTo}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Clean & stone-free guarantee
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
