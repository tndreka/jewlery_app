import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="pt-[70px] min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] tracking-[0.5em] uppercase text-gold font-light">404</p>
      <h1 className="mt-3 font-display text-[32px] md:text-[48px] font-light tracking-[0.05em]">
        Page Not Found
      </h1>
      <p className="mt-3 text-[12px] text-secondary font-light max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block border border-primary text-primary px-10 py-3.5 text-[10px] tracking-[0.25em] uppercase font-light hover:bg-primary hover:text-white transition-all duration-500"
      >
        {t('order.continueShopping')}
      </Link>
    </div>
  );
}
