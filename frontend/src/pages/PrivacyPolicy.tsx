import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  return (
    <div className="pt-[70px]">
      <Helmet><title>Privacy Policy | Argjendari Kadriu</title></Helmet>
      <div className="bg-cream py-14 md:py-16">
        <h1 className="text-center font-display text-[28px] md:text-[36px] font-light tracking-[0.05em]">Privacy Policy</h1>
      </div>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-14 text-[13px] text-secondary font-light leading-[1.9] space-y-6">
        <p>Argjendari Kadriu respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and protect your information when you visit our website and make purchases.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Information We Collect</h2>
        <p>We collect information you provide directly: your name, email address, phone number, and shipping address when placing an order. We also collect browsing data through cookies to maintain your shopping cart.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">How We Use Your Information</h2>
        <p>We use your information to process and deliver orders, send order confirmation and shipping notifications, and improve our services. We do not sell or share your personal data with third parties except as necessary for order fulfillment and payment processing.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Cookies</h2>
        <p>We use essential cookies to maintain your shopping cart session. No tracking or advertising cookies are used.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Contact</h2>
        <p>For privacy-related inquiries, contact us via WhatsApp at +355 69 604 9949 or visit our store at Bulevardi Zogu i Pare.</p>
      </div>
    </div>
  );
}
