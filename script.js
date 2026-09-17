/* ══════════════════════════════════════════════════════════
   DAMEL — PORTFOLIO · script principal
   ══════════════════════════════════════════════════════════ */
document.documentElement.classList.add('js-ready');

/* ── données réelles des projets (issues du portfolio existant) ── */
const PROJECTS = [
  { src:'./image/gestion-financiere.png', href:'https://gestion-finance.infinityfreeapp.com', title:'Gestion Financière', desc:"App complète avec tableau de bord admin, suivi des transactions, notifications temps réel et génération de reçus PDF.", tech:['PHP','MySQL','Tailwind','API REST'], year:'2026' },
  { src:'./image/MIEL.jpeg', href:'https://app-boutique-miel.netlify.app', title:'BON MIEL', desc:"Boutique apicole avec catalogue, panier dynamique et commandes envoyées directement sur WhatsApp — sans serveur.", tech:['HTML5','CSS3','JavaScript','LocalStorage'], year:'2024' },
  { src:'./image/BOUFFE.jpeg', href:'https://damitielieericouattara-rgb.github.io/restaurant/', title:'Dabalie De Babi', desc:"Plateforme street food ivoirienne : catalogue, panier, suivi de commande. Front JS + back PHP / MySQL.", tech:['HTML5','JavaScript','PHP','MySQL'], year:'2024' },
  { src:'https://btp-site.netlify.app/assets/images/features-1.jpg', href:'https://btp-site.netlify.app', title:'Y BTP Immobilier', desc:"Site vitrine BTP complet : planning, architecture, construction et aménagement intérieur. Galerie de projets filtrée.", tech:['HTML5','CSS3','JavaScript'], year:'2025' },
];
const PROJECTS_MORE = [
  { src:'./image/novushaus.jpeg', href:'https://novushausci.vercel.app/', title:'NovusHaus — Mobilier' },
  { src:'./image/tic-infinite-corridor.jpeg', href:'https://ouattaradamitidev-prog.github.io/PROJET_INFINIT_site/', title:'TIC — The Infinite Corridor' },
  { src:'./image/restau-ci.jpeg', href:'https://restau-ci.vercel.app/', title:'Restau CI' },
  { src:'./image/vente-voiture-ci.jpeg', href:'https://ventevoitureci.vercel.app/', title:'Vente Voiture CI' },
  { src:'./image/immobilier.jpeg', href:'https://immobilier-site.netlify.app/', title:'Y Immobilier' },
  { src:'./image/salle-sport-ci.jpeg', href:'https://fitivoireci.vercel.app/', title:'Salle de Sport CI' },
];
const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27280%27%3E%3Crect width=%27100%25%27 height=%27100%25%27 fill=%27%2317171b%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%23C6FF3D%27 font-size=%2716%27 font-family=%27sans-serif%27%3EDAMEL%3C/text%3E%3C/svg%3E";

const SERVICES = [
  { icon:'ph-browser', name:'Site Vitrine & Landing Page', desc:"Votre première impression en ligne. Sites modernes, rapides et adaptés à tous les écrans pour inspirer confiance dès le premier regard." },
  { icon:'ph-cursor-click', name:'Fonctionnalités Interactives', desc:"Formulaires intelligents, galeries animées, paniers d'achat — tout ce qui guide naturellement vos visiteurs vers l'action." },
  { icon:'ph-atom', name:'Application Web React.js', desc:"Tableaux de bord, espaces clients, outils de gestion : des applications rapides, modernes et faciles à faire évoluer." },
  { icon:'ph-database', name:'Site avec Gestion de Données', desc:"Réservations, catalogues, gestion d'utilisateurs — je construis le back-end complet de manière fiable et sécurisée." },
  { icon:'ph-figma-logo', name:'Intégration UI & Design System', desc:"Une maquette Figma ? Je l'intègre avec précision : code propre, chargement rapide, rendu fidèle sur tous les écrans." },
  { icon:'ph-whatsapp-logo', name:'Boutique WhatsApp sans Serveur', desc:"Recevez les commandes directement sur WhatsApp. Catalogue en ligne, panier automatique, e-commerce léger et gratuit." },
];

const TIMELINE = [
  { date:'2025–2026', role:'Licence 3 — En cours', place:'ITA 2 Plateaux · Abidjan · React.js, Node.js, API, sécurité web' },
  { date:'2023–2025', role:'Licence 1 & 2 Informatique', place:'ITA 2 Plateaux · Abidjan · HTML/CSS/JS, PHP, MySQL, algo' },
  { date:'2023', role:'Baccalauréat série D', place:"Collège Les Orchidées · Abidjan", hidden:true },
];

