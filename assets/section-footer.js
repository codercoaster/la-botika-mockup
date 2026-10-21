/* Section: footer — demo newsletter submit. */
Theme.register('footer', (root) => {
  const form = root.querySelector('[data-newsletter]');
  const onSubmit = (e) => {
    e.preventDefault();
    Theme.toast('¡Gracias! Te escribiremos con novedades.');
    form.reset();
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
});
