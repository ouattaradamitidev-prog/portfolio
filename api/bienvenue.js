/* ══════════════════════════════════════════════════════════
   Relais d'alerte de visite (fonction serverless Vercel)
   Appelé par script.js sur le même domaine : les bloqueurs de pub ne
   le voient pas comme un traqueur. Localise le visiteur côté serveur
   (en-têtes Vercel + ipwho.is) puis envoie l'e-mail via Resend.
   Variables d'environnement à définir dans Vercel :
     RESEND_API_KEY  clé API Resend (re_...)
     VISIT_EMAIL_TO  adresse qui reçoit les alertes
   ══════════════════════════════════════════════════════════ */
const ALLOWED_HOSTS = ['damel.vercel.app'];
const BOT_RE = /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp/i;

const esc = v => String(v == null ? '' : v)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (v, n = 300) => String(v == null ? '' : v).slice(0, n);
const header = (req, name) => {
  const v = req.headers[name];
  if (!v) return '';
  try { return decodeURIComponent(v); } catch (e) { return v; }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  /* n'accepte que les appels venant du portfolio */
  const origin = req.headers.origin || req.headers.referer || '';
  let host = '';
  try { host = new URL(origin).hostname; } catch (e) {}
  if (!ALLOWED_HOSTS.includes(host)) return res.status(403).end();

  const ua = req.headers['user-agent'] || '';
  if (BOT_RE.test(ua)) return res.status(204).end();

  const { RESEND_API_KEY, VISIT_EMAIL_TO } = process.env;
  if (!RESEND_API_KEY || !VISIT_EMAIL_TO) return res.status(503).json({ error: 'non configuré' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  /* localisation : ipwho.is (plus précis en Côte d'Ivoire), sinon Vercel */
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.headers['x-real-ip'] || '';
  let who = {};
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: ctrl.signal });
    clearTimeout(t);
    const j = await r.json();
    if (j.success) who = j;
  } catch (e) {}
  const geo = {
    city: who.city || header(req, 'x-vercel-ip-city'),
    region: who.region || header(req, 'x-vercel-ip-country-region'),
    country: who.country || header(req, 'x-vercel-ip-country'),
    postal: who.postal || header(req, 'x-vercel-ip-postal-code'),
    lat: who.latitude != null ? who.latitude : header(req, 'x-vercel-ip-latitude'),
    lon: who.longitude != null ? who.longitude : header(req, 'x-vercel-ip-longitude'),
    org: who.connection ? (who.connection.isp || who.connection.org) : '',
  };
  const lieu = [geo.city, geo.region, geo.country].filter(Boolean).join(', ') || 'Inconnue';
  const carte = geo.lat && geo.lon ? `https://www.google.com/maps?q=${geo.lat},${geo.lon}` : '';

  const count = Math.max(1, parseInt(body.count, 10) || 1);
  const device = clip(body.device, 40) || 'Inconnu';
  const when = new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Abidjan', dateStyle: 'full', timeStyle: 'medium' });

  const rows = [
    ['🕒 Date', when],
    ['👤 Visiteur', count > 1 ? `Revient (visite n°${count}, 1re visite le ${clip(body.first, 20)})` : 'Nouveau visiteur'],
    ['📍 Localisation', lieu + (geo.postal ? ` (${geo.postal})` : '')],
    ['🗺️ Carte', carte ? { href: carte, text: 'Voir sur Google Maps' } : 'Indisponible'],
    ['🌐 Adresse IP', ip || 'Inconnue'],
    ['📶 Opérateur', geo.org || 'Inconnu'],
    ['🔗 Provenance', clip(body.referrer) || 'Accès direct (lien tapé, favori ou appli)'],
    ['📣 Campagne', clip(body.utm, 150) || 'Aucune'],
    ['📄 Page', clip(body.page)],
    ['💻 Appareil', `${device} · ${clip(body.os, 30)} · ${clip(body.browser, 30)}`],
    ['🖥️ Écran', clip(body.screen, 60)],
    ['🗣️ Langue', clip(body.lang, 20)],
    ['⏰ Fuseau horaire', clip(body.tz, 60)],
    ['📡 Connexion', clip(body.conn, 20) || 'Inconnue'],
    ['🧾 User-Agent', clip(ua)],
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px">
<h2 style="margin:0 0 12px">👀 Nouvelle visite sur ton portfolio</h2>
<table cellpadding="8" style="border-collapse:collapse;width:100%;font-size:14px">
${rows.map(([k, v]) => `<tr style="border-bottom:1px solid #eee"><td style="white-space:nowrap;font-weight:bold;vertical-align:top">${esc(k)}</td><td>${
    typeof v === 'object' ? `<a href="${esc(v.href)}">${esc(v.text)}</a>` : esc(v)}</td></tr>`).join('\n')}
</table></div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Portfolio DAMEL <onboarding@resend.dev>',
        to: [VISIT_EMAIL_TO],
        subject: `👀 Visite portfolio : ${lieu} · ${device}${count > 1 ? ` (visite n°${count})` : ' (nouveau visiteur)'}`,
        html,
      }),
    });
    if (!r.ok) return res.status(502).json({ error: 'envoi refusé' });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'envoi impossible' });
  }
};
