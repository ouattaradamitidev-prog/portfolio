/* ══════════════════════════════════════════════════════════
   DAMEL — PORTFOLIO · script principal
   ══════════════════════════════════════════════════════════ */
document.documentElement.classList.add('js-ready');

/* ── compteur de visites (tableau de bord) ──────────────────────────
   Envoie un signal discret au backend Django à chaque chargement de
   page, pour alimenter le compteur de visites du tableau de bord.
   Remplace l'URL ci-dessous par celle de ton service Render une fois
   déployé (ex. 'https://portfolio-admin.onrender.com'). Si l'appel
   échoue (backend éteint, pas encore déployé...), le site continue de
   fonctionner normalement : aucune dépendance n'est créée. ── */
const BACKEND_URL = 'https://TON-SERVICE.onrender.com';
if (BACKEND_URL && !BACKEND_URL.includes('TON-SERVICE')) {
  try {
    fetch(`${BACKEND_URL}/api/track/`, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ path: location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* silencieux : le compteur n'est jamais bloquant */ }
}

/* ── alerte e-mail détaillée à chaque visite (via Web3Forms, gratuit) ──
   La clé Web3Forms est faite pour être publique : elle permet seulement
   d'écrire à l'adresse du compte. Un e-mail par session de navigation
   (pas de spam au rechargement), rien en local ni pour les robots.
   Localisation : 3 services interrogés en parallèle, le premier qui
   répond gagne. Si le visiteur quitte la page avant la fin, l'alerte
   part quand même (sendBeacon) avec ce qu'on a déjà. ── */
const VISIT_MAIL_KEY = 'c477e384-482a-4348-aceb-d2968f6da2b4';
(() => {
  try {
    if (!VISIT_MAIL_KEY) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:') return;
    if (/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent)) return;
    let alreadySent = false;
    try { alreadySent = !!sessionStorage.getItem('visit-mail-sent'); } catch (e) {}
    if (alreadySent) return;

    /* visiteur nouveau ou qui revient (mémorisé dans son navigateur) */
    let count = 1, first = new Date().toISOString();
    try {
      count = (parseInt(localStorage.getItem('visit-count'), 10) || 0) + 1;
      first = localStorage.getItem('visit-first') || first;
      localStorage.setItem('visit-count', count);
      localStorage.setItem('visit-first', first);
    } catch (e) {}

    /* navigateur, système, appareil */
    const ua = navigator.userAgent;
    const os = /Windows/i.test(ua) ? 'Windows' : /Android/i.test(ua) ? 'Android'
      : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Mac OS/i.test(ua) ? 'macOS'
      : /Linux/i.test(ua) ? 'Linux' : 'Inconnu';
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera'
      : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Chrome\//.test(ua) ? 'Chrome'
      : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Inconnu';
    const device = /iPad|Tablet/i.test(ua) ? 'Tablette' : /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Ordinateur';

    /* provenance + paramètres de campagne (?utm_source=...) */
    const params = new URLSearchParams(location.search);
    const utm = ['utm_source', 'utm_medium', 'utm_campaign']
      .map(k => params.get(k) && `${k.replace('utm_', '')}=${params.get(k)}`).filter(Boolean).join(', ');
    const when = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan', dateStyle: 'full', timeStyle: 'medium' });
    const conn = navigator.connection && navigator.connection.effectiveType;

    let sent = false;
    const send = (geo, viaBeacon) => {
      if (sent) return;
      sent = true;
      try { sessionStorage.setItem('visit-mail-sent', '1'); } catch (e) {}
      const lieu = [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Inconnue';
      const fields = {
        access_key: VISIT_MAIL_KEY,
        subject: `👀 Visite portfolio : ${lieu} · ${device}${count > 1 ? ` (visite n°${count})` : ' (nouveau visiteur)'}`,
        from_name: 'Portfolio DAMEL',
        '🕒 Date': when,
        '👤 Visiteur': count > 1 ? `Revient (visite n°${count}, 1re visite le ${new Date(first).toLocaleDateString('fr-FR')})` : 'Nouveau visiteur',
        '📍 Localisation': lieu + (geo.postal ? ` (${geo.postal})` : ''),
        '🗺️ Carte': geo.lat != null ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}` : 'Indisponible',
        '🌐 Adresse IP': geo.ip || 'Inconnue',
        '📶 Opérateur': geo.org || 'Inconnu',
        '🔗 Provenance': document.referrer || 'Accès direct (lien tapé, favori ou appli)',
        '📣 Campagne': utm || 'Aucune',
        '📄 Page': location.href,
        '💻 Appareil': `${device} · ${os} · ${browser}`,
        '🖥️ Écran': `${screen.width}×${screen.height} (fenêtre ${innerWidth}×${innerHeight})`,
        '🗣️ Langue': navigator.language,
        '⏰ Fuseau horaire': Intl.DateTimeFormat().resolvedOptions().timeZone,
        '📡 Connexion': conn || 'Inconnue',
        '🧾 User-Agent': ua,
      };
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v));
      if (viaBeacon && navigator.sendBeacon && navigator.sendBeacon('https://api.web3forms.com/submit', form)) return;
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: form, keepalive: true })
        .then(r => { if (!r.ok) throw 0; })
        .catch(() => { try { sessionStorage.removeItem('visit-mail-sent'); } catch (e) {} });
    };

    /* si le visiteur quitte la page avant la localisation : envoi immédiat */
    let geoSoFar = {};
    const onLeave = () => { if (document.visibilityState === 'hidden') send(geoSoFar, true); };
    document.addEventListener('visibilitychange', onLeave);
    addEventListener('pagehide', () => send(geoSoFar, true));

    /* localisation par IP : 3 services en parallèle (3 s max), par ordre
       de précision constatée : ipwho.is, puis geojs, puis ipapi */
    const getJSON = url => fetch(url).then(r => { if (!r.ok) throw 0; return r.json(); });
    const providers = [
      getJSON('https://ipwho.is/').then(g => { if (!g.success) throw 0;
        return { ip: g.ip, city: g.city, region: g.region, country: g.country, postal: g.postal, lat: g.latitude, lon: g.longitude, org: g.connection && (g.connection.isp || g.connection.org) }; }),
      getJSON('https://get.geojs.io/v1/ip/geo.json').then(g => {
        return { ip: g.ip, city: g.city, region: g.region, country: g.country, lat: g.latitude, lon: g.longitude, org: g.organization_name }; }),
      getJSON('https://ipapi.co/json/').then(g => { if (g.error) throw 0;
        return { ip: g.ip, city: g.city, region: g.region, country: g.country_name, postal: g.postal, lat: g.latitude, lon: g.longitude, org: g.org }; }),
    ];
    const results = [];
    const pick = () => results.find(Boolean) || {};
    providers.forEach((p, i) => p.then(g => { results[i] = g; geoSoFar = pick(); }, () => {}));
    const timeout = new Promise(res => setTimeout(res, 3000));
    Promise.race([Promise.allSettled(providers), timeout]).then(() => send(pick(), false));
  } catch (e) { /* silencieux : l'alerte n'est jamais bloquante */ }
})();

/* ── données de SECOURS uniquement (si data/projects.json est injoignable :
   ouverture locale du fichier, coupure réseau...). En temps normal, les
   projets affichés viennent de data/projects.json, régénéré automatiquement
   par le backend Django à chaque ajout/modification depuis l'admin. ── */
const PROJECTS_FALLBACK = [
  { src:'./image/gestion-financiere.png', href:'https://gestion-finance.infinityfreeapp.com', title:'Gestion Financière', desc:"App complète avec tableau de bord admin, suivi des transactions, notifications temps réel et génération de reçus PDF.", tech:['PHP','MySQL','Tailwind','API REST'], year:'2026' },
  { src:'./image/MIEL.jpeg', href:'https://app-boutique-miel.netlify.app', title:'BON MIEL', desc:"Boutique apicole avec catalogue, panier dynamique et commandes envoyées directement sur WhatsApp, sans serveur.", tech:['HTML5','CSS3','JavaScript','LocalStorage'], year:'2024' },
  { src:'./image/BOUFFE.jpeg', href:'https://damitielieericouattara-rgb.github.io/restaurant/', title:'Dabalie De Babi', desc:"Plateforme street food ivoirienne : catalogue, panier, suivi de commande. Front JS + back PHP / MySQL.", tech:['HTML5','JavaScript','PHP','MySQL'], year:'2024' },
  { src:'https://btp-site.netlify.app/assets/images/features-1.jpg', href:'https://btp-site.netlify.app', title:'Y BTP Immobilier', desc:"Site vitrine BTP complet : planning, architecture, construction et aménagement intérieur. Galerie de projets filtrée.", tech:['HTML5','CSS3','JavaScript'], year:'2025' },
];
const PROJECTS_MORE_FALLBACK = [
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
  { icon:'ph-cursor-click', name:'Fonctionnalités Interactives', desc:"Formulaires intelligents, galeries animées, paniers d'achat, tout ce qui guide naturellement vos visiteurs vers l'action." },
  { icon:'ph-atom', name:'Application Web React.js', desc:"Tableaux de bord, espaces clients, outils de gestion : des applications rapides, modernes et faciles à faire évoluer." },
  { icon:'ph-database', name:'Site avec Gestion de Données', desc:"Réservations, catalogues, gestion d'utilisateurs, je construis le back-end complet de manière fiable et sécurisée." },
  { icon:'ph-figma-logo', name:'Intégration UI & Design System', desc:"Une maquette Figma ? Je l'intègre avec précision : code propre, chargement rapide, rendu fidèle sur tous les écrans." },
  { icon:'ph-whatsapp-logo', name:'Boutique WhatsApp sans Serveur', desc:"Recevez les commandes directement sur WhatsApp. Catalogue en ligne, panier automatique, e-commerce léger et gratuit." },
];

const EXPERIENCE = [
  { date:"05/2026 — aujourd'hui", role:'Développeur Web Front-end, Stage', place:'ATG · en cours',
    desc:"Développement des interfaces des applications de l'entreprise, en équipe, avec des contributions côté back-end (API, base de données)." },
  { date:"2023 — aujourd'hui", role:'Développeur Web', place:'Projets académiques & personnels',
    desc:"Sites vitrines, boutiques en ligne et applications de gestion : front-end HTML/CSS/JS et React, back-end PHP / MySQL." },
];

const FORMATION = [
  { date:'2025–2026', role:'Licence 3 Sciences Informatiques', place:'ITA 2 Plateaux · Abidjan',
    desc:"React.js, Node.js, conception d'API et sécurité web." },
  { date:'2023–2025', role:'Licence 1 & 2 Informatique', place:'ITA 2 Plateaux · Abidjan',
    desc:'Front-end (HTML5, CSS3, JavaScript), back-end PHP / MySQL et algorithmique.' },
  { date:'2023', role:'Baccalauréat série D', place:"Collège Les Orchidées · Abidjan", hidden:true },
];

const FAQ = [
  { q:"Combien de temps dure généralement un projet ?", a:"Un site vitrine simple prend en général 1 à 2 semaines. Une application avec back-end (gestion de données, panier, tableau de bord) demande plutôt 3 à 5 semaines. Je vous donne une estimation précise après notre premier échange." },
  { q:"Travaillez-vous à partir d'une maquette Figma existante ?", a:"Oui, c'est même l'un de mes points forts : intégrer une maquette Figma avec précision, en gardant un code propre et un rendu fidèle sur tous les écrans." },
  { q:"Qu'est-ce qui différencie votre approche ?", a:"Je pars toujours d'une structure HTML sémantique avant d'ajouter le style, puis le comportement, le résultat est plus léger, plus accessible et plus facile à faire évoluer." },
  { q:"Proposez-vous un accompagnement après la livraison ?", a:"Oui, de petits ajustements et réponses à vos questions restent inclus après la mise en ligne. Pour un suivi plus long, on peut en discuter ensemble." },
  { q:"Comment se passe la communication pendant le projet ?", a:"Par email ou WhatsApp, avec des points d'étape réguliers pour que vous suiviez l'avancement sans surprise à la livraison." },
];

/* ── LETTRES DANSANTES (portage natif de "DancingLetters") ──
   Chaque lettre du mot réagit au survol (ou au toucher) avec l'une des 8
   animations physiques de l'original, attribuées en boucle : élastique,
   charnière, saut écrasé, bascule, glissade, secousse, pop, lévitation.
   Les tableaux de valeurs de motion/react sont convertis en keyframes de
   la Web Animations API : chaque propriété a ses propres paliers, on les
   fusionne en une seule timeline par interpolation linéaire. ── */
const DANCE_MOVES = [
  { props:{ scaleX:[1,1.25,.75,1.15,.95,1.05,1], scaleY:[1,.75,1.25,.85,1.05,.95,1] }, duration:800, ease:'ease-in-out', origin:'center center' },
  { props:{ rotate:[0,80,60,80,60,0], y:[0,10,-5,5,-2,0] }, duration:1200, ease:'cubic-bezier(.175,.885,.32,1.275)', origin:'bottom left' },
  { props:{ scaleY:[1,.6,1.2,1], y:[0,20,-40,0] }, duration:600, ease:'ease-out', origin:'bottom center' },
  { props:{ rotateX:[0,240,150,200,175,180,180,0], scale:[1,1.1,1] }, duration:2000, ease:'ease-out', origin:'50% 80%',
    times:{ rotateX:[0,.12,.24,.36,.48,.6,.85,1] } },
  { props:{ x:[0,-20,15,-10,5,0] }, duration:800, ease:'ease-in-out', origin:'center center' },
  { props:{ x:[0,-5,5,-5,5,-2,2,0], y:[0,-2,2,-1,1,0], rotate:[0,-1,1,-.5,.5,0] }, duration:500, ease:'linear', origin:'center center' },
  { props:{ scale:[1,1.4,1] }, duration:500, ease:'ease-in-out', origin:'center center' },
  { props:{ y:[0,-30,0], scale:[1,1.1,1] }, duration:1200, ease:'ease-in-out', origin:'center center',
    shadow:['0 0 0 rgba(0,0,0,0)', '0 20px 20px rgba(0,0,0,.45)', '0 0 0 rgba(0,0,0,0)'] },
];
const DANCE_DEFAULTS = { x:0, y:0, rotate:0, rotateX:0, scale:1, scaleX:1, scaleY:1 };

/** Fusionne les paliers de chaque propriété en une liste de keyframes transform. */
function buildDanceKeyframes({ props, times = {}, ease }){
  const tracks = Object.entries(props).map(([name, values]) => ({
    name, values,
    offsets: times[name] ?? values.map((_, i) => i / (values.length - 1)),
  }));
  const offsets = [...new Set(tracks.flatMap(t => t.offsets))].sort((a, b) => a - b);
  const valueAt = ({ values, offsets: o }, t) => {
    let i = o.findIndex(v => v >= t);
    if (i <= 0) return values[Math.max(i, 0)];
    const k = (t - o[i - 1]) / (o[i] - o[i - 1] || 1);
    return values[i - 1] + (values[i] - values[i - 1]) * k;
  };
  return offsets.map(offset => {
    const v = { ...DANCE_DEFAULTS };
    tracks.forEach(t => { v[t.name] = valueAt(t, offset); });
    return {
      offset, easing:ease,
      transform:`translate(${v.x}px, ${v.y}px) rotate(${v.rotate}deg) rotateX(${v.rotateX}deg) scale(${v.scale * v.scaleX}, ${v.scale * v.scaleY})`,
    };
  });
}

function initDancingLetters(word){
  if (!word) return null;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const text = word.textContent.trim();
  word.textContent = '';
  const letters = [...text].map((ch, i) => {
    const span = document.createElement('span');
    span.className = 'dance-letter' + (ch === '.' ? ' is-dot' : '');
    span.textContent = ch;
    span.setAttribute('aria-hidden', 'true');
    span.style.setProperty('--i', i);
    word.append(span);
    return span;
  });

  const busy = new Set();
  const dance = (i) => {
    if (still || busy.has(i) || !letters[i].animate) return;
    const move = DANCE_MOVES[i % DANCE_MOVES.length];
    const el = letters[i];
    busy.add(i);
    el.style.transformOrigin = move.origin;
    el.classList.add('is-active');
    const anim = el.animate(buildDanceKeyframes(move), { duration:move.duration });
    if (move.shadow) el.animate(move.shadow.map(s => ({ textShadow:s })), { duration:move.duration, easing:move.ease });
    anim.finished.catch(() => {}).finally(() => { busy.delete(i); el.classList.remove('is-active'); });
  };

  letters.forEach((el, i) => {
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') dance(i); });
    el.addEventListener('click', () => dance(i));
  });
}

initDancingLetters(document.querySelector('.dance-word'));

/* ── injection contenu dynamique ──
   Tout le reste du fichier (rendu, navigation, animations) est regroupé
   dans initPortfolio() et n'est exécuté qu'une fois les projets chargés
   depuis data/projects.json (ou les données de secours ci-dessus) — les
   animations GSAP plus bas ont besoin que les cartes projets existent
   déjà dans le DOM. ── */
function initPortfolio(projects, projectsMore) {


// Projets : roue "works wheel" (voir works-wheel.js). Les projets mis en
// avant passent en premier, suivis des autres.
const worksWheel = window.WorksWheel?.mount(
  document.getElementById('worksWheel'),
  [...projects, ...projectsMore],
  { moreHref:'https://github.com/ouattaradamitidev-prog', fallbackImg:FALLBACK_IMG }
);

// Services : une étape par service sur la frise, alternées au-dessus et
// en dessous de l'axe (voir initServiceJourney plus bas).
document.getElementById('servicesList').innerHTML = SERVICES.map((s,i) => `
  <li class="svc-item ${i % 2 ? 'svc-bottom' : 'svc-top'}" style="--i:${i}">
    <span class="svc-stem" aria-hidden="true"></span><span class="svc-dot" aria-hidden="true"></span>
    <div class="svc-body">
      <span class="svc-mask"><span class="svc-num"><i class="ph-bold ${s.icon}" aria-hidden="true"></i>${String(i+1).padStart(2,'0')}</span></span>
      <h3 class="svc-mask"><span>${s.name}</span></h3>
      <p class="svc-mask"><span>${s.desc}</span></p>
    </div>
  </li>`).join('');

const renderTimeline = items => items.map(t => `
  <div class="timeline-item ${t.hidden ? 'timeline-hidden' : ''}">
    <div class="timeline-date">${t.date}</div>
    <div>
      <div class="timeline-role">${t.role}</div><div class="timeline-place">${t.place}</div>
      ${t.desc ? `<p class="timeline-desc">${t.desc}</p>` : ''}
    </div>
  </div>`).join('');
document.getElementById('experienceList').innerHTML = renderTimeline(EXPERIENCE);
const timelineEl = document.getElementById('timelineList');
timelineEl.innerHTML = renderTimeline(FORMATION);
document.getElementById('timelineToggle').addEventListener('click', function(){
  const hidden = timelineEl.querySelectorAll('.timeline-hidden');
  const show = !hidden[0]?.classList.contains('show');
  hidden.forEach(el => el.classList.toggle('show', show));
  this.innerHTML = show ? 'Réduire <i class="ph ph-caret-up"></i>' : 'Afficher tout <i class="ph ph-caret-down"></i>';
});

/* Découpe une réponse en <span> par caractère (Unicode-safe) pour l'effet
   de révélation "flou → net" en cascade façon Ruixen UI, joué à chaque
   ouverture de l'accordéon. */
function wrapFaqChars(text){
  return [...text].map(c => `<span class="faq-char">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
}

document.getElementById('faqList').innerHTML = FAQ.map((f,i) => `
  <div class="faq-item">
    <button class="faq-q" aria-expanded="false"><span><span class="faq-num">${String(i+1).padStart(2,'0')}</span>${f.q}</span><i class="ph ph-plus"></i></button>
    <div class="faq-a"><div class="faq-a-inner">${wrapFaqChars(f.a)}</div></div>
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

    if (!isOpen) {
      const chars = answer.querySelectorAll('.faq-char');
      if (reduceMotion) {
        gsap.set(chars, { clearProps:'all' });
      } else {
        gsap.killTweensOf(chars);
        gsap.fromTo(chars,
          { opacity:0, filter:'blur(10px)' },
          { opacity:1, filter:'blur(0px)', duration:.3, stagger:.012, ease:'power1.out', delay:.08 }
        );
      }
    }
  });
});

/* ── nav scroll state, collapse-on-scroll pill + mobile toggle ── */
const nav = document.getElementById('siteNav');
const EXPAND_SCROLL_THRESHOLD = 80;
let isExpanded = true;
let lastScrollY = window.scrollY;
let scrollYOnCollapse = 0;
const isDesktopNav = () => window.innerWidth > 900;

const navCollapsedBtn = nav.querySelector('.nav-collapsed-icon');
function setNavExpanded(expanded){
  isExpanded = expanded;
  nav.classList.toggle('collapsed', !expanded);
  // le bouton "damel." n'est atteignable au clavier que quand la pilule est réduite
  navCollapsedBtn.tabIndex = expanded ? -1 : 0;
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
// Menu mobile : tiroir latéral. Le scroll de la page est bloqué tant qu'il
// est ouvert ; il se ferme via un lien, un clic à côté, Échap ou un passage
// en largeur desktop.
function setMenuOpen(open){
  navLinks.classList.toggle('open', open);
  navToggle.innerHTML = open ? '<i class="ph ph-x"></i>' : '<i class="ph ph-list"></i>';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.documentElement.style.overflow = open ? 'hidden' : '';
  if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
}
navToggle.setAttribute('aria-controls', 'navLinks');
navToggle.setAttribute('aria-expanded', 'false');
navToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  setMenuOpen(!navLinks.classList.contains('open'));
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') && !navLinks.contains(e.target)) setMenuOpen(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenuOpen(false); navToggle.focus(); }
});
window.addEventListener('resize', () => { if (isDesktopNav() && navLinks.classList.contains('open')) setMenuOpen(false); });

/* ── OUTILS : infobulle animée (AnimatedTooltip) ──
   Au survol d'un logo, l'infobulle s'incline et glisse selon la position de
   la souris : x (-100 → 100 px autour du centre) donne une rotation de
   -45° → 45° et un décalage de -50 → 50 px, lissés par un ressort
   (raideur 100, amortissement 5, comme useSpring dans l'original).
   Sur écran tactile, un appui ouvre / ferme l'infobulle. ── */
(function initToolTooltips(){
  const items = document.querySelectorAll('.tt-item');
  if (!items.length) return;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const K = 100, C = 5;

  let tip = null, target = 0, pos = 0, vel = 0, raf = 0, last = 0;
  const write = () => {
    if (tip) tip.style.transform = `translateX(${pos * 0.5}px) rotate(${pos * 0.45}deg)`;
  };
  const step = (now) => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    vel += (K * (target - pos) - C * vel) * dt;
    pos += vel * dt;
    const settled = Math.abs(target - pos) < 0.05 && Math.abs(vel) < 0.05;
    if (settled) pos = target;
    write();
    raf = settled ? 0 : requestAnimationFrame(step);
  };
  const kick = () => {
    if (raf || still) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  };

  const open = (item) => {
    const next = item.querySelector('.tt-tip');
    if (tip && tip !== next) tip.style.transform = '';
    tip = next;
    target = pos = vel = 0;
    write();
  };
  const close = (item) => {
    item.classList.remove('is-open');
    if (tip === item.querySelector('.tt-tip')) { target = 0; kick(); }
  };

  items.forEach((item) => {
    item.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') open(item); });
    item.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch' || still) return;
      const r = item.querySelector('.tt-avatar').getBoundingClientRect();
      target = clamp(e.clientX - r.left - r.width / 2, -100, 100);
      kick();
    });
    item.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') close(item); });
    item.addEventListener('focus', () => open(item));
    // tactile : un appui ouvre l'infobulle de ce logo et ferme les autres
    item.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      const wasOpen = item.classList.contains('is-open');
      items.forEach((other) => other.classList.remove('is-open'));
      if (!wasOpen) { open(item); item.classList.add('is-open'); }
    });
  });
  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest('.tt-item')) items.forEach((item) => item.classList.remove('is-open'));
  });
})();

/* ── PROCESSUS : timeline orbitale ── */
(function initOrbitalTimeline(){
  const wrap = document.getElementById('orbitalTimeline');
  if (!wrap) return;

  const orbitalData = [
    { id:1, title:'Écoute',        date:'Étape 1', icon:'ph-ear',           status:'completed',    energy:100, content:"Je comprends vos besoins, vos objectifs et vos contraintes avant d'écrire la moindre ligne.", related:[2] },
    { id:2, title:'Conception',    date:'Étape 2', icon:'ph-pencil-line',   status:'completed',    energy:85,  content:"Structure, design et choix technologiques adaptés à votre projet.", related:[1,3] },
    { id:3, title:'Développement', date:'Étape 3', icon:'ph-code',          status:'in-progress',  energy:60,  content:"Code propre, testé et responsive, livré dans les délais annoncés.", related:[2,4] },
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
    if (document.documentElement.classList.contains('is-loading')) lenis.stop();
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

  // Outils : dans chaque famille, les logos montent un par un avec un léger ressort.
  document.querySelectorAll('.tt-row').forEach(row => {
    gsap.fromTo(row.querySelectorAll('.tt-item'), { opacity:0, y:20 }, {
      opacity:1, y:0, duration:.7, stagger:.07, ease:'back.out(1.6)', clearProps:'transform',
      scrollTrigger:{ trigger:row, start:'top 90%', toggleActions:'play none none reverse' }
    });
  });

  // Petits groupes d'éléments (chips, cartes, lignes) : chacun apparaît
  // légèrement après le précédent pour un effet "cascade" au scroll,
  // plutôt qu'un bloc entier qui apparaît d'un coup.
  [
    { sel:'.gp-feature',   from:{ opacity:0, y:22 },            stagger:.12  },
    { sel:'.cert-row',     from:{ opacity:0, y:16 },            stagger:.1   },
    { sel:'.timeline-item',from:{ opacity:0, x:-16 },           stagger:.09  },
  ].forEach(({ sel, from, stagger }) => {
    const groups = new Map();
    document.querySelectorAll(sel).forEach(el => {
      const container = el.closest('.gp-features, .about-certs, .timeline') || el.parentElement;
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

  // Damier des canaux : les tuiles apparaissent en cascade depuis le centre.
  const intTiles = document.querySelectorAll('.int-tile');
  if (intTiles.length) {
    gsap.fromTo(intTiles, { opacity:0, y:20, scale:.9 }, {
      opacity:1, y:0, scale:1, duration:.55, ease:'back.out(1.5)', clearProps:'transform',
      stagger:{ each:.05, from:'center' },
      scrollTrigger:{ trigger:'.int-board', start:'top 85%', toggleActions:'play none none reverse' }
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

  ScrollTrigger.refresh();
})();

// La roue est reliée au scroll après initMotion (ses épinglages doivent être
// créés après les animations de la page), y compris en
// mouvement réduit : c'est le visiteur qui la fait tourner, rien n'est joué
// automatiquement.
if (typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  worksWheel?.bindScroll(ScrollTrigger, window.__lenis);
  initServiceJourney();
  ScrollTrigger.refresh();
}

/* Frise des services (portage natif du composant "Timeline" de Hyperiux) :
   la section est épinglée et la piste glisse vers la gauche au scroll.
   L'axe se trace au fil du défilement, et chaque service fait pousser sa
   tige, apparaître son point, puis dévoile son texte ligne par ligne quand
   il arrive au milieu de l'écran. Sans animation (mouvement réduit ou GSAP
   absent), la piste reste simplement défilable à l'horizontale. */
function initServiceJourney(){
  const section = document.querySelector('.svc-journey');
  if (!section || reduceMotion) return;
  const viewport = section.querySelector('.svc-viewport');
  const track = section.querySelector('.svc-track');
  section.classList.add('is-live');

  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  const pan = gsap.to(track, {
    x: () => -distance(), ease:'none',
    scrollTrigger:{
      trigger:section, start:'top top', end:() => `+=${distance()}`,
      pin:true, scrub:1, anticipatePin:1, invalidateOnRefresh:true,
    },
  });

  // L'axe se remplit dès que le rail passe 60 % de l'écran, et se termine
  // quand sa fin entre à l'écran : il est donc complet avant la fin du défilé.
  gsap.fromTo(section.querySelector('.svc-axis-line'), { scaleX:0 }, {
    scaleX:1, ease:'none',
    scrollTrigger:{ trigger:section.querySelector('.svc-rail'), containerAnimation:pan, start:'left 60%', end:'right 100%', scrub:true },
  });

  section.querySelectorAll('.svc-item').forEach(item => {
    gsap.timeline({
      scrollTrigger:{ trigger:item, containerAnimation:pan, start:'left 85%', end:'left 55%', scrub:true },
    })
      .fromTo(item.querySelector('.svc-stem'), { scaleY:0 }, { scaleY:1, ease:'none', duration:.4 })
      .fromTo(item.querySelector('.svc-dot'), { scale:0 }, { scale:1, ease:'none', duration:.4 }, '<')
      .fromTo(item.querySelectorAll('.svc-mask > span'), { yPercent:110 }, { yPercent:0, ease:'power2.out', duration:1, stagger:.12 }, '-=.2');
  });
}

} /* fin initPortfolio() */

/* ── chargement des projets depuis le backend Django (via GitHub Pages) ──
   data/projects.json est régénéré et poussé automatiquement sur ce repo
   à chaque ajout/modification de projet dans l'admin Django. Si le fichier
   est introuvable (site ouvert en local, coupure réseau...), on retombe
   sur les données de secours pour que le site reste toujours fonctionnel. ── */
fetch('./data/projects.json', { cache: 'no-store' })
  .then(r => { if (!r.ok) throw new Error('projects.json indisponible'); return r.json(); })
  .then(data => initPortfolio(
    Array.isArray(data.featured) && data.featured.length ? data.featured : PROJECTS_FALLBACK,
    Array.isArray(data.more) && data.more.length ? data.more : PROJECTS_MORE_FALLBACK
  ))
  .catch(() => initPortfolio(PROJECTS_FALLBACK, PROJECTS_MORE_FALLBACK));
