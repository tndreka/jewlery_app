import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { api } from '../lib/api';

export default function Checkout() {
  const { cart, refresh } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cart.items.length === 0) {
    return (
      <div className="pt-24 text-center py-20">
        <p className="text-secondary text-[13px]">Your bag is empty.</p>
        <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 mt-4 inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const order = await api.placeOrder(form);
      await refresh();
      navigate(`/order/${order.order_number}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto px-5 md:px-10">
        <h1 className="text-center text-[13px] tracking-[0.25em] uppercase mb-10">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-secondary mb-4">Contact Information</h2>

            <input
              type="text"
              placeholder="Full Name *"
              required
              value={form.customer_name}
              onChange={e => updateField('customer_name', e.target.value)}
              className="w-full border-b border-border py-3 text-[14px] outline-none focus:border-primary transition-colors bg-transparent"
            />
            <input
              type="email"
              placeholder="Email *"
              required
              value={form.customer_email}
              onChange={e => updateField('customer_email', e.target.value)}
              className="w-full border-b border-border py-3 text-[14px] outline-none focus:border-primary transition-colors bg-transparent"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.customer_phone}
              onChange={e => updateField('customer_phone', e.target.value)}
              className="w-full border-b border-border py-3 text-[14px] outline-none focus:border-primary transition-colors bg-transparent"
            />

            <h2 className="text-[11px] tracking-[0.2em] uppercase text-secondary mb-4 pt-4">Shipping Address</h2>

            <textarea
              placeholder="Full Address *"
              required
              rows={3}
              value={form.shipping_address}
              onChange={e => updateField('shipping_address', e.target.value)}
              className="w-full border-b border-border py-3 text-[14px] outline-none focus:border-primary transition-colors bg-transparent resize-none"
            />

            {error && <p className="text-red-600 text-[13px]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white py-3.5 text-[12px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Processing...' : `Place Order — $${cart.subtotal.toFixed(2)}`}
            </button>
          </form>

          {/* Order summary */}
          <div>
            <h2 className="text-[11px] tracking-[0.2em] uppercase text-secondary mb-6">Order Summary</h2>
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-surface shrink-0 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] tracking-[0.1em] uppercase">{item.product_name}</p>
                    <p className="text-[12px] text-secondary mt-1">
                      Qty: {item.quantity} &middot; ${(item.sale_price || item.price) * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-4">
              <div className="flex justify-between text-[13px]">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[13px] mt-2">
                <span>Shipping</span>
                <span className="text-secondary">Free</span>
              </div>
              <div className="flex justify-between text-[14px] font-medium mt-4 pt-4 border-t border-border">
                <span>Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
