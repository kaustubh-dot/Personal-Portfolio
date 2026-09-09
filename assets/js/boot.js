// The entrance never gates access to the portfolio or depends on a CDN.
(() => {
  const root = document.documentElement;
  const loader = document.getElementById('loader');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.portfolioIntroStarted = performance.now();
  let finished = false;
  const reveal = () => {
    loader?.classList.add('done');
    root.classList.remove('is-loading');
  };
  window.finishPortfolioIntro = () => {
    if (finished) return;
    finished = true;
    if (reduced || !loader || document.hidden || !window.playPortfolioWebExit) {
      reveal();
      return;
    }
    window.playPortfolioWebExit(loader, reveal);
  };
  if (!reduced) root.classList.add('is-loading');
  window.setTimeout(window.finishPortfolioIntro, 1800);
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
