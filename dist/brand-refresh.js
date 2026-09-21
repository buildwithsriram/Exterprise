(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.aurora-hero');
  const journey = document.querySelector('.brand-journey');
  const product = document.querySelector('.utter-section');
  if(journey){const bar=document.createElement('div');bar.className='brand-progress';bar.setAttribute('aria-hidden','true');journey.querySelector('.brand-pin').append(bar);}
  let frame=0;
  const clamp=v=>Math.max(0,Math.min(1,v));
  function draw(){
    frame=0;
    if(reduced.matches)return;
    if(hero){const r=hero.getBoundingClientRect();if(r.bottom>0){hero.style.setProperty('--hero-shift',`${-r.top*.14}px`);hero.style.setProperty('--title-shift',`${-r.top*.065}px`);}}
    if(journey){const r=journey.getBoundingClientRect();journey.style.setProperty('--brand-progress',clamp(-r.top/Math.max(1,r.height-innerHeight)));}
    if(product){const r=product.getBoundingClientRect();product.style.setProperty('--film-tilt',`${(1-clamp((innerHeight-r.top)/innerHeight))*7}deg`);}
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',()=>{hero?.style.removeProperty('--hero-shift');hero?.style.removeProperty('--title-shift');schedule();});draw();
})();
