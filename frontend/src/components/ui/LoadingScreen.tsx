import { useState, useEffect } from 'react';

interface Props {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'enter' | 'reveal' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('reveal'), 300);
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    const t3 = setTimeout(onFinish, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-primary flex items-center justify-center transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center">
        <h1
          className={`font-display text-[36px] md:text-[52px] font-light tracking-[0.4em] text-white uppercase transition-all duration-1000 ${
            phase === 'enter' ? 'opacity-0 tracking-[0.8em]' : 'opacity-100 tracking-[0.4em]'
          }`}
        >
          Argjendari Kadriu
        </h1>

        <div className="mt-6 flex justify-center">
          <div
            className={`h-[1px] bg-gold transition-all duration-[1.4s] ease-out ${
              phase === 'enter' ? 'w-0' : 'w-24'
            }`}
          />
        </div>

        <p
          className={`mt-4 text-[10px] tracking-[0.5em] uppercase text-white/40 transition-all duration-700 ${
            phase === 'enter' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          Fine Jewelry
        </p>
      </div>
    </div>
  );
}
