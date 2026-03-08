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
      <div className="pt-[70px] text-center py-32">
        <p className="font-display text-[20px] font-light text-secondary italic">Your bag is empty</p>
        <Link to="/shop" className="mt-6 inline-block link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary">
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

  const inputClass = "w-full border-b border-border py-3 text-[13px] font-light outline-none focus:border-gold transition-colors duration-300 bg-transparent placeholder:text-secondary/50 tracking-wide";

  return (
    <div className="pt-[70px]">
      <div className="bg-cream py-14 md:py-16">
        <h1 className="text-center font-display text-[28px] md:text-[36px] font-light tracking-[0.05em]">
          Checkout
        </h1>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-1">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-secondary font-light mb-6">
              Contact Information
            </h2>

            <input type="text" placeholder="Full Name" required value={form.customer_name}
              onChange={e => updateField('customer_name', e.target.value)} className={inputClass} />
            <input type="email" placeholder="Email" required value={form.customer_email}
              onChange={e => updateField('customer_email', e.target.value)} className={inputClass} />
            <input type="tel" placeholder="Phone (optional)" value={form.customer_phone}
              onChange={e => updateField('customer_phone', e.target.value)} className={inputClass} />

            <h2 className="text-[10px] tracking-[0.3em] uppercase text-secondary font-light mb-6 pt-8">
              Shipping Address
            </h2>

            <textarea placeholder="Full Address" required rows={3} value={form.shipping_address}
              onChange={e => updateField('shipping_address', e.target.value)}
              className={`${inputClass} resize-none`} />

            {error && <p className="text-red-600 text-[12px] font-light mt-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-8 bg-primary text-white py-4 text-[10px] tracking-[0.3em] uppercase font-light hover:bg-gold transition-colors duration-400 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : `Place Order — $${cart.subtotal.toFixed(2)}`}
            </button>
          </form>

          {/* Summary */}
          <div>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-secondary font-light mb-6">
              Order Summary
            </h2>
            <div className="space-y-5">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 bg-surface shrink-0 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] tracking-[0.1em] uppercase font-light">{item.product_name}</p>
                    <p className="text-[11px] text-secondary font-light mt-1">
                      Qty: {item.quantity} &middot; ${((item.sale_price || item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-5">
              <div className="flex justify-between text-[12px] font-light">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-light mt-2">
                <span>Shipping</span>
                <span className="text-gold">Complimentary</span>
              </div>
              <div className="flex justify-between text-[14px] mt-5 pt-5 border-t border-border">
                <span className="font-light">Total</span>
                <span className="font-display text-[18px]">${cart.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
