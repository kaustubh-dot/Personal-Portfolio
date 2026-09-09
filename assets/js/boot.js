// A single handoff coordinates the loader with the homepage entrance.
(() => {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  window.portfolioIntroStarted = performance.now();
  let requested = false;
  let resolveOpening;
  const opening = new Promise(resolve => { resolveOpening = resolve; });
  const reveal = () => {
    loader?.classList.add('done');
    root.classList.remove('is-loading');
    resolveOpening();
  };
  window.finishPortfolioIntro = () => {
    if (requested) return opening;
    requested = true;
    const begin = () => {
      if (motion.matches || !loader || document.hidden || !window.playPortfolioWebExit) {
        reveal();
        return;
      }
      window.playPortfolioWebExit(loader, reveal, resolveOpening);
    };
    const hold = motion.matches ? 0 : Math.max(0, 700 - (performance.now() - window.portfolioIntroStarted));
    if (hold) window.setTimeout(begin, hold);
    else begin();
    return opening;
  };
  if (!motion.matches) root.classList.add('is-loading');
  window.setTimeout(window.finishPortfolioIntro, 1800);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
