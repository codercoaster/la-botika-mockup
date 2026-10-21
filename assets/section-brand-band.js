/* Section: brand-band — count-up numbers on enter, light background parallax. */
Theme.register('brand-band', (root) =>
  Theme.animate(root, () => {
    Theme.reveal(root);
    Theme.parallax(root.querySelector('[data-parallax]'), 30, root);

    const format = new Intl.NumberFormat('es-CL');
    root.querySelectorAll('[data-count]').forEach((el) => {
      const counter = { value: 0 };
      const target = Number(el.dataset.count);
      el.textContent = '0';
      gsap.to(counter, {
        value: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => (el.textContent = format.format(Math.round(counter.value))),
      });
    });
  })
);
