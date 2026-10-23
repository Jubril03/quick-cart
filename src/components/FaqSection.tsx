import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Is QuickCart a physical supermarket or grocery store?',
    a: 'No! QuickCart is a technology bridge — just like Bolt is a bridge between drivers and riders without owning the cars. QuickCart bridges local market sellers (grain merchants, open-market traders in Moniya & Bodija, wholesalers) with busy buyers. Our multimodal AI reads your messy or handwritten shopping list, matches items to vetted sellers at fair market prices, and dispatches a nearby rider to deliver.',
  },
  {
    q: 'How does snapping a handwritten grocery list or receipt work?',
    a: 'Simply tap "Upload / Snap Photo" with your phone camera or select an existing photo of your grocery list scribbled on paper, lined notepad, or previous receipt. Our multimodal parser reads your handwriting, extracts items and quantities, matches them against verified local seller inventory across Ibadan, and builds your shopping bill in seconds.',
  },
  {
    q: 'Can I type my order in Nigerian Pidgin English?',
    a: 'Yes, 100%! You can type things like "Abeg give me 1 carton indomie, 2 congo of beans, 3 peak milk and one crate of eggs". Our parser understands local units (congo, derica, paint rubber, crate, carton) and local colloquial phrasing.',
  },
  {
    q: 'Where are the pickup partner hubs located in Ibadan?',
    a: 'Our main partner pickup and fulfillment hub is at Plot 12, Oyo-Ibadan Expressway, Moniya Central (directly opposite the Train Station Road), Moniya, Ibadan, Oyo State, with 5 other pickup partner hubs in Ojoo, Bodija, UI / Agbowo, Dugbe, and Ring Road. In-hub pickup is always 100% free with no handling fees.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery, POS card swipe with the dispatch rider upon delivery, Direct Instant Bank Transfer to our verified corporate OPay/GTBank accounts, and debit cards. For bank transfers, simply use your Order Number (e.g. ORD-105) as the payment description.',
  },
  {
    q: 'How fast is delivery to UI, Bodija, Ojoo, or Ring Road?',
    a: 'Moniya and Akinyele orders arrive in 10 to 20 minutes. Ojoo, Shasha, UI campus, and Agbowo arrive in 15 to 30 minutes. Bodija, Samonda, and Dugbe arrive in 25 to 40 minutes. Challenge and Ring Road arrive within 35 to 50 minutes.',
  },
  {
    q: 'What if an item on my list is not in stock with partner sellers?',
    a: 'Any item written on your list that isn’t currently available from vetted sellers is highlighted in an "Unmatched Items" alert box on your bill. Our customer care team will call or message your WhatsApp to suggest fresh market substitutions before dispatching.',
  },
  {
    q: 'What is your refund and return policy for food & household goods?',
    a: 'We guarantee 100% authenticity and freshness. If any factory seal is broken or an item is damaged during transit, let our dispatch rider know immediately for on-the-spot exchange, or message customer care within 24 hours with your receipt.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-base text-slate-900">
            Frequently Asked Questions & Customer Guide
          </h3>
        </div>
        <span className="text-xs text-slate-400">Everything you need to know</span>
      </div>

      <div className="divide-y divide-slate-100">
        {FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="py-3">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 hover:text-blue-600 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-6 animate-in fade-in duration-150">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
