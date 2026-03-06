import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateItem, removeItem, loading } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <h2 className="text-[12px] tracking-[0.2em] uppercase">
            Bag ({cart.items.reduce((s, i) => s + i.quantity, 0)})
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2" aria-label="Close cart">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary">
              <p className="text-[13px] tracking-[0.1em]">Your bag is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-4 text-[11px] tracking-[0.2em] uppercase underline underline-offset-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-26 bg-surface shrink-0 overflow-hidden">
                    {item.image_url && (
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] tracking-[0.1em] uppercase truncate">{item.product_name}</p>
                    <p className="text-[13px] text-secondary mt-1">
                      ${item.sale_price || item.price}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                        disabled={loading}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm hover:border-primary transition-colors"
                      >
                        -
                      </button>
                      <span className="text-[13px] w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-7 h-7 border border-border flex items-center justify-center text-sm hover:border-primary transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 self-start text-secondary hover:text-primary"
                    aria-label="Remove"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
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
            <div className="flex justify-between mb-4">
              <span className="text-[12px] tracking-[0.15em] uppercase">Subtotal</span>
              <span className="text-[14px]">${cart.subtotal.toFixed(2)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="block w-full bg-primary text-white text-center py-3.5 text-[12px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
