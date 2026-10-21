/* Section: hero — intro stagger, layered parallax, floating badges. */
Theme.register('hero', (root) =>
  Theme.animate(root, () => {
    gsap.from('.hero__intro', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.1 });
    // Intro tweens leave `y` alone — parallax and float own it.
    gsap.from('.hero__product', { opacity: 0, scale: 0.8, duration: 1.1, ease: 'back.out(1.4)', stagger: 0.12, delay: 0.25 });
    gsap.from('.hero__badge', { opacity: 0, scale: 0.9, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.7 });

    // Depth-based parallax: higher data-depth moves more (max ~60px).
    root.querySelectorAll('[data-depth]').forEach((el) => {
      const amount = Math.min(60, 36 * Number(el.dataset.depth));
      gsap.to(el, {
        y: amount,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    root.querySelectorAll('[data-float]').forEach((el, i) => {
      gsap.to(el, { y: -8, duration: 2.4 + i * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 1.2 + i * 0.3 });
    });
  })
);
