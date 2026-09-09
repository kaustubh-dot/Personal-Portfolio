// The entrance never gates access to the portfolio or depends on a CDN.
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.portfolioIntroStarted = performance.now();
  let finished = false;
  window.finishPortfolioIntro = () => {
    if (finished) return;
    finished = true;
    document.getElementById('loader').classList.add('done');
    root.classList.remove('is-loading');
  };
  if (!reduced) root.classList.add('is-loading');
  window.setTimeout(window.finishPortfolioIntro, 1800);
  document.getElementById('year').textContent = new Date().getFullYear();
})();
