// Break the actual loader content into web-shaped pieces; no images or CDN needed.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  window.playPortfolioWebExit = (loader, onFinish) => {
    const width = innerWidth, height = innerHeight;
    const center = [width * .51, height * .44];
    const compact = width < 700;
    const rings = compact ? [0, .28, .6, 1] : [0, .2, .43, .7, 1];
    const animations = [], timers = [];
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let cleaned = false;
    const layer = document.createElement('div');
    layer.className = 'loader-web-exit';
    layer.setAttribute('aria-hidden', 'true');
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      timers.forEach(clearTimeout);
      animations.forEach(animation => animation.cancel());
      layer.remove();
      loader.classList.remove('loader-fractured', 'loader-breaking');
      removeEventListener('resize', cleanup);
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', cleanup);
      onFinish();
    };
    const onVisibility = () => { if (document.hidden) cleanup(); };
    const animate = (element, frames, options) => {
      const animation = element.animate(frames, { fill:'both', ...options });
      animations.push(animation);
      return animation;
    };
    try {
      // Add corner spokes so the final ring covers every pixel of the rectangle.
      const count = compact ? 10 : 12;
      const angle = point => (Math.atan2(point[1] - center[1], point[0] - center[0]) + Math.PI * 2) % (Math.PI * 2);
      const angles = Array.from({length:count}, (_, i) => i / count * Math.PI * 2 + .035);
      for (const corner of [[0,0],[width,0],[width,height],[0,height]]) angles.push(angle(corner));
      angles.sort((a,b) => a-b);
      const spokes = angles.filter((a,i) => !i || a-angles[i-1] > .015).map(a => {
        const dx = Math.cos(a), dy = Math.sin(a);
        const reach = Math.min(dx > 0 ? (width-center[0])/dx : -center[0]/dx,
          dy > 0 ? (height-center[1])/dy : -center[1]/dy);
        return [center[0]+dx*reach, center[1]+dy*reach];
      });
      const point = (edge, amount) => center.map((v,i) => v+(edge[i]-v)*amount);
      const format = p => p.map(n=>n.toFixed(2)).join(' ');
      const bend = (a,b) => a.map((v,i) => ((v+b[i])*.5)*.91+center[i]*.09);
      const fragments = document.createElement('div');
      fragments.className = 'loader-fragments';
      const svg = document.createElementNS(NS,'svg');
      svg.setAttribute('viewBox', '0 0 '+width+' '+height);
      svg.setAttribute('preserveAspectRatio','none');
      svg.classList.add('loader-web-lines');
      const strokes = [];
      let web = '';
      spokes.forEach(edge => { web += 'M'+format(center)+'L'+format(edge); });
      rings.slice(1,-1).forEach(r => {
        spokes.forEach((edge,i) => {
          const a=point(edge,r),b=point(spokes[(i+1)%spokes.length],r);
          web += 'M'+format(a)+'Q'+format(bend(a,b))+' '+format(b);
        });
      });
      for (const [color,strokeWidth] of [['#15151c','4'],['#fbfaf5','1.35']]) {
        const path=document.createElementNS(NS,'path');
        path.setAttribute('d',web);path.setAttribute('fill','none');
        path.setAttribute('stroke',color);path.setAttribute('stroke-width',strokeWidth);
        path.setAttribute('stroke-linecap','round');path.setAttribute('pathLength','1');
        path.style.strokeDasharray='1';svg.append(path);strokes.push(path);
      }
      const padding=getComputedStyle(loader).padding;
      const template=loader.cloneNode(true);
      template.removeAttribute('id');template.className='loader-piece-screen';
      template.style.width=width+'px';template.style.height=height+'px';
      template.style.padding=padding;
      for(let ring=0;ring<rings.length-1;ring++) {
        spokes.forEach((edge,i) => {
          const next=spokes[(i+1)%spokes.length];
          const a=point(edge,rings[ring]),b=point(edge,rings[ring+1]);
          const c=point(next,rings[ring+1]),d=point(next,rings[ring]);
          const outer=bend(b,c),inner=bend(d,a);
          // Curved clipping follows the silk arcs, including their inward sag.
          const vertices=[a,b,c,d,outer,inner];
          const left=Math.floor(Math.min(...vertices.map(p=>p[0])))-1;
          const top=Math.floor(Math.min(...vertices.map(p=>p[1])))-1;
          const right=Math.ceil(Math.max(...vertices.map(p=>p[0])))+1;
          const bottom=Math.ceil(Math.max(...vertices.map(p=>p[1])))+1;
          const local=p=>format([p[0]-left,p[1]-top]);
          // Keep the outside ring straight along the viewport edge.
          const outside=ring===rings.length-2 ? 'L'+local(c) : 'Q'+local(outer)+' '+local(c);
          const shape='M'+local(a)+'L'+local(b)+outside+'L'+local(d)+'Q'+local(inner)+' '+local(a)+'Z';
          const piece=document.createElement('div');piece.className='loader-fragment';
          Object.assign(piece.style,{left:left+'px',top:top+'px',width:(right-left)+'px',height:(bottom-top)+'px',clipPath:'path("'+shape+'")'});
          const screen=template.cloneNode(true);screen.style.left=-left+'px';screen.style.top=-top+'px';
          piece.append(screen);fragments.append(piece);
          const middle=[(a[0]+b[0]+c[0]+d[0])/4,(a[1]+b[1]+c[1]+d[1])/4];
          const drift=[(middle[0]-center[0])*.2,(middle[1]-center[1])*.12+height*.11];
          const twist=(i%2 ? 1:-1)*(9+(i%3)*5);
          animate(piece,[
            {transform:'translate3d(0,0,0) rotate(0deg) scale(1)',opacity:1,offset:0},
            {transform:'translate3d('+(drift[0]*.16)+'px,'+(drift[1]*.15)+'px,0) rotate('+(twist*.25)+'deg) scale(.92)',opacity:1,offset:.22},
            {transform:'translate3d('+drift[0]+'px,'+drift[1]+'px,0) rotate('+twist+'deg) scale(.025)',opacity:0,offset:1}
          ],{duration:790,delay:240+ring*85+(i%4)*24,easing:'cubic-bezier(.4,0,.25,1)'});
        });
      }
      layer.append(fragments,svg);loader.append(layer);loader.classList.add('loader-breaking');
      strokes.forEach(path=>animate(path,[{strokeDashoffset:'1',opacity:0},{strokeDashoffset:'.65',opacity:1,offset:.18},{strokeDashoffset:'0',opacity:1}],{duration:390,easing:'ease-out'}));
      animate(svg,[{opacity:1,transform:'scale(1)'},{opacity:.8,offset:.5},{opacity:0,transform:'scale(1.045)'}],{delay:850,duration:560,easing:'ease-in'});
      timers.push(setTimeout(()=>loader.classList.add('loader-fractured'),240));
      timers.push(setTimeout(cleanup,1480));
      addEventListener('resize',cleanup,{once:true});
      document.addEventListener('visibilitychange',onVisibility);
      motion.addEventListener('change',cleanup,{once:true});
    } catch (error) {
      cleanup();
    }
    return cleanup;
  };
})();
