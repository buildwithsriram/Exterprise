"""Compile source copy into static pages; do not author business copy here."""
from html.parser import HTMLParser
from html import escape
from pathlib import Path
import re, json, shutil
from visual_sections import visual_icon, decorate_section
from home_sections import brandlogo, hero as corporate_hero, brand_story, product

ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'dist'
VOID={'img','br','hr','meta','link','input','source','wbr'}
class Node:
    def __init__(self,tag='root',attrs=(),parent=None): self.tag=tag; self.attrs=dict(attrs); self.children=[]; self.parent=parent
    def cls(self,c): return c in self.attrs.get('class','').split()
    def all(self,tag=None,cls=None):
        found=[]
        for x in self.children:
            if isinstance(x,Node):
                if (tag is None or x.tag==tag) and (cls is None or x.cls(cls)): found.append(x)
                found+=x.all(tag,cls)
        return found
    def one(self,tag=None,cls=None): return next(iter(self.all(tag,cls)),None)
    def text(self): return ''.join(x.text() if isinstance(x,Node) else x for x in self.children)
    def inner(self): return ''.join(render(x) for x in self.children)
class Parser(HTMLParser):
    def __init__(self,s): super().__init__(convert_charrefs=True); self.root=Node(); self.cur=self.root; self.feed(s)
    def handle_starttag(self,t,a):
        n=Node(t,a,self.cur); self.cur.children.append(n)
        if t not in VOID:self.cur=n
    def handle_endtag(self,t):
        n=self.cur
        while n.parent and n.tag!=t:n=n.parent
        if n.parent:self.cur=n.parent
    def handle_data(self,d):self.cur.children.append(d)
def render(n):
    if isinstance(n,str):return escape(n)
    attrs={k:v for k,v in n.attrs.items() if k not in ['style']}
    attr=''.join(' '+k+'="'+escape(v or '',quote=True)+'"' for k,v in attrs.items())
    return '<'+n.tag+attr+'>'+('' if n.tag in VOID else n.inner()+'</'+n.tag+'>')
def norm(s):return re.sub(r'\s+',' ',s).strip()
def txt(n):return norm(n.text()) if n else ''
def content(n):return n.inner() if n else ''
def el(tag,body,cls=''):return f'<{tag}'+(f' class="{cls}"' if cls else '')+f'>{body}</{tag}>'
def photo(name,cls='',eager=False):return f'<img class="{cls}" src="assets/{name}.{'png' if name.startswith(('orange-', 'gallery-')) else 'jpg'}" alt="" loading="'+('eager' if eager else 'lazy')+'" width="1600" height="1068">'
ARROW='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>'
BADGE='<img src="assets/servicenow-premier-partner-badge.png" alt="ServiceNow Premier Partner — Consulting &amp; Implementation" width="120" height="120">'
docs={p.name.split('-',1)[1]:Parser(p.read_text()).root for p in sorted((ROOT/'source-copy').glob('*.html'))}
HOME=docs['exterprise-homepage-mockup.html']; HUB=docs['exterprise-servicenow-page-mockup.html']
order=['ai-agents-now-assist','servicenow-otto','customer-service-management','field-service-management','it-service-management','it-operations-management','hr-service-delivery','strategic-portfolio-management','now-platform']
names={s:txt(docs[s+'.html'].one('h1')) for s in order}
images={s:['network-servers','skyscraper-facade','team-computers'][i%3] for i,s in enumerate(order)}
# Corporate copy and destinations transcribed from https://exterprise.us/ on 2026-09-20.
CORPORATE=json.loads((ROOT/'source-copy'/'corporate-homepage.json').read_text())
routes={'exterprise-homepage-mockup.html':'index.html','exterprise-servicenow-page-mockup.html':'servicenow.html',**{s+'.html':s+'.html' for s in order}}
def a(url,label,cls=''):return f'<a class="{cls}" href="{url}">{label}</a>'
def button(url,label):return a(url,f'<span>{label}</span>{ARROW}','button')
def header():
    nav=a('index.html','Home')+'<button class="services-toggle" aria-expanded="false" aria-controls="site-menu">Services <span aria-hidden="true">⌄</span></button>'+a('servicenow.html','ServiceNow')+a('https://exterprise.us/about/','About')
    menu='<div class="menu-company"><h2>Services</h2>'+''.join(a(x['url'],x['name']+ARROW) for x in CORPORATE['navigation'])+'</div><div class="menu-servicenow"><div class="menu-parent">'+a('servicenow.html','ServiceNow '+ARROW)+'<p>'+content(HUB.one('section','page-hero').one('p','sub'))+'</p></div><div class="menu-solutions">'+''.join(a(s+'.html',escape(names[s])+ARROW) for s in order)+'</div></div>'
    return '<header class="site-header">'+a('index.html',brandlogo(),'logo')+'<nav class="desktop-nav" aria-label="Main navigation">'+nav+'</nav><div class="nav-actions"><button class="theme-switch" aria-label="Switch to light theme" title="Switch theme"><svg class="theme-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg class="theme-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.2A9 9 0 0 1 9.8 3.5 9 9 0 1 0 20.5 14.2Z"/></svg></button>'+button('#contact','Talk to Us')+'</div></header><nav id="site-menu" class="menu-panel" aria-label="Services and ServiceNow solutions" hidden>'+menu+'</nav>'
