import React, { useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  X,
  ExternalLink,
  Volume2
} from 'lucide-react';

export interface AppNotification {
  id: string;
  orderNumber: number;
  title: string;
  body: string;
  status: 'Ready for Pickup' | 'Delivered';
  createdAt: string;
  read: boolean;
}

export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone pleasant notification chime
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // Ignore audio permission restrictions
  }
};

interface NotificationToastProps {
  notification: AppNotification;
  onDismiss: (id: string) => void;
  onViewOrder: (orderNumber: number) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onViewOrder,
}) => {
  // Auto-dismiss toast after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 7000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const isDelivered = notification.status === 'Delivered';

  return (
    <div
      role="alert"
      className="max-w-md w-full bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/80 pointer-events-auto transform transition-all duration-300 ease-out animate-in fade-in slide-in-from-top-4"
    >
      <div className="flex items-start gap-3">
        {/* App Icon styled like Chrome/OS notification badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
            isDelivered
              ? 'bg-emerald-600 text-white'
              : 'bg-purple-600 text-white'
          }`}
        >
          {isDelivered ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <PackageCheck className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1">
                <Bell className="w-3 h-3" /> QuickCart Push
              </span>
              <span className="text-slate-500 text-[10px]">· Just now</span>
            </div>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="font-bold text-sm text-slate-100 leading-snug">
            {notification.title}
          </h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {notification.body}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => onViewOrder(notification.orderNumber)}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1"
            >
              <span>View Order #{notification.orderNumber}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDismiss(notification.id)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
