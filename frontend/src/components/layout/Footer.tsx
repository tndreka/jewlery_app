import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary text-white mt-0">
      {/* Marquee strip */}
      <div className="overflow-hidden py-5 border-b border-white/10">
        <div className="animate-marquee whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-block text-[10px] tracking-[0.5em] uppercase text-white/20 mx-12">
              Argjendari Kadriu &mdash; Fine Gold Jewelry &mdash; Handcrafted in Albania &mdash;
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/logo.jpeg" alt="Argjendari Kadriu" className="h-16 md:h-20 object-contain" />
            <p className="mt-6 text-[12px] leading-relaxed text-white/40 max-w-xs font-light">
              Timeless gold jewelry, meticulously crafted. Each piece carries the tradition of fine Albanian goldsmithing.
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">Collections</h4>
            <nav className="flex flex-col gap-3">
              {['rings', 'necklaces', 'bracelets', 'earrings', 'sets'].map(cat => (
                <Link
                  key={cat}
                  to={`/category/${cat}`}
                  className="text-[12px] font-light text-white/50 hover:text-gold transition-colors capitalize"
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">Connect</h4>
            <nav className="flex flex-col gap-3">
              <a
                href="https://instagram.com/argjendarikadriu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-light text-white/50 hover:text-gold transition-colors"
              >
                Instagram
              </a>
              <a href="https://wa.me/" className="text-[12px] font-light text-white/50 hover:text-gold transition-colors">
                WhatsApp
              </a>
              <span className="text-[12px] font-light text-white/50">
                Bulevardi Zogu i Pare
              </span>
            </nav>
          </div>
        </div>

        <div className="h-[1px] bg-white/10 mt-16 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-[10px] text-white/20 tracking-[0.15em]">
            &copy; {new Date().getFullYear()} Argjendari Kadriu. All rights reserved.
          </p>
          <p className="text-[10px] text-white/20 tracking-[0.15em]">
            Handcrafted with care
          </p>
        </div>
      </div>
    </footer>
  );
}