def footer():return '<footer><div class="footer-top">'+a('index.html','Exterprise','logo')+'<p>'+content(HUB.one('footer').one(cls='wrap'))+'</p>'+a('mailto:contact@exterprise.us','contact@exterprise.us','footer-email')+'</div><div class="footer-links">'+a('index.html','Home')+a('servicenow.html','ServiceNow')+''.join(a(s+'.html',escape(names[s])) for s in order)+'</div><div class="footer-wordmark" aria-hidden="true">Exterprise</div></footer>'
def contact(doc=HUB):
    sec=doc.one('section','contact-cta') or HUB.one('section','contact-cta')
    return '<section class="contact-section" id="contact"><div class="contact-photo">'+photo('skyscraper-facade','parallax-img')+'</div><div class="contact-copy"><h2 data-reveal>'+content(sec.one('h2'))+'</h2><p>'+content(sec.one('p'))+'</p>'+button('https://exterprise.us/contact-us/',txt(sec.one('a')))+a('mailto:contact@exterprise.us','contact@exterprise.us','contact-email')+'</div></section>'
def directory(compact=False):
    blocks={re.sub(r' \([^)]*\)$','',txt(x.one('h3'))):x for x in HUB.all(cls='subnav-item')}
    html='<section class="directory section" id="solutions"><div class="section-heading"><h2 data-reveal>'+content(HUB.one('section','subnav-section').one('h2'))+'</h2><p>'+content(HUB.one('section','subnav-section').one('p'))+'</p></div><div class="directory-layout"><div class="directory-media">'+''.join(photo(i,'directory-image'+(' active' if j==0 else '')) for j,i in enumerate(['network-servers','skyscraper-facade','team-computers']))+'</div><div class="directory-list">'
    for i,s in enumerate(order):
        b=blocks.get(names[s]);desc=content(b.one('p')) if b else content(docs[s+'.html'].one('p','sub'))
        title=content(b.one('h3')) if b else escape(names[s])
        html+=a(s+'.html',f'<span class="row-number" aria-hidden="true">{i+1:02}</span><div><h3>{title}</h3><p>{desc}</p></div>'+ARROW,'directory-row')
    return html+'</div></div></section>'
