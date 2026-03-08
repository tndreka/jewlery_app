import { useState, useEffect } from 'react';

interface Props {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'dark' | 'glow' | 'full' | 'exit'>('dark');

  useEffect(() => {
    // Phase 1 → 2: Logo begins to emerge from darkness
    const t1 = setTimeout(() => setPhase('glow'), 200);
    // Phase 2 → 3: Logo reaches full brilliance, text + line appear
    const t2 = setTimeout(() => setPhase('full'), 1400);
    // Phase 3 → 4: Hold, then fade everything out
    const t3 = setTimeout(() => setPhase('exit'), 2800);
    const t4 = setTimeout(onFinish, 3600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-[800ms] ease-out ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ background: '#000' }}
    >
      {/* Subtle radial warmth behind logo — like a jeweler's spotlight */}
      <div
        className={`absolute inset-0 transition-opacity duration-[2s] ease-out ${
          phase === 'dark' ? 'opacity-0' : phase === 'exit' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background: 'radial-gradient(ellipse 40% 50% at 50% 45%, rgba(184,151,106,0.06) 0%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo — cinematic reveal from barely-there to full */}
        <div className="relative">
          <img
            src="/logo.png"
            alt="Argjendari Kadriu"
            className="h-48 md:h-64 lg:h-72 object-contain"
            style={{
              opacity: phase === 'dark' ? 0.04 : phase === 'glow' ? 0.6 : 1,
              transform: phase === 'dark' ? 'scale(0.96)' : 'scale(1)',
              filter: phase === 'dark'
                ? 'brightness(0.3) saturate(0)'
                : phase === 'glow'
                  ? 'brightness(0.85) saturate(0.7)'
                  : 'brightness(1) saturate(1)',
              transition: phase === 'dark'
                ? 'none'
                : 'opacity 1.6s cubic-bezier(0.16, 1, 0.3, 1), transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), filter 1.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />

          {/* Gold shimmer sweep across logo during glow phase */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(184,151,106,0.12) 50%, transparent 60%)',
              opacity: phase === 'glow' ? 1 : 0,
              transform: phase === 'glow' ? 'translateX(80%)' : 'translateX(-80%)',
              transition: 'transform 2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease',
            }}
          />
        </div>

        {/* Gold accent line — draws out after logo reveals */}
        <div className="mt-8 flex justify-center overflow-hidden">
          <div
            style={{
              height: '1px',
              background: '#b8976a',
              width: phase === 'full' ? '6rem' : '0',
              opacity: phase === 'full' ? 1 : 0,
              transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
              transitionDelay: '100ms',
            }}
          />
        </div>

        {/* Subtitle — last to appear */}
        <p
          className="mt-5 font-sans text-[10px] md:text-[11px] tracking-[0.5em] uppercase font-light"
          style={{
            color: 'rgba(255,255,255,0.35)',
            opacity: phase === 'full' ? 1 : 0,
            transform: phase === 'full' ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: '350ms',
          }}
        >
          Fine Jewelry
        </p>
      </div>
    </div>
  );
}
