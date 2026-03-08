import { Link } from 'react-router-dom';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const displayPrice = product.sale_price || product.price;

  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <div className="aspect-[3/4] bg-surface overflow-hidden relative img-zoom">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream">
            <span className="font-display text-[32px] text-border font-light">AK</span>
          </div>
        )}

        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-secondary">Sold Out</span>
          </div>
        )}

        {product.sale_price && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-white text-[9px] tracking-[0.15em] uppercase px-2.5 py-1">
              Sale
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-[11px] tracking-[0.12em] uppercase font-light leading-snug group-hover:text-gold transition-colors duration-300">
          {product.name}
        </p>
        <div className="flex items-center gap-2.5">
          {product.sale_price ? (
            <>
              <span className="text-[11px] text-secondary line-through font-light">${product.price}</span>
              <span className="text-[11px] text-gold font-light">${displayPrice}</span>
            </>
          ) : (
            <span className="text-[11px] text-secondary font-light">
              {Number(displayPrice) > 0 ? `$${displayPrice}` : 'Price on request'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