def home():
    hero=HOME.one('section','hero');rail=HOME.one('section','rail-section');cred=HOME.one(cls='credential')
    h=corporate_hero(CORPORATE,a,button,ARROW)
    h+='<section class="numbers-section section" id="partner"><div class="partner-heading"><h2 data-reveal>'+content(cred.one('h3'))+'</h2>'+BADGE+'</div><div class="numbers-grid">'
    stats=cred.all(cls='stat')
    for i,stat in enumerate(stats):
        number=txt(stat.one(cls='num')); match=re.match(r'([\d.]+)(.*)',number)
        h+='<div class="number-card number-card-'+str(i)+'"><strong aria-label="'+number+'"><span class="count-number" data-count="'+match[1]+'" aria-hidden="true">'+match[1]+'</span><span class="count-suffix" aria-hidden="true">'+match[2]+'</span></strong><span class="number-label">'+content(stat.one(cls='lbl'))+'</span></div>'
        if i==0:h+='<div class="numbers-image">'+photo('team-computers','parallax-img')+'</div>'
    h+='</div></section>'
    h+='<section class="customer-trust" aria-labelledby="trust-title"><div class="trust-heading"><h2 id="trust-title" data-reveal>Enabling Customer Trust</h2><button class="trust-toggle" type="button" aria-label="Pause trust strip" aria-pressed="false">Ⅱ</button></div><div class="trust-viewport"><div class="trust-track">'
    for duplicate in range(2):
        h+='<div class="trust-group"'+(' aria-hidden="true"' if duplicate else '')+'>'
        for i,label in enumerate(['Texas Department of Information Resources','Intertek — UKAS Management Systems','SSAE 18 SOC 2 Type II','HIPAA Compliance'],1):h+='<div class="trust-logo"><span class="trust-mark trust-mark-'+str(i)+'"><img src="assets/trust-'+str(i)+'.png" alt="'+('' if duplicate else label)+'" width="350" height="300" loading="lazy"></span></div>'
        h+='</div>'
    h+='</div></div></section>'
    h+=brand_story(CORPORATE,a,button,photo,ARROW)
    h+='<section class="service-showcase reference-gallery" id="company-services" aria-label="Enterprise solutions">'
    for i,x in enumerate(CORPORATE['featured']):
        h+='<article class="showcase-panel"><a class="showcase-link" href="'+x['url']+'" aria-label="'+escape(x['title'],quote=True)+'">'+photo(['gallery-service','gallery-data','gallery-health'][i],'showcase-image')+'<div class="showcase-veil"></div><span class="showcase-number" aria-hidden="true">'+str(i+1).zfill(2)+' / 03</span><span class="showcase-caption">'+x['title']+'</span><span class="gallery-view">Read more '+ARROW+'</span></a><div class="gallery-caption"><h2>'+a(x['url'],x['title'])+'</h2><p>'+x['description']+'</p></div></article>'
    h+='</section>'
    h+=product(a,ARROW)
    h+='<section class="servicenow-spotlight section" id="servicenow"><div class="spotlight-title"><h2 data-reveal>'+content(hero.one('h1'))+'</h2>'+a('servicenow.html','ServiceNow '+ARROW,'spotlight-parent')+'</div><div class="spotlight-lower"><div class="spotlight-picture">'+photo('network-servers','parallax-img')+'</div><div><p>'+content(hero.one('p','sub'))+'</p><div class="spotlight-actions">'+button('servicenow.html','ServiceNow Solutions &amp; Services')+a('ai-agents-now-assist.html',txt(hero.one(cls='cta-btn'))+ARROW,'text-action')+a('#contact',txt(hero.one(cls='cta-secondary')),'secondary-link')+'</div></div></div></section>'
    process=docs['now-platform.html'].one('section','process-section')
    h+='<section class="home-process section" id="process"><div class="process-heading"><h2 data-reveal>Now Platform</h2><div><h3>'+content(process.one('h2'))+'</h3><p>'+content(process.one('p','lede'))+'</p>'+a('now-platform.html','Now Platform '+ARROW,'text-action')+'</div></div><div class="process-deck">'
    for i,step in enumerate(process.all(cls='process-step')):h+='<article class="process-card" style="--card:'+str(i)+'"><span class="process-number" aria-hidden="true">'+str(i+1)+'</span><div><h3>'+content(step.one('h3'))+'</h3><p>'+content(step.one('p'))+'</p></div></article>'
    h+='</div></section>'
    h+='<section class="horizontal-section"><div class="horizontal-pin"><div class="section-heading"><h2 data-reveal>'+content(rail.one('h2'))+'</h2><p>'+content(rail.one('p'))+'</p></div><div class="horizontal-window"><div class="horizontal-track">'
    for i,item in enumerate(rail.all(cls='rail-item')):
        h+='<article class="feature-card">'+photo(['network-servers','team-computers','skyscraper-facade'][i])+'<div class="feature-copy"><h3>'+content(item.one('h3'))+'</h3><p>'+content(item.one('p'))+'</p>'+a('ai-agents-now-assist.html',ARROW,'icon-link')+'</div></article>'
    h+='</div></div><div class="scroll-progress"><span></span></div></div></section>'
    h+='<section class="corporate-more section"><h2 data-reveal>Extend your Enterprise</h2><div class="corporate-accordions">'
    for x in CORPORATE['more']:h+='<details><summary>'+x['title']+'<span aria-hidden="true">+</span></summary><div><p>'+x['description']+'</p>'+a(x['url'],'Read more '+ARROW,'text-action')+'</div></details>'
    h+='</div></section><section class="industry-section section" id="industries">'+HOME.one('section','trust').inner()+'</section>'+contact()
    return h
