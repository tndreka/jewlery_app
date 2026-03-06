import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Product } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      const { products } = await api.searchProducts(query);
      setResults(products);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <div className="flex items-center px-5 md:px-10 h-16 border-b border-border">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" className="shrink-0">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 px-4 py-2 text-[15px] outline-none tracking-wide"
        />
        <button onClick={onClose} className="p-2 text-[12px] tracking-[0.15em] uppercase text-secondary">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map(p => (
              <Link key={p.id} to={`/products/${p.slug}`} onClick={onClose} className="group">
                <div className="aspect-[3/4] bg-surface overflow-hidden">
                  {p.image_url && (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <p className="mt-2 text-[11px] tracking-[0.15em] uppercase">{p.name}</p>
                <p className="text-[12px] text-secondary">${p.sale_price || p.price}</p>
              </Link>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <p className="text-secondary text-sm text-center mt-10">No results found.</p>
        ) : null}
      </div>
    </div>
  );
}
