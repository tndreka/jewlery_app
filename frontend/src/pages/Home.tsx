import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '../lib/api';
import { useI18n } from '../i18n';
import { useScrollAnimation, useParallax } from '../hooks/useScrollAnimation';
import type { Product, Category } from '../types';
import ProductCard from '../components/product/ProductCard';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Refs for hero animations
  const heroRef = useRef<HTMLElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroLineRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const heroParallaxRef = useParallax<HTMLImageElement>(0.3);

  // Refs for scroll-triggered sections
  const ctaSectionRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', duration: 1 });
  const dividerRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeIn' });

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts({ limit: '8' }),
    ])
      .then(async ([cats, recent]) => {
        const activeCats = cats.filter(c => c.product_count > 0);
        setCategories(activeCats);
        setRecentProducts(recent.products);

        const productMap: Record<string, Product[]> = {};
        await Promise.all(
          activeCats.map(async (cat) => {
            const { products } = await api.getCategoryProducts(cat.slug, { limit: '4' });
            productMap[cat.slug] = products;
          })
        );
        setCategoryProducts(productMap);
      })
      .finally(() => setLoading(false));
  }, []);

  // Hero timeline animation
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      if (heroSubRef.current) {
        gsap.set(heroSubRef.current, { opacity: 0, y: 20 });
        tl.to(heroSubRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      }

      if (heroTitleRef.current) {
        // Split text animation - animate each line
        const lines = heroTitleRef.current.querySelectorAll('.hero-line');
        gsap.set(lines, { opacity: 0, y: 40, rotateX: 15 });
        tl.to(lines, {
          opacity: 1, y: 0, rotateX: 0,
          duration: 1, stagger: 0.15, ease: 'power3.out',
        }, '-=0.4');
      }

      if (heroLineRef.current) {
        gsap.set(heroLineRef.current, { scaleX: 0 });
        tl.to(heroLineRef.current, { scaleX: 1, duration: 1.2, ease: 'power3.out' }, '-=0.6');
      }

      if (heroCtaRef.current) {
        gsap.set(heroCtaRef.current, { opacity: 0, y: 20 });
        tl.to(heroCtaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const heroProducts = recentProducts.filter(p => p.image_url).slice(0, 3);

  return (
    <div>
      <Helmet>
        <title>Argjendari Kadriu — Fine Gold Jewelry | Handcrafted in Albania</title>
        <meta name="description" content="Discover timeless gold jewelry, meticulously handcrafted in Albania. Rings, necklaces, bracelets, earrings and sets by Argjendari Kadriu." />
      </Helmet>

      {/* Hero with Parallax */}
      <section ref={heroRef} className="relative h-screen bg-primary overflow-hidden">
        {heroProducts.length > 0 && (
          <div className="absolute inset-0">
            <img
              ref={heroParallaxRef}
              src={heroProducts[0].image_url!}
              alt="Featured jewelry piece"
              className="w-full h-[120%] -mt-[10%] object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
          <p ref={heroSubRef} className="text-[10px] md:text-[11px] tracking-[0.6em] uppercase text-white/50 font-light">
            {t('home.fineGold')}
          </p>

          <h1
            ref={heroTitleRef}
            className="mt-4 font-display text-[40px] md:text-[72px] lg:text-[90px] font-light text-white leading-[0.95] tracking-[0.08em]"
            style={{ perspective: '600px' }}
          >
            <span className="hero-line block">Argjendari</span>
            <span className="hero-line block italic font-light">Kadriu</span>
          </h1>

          <div ref={heroLineRef} className="mt-8 h-[1px] w-16 bg-gold origin-center" />

          <Link
            ref={heroCtaRef}
            to="/shop"
            className="mt-10 inline-block border border-white/30 text-white px-12 py-4 text-[10px] tracking-[0.35em] uppercase font-light hover:bg-white hover:text-primary transition-all duration-500"
          >
            {t('home.discover')}
          </Link>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/30 font-light">{t('home.scroll')}</span>
          <div className="w-[1px] h-8 bg-white/20 relative overflow-hidden">
            <div className="w-full h-3 bg-gold/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Category Sections with ScrollTrigger */}
      {categories.map((cat, i) => {
        const products = categoryProducts[cat.slug] || [];
        const isEven = i % 2 === 0;
        const descKey = `cat.${cat.slug}`;

        return (
          <CategorySection
            key={cat.id}
            cat={cat}
            products={products}
            isEven={isEven}
            descKey={descKey}
            t={t}
          />
        );
      })}

      {/* Divider */}
      <div ref={dividerRef} className="flex items-center justify-center py-6">
        <div className="h-[1px] w-20 bg-border" />
        <img src="/logo.png" alt="Argjendari Kadriu logo" className="mx-6 h-8 object-contain opacity-30" />
        <div className="h-[1px] w-20 bg-border" />
      </div>

      {/* CTA */}
      <section className="relative py-28 md:py-40 overflow-hidden">
        {heroProducts.length > 1 && (
          <div className="absolute inset-0">
            <img src={heroProducts[1].image_url!} alt="Jewelry collection background" className="w-full h-full object-cover opacity-15" />
          </div>
        )}
        <div ref={ctaSectionRef} className="relative z-10 text-center px-6">
          <p className="text-[10px] tracking-[0.5em] uppercase text-secondary font-light">{t('home.visitUs')}</p>
          <h2 className="mt-4 font-display text-[28px] md:text-[48px] font-light tracking-[0.05em] leading-tight">
            Bulevardi Zogu i Pare
          </h2>
          <p className="mt-4 text-[12px] text-secondary font-light max-w-md mx-auto leading-relaxed">
            {t('home.visitDesc')}
          </p>
          <a
            href="https://instagram.com/argjendarikadriu"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
          >
            {t('home.followIg')}
          </a>
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-5 h-5 border border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Separate component for category sections to use hooks per-section
function CategorySection({
  cat,
  products,
  isEven,
  descKey,
  t,
}: {
  cat: Category;
  products: Product[];
  isEven: boolean;
  descKey: string;
  t: (key: string) => string;
}) {
  const textRef = useScrollAnimation<HTMLDivElement>({
    animation: isEven ? 'slideRight' : 'slideLeft',
    duration: 0.9,
  });
  const imageRef = useScrollAnimation<HTMLAnchorElement>({
    animation: 'scaleIn',
    duration: 1,
  });
  const gridRef = useScrollAnimation<HTMLDivElement>({
    animation: 'fadeUp',
    stagger: 0.1,
    start: 'top 90%',
  });

  return (
    <section className={`py-16 md:py-28 ${isEven ? 'bg-white' : 'bg-cream'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-14 md:mb-20 ${
          !isEven ? 'md:direction-rtl' : ''
        }`}>
          <Link
            ref={imageRef}
            to={`/category/${cat.slug}`}
            className={`group relative aspect-[4/3] md:aspect-[16/9] overflow-hidden img-zoom ${
              !isEven ? 'md:order-2' : ''
            }`}
          >
            {cat.image_url ? (
              <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <span className="font-display text-[64px] text-border/40 font-light italic">{cat.name[0]}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
          </Link>

          <div ref={textRef} className={`${!isEven ? 'md:order-1 md:text-right' : ''}`}>
            <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-light">
              {t('home.collection')}
            </p>
            <h2 className="mt-3 font-display text-[32px] md:text-[48px] font-light tracking-[0.05em] leading-tight">
              {cat.name}
            </h2>
            <p className="mt-4 text-[12px] md:text-[13px] text-secondary leading-[1.8] font-light max-w-md">
              {t(descKey) !== descKey ? t(descKey) : t('cat.default')}
            </p>
            <p className="mt-3 text-[11px] text-secondary/60 font-light">
              {cat.product_count} {t('home.pieces')}
            </p>
            <Link
              to={`/category/${cat.slug}`}
              className="mt-6 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
            >
              {t('home.shopCategory')} {cat.name}
            </Link>
          </div>
        </div>

        {products.length > 0 && (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-12">
            <Link
              to={`/category/${cat.slug}`}
              className="link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary hover:text-primary transition-colors"
            >
              {t('home.viewAll')} {cat.name}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
