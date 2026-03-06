import { Link } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  { to: '/shop', label: 'Shop All' },
  { to: '/category/rings', label: 'Rings' },
  { to: '/category/necklaces', label: 'Necklaces' },
  { to: '/category/bracelets', label: 'Bracelets' },
  { to: '/category/earrings', label: 'Earrings' },
  { to: '/category/sets', label: 'Sets' },
  { to: '/category/watches', label: 'Watches' },
];

export default function MobileMenu({ isOpen, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-in menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-end p-5">
          <button onClick={onClose} className="p-2" aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="#1A1A1A" strokeWidth="1.5" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-8 gap-6">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="text-[13px] tracking-[0.2em] uppercase text-primary hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
