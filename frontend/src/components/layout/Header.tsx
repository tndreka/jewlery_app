import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import MobileMenu from './MobileMenu';
import SearchOverlay from './SearchOverlay';

export default function Header() {
  const { cart, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 md:px-10 h-16">
          {/* Left — Menu */}
          <button onClick={() => setMenuOpen(true)} className="p-2 -ml-2" aria-label="Menu">
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
              <line y1="1" x2="22" y2="1" stroke="#1A1A1A" strokeWidth="1.5" />
              <line y1="7" x2="22" y2="7" stroke="#1A1A1A" strokeWidth="1.5" />
              <line y1="13" x2="22" y2="13" stroke="#1A1A1A" strokeWidth="1.5" />
            </svg>
          </button>

          {/* Center — Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-[15px] md:text-[17px] font-light tracking-[0.25em] uppercase">
              Argjendari Kadriu
            </h1>
          </Link>

          {/* Right — Search + Cart */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="p-2" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 relative" aria-label="Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex justify-center gap-8 pb-3 text-[11px] tracking-[0.2em] uppercase text-secondary">
          <Link to="/shop" className="hover:text-primary transition-colors">Shop All</Link>
          <Link to="/category/rings" className="hover:text-primary transition-colors">Rings</Link>
          <Link to="/category/necklaces" className="hover:text-primary transition-colors">Necklaces</Link>
          <Link to="/category/bracelets" className="hover:text-primary transition-colors">Bracelets</Link>
          <Link to="/category/earrings" className="hover:text-primary transition-colors">Earrings</Link>
          <Link to="/category/sets" className="hover:text-primary transition-colors">Sets</Link>
        </nav>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