const FAQ = [
  { q:"Combien de temps dure généralement un projet ?", a:"Un site vitrine simple prend en général 1 à 2 semaines. Une application avec back-end (gestion de données, panier, tableau de bord) demande plutôt 3 à 5 semaines. Je vous donne une estimation précise après notre premier échange." },
  { q:"Travaillez-vous à partir d'une maquette Figma existante ?", a:"Oui, c'est même l'un de mes points forts : intégrer une maquette Figma avec précision, en gardant un code propre et un rendu fidèle sur tous les écrans." },
  { q:"Qu'est-ce qui différencie votre approche ?", a:"Je pars toujours d'une structure HTML sémantique avant d'ajouter le style, puis le comportement — le résultat est plus léger, plus accessible et plus facile à faire évoluer." },
  { q:"Proposez-vous un accompagnement après la livraison ?", a:"Oui, de petits ajustements et réponses à vos questions restent inclus après la mise en ligne. Pour un suivi plus long, on peut en discuter ensemble." },
  { q:"Comment se passe la communication pendant le projet ?", a:"Par email ou WhatsApp, avec des points d'étape réguliers pour que vous suiviez l'avancement sans surprise à la livraison." },
];

/* ── injection contenu dynamique ── */
function mkImg(src, alt){ return `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.src='${FALLBACK_IMG}'">`; }

document.getElementById('projFeatured').innerHTML = PROJECTS.map(p => `
  <article class="proj-feature reveal">
    <div class="proj-media"><span class="proj-year">${p.year}</span>${mkImg(p.src, p.title)}</div>
    <div class="proj-info">
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <div class="proj-tags">${p.tech.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <a href="${p.href}" target="_blank" rel="noopener noreferrer" class="proj-link">Voir le projet <i class="ph ph-arrow-up-right"></i></a>
    </div>
  </article>`).join('');

document.getElementById('projMore').innerHTML = PROJECTS_MORE.map(p => `
  <div class="proj-mini reveal">
    <div class="proj-mini-media">${mkImg(p.src, p.title)}</div>
    <div class="proj-mini-body">
      <h4>${p.title}</h4>
      <a href="${p.href}" target="_blank" rel="noopener noreferrer">Voir le projet <i class="ph ph-arrow-up-right"></i></a>
    </div>
  </div>`).join('');

document.getElementById('servicesList').innerHTML = SERVICES.map((s,i) => `
  <div class="service-row reveal">
    <div class="service-num">${String(i+1).padStart(2,'0')}</div>
    <div class="service-name"><i class="ph-bold ${s.icon}"></i>${s.name}</div>
    <p class="service-desc">${s.desc}</p>
  </div>`).join('');

const timelineEl = document.getElementById('timelineList');
timelineEl.innerHTML = TIMELINE.map(t => `
  <div class="timeline-item ${t.hidden ? 'timeline-hidden' : ''}">
    <div class="timeline-date">${t.date}</div>
    <div><div class="timeline-role">${t.role}</div><div class="timeline-place">${t.place}</div></div>
  </div>`).join('');
document.getElementById('timelineToggle').addEventListener('click', function(){
  const hidden = timelineEl.querySelectorAll('.timeline-hidden');
  const show = !hidden[0]?.classList.contains('show');
  hidden.forEach(el => el.classList.toggle('show', show));
  this.innerHTML = show ? 'Réduire <i class="ph ph-caret-up"></i>' : 'Afficher tout <i class="ph ph-caret-down"></i>';
});

document.getElementById('faqList').innerHTML = FAQ.map((f,i) => `
  <div class="faq-item">
    <button class="faq-q" aria-expanded="false"><span><span class="faq-num">${String(i+1).padStart(2,'0')}</span>${f.q}</span><i class="ph ph-plus"></i></button>
    <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
  </div>`).join('');
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      if (o !== item) { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; o.querySelector('.faq-q').setAttribute('aria-expanded','false'); }
    });
    item.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
    answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
  });
});

/* ── nav scroll state, collapse-on-scroll pill + mobile toggle ── */
const nav = document.getElementById('siteNav');
const EXPAND_SCROLL_THRESHOLD = 80;
let isExpanded = true;
let lastScrollY = window.scrollY;
let scrollYOnCollapse = 0;
const isDesktopNav = () => window.innerWidth > 900;

