const LANG_KEY = 'jeoahs-lang';
const DEFAULT_LANG = 'fr';

window.setLang = function(lang) {
    localStorage.setItem(LANG_KEY, lang);
    location.reload();
}

window.initializeTranslator = async function() {
    let currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
    let translations = {};
    try {
        const languageFile = `${currentLang}.json`;
        let response = await fetch(`/public/assets/lang/${languageFile}`);
        if (!response.ok) {
            response = await fetch(`/assets/lang/${languageFile}`);
        }
        if (!response.ok) throw new Error(`Fichier de langue ${languageFile} introuvable.`);
        const translationSource = await response.text();
        translations = JSON.parse(translationSource.replace(/\\'/g, "'"));
    } catch (error) {
        console.error('Erreur lors du chargement du fichier de langue:', error);
        return;
    }

    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key]) {
            if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translations[key]);
            } else if (element.hasAttribute('value')) {
                element.setAttribute('value', translations[key]);
            } else {
                element.innerHTML = translations[key];
            }
        }
    });

    const langSelectors = document.querySelectorAll('[data-lang]');
    langSelectors.forEach(selector => {
        selector.classList.remove('active-lang');
        if (selector.getAttribute('data-lang') === currentLang) {
            selector.classList.add('active-lang');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => window.initializeTranslator());
