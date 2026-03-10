import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationOptions {
  animation?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
}

export function useScrollAnimation<T extends HTMLElement>(
  options: ScrollAnimationOptions = {}
) {
  const ref = useRef<T>(null);
  const {
    animation = 'fadeUp',
    delay = 0,
    duration = 0.8,
    stagger = 0,
    start = 'top 85%',
    once = true,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1 });
      if (stagger) gsap.set(el.children, { opacity: 1 });
      return;
    }

    const fromVars: gsap.TweenVars = { opacity: 0 };
    const toVars: gsap.TweenVars = { opacity: 1, duration, delay, ease: 'power3.out' };

    switch (animation) {
      case 'fadeUp':
        fromVars.y = 30;
        toVars.y = 0;
        break;
      case 'scaleIn':
        fromVars.scale = 0.95;
        toVars.scale = 1;
        break;
      case 'slideLeft':
        fromVars.x = 60;
        toVars.x = 0;
        break;
      case 'slideRight':
        fromVars.x = -60;
        toVars.x = 0;
        break;
    }

    const targets = stagger ? el.children : el;

    gsap.set(targets, fromVars);

    const tween = gsap.to(targets, {
      ...toVars,
      stagger: stagger || 0,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: once ? 'play none none none' : 'play none none reverse',
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [animation, delay, duration, stagger, start, once]);

  return ref;
}

// Hook for parallax effect
export function useParallax<T extends HTMLElement>(speed = 0.5) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Skip parallax on touch devices — causes jank
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const tween = gsap.to(el, {
      yPercent: speed * 20,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [speed]);

  return ref;
}
