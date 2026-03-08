import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useI18n } from '../../i18n';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { cart, setIsOpen } = useCart();
  const { lang, setLang, t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const isHome = location.pathname === '/';

  const navLinks = [
    { to: '/shop', label: t('nav.shop') },
    { to: '/category/rings', label: t('nav.rings') },
    { to: '/category/necklaces', label: t('nav.necklaces') },
    { to: '/category/bracelets', label: t('nav.bracelets') },
    { to: '/category/earrings', label: t('nav.earrings') },
    { to: '/category/sets', label: t('nav.sets') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerBg = scrolled || !isHome
    ? 'bg-white/95 backdrop-blur-md border-b border-border/50'
    : 'bg-transparent';

  const textColor = scrolled || !isHome ? 'text-primary' : 'text-white';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
        <div className="flex items-center justify-between px-6 md:px-12 h-[60px] md:h-[70px]">
          <button
            onClick={() => setMenuOpen(true)}
            className={`md:hidden p-2 -ml-2 ${textColor} transition-colors duration-500`}
            aria-label="Menu"
          >
            <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <line x1="0" y1="1" x2="20" y2="1" />
              <line x1="0" y1="6" x2="14" y2="6" />
              <line x1="0" y1="11" x2="20" y2="11" />
            </svg>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, 3).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`link-reveal text-[10.5px] font-light tracking-[0.22em] uppercase ${textColor} transition-colors duration-500`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <img
              src="/logo.png"
              alt="Argjendari Kadriu"
              className="h-12 md:h-14 object-contain transition-all duration-500"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.slice(3).map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`link-reveal text-[10.5px] font-light tracking-[0.22em] uppercase ${textColor} transition-colors duration-500`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={() => setLang(lang === 'EN' ? 'AL' : 'EN')}
              className={`text-[10px] tracking-[0.15em] font-light ${textColor} transition-colors duration-500 hover:text-gold`}
              aria-label="Switch language"
            >
              {lang === 'EN' ? 'AL' : 'EN'}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className={`p-1 ${textColor} transition-colors duration-500`}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className={`p-1 relative ${textColor} transition-colors duration-500`}
              aria-label="Cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-[18px] h-[18px] bg-gold text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
