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
        <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10 h-[60px] md:h-[70px]">
          {/* Left: hamburger (mobile) / nav links (desktop) */}
          <div className="flex items-center">
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

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.slice(0, 3).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`link-reveal text-[10px] font-light tracking-[0.18em] uppercase ${textColor} transition-colors duration-500`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          <Link to="/" className="flex justify-center px-4">
            <img
              src="/logo.png"
              alt="Argjendari Kadriu"
              className="h-10 md:h-12 object-contain transition-all duration-500"
            />
          </Link>

          {/* Right: nav links (desktop) + actions */}
          <div className="flex items-center justify-end gap-6">
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.slice(3).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`link-reveal text-[10px] font-light tracking-[0.18em] uppercase ${textColor} transition-colors duration-500`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
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
                onClick={() => setLang(lang === 'EN' ? 'AL' : 'EN')}
                className={`p-1 text-[9px] tracking-[0.1em] font-light border border-current/30 rounded px-1.5 py-0.5 ${textColor} transition-colors duration-500 hover:text-gold hover:border-gold/50`}
                aria-label="Switch language"
              >
                {lang === 'EN' ? 'AL' : 'EN'}
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
        </div>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
