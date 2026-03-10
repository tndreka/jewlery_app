import { Helmet } from 'react-helmet-async';

export default function TermsConditions() {
  return (
    <div className="pt-[70px]">
      <Helmet><title>Terms & Conditions | Argjendari Kadriu</title></Helmet>
      <div className="bg-cream py-14 md:py-16">
        <h1 className="text-center font-display text-[28px] md:text-[36px] font-light tracking-[0.05em]">Terms & Conditions</h1>
      </div>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-14 text-[13px] text-secondary font-light leading-[1.9] space-y-6">
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">General</h2>
        <p>By accessing and placing an order with Argjendari Kadriu, you confirm that you agree to these terms and conditions. These terms apply to the entire website and any communication between you and us.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Products</h2>
        <p>All products are handcrafted and may have slight variations in appearance. Product images are representative; actual items may differ slightly in color and finish. Prices are subject to change without notice.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Orders & Payment</h2>
        <p>Orders are confirmed upon successful placement. We reserve the right to refuse or cancel any order. All prices are displayed in USD.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Shipping</h2>
        <p>We offer complimentary shipping on all orders. Estimated delivery time is 3-5 business days within Albania. International shipping times may vary.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Returns & Refunds</h2>
        <p>We accept returns within 14 days of delivery for items in their original condition and packaging. Custom or personalized items are non-returnable. Refunds are processed within 7-10 business days after receiving the returned item.</p>
        <h2 className="text-[11px] tracking-[0.2em] uppercase text-primary font-normal pt-4">Contact</h2>
        <p>For questions about these terms, contact us via WhatsApp at +355 69 604 9949.</p>
      </div>
    </div>
  );
}
