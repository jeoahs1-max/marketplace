(function () {
  const key = 'jeoahs-lang';
  const words = {
    fr: {
      language: 'Langue', stepOne: 'Etape 1 sur 3', stepTwo: 'Etape 2 sur 3', stepThree: 'Etape 3 sur 3',
      affiliatePrograms: 'Ajoutez vos programmes affilies', affiliateProgramsText: 'Indiquez les plateformes sur lesquelles vous etes affilie. JEOAH\'S affichera ensuite les offres correspondantes sur votre vitrine.',
      socialTitle: 'Presentez vos reseaux sociaux', socialText: 'Ces profils seront visibles sur votre vitrine afin que les visiteurs puissent decouvrir votre contenu.',
      profileTitle: 'Configuration affilie', profileSubtitle: 'Finalisation du profil public', profileText: 'Derniere etape ! Creez votre identite publique. Ces informations seront visibles sur votre page d\'affiliation.',
      addPlatform: 'Ajouter une plateforme', saveContinue: 'Enregistrer et continuer', back: 'Retour', finish: 'Terminer',
      photo: 'Photo ou avatar', photoChoice: 'Choisir une photo sur l\'ordinateur', photoHelp: 'Photo locale ou URL publique. Taille maximale : 600 Ko.',
      username: 'Nom d\'utilisateur public (*)', usernameHelp: 'Ce sera votre identifiant unique sur la plateforme.', bio: 'Votre biographie (max. 300 caracteres)',
      imagePlaceholder: 'URL d\'une image (facultatif)', usernamePlaceholder: 'Ex. : SuperAffilie2024', bioPlaceholder: 'Decrivez-vous en quelques mots. Que partagez-vous avec votre audience ?',
      authPrompt: 'Choisissez votre role pour commencer', authRole: 'Je suis un...', buyer: 'Acheteur', seller: 'Vendeur', affiliate: 'Affilie', google: 'S\'inscrire avec Google', termsPrefix: 'En continuant, vous acceptez nos', terms: 'Termes et conditions', home: 'Retour a l\'accueil'
      ,shippingTitle: 'Livraison, retours et remboursements', shippingRoleTitle: 'Role de JEOAH\'S', shippingRole: 'JEOAH\'S facilite la mise en relation et, dans le modele prevu, le traitement du paiement. JEOAH\'S ne stocke pas les produits et n\'assure pas leur expedition.', sellerResponsibility: 'Responsabilite du vendeur', sellerResponsibilityText: 'Chaque vendeur doit indiquer les pays ou zones desservis, les frais de livraison, le delai estime, le transporteur utilise et les conditions de retour avant la commande.', tracking: 'Suivi de commande', trackingText: 'Le vendeur confirme la preparation, fournit les informations d\'expedition disponibles et met a jour le statut jusqu\'a la livraison.', returns: 'Retour et remboursement', returnsText: 'L\'acheteur signale un probleme depuis la commande. Le vendeur repond et traite le retour ou le remboursement selon les conditions annoncees.', reliability: 'Fiabilite des vendeurs', reliabilityText: 'Les retards repetes, fausses informations ou refus injustifies peuvent entrainer une restriction apres verification.', testVersion: 'Version test', testVersionText: 'Les paiements et remboursements reels ne sont pas actives dans la version actuellement publiee.'
    },
    en: {
      language: 'Language', stepOne: 'Step 1 of 3', stepTwo: 'Step 2 of 3', stepThree: 'Step 3 of 3',
      affiliatePrograms: 'Add your affiliate programs', affiliateProgramsText: 'Select the platforms where you are an affiliate. JEOAH\'S will show the matching offers in your storefront.',
      socialTitle: 'Add your social networks', socialText: 'These profiles will appear in your storefront so visitors can discover your content.',
      profileTitle: 'Affiliate setup', profileSubtitle: 'Complete your public profile', profileText: 'Final step. Create your public identity. This information will be visible on your affiliate page.',
      addPlatform: 'Add a platform', saveContinue: 'Save and continue', back: 'Back', finish: 'Finish',
      photo: 'Photo or avatar', photoChoice: 'Choose a photo from your computer', photoHelp: 'Local photo or public URL. Maximum size: 600 KB.',
      username: 'Public username (*)', usernameHelp: 'This will be your unique platform identifier.', bio: 'Your biography (max. 300 characters)',
      imagePlaceholder: 'Image URL (optional)', usernamePlaceholder: 'Example: SuperAffiliate2024', bioPlaceholder: 'Describe yourself in a few words. What do you share with your audience?',
      authPrompt: 'Choose your role to get started', authRole: 'I am a...', buyer: 'Buyer', seller: 'Seller', affiliate: 'Affiliate', google: 'Sign up with Google', termsPrefix: 'By continuing, you agree to our', terms: 'Terms and conditions', home: 'Back to home'
      ,shippingTitle: 'Shipping, returns and refunds', shippingRoleTitle: 'JEOAH\'S role', shippingRole: 'JEOAH\'S connects people and, in the planned model, processes payments. JEOAH\'S does not stock products or handle their shipping.', sellerResponsibility: 'Seller responsibility', sellerResponsibilityText: 'Each seller must provide their served countries or areas, delivery fees, estimated time, carrier and return policy before an order.', tracking: 'Order tracking', trackingText: 'The seller confirms preparation, provides available shipping information and updates the order until delivery.', returns: 'Returns and refunds', returnsText: 'The buyer reports an issue from the order. The seller responds and processes a return or refund under the stated terms.', reliability: 'Seller reliability', reliabilityText: 'Repeated delays, false information or unjustified refusals may result in restrictions after review.', testVersion: 'Test version', testVersionText: 'Real payments and refunds are not enabled in the currently published version.'
    },
    es: {
      language: 'Idioma', stepOne: 'Paso 1 de 3', stepTwo: 'Paso 2 de 3', stepThree: 'Paso 3 de 3',
      affiliatePrograms: 'Anade tus programas de afiliacion', affiliateProgramsText: 'Indica las plataformas en las que eres afiliado. JEOAH\'S mostrara las ofertas correspondientes en tu vitrina.',
      socialTitle: 'Presenta tus redes sociales', socialText: 'Estos perfiles seran visibles en tu vitrina para que los visitantes descubran tu contenido.',
      profileTitle: 'Configuracion de afiliado', profileSubtitle: 'Finaliza tu perfil publico', profileText: 'Ultimo paso. Crea tu identidad publica. Esta informacion sera visible en tu pagina de afiliacion.',
      addPlatform: 'Anadir una plataforma', saveContinue: 'Guardar y continuar', back: 'Volver', finish: 'Finalizar',
      photo: 'Foto o avatar', photoChoice: 'Elegir una foto del ordenador', photoHelp: 'Foto local o URL publica. Tamano maximo: 600 KB.',
      username: 'Nombre de usuario publico (*)', usernameHelp: 'Sera tu identificador unico en la plataforma.', bio: 'Tu biografia (max. 300 caracteres)',
      imagePlaceholder: 'URL de imagen (opcional)', usernamePlaceholder: 'Ejemplo: SuperAfiliado2024', bioPlaceholder: 'Describe quien eres. Que compartes con tu audiencia?',
      authPrompt: 'Elige tu rol para empezar', authRole: 'Soy...', buyer: 'Comprador', seller: 'Vendedor', affiliate: 'Afiliado', google: 'Registrarse con Google', termsPrefix: 'Al continuar, aceptas nuestros', terms: 'Terminos y condiciones', home: 'Volver al inicio'
      ,shippingTitle: 'Envios, devoluciones y reembolsos', shippingRoleTitle: 'Rol de JEOAH\'S', shippingRole: 'JEOAH\'S facilita la conexion y, en el modelo previsto, el procesamiento del pago. JEOAH\'S no almacena productos ni realiza envios.', sellerResponsibility: 'Responsabilidad del vendedor', sellerResponsibilityText: 'Cada vendedor debe indicar los paises o zonas atendidos, costes de envio, plazo, transportista y condiciones de devolucion antes del pedido.', tracking: 'Seguimiento del pedido', trackingText: 'El vendedor confirma la preparacion, proporciona la informacion de envio disponible y actualiza el estado hasta la entrega.', returns: 'Devoluciones y reembolsos', returnsText: 'El comprador informa un problema desde el pedido. El vendedor responde y tramita la devolucion o reembolso segun las condiciones.', reliability: 'Fiabilidad de vendedores', reliabilityText: 'Los retrasos repetidos, la informacion falsa o las negativas injustificadas pueden causar restricciones tras una revision.', testVersion: 'Version de prueba', testVersionText: 'Los pagos y reembolsos reales no estan activados en la version publicada actualmente.'
    },
    ht: {
      language: 'Lang', stepOne: 'Etap 1 sou 3', stepTwo: 'Etap 2 sou 3', stepThree: 'Etap 3 sou 3',
      affiliatePrograms: 'Ajoute pwogram afilyasyon ou yo', affiliateProgramsText: 'Chwazi platfom kote ou se afilye. JEOAH\'S ap montre bon of yo sou vitrin ou.',
      socialTitle: 'Prezante rezo sosyal ou yo', socialText: 'Pwofil sa yo ap vizib sou vitrin ou pou vizite yo dekouvri kontni ou.',
      profileTitle: 'Konfigirasyon afilye', profileSubtitle: 'Fini pwofil piblik ou', profileText: 'Denye etap. Kreye idantite piblik ou. Enfomasyon sa yo ap vizib sou paj afilyasyon ou.',
      addPlatform: 'Ajoute yon platfom', saveContinue: 'Anrejistre epi kontinye', back: 'Retounen', finish: 'Fini',
      photo: 'Foto oswa avatar', photoChoice: 'Chwazi yon foto sou odinate ou', photoHelp: 'Foto lokal oswa URL piblik. Gwose maksimom: 600 Ko.',
      username: 'Non itilizate piblik (*)', usernameHelp: 'Sa ap idantifyan inik ou sou platfom nan.', bio: 'Biyografi ou (max. 300 karakte)',
      imagePlaceholder: 'URL imaj (opsyonel)', usernamePlaceholder: 'Egzanp: SuperAfilye2024', bioPlaceholder: 'Dekri tet ou ak kek mo. Kisa ou pataje ak odyans ou?',
      authPrompt: 'Chwazi wol ou pou komanse', authRole: 'Mwen se yon...', buyer: 'Achte', seller: 'Vande', affiliate: 'Afilye', google: 'Enskri ak Google', termsPrefix: 'Lè ou kontinye, ou aksepte', terms: 'Kondisyon yo', home: 'Retounen lakay'
      ,shippingTitle: 'Livrezon, retou ak ranbousman', shippingRoleTitle: 'Wol JEOAH\'S', shippingRole: 'JEOAH\'S fasilite koneksyon an epi, nan model ki prevwa a, tretman peman an. JEOAH\'S pa estoke pwodwi epi li pa livre yo.', sellerResponsibility: 'Responsablite vande a', sellerResponsibilityText: 'Chak vande dwe endike peyi oswa zon li sevi, frè livrezon, delè, transpotè ak kondisyon retou yo avan komand la.', tracking: 'Swivi komand', trackingText: 'Vande a konfime preparasyon an, bay enfomasyon livrezon ki disponib epi mete eta a ajou jouk li livre.', returns: 'Retou ak ranbousman', returnsText: 'Achte a siyale yon pwoblem depi nan komand la. Vande a reponn epi trete retou oswa ranbousman an selon kondisyon yo.', reliability: 'Fyabilite vande yo', reliabilityText: 'Reta repete, fo enfomasyon oswa refi san rezon ka lakoz restriksyon apre verifikasyon.', testVersion: 'Vesyon tes', testVersionText: 'Peman ak ranbousman reyel yo pa aktive nan vesyon ki pibliye a.'
    }
  };

  function apply(language) {
    const dictionary = words[language] || words.fr;
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = dictionary[element.dataset.i18n];
      if (value) element.textContent = value;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const value = dictionary[element.dataset.i18nPlaceholder];
      if (value) element.placeholder = value;
    });
  }

  function addSelector() {
    if (document.getElementById('page-language-select')) return;
    const wrapper = document.createElement('label');
    wrapper.style.cssText = 'position:fixed;top:12px;right:12px;z-index:1001;background:#fff;padding:6px 8px;border:1px solid #cbd5e1;border-radius:8px;font:600 12px Arial;color:#334155;box-shadow:0 2px 8px rgba(15,23,42,.12)';
    const select = document.createElement('select');
    select.id = 'page-language-select';
    select.setAttribute('aria-label', 'Language');
    select.style.cssText = 'margin-left:6px;border:0;background:transparent;font:inherit;color:inherit;outline:0';
    [['fr', 'FR'], ['ht', 'HT'], ['en', 'EN'], ['es', 'ES']].forEach(([value, label]) => {
      const option = new Option(label, value);
      select.add(option);
    });
    wrapper.append(document.createTextNode('Langue'), select);
    document.body.appendChild(wrapper);
    select.value = localStorage.getItem(key) || 'fr';
    select.addEventListener('change', () => {
      localStorage.setItem(key, select.value);
      apply(select.value);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    addSelector();
    apply(localStorage.getItem(key) || 'fr');
  });
})();
