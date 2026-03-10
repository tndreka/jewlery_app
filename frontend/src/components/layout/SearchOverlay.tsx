import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useI18n } from '../../i18n';
import type { Product } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional reset on close
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) {
      if (results.length > 0) setResults([]); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const timeout = setTimeout(async () => {
      const { products } = await api.searchProducts(query);
      setResults(products);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in">
      <div className="flex items-center px-6 md:px-12 h-[60px] md:h-[70px] border-b border-border">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#717171" strokeWidth="1.3" className="shrink-0">
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 px-4 py-2 text-[14px] font-light tracking-wide outline-none bg-transparent"
        />
        <button
          onClick={onClose}
          className="text-[10px] tracking-[0.2em] uppercase text-secondary font-light hover:text-primary transition-colors"
        >
          {t('search.close')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 stagger-children">
            {results.map(p => (
              <Link key={p.id} to={`/products/${p.slug}`} onClick={onClose} className="group block">
                <div className="aspect-[3/4] bg-surface overflow-hidden img-zoom">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="mt-3 text-[11px] tracking-[0.1em] uppercase font-light group-hover:text-gold transition-colors">
                  {p.name}
                </p>
                <p className="text-[11px] text-secondary font-light">
                  {Number(p.sale_price || p.price) > 0 ? `$${p.sale_price || p.price}` : t('product.priceOnRequest')}
                </p>
              </Link>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="text-center py-20">
            <p className="font-display text-[20px] font-light text-secondary italic">{t('search.noResults')}</p>
            <p className="mt-2 text-[11px] text-secondary font-light tracking-wide">{t('search.tryDifferent')}</p>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="font-display text-[20px] font-light text-border italic">{t('search.startTyping')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
