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
];

export default function MobileMenu({ isOpen, onClose }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center px-6 h-[60px]">
          <img src="/logo.png" alt="Argjendari Kadriu" className="h-8 object-contain" />
          <button onClick={onClose} className="p-2 -mr-2" aria-label="Close menu">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-[1px] bg-border mx-6" />

        <nav className="flex flex-col px-6 pt-8">
          {links.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="py-4 border-b border-border/50 font-display text-[20px] font-light tracking-[0.15em] text-primary hover:text-gold transition-colors"
              style={isOpen ? { animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
          <div className="flex gap-6 text-[10px] tracking-[0.2em] uppercase text-secondary">
            <a href="https://instagram.com/argjendarikadriu" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">
              Instagram
            </a>
            <a href="https://wa.me/" className="hover:text-gold transition-colors">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
