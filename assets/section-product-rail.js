/* Section: product-rail — renders cards from data, arrow navigation, reveal. */
Theme.register('product-rail', (root) => {
  const track = root.querySelector('[data-track]');
  const [prev, next] = root.querySelectorAll('.product-rail__arrow');
  const { collections, onSale, limit } = root.dataset;

  const products = Theme.products({
    collections: collections ? collections.split(',').map((c) => c.trim()) : undefined,
    onSale: onSale === 'true',
    limit: Number(limit) || 10,
    interleave: true,
  });
  track.replaceChildren(
    ...products.map((p) => {
      const li = document.createElement('li');
      li.dataset.reveal = '';
      li.append(Theme.renderProductCard(p));
      return li;
    })
  );

  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };
  const onArrow = (e) => {
    const button = e.target.closest('.product-rail__arrow');
    if (!button) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: Number(button.dataset.dir) * track.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' });
  };
  root.addEventListener('click', onArrow);
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  const revert = Theme.animate(root, () => Theme.reveal(root));

  return () => {
    revert();
    root.removeEventListener('click', onArrow);
    track.removeEventListener('scroll', update);
    window.removeEventListener('resize', update);
  };
});
