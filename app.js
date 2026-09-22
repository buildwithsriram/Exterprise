// Mobile navigation shares the existing accessible menu and its keyboard handling.
const navActions=document.querySelector('.nav-actions');
if(navActions&&!document.querySelector('.menu-button')){
 const toggle=document.createElement('button');
 toggle.className='menu-button';toggle.type='button';
 toggle.setAttribute('aria-label','Open navigation');
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','site-menu');
 toggle.innerHTML='<span></span><span></span>';navActions.append(toggle);
}
const root=document.documentElement;
const themeButton=document.querySelector('.theme-switch');
function applyTheme(t){root.dataset.theme=t;themeButton?.setAttribute('aria-label',t==='dark'?'Switch to light theme':'Switch to dark theme');try{localStorage.setItem('ex-theme',t)}catch{}}
applyTheme(root.dataset.theme||'dark');
themeButton?.addEventListener('click',()=>applyTheme(root.dataset.theme==='dark'?'light':'dark'));
const menu=document.querySelector('#site-menu'),menuButton=document.querySelector('.menu-button'),servicesButton=document.querySelector('.services-toggle');
let menuOpener=menuButton;
function closeMenu(){menu.hidden=true;[menuButton,servicesButton].forEach(b=>b?.setAttribute('aria-expanded','false'));menuButton?.setAttribute('aria-label','Open navigation');document.body.classList.remove('menu-open');document.querySelector('main').inert=false;document.querySelector('footer').inert=false}
function toggleMenu(e){menuOpener=e.currentTarget;if(!menu.hidden){closeMenu();return}menu.hidden=false;[menuButton,servicesButton].forEach(b=>b?.setAttribute('aria-expanded','true'));menuButton?.setAttribute('aria-label','Close navigation');document.body.classList.add('menu-open');document.querySelector('main').inert=true;document.querySelector('footer').inert=true;menu.querySelector('a').focus()}
menuButton?.addEventListener('click',toggleMenu);servicesButton?.addEventListener('click',toggleMenu);
matchMedia('(max-width: 900px)').addEventListener('change',()=>{if(menu&&!menu.hidden)closeMenu()});
menu?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu()});
document.querySelectorAll('.site-header a').forEach(a=>a.addEventListener('click',()=>{if(!menu.hidden)closeMenu()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuOpener.focus()}if(e.key==='Tab'&&!menu.hidden){const focusable=[...document.querySelectorAll('.site-header a,.site-header button,#site-menu a')].filter(x=>x.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const desktop=matchMedia('(min-width: 761px)');
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const rails=[...document.querySelectorAll('.horizontal-section')];
const fans=[...document.querySelectorAll('.fan-card')];
const fanStage=document.querySelector('.fan-stage');
const photos=[...document.querySelectorAll('.parallax-img')];
const cinema=document.querySelector('.service-cinema');
const scenes=[...document.querySelectorAll('.cinema-scene')];
const sceneButtons=[...document.querySelectorAll('[data-scene]')];
const showcasePanels=[...document.querySelectorAll('.service-showcase:not(.reference-gallery) .showcase-panel')];
const processDeck=document.querySelector('.process-deck');
const processCards=[...document.querySelectorAll('.process-card')];
let activeScene=-1;
function setScene(index){if(index===activeScene)return;activeScene=index;scenes.forEach((scene,i)=>{scene.classList.toggle('active',i===index);scene.inert=i!==index;scene.setAttribute('aria-hidden',String(i!==index))});sceneButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)))}
sceneButtons.forEach((b,i)=>b.addEventListener('click',()=>{if(!cinema)return;const travel=cinema.offsetHeight-innerHeight;scrollTo({top:cinema.getBoundingClientRect().top+scrollY+travel*(i+.35)/scenes.length,behavior:reduce.matches?'instant':'smooth'})}));
let pending=false;
function configureMotion(){
 const enabled=!reduce.matches&&desktop.matches&&innerHeight>=800;document.body.classList.toggle('motion-enabled',enabled);
 document.body.classList.toggle('showcase-enabled',!reduce.matches&&desktop.matches&&innerHeight>=700);
 const cinemaEnabled=!reduce.matches&&desktop.matches&&innerHeight>=650;document.body.classList.toggle('cinema-enabled',cinemaEnabled);
 if(!cinemaEnabled){activeScene=-1;scenes.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden')})}
 rails.forEach(s=>{const t=s.querySelector('.horizontal-track');s.style.setProperty('--travel',Math.max(0,t.scrollWidth-innerWidth)+'px');if(!enabled)t.style.transform='';});
 update();
}
function update(){pending=false;const vh=innerHeight;
 if(cinema&&document.body.classList.contains('cinema-enabled')){const r=cinema.getBoundingClientRect();setScene(Math.min(scenes.length-1,Math.floor(clamp(-r.top/(r.height-vh))*scenes.length)))}
 if(!reduce.matches){
  showcasePanels.forEach((panel,i)=>{const next=showcasePanels[i+1];const box=panel.getBoundingClientRect();const overlap=next?clamp((vh-next.getBoundingClientRect().top)/(vh-115)):0;panel.style.setProperty('--panel-scale',String(1-overlap*.18));panel.style.setProperty('--panel-tilt',`${overlap*-9}deg`);panel.style.setProperty('--panel-opacity',String(1-overlap*.35));panel.style.setProperty('--image-y',`${clamp((vh-box.top)/(vh+box.height)) * -35}px`);const enter=clamp((vh*.9-box.top)/(vh*.5));panel.style.setProperty('--title-y',`${(1-enter)*55}px`);panel.style.setProperty('--title-opacity',String(.3+enter*.7))});
  if(processDeck){const r=processDeck.getBoundingClientRect();const progress=clamp((vh*.85-r.top)/(vh*.65));processCards.forEach((card,i)=>{const offset=i-1;card.style.transform=desktop.matches?`translateY(${(1-progress)*(i%2?0:65)}px) rotate(${offset*(1-progress)*9}deg) rotateY(${offset*(1-progress)*-8}deg)`:'none';});}
  if(fanStage){const r=fanStage.getBoundingClientRect();const progress=clamp((vh*.76-r.top)/(vh*.85));fans.forEach((card,k)=>{const i=k-2;const base=desktop.matches?116:54;const spread=desktop.matches?55:8;card.style.transform=`translateX(calc(-50% + ${i*(base+progress*spread)}px)) translateY(${i*i*(13+progress*5)}px) rotate(${i*(5+progress*5)}deg)`;});}
  photos.forEach(img=>{const r=img.parentElement.getBoundingClientRect();if(r.bottom>0&&r.top<vh){const progress=clamp((vh-r.top)/(vh+r.height));img.style.transform=`translateY(${(progress-.5)*r.height*.16}px)`;}});
 }
 if(document.body.classList.contains('motion-enabled'))rails.forEach(s=>{const r=s.getBoundingClientRect();const t=s.querySelector('.horizontal-track');const distance=Math.max(0,t.scrollWidth-innerWidth);const p=clamp(-r.top/Math.max(1,r.height-vh));t.style.transform=`translate3d(${-distance*p}px,0,0)`;s.querySelector('.scroll-progress span').style.transform=`scaleX(${.04+.96*p})`;});
}
function requestUpdate(){if(!pending){pending=true;requestAnimationFrame(update)}}
addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',configureMotion);reduce.addEventListener('change',configureMotion);desktop.addEventListener('change',configureMotion);addEventListener('load',configureMotion);configureMotion();
if(!reduce.matches){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('animate-in');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('[data-reveal],.s-item,.d-card,.label-item,.process-step,.chal-item').forEach(e=>observer.observe(e));}
const rows=[...document.querySelectorAll('.directory-row')],pictures=[...document.querySelectorAll('.directory-image')];
function activeImage(i){pictures.forEach((p,j)=>p.classList.toggle('active',j===i%3))}
rows.forEach((r,i)=>{r.addEventListener('pointerenter',()=>activeImage(i));r.addEventListener('focus',()=>activeImage(i));});
if(rows.length){const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)activeImage(rows.indexOf(e.target));},{rootMargin:'-30% 0px -45% 0px',threshold:0});rows.forEach(r=>io.observe(r));}
document.querySelectorAll('.icon-link').forEach(a=>a.setAttribute('aria-label',a.closest('article').querySelector('h3').textContent));
document.querySelectorAll('.page-index a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.page-index').open=false}));
const sectionLinks=[...document.querySelectorAll('.section-nav a')];
if(sectionLinks.length){const sectionObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){sectionLinks.forEach(a=>{if(a.hash==='#'+e.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}},{rootMargin:'-25% 0px -55% 0px'});sectionLinks.forEach(a=>{const target=document.querySelector(a.hash);if(target)sectionObserver.observe(target)})}
// Count only source-supplied metrics; screen readers receive their stable final value.
document.querySelectorAll('.h-num').forEach(el=>{const match=el.textContent.trim().match(/^(\d+(?:\.\d+)?)(.*)$/);if(match&&!el.querySelector('[data-count]')){const n=document.createElement('span');n.dataset.count=match[1];n.textContent=match[1];n.setAttribute('aria-hidden','true');el.setAttribute('aria-label',el.textContent);el.replaceChildren(n,document.createTextNode(match[2]));}});
const counters=[...document.querySelectorAll('[data-count]')];
const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
 if(!entry.isIntersecting)return;
 const el=entry.target,final=el.dataset.count,target=Number(final),places=final.includes('.')?1:0;

 if(reduce.matches)return;
 const started=performance.now();
 function count(now){const progress=clamp((now-started)/2100);el.textContent=(target*(1-Math.pow(1-progress,3))).toFixed(places);if(progress<1&&!reduce.matches)requestAnimationFrame(count);else el.textContent=final;}
 requestAnimationFrame(count);
}),{threshold:.55});counters.forEach(el=>counterObserver.observe(el));
const trust=document.querySelector('.customer-trust'),trustToggle=document.querySelector('.trust-toggle');
trustToggle?.addEventListener('click',()=>{const paused=trust.dataset.paused!=='true';trust.dataset.paused=String(paused);trustToggle.setAttribute('aria-pressed',String(paused));trustToggle.setAttribute('aria-label',paused?'Play trust strip':'Pause trust strip');trustToggle.textContent=paused?'▷':'Ⅱ';});
