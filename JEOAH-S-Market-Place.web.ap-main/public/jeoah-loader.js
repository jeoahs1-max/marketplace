(function () {
  const LANG_KEY = 'jeoahs-lang';

  // Sécuriser globalement setLang pour les boutons onclick du footer
  window.setLang = function (newLang) {
    if (typeof window.setSiteLanguage === 'function') {
      window.setSiteLanguage(newLang);
    } else {
      localStorage.setItem(LANG_KEY, newLang);
      window.dispatchEvent(new CustomEvent('jeoahs-lang-changed', { detail: { lang: newLang } }));
    }
  };

  const translations = {
    fr: {
      siteName: "JEOAH'S Market Place",
      home: "Accueil",
      services: "Notre service",
      journey: "Parcours",
      community: "Communauté",
      features: "Fonctionnalités",
      plans: "Plans",
      plansTitle: "Plans et quotas",
      plansDesc: "Choisissez le niveau adapté à votre activité. Les créations IA et les publications sont toujours soumises à validation avant exécution.",
      faq: "FAQ",
      faqTitle: "FAQ et aide",
      contact: "Contact",
      contactTitle: "Contact",
      shipping: "Livraison & Retours",
      categories: "Catégories",
      allCategories: "Toutes les catégories",
      searchPlaceholder: "Rechercher un produit, une boutique, une catégorie...",
      myAccount: "Mon compte",
      loginRegister: "Se connecter / S'inscrire",
      viewShowcase: "Voir la vitrine",
      popularProducts: "Produits populaires",
      featuredStores: "Boutiques en vedette",
      viewOffer: "Voir l'offre",
      viewAll: "Voir tout",
      currencyConverter: "Convertisseur de devises",
      startFree: "Commencer gratuitement",
      chooseStarter: "Choisir Starter",
      choosePro: "Choisir Pro",
      choosePremium: "Choisir Premium",
      contactSupport: "Contacter le support",
      footerDesc: "La marketplace communautaire intelligente qui connecte acheteurs, vendeurs et affiliés avec l'aide de l'IA.",
      footerServices: "Services & Navigation",
      footerFollow: "Suivez-nous"
    },
    ht: {
      siteName: "JEOAH'S Market Place",
      home: "Akèy",
      services: "Sèvis Nou",
      journey: "Pakou",
      community: "Kominote",
      features: "Fonksyonalite",
      plans: "Plan yo",
      plansTitle: "Plan ak Kota yo",
      plansDesc: "Chwazi nivo ki adapte ak aktivite w la. Kreyasyon IA ak piblikasyon yo toujou soumèt pou validasyon anvan ekzekisyon.",
      faq: "FAQ",
      faqTitle: "FAQ ak Èd",
      contact: "Kontak",
      contactTitle: "Kontak",
      shipping: "Livrezon ak Retou",
      categories: "Kategori yo",
      allCategories: "Tout kategori yo",
      searchPlaceholder: "Chèche yon pwodwi, yon boutik, yon kategori...",
      myAccount: "Kont mwen",
      loginRegister: "Konekte / Enskri",
      viewShowcase: "Gade Vitrin",
      popularProducts: "Pwodwi popilè yo",
      featuredStores: "Boutik an vedèt",
      viewOffer: "Wè òf la",
      viewAll: "Wè tout",
      currencyConverter: "Konvètisè lajan",
      startFree: "Kòmanse gratis",
      chooseStarter: "Chwazi Starter",
      choosePro: "Chwazi Pro",
      choosePremium: "Chwazi Premium",
      contactSupport: "Kontakte sipò a",
      footerDesc: "Platfòm kominotè entèlijan ki konekte achtè, vandè ak afilye avèk asistans IA.",
      footerServices: "Sèvis ak Navigasyon",
      footerFollow: "Swiv nou"
    },
    en: {
      siteName: "JEOAH'S Market Place",
      home: "Home",
      services: "Our Service",
      journey: "Journey",
      community: "Community",
      features: "Features",
      plans: "Plans",
      plansTitle: "Plans and Quotas",
      plansDesc: "Choose the level suited to your business. AI creations and publications are always subject to approval before execution.",
      faq: "FAQ",
      faqTitle: "FAQ and Help",
      contact: "Contact",
      contactTitle: "Contact Us",
      shipping: "Shipping & Returns",
      categories: "Categories",
      allCategories: "All categories",
      searchPlaceholder: "Search for a product, store, category...",
      myAccount: "My account",
      loginRegister: "Sign in / Register",
      viewShowcase: "Explore Showcase",
      popularProducts: "Popular Products",
      featuredStores: "Featured Stores",
      viewOffer: "View Offer",
      viewAll: "View all",
      currencyConverter: "Currency Converter",
      startFree: "Start for free",
      chooseStarter: "Choose Starter",
      choosePro: "Choose Pro",
      choosePremium: "Choose Premium",
      contactSupport: "Contact Support",
      footerDesc: "The smart community marketplace connecting buyers, sellers, and affiliates with AI assistance.",
      footerServices: "Services & Navigation",
      footerFollow: "Follow Us"
    },
    es: {
      siteName: "JEOAH'S Market Place",
      home: "Inicio",
      services: "Nuestro Servicio",
      journey: "Recorrido",
      community: "Comunidad",
      features: "Funciones",
      plans: "Planes",
      plansTitle: "Planes y Cuotas",
      plansDesc: "Elija el nivel adecuado para su actividad. Las creaciones de IA y las publicaciones están sujetas a validación previa.",
      faq: "Preguntas",
      faqTitle: "Preguntas Frecuentes y Ayuda",
      contact: "Contacto",
      contactTitle: "Contacto",
      shipping: "Envíos y Devoluciones",
      categories: "Categorías",
      allCategories: "Todas las categorías",
      searchPlaceholder: "Buscar un producto, tienda, categoría...",
      myAccount: "Mi cuenta",
      loginRegister: "Iniciar sesión / Registro",
      viewShowcase: "Ver Vitrina",
      popularProducts: "Productos Populares",
      featuredStores: "Tiendas Destacadas",
      viewOffer: "Ver Oferta",
      viewAll: "Ver todo",
      currencyConverter: "Conversor de Divisas",
      startFree: "Comenzar gratis",
      chooseStarter: "Elegir Starter",
      choosePro: "Elegir Pro",
      choosePremium: "Elegir Premium",
      contactSupport: "Contactar a Soporte",
      footerDesc: "El mercado comunitario inteligente que conecta compradores, vendedores y afiliados con ayuda de IA.",
      footerServices: "Servicios y Navegación",
      footerFollow: "Síganos"
    },
    zh: {
      siteName: "JEOAH'S 智能社区电商",
      home: "首页",
      services: "服务介绍",
      journey: "使用指南",
      community: "社区生态",
      features: "功能",
      plans: "套餐方案",
      plansTitle: "套餐方案与配额",
      plansDesc: "选择适合您业务规模的套餐。所有 AI 生成与发布均在确认后执行。",
      faq: "常见问题",
      faqTitle: "常见问题与帮助中心",
      contact: "联系我们",
      contactTitle: "联系支持团队",
      shipping: "配送与退换货",
      categories: "商品分类",
      allCategories: "全部分类",
      searchPlaceholder: "搜索商品、店铺、分类...",
      myAccount: "我的账户",
      loginRegister: "登录 / 注册",
      viewShowcase: "浏览商品展厅",
      popularProducts: "热门商品",
      featuredStores: "精选推荐店铺",
      viewOffer: "查看优惠",
      viewAll: "查看全部",
      currencyConverter: "实时汇率换算器",
      startFree: "免费开启体验",
      chooseStarter: "选择 Starter",
      choosePro: "选择 Pro",
      choosePremium: "选择 Premium",
      contactSupport: "联系客服支持",
      footerDesc: "连接人、商品与社区的智能电商生态系统，让全球贸易更简单。",
      footerServices: "平台服务与导航",
      footerFollow: "关注我们"
    }
  };

  function getLang() {
    return localStorage.getItem(LANG_KEY) || 'fr';
  }

  function applySiteTranslations(lang) {
    const t = translations[lang] || translations.fr;
    document.documentElement.lang = lang;

    // 1. Synchroniser tous les sélecteurs de langue présents
    document.querySelectorAll('#site-lang-select, #page-language-select, #jeoah-language').forEach(sel => {
      if (sel.value !== lang) sel.value = lang;
    });

    // 2. Synchroniser le widget JEOAH (IA)
    const jWel = document.getElementById('jeoah-welcome');
    const widgetGreetings = {
      fr: "Bonjour ! Je suis votre copilote JEOAH. Comment puis-je vous aider aujourd'hui ?",
      ht: "Bonjou! Mwen se kopilot JEOAH ou. Kijan mwen ka ede ou?",
      en: "Hello! I am your JEOAH copilot. How can I help you today?",
      es: "¡Hola! Soy tu copiloto JEOAH. ¿Cómo puedo ayudarte hoy?",
      zh: "您好！我是您的智能副驾 JEOAH。今天有什么我可以帮您的？"
    };
    if (jWel && widgetGreetings[lang]) {
      jWel.innerHTML = `<strong>JEOAH :</strong> ${widgetGreetings[lang]}`;
    }
    if (typeof window.applyJeoahLanguage === 'function') {
      window.applyJeoahLanguage(lang);
    }

    // 3. Traduire le footer s'il est injecté
    const footerDesc = document.querySelector('[data-translate="footer_description"]');
    if (footerDesc) footerDesc.textContent = t.footerDesc;
    const footerNav = document.querySelector('[data-translate="footer_nav"]');
    if (footerNav) footerNav.textContent = t.footerServices;
    const footerSocial = document.querySelector('[data-translate="footer_social"]');
    if (footerSocial) footerSocial.textContent = t.footerFollow;
    const navFeat = document.querySelector('[data-translate="nav_features"]');
    if (navFeat) navFeat.textContent = t.features;
    const navPlans = document.querySelector('[data-translate="nav_plans"]');
    if (navPlans) navPlans.textContent = t.plans;
    const navContact = document.querySelector('[data-translate="nav_contact"]');
    if (navContact) navContact.textContent = t.contact;
    const navFaq = document.querySelector('[data-translate="nav_faq"]');
    if (navFaq) navFaq.textContent = t.faq;

    // 4. Traductions spécifiques à showcase.html
    const searchInput = document.getElementById('market-search');
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    const catTitle = document.querySelector('#categories h2');
    if (catTitle) catTitle.textContent = t.categories;
    const firstCat = document.querySelector('#category-list button:first-child');
    if (firstCat && (firstCat.dataset.category === 'Toutes les catégories' || firstCat.textContent.includes('catégories'))) {
      firstCat.textContent = t.allCategories;
    }
    const storeTitle = document.querySelector('section > div > h2');
    if (storeTitle && storeTitle.textContent.includes('Boutiques')) storeTitle.textContent = t.featuredStores;
    const prodTitle = document.querySelector('#products h2');
    if (prodTitle && prodTitle.textContent.includes('Produits')) prodTitle.textContent = t.popularProducts;
    const accountLink = document.querySelector('nav a.bg-fuchsia-600');
    if (accountLink) accountLink.textContent = t.myAccount;

    // 5. Traductions spécifiques à plans.html
    const plansH1 = document.querySelector('body > main > header > h1');
    if (plansH1 && plansH1.textContent.includes('Plans')) plansH1.textContent = t.plansTitle;
    const plansP = document.querySelector('body > main > header > p');
    if (plansP && plansP.textContent.includes('Choisissez')) plansP.textContent = t.plansDesc;
    const convTitle = document.getElementById('currency-title');
    if (convTitle) convTitle.textContent = t.currencyConverter;
    const freeBtn = document.getElementById('free');
    if (freeBtn) freeBtn.textContent = t.startFree;
    const starterBtn = document.getElementById('starter');
    if (starterBtn) starterBtn.textContent = t.chooseStarter;
    const proBtn = document.querySelector('article.border-2.border-indigo-600 button');
    if (proBtn) proBtn.textContent = t.choosePro;
    const premBtn = document.querySelector('article:last-of-type button');
    if (premBtn && premBtn.id === 'premium') premBtn.textContent = t.choosePremium;

    // 6. Traductions spécifiques à faq.html et contact.html
    const faqH1 = document.querySelector('main > h1');
    if (faqH1 && faqH1.textContent.includes('FAQ')) faqH1.textContent = t.faqTitle;
    if (faqH1 && faqH1.textContent === 'Contact') faqH1.textContent = t.contactTitle;
    const suppBtn = document.querySelector('a[href="/contact.html"].border');
    if (suppBtn) suppBtn.textContent = t.contactSupport;

    // 7. Traduction automatique DOM complète des pages internes (Vendeur, Affilié, Admin, Panier, etc.)
    translatePageDom(lang);
  }

  const originalTextMap = new WeakMap();
  const originalAttrMap = new WeakMap();

  const DOM_PHRASES = {
    en: {
      "Tableau de bord": "Dashboard",
      "Tableau de bord 👋": "Dashboard 👋",
      "Produits": "Products",
      "Commandes": "Orders",
      "Statistiques": "Analytics",
      "Paramètres": "Settings",
      "Vitrines": "Storefronts",
      "Affiliations": "Affiliates",
      "Utilisateurs": "Users",
      "Vendeurs": "Sellers",
      "Finances": "Finances",
      "Abonnements": "Subscriptions",
      "Rapports": "Reports",
      "Accueil": "Home",
      "Vitrine Centrale": "Central Storefront",
      "Espace Vendeur": "Seller Space",
      "Espace Affilié": "Affiliate Space",
      "Vitrine Affilié": "Affiliate Storefront",
      "Plans & Tarifs": "Plans & Pricing",
      "Page Paiement": "Payment Page",
      "Panier": "Cart",
      "Contact & Support": "Contact & Support",
      "Aperçu des Ventes (Mois en cours)": "Sales Overview (Current Month)",
      "Revenus Bruts": "Gross Revenue",
      "Commandes Totales": "Total Orders",
      "Stock Faible": "Low Stock",
      "À Expédier": "To Ship",
      "Clics produits": "Product Clicks",
      "Solde vendeur": "Seller Balance",
      "Livraison de retards": "Late Deliveries",
      "Retraits": "Withdrawals",
      "À configurer": "To configure",
      "Gérer ma Boutique": "Manage my Store",
      "Gérer mon Plan Vendeur": "Manage Seller Plan",
      "Basculer / Devenir affilié (sans réinscription)": "Switch / Become Affiliate (no re-registration)",
      "Basculer vers Espace Vendeur (sans réinscription)": "Switch to Seller Space (no re-registration)",
      "Suivi de fiabilité": "Reliability Tracking",
      "3 retard avant examen": "3 delays before review",
      "Ventes totales": "Total Sales",
      "Utilisateurs": "Users",
      "Vitrines actives": "Active Storefronts",
      "Commissions": "Commissions",
      "Validation des retraits": "Withdrawal Approval",
      "Activité récente": "Recent Activity",
      "Sources de trafic": "Traffic Sources",
      "Top vitrines": "Top Storefronts",
      "Évolution des ventes": "Sales Trend",
      "Ventes par catégorie": "Sales by Category",
      "Ajouter un produit": "Add a product",
      "Générer un rapport": "Generate a report",
      "Télécharger le rapport": "Download report",
      "Vitrine": "Storefront",
      "Plans": "Plans",
      "Acheter": "Buy",
      "Voir l'offre": "View Offer",
      "Rechercher un produit, une commande, un utilisateur...": "Search a product, order, or user...",
      "Gérez vos produits et commandes ici !": "Manage your products and orders here!"
    },
    ht: {
      "Tableau de bord": "Tablo bò",
      "Tableau de bord 👋": "Tablo bò 👋",
      "Produits": "Pwodui yo",
      "Commandes": "Kòmand yo",
      "Statistiques": "Estatistik",
      "Paramètres": "Paramèt",
      "Vitrines": "Vitrin yo",
      "Affiliations": "Afilyasyon",
      "Utilisateurs": "Itilizatè yo",
      "Vendeurs": "Vandè yo",
      "Finances": "Finans",
      "Abonnements": "Abònman yo",
      "Rapports": "Rapò yo",
      "Accueil": "Akèy",
      "Vitrine Centrale": "Vitrin Santral",
      "Espace Vendeur": "Espas Vandè",
      "Espace Affilié": "Espas Afilye",
      "Vitrine Affilié": "Vitrin Afilye",
      "Plans & Tarifs": "Plan & Pri",
      "Page Paiement": "Paj Peman",
      "Panier": "Panye",
      "Contact & Support": "Kontak & Sipò",
      "Aperçu des Ventes (Mois en cours)": "Rezime Lavant (Mwa sa a)",
      "Revenus Bruts": "Revni Brit",
      "Commandes Totales": "Total Kòmand",
      "Stock Faible": "Estòk Ba",
      "À Expédier": "Pou Voye",
      "Clics produits": "Klik pwodui",
      "Solde vendeur": "Balans vandè",
      "Livraison de retards": "Livrezon an reta",
      "Retraits": "Retrè",
      "À configurer": "Pou konfigire",
      "Gérer ma Boutique": "Jere Boutik mwen",
      "Gérer mon Plan Vendeur": "Jere Plan Vandè mwen",
      "Basculer / Devenir affilié (sans réinscription)": "Pase nan Wòl Afilye (san re-enskri)",
      "Basculer vers Espace Vendeur (sans réinscription)": "Pase nan Espas Vandè (san re-enskri)",
      "Suivi de fiabilité": "Swivi Fyabilite",
      "Ventes totales": "Total Lavant",
      "Vitrines actives": "Vitrin aktif",
      "Commissions": "Komisyon",
      "Validation des retraits": "Validasyon Retrè yo",
      "Activité récente": "Aktivite resan",
      "Sources de trafic": "Sous trafik",
      "Top vitrines": "Meyè vitrin yo",
      "Évolution des ventes": "Evolisyon lavant",
      "Ventes par catégorie": "Lavant pa kategori",
      "Ajouter un produit": "Ajoute yon pwodui",
      "Générer un rapport": "Jenere yon rapò",
      "Télécharger le rapport": "Telechaje rapò a",
      "Vitrine": "Vitrin",
      "Plans": "Plan yo",
      "Acheter": "Achte",
      "Voir l'offre": "Wè òf la",
      "Gérez vos produits et commandes ici !": "Jere pwodui ak kòmand ou yo isit la!"
    },
    es: {
      "Tableau de bord": "Panel de control",
      "Tableau de bord 👋": "Panel de control 👋",
      "Produits": "Productos",
      "Commandes": "Pedidos",
      "Statistiques": "Estadísticas",
      "Paramètres": "Configuración",
      "Vitrines": "Vitrinas",
      "Affiliations": "Afiliados",
      "Utilisateurs": "Usuarios",
      "Vendeurs": "Vendedores",
      "Finances": "Finanzas",
      "Abonnements": "Suscripciones",
      "Rapports": "Informes",
      "Accueil": "Inicio",
      "Vitrine Centrale": "Vitrina Central",
      "Espace Vendeur": "Espacio Vendedor",
      "Espace Affilié": "Espacio Afiliado",
      "Vitrine Affilié": "Vitrina Afiliado",
      "Plans & Tarifs": "Planes y Tarifas",
      "Page Paiement": "Página de Pago",
      "Panier": "Carrito",
      "Contact & Support": "Contacto y Soporte",
      "Aperçu des Ventes (Mois en cours)": "Resumen de Ventas (Mes actual)",
      "Revenus Bruts": "Ingresos Brutos",
      "Commandes Totales": "Pedidos Totales",
      "Stock Faible": "Stock Bajo",
      "À Expédier": "Por Enviar",
      "Clics produits": "Clics en productos",
      "Solde vendeur": "Saldo vendedor",
      "Livraison de retards": "Entregas retrasadas",
      "Retraits": "Retiros",
      "À configurer": "Por configurar",
      "Gérer ma Boutique": "Gestionar mi Tienda",
      "Gérer mon Plan Vendeur": "Gestionar mi Plan Vendedor",
      "Basculer / Devenir affilié (sans réinscription)": "Cambiar a Afiliado (sin nuevo registro)",
      "Basculer vers Espace Vendeur (sans réinscription)": "Cambiar a Espacio Vendedor (sin nuevo registro)",
      "Suivi de fiabilité": "Seguimiento de fiabilidad",
      "Ventes totales": "Ventas totales",
      "Vitrines actives": "Vitrinas activas",
      "Commissions": "Comisiones",
      "Validation des retraits": "Validación de retiros",
      "Activité récente": "Actividad reciente",
      "Sources de trafic": "Fuentes de tráfico",
      "Top vitrines": "Mejores vitrinas",
      "Évolution des ventes": "Evolución de ventas",
      "Ventes par catégorie": "Ventas por categoría",
      "Ajouter un produit": "Añadir producto",
      "Générer un rapport": "Generar informe",
      "Télécharger le rapport": "Descargar informe",
      "Vitrine": "Vitrina",
      "Plans": "Planes",
      "Acheter": "Comprar",
      "Voir l'offre": "Ver oferta",
      "Gérez vos produits et commandes ici !": "¡Gestiona tus productos y pedidos aquí!"
    },
    zh: {
      "Tableau de bord": "控制面板",
      "Produits": "商品",
      "Commandes": "订单",
      "Statistiques": "统计",
      "Paramètres": "设置",
      "Vitrines": "橱窗",
      "Affiliations": "联盟推广",
      "Utilisateurs": "用户",
      "Vendeurs": "卖家",
      "Finances": "财务",
      "Abonnements": "订阅方案",
      "Rapports": "报告",
      "Accueil": "首页",
      "Vitrine Centrale": "中心橱窗",
      "Espace Vendeur": "卖家中心",
      "Espace Affilié": "联盟中心",
      "Plans & Tarifs": "方案与价格",
      "Page Paiement": "支付页面",
      "Panier": "购物车",
      "Contact & Support": "联系与支持",
      "Ventes totales": "总销售额",
      "Vitrines actives": "活跃橱窗",
      "Commissions": "佣金",
      "Acheter": "购买",
      "Voir l'offre": "查看优惠"
    }
  };

  function translatePageDom(lang) {
    if (!document.body) return;
    const dict = DOM_PHRASES[lang] || null;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
      const parentTag = node.parentElement ? node.parentElement.tagName : '';
      if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT') continue;
      if (!originalTextMap.has(node)) {
        originalTextMap.set(node, node.nodeValue);
      }
      const orig = originalTextMap.get(node);
      if (lang === 'fr' || !dict) {
        if (node.nodeValue !== orig) node.nodeValue = orig;
        continue;
      }
      const trimmed = orig.trim();
      if (!trimmed) continue;
      let translated = dict[trimmed];
      if (!translated && trimmed.startsWith('Bienvenue,')) {
        translated = trimmed.replace('Bienvenue,', lang === 'en' ? 'Welcome,' : lang === 'ht' ? 'Byenveni,' : lang === 'es' ? 'Bienvenido,' : '欢迎，');
      }
      if (!translated && trimmed.startsWith('Plan Vendeur :')) {
        translated = trimmed.replace('Plan Vendeur :', lang === 'en' ? 'Seller Plan:' : lang === 'ht' ? 'Plan Vandè :' : lang === 'es' ? 'Plan Vendedor:' : '卖家方案：');
      }
      if (translated) {
        node.nodeValue = orig.replace(trimmed, translated);
      }
    }
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
      if (!originalAttrMap.has(el)) originalAttrMap.set(el, el.getAttribute('placeholder'));
      const origPh = originalAttrMap.get(el);
      if (lang === 'fr' || !dict) {
        if (origPh !== null) el.setAttribute('placeholder', origPh);
      } else if (dict[origPh]) {
        el.setAttribute('placeholder', dict[origPh]);
      }
    });
  }

  window.setSiteLanguage = function (newLang) {
    localStorage.setItem(LANG_KEY, newLang);
    window.dispatchEvent(new CustomEvent('jeoahs-lang-changed', { detail: { lang: newLang } }));
    applySiteTranslations(newLang);
  };

  function isHomePage() {
    const p = (window.location.pathname || '/').toLowerCase();
    return p === '/' || p === '/index.html' || p === '/public/index.html';
  }

  function ensureLanguageSelector() {
    // La liste de langue en haut ne doit apparaître que sur la page d'accueil (/index.html).
    // Sur les pages internes, le changement de langue se fait depuis le pied de page (footer).
    if (!isHomePage()) {
      document.querySelectorAll('#site-lang-select').forEach(el => {
        if (!el.closest('footer')) el.remove();
      });
      return;
    }
    if (document.getElementById('site-lang-select')) return;

    const currentLang = getLang();
    const select = document.createElement('select');
    select.id = 'site-lang-select';
    select.setAttribute('aria-label', 'Changer la langue');
    select.style.cssText = 'padding:5px 8px;border:1px solid #cbd5e1;border-radius:8px;font-size:12px;background:#fff;font-weight:700;color:#1e293b;cursor:pointer;outline:none;box-shadow:0 1px 3px rgba(0,0,0,0.06)';

    [['fr', '🇫🇷 FR'], ['ht', '🇭🇹 HT'], ['en', '🇺🇸 EN'], ['es', '🇪🇸 ES'], ['zh', '🇨🇳 中文']].forEach(([val, label]) => {
      const opt = document.createElement('option');
      opt.value = val;
      opt.textContent = label;
      if (val === currentLang) opt.selected = true;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      window.setSiteLanguage(select.value);
    });

    const nav = document.querySelector('header nav') || document.querySelector('header');
    if (nav) {
      const wrapper = document.createElement('div');
      wrapper.className = 'inline-flex items-center ml-2';
      wrapper.appendChild(select);
      nav.appendChild(wrapper);
    }
  }

  function loadSharedFooter() {
    if (document.querySelector('footer')) return;

    const footerTarget = document.getElementById('footer-container') || document.createElement('div');
    if (!footerTarget.id) {
      footerTarget.id = 'footer-container';
      document.body.appendChild(footerTarget);
    }

    fetch('/public/footer.html')
      .then(response => {
        if (!response.ok) throw new Error('Pied de page JEOAH indisponible');
        return response.text();
      })
      .then(html => {
        footerTarget.innerHTML = html;
        applySiteTranslations(getLang());
      })
      .catch(error => console.warn(error.message));
  }

  function loadJeoahWidget() {
    if (document.getElementById('jeoah-widget') || document.getElementById('jeoah-widget-loader')) return;

    const loader = document.createElement('div');
    loader.id = 'jeoah-widget-loader';
    document.body.appendChild(loader);

    fetch('/jeoah-widget.html?v=' + Date.now())
      .then(response => {
        if (!response.ok) throw new Error('Widget JEOAH indisponible');
        return response.text();
      })
      .then(html => {
        loader.innerHTML = html;
        loader.querySelectorAll('script').forEach(script => {
          const executable = document.createElement('script');
          executable.textContent = script.textContent;
          document.body.appendChild(executable);
          script.remove();
        });
        setTimeout(() => {
          if (typeof window.applyJeoahLanguage === 'function') {
            window.applyJeoahLanguage(getLang());
          }
        }, 120);
      })
      .catch(error => console.warn(error.message));
  }

  function init() {
    ensureLanguageSelector();
    loadSharedFooter();
    loadJeoahWidget();
    applySiteTranslations(getLang());

    window.addEventListener('jeoahs-lang-changed', e => {
      if (e && e.detail && e.detail.lang) {
        applySiteTranslations(e.detail.lang);
      }
    });

    window.addEventListener('storage', e => {
      if (e.key === LANG_KEY && e.newValue) {
        applySiteTranslations(e.newValue);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();