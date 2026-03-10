import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import type { Product } from '../../types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  loading?: boolean;
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, loading, columns = 4 }: Props) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  const gridRef = useScrollAnimation<HTMLDivElement>({
    animation: 'fadeUp',
    stagger: 0.08,
    start: 'top 90%',
  });

  if (loading) {
    return (
      <div className={`grid ${gridCols} gap-x-4 gap-y-10 md:gap-x-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] skeleton-shimmer" />
            <div className="mt-4 h-3 skeleton-shimmer w-2/3" />
            <div className="mt-2 h-3 skeleton-shimmer w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="font-display text-[20px] font-light text-secondary italic">Nothing here yet</p>
      </div>
    );
  }

  return (
    <div ref={gridRef} className={`grid ${gridCols} gap-x-4 gap-y-10 md:gap-x-6`}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
