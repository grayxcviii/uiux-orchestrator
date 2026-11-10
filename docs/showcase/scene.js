/* VELTORA Noir: deterministic photographic campaign, not a rotating 3D model. */
(() => {
  'use strict';
  const capture = new URLSearchParams(location.search).has('capture');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 10;
  let paused = reduced.matches || capture, time = 0, last = 0;
  const hero = document.querySelector('.hero');
  const craft = document.querySelector('.craft');
  const photograph = document.querySelector('#perfume');
  const ease = x => { x = Math.max(0, Math.min(1, x)); return x*x*x*(x*(x*6-15)+10); };
  function renderAt(seconds) {
    time = ((seconds % duration) + duration) % duration;
    const phase = time / duration * Math.PI * 2;
    const chapter = ease((time-3)/1.2) * (1-ease((time-7)/1.3));
    const mobile = innerWidth <= 760;
    hero.style.opacity = 1-ease(chapter*2.15);
    hero.style.transform = `translateY(${-chapter*16}px)`;
    hero.style.pointerEvents = chapter>.5 ? 'none' : 'auto';
    hero.inert = chapter>.5;
    hero.setAttribute('aria-hidden', chapter>.5);
    craft.style.opacity = ease((chapter-.5)*2);
    craft.style.transform = `translateY(${(1-chapter)*18}px)`;
    craft.inert = chapter<=.5;
    craft.setAttribute('aria-hidden', chapter<=.5);
    document.querySelectorAll('nav [data-chapter]').forEach(b => b.setAttribute('aria-current', Number(b.dataset.chapter)===(chapter>.5?1:0)));
    // Gentle photographic push-in with a closed camera path. No invented 3D rotation.
    const push = 1 + chapter*(mobile?.035:.11) + .014*(1-Math.cos(phase));
    photograph.style.transform = `translateX(-50%) translate(${Math.sin(phase)*(mobile?2:9)}px,${-chapter*(mobile?3:12)}px) scale(${push})`;
    photograph.style.filter = `brightness(${1+.035*Math.sin(phase)})`;
    document.querySelector('.product-caption').style.opacity = 1-chapter;
    document.querySelector('#chapter-number').textContent = chapter>.5?'02':'01';
    document.querySelector('#progress').style.transform = `scaleX(${.25+.75*(.5-.5*Math.cos(phase))})`;
  }
  function updatePlayback() {
    document.querySelector('#playback').setAttribute('aria-label', paused?'Play animation':'Pause animation');
    document.querySelector('.play-icon').textContent = paused?'▷':'Ⅱ';
    document.querySelector('.play-label').textContent = paused?'PLAY FILM':'PAUSE FILM';
  }
  document.querySelector('#playback').addEventListener('click', () => { paused=!paused; updatePlayback(); });
  document.querySelectorAll('[data-chapter]').forEach(b => b.addEventListener('click', () => { renderAt(Number(b.dataset.chapter)===1?5.4:0); paused=true; updatePlayback(); }));
  document.querySelector('.wordmark').addEventListener('click', e => { e.preventDefault(); renderAt(0); });
  reduced.addEventListener('change', () => { paused=reduced.matches; if(paused) renderAt(0); updatePlayback(); });
  addEventListener('resize', () => renderAt(time));
  function tick(now) {
    const delta=last?Math.min((now-last)/1000,.05):0;
    last=now;
    if(!paused&&!document.hidden) renderAt(time+delta);
    requestAnimationFrame(tick);
  }
  window.veltora = { renderAt, duration, get paused(){return paused;}, ready:photograph.decode() };
  renderAt(0); updatePlayback();
  if(!capture) requestAnimationFrame(tick);
})();
