import { useState, useEffect } from 'react';

interface Props {
  onFinish: () => void;
}

export default function LoadingScreen({ onFinish }: Props) {
  const [phase, setPhase] = useState<'logo' | 'text' | 'exit'>('logo');

  useEffect(() => {
    const textTimer = setTimeout(() => setPhase('text'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 2400);
    const doneTimer = setTimeout(onFinish, 3200);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center transition-opacity duration-700 ${
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo — inverted so black bg becomes white, gold stays */}
      <div
        className={`relative transition-all duration-1000 ease-out ${
          phase === 'logo' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'
        }`}
        style={{ transitionDelay: '200ms' }}
      >
        <img
          src="/logo.jpeg"
          alt="Argjendari Kadriu"
          className="w-48 md:w-64 h-auto logo-inverted"
        />
        {/* Gold shimmer overlay */}
        <div className="absolute inset-0 overflow-hidden shimmer-container">
          <div className="shimmer-effect absolute inset-0" />
        </div>
      </div>

      {/* Brand text below logo */}
      <p
        className={`mt-6 text-[11px] tracking-[0.3em] uppercase text-secondary/60 transition-all duration-1000 ${
          phase === 'logo' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
        style={{ transitionDelay: '600ms' }}
      >
        Handcrafted Jewelry
      </p>

      {/* Progress bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-32">
        <div className="h-[1px] bg-black/5 overflow-hidden">
          <div className="h-full loading-bar" />
        </div>
      </div>

      <style>{`
        .logo-inverted {
          filter: invert(1) hue-rotate(180deg);
        }

        .shimmer-container {
          mix-blend-mode: color-dodge;
        }

        .shimmer-effect {
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(201, 169, 110, 0.2) 45%,
            rgba(201, 169, 110, 0.4) 50%,
            rgba(201, 169, 110, 0.2) 55%,
            transparent 60%
          );
          animation: shimmer 2s ease-in-out infinite;
          background-size: 200% 100%;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .loading-bar {
          background: linear-gradient(90deg, #C9A96E, #E8D5B0, #C9A96E);
          animation: loadProgress 2.4s ease-out forwards;
        }

        @keyframes loadProgress {
          0% { width: 0%; }
          30% { width: 40%; }
          60% { width: 70%; }
          90% { width: 90%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
