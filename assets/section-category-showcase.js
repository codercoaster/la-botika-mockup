/* Section: category-showcase — 4 products from the collection, reveal + light parallax. */
Theme.register('category-showcase', (root) => {
  const grid = root.querySelector('[data-grid]');
  const products = Theme.products({ collections: [root.dataset.collection], limit: 4 });
  grid.replaceChildren(
    ...products.map((p) => {
      const li = document.createElement('li');
      li.dataset.reveal = '';
      li.append(Theme.renderProductCard(p));
      return li;
    })
  );

  return Theme.animate(root, () => {
    Theme.reveal(root);
    Theme.parallax(root.querySelector('[data-parallax]'), 28, root);
  });
});
