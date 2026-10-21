/* Section: branches-cta — card reveal, then map pins drop in one by one. */
Theme.register('branches-cta', (root) =>
  Theme.animate(root, () => {
    Theme.reveal(root);
    gsap.from(root.querySelectorAll('.pin > circle:last-child'), {
      scale: 0,
      transformOrigin: 'center',
      duration: 0.5,
      ease: 'back.out(3)',
      stagger: 0.08,
      scrollTrigger: { trigger: root.querySelector('.branches-cta__map'), start: 'top 75%', once: true },
    });
  })
);
