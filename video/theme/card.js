// Critter: the paper fades in, the critter pops up on the left and then bobs
// gently, two hairlines draw in, and the title settles beside the critter.
(() => {
  const cfg = () => window.__demoConfig ?? {};
  const theme = () => cfg().theme ?? {};
  const colors = () => theme().colors ?? {};
  const base = () => theme().options?.base ?? '';
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // @font-face does not work inside a shadow root: add the fonts to the page once.
  function fonts() {
    if (document.getElementById('critter-fonts')) return;
    const s = document.createElement('style');
    s.id = 'critter-fonts';
    s.textContent = `
@font-face{font-family:"Source Serif 4 Critter";font-style:normal;font-weight:200 900;src:url(${base()}fonts/source-serif-4-latin-opsz-normal.woff2) format("woff2")}
@font-face{font-family:"Source Serif 4 Critter";font-style:italic;font-weight:200 900;src:url(${base()}fonts/source-serif-4-latin-opsz-italic.woff2) format("woff2")}
@font-face{font-family:"IBM Plex Mono Critter";font-weight:400;src:url(${base()}fonts/ibm-plex-mono-latin-400-normal.woff2) format("woff2")}`;
    document.head.append(s);
  }

  // o.keep: the next card follows this one, so the paper stays when the words
  // and the critter leave. o.afterCard: this card follows one, so its paper is
  // already up and only its content plays in.
  function style(B, out, o = {}) {
    const T = colors(), F = theme().fonts ?? {};
    // The exit plays the entry backwards in two beats: the critter hops away,
    // the words lift and fade, the hairlines draw back, then the paper slides up and fades.
    // Each starts a little after the one before, so the exit reads.
    const exit = (anim) => (out < Infinity ? `, ${anim}` : '');
    // The paper: it fades in unless a card is already up (o.afterCard), and it
    // slides up and off unless the next card keeps it (o.keep) or it is the
    // end card (out is Infinity). One list, so a card after a card still leaves.
    const paper = [];
    if (!o.afterCard) paper.push(`demoFadeIn ${0.8 * B}ms ease forwards`);
    if (!o.keep && out < Infinity) paper.push(`demoPaperOut ${1.15 * B}ms cubic-bezier(.55,0,.35,1) ${out + 0.8 * B}ms forwards`);
    const enter = `opacity:${o.afterCard ? 1 : 0}`;
    const leave = paper.length ? `;animation:${paper.join(', ')}` : '';
    return `<style>
:host{position:fixed;inset:0;z-index:2147483647;pointer-events:none}
.demo{position:absolute;inset:0;font-family:${F.serif};background:${T.bg};color:${T.text};${enter}${leave}}
.demo .grain{position:absolute;inset:0;opacity:.3;mix-blend-mode:multiply}
.demo .card{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:min(88px,6vw);padding:0 8vw}
.demo .card.stack{flex-direction:column;gap:min(28px,2.4vw);text-align:center}
.demo .art{flex:none;width:min(520px,32vw);height:min(520px,32vw);display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(28px) scale(.86) rotate(-3deg);animation:demoPop ${1.1 * B}ms cubic-bezier(.34,1.56,.64,1) ${0.5 * B}ms forwards${exit(`demoHop ${0.95 * B}ms linear ${out + 0.1 * B}ms forwards`)}}
.demo .card.stack .art{width:min(300px,22vw);height:min(300px,22vw)}
.demo .art img{max-width:100%;max-height:100%;animation:demoBob ${4 * B}ms ease-in-out ${1.6 * B}ms infinite alternate}
.demo .text{display:flex;flex-direction:column;align-items:flex-start;gap:min(18px,1.6vw);max-width:min(900px,50vw)}
.demo .card.stack .text{align-items:center;max-width:80vw}
.demo .rule{width:100%;min-width:min(560px,36vw);height:1.5px;background:${T.rule};transform:scaleX(0);transform-origin:left;animation:demoRule ${1.2 * B}ms cubic-bezier(.6,0,.2,1) ${0.7 * B}ms forwards${exit(`demoRuleOut ${0.9 * B}ms cubic-bezier(.6,0,.2,1) ${out}ms forwards`)}}
.demo .card.stack .rule{transform-origin:center}
.demo .num{font-family:${F.mono};font-size:min(22px,1.6vw);letter-spacing:.32em;text-transform:uppercase;color:${T.sky};opacity:0;animation:demoFade ${B}ms ease ${B}ms forwards${exit(`demoLift ${0.7 * B}ms ease-in ${out}ms forwards`)}}
.demo h1{margin:0;font-size:min(108px,6.8vw);line-height:1.04;font-weight:560;font-variation-settings:"opsz" 60;letter-spacing:-.015em;opacity:0;transform:translateY(10px);animation:demoSettle ${1.4 * B}ms ease ${1.1 * B}ms forwards${exit(`demoLift ${0.8 * B}ms ease-in ${out + 0.1 * B}ms forwards`)}}
.demo p{margin:0;font-size:min(34px,2.4vw);font-style:italic;color:${T.muted};opacity:0;animation:demoFade ${1.2 * B}ms ease ${1.7 * B}ms forwards${exit(`demoLift ${0.7 * B}ms ease-in ${out + 0.2 * B}ms forwards`)}}
.demo .url{font-family:${F.mono};font-size:min(30px,2.2vw);color:${T.accent};opacity:0;animation:demoFade ${1.2 * B}ms ease ${1.7 * B}ms forwards}
.demo .lines{display:flex;flex-direction:column;gap:8px;font-family:${F.mono};font-size:min(24px,1.8vw);color:${T.muted};opacity:0;animation:demoFade ${1.2 * B}ms ease ${2.1 * B}ms forwards}
@keyframes demoFadeIn{to{opacity:1}}
@keyframes demoFadeOut{to{opacity:0}}
@keyframes demoPaperOut{from{opacity:1;transform:none}60%{opacity:.92}to{opacity:.35;transform:translateY(-100%)}}
@keyframes demoFade{to{opacity:1}}
@keyframes demoSettle{to{opacity:1;transform:none}}
@keyframes demoRule{to{transform:scaleX(1)}}
@keyframes demoPop{to{opacity:1;transform:none}}
@keyframes demoHop{0%{opacity:1;transform:none;animation-timing-function:ease-out}25%{opacity:1;transform:translateY(10px) scale(1.06,.9);animation-timing-function:cubic-bezier(.3,0,.8,.4)}100%{opacity:0;transform:translateY(-140px) scale(.92,1.06) rotate(6deg)}}
@keyframes demoLift{from{opacity:1;transform:none}to{opacity:0;transform:translateY(-14px)}}
@keyframes demoRuleOut{from{transform:scaleX(1)}to{transform:scaleX(0)}}
@keyframes demoBob{from{transform:translateY(0) rotate(0)}to{transform:translateY(-10px) rotate(1.2deg)}}
</style>
<svg class="grain" width="100%" height="100%"><filter id="demoGrain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .48 0 0 0 0 .42 0 0 0 .16 0"/></filter><rect width="100%" height="100%" filter="url(#demoGrain)"/></svg>`;
  }
  const art = (name) => (name ? `<div class="art"><img src="${esc(base())}critters/${esc(name)}.webp" alt=""></div>` : '');
  // The card lives in a shadow root, so the page's own CSS cannot restyle it.
  function mount(html) {
    fonts();
    document.getElementById('demo-transition')?.remove();
    const el = document.createElement('div');
    el.id = 'demo-transition';
    const i = html.indexOf('</style>') + 8;
    el.attachShadow({ mode: 'open' }).innerHTML = `${html.slice(0, i)}<div class="demo">${html.slice(i)}</div>`;
    document.body.append(el);
  }

  window.__demo = {
    transition(step, title, subtitle, holdMs, o = {}) {
      const B = cfg().beat ?? 510;
      holdMs ??= 4 * B;
      const IN = 2 * B, OUT = 2 * B;
      mount(`${style(B, IN + holdMs, o)}
<div class="card">
  ${art(o.critter)}
  <div class="text">
    <div class="rule"></div>
    ${step ? `<div class="num">No. ${esc(step)}</div>` : ''}
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    <div class="rule"></div>
  </div>
</div>`);
      return IN + holdMs + OUT;
    },
    end({ title, subtitle, url, lines = [] }, holdMs, o = {}) {
      const B = cfg().beat ?? 510;
      mount(`${style(B, Infinity, o)}
<div class="card stack">
  ${art(o.critter)}
  <div class="text">
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    <div class="rule"></div>
    ${url ? `<div class="url">${esc(url)}</div>` : ''}
    ${lines.length ? `<div class="lines">${lines.map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : ''}
  </div>
</div>`);
      return 2 * B + (holdMs ?? 4 * B);
    },
    keys(label) {
      const T = colors();
      document.getElementById('demo-keys')?.remove();
      const el = document.createElement('div');
      el.id = 'demo-keys';
      el.textContent = label;
      el.setAttribute('style', `position:fixed;left:50%;bottom:36px;transform:translateX(-50%);z-index:2147483647;pointer-events:none;padding:10px 22px;border-radius:8px;background:${T.bg};color:${T.text};font:500 22px ${theme().fonts?.serif};border:1px solid ${T.rule};transition:opacity .3s`);
      document.body.append(el);
      setTimeout(() => (el.style.opacity = '0'), 1100);
      setTimeout(() => el.remove(), 1500);
    },
  };
})();
