/* ==========================================================================
   Global motion setup: GSAP + ScrollTrigger, Lenis smooth scroll.
   <head> adds html.motion when prefers-reduced-motion isn't set; if GSAP failed
   to load we drop it so nothing stays hidden.
   ========================================================================== */
(function () {
  const html = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger) {
    html.classList.remove('motion');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if (!html.classList.contains('motion') || window.__lenis) return;

  if (window.Lenis) {
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  // Images load after layout; recalc trigger positions once everything is in.
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
