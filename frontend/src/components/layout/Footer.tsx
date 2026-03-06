import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-20">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="text-[14px] tracking-[0.25em] uppercase font-light mb-4">
              Argjendari Kadriu
            </h3>
            <p className="text-[13px] text-white/60 leading-relaxed">
              Handcrafted jewelry with timeless elegance. Every piece tells a story.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-4 text-white/40">Shop</h4>
            <nav className="flex flex-col gap-3 text-[13px] text-white/60">
              <Link to="/shop" className="hover:text-white transition-colors">All Products</Link>
              <Link to="/category/rings" className="hover:text-white transition-colors">Rings</Link>
              <Link to="/category/necklaces" className="hover:text-white transition-colors">Necklaces</Link>
              <Link to="/category/bracelets" className="hover:text-white transition-colors">Bracelets</Link>
              <Link to="/category/earrings" className="hover:text-white transition-colors">Earrings</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase mb-4 text-white/40">Contact</h4>
            <div className="flex flex-col gap-3 text-[13px] text-white/60">
              <a href="https://instagram.com/argjendarikadriu" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Instagram
              </a>
              <a href="https://wa.me/" className="hover:text-white transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-[11px] text-white/30 tracking-[0.1em]">
          &copy; {new Date().getFullYear()} Argjendari Kadriu. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
