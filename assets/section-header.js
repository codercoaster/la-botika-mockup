/* Section: header — scrolled state, mobile drawer, demo cart counter. */
Theme.register('header', (root) => {
  const header = root.closest('.site-header') || root;
  const drawer = root.querySelector('.menu-drawer');
  const openBtn = root.querySelector('[data-drawer-open]');
  const count = root.querySelector('[data-cart-count]');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.inert = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    window.__lenis?.[open ? 'stop' : 'start']();
    (open ? drawer.querySelector('[data-drawer-close]:not(.menu-drawer__overlay)') : openBtn).focus();
  };
  const onClick = (e) => {
    if (e.target.closest('[data-drawer-open]')) setDrawer(true);
    else if (e.target.closest('[data-drawer-close]')) setDrawer(false);
  };
  const onKey = (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
  };
  root.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);

  const onAdd = () => {
    const n = Number(count.textContent) + 1;
    count.textContent = n;
    count.setAttribute('aria-label', `${n} productos en el carro`);
    count.classList.remove('is-bumping');
    void count.offsetWidth; // restart the animation
    count.classList.add('is-bumping');
  };
  document.addEventListener('theme:cart:add', onAdd);

  return () => {
    window.removeEventListener('scroll', onScroll);
    root.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('theme:cart:add', onAdd);
    if (drawer.classList.contains('is-open')) setDrawer(false);
  };
});
