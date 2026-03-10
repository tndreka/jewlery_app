import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useI18n } from '../../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const linkVariants = {
  closed: { opacity: 0, y: 15 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function MobileMenu({ isOpen, onClose }: Props) {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);
  const backdropOpacity = useTransform(dragX, [-300, 0], [0, 1]);

  const links = [
    { to: '/shop', label: t('nav.shopAll') },
    { to: '/category/rings', label: t('nav.rings') },
    { to: '/category/necklaces', label: t('nav.necklaces') },
    { to: '/category/bracelets', label: t('nav.bracelets') },
    { to: '/category/earrings', label: t('nav.earrings') },
    { to: '/category/sets', label: t('nav.sets') },
  ];

  // Lock body scroll & focus trap
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const menu = menuRef.current;
    if (!menu) return;

    const focusable = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
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
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -80 || info.velocity.x < -300) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ opacity: backdropOpacity }}
            onClick={onClose}
          />

          <motion.div
            ref={menuRef}
            className="fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 touch-pan-y"
            initial={{ x: '-100%' }}
            animate={{ x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } }}
            exit={{ x: '-100%', transition: { type: 'spring' as const, stiffness: 300, damping: 30 } }}
            drag="x"
            dragConstraints={{ left: -300, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{ x: dragX }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex justify-between items-center px-6 h-[60px]">
              <img src="/logo.png" alt="Argjendari Kadriu" className="h-8 object-contain" />
              <button onClick={onClose} className="p-3 -mr-3 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="h-[1px] bg-border mx-6" />

            <nav className="flex flex-col px-6 pt-8">
              {links.map((link, i) => (
                <motion.div
                  key={link.to}
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                  custom={i}
                >
                  <Link
                    to={link.to}
                    onClick={onClose}
                    className="block py-4 border-b border-border/50 font-display text-[22px] font-light tracking-[0.15em] text-primary active:text-gold transition-colors min-h-[52px] flex items-center"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 safe-area-bottom">
              <div className="flex gap-6 text-[11px] tracking-[0.2em] uppercase text-secondary">
                <a href="https://instagram.com/argjendarikadriu" target="_blank" rel="noopener noreferrer" className="active:text-gold transition-colors py-2">
                  Instagram
                </a>
                <a href="https://wa.me/355696049949" className="active:text-gold transition-colors py-2">
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
