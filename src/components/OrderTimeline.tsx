import React from 'react';
import {
  Inbox,
  Package,
  Clock,
  CheckCircle2,
  Check,
  Truck,
  Store,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { CompletedOrder } from '../types.ts';

export type OrderStatus = CompletedOrder['status'];

interface OrderTimelineProps {
  status: OrderStatus;
  orderType: 'delivery' | 'pickup';
  onStatusChange?: (newStatus: OrderStatus) => void;
  compact?: boolean;
}

interface StepConfig {
  key: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  activePillClass: string;
  badgeBg: string;
  badgeText: string;
  activeRing: string;
  nodeBg: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const STATUS_PILL_CONFIG: Record<
  OrderStatus,
  { label: string; pillClass: string; dotClass: string }
> = {
  Received: {
    label: 'Received',
    pillClass: 'bg-blue-100 text-blue-800 border-blue-200',
    dotClass: 'bg-blue-500',
  },
  Packing: {
    label: 'Packing',
    pillClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  'Ready for Pickup': {
    label: 'Ready',
    pillClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-500',
  },
  Delivered: {
    label: 'Delivered',
    pillClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export const OrderStatusPill: React.FC<{
  status: OrderStatus;
  orderType?: 'delivery' | 'pickup';
  size?: 'sm' | 'md';
}> = ({ status, orderType, size = 'sm' }) => {
  const config = STATUS_PILL_CONFIG[status] || STATUS_PILL_CONFIG.Received;
  let displayLabel = config.label;
  if (status === 'Ready for Pickup' && orderType === 'delivery') {
    displayLabel = 'Ready for Dispatch';
  } else if (status === 'Delivered' && orderType === 'pickup') {
    displayLabel = 'Collected';
  }

  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold border shadow-2xs transition ${config.pillClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <span>{displayLabel}</span>
    </span>
  );
};

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  orderType,
  onStatusChange,
  compact = false,
}) => {
  const steps: StepConfig[] = [
    {
      key: 'Received',
      label: 'Order Received',
      shortLabel: 'Received',
      description: 'Logged into store system',
      activePillClass: 'bg-blue-600 text-white shadow-blue-500/30',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeText: 'text-blue-700',
      activeRing: 'ring-blue-400',
      nodeBg: 'bg-blue-600',
      icon: Inbox,
    },
    {
      key: 'Packing',
      label: 'Packing Items',
      shortLabel: 'Packing',
      description: 'Bagging from shelves',
      activePillClass: 'bg-amber-600 text-white shadow-amber-500/30',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeText: 'text-amber-700',
      activeRing: 'ring-amber-400',
      nodeBg: 'bg-amber-600',
      icon: Package,
    },
    {
      key: 'Ready for Pickup',
      label: orderType === 'delivery' ? 'Ready for Dispatch' : 'Ready for Pickup',
      shortLabel: 'Ready',
      description: orderType === 'delivery' ? 'Rider picking up' : 'Awaiting customer pickup',
      activePillClass: 'bg-purple-600 text-white shadow-purple-500/30',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      badgeText: 'text-purple-700',
      activeRing: 'ring-purple-400',
      nodeBg: 'bg-purple-600',
      icon: orderType === 'delivery' ? Truck : Store,
    },
    {
      key: 'Delivered',
      label: orderType === 'delivery' ? 'Delivered' : 'Collected',
      shortLabel: 'Delivered',
      description: 'Order fulfilled successfully',
      activePillClass: 'bg-emerald-600 text-white shadow-emerald-500/30',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeText: 'text-emerald-700',
      activeRing: 'ring-emerald-400',
      nodeBg: 'bg-emerald-600',
      icon: CheckCircle2,
    },
  ];

  const currentIdx = steps.findIndex((s) => s.key === status);
  const activeStepIdx = currentIdx >= 0 ? currentIdx : 0;

  const nextStep = steps[activeStepIdx + 1];

  return (
    <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/90 space-y-3.5">
      {/* Header with active pill & quick action button */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Order Progress:
          </span>
          <OrderStatusPill status={status} orderType={orderType} size="md" />
        </div>

        {/* Quick Advance Button (Only in admin/edit mode) */}
        {onStatusChange && nextStep && (
          <button
            type="button"
            onClick={() => onStatusChange(nextStep.key)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 active:scale-95 text-white text-xs font-bold shadow-xs transition"
          >
            <span>Advance to &ldquo;{nextStep.shortLabel}&rdquo;</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Visual Stepper Bar */}
      <div className="relative pt-2 pb-1">
        {/* Connecting Progress Bar */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-6 left-6 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `calc(${activeStepIdx / (steps.length - 1)} * (100% - 3rem))`,
          }}
        />

        {/* Step Nodes */}
        <div className="relative z-10 grid grid-cols-4 gap-1">
          {steps.map((step, idx) => {
            const isCompleted = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            const isPending = idx > activeStepIdx;

            const StepIcon = step.icon;

            return (
              <div
                key={step.key}
                onClick={() => onStatusChange && onStatusChange(step.key)}
                className={`flex flex-col items-center text-center group ${
                  onStatusChange ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={onStatusChange ? `Click to set status to ${step.label}` : step.label}
              >
                {/* Circle Indicator */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? `${step.nodeBg} text-white shadow-md ring-4 ${step.activeRing} ring-offset-2 ring-offset-slate-50 scale-105`
                      : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-2.5 space-y-0.5">
                  <div
                    className={`text-xs font-bold tracking-tight transition ${
                      isCurrent
                        ? 'text-slate-900'
                        : isCompleted
                        ? 'text-emerald-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.shortLabel}
                  </div>
                  {!compact && (
                    <p className="text-[10px] text-slate-500 hidden sm:block max-w-[90px] leading-tight mx-auto">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Active Indicator Pin */}
                {isCurrent && (
                  <span className="mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