function setNavExpanded(expanded){
  isExpanded = expanded;
  nav.classList.toggle('collapsed', !expanded);
}

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 30);

  if (isDesktopNav()) {
    if (isExpanded && y > lastScrollY && y > 150) {
      setNavExpanded(false);
      scrollYOnCollapse = y;
    } else if (!isExpanded && y < lastScrollY && (scrollYOnCollapse - y > EXPAND_SCROLL_THRESHOLD)) {
      setNavExpanded(true);
    }
  } else if (!isExpanded) {
    setNavExpanded(true);
  }
  lastScrollY = y;
}, { passive:true });

nav.addEventListener('click', () => {
  if (!isExpanded) setNavExpanded(true);
});

window.addEventListener('resize', () => { if (!isDesktopNav() && !isExpanded) setNavExpanded(true); });

const navLinks = document.getElementById('navLinks');
const navToggle = document.getElementById('navToggle');
navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const open = navLinks.classList.toggle('open');
  navToggle.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open'); navToggle.innerHTML = '<i class="ph ph-list"></i>';
}));

/* ── PROCESSUS : timeline orbitale ── */
(function initOrbitalTimeline(){
  const wrap = document.getElementById('orbitalTimeline');
  if (!wrap) return;

  const orbitalData = [
    { id:1, title:'Écoute',        date:'Étape 1', icon:'ph-ear',           status:'completed',    energy:100, content:"Je comprends vos besoins, vos objectifs et vos contraintes avant d'écrire la moindre ligne.", related:[2] },
    { id:2, title:'Conception',    date:'Étape 2', icon:'ph-pencil-line',   status:'completed',    energy:85,  content:"Structure, design et choix technologiques adaptés à votre projet.", related:[1,3] },
    { id:3, title:'Développement', date:'Étape 3', icon:'ph-code',          status:'in-progress',  energy:60,  content:"Code propre, testé et responsive — livré dans les délais annoncés.", related:[2,4] },
    { id:4, title:'Livraison',     date:'Étape 4', icon:'ph-rocket-launch', status:'pending',      energy:20,  content:"Mise en ligne et accompagnement pour bien démarrer.", related:[3] },
  ];
  const statusLabel = { completed:'Terminé', 'in-progress':'En cours', pending:'À venir' };

  let angle = 0, autoRotate = true, expandedId = null;
  const nodeEls = {};

  orbitalData.forEach(item => {
    const node = document.createElement('div');
    node.className = 'orbital-node';
    node.dataset.id = item.id;
    node.innerHTML = `
      <div class="orbital-dot"><i class="ph-bold ${item.icon}"></i></div>
      <div class="orbital-label">${item.title}</div>
      <div class="orbital-card">
        <div class="orbital-card-top">
          <span class="orbital-status ${item.status}">${statusLabel[item.status]}</span>
          <span style="font-size:.68rem;color:var(--text-faint);font-family:monospace;">${item.date}</span>
        </div>
        <h5>${item.title}</h5>
        <p>${item.content}</p>
        <div class="orbital-energy">
          <div class="orbital-energy-row"><span>Avancement</span><span>${item.energy}%</span></div>
          <div class="orbital-energy-bar"><div class="orbital-energy-fill" style="width:${item.energy}%"></div></div>
        </div>
        ${item.related.length ? `<div class="orbital-related">${item.related.map(rid => {
          const r = orbitalData.find(d => d.id === rid);
          return `<button type="button" data-goto="${rid}">${r.title}<i class="ph ph-arrow-right"></i></button>`;
        }).join('')}</div>` : ''}
      </div>`;
    wrap.appendChild(node);
    nodeEls[item.id] = node;

    node.querySelector('.orbital-dot').addEventListener('click', e => { e.stopPropagation(); toggleNode(item.id); });
    node.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); toggleNode(parseInt(btn.dataset.goto, 10)); });
    });
  });

  function toggleNode(id){
    if (expandedId === id) { expandedId = null; autoRotate = true; }
    else { expandedId = id; autoRotate = false; centerOnNode(id); }
    render();
  }
  function centerOnNode(id){
    const idx = orbitalData.findIndex(d => d.id === id);
    angle = 270 - (idx / orbitalData.length) * 360;
  }
  function relatedOf(id){
    const item = orbitalData.find(d => d.id === id);
    return item ? item.related : [];
  }
  function radius(){
    const w = wrap.clientWidth;
    return Math.max(105, Math.min(165, w * 0.24));
  }
  function render(){
    const total = orbitalData.length;
    const r = radius();
    const relatedIds = expandedId ? relatedOf(expandedId) : [];
    orbitalData.forEach((item, index) => {
      const a = ((index / total) * 360 + angle) % 360;
      const rad = a * Math.PI / 180;
      const x = r * Math.cos(rad), y = r * Math.sin(rad);
      const isExpanded = expandedId === item.id;
      const isRelated = relatedIds.includes(item.id);
      const z = isExpanded ? 200 : Math.round(100 + 50 * Math.cos(rad));
      const op = isExpanded ? 1 : Math.max(.45, Math.min(1, .45 + .55 * ((1 + Math.sin(rad)) / 2)));
      const node = nodeEls[item.id];
      node.style.transform = `translate(${x}px, ${y}px)`;
      node.style.zIndex = z;
      node.style.opacity = op;
      node.classList.toggle('expanded', isExpanded);
      node.classList.toggle('related', isRelated);
    });
  }

  wrap.addEventListener('click', e => {
    if (e.target === wrap) { expandedId = null; autoRotate = true; render(); }
  });
  window.addEventListener('resize', render);

  render();
  setInterval(() => { if (autoRotate) { angle = (angle + 0.25) % 360; render(); } }, 50);
})();

