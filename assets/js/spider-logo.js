(() => {
  'use strict';
  const button = document.querySelector('.spider-logo');
  if (!button) return;
  const badge = button.querySelector('.publisher-logo');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = null;

  // This small cameo is independent of GSAP and the WebGL background.
  const character = '<svg viewBox="0 0 120 164" aria-hidden="true" focusable="false">' +
    '<g stroke="#15151C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M52 62 37 40Q29 28 48 12M68 62 83 40Q91 28 72 12" fill="none" stroke-width="15"/>' +
      '<path d="M52 62 37 40Q29 28 48 12M68 62 83 40Q91 28 72 12" fill="none" stroke="#2342D6" stroke-width="9"/>' +
      '<path d="m43 18 8-12 9 4 9-4 8 12-9 8-8-11-8 11Z" fill="#E0202F"/>' +
      '<path d="M44 58Q60 50 76 58L80 87Q60 106 40 87Z" fill="#E0202F"/>' +
      '<path d="m44 58-4 29 12 9 1-34M76 58l4 29-12 9-1-34" fill="#2342D6" stroke-width="2.5"/>' +
      '<path d="M42 66 24 81 11 68" fill="none" stroke-width="13"/>' +
      '<path d="M42 66 24 81 11 68" fill="none" stroke="#E0202F" stroke-width="8"/>' +
      '<path d="M12 70 5 62m8 6-2-13m3 13 6-10" fill="none" stroke="#15151C" stroke-width="6"/>' +
      '<path d="M12 70 5 62m8 6-2-13m3 13 6-10" fill="none" stroke="#E0202F" stroke-width="3"/>' +
      '<g class="spider-wave"><path d="m78 66 18 14 12-20" fill="none" stroke-width="13"/>' +
        '<path d="m78 66 18 14 12-20" fill="none" stroke="#E0202F" stroke-width="8"/>' +
        '<path d="m108 63-5-12m6 10 2-15m0 16 7-9" fill="none" stroke-width="6"/>' +
        '<path d="m108 63-5-12m6 10 2-15m0 16 7-9" fill="none" stroke="#E0202F" stroke-width="3"/></g>' +
      '<ellipse cx="60" cy="123" rx="29" ry="34" fill="#E0202F"/>' +
    '</g>' +
    '<g fill="none" stroke="#15151C" stroke-width="1.25" opacity=".75">' +
      '<path d="M60 90v66m-21-57 42 47m0-47-42 47M32 120h56M36 106q24 19 48 0M33 134q27-15 54 0M43 150q17-13 34 0"/>' +
      '<path d="M53 57h14m-15 7h16m-15 25h14"/>' +
    '</g>' +
    '<g fill="#FBFAF5" stroke="#15151C" stroke-width="3.7" stroke-linejoin="round">' +
      '<path d="m36 122 21 10q-3 15-13 8-6-4-8-18Z"/>' +
      '<path class="spider-wink" d="m84 122-21 10q3 15 13 8 6-4 8-18Z"/>' +
    '</g>' +
    '<g stroke="#15151C" stroke-width="1.5" fill="none"><path d="m57 72-4-4m4 7-5-1m5 5-5 3m11-10 4-4m-4 7 5-1m-5 5 5 3"/></g>' +
    '<ellipse cx="60" cy="76" rx="2.5" ry="5" fill="#15151C"/>' +
  '</svg>';

  function finish() {
    if (!playing) return;
    clearTimeout(playing.timer);
    playing.animations.forEach(animation => animation.cancel());
    playing.element.remove();
    button.classList.remove('spider-is-playing');
    button.removeAttribute('aria-busy');
    playing = null;
  }

  button.addEventListener('pointerdown', event => event.stopPropagation());
  button.addEventListener('pointerup', event => event.stopPropagation());

  button.addEventListener('click', () => {
    if (playing) return;
    const rect = badge.getBoundingClientRect();
    const left = Math.max(6, Math.min(rect.left + rect.width / 2 - 92, innerWidth - 190));
    const anchor = rect.left + rect.width / 2 - left;
    const drop = Math.min(118, Math.max(50, innerHeight - rect.bottom - 162));
    const effect = document.createElement('div');
    effect.className = 'spider-surprise';
    effect.setAttribute('aria-hidden', 'true');
    effect.style.left = left + 'px';
    effect.style.top = rect.bottom - 3 + 'px';
    effect.style.height = drop + 160 + 'px';
    effect.style.setProperty('--drop', drop + 'px');
    const thread = 'M' + anchor.toFixed(1) + ' 0Q' + anchor.toFixed(1) + ' ' + (drop / 2) + ' 92 ' + drop;
    effect.innerHTML = '<svg class="spider-thread" viewBox="0 0 184 ' + drop + '" style="height:' + drop + 'px" aria-hidden="true">' +
      '<path d="' + thread + '" fill="none" stroke="#FBFAF5" stroke-width="5"/>' +
      '<path d="' + thread + '" fill="none" stroke="#15151C" stroke-width="1.5"/></svg>' +
      '<div class="spider-hanger">' + character + '</div><span class="spider-thwip">THWIP!</span>';
    document.body.appendChild(effect);
    button.classList.add('spider-is-playing');
    button.setAttribute('aria-busy', 'true');
    playing = { element: effect, animations: [], timer: null };
    const animate = (element, frames, timing) => playing.animations.push(element.animate(frames, timing));

    if (reduced.matches || typeof effect.animate !== 'function') {
      effect.classList.add('is-reduced');
      playing.timer = setTimeout(finish, 1200);
      return;
    }

    const duration = 1800;
    animate(effect.querySelector('.spider-hanger'), [
      { transform:'translateY(-156px) rotate(-12deg)', opacity:0, offset:0 },
      { transform:'translateY(-130px) rotate(-12deg)', opacity:1, offset:.05, easing:'cubic-bezier(.18,.7,.3,1)' },
      { transform:'translateY(' + (drop + 11) + 'px) rotate(8deg)', opacity:1, offset:.28, easing:'ease-in-out' },
      { transform:'translateY(' + drop + 'px) rotate(-6deg)', opacity:1, offset:.4, easing:'ease-in-out' },
      { transform:'translateY(' + drop + 'px) rotate(4deg)', opacity:1, offset:.53, easing:'ease-in-out' },
      { transform:'translateY(' + drop + 'px) rotate(-2deg)', opacity:1, offset:.67, easing:'ease-in-out' },
      { transform:'translateY(' + drop + 'px) rotate(0deg)', opacity:1, offset:.77, easing:'cubic-bezier(.7,0,.85,.5)' },
      { transform:'translateY(-163px) rotate(8deg)', opacity:0, offset:1 }
    ], { duration, fill:'both' });
    animate(effect.querySelector('.spider-thread'), [
      { transform:'scaleY(.01)', opacity:0, offset:0 },
      { transform:'scaleY(.01)', opacity:1, offset:.08 },
      { transform:'scaleY(1.09)', opacity:1, offset:.28 },
      { transform:'scaleY(1)', opacity:1, offset:.4 },
      { transform:'scaleY(1)', opacity:1, offset:.77 },
      { transform:'scaleY(0)', opacity:0, offset:1 }
    ], { duration, fill:'both' });
    animate(effect.querySelector('.spider-thwip'), [
      { opacity:0, transform:'rotate(-10deg) scale(.3)', offset:0 },
      { opacity:0, transform:'rotate(-10deg) scale(.3)', offset:.24 },
      { opacity:1, transform:'rotate(10deg) scale(1.1)', offset:.33 },
      { opacity:1, transform:'rotate(7deg) scale(1)', offset:.43 },
      { opacity:1, transform:'rotate(7deg) scale(1)', offset:.71 },
      { opacity:0, transform:'rotate(15deg) scale(.7)', offset:.83 },
      { opacity:0, transform:'rotate(15deg) scale(.7)', offset:1 }
    ], { duration, fill:'both' });
    animate(effect.querySelector('.spider-wave'), [
      { transform:'rotate(-9deg)' }, { transform:'rotate(13deg)' }, { transform:'rotate(-9deg)' }
    ], { duration:230, delay:560, iterations:3, easing:'ease-in-out' });
    animate(effect.querySelector('.spider-wink'), [
      { transform:'scaleY(1)' }, { transform:'scaleY(.12)' }, { transform:'scaleY(1)' }
    ], { duration:200, delay:980, easing:'ease-in-out' });
    animate(badge, [
      { transform:'rotate(-4deg) scale(1)' },
      { transform:'rotate(7deg) scale(.92)' },
      { transform:'rotate(-8deg) scale(1.08)' },
      { transform:'rotate(-4deg) scale(1)' }
    ], { duration:420, easing:'ease-out' });
    playing.timer = setTimeout(finish, duration);
  });

  addEventListener('resize', finish);
  addEventListener('pagehide', finish);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  reduced.addEventListener('change', finish);
})();
