import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useI18n } from '../../i18n';

const backdropVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function CartDrawer() {
  const { cart, isOpen, setIsOpen, updateItem, removeItem, loading } = useCart();
  const { t } = useI18n();
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const backdropOpacity = useTransform(dragX, [0, 300], [1, 0]);

  // Lock body scroll & focus trap
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusable = drawer.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsOpen(false); return; }
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    first?.focus();
    document.addEventListener('keydown', handleTab);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, setIsOpen]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 300) {
      setIsOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{ opacity: backdropOpacity }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            ref={drawerRef}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col touch-pan-y"
            initial={{ x: '100%' }}
            animate={{ x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } }}
            exit={{ x: '100%', transition: { type: 'spring' as const, stiffness: 300, damping: 30 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            role="dialog"
            aria-modal="true"
            aria-label={t('cart.bag')}
          >
            <div className="flex items-center justify-between px-6 h-[60px] border-b border-border">
              <h2 className="text-[10px] tracking-[0.3em] uppercase font-light">
                {t('cart.bag')} ({itemCount})
              </h2>
              <button onClick={() => setIsOpen(false)} className="p-3 -mr-3 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 overscroll-contain" data-lenis-prevent>
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="font-display text-[36px] text-border font-light italic">{t('cart.empty')}</span>
                  <p className="mt-3 text-[11px] text-secondary font-light tracking-wide">{t('cart.waiting')}</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 border border-primary text-primary px-8 py-3 text-[10px] tracking-[0.2em] uppercase font-light active:bg-primary active:text-white transition-all duration-400 min-h-[44px]"
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4"
                    >
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
                            className="w-9 h-9 border border-border flex items-center justify-center text-[14px] font-light active:border-primary active:bg-surface transition-colors min-h-[44px] min-w-[44px]"
                          >
                            -
                          </button>
                          <span className="text-[13px] w-5 text-center font-light">{item.quantity}</span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="w-9 h-9 border border-border flex items-center justify-center text-[14px] font-light active:border-primary active:bg-surface transition-colors min-h-[44px] min-w-[44px]"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 self-start text-secondary active:text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Remove"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cart.items.length > 0 && (
              <div className="border-t border-border px-6 py-5 safe-area-bottom">
                <div className="flex justify-between mb-5">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-light">{t('cart.subtotal')}</span>
                  <span className="text-[14px] font-light">${cart.subtotal.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-primary text-white text-center py-4 text-[10px] tracking-[0.3em] uppercase font-light active:bg-gold transition-colors duration-400 min-h-[48px] flex items-center justify-center"
                >
                  {t('cart.checkout')}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
