import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

export default function Footer() {
  const { t } = useI18n();

  const catLinks = [
    { slug: 'rings', label: t('nav.rings') },
    { slug: 'necklaces', label: t('nav.necklaces') },
    { slug: 'bracelets', label: t('nav.bracelets') },
    { slug: 'earrings', label: t('nav.earrings') },
    { slug: 'sets', label: t('nav.sets') },
  ];

  return (
    <footer className="bg-primary text-white mt-0">
      <div className="overflow-hidden py-5 border-b border-white/10">
        <div className="animate-marquee whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="inline-block text-[10px] tracking-[0.5em] uppercase text-white/20 mx-12">
              {t('footer.marquee')}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <img src="/logo.png" alt="Argjendari Kadriu" className="h-24 md:h-28 object-contain" />
            <p className="mt-6 text-[12px] leading-relaxed text-white/40 max-w-xs font-light">
              {t('footer.desc')}
            </p>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">{t('footer.collections')}</h4>
            <nav className="flex flex-col gap-3">
              {catLinks.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="text-[12px] font-light text-white/50 hover:text-gold transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-6">{t('footer.connect')}</h4>
            <nav className="flex flex-col gap-3">
              <a
                href="https://instagram.com/argjendarikadriu"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] font-light text-white/50 hover:text-gold transition-colors"
              >
                Instagram
              </a>
              <a href="https://wa.me/355696049949" className="text-[12px] font-light text-white/50 hover:text-gold transition-colors">
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
            &copy; {new Date().getFullYear()} Argjendari Kadriu. {t('footer.rights')}
          </p>
          <p className="text-[10px] text-white/20 tracking-[0.15em]">
            {t('footer.handcrafted')}
          </p>
        </div>
      </div>
    </footer>
  );
}
