import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateItem, removeItem, loading } = useCart();
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-[60px] border-b border-border">
          <h2 className="text-[10px] tracking-[0.3em] uppercase font-light">
            Bag ({itemCount})
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 -mr-2" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <span className="font-display text-[36px] text-border font-light italic">Empty</span>
              <p className="mt-3 text-[11px] text-secondary font-light tracking-wide">Your bag is waiting</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 border border-primary text-primary px-8 py-2.5 text-[10px] tracking-[0.2em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-400"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-surface shrink-0 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] tracking-[0.1em] uppercase font-light truncate">{item.product_name}</p>
                    <p className="text-[11px] text-secondary font-light mt-1">
                      ${item.sale_price || item.price}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        disabled={loading}
                        className="w-7 h-7 border border-border flex items-center justify-center text-[12px] font-light hover:border-primary transition-colors"
                      >
                        -
                      </button>
                      <span className="text-[12px] w-5 text-center font-light">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-7 h-7 border border-border flex items-center justify-center text-[12px] font-light hover:border-primary transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 self-start text-secondary hover:text-primary transition-colors"
                    aria-label="Remove"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-border px-6 py-5">
            <div className="flex justify-between mb-5">
              <span className="text-[10px] tracking-[0.2em] uppercase font-light">Subtotal</span>
              <span className="text-[14px] font-light">${cart.subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-primary text-white text-center py-4 text-[10px] tracking-[0.3em] uppercase font-light hover:bg-gold transition-colors duration-400"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
