/* Original procedural line animation; no external video or rendering library. */
(() => {
  const hero = document.querySelector('.kinetic-hero');
  const canvas = hero?.querySelector('.hero-wave');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const toggle = hero.querySelector('.wave-toggle');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = preference.matches, visible = true, frame = 0, clock = 0, last = 0;
  let width = 1, height = 1, light = false;
  let pointerX = 0, pointerY = 0, followX = 0, followY = 0;
  const syncButton = () => {
    toggle.setAttribute('aria-label', paused ? 'Play background animation' : 'Pause background animation');
    toggle.setAttribute('aria-pressed', String(paused));
    hero.dataset.motion = paused ? 'paused' : 'playing';
  };
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const rows = width < 600 ? 68 : 100;
    const steps = width < 600 ? 120 : 210;
    const phase = clock * .22;
    followX += (pointerX - followX) * .035;
    followY += (pointerY - followY) * .035;
    // Colors sampled from the supplied Exterprise mark; the field remains transparent.
    const gradient = ctx.createLinearGradient(width * -.1, height * (.3 + .12 * Math.sin(phase)), width * 1.05, height * .7);
    gradient.addColorStop(0, '#bd7c2b');
    gradient.addColorStop(.24, '#ff9e19');
    gradient.addColorStop(.48, '#f9b328');
    gradient.addColorStop(.65, '#ef3029');
    gradient.addColorStop(.83, '#bb593a');
    gradient.addColorStop(1, light ? '#242457' : '#5756aa');
    for (let row = 0; row < rows; row++) {
      const v = row / (rows - 1) * 2 - 1;
      const edge = Math.pow(Math.max(0, 1 - Math.abs(v)), .7);
      const alpha = (light ? .18 : .12) + edge * (light ? .26 : .46);
      ctx.strokeStyle = gradient;
      ctx.globalAlpha = alpha * (light ? 1.25 : 1.4);
      ctx.lineWidth = light ? .8 : 1;
      ctx.beginPath();
      for (let col = 0; col <= steps; col++) {
        const u = col / steps * 1.3 - .15;
        const fold = Math.sin(u * 5.8 - phase);
        const spread = .26 + .16 * Math.cos(u * 5.8 - phase);
        const ripple = .085 * Math.sin(u * 11 + v * 2.5 + phase * 1.2);
        const x = width * (u + .052 * Math.sin(v * 2.6 + u * 4 + phase * .4)) + followX * (12 + v * 8);
        const y = height * (.48 - .24 * fold + v * spread + ripple) + followY * 20;
        if (col === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Fine dotted transverse lines give the surface depth without a filled backdrop.
    ctx.globalAlpha = light ? .25 : .38;
    ctx.fillStyle = gradient;
    for (let col = 0; col < 95; col++) {
      const u = col / 94 * 1.3 - .15;
      for (let row = 0; row < 42; row++) {
        const v = row / 41 * 2 - 1;
        const x = width * (u + .052 * Math.sin(v * 2.6 + u * 4 + phase * .4)) + followX * (12 + v * 8);
        const y = height * (.48 - .24 * Math.sin(u * 5.8 - phase) + v * (.26 + .16 * Math.cos(u * 5.8 - phase)) + .085 * Math.sin(u * 11 + v * 2.5 + phase * 1.2)) + followY * 20;
        ctx.fillRect(x, y, .9, .9);
      }
    }
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    frame = 0;
    if (paused || !visible || document.hidden) return;
    if (now - last >= 32) {
      clock += Math.min((now - last) / 1000, .05);
      last = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function run() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = performance.now();
    if (!paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = hero.clientWidth;
    height = hero.clientHeight;
    const density = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    ctx.setTransform(density, 0, 0, density, 0, 0);
    draw();
  }
  function theme() {
    light = document.documentElement.dataset.theme === 'light';
    draw();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => { paused = !paused; syncButton(); run(); });
  preference.addEventListener('change', e => { paused = e.matches; pointerX = pointerY = 0; syncButton(); draw(); run(); });
  hero.addEventListener('pointermove', e => {
    if (paused || e.pointerType === 'touch') return;
    const box = hero.getBoundingClientRect();
    pointerX = (e.clientX - box.left) / width - .5;
    pointerY = (e.clientY - box.top) / height - .5;
  }, {passive: true});
  hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
  new ResizeObserver(resize).observe(hero);
  new MutationObserver(theme).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }).observe(hero);
  document.addEventListener('visibilitychange', run);
  theme(); resize(); syncButton(); run();
})();
