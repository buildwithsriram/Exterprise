(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 761px)');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const hero = document.querySelector('.aurora-hero');
  const heroToggle = document.querySelector('.atmosphere-toggle');
  const journey = document.querySelector('.brand-journey');
  const track = journey?.querySelector('.brand-track');
  const numbers = document.querySelector('.numbers-grid');
  const numberCards = [...document.querySelectorAll('.numbers-grid > *')];
  const product = document.querySelector('.utter-section');
  const video = document.querySelector('.utter-video');
  const play = document.querySelector('.utter-play');
  const dialog = document.querySelector('.product-dialog');
  const fullVideo = dialog?.querySelector('video');
  const expand = document.querySelector('.utter-expand');
  let heroPaused = reduce.matches;
  let videoPausedByUser = false, videoVisible = false;
  let pending = false;

  function syncHero() {
    if (!hero) return;
    hero.dataset.paused = String(heroPaused);
    heroToggle.setAttribute('aria-pressed', String(heroPaused));
    heroToggle.setAttribute('aria-label', heroPaused ? 'Play background animation' : 'Pause background animation');
    heroToggle.textContent = heroPaused ? '▷' : 'Ⅱ';
  }
  heroToggle?.addEventListener('click', () => { heroPaused = !heroPaused; syncHero(); });
  function syncVideo() {
    if (!video) return;
    play.setAttribute('aria-label', video.paused ? 'Play UtterNow product animation' : 'Pause UtterNow product animation');
    play.setAttribute('aria-pressed', String(!video.paused));
    play.firstElementChild.textContent = video.paused ? '▷' : 'Ⅱ';
  }
  function manageVideo() {
    if (!video) return;
    if (videoVisible && !videoPausedByUser && !reduce.matches && !document.hidden && !dialog?.open) {
      video.play().catch(syncVideo);
    } else video.pause();
  }
  play?.addEventListener('click', () => {
    videoPausedByUser = !video.paused;
    if (video.paused) video.play().catch(syncVideo); else video.pause();
  });
  video?.addEventListener('play', syncVideo);
  video?.addEventListener('pause', syncVideo);
  if (video) new IntersectionObserver(([entry]) => {
    videoVisible = entry.isIntersecting; manageVideo();
  }, {threshold: .2}).observe(video);
  expand?.addEventListener('click', () => { dialog.showModal(); video.pause(); fullVideo.play().catch(() => {}); });
  dialog?.querySelector('.product-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => { fullVideo.pause(); manageVideo(); expand.focus(); });
  dialog?.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if(e.clientX<b.left || e.clientX>b.right || e.clientY<b.top || e.clientY>b.bottom) dialog.close(); } });
  document.addEventListener('visibilitychange', manageVideo);

  function configure() {
    document.body.classList.toggle('story-motion', !!journey && wide.matches && !reduce.matches && innerHeight >= 650);
    document.body.classList.remove('product-motion');
    if (reduce.matches || !wide.matches) {
      numberCards.forEach(card => { card.style.transform = ''; });
    }
    if (!document.body.classList.contains('story-motion')) {
      track?.style.removeProperty('transform');
      journey?.style.setProperty('--x-scale', '1');
      journey?.style.setProperty('--x-space', '0px');
    }
    if (!document.body.classList.contains('product-motion')) {
      product?.style.setProperty('--utter-scale', '1');
      product?.style.setProperty('--utter-side-opacity', '1');
      product?.style.setProperty('--utter-side-shift', '0px');
    }
    update();
  }
  function update() {
    pending = false;
    const vh = innerHeight;
    if (journey && document.body.classList.contains('story-motion') && !journey.classList.contains('morph-journey')) {
      const r = journey.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh * 1.4));
      const travel = Math.max(0, track.scrollWidth - innerWidth + innerWidth * .06);
      track.style.transform = `translate3d(${-travel * p}px,0,0)`;
    }
    if (numbers && wide.matches && !reduce.matches) {
      const r = numbers.getBoundingClientRect();
      const p = clamp((vh * .93 - r.top) / (vh * .55));
      numberCards.forEach((card, i) => {
        const local = clamp((p - i * .05) / .8);
        const side = i === 0 ? -1 : i === 2 ? 1 : 0;
        card.style.transform = `translateY(${(1-local)*80}px) rotateX(${(1-local)*-18}deg) rotateY(${side*(1-local)*18}deg)`;
      });
    }
    if (product) {
      const r = product.getBoundingClientRect();
      const progress = clamp((vh * .95 - r.top) / (vh * .65));
      const shift = reduce.matches || !wide.matches ? 0 : (1-progress)*35;
      product.style.setProperty('--banner-shift', `${shift}px`);
    }
  }
  function requestUpdate() { if (!pending) { pending = true; requestAnimationFrame(update); } }
  addEventListener('scroll', requestUpdate, {passive: true});
  addEventListener('resize', configure);
  addEventListener('load', configure);
  wide.addEventListener('change', configure);
  reduce.addEventListener('change', () => { heroPaused = reduce.matches; syncHero(); manageVideo(); configure(); });
  syncHero(); syncVideo(); configure();
})();
