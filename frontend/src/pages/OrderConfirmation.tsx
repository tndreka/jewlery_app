import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import type { Order } from '../types';

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    api.getOrder(orderNumber).then(setOrder).catch(() => {});
  }, [orderNumber]);

  if (!order) {
    return (
      <div className="pt-[70px] flex justify-center py-32">
        <div className="w-5 h-5 border border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-[70px]">
      <div className="max-w-lg mx-auto px-6 md:px-12 py-16 md:py-24 text-center">
        {/* Success mark */}
        <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-gold/30 flex items-center justify-center animate-scale-in">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b8976a" strokeWidth="1.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-display text-[24px] md:text-[32px] font-light tracking-[0.05em] animate-fade-up">
          Thank You
        </h1>
        <p className="mt-2 text-[12px] text-secondary font-light tracking-wide animate-fade-up" style={{ animationDelay: '100ms' }}>
          Your order has been confirmed
        </p>

        <div className="bg-cream p-8 mt-10 text-left animate-fade-up" style={{ animationDelay: '200ms' }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-secondary font-light mb-4">Order Details</p>
          <p className="font-display text-[18px] font-light">#{order.order_number}</p>
          <p className="text-[11px] text-secondary font-light mt-1 capitalize">{order.status}</p>

          <div className="mt-5 space-y-2.5">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-[12px] font-light">
                <span>{item.product_name} &times; {item.quantity}</span>
                <span>${item.unit_price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-5 pt-4 flex justify-between">
            <span className="text-[12px] font-light">Total</span>
            <span className="font-display text-[16px]">${order.total}</span>
          </div>

          {order.tracking_number && (
            <p className="mt-4 text-[12px] font-light">
              Tracking: <span className="text-gold">{order.tracking_number}</span>
            </p>
          )}
        </div>

        <Link
          to="/shop"
          className="mt-10 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