def breadcrumbs(title):return '<nav class="breadcrumbs" aria-label="Breadcrumb">'+a('index.html','Home')+'<span>/</span>'+a('servicenow.html','ServiceNow')+('' if title=='ServiceNow' else '<span>/</span><span aria-current="page">'+escape(title)+'</span>')+'</nav>'
def pagehero(doc,slug):
    hero=doc.one('section','page-hero');title=txt(hero.one('h1'))
    if slug=='servicenow':
        return '<section class="hub-hero section">'+breadcrumbs(title)+'<h1 data-reveal>ServiceNow</h1><div class="hub-hero-media">'+photo('network-servers','parallax-img',True)+'<div class="hub-glass"><p>'+content(hero.one('p','sub'))+'</p>'+button('#solutions','ServiceNow Solutions &amp; Services')+'</div></div></section>'
    return '<section class="page-hero">'+breadcrumbs(title)+'<div class="detail-hero-grid"><div><h1 data-reveal>'+escape(title)+'</h1><div class="page-hero-foot"><p>'+content(hero.one('p','sub'))+'</p>'+button('#contact','Talk to Us')+'</div></div><div class="detail-hero-image">'+photo(images[slug],'parallax-img',True)+'<div class="solution-emblem" aria-hidden="true">'+visual_icon(slug)+'</div></div></div></section>'
def hub():
    overview=HUB.all(cls='subnav-item')[0]
    h=pagehero(HUB,'servicenow')+'<nav class="section-nav" aria-label="On this page">'+a('#overview','Overview')+a('#solutions','Solutions &amp; Services')+a('#offerings','Service Offerings')+a('#contact','Talk to Us')+'</nav><section class="section offering-intro" id="overview"><h2>'+content(overview.one('h3'))+'</h2><p>'+content(overview.one('p'))+'</p></section>'+directory()
    trust=HUB.one('section','trust-widget')
    h+='<section class="trust-strip section">'+BADGE+''.join(render(x) for x in trust.all(cls='item'))+'</section>'
    h+='<section class="section offering-intro" id="offerings"><h2 data-reveal>'+content(HUB.one('section','offerings-intro').one('h2'))+'</h2><p>'+content(HUB.one('section','offerings-intro').one('p'))+'</p></section><div class="offering-stack">'
    for i,sec in enumerate(HUB.all('section','cap-block')):
        h+='<section class="offering-card section" style="--order:'+str(i)+'"><div class="offering-copy"><h2>'+content(sec.one('h2'))+'</h2>'+render(sec.one('ul'))+'</div><div class="offering-photo">'+photo(['network-servers','team-computers','skyscraper-facade'][i%3],'parallax-img')+'</div></section>'
    return h+'</div>'+product(a,ARROW)+contact(HUB)
def clean(n):
    # Replace only art placeholders; source prose remains untouched.
    if isinstance(n,str):return n
    n.attrs.pop('style',None)
    for c in list(n.children):
        if isinstance(c,Node):
            if c.cls('intro-media'):c.children=[];c.attrs['class']='intro-media';c.children.append(Parser(photo(CURRENT_IMAGE,'parallax-img')).root.children[0])
            elif c.cls('kicker') or c.cls('eyebrow'):n.children.remove(c)
            else:clean(c)
    return n
