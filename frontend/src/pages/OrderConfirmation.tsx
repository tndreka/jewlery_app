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
      <div className="pt-24 flex justify-center py-20">
        <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-28">
      <div className="max-w-lg mx-auto px-5 md:px-10 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-[15px] tracking-[0.2em] uppercase mb-2">Order Confirmed</h1>
        <p className="text-secondary text-[13px]">Thank you for your order.</p>

        <div className="bg-surface p-6 mt-8 text-left">
          <p className="text-[11px] tracking-[0.15em] uppercase text-secondary mb-3">Order Details</p>
          <p className="text-[14px] font-medium">#{order.order_number}</p>
          <p className="text-[13px] text-secondary mt-1 capitalize">Status: {order.status}</p>

          <div className="mt-4 space-y-2">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-[13px]">
                <span>{item.product_name} &times; {item.quantity}</span>
                <span>${item.unit_price}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-4 pt-3 flex justify-between text-[14px] font-medium">
            <span>Total</span>
            <span>${order.total}</span>
          </div>

          {order.tracking_number && (
            <p className="mt-4 text-[13px]">
              Tracking: <span className="font-medium">{order.tracking_number}</span>
            </p>
          )}
        </div>

        <Link
          to="/shop"
          className="inline-block mt-8 text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 text-secondary hover:text-primary"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
