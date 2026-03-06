import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const displayPrice = product.sale_price || product.price;

  return (
    <Link to={`/products/${product.slug}`} className="group">
      <div className="aspect-[3/4] bg-surface overflow-hidden relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-border">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-[11px] tracking-[0.2em] uppercase text-secondary">Sold Out</span>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <p className="text-[11px] md:text-[12px] tracking-[0.12em] uppercase leading-tight">
          {product.name}
        </p>
        <div className="flex items-center gap-2">
          {product.sale_price ? (
            <>
              <span className="text-[12px] text-secondary line-through">${product.price}</span>
              <span className="text-[12px]">${displayPrice}</span>
            </>
          ) : (
            <span className="text-[12px] text-secondary">${displayPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
