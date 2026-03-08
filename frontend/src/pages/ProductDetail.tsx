import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setSelectedImage(0);
    api.getProduct(slug)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    if (!product) return;
    await addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
        <p className="font-display text-[20px] font-light text-secondary italic">Product not found</p>
        <Link to="/shop" className="mt-6 inline-block link-reveal text-[10px] tracking-[0.2em] uppercase font-light text-secondary">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.url || product.image_url;

  return (
    <div className="pt-[70px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="flex gap-2 text-[10px] tracking-[0.15em] text-secondary font-light mb-8 animate-fade-in">
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
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
          {/* Image gallery */}
          <div className="animate-fade-up">
            {/* Main image */}
            <div className="aspect-[3/4] bg-surface overflow-hidden animate-scale-in">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-cream">
                  <span className="font-display text-[48px] text-border font-light">AK</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
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
          </div>

          {/* Product info */}
          <div className="md:sticky md:top-[90px] md:self-start animate-fade-up" style={{ animationDelay: '150ms' }}>
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
                  {Number(product.price) > 0 ? `$${product.price}` : 'Price on request'}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-[12px] text-secondary leading-[1.8] mt-6 font-light">
                {product.description}
              </p>
            )}

            {/* Add to bag */}
            <button
              onClick={handleAdd}
              disabled={!product.in_stock || cartLoading}
              className={`w-full mt-8 py-4 text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 ${
                added
                  ? 'bg-gold text-white'
                  : product.in_stock
                    ? 'bg-primary text-white hover:bg-gold'
                    : 'bg-surface text-secondary cursor-not-allowed'
              }`}
            >
              {added ? 'Added to Bag' : product.in_stock ? 'Add to Bag' : 'Sold Out'}
            </button>

            {/* Details */}
            <div className="mt-10 border-t border-border">
              {product.material && (
                <DetailRow label="Material" value={product.material.replace('_', ' ')} />
              )}
              {product.gemstone && (
                <DetailRow label="Gemstone" value={product.gemstone} />
              )}
              {product.weight && (
                <DetailRow label="Weight" value={product.weight} />
              )}
              <DetailRow
                label="Shipping"
                value="Complimentary shipping on all orders. Delivery within 3-5 business days."
              />
              <DetailRow
                label="Care"
                value="Store in a dry, cool place. Avoid direct contact with perfume, chemicals, and water."
              />
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
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-light">{label}</span>
        <span
          className={`text-secondary text-[16px] font-light transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${
          open ? 'max-h-40 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-[12px] text-secondary leading-[1.8] font-light capitalize">{value}</p>
      </div>
    </div>
  );
}
