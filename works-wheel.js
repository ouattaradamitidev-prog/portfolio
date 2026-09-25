/* ══════════════════════════════════════════════════════════
   WORKS WHEEL : index de projets en forme de roue
   Portage natif (sans React) du composant 21st.dev "works-wheel".

   Au repos, les projets forment un anneau autour d'un titre, chaque
   carte tangente au cercle. Au premier cran de scroll, l'anneau s'ouvre
   en tambour vertical : la carte de face est à plat et en grand, ses
   voisines basculent en perspective vers le haut et le bas. Chaque cran
   suivant amène le projet d'après face à l'écran.

   Tout tient dans un seul nombre, `turn` : 0 = l'anneau, 1 = le tambour
   avec le projet 0 de face, n = le projet n-1 de face. Une seule boucle
   rAF lit `turn` et écrit les transforms directement dans le DOM.

   Différence avec l'original : `turn` est piloté par le scroll de la
   page (section épinglée par ScrollTrigger) au lieu d'intercepter les
   événements wheel. Ça reste compatible avec Lenis, le tactile et le
   clavier, et la page ne se retrouve jamais "bloquée" sur la section.
   ══════════════════════════════════════════════════════════ */
(() => {
  /* Géométrie. La carte est mesurée par rapport à la scène ; tout le reste
     par rapport à la carte, pour que la roue entière rétrécisse avec elle
     sur un écran étroit. STEP contre DRUM règle la bascule des voisines,
     DRUM contre LENS décide si elles restent dans le cadre ou en sortent. */
  const CARD_H = 0.38;          // hauteur de la carte de face, en part de la scène
  const CARD_H_MOBILE = 0.3;    // ... plus petite sur mobile pour laisser place au titre
  const CARD_MAX_W = 0.34;      // largeur max, en part de la scène
  const CARD_MAX_W_MOBILE = 0.8;
  const CARD_RATIO = 1.45;      // largeur / hauteur
  const STEP = 40;              // degrés entre deux cartes sur le tambour
  const DRUM = 2.22;            // rayon du tambour, en hauteurs de carte
  const LENS = 2.7;             // distance de perspective
  const RING_R = 1.14;          // rayon de l'anneau
  /* Le tambour seul accroche les cartes sur une ligne verticale. Ici la bande
     suit un arc dont le centre est à GAUCHE : la carte de face est au point le
     plus proche (centrée) et ses voisines partent aussi vers la gauche. C'est
     ce qui donne l'effet de roue vue de profil plutôt que de pile de cartes. */
  const BOW = 1.82;
  const TITLE = 0.124;          // taille du titre, en hauteurs de carte
  /** Cartes dessinées de chaque côté de la face. Au-delà, elles seraient de
      tranche puis s'empileraient sur le point de fuite. */
  const CULL = 1.6;
  /** Part de la distance restante parcourue à chaque frame (1 = sans lissage). */
  const EASE = 0.14;
  /** Hauteur de scroll consacrée à chaque projet, en part de la fenêtre. */
  const SCROLL_PER_ITEM = 0.6;
  const MOBILE_BP = 768;

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rad = (deg) => (deg * Math.PI) / 180;
  const pad = (n) => String(n).padStart(2, '0');

  /** Décalage vers la gauche d'une carte tournée de `drumDeg` hors de la face.
      Nul de face : le projet lu reste centré. */
  const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

  /** Les deux états dans une seule chaîne de transforms : les termes de
      l'anneau s'effacent quand `m` atteint le tambour, et ceux du tambour
      sont nuls tant que l'anneau est formé. */
  const place = (ringDeg, drumDeg, ringR, drumR, bow, m) =>
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  /**
   * Monte la roue dans `root`.
   * @param {HTMLElement} root  conteneur (la section qui sera épinglée)
   * @param {{title:string, src:string, href?:string, year?:string, tech?:string[]}[]} items
   * @param {{label?:string[], action?:string, moreHref?:string, fallbackImg?:string}} [opts]
   * @returns {{ bindScroll: (ScrollTrigger:any, lenis:any|undefined) => void }}
   */
  function mount(root, items, opts = {}) {
    const {
      label = ['Mes derniers', 'projets'],
      action = 'Voir',
      moreHref,
      fallbackImg,
    } = opts;
    const count = items.length;
    const last = Math.max(count - 1, 0);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── DOM ── */
    root.textContent = '';
    root.classList.add('ww');

    const stage = el('div', 'ww-stage');
    stage.tabIndex = 0;
    stage.setAttribute('aria-label', 'Projets : flèches haut et bas pour naviguer');
    const wheel = el('ul', 'ww-wheel');
    const cards = items.map((item, i) => {
      const li = el('li', 'ww-card');
      const face = el('a', 'ww-face');
      face.href = item.href || '#';
      face.target = '_blank';
      face.rel = 'noopener noreferrer';
      face.draggable = false;
      const img = el('img');
      img.src = item.src;
      img.alt = item.title;
      img.decoding = 'async';
      img.draggable = false;
      if (fallbackImg) img.addEventListener('error', () => { img.src = fallbackImg; }, { once: true });
      face.append(img);
      if (action && item.href) {
        const pill = el('span', 'ww-action');
        pill.innerHTML = '<i class="ph ph-arrow-up-right" aria-hidden="true"></i>';
        pill.append(action);
        face.append(pill);
      }
      // Une carte qui n'est pas de face ne s'ouvre pas : on la fait tourner
      // jusqu'à l'avant. Seule la carte de face mène au projet.
      face.addEventListener('click', (e) => {
        if (!isFront(i)) { e.preventDefault(); go(i); }
      });
      li.append(face);
      wheel.append(li);
      return li;
    });
    stage.append(wheel);

    const ringLabel = el('div', 'ww-label');
    ringLabel.setAttribute('aria-hidden', 'true');
    ringLabel.append(el('span', null, label[0]), el('em', null, label[1]));

    const info = el('div', 'ww-info');
    info.setAttribute('aria-live', 'polite');
    const infoCount = el('span', 'ww-count');
    const infoTitle = el('h3', 'ww-title');
    const infoTags = el('div', 'ww-tags');
    const infoLink = el('a', 'ww-link');
    infoLink.target = '_blank';
    infoLink.rel = 'noopener noreferrer';
    infoLink.innerHTML = 'Voir le projet <i class="ph ph-arrow-up-right" aria-hidden="true"></i>';
    info.append(infoCount, infoTitle, infoTags, infoLink);

    const index = el('ol', 'ww-index');
    const indexBtns = items.map((item, i) => {
      const li = el('li');
      const btn = el('button', null, item.title);
      btn.type = 'button';
      btn.addEventListener('click', () => go(i));
      li.append(btn);
      index.append(li);
      return btn;
    });

    root.append(stage, ringLabel, info, index);
    if (moreHref) {
      const more = el('a', 'ww-more');
      more.href = moreHref;
      more.target = '_blank';
      more.rel = 'noopener noreferrer';
      more.innerHTML = 'Tout voir sur GitHub <i class="ph ph-arrow-up-right" aria-hidden="true"></i>';
      root.append(more);
    }

    /* ── état ── */
    let turn = 0;
    let target = 0;
    let active = -1;
    let raf = 0;
    let metrics = null;
    // Par défaut (pas de ScrollTrigger) on pilote `target` directement.
    let go = (i) => setTarget(i + 1);

    const isFront = (i) => i === active && turn > 0.98 && Math.abs(turn - 1 - i) < 0.15;

    function measure() {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      const mobile = w < MOBILE_BP;
      const cardW = Math.min(h * (mobile ? CARD_H_MOBILE : CARD_H) * CARD_RATIO, w * (mobile ? CARD_MAX_W_MOBILE : CARD_MAX_W));
      const cardH = cardW / CARD_RATIO;
      const ringR = cardH * RING_R;
      metrics = {
        cardW, cardH, ringR,
        drumR: cardH * DRUM,
        bow: cardH * BOW,
        // Réduit les cartes de l'anneau jusqu'à ce qu'il se lise comme une
        // boucle fermée, quel que soit le nombre de projets.
        ringScale: count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1,
      };
      stage.style.perspective = `${cardH * LENS}px`;
      root.style.setProperty('--ww-fs', `${Math.max(22, cardH * TITLE)}px`);
      for (const card of cards) {
        card.style.width = `${cardW}px`;
        card.style.height = `${cardH}px`;
        card.style.marginLeft = `${-cardW / 2}px`;
        card.style.marginTop = `${-cardH / 2}px`;
      }
      draw();
    }

    function setActive(i) {
      if (i === active) return;
      active = i;
      const item = items[i];
      infoCount.textContent = `${pad(i + 1)} / ${pad(count)}`;
      infoTitle.textContent = item.title;
      infoTags.textContent = '';
      for (const t of [item.year, ...(item.tech || [])].filter(Boolean)) {
        infoTags.append(el('span', 'tag', t));
      }
      infoLink.hidden = !item.href;
      if (item.href) infoLink.href = item.href;
      indexBtns.forEach((b, j) => b.toggleAttribute('aria-current', j === i));
      // relance l'apparition du titre à chaque changement de projet
      info.classList.remove('is-swap');
      void info.offsetWidth;
      info.classList.add('is-swap');
    }

    // Une passe : écrit tous les transforms pour la valeur actuelle de `turn`.
    function draw() {
      if (!metrics) return;
      const { ringR, ringScale, drumR, bow } = metrics;
      const m = clamp(turn, 0, 1);
      const pos = Math.max(0, turn - 1);

      // Le tambour est reculé pour que sa face avant tombe sur le plan de
      // l'écran. Ce recul doit arriver avec le tambour, sinon l'anneau
      // serait rendu au fond de la perspective, à moitié de sa taille.
      wheel.style.transform = `translateZ(${-m * drumR}px)`;

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const card = cards[i];
        card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m);
        // Masqué à la distance, pas à l'angle : à un tour complet la face
        // arrière revient vers nous et s'empilerait sur le point de fuite.
        const culled = m > 0.5 && Math.abs(d) > CULL;
        card.style.opacity = culled ? '0' : '1';
        card.style.visibility = culled ? 'hidden' : '';
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        card.firstElementChild.style.transform = `scale(${lerp(ringScale, 1, m)})`;
        card.firstElementChild.tabIndex = i === Math.round(pos) && m > 0.5 ? 0 : -1;
      }

      ringLabel.style.opacity = String(1 - m);
      info.style.opacity = String(m);
      info.style.visibility = m < 0.05 ? 'hidden' : '';
      root.classList.toggle('is-ring', m < 0.5);
      setActive(clamp(Math.round(pos), 0, last));
    }

    // La boucle ne tourne que tant que `turn` n'a pas rejoint `target`.
    function tick() {
      raf = 0;
      const gap = target - turn;
      if (Math.abs(gap) < 0.0005) turn = target;
      else turn += gap * (reduced ? 1 : EASE);
      draw();
      if (turn !== target) raf = requestAnimationFrame(tick);
    }

    function setTarget(next) {
      target = clamp(next, 0, last + 1);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    stage.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const current = Math.round(target) - 1;
      go(clamp(current + (e.key === 'ArrowDown' ? 1 : -1), 0, last));
    });

    new ResizeObserver(measure).observe(stage);
    measure();

    /**
     * Relie la roue au scroll : la section est épinglée et sa progression
     * (0 → 1) devient `turn` (0 → count). À l'arrêt du scroll, la roue se
     * cale sur le projet le plus proche au lieu de rester entre deux cartes.
     */
    function bindScroll(ScrollTrigger, lenis) {
      if (!ScrollTrigger || !count) return;
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${window.innerHeight * SCROLL_PER_ITEM * count}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setTarget(self.progress * count),
      });

      const scrollToTurn = (t) => {
        const y = st.start + (st.end - st.start) * (t / count);
        if (lenis) lenis.scrollTo(y, { duration: reduced ? 0 : 0.9, immediate: reduced });
        else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
      };
      go = (i) => scrollToTurn(clamp(i, 0, last) + 1);

      ScrollTrigger.addEventListener('scrollEnd', () => {
        if (!st.isActive) return;
        const t = st.progress * count;
        const snapped = Math.round(t);
        if (Math.abs(t - snapped) > 0.02) scrollToTurn(snapped);
      });
    }

    return { bindScroll };
  }

  window.WorksWheel = { mount };
})();
