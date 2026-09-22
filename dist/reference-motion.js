(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 761px)');
  const journey = document.querySelector('.morph-journey');
  const track = journey?.querySelector('.brand-track');
  const pill = journey?.querySelector('.morph-pill');
  const statement = journey?.querySelector('.brand-statement h2');
  const words = statement ? statement.textContent.trim().split(/\s+/).map(word => { const span = document.createElement('span'); span.className = 'statement-word'; span.textContent = word + ' '; return span; }) : [];
  if (statement) statement.replaceChildren(...words);
  const cinema = document.querySelector('.utter-cinema');
  const filmScene = cinema?.querySelector('.utter-scroll-scene');
  const panels = [...document.querySelectorAll('.reference-gallery .showcase-panel')];
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => x * x * (3 - 2 * x);
  let frame = 0;
  function render() {
    frame = 0;
    const mobile = !desktop.matches;
    const enabled = !reduced.matches && innerHeight >= (mobile ? 520 : 650);
    if (journey) {
      journey.classList.toggle('morph-active', enabled);
      if (enabled) {
        const rect = journey.getBoundingClientRect();
        const progress = clamp(((mobile ? 72 : 80) - rect.top) / Math.max(1, rect.height - innerHeight));
        const contraction = ease(clamp(progress / .2));
        const diameter = mobile ? 76 : Math.min(235, Math.max(100, innerWidth * .145));
        const expanded = innerWidth * (mobile ? .65 : .32);
        pill.style.width = `${expanded + (diameter - expanded) * contraction}px`;
        pill.style.height = `${diameter}px`;
        journey.style.setProperty('--icon-rotation', `${contraction * 90}deg`);
        journey.style.setProperty('--pill-fill', contraction);
        const horizontal = ease(clamp((progress - .2) / .5));
        const distance = Math.max(0, track.scrollWidth - innerWidth + innerWidth * .06);
        track.style.transform = `translate3d(${-distance * horizontal}px,0,0)`;
        journey.style.setProperty('--mobile-track-x', `${-distance * horizontal}px`);
        journey.style.setProperty('--next-fill', .22 + clamp(horizontal * 3) * .78);
        journey.style.setProperty('--last-fill', .22 + clamp((horizontal - .35) * 2) * .78);
        words.forEach((word, i) => { const p = ease(clamp((progress - .08 - i * .014) / .18)); word.style.opacity = .35 + p * .65; word.style.transform = `translateY(${(1-p)*12}px)`; });
      } else {
        pill.style.width = ''; pill.style.height = '';
        words.forEach(word => {word.style.opacity = ''; word.style.transform = '';});
        track.style.transform = '';
        ['--icon-rotation', '--pill-fill', '--next-fill', '--last-fill'].forEach(p=>journey.style.removeProperty(p));
      }
    }
    if (cinema) {
      cinema.classList.toggle('cinema-active', enabled);
      if (enabled) {
        const r = filmScene.getBoundingClientRect();
        const p = ease(clamp((80 - r.top) / Math.max(1, r.height - innerHeight) / .78));
        cinema.style.setProperty('--film-width', `${100 - p * (mobile ? 12 : 56)}%`);
        cinema.style.setProperty('--film-height', `${100 - p * (mobile ? 0 : 34)}%`);
        cinema.style.setProperty('--film-radius', `${18 + p * 10}px`);
        cinema.style.setProperty('--mosaic-opacity', clamp((p - .12) / .6));
        cinema.style.setProperty('--mosaic-scale', .9 + p * .1);
      }
    }
    panels.forEach(panel => {
      if (!enabled) {
        panel.style.removeProperty('--gallery-tilt');
        panel.style.removeProperty('--gallery-scale');
        panel.style.removeProperty('--gallery-image-y');
        return;
      }
      const image = panel.querySelector('.showcase-link');
      const r = panel.getBoundingClientRect();
      const h = image.offsetHeight;
      const approach = ease(clamp((innerHeight - r.top) / (innerHeight * .68)));
      const depart = ease(clamp((-r.top - h * .1) / (h * .9)));
      panel.style.setProperty('--gallery-tilt', `${(1 - approach) * 16 - depart * 5}deg`);
      panel.style.setProperty('--gallery-scale', .95 + approach * .05 - depart * .035);
      panel.style.setProperty('--gallery-image-y', `${(1 - approach) * 18 - depart * 14}px`);
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  reduced.addEventListener('change', schedule);
  desktop.addEventListener('change', schedule);
  document.fonts?.ready.then(schedule);
  render();
})();
