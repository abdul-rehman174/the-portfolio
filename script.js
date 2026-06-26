/* ============================================
   ABDUL REHMAN — PORTFOLIO  ·  VIBRANT EDITION
   GSAP + Lenis · lightweight CSS visuals
   ============================================ */

const hasGSAP = typeof gsap !== 'undefined';
const hasLenis = typeof Lenis !== 'undefined';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!hasGSAP) document.body.classList.add('no-gsap');

/* Always start at the top — stop the browser restoring the old scroll position */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function forceTop() {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  if (lenis) lenis.scrollTo(0, { immediate: true });
}
window.addEventListener('load', () => requestAnimationFrame(forceTop));

/* ---------- Year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================
   LENIS — smooth scroll
   ============================================ */
let lenis = null;
function initLenis() {
  if (!hasLenis || reduced) return;
  lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1.1, smoothWheel: true, syncTouch: false });
  if (!location.hash) lenis.scrollTo(0, { immediate: true });
  if (hasGSAP) {
    lenis.on('scroll', () => ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  // progress bar
  lenis.on('scroll', ({ scroll, limit }) => {
    document.querySelector('.scroll-progress').style.width = (scroll / limit * 100) + '%';
  });
}

/* ============================================
   SPLIT TEXT helpers
   ============================================ */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = '';
  return [...text].map(ch => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch === ' ' ? ' ' : ch;
    el.appendChild(span);
    return span;
  });
}
function splitWords(el) {
  const words = el.textContent.split(' ');
  el.textContent = '';
  return words.map((w, i) => {
    const wrap = document.createElement('span');
    wrap.style.display = 'inline-block';
    wrap.style.overflow = 'hidden';
    const inner = document.createElement('span');
    inner.style.display = 'inline-block';
    inner.style.willChange = 'transform';
    inner.textContent = w;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    return inner;
  });
}

/* ============================================
   GSAP animations
   ============================================ */
function initGSAP() {
  if (!hasGSAP) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero title — char reveal
  document.querySelectorAll('.hero-title [data-split]').forEach((line, li) => {
    const chars = splitChars(line);
    gsap.set(chars, { yPercent: 120, opacity: 0 });
    gsap.to(chars, {
      yPercent: 0, opacity: 1, duration: 1, ease: 'power4.out',
      stagger: 0.03, delay: 1.3 + li * 0.1,
    });
  });

  // Hero sub + actions + stats
  gsap.from('.hero-badge, .hero-sub, .hero-actions, .hero-stats', {
    y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 1.5,
  });

  // Section titles — word reveal on scroll
  document.querySelectorAll('[data-split-lines]').forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 110 });
    gsap.to(words, {
      yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.04,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Eyebrows
  gsap.utils.toArray('.eyebrow').forEach((el) => {
    gsap.from(el, { opacity: 0, x: -20, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' } });
  });

  // Fade-up elements
  gsap.utils.toArray('.fade-up').forEach((el) => {
    gsap.to(el, {
      y: 0, opacity: 1, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Marquee now runs as a pure CSS animation (no per-scroll-frame work)

  // Counters
  gsap.utils.toArray('.num[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      onUpdate: () => { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });
  // (removed scroll-scrubbed parallax — it ran work on every scroll frame and caused jank)
}

/* ============================================
   Cursor parallax — background + hero react to the mouse
   ============================================ */
function initParallax() {
  if (reduced || !window.matchMedia('(hover: hover)').matches) return;
  const mesh = document.querySelector('.bg-mesh');
  const hero = document.querySelector('.hero-inner');
  if (!mesh && !hero) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, t = 0;
  window.addEventListener('mousemove', (e) => {
    tx = e.clientX / window.innerWidth - 0.5;   // -0.5 .. 0.5
    ty = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });
  (function loop() {
    t += 0.006;
    cx += (tx - cx) * 0.07;
    cy += (ty - cy) * 0.07;
    if (mesh) {
      // cursor moves the gradient position a lot (clearly visible) + gentle idle breathing
      const px = 50 + cx * 70 + Math.sin(t) * 6;
      const py = 50 + cy * 70 + Math.cos(t * 0.8) * 6;
      mesh.style.backgroundPosition = `${px}% ${py}%`;
    }
    if (hero) hero.style.transform = `translate(${cx * -22}px, ${cy * -16}px)`;
    requestAnimationFrame(loop);
  })();
}

/* ============================================
   Custom cursor
   ============================================ */
function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('[data-cursor]').forEach(el => {
    const type = el.getAttribute('data-cursor');
    el.addEventListener('mouseenter', () => { ring.classList.add('hover'); if (type === 'view') ring.classList.add('view'); });
    el.addEventListener('mouseleave', () => ring.classList.remove('hover', 'view'));
  });
}

/* ============================================
   Magnetic buttons
   ============================================ */
function initMagnetic() {
  if (!window.matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    const strength = 0.35;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * strength;
      const y = (e.clientY - r.top - r.height / 2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    el.style.transition = 'transform .4s cubic-bezier(0.16,1,0.3,1)';
  });
}

/* ============================================
   Nav, mobile menu, project glow, anchors
   ============================================ */
function initUI() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

  // fallback progress bar (if no lenis)
  if (!lenis) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      document.querySelector('.scroll-progress').style.width =
        (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    }, { passive: true });
  }

  // mobile menu
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  toggle?.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('active', open);
    lenis && (open ? lenis.stop() : lenis.start());
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); toggle.classList.remove('active'); lenis && lenis.start();
  }));

  // smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -10 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // project glow follow
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // fallback reveal if no GSAP
  if (!hasGSAP) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
  }
}

/* ============================================
   Boot
   ============================================ */
function boot() {
  window.__booted = true;
  setTimeout(() => document.querySelector('.loader')?.classList.add('done'), 900);
  try { initLenis(); } catch (e) { console.warn('Lenis skipped', e); }
  try { initGSAP(); } catch (e) { console.warn('GSAP skipped', e); }
  try { initCursor(); } catch (e) {}
  try { initMagnetic(); } catch (e) {}
  try { initParallax(); } catch (e) {}
  try { initUI(); } catch (e) {}
  forceTop();
  // safety: if GSAP isn't present, make sure everything is visible
  if (!hasGSAP) {
    document.documentElement.classList.remove('anim');
    document.querySelectorAll('.fade-up').forEach(el => el.classList.add('in'));
  }
}

// defer guarantees the DOM is ready; run as soon as the script executes
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
