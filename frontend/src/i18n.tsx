import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'EN' | 'AL';

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  'nav.shop': { EN: 'Shop', AL: 'Dyqani' },
  'nav.rings': { EN: 'Rings', AL: 'Unaza' },
  'nav.necklaces': { EN: 'Necklaces', AL: 'Gjerdane' },
  'nav.bracelets': { EN: 'Bracelets', AL: 'Bylyzyqe' },
  'nav.earrings': { EN: 'Earrings', AL: 'Vathë' },
  'nav.sets': { EN: 'Sets', AL: 'Sete' },
  'nav.shopAll': { EN: 'Shop All', AL: 'Shiko Të Gjitha' },

  // Home
  'home.fineGold': { EN: 'Fine Gold Jewelry', AL: 'Stoli Ari të Hollë' },
  'home.discover': { EN: 'Discover Collection', AL: 'Zbulo Koleksionin' },
  'home.scroll': { EN: 'Scroll', AL: 'Lëviz' },
  'home.collection': { EN: 'Collection', AL: 'Koleksion' },
  'home.pieces': { EN: 'pieces', AL: 'copë' },
  'home.shopCategory': { EN: 'Shop', AL: 'Blej' },
  'home.viewAll': { EN: 'View All', AL: 'Shiko Të Gjitha' },
  'home.visitUs': { EN: 'Visit Us', AL: 'Na Vizitoni' },
  'home.visitDesc': { EN: 'Experience our collection in person. Every piece is meant to be touched, worn, and felt.', AL: 'Përjetoni koleksionin tonë personalisht. Çdo copë është krijuar për t\'u prekur, mbajtur dhe ndjerë.' },
  'home.followIg': { EN: 'Follow on Instagram', AL: 'Na Ndiqni në Instagram' },

  // Category descriptions
  'cat.rings': { EN: 'Every ring tells a story. From statement pieces to everyday elegance, find the one that speaks to you.', AL: 'Çdo unazë tregon një histori. Nga copat e veçanta deri te eleganca e përditshme, gjeni atë që ju flet juve.' },
  'cat.necklaces': { EN: 'A necklace transforms any look. Delicate chains, bold pendants, and timeless gold pieces crafted to perfection.', AL: 'Një gjerdan transformon çdo pamje. Zinxhirë delikatë, varëse të guximshme dhe copë ari të përjetshme.' },
  'cat.bracelets': { EN: 'Adorn your wrist with handcrafted gold bracelets. Stacked or solo, each piece makes a statement.', AL: 'Zbukuroni kyçin tuaj me bylyzyqe ari të punuara me dorë. Të grumbulluara ose vetëm, secila bën përshtypje.' },
  'cat.earrings': { EN: 'From subtle studs to dramatic drops, our earrings are designed to frame your face with brilliance.', AL: 'Nga vathët diskrete deri te ato dramatike, vathët tona janë dizajnuar për të ndriçuar fytyrën tuaj.' },
  'cat.sets': { EN: 'Perfectly matched jewelry sets for a complete, coordinated look. The ultimate gift of elegance.', AL: 'Sete stolish të përshtatura në mënyrë perfekte për një pamje të kompletuar. Dhurata përfundimtare e elegancës.' },
  'cat.default': { EN: 'Explore our curated collection.', AL: 'Eksploroni koleksionin tonë të kujdesshëm.' },

  // Shop
  'shop.collection': { EN: 'Collection', AL: 'Koleksion' },
  'shop.allJewelry': { EN: 'All Jewelry', AL: 'Të Gjitha Stolitë' },
  'shop.piece': { EN: 'piece', AL: 'copë' },
  'shop.pieces': { EN: 'pieces', AL: 'copë' },
  'shop.all': { EN: 'All', AL: 'Të Gjitha' },
  'shop.loadMore': { EN: 'Load More', AL: 'Shiko Më Shumë' },

  // Product Detail
  'product.notFound': { EN: 'Product not found', AL: 'Produkti nuk u gjet' },
  'product.backToShop': { EN: 'Back to Shop', AL: 'Kthehu te Dyqani' },
  'product.priceOnRequest': { EN: 'Price on request', AL: 'Çmimi sipas kërkesës' },
  'product.addToBag': { EN: 'Add to Bag', AL: 'Shto në Çantë' },
  'product.addedToBag': { EN: 'Added to Bag', AL: 'U Shtua në Çantë' },
  'product.soldOut': { EN: 'Sold Out', AL: 'E Shitur' },
  'product.material': { EN: 'Material', AL: 'Materiali' },
  'product.gemstone': { EN: 'Gemstone', AL: 'Guri i Çmuar' },
  'product.weight': { EN: 'Weight', AL: 'Pesha' },
  'product.shipping': { EN: 'Shipping', AL: 'Dërgesa' },
  'product.shippingDesc': { EN: 'Complimentary shipping on all orders. Delivery within 3-5 business days.', AL: 'Dërgesa falas për të gjitha porositë. Dorëzimi brenda 3-5 ditëve të punës.' },
  'product.care': { EN: 'Care', AL: 'Kujdesi' },
  'product.careDesc': { EN: 'Store in a dry, cool place. Avoid direct contact with perfume, chemicals, and water.', AL: 'Ruajeni në një vend të thatë e të ftohtë. Shmangni kontaktin e drejtpërdrejtë me parfum, kimikate dhe ujë.' },
  'product.sale': { EN: 'Sale', AL: 'Ulje' },

  // Checkout
  'checkout.title': { EN: 'Checkout', AL: 'Porosia' },
  'checkout.contactInfo': { EN: 'Contact Information', AL: 'Informacioni i Kontaktit' },
  'checkout.fullName': { EN: 'Full Name', AL: 'Emri i Plotë' },
  'checkout.email': { EN: 'Email', AL: 'Email' },
  'checkout.phone': { EN: 'Phone (optional)', AL: 'Telefoni (opsional)' },
  'checkout.shippingAddress': { EN: 'Shipping Address', AL: 'Adresa e Dërgesës' },
  'checkout.fullAddress': { EN: 'Full Address', AL: 'Adresa e Plotë' },
  'checkout.error': { EN: 'Something went wrong. Please try again.', AL: 'Diçka shkoi keq. Ju lutem provoni përsëri.' },
  'checkout.processing': { EN: 'Processing...', AL: 'Duke procesuar...' },
  'checkout.placeOrder': { EN: 'Place Order', AL: 'Vendos Porosinë' },
  'checkout.orderSummary': { EN: 'Order Summary', AL: 'Përmbledhja e Porosisë' },
  'checkout.qty': { EN: 'Qty', AL: 'Sasia' },
  'checkout.subtotal': { EN: 'Subtotal', AL: 'Nëntotali' },
  'checkout.shipping': { EN: 'Shipping', AL: 'Dërgesa' },
  'checkout.complimentary': { EN: 'Complimentary', AL: 'Falas' },
  'checkout.total': { EN: 'Total', AL: 'Totali' },
  'checkout.emptyBag': { EN: 'Your bag is empty', AL: 'Çanta juaj është bosh' },
  'checkout.continueShopping': { EN: 'Continue Shopping', AL: 'Vazhdo Blerjen' },

  // Order Confirmation
  'order.thankYou': { EN: 'Thank You', AL: 'Faleminderit' },
  'order.confirmed': { EN: 'Your order has been confirmed', AL: 'Porosia juaj është konfirmuar' },
  'order.details': { EN: 'Order Details', AL: 'Detajet e Porosisë' },
  'order.tracking': { EN: 'Tracking', AL: 'Gjurmimi' },
  'order.total': { EN: 'Total', AL: 'Totali' },
  'order.continueShopping': { EN: 'Continue Shopping', AL: 'Vazhdo Blerjen' },

  // Cart
  'cart.bag': { EN: 'Bag', AL: 'Çanta' },
  'cart.empty': { EN: 'Empty', AL: 'Bosh' },
  'cart.waiting': { EN: 'Your bag is waiting', AL: 'Çanta juaj po pret' },
  'cart.continueShopping': { EN: 'Continue Shopping', AL: 'Vazhdo Blerjen' },
  'cart.subtotal': { EN: 'Subtotal', AL: 'Nëntotali' },
  'cart.checkout': { EN: 'Checkout', AL: 'Porosia' },

  // Search
  'search.placeholder': { EN: 'Search jewelry...', AL: 'Kërko stoli...' },
  'search.close': { EN: 'Close', AL: 'Mbyll' },
  'search.noResults': { EN: 'No results found', AL: 'Nuk u gjetën rezultate' },
  'search.tryDifferent': { EN: 'Try a different search term', AL: 'Provoni një kërkim tjetër' },
  'search.startTyping': { EN: 'Start typing to search', AL: 'Filloni të shkruani për të kërkuar' },

  // Footer
  'footer.marquee': { EN: 'Argjendari Kadriu — Fine Gold Jewelry — Handcrafted in Albania —', AL: 'Argjendari Kadriu — Stoli Ari të Hollë — Punuar me Dorë në Shqipëri —' },
  'footer.desc': { EN: 'Timeless gold jewelry, meticulously crafted. Each piece carries the tradition of fine Albanian goldsmithing.', AL: 'Stoli ari të përjetshme, të punuara me kujdes. Çdo copë mbart traditën e argjendarisë shqiptare.' },
  'footer.collections': { EN: 'Collections', AL: 'Koleksione' },
  'footer.connect': { EN: 'Connect', AL: 'Na Kontaktoni' },
  'footer.rights': { EN: 'All rights reserved.', AL: 'Të gjitha të drejtat e rezervuara.' },
  'footer.handcrafted': { EN: 'Handcrafted with care', AL: 'Punuar me kujdes' },

  // Loading
  'loading.subtitle': { EN: 'Fine Jewelry', AL: 'Stoli të Hollë' },

  // WhatsApp
  'whatsapp.chatNow': { EN: 'Chat Now', AL: 'Bisedo Tani' },
};

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'EN',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) || 'EN';
  });

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
