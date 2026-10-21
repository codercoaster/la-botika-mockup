/* Section: announcement-bar — rotates messages on small screens; pauses on hover/focus. */
Theme.register('announcement-bar', (root) => {
  const items = [...root.querySelectorAll('.announcement-bar__item')];
  const desktop = matchMedia('(min-width: 1100px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0;
  let paused = false;

  const tick = () => {
    if (paused || desktop.matches || reduced.matches) return;
    items[index].classList.remove('is-active');
    index = (index + 1) % items.length;
    items[index].classList.add('is-active');
  };
  const timer = setInterval(tick, 4500);

  const pause = () => (paused = true);
  const resume = () => (paused = false);
  root.addEventListener('pointerenter', pause);
  root.addEventListener('pointerleave', resume);
  root.addEventListener('focusin', pause);
  root.addEventListener('focusout', resume);

  return () => {
    clearInterval(timer);
    root.removeEventListener('pointerenter', pause);
    root.removeEventListener('pointerleave', resume);
    root.removeEventListener('focusin', pause);
    root.removeEventListener('focusout', resume);
  };
});