def detail(slug):
    global CURRENT_IMAGE
    CURRENT_IMAGE=images[slug];doc=docs[slug+'.html'];h=pagehero(doc,slug)
    sections=[s for s in doc.all('section') if not any(s.cls(c) for c in ['page-hero','contact-cta','video-panel'])]
    links=[]
    for i,sec in enumerate(sections):
        if sec.one('h2'):
            sec.attrs['id']='section-'+str(i);links.append(a('#section-'+str(i),txt(sec.one('h2'))))
    h+='<details class="page-index"><summary>On this page <span aria-hidden="true">+</span></summary><nav aria-label="Page sections">'+''.join(links)+'</nav></details>'
    for sec in sections:
        if sec.cls('page-hero') or sec.cls('contact-cta') or sec.cls('video-panel'):continue
        h+=decorate_section(render(clean(sec)), slug)
    if slug=='ai-agents-now-assist':h+=product(a,ARROW)
    i=order.index(slug);prev=order[(i-1)%len(order)];nxt=order[(i+1)%len(order)]
    h+='<nav class="sibling-nav section" aria-label="Other ServiceNow solutions">'+a(prev+'.html','<span aria-hidden="true">←</span> '+escape(names[prev]))+a('servicenow.html','ServiceNow')+a(nxt+'.html',escape(names[nxt])+' <span aria-hidden="true">→</span>')+'</nav>'
    return h+contact(doc)
def document(title,body,kind):
    return '<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+escape(title,quote=True)+'"><title>'+escape(title)+' — Exterprise</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\'%3E%3Crect width=\'32\' height=\'32\' rx=\'5\' fill=\'%23f34b2a\'/%3E%3Cpath d=\'M8 8h17v4H12v3h10v4H12v3h13v4H8z\' fill=\'white\'/%3E%3C/svg%3E"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="refinement.css"><link rel="stylesheet" href="brand-refresh.css"><link rel="stylesheet" href="scene-refinements.css"><script>try{document.documentElement.dataset.theme=localStorage.getItem("ex-theme")||"dark"}catch(e){}</script><script src="app.js" defer></script><script src="refinement.js" defer></script><script src="brand-refresh.js" defer></script><script src="reference-motion.js" defer></script></head><body class="'+kind+'">'+header()+'<main>'+body+'</main>'+footer()+'</body></html>'
OUT.mkdir(exist_ok=True)
(OUT/'index.html').write_text(document('Extend your Enterprise',home(),'home'))
(OUT/'servicenow.html').write_text(document('ServiceNow',hub(),'hub'))
for slug in order:(OUT/(slug+'.html')).write_text(document(names[slug],detail(slug),'detail'))
# Preserve old shared-page URLs without duplicating or inventing a page.
legacy={'ai-agents':'ai-agents-now-assist','otto':'servicenow-otto','itsm':'it-service-management','itom':'it-operations-management','csm':'customer-service-management','fsm':'field-service-management','hrsd':'hr-service-delivery','spm':'strategic-portfolio-management','now-platform':'now-platform'}
(OUT/'solution.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>ServiceNow — Exterprise</title></head><body><script>const routes='+json.dumps(legacy)+';location.replace((routes[new URLSearchParams(location.search).get("slug")]||"servicenow")+".html");</script>'+a('servicenow.html','ServiceNow')+'</body></html>')
for original,new in routes.items():
    if original!=new:(OUT/original).write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+new+'"><title>Exterprise</title></head><body>'+a(new,'Exterprise')+'</body></html>')
# Source-fidelity audit: every source paragraph/title remains verbatim on its page.
audit=[]
for original,new in routes.items():
    src=docs[original];output=norm(Parser((OUT/new).read_text()).root.text());missing=[]
    for n in src.all():
        if n.tag not in ['p','h1','h2','h3']:continue
        text=txt(n)
        if not text or n.cls('video-caption'):continue
        if text not in output:missing.append(text)
    audit.append({'source':original,'page':new,'missing_copy':missing})
(ROOT/'content-audit.json').write_text(json.dumps(audit,indent=2))
assert all(not x['missing_copy'] for x in audit),json.dumps(audit,indent=2)
print('Built 11 source-backed pages. All source paragraphs and headings preserved; placeholder-only video sections excluded.')
