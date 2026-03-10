import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { api } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/Toast';
import { useI18n } from '../i18n';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import type { Product } from '../types';

const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('center center');
  const [mobileZoomScale, setMobileZoomScale] = useState(1);
  const [mobileZoomPos, setMobileZoomPos] = useState({ x: 0, y: 0 });
  const { addItem, loading: cartLoading } = useCart();
  const { showToast } = useToast();
  const { t } = useI18n();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const initialPinchDistance = useRef(0);
  const initialScale = useRef(1);
  const lastTouchPos = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef(0);
  const touchStartX = useRef(0);

  const detailsRef = useScrollAnimation<HTMLDivElement>({ animation: 'fadeUp', delay: 0.15 });

  // Image swipe for mobile gallery
  const imagesForSwipe = product?.images || [];

  const handleImageSwipe = useCallback((e: React.TouchEvent) => {
    if (mobileZoomScale > 1) return;
    touchStartX.current = e.touches[0].clientX;
  }, [mobileZoomScale]);

  const handleImageSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (mobileZoomScale > 1 || imagesForSwipe.length <= 1) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0 && selectedImage < imagesForSwipe.length - 1) {
        setSelectedImage(prev => prev + 1);
      } else if (diff > 0 && selectedImage > 0) {
        setSelectedImage(prev => prev - 1);
      }
    }
  }, [mobileZoomScale, imagesForSwipe.length, selectedImage]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const data = await api.getProduct(slug);
      if (!cancelled) { setProduct(data); setSelectedImage(0); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleAdd = async () => {
    if (!product) return;
    await addItem(product.id);
    showToast(t('product.addedToBag'));
  };

  // Desktop: click to zoom
  const handleZoomClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice()) return;
    if (!zoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomOrigin(`${x}% ${y}%`);
    }
    setZoomed(!zoomed);
  };

  const handleZoomMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice() || !zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  };

  if (loading) {
    return (
      <div className="pt-[70px] flex justify-center py-32">
        <div className="w-5 h-5 border border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-[70px] text-center py-32">
        <p className="font-display text-[20px] font-light text-secondary italic">{t('product.notFound')}</p>
        <Link to="/shop" className="mt-6 inline-block link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary">
          {t('product.backToShop')}
        </Link>
      </div>
    );
  }

  const productImages = product.images || [];
  const currentImage = productImages[selectedImage]?.url || product.image_url;

  // Mobile pinch-to-zoom handlers
  const handlePinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialPinchDistance.current = Math.hypot(dx, dy);
      initialScale.current = mobileZoomScale;
    } else if (e.touches.length === 1 && mobileZoomScale > 1) {
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handlePinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scale = Math.min(3, Math.max(1, initialScale.current * (distance / initialPinchDistance.current)));
      setMobileZoomScale(scale);
    } else if (e.touches.length === 1 && mobileZoomScale > 1) {
      // Pan while zoomed
      const dx = e.touches[0].clientX - lastTouchPos.current.x;
      const dy = e.touches[0].clientY - lastTouchPos.current.y;
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      setMobileZoomPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  };

  const handlePinchEnd = () => {
    if (mobileZoomScale <= 1.1) {
      setMobileZoomScale(1);
      setMobileZoomPos({ x: 0, y: 0 });
    }
  };

  // Double tap to zoom on mobile
  const handleDoubleTap = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      e.preventDefault();
      if (mobileZoomScale > 1) {
        setMobileZoomScale(1);
        setMobileZoomPos({ x: 0, y: 0 });
      } else {
        setMobileZoomScale(2.5);
      }
    }
    lastTapTime.current = now;
  };

  return (
    <div className="pt-[70px]">
      <Helmet>
        <title>{product.name} | Argjendari Kadriu</title>
        <meta name="description" content={product.description || `${product.name} — Handcrafted gold jewelry by Argjendari Kadriu.`} />
        {currentImage && <meta property="og:image" content={currentImage} />}
      </Helmet>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-10">
        <nav className="flex gap-2 text-[10px] tracking-[0.15em] text-secondary font-light mb-8 animate-fade-in">
          <Link to="/shop" className="hover:text-primary transition-colors">{t('nav.shop')}</Link>
          <span className="text-border">/</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} className="hover:text-primary transition-colors">
                {product.category_name}
              </Link>
              <span className="text-border">/</span>
            </>
          )}
          <span className="text-primary truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 lg:gap-24">
          <div className="animate-fade-up">
            {/* Image indicators for mobile */}
            {productImages.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-3 md:hidden">
                {productImages.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[2px] rounded-full transition-all duration-300 ${
                      i === selectedImage ? 'w-6 bg-gold' : 'w-2 bg-border'
                    }`}
                  />
                ))}
              </div>
            )}
            <div
              ref={imageContainerRef}
              className={`aspect-[3/4] bg-surface overflow-hidden product-zoom-container ${zoomed ? 'zoomed' : ''}`}
              onClick={handleZoomClick}
              onMouseMove={handleZoomMove}
              onMouseLeave={() => setZoomed(false)}
              onTouchStart={(e) => {
                handlePinchStart(e);
                handleImageSwipe(e);
                handleDoubleTap(e);
              }}
              onTouchMove={handlePinchMove}
              onTouchEnd={(e) => {
                handlePinchEnd();
                handleImageSwipeEnd(e);
              }}
              style={{ touchAction: mobileZoomScale > 1 ? 'none' : 'pan-y' }}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-200"
                  style={{
                    transformOrigin: isTouchDevice() ? 'center center' : zoomOrigin,
                    transform: isTouchDevice()
                      ? `scale(${mobileZoomScale}) translate(${mobileZoomPos.x / mobileZoomScale}px, ${mobileZoomPos.y / mobileZoomScale}px)`
                      : undefined,
                  }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cream">
                  <span className="font-display text-[48px] text-border font-light">AK</span>
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="hidden md:flex gap-2 mt-3 overflow-x-auto pb-1">
                {productImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => { setSelectedImage(i); setZoomed(false); setMobileZoomScale(1); setMobileZoomPos({ x: 0, y: 0 }); }}
                    className={`w-16 h-20 shrink-0 overflow-hidden transition-all duration-300 ${
                      selectedImage === i
                        ? 'ring-1 ring-primary ring-offset-2'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Mobile: scrollable thumbnail strip */}
            {productImages.length > 1 && (
              <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1 snap-x snap-mandatory">
                {productImages.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => { setSelectedImage(i); setMobileZoomScale(1); setMobileZoomPos({ x: 0, y: 0 }); }}
                    className={`w-14 h-18 shrink-0 overflow-hidden snap-start transition-all duration-300 ${
                      selectedImage === i
                        ? 'ring-1 ring-gold ring-offset-1'
                        : 'opacity-50'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={detailsRef} className="md:sticky md:top-[90px] md:self-start">
            {product.category_name && (
              <Link
                to={`/category/${product.category_slug}`}
                className="text-[10px] tracking-[0.3em] uppercase text-gold font-light hover:text-primary transition-colors"
              >
                {product.category_name}
              </Link>
            )}

            <h1 className="mt-2 font-display text-[24px] md:text-[32px] font-light tracking-[0.03em] leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-4">
              {product.sale_price ? (
                <>
                  <span className="text-[14px] text-secondary line-through font-light">${product.price}</span>
                  <span className="text-[16px] text-gold font-light">${product.sale_price}</span>
                </>
              ) : (
                <span className="text-[16px] font-light">
                  {Number(product.price) > 0 ? `$${product.price}` : t('product.priceOnRequest')}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[12px] text-secondary leading-[1.8] mt-6 font-light">
                {product.description}
              </p>
            )}

            <button
              onClick={handleAdd}
              disabled={!product.in_stock || cartLoading}
              className={`w-full mt-8 py-4 min-h-[52px] text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 ${
                product.in_stock
                  ? 'bg-primary text-white hover:bg-gold active:bg-gold'
                  : 'bg-surface text-secondary cursor-not-allowed'
              }`}
            >
              {product.in_stock ? t('product.addToBag') : t('product.soldOut')}
            </button>

            <div className="mt-10 border-t border-border">
              {product.material && (
                <DetailRow label={t('product.material')} value={product.material.replace('_', ' ')} />
              )}
              {product.gemstone && (
                <DetailRow label={t('product.gemstone')} value={product.gemstone} />
              )}
              {product.weight && (
                <DetailRow label={t('product.weight')} value={product.weight} />
              )}
              <DetailRow label={t('product.shipping')} value={t('product.shippingDesc')} />
              <DetailRow label={t('product.care')} value={t('product.careDesc')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 group">
        <span className="text-[10px] tracking-[0.2em] uppercase font-light">{label}</span>
        <span className={`text-secondary text-[16px] font-light transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-400 ${open ? 'max-h-40 pb-4' : 'max-h-0'}`}>
        <p className="text-[12px] text-secondary leading-[1.8] font-light capitalize">{value}</p>
      </div>
    </div>
  );
}
