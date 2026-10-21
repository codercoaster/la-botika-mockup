/* ==========================================================================
   Theme core — section registry + shared helpers.

   Each section registers an init function scoped to its root element:
     Theme.register('hero', (root) => { ...; return () => { cleanup } });
   Roots are [data-section="<name>"]. Init runs once per root and re-runs when
   Shopify's theme editor re-renders a section (shopify:section:load/unload).
   ========================================================================== */
(function () {
  const registry = {};
  const mounted = new WeakMap(); // root -> cleanup fn

  function mount(root) {
    const init = registry[root.dataset.section];
    if (!init || mounted.has(root)) return;
    const cleanup = init(root);
    mounted.set(root, typeof cleanup === 'function' ? cleanup : () => {});
  }

  function unmount(root) {
    const cleanup = mounted.get(root);
    if (!cleanup) return;
    cleanup();
    mounted.delete(root);
  }

  function rootsIn(target) {
    if (!(target instanceof Element)) return [];
    const roots = [...target.querySelectorAll('[data-section]')];
    if (target.matches('[data-section]')) roots.unshift(target);
    return roots;
  }

  document.addEventListener('shopify:section:load', (e) => rootsIn(e.target).forEach(mount));
  document.addEventListener('shopify:section:unload', (e) => rootsIn(e.target).forEach(unmount));

  const money = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const Theme = {
    register(name, init) {
      registry[name] = init;
      document.querySelectorAll(`[data-section="${name}"]`).forEach(mount);
    },

    mount,
    unmount,

    /** 6990 -> "$6.990" */
    money: (amount) => money.format(amount),

    /** True when GSAP loaded and the user allows motion. */
    get motion() {
      return document.documentElement.classList.contains('motion') && !!window.gsap;
    },

    /**
     * Run GSAP code scoped to a section; returns a cleanup that reverts every
     * tween/ScrollTrigger created inside. No-op when motion is off.
     */
    animate(root, fn) {
      if (!Theme.motion) return () => {};
      const ctx = gsap.context(fn, root);
      return () => ctx.revert();
    },

    /** Fade-up reveal for [data-reveal] descendants, batched with a stagger. */
    reveal(root, selector = '[data-reveal]') {
      const els = [...root.querySelectorAll(selector)];
      if (!els.length) return;
      ScrollTrigger.batch(els, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
    },

    /** Light scrubbed parallax; amount in px (keep it small). */
    parallax(el, amount = 40, trigger = el) {
      gsap.fromTo(el, { y: -amount }, {
        y: amount,
        ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    },

    /** Product data (data/products.js). Mirrors Shopify collection lookups. */
    products({ collections, onSale, limit = 12, interleave = false } = {}) {
      let list = window.PRODUCTS || [];
      if (onSale) {
        list = list
          .filter((p) => p.compare_at_price > p.price)
          .sort((a, b) => b.compare_at_price / b.price - a.compare_at_price / a.price);
      }
      if (collections) {
        const groups = collections.map((c) => list.filter((p) => p.collections.includes(c)));
        list = interleave
          ? groups.flatMap((g, i) => g.map((p, j) => ({ p, k: j * groups.length + i }))).sort((a, b) => a.k - b.k).map((x) => x.p)
          : groups.flat();
      }
      return list.slice(0, limit);
    },

    productByHandle: (handle) => (window.PRODUCTS || []).find((p) => p.handle === handle),

    toast(message) {
      let region = document.querySelector('.toast-region');
      if (!region) {
        region = document.createElement('div');
        region.className = 'toast-region';
        region.setAttribute('role', 'status');
        region.setAttribute('aria-live', 'polite');
        document.body.append(region);
      }
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = '<span class="toast__icon"><svg class="icon" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span></span>';
      toast.lastElementChild.textContent = message;
      region.append(toast);
      while (region.children.length > 3) region.firstElementChild.remove();
      setTimeout(() => {
        toast.classList.add('is-leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
      }, 2600);
    },
  };

  window.Theme = Theme;
})();
