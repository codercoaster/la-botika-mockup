/* ==========================================================================
   Snippet: product-card — renders a card from a Shopify-shaped product object
   using <template id="product-card-template">. "Agregar" is demo-only: toast +
   a theme:cart:add event the header listens to.
   ========================================================================== */
(function () {
  const productUrl = (p) => `product.html?handle=${encodeURIComponent(p.handle)}`;

  Theme.isPrescription = (p) =>
    /receta/i.test(p.metafields?.ficha?.condicion_de_venta || '') || p.tags.some((t) => /^con receta$/i.test(t));

  Theme.renderProductCard = function (product) {
    const tpl = document.getElementById('product-card-template');
    const card = tpl.content.firstElementChild.cloneNode(true);
    const field = (name) => card.querySelector(`[data-field="${name}"]`);

    card.dataset.handle = product.handle;
    field('url').href = productUrl(product);
    field('title').href = productUrl(product);
    field('title').textContent = product.title;
    field('vendor').textContent = product.vendor;
    field('image').src = product.featured_image.src;
    field('image').alt = product.featured_image.alt;
    field('price').textContent = Theme.money(product.price);

    if (product.compare_at_price > product.price) {
      const pct = Math.round((1 - product.price / product.compare_at_price) * 100);
      field('compare').textContent = Theme.money(product.compare_at_price);
      field('compare').hidden = false;
      field('discount').textContent = `-${pct}%`;
      field('discount').hidden = false;
      card.classList.add('is-on-sale');
    }
    field('rx').hidden = !Theme.isPrescription(product);
    return card;
  };

  document.addEventListener('click', (e) => {
    const button = e.target.closest('[data-add-to-cart]');
    if (!button) return;
    const card = button.closest('[data-handle]');
    const product = card && Theme.productByHandle(card.dataset.handle);
    const title = product ? product.title : 'Producto';

    Theme.toast(`Agregaste ${title} al carro`);
    document.dispatchEvent(new CustomEvent('theme:cart:add', { detail: { handle: card?.dataset.handle } }));

    const label = button.querySelector('[data-label]');
    if (!label || button.classList.contains('is-added')) return;
    const original = label.textContent;
    button.classList.add('is-added');
    label.textContent = 'Agregado';
    setTimeout(() => {
      button.classList.remove('is-added');
      label.textContent = original;
    }, 1600);
  });
})();
