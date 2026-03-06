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
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.getProduct(slug)
      .then(setProduct)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-24 flex justify-center py-20">
        <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 text-center py-20">
        <p className="text-secondary text-[13px]">Product not found.</p>
        <Link to="/shop" className="text-[11px] tracking-[0.2em] uppercase underline underline-offset-4 mt-4 inline-block">
          Back to Shop
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.url || product.image_url;

  return (
    <div className="pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Breadcrumb */}
        <div className="flex gap-2 text-[11px] tracking-[0.1em] text-secondary mb-6">
          <Link to="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <Link to={`/category/${product.category_slug}`} className="hover:text-primary">
                {product.category_name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {/* Images */}
          <div>
            {/* Main image */}
            <div className="aspect-[3/4] bg-surface overflow-hidden">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-border">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info — sticky */}
          <div className="md:sticky md:top-24 md:self-start">
            {product.category_name && (
              <p className="text-[11px] tracking-[0.2em] uppercase text-secondary mb-2">
                {product.category_name}
              </p>
            )}

            <h1 className="text-[18px] md:text-[22px] font-light tracking-[0.1em] uppercase">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              {product.sale_price ? (
                <>
                  <span className="text-[16px] text-secondary line-through">${product.price}</span>
                  <span className="text-[16px]">${product.sale_price}</span>
                </>
              ) : (
                <span className="text-[16px]">${product.price}</span>
              )}
            </div>

            {product.description && (
              <p className="text-[13px] text-secondary leading-relaxed mt-6">
                {product.description}
              </p>
            )}

            {/* Add to bag */}
            <button
              onClick={() => addItem(product.id)}
              disabled={!product.in_stock || cartLoading}
              className={`w-full mt-8 py-3.5 text-[12px] tracking-[0.2em] uppercase transition-colors ${
                product.in_stock
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-border text-secondary cursor-not-allowed'
              }`}
            >
              {product.in_stock ? 'Add to Bag' : 'Sold Out'}
            </button>

            {/* Details accordion */}
            <div className="mt-10 border-t border-border">
              {product.material && (
                <Detail label="Material" value={product.material.replace('_', ' ')} />
              )}
              {product.gemstone && (
                <Detail label="Gemstone" value={product.gemstone} />
              )}
              {product.weight && (
                <Detail label="Weight" value={product.weight} />
              )}
              <Detail label="Shipping" value="Free shipping on all orders. Delivery in 3-5 business days." />
              <Detail label="Care" value="Store in a dry place. Avoid contact with perfume and water." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[11px] tracking-[0.15em] uppercase">{label}</span>
        <span className="text-secondary text-[14px]">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p className="pb-4 text-[13px] text-secondary leading-relaxed capitalize">{value}</p>
      )}
    </div>
  );
}
