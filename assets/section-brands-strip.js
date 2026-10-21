/* Section: brands-strip — clones the logo group so the marquee loops seamlessly. */
Theme.register('brands-strip', (root) => {
  const track = root.querySelector('[data-track]');
  const group = root.querySelector('[data-group]');
  const revert = Theme.animate(root, () => Theme.reveal(root));

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return revert;

  // First half = original + copies until wider than the viewport; second half mirrors it.
  const clones = [];
  const addClone = () => {
    const clone = group.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach((img) => (img.alt = ''));
    track.append(clone);
    clones.push(clone);
  };
  const perHalf = Math.max(1, Math.ceil(window.innerWidth / Math.max(group.offsetWidth, 1)));
  for (let i = 1; i < perHalf * 2; i++) addClone();
  track.style.setProperty('--duration', `${perHalf * 30}s`);
  track.classList.add('is-running');

  return () => {
    revert();
    clones.forEach((c) => c.remove());
    track.classList.remove('is-running');
  };
});
