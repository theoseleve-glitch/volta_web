/*
 * volta-preview-i18n.js — preview-only locale swap.
 * In the real Shopify theme, Shopify's {% form 'localization' %} handles this
 * natively by POSTing to /localization and reloading with the target locale.
 * The preview has no backend, so we fake it client-side.
 */
(function () {
  const dict = {
    fr: {
      'nav.shots': 'Shots',
      'nav.subscription': 'Abonnement',
      'nav.story': 'Notre Histoire',
      'nav.reviews': 'Avis',
      'nav.cart': 'Ouvrir le panier',
      'hero.cta': 'Acheter',
      'hero.scroll': 'Descends',
      'shot.title': 'Le Shot',
      'shot.copy': '60 ml. Trois secondes. Une montée nette. Sans sucre, sans crash, sans compromis.',
      'shot.cta': 'Commander',
      'products.eyebrow': 'La gamme',
      'products.title': 'Choisis ton shot',
      'products.card_cta': 'Ajouter',
      'product.tagline_1': 'Le shot originel',
      'product.tagline_2': 'Citron noir',
      'product.tagline_3': 'Ananas vif',
      'product.tagline_4': 'Curcuma sombre',
      'product.name_1': 'Ginger Classic',
      'product.name_2': 'Citrus Storm',
      'product.name_3': 'Tropical Jolt',
      'product.name_4': 'Deep Root',
      'sub.eyebrow': 'Abonnement mensuel',
      'sub.badge': '−30 %',
      'sub.title': 'Mixé. Livré. Chaque mois.',
      'sub.price_from': 'À partir de',
      'sub.price_per_month': '/ mois',
      'sub.includes_1': '12 shots de 60 ml',
      'sub.includes_2': '4 saveurs au choix, chaque mois',
      'sub.includes_3': 'Livraison offerte en France',
      'sub.cta': 'Commencer mon abonnement',
      'sub.guarantee': 'Sans engagement · Annule en 1 clic',
      'sub.benefit_1_title': 'Mix à ta façon',
      'sub.benefit_1': 'Tu choisis tes 4 saveurs chaque mois. Envie de changer ? Tu changes.',
      'sub.benefit_2_title': 'Flexible',
      'sub.benefit_2': 'Saute, décale ou annule à tout moment depuis ton espace client.',
      'sub.benefit_3_title': 'Livré, offert',
      'sub.benefit_3': "Livraison incluse dans l'abonnement. Pas de frais cachés.",
      'story.eyebrow': 'Notre histoire',
      'story.title': "D'une idée simple à ton rituel quotidien",
      'story.chapter_label': 'Chapitre',
      'story.h1': 'Origine',
      'story.b1': 'Une idée simple. Un shot qui donne un coup de fouet, sans compromis.',
      'story.h2': 'Ingrédients',
      'story.b2': 'Gingembre frais. Citron. Aucun additif. Fabriqué en France.',
      'story.h3': 'Production',
      'story.b3': 'Pressé à froid. Embouteillé à la main. 60 ml de pure énergie.',
      'story.h4': 'Vision',
      'story.b4': 'Un rituel quotidien. Une marque française. Zéro compromis.',
      'reviews.a11y': "Ce qu'ils en disent",
      'footer.eyebrow': 'Reste dans la boucle',
      'footer.headline': 'Rejoins la Volta List',
      'footer.subhead': 'Un mail par mois. Pas de spam. Que du bon.',
      'footer.placeholder': 'ton@email.com',
      'footer.submit': "Je m'inscris",
      'footer.col_shop': 'Boutique',
      'footer.col_help': 'Aide',
      'footer.col_legal': 'Légal',
      'footer.col_social': 'Suis-nous',
      'footer.copy': '© 2026 Volta Drinks · Fait avec ⚡ en France',
      'drawer.title': 'Ton panier',
      'drawer.close': 'Fermer',
      'drawer.empty': 'Ton panier est vide. Charge-toi.',
      'drawer.empty_cta': 'Voir les shots',
      'drawer.subtotal': 'Sous-total',
      'drawer.checkout': 'Commander',
      'preview.banner': 'Preview · image statique · pas de backend Shopify',
    },
    en: {
      'nav.shots': 'Shots',
      'nav.subscription': 'Subscribe',
      'nav.story': 'Our Story',
      'nav.reviews': 'Reviews',
      'nav.cart': 'Open cart',
      'hero.cta': 'Shop now',
      'hero.scroll': 'Scroll',
      'shot.title': 'The Shot',
      'shot.copy': '60 ml. Three seconds. A clean, sharp lift. No sugar, no crash, no compromise.',
      'shot.cta': 'Order now',
      'products.eyebrow': 'The lineup',
      'products.title': 'Pick your shot',
      'products.card_cta': 'Add',
      'product.tagline_1': 'The original',
      'product.tagline_2': 'Black lemon',
      'product.tagline_3': 'Bright pineapple',
      'product.tagline_4': 'Dark turmeric',
      'product.name_1': 'Ginger Classic',
      'product.name_2': 'Citrus Storm',
      'product.name_3': 'Tropical Jolt',
      'product.name_4': 'Deep Root',
      'sub.eyebrow': 'Monthly subscription',
      'sub.badge': '−30%',
      'sub.title': 'Mixed. Shipped. Every month.',
      'sub.price_from': 'From',
      'sub.price_per_month': '/ month',
      'sub.includes_1': '12 shots, 60 ml each',
      'sub.includes_2': '4 flavors, your choice, every month',
      'sub.includes_3': 'Free delivery in France',
      'sub.cta': 'Start my subscription',
      'sub.guarantee': 'No commitment · Cancel in 1 click',
      'sub.benefit_1_title': 'Mix your way',
      'sub.benefit_1': 'Pick your 4 flavors every month. Want to change? You change.',
      'sub.benefit_2_title': 'Flexible',
      'sub.benefit_2': 'Skip, pause, or cancel anytime from your customer account.',
      'sub.benefit_3_title': 'Shipped, free',
      'sub.benefit_3': 'Delivery included in the subscription. No hidden fees.',
      'story.eyebrow': 'Our story',
      'story.title': 'From a simple idea to a daily ritual',
      'story.chapter_label': 'Chapter',
      'story.h1': 'Origin',
      'story.b1': 'A simple idea. A shot that lifts you, no compromise.',
      'story.h2': 'Ingredients',
      'story.b2': 'Fresh ginger. Lemon. No additives. Made in France.',
      'story.h3': 'Production',
      'story.b3': 'Cold-pressed. Hand-bottled. 60 ml of pure energy.',
      'story.h4': 'Vision',
      'story.b4': 'A daily ritual. A French brand. Zero compromise.',
      'reviews.a11y': 'What they say',
      'footer.eyebrow': 'Stay in the loop',
      'footer.headline': 'Join the Volta List',
      'footer.subhead': 'One email a month. No spam. Just good stuff.',
      'footer.placeholder': 'you@email.com',
      'footer.submit': 'Sign up',
      'footer.col_shop': 'Shop',
      'footer.col_help': 'Help',
      'footer.col_legal': 'Legal',
      'footer.col_social': 'Follow us',
      'footer.copy': '© 2026 Volta Drinks · Made with ⚡ in France',
      'drawer.title': 'Your cart',
      'drawer.close': 'Close',
      'drawer.empty': 'Your cart is empty. Charge up.',
      'drawer.empty_cta': 'Shop the shots',
      'drawer.subtotal': 'Subtotal',
      'drawer.checkout': 'Checkout',
      'preview.banner': 'Preview · static image · no Shopify backend',
    },
  };

  function apply(locale) {
    if (!dict[locale]) return;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = dict[locale][key];
      if (val == null) return;
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', val);
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const val = dict[locale][key];
      if (val) el.setAttribute('aria-label', val);
    });
    document.documentElement.lang = locale;
    try { localStorage.setItem('volta_preview_locale', locale); } catch (_) {}
    document.querySelectorAll('.v-header__locale-btn').forEach((btn) => {
      const isActive = btn.getAttribute('data-locale') === locale;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.classList.toggle('is-active', isActive);
    });
  }

  document.querySelectorAll('.v-header__locale-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      apply(btn.getAttribute('data-locale'));
    });
  });

  const saved = (function () {
    try { return localStorage.getItem('volta_preview_locale'); } catch (_) { return null; }
  })();
  apply(saved || 'fr');
})();
