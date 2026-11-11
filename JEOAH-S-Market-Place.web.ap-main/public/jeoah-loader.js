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
  }

  window.setSiteLanguage = function (newLang) {
    localStorage.setItem(LANG_KEY, newLang);
    window.dispatchEvent(new CustomEvent('jeoahs-lang-changed', { detail: { lang: newLang } }));
    applySiteTranslations(newLang);
  };

  function ensureLanguageSelector() {
    // Si la page a déjà le sélecteur officiel de l'accueil, on ne fait rien de plus
    if (document.getElementById('site-lang-select')) return;

    // Créer un sélecteur universel
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

    // Insérer dans le header existant s'il existe
    const nav = document.querySelector('header nav') || document.querySelector('header');
    if (nav) {
      const wrapper = document.createElement('div');
      wrapper.className = 'inline-flex items-center ml-2';
      wrapper.appendChild(select);
      nav.appendChild(wrapper);
    } else {
      // Sinon, afficher un badge discret et soigné en haut à droite
      const floatBox = document.createElement('div');
      floatBox.style.cssText = 'position:fixed;top:12px;right:16px;z-index:9990';
      floatBox.appendChild(select);
      document.body.appendChild(floatBox);
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

    fetch('/jeoah-widget.html')
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