/* ── GSAP scroll reveals (dégradation propre si prefers-reduced-motion) ── */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Bouton retour en haut du footer cinématique (fonctionne quel que soit le mode de mouvement) */
document.getElementById('footerToTop')?.addEventListener('click', () => {
  if (window.__lenis) window.__lenis.scrollTo(0, { duration: reduceMotion ? 0 : 1.2 });
  else window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* données du scroll-scatter — un card par image, du fond (z bas) vers le premier plan */
const SCATTER_CARDS = [
  { sel:'[data-card="1"]', stackOffset:{x:-8,y:-10},  stackRotate:-18, target:{x:-20,y:-34,scale:.9,w:17,h:22} },
  { sel:'[data-card="2"]', stackOffset:{x:14,y:-10},  stackRotate:20,  target:{x:32, y:-30,scale:.8,w:18,h:32} },
  { sel:'[data-card="4"]', stackOffset:{x:1,  y:-10},  stackRotate:-2, target:{x:6,  y:-32,scale:.8,w:25,h:30} },
  { sel:'[data-card="5"]', stackOffset:{x:18, y:1},    stackRotate:6,  target:{x:37, y:6,  scale:.8,w:18,h:32} },
  { sel:'[data-card="6"]', stackOffset:{x:-6, y:10},   stackRotate:6,  target:{x:-24,y:34, scale:.9,w:22,h:25} },
  { sel:'[data-card="8"]', stackOffset:{x:20, y:12},   stackRotate:-7, target:{x:30, y:34, scale:1, w:16,h:20} },
];
const SCATTER_START = .12, SCATTER_END = .9;

/* ── Glyph Portal : caméra de scroll à travers une lettre ──
   Adapté du composant open-source Glyph Portal (MIT)
   © 2026 Christian Katzmann — https://ktzm.dk
   (version d'origine en React ; réécriture en JS natif ci-dessous
   pour ce site sans framework — merci de conserver cette mention) */
function initGlyphPortal() {
  const section = document.getElementById('glyphPortal');
  if (!section) return;
  const pin = section.querySelector('#gpPin');
  const field = section.querySelector('#gpField');
  const art = section.querySelector('#gpArt');
  const clip = section.querySelector('#gpClip');
  const glyph = section.querySelector('#gpGlyph');
  const viewportProbe = section.querySelector('.gp-viewport');

  const text = 'DAMEL';
  const focusChar = 'D';
  const length = 2.4;   // distance de scroll, en hauteurs de section
  const weight = 900;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  let raf = 0, dirty = true, active = true, ready = false;
  let browserFrameSeen = false, stalled = false;
  const mountedAt = performance.now();
  let W = 1, H = 1, travel = 1, startScale = 1, endScale = 1;
  let center = { x: 0, y: 0 }, target = null, lastProgress = -1;
  let bounds = { x: 0, y: 0, width: 1, height: 1 };

  function clamp(n, a = 0, b = 1) { return Math.min(b, Math.max(a, n)); }
  function smooth(a, b, n) { const t = clamp((n - a) / (b - a)); return t * t * (3 - 2 * t); }

  // plus grand carré opaque dans la lettre — détecte le "trou" (ex. le fond du D)
  function interior(char, font) {
    context.font = font;
    const m = context.measureText(char);
    const pad = 8;
    const left = Math.ceil(m.actualBoundingBoxLeft);
    const ascent = Math.ceil(m.actualBoundingBoxAscent);
    canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
    canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
    context.font = font; context.fontKerning = 'none';
    context.fillText(char, pad + left, pad + ascent);
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data;
    const rows = new Uint16Array(width + 1);
    let size = 0, bx = 0, by = 0;
    for (let y = 0; y < height; y++) {
      let diagonal = 0;
      for (let x = 0; x < width; x++) {
        const above = rows[x + 1];
        rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245 ? Math.min(above, rows[x], diagonal) + 1 : 0;
        diagonal = above;
        if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
      }
    }
    if (size < 3) return null;
    return { x: (bx + 1 - size / 2 - pad - left) / 3, y: (by + 1 - size / 2 - pad - ascent) / 3, radius: (size / 2 - 1) / 3 };
  }

  function scrollParentOf(el) {
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (/(auto|scroll|hidden)/.test(getComputedStyle(p).overflowY) && p !== document.body && p !== document.documentElement) return p;
    }
    return null;
  }
  const root = scrollParentOf(section); // null ici : c'est le document qui défile

  // gèle une police disponible pour ce montage (évite que l'encre bouge sous la caméra)
  glyph.setAttribute('style', `font-family:'Archivo',sans-serif;font-weight:${weight};font-size:100px;font-kerning:none;`);
  const computedFamily = getComputedStyle(glyph).fontFamily;
  const families = computedFamily.match(/(?:[^,"']+|"[^"]*"|'[^']*')+/g) ?? [];
  const available = families.filter(f => { try { return document.fonts.check(`${weight} 100px ${f.trim()}`, text); } catch { return false; } });
  glyph.style.fontFamily = [...available, '"Arial Black", Arial, sans-serif'].join(',');
  stalled = available.length < families.length;

  let candidates = [];
  function readInk() {
    const font = getComputedStyle(glyph);
    const scanFont = `${font.fontWeight} 300px ${font.fontFamily}`;
    context.font = `${font.fontWeight} 100px ${font.fontFamily}`;
    context.fontKerning = 'none';
    const metrics = context.measureText(text);
    const advances = Array.from({ length: text.length }, (_, i) => context.measureText(text.slice(0, i)).width);
    bounds = {
      x: -metrics.actualBoundingBoxLeft, y: -metrics.actualBoundingBoxAscent,
      width: metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight,
      height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    };
    if (!bounds.width || !bounds.height) return false;
    center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    const requested = text.indexOf(focusChar);
    let offset = 0; candidates = [];
    for (const char of Array.from(text)) {
      context.font = `${font.fontWeight} 100px ${font.fontFamily}`;
      const found = interior(char, scanFont);
      if (found) candidates.push({ ...found, x: found.x + advances[offset], index: offset });
      offset += char.length;
    }
    target = candidates.find(c => c.index === requested)
      ?? [...candidates].sort((a, b) => b.radius - a.radius || Math.abs(a.x - center.x) - Math.abs(b.x - center.x))[0]
      ?? null;
    return true;
  }

  function position() {
    const origin = root ? root.getBoundingClientRect().top + root.clientTop : 0;
    return clamp((origin - section.getBoundingClientRect().top) / travel);
  }

  function paint(progress) {
    const isStatic = motion.matches || !browserFrameSeen || stalled || !target;
    const p = isStatic ? 0 : progress;
    const t = clamp(p / 0.78);
    const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    const scale = Math.exp(Math.log(startScale) + Math.log(endScale / startScale) * eased);
    const blend = endScale === startScale ? 0 : (1 / scale - 1 / startScale) / (1 / endScale - 1 / startScale);
    const cx = center.x + ((target?.x ?? center.x) - center.x) * blend;
    const cy = center.y + ((target?.y ?? center.y) - center.y) * blend;
    const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
    const radians = roll * Math.PI / 180;
    const dx = W / 2 / scale, dy = (H * .46 + H * .04 * eased) / scale;
    clip.setAttribute('transform', `scale(${scale}) rotate(${roll})`);
    glyph.setAttribute('transform', `translate(${Math.cos(radians) * dx + Math.sin(radians) * dy - cx} ${-Math.sin(radians) * dx + Math.cos(radians) * dy - cy})`);
    field.style.clipPath = t >= 1 ? 'none' : 'url(#gpClip)';
    section.style.setProperty('--gp-caption', String(1 - smooth(0.01, 0.16, p)));
    section.style.setProperty('--gp-reveal', String(isStatic ? 1 : smooth(0.78, 0.9, p)));
    section.style.setProperty('--gp-field-scale', String(1 + .16 * smooth(0, .82, p)));
    section.style.setProperty('--gp-caption-hit', p < 0.08 ? 'auto' : 'none');
    section.dataset.gpEntered = String(p >= 0.9);
    if (p !== lastProgress) lastProgress = p;
  }

  function layout() {
    if (!section.clientWidth) return;
    W = pin.clientWidth;
    const smallViewport = viewportProbe.offsetHeight;
    const viewportHeight = Math.max(1, Math.min(root?.clientHeight ?? smallViewport, smallViewport));
    H = motion.matches ? Math.min(viewportHeight * 0.75, 480) : viewportHeight;
    section.style.setProperty('--gp-height', `${H}px`);
    section.style.setProperty('--gp-length', length);
    travel = H * length;
    art.setAttribute('viewBox', `0 0 ${W} ${H}`);
    if (!ready) ready = readInk();
    if (!ready) return;
    startScale = Math.min(W * 0.84 / bounds.width, H * .38 / bounds.height);
    endScale = target ? Math.max(startScale, Math.hypot(W, H) / (target.radius * 1.35)) : startScale;
    section.style.setProperty('--gp-word-top', `${H * .46 - bounds.height * startScale / 2}px`);
    section.style.setProperty('--gp-word-bottom', `${H * .46 + bounds.height * startScale / 2}px`);
    section.dataset.gpReady = 'true';
    section.dataset.gpMotion = (!motion.matches && browserFrameSeen && !stalled && target) ? 'on' : 'off';
  }

  function frame(time) {
    raf = 0;
    if (time !== undefined && !browserFrameSeen) { browserFrameSeen = true; stalled ||= performance.now() - mountedAt > 2500; dirty = true; }
    if (dirty) { dirty = false; layout(); }
    if (ready) paint(position());
  }
  function schedule() { if (!raf && active) raf = requestAnimationFrame(frame); }
  function onResize() { cancelAnimationFrame(raf); dirty = true; frame(); }
  function onScroll() { schedule(); }

  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(section);
  if (root) resizeObserver.observe(root);
  const visibility = new IntersectionObserver(([entry]) => {
    active = entry.isIntersecting;
    if (active) { dirty = true; schedule(); }
    else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { root, rootMargin: '100% 0px' });
  visibility.observe(section);
  (root ?? window).addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.visualViewport?.addEventListener('resize', onResize);
  motion.addEventListener('change', onResize);
  frame();
  schedule();
}
document.fonts.ready.then(initGlyphPortal).catch(initGlyphPortal);

(function initMotion(){
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('.reveal-footer').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    // scatter : on saute l'animation, on affiche direct la composition finale
    const scatterWrap = document.getElementById('scatterCards');
    if (scatterWrap) {
      SCATTER_CARDS.forEach(c => {
        const el = scatterWrap.querySelector(c.sel);
        if (!el) return;
        el.style.width = `${c.target.w}vw`;
        el.style.height = `${c.target.h}vh`;
        el.style.transform = `translate(calc(-50% + ${c.target.x}vw), calc(-50% + ${c.target.y}vh)) scale(${c.target.scale})`;
      });
      document.querySelector('.scatter-copy').style.opacity = 1;
      const hint = document.getElementById('scatterHint');
      if (hint) hint.style.display = 'none';
    }
    return;
  }

  // GSAP / ScrollTrigger / Lenis sont chargés en local (vendor/) directement
  // dans le <head> du HTML — plus de dépendance à un CDN au runtime.
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* Lenis : scroll fluide "façon Framer", synchronisé sur le ticker GSAP. */
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ duration: 1.15, easing: t => 1 - Math.pow(1 - t, 3), anchors: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* Révélation de texte "mot par mot" : découpe le texte d'un élément en
     mots, chacun enveloppé dans un masque, pour l'effet rideau au scroll.
     Ne touche pas aux nœuds non-textuels (images, icônes) qu'il croise. */
  function splitWords(el){
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    let n; while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(node => {
      if (!node.textContent.trim()) return;
      const frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(tok => {
        if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
        const mask = document.createElement('span');
        mask.className = 'word-mask';
        const inner = document.createElement('span');
        inner.className = 'word-inner';
        inner.textContent = tok;
        mask.appendChild(inner);
        frag.appendChild(mask);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return el.querySelectorAll('.word-inner');
  }

  // Reveal générique : hero visible immédiatement, le reste au scroll
  gsap.set('.hero .reveal', { opacity:0, y:26 });

  // Lignes de texte du hero : effet rideau mot par mot (uniquement le texte pur,
  // pas les lignes avec chips-images pour ne pas perturber leur mise en page)
  const heroWordEls = document.querySelectorAll('.hero-line-small, .hero-line-role');
  heroWordEls.forEach(el => gsap.set(splitWords(el), { yPercent: 130, opacity: 0 }));

  gsap.to('.hero .reveal', { opacity:1, y:0, duration:.8, stagger:.08, ease:'power2.out', delay:.15 });
  gsap.to('.hero-line-small .word-inner, .hero-line-role .word-inner', {
    yPercent: 0, opacity: 1, duration: .9, stagger: .025, ease: 'power3.out', delay: .3,
  });

  // Compteur animé pour les chiffres clés du hero (10+, 7+, 2+…)
  document.querySelectorAll('.hero-stat b').forEach((el) => {
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2] || '';
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target, duration: 1.3, ease: 'power2.out', delay: .5,
          onUpdate: () => { el.textContent = Math.round(counter.val) + suffix; }
        });
      }
    });
  });

  document.querySelectorAll('section:not(.hero) .reveal, .final-cta.reveal').forEach(el => {
    gsap.fromTo(el, { opacity:0, y:26 }, {
      opacity:1, y:0, duration:.65, ease:'power2.out',
      scrollTrigger:{ trigger:el, start:'top 88%', toggleActions:'play none none reverse' }
    });
  });

  // Titres de section + CTA finale : effet rideau mot par mot au scroll
  document.querySelectorAll('.section-title, .final-cta-heading').forEach(el => {
    const words = splitWords(el);
    gsap.fromTo(words, { yPercent:120, opacity:0 }, {
      yPercent:0, opacity:1, duration:.8, stagger:.02, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 88%', toggleActions:'play none none reverse' }
    });
  });

  // Images de projets : léger zoom-révélation à l'entrée dans le viewport
  // (clearProps rend la main au :hover CSS une fois l'animation terminée)
  document.querySelectorAll('.proj-media img, .proj-mini-media img').forEach(img => {
    gsap.fromTo(img, { scale:1.18 }, {
      scale:1, duration:1.1, ease:'power3.out', clearProps:'scale',
      scrollTrigger:{ trigger: img.closest('.proj-media, .proj-mini-media'), start:'top 92%' }
    });
  });

  // Grilles avec stagger (cartes projets, process, services)
  ['#projFeatured .proj-feature','#projMore .proj-mini','#servicesList .service-row'].forEach(sel => {
    const items = document.querySelectorAll(sel);
    if (!items.length) return;
    gsap.fromTo(items, { opacity:0, y:24 }, {
      opacity:1, y:0, duration:.5, stagger:.08, ease:'power2.out',
      scrollTrigger:{ trigger: items[0].closest('.container') || items[0], start:'top 85%' }
    });
  });

  // Petits groupes d'éléments (chips, cartes, lignes) : chacun apparaît
  // légèrement après le précédent pour un effet "cascade" au scroll,
  // plutôt qu'un bloc entier qui apparaît d'un coup.
  [
    { sel:'.tool-chip',    from:{ opacity:0, y:14, scale:.92 }, stagger:.045 },
    { sel:'.integ-card',   from:{ opacity:0, y:20, scale:.9 },  stagger:.07  },
    { sel:'.gp-feature',   from:{ opacity:0, y:22 },            stagger:.12  },
    { sel:'.cert-row',     from:{ opacity:0, y:16 },            stagger:.1   },
    { sel:'.timeline-item',from:{ opacity:0, x:-16 },           stagger:.09  },
    { sel:'.proj-tags .tag', from:{ opacity:0, y:8 },           stagger:.04  },
  ].forEach(({ sel, from, stagger }) => {
    const groups = new Map();
    document.querySelectorAll(sel).forEach(el => {
      const container = el.closest('.tools-row, .integrations-cluster, .gp-features, .about-certs, .timeline, .proj-tags') || el.parentElement;
      if (!groups.has(container)) groups.set(container, []);
      groups.get(container).push(el);
    });
    groups.forEach((items) => {
      gsap.fromTo(items, from, {
        opacity:1, y:0, x:0, scale:1, duration:.55, stagger, ease:'power2.out',
        scrollTrigger:{ trigger: items[0], start:'top 90%', toggleActions:'play none none reverse' }
      });
    });
  });

  // Fenêtre de code du manifeste : légère mise à l'échelle + apparition,
  // comme si la fenêtre "se posait" à l'écran au scroll.
  const codeWindow = document.querySelector('.code-window');
  if (codeWindow) {
    gsap.fromTo(codeWindow, { opacity:0, y:36, scale:.96 }, {
      opacity:1, y:0, scale:1, duration:.8, ease:'power3.out',
      scrollTrigger:{ trigger:codeWindow, start:'top 85%', toggleActions:'play none none reverse' }
    });
  }

  // Barre d'intégration (le pilier central "D.") : légère rotation d'entrée
  const integCenter = document.querySelector('.integ-card.is-center');
  if (integCenter) {
    gsap.fromTo(integCenter, { opacity:0, rotate:-8, scale:.85 }, {
      opacity:1, rotate:0, scale:1, duration:.6, ease:'back.out(1.7)',
      scrollTrigger:{ trigger:integCenter, start:'top 90%', toggleActions:'play none none reverse' }
    });
  }

  // Footer cinématique : parallax du texte géant + reveal du contenu au scroll
  const footerGiant = document.querySelector('.footer-giant-text');
  if (footerGiant) {
    gsap.fromTo(footerGiant, { y:'8vh', scale:.85, opacity:0 }, {
      y:'0vh', scale:1, opacity:1, ease:'power1.out',
      scrollTrigger:{ trigger:'.footer-curtain', start:'top 80%', end:'bottom bottom', scrub:1 }
    });
  }
  gsap.utils.toArray('.reveal-footer').forEach((el, i) => {
    gsap.fromTo(el, { opacity:0, y:40 }, {
      opacity:1, y:0, duration:.7, ease:'power3.out', delay:i * .1,
      scrollTrigger:{ trigger:'.footer-curtain', start:'top 55%', toggleActions:'play none none reverse' }
    });
  });

  // Boutons magnétiques (CTA du hero, du footer, du CTA final…) : suivent
  // légèrement le curseur puis reviennent avec un rebond élastique — même
  // langage de micro-interaction que les sites premium type Framer/Apple.
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * .3, y: y * .35, scale:1.04, ease:'power2.out', duration:.4 });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x:0, y:0, scale:1, ease:'elastic.out(1, 0.3)', duration:1.1 });
    });
  });

  // Halo lumineux qui suit le curseur dans le hero — effet cinématique
  // discret inspiré des sites Framer/Apple, désactivé au clavier/tactile.
  const heroGlowSection = document.querySelector('.hero');
  if (heroGlowSection && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'hero-cursor-glow';
    heroGlowSection.appendChild(glow);
    gsap.set(glow, { xPercent:-50, yPercent:-50, opacity:0 });
    const glowPos = { x:0, y:0 };
    const quickX = gsap.quickTo(glow, 'x', { duration:.6, ease:'power3.out' });
    const quickY = gsap.quickTo(glow, 'y', { duration:.6, ease:'power3.out' });
    heroGlowSection.addEventListener('mousemove', (e) => {
      const rect = heroGlowSection.getBoundingClientRect();
      glowPos.x = e.clientX - rect.left; glowPos.y = e.clientY - rect.top;
      quickX(glowPos.x); quickY(glowPos.y);
      gsap.to(glow, { opacity:1, duration:.3 });
    });
    heroGlowSection.addEventListener('mouseleave', () => gsap.to(glow, { opacity:0, duration:.4 }));
  }

  // Scroll scatter : pin + scrub sur desktop/tablette large, grille statique en dessous de 768px (voir CSS)
  ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
      const stage = document.getElementById('scatterStage');
      const cardsWrap = document.getElementById('scatterCards');
      if (!stage || !cardsWrap) return;

      const cards = SCATTER_CARDS.map(c => ({ ...c, el: cardsWrap.querySelector(c.sel) })).filter(c => c.el);

      cards.forEach(c => {
        gsap.set(c.el, {
          width: `${c.target.w}vw`, height: `${c.target.h}vh`,
          xPercent: -50, yPercent: -50,
          x: `${c.stackOffset.x}vw`, y: `${c.stackOffset.y}vh`,
          rotation: c.stackRotate, scale: .82,
        });
      });

      const stagePin = stage.querySelector('.scatter-pin');
      if (stagePin) gsap.set(stagePin, { position: 'relative' });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage, start: 'top top', end: '+=200%',
          scrub: 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
        }
      });

      cards.forEach(c => {
        tl.to(c.el, {
          x: `${c.target.x}vw`, y: `${c.target.y}vh`,
          rotation: 0, scale: c.target.scale, ease: 'none',
          duration: SCATTER_END - SCATTER_START,
        }, SCATTER_START);
      });

      tl.to('.scatter-copy', { opacity: 1, ease: 'none', duration: .35 }, .3);
      tl.to('#scatterHint', { opacity: 0, ease: 'none', duration: SCATTER_START }, 0);

      return () => tl.kill();
    }
  });

  ScrollTrigger.refresh();
})();