(function () {
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
      .then(html => { footerTarget.innerHTML = html; })
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
      })
      .catch(error => console.warn(error.message));
  }

  function loadSharedElements() {
    loadSharedFooter();
    loadJeoahWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSharedElements, { once: true });
  } else {
    loadSharedElements();
  }
})();
