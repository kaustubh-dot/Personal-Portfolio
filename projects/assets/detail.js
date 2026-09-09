(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const sections = [...document.querySelectorAll('.case-section')];
  const links = [...document.querySelectorAll('.chapter-links a')];
  const hero = document.querySelector('.cover-button');
  const cursor = document.querySelector('.image-cursor');
  let scheduled = false;

  function readPosition() {
    const total = root.scrollHeight - innerHeight;
    root.style.setProperty('--reading', total > 0 ? Math.max(0, Math.min(1, scrollY / total)).toFixed(4) : '0');
    const current = [...sections].reverse().find(section => section.getBoundingClientRect().top < innerHeight * .34) || sections[0];
    links.forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (!reduce.matches) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) hero.style.setProperty('--cover-shift', Math.max(-14, Math.min(14, -scrollY * .035)) + 'px');
    }
    scheduled = false;
  }
  function requestPosition() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(readPosition); }
  }
  addEventListener('scroll', requestPosition, { passive: true });
  addEventListener('resize', requestPosition);
  readPosition();

  if ('IntersectionObserver' in window && !reduce.matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .07 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    root.classList.add('motion-ready');
  }

  const rail = document.querySelector('.gallery-rail');
  const panels = [...rail.querySelectorAll('.gallery-panel')];
  const slideButtons = [...document.querySelectorAll('[data-slide]')];
  let selected = 0, railScheduled = false;
  rail.tabIndex = 0;
  function panelOffset(panel) {
    return panel.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft - parseFloat(getComputedStyle(rail).paddingLeft);
  }
  function readRail() {
    selected = panels.reduce((best, panel, index) =>
      Math.abs(panelOffset(panel) - rail.scrollLeft) < Math.abs(panelOffset(panels[best]) - rail.scrollLeft) ? index : best, 0);
    document.querySelector('.rail-count').textContent = String(selected + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
    slideButtons.forEach(button => {
      button.disabled = Number(button.dataset.slide) < 0 ? selected === 0 : selected === panels.length - 1;
    });
    railScheduled = false;
  }
  function movePanel(direction) {
    const target = Math.max(0, Math.min(panels.length - 1, selected + direction));
    rail.scrollTo({ left: panelOffset(panels[target]), behavior: reduce.matches ? 'instant' : 'smooth' });
  }
  slideButtons.forEach(button => button.addEventListener('click', () => movePanel(Number(button.dataset.slide))));
  rail.addEventListener('scroll', () => {
    if (!railScheduled) { railScheduled = true; requestAnimationFrame(readRail); }
    cursor.classList.remove('visible');
  }, { passive: true });
  rail.addEventListener('keydown', event => {
    if (event.target === rail && ['ArrowRight', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();
      movePanel(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  addEventListener('resize', readRail);
  readRail();

  const triggers = [...document.querySelectorAll('[data-gallery]')];
  const images = triggers.map(button => ({
    src: button.querySelector('img').src,
    alt: button.querySelector('img').alt,
    title: button.closest('figure').querySelector('figcaption').innerText.replace(/\s+/g, ' ').replace(/Visual placeholder/g, '').trim()
  }));
  const dialog = document.querySelector('.gallery-dialog');
  const viewer = dialog.querySelector('.dialog-image');
  let active = 0, opener;
  function showImage(index) {
    active = (index + images.length) % images.length;
    viewer.src = images[active].src;
    viewer.alt = images[active].alt;
    dialog.querySelector('#dialog-title').textContent = images[active].title;
    dialog.querySelector('.dialog-count').textContent = String(active + 1).padStart(2, '0') + ' / ' + String(images.length).padStart(2, '0');
  }
  triggers.forEach(button => button.addEventListener('click', () => {
    opener = button;
    showImage(Number(button.dataset.gallery));
    dialog.showModal();
    document.body.classList.add('gallery-open');
    cursor.classList.remove('visible');
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => showImage(active + Number(button.dataset.direction))));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showImage(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('gallery-open');
    opener?.focus({ preventScroll: true });
    requestPosition();
  });

  function syncPointer() {
    const enabled = finePointer.matches && !reduce.matches && innerWidth > 760;
    root.classList.toggle('has-image-cursor', enabled);
    if (!enabled) cursor.classList.remove('visible');
  }
  triggers.forEach(button => {
    button.addEventListener('pointermove', event => {
      if (!root.classList.contains('has-image-cursor')) return;
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
      cursor.classList.add('visible');
      if (button === hero) {
        const r = hero.getBoundingClientRect(), x = (event.clientX - r.left) / r.width - .5;
        hero.style.setProperty('--hero-x', (x * 15).toFixed(2) + 'px');
        hero.style.setProperty('--hero-turn', (x * 3).toFixed(2) + 'deg');
      }
    });
    button.addEventListener('pointerleave', () => {
      cursor.classList.remove('visible');
      if (button === hero) {
        hero.style.setProperty('--hero-x', '0px');
        hero.style.setProperty('--hero-turn', '0deg');
      }
    });
    button.addEventListener('blur', () => cursor.classList.remove('visible'));
  });
  addEventListener('scroll', () => cursor.classList.remove('visible'), { passive: true });
  addEventListener('blur', () => cursor.classList.remove('visible'));
  addEventListener('resize', syncPointer);
  finePointer.addEventListener('change', syncPointer);
  reduce.addEventListener('change', syncPointer);
  syncPointer();
})();

