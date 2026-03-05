/* ═══════════════════════════════════════════════════════════════
   CYBERSECURITY PORTFOLIO — SCRIPT.JS
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCanvas();
  initCursor();
  initNavbar();
  initHamburger();
  initTyped();
  initCounters();
  initReveal();
  initActiveNav();
});

/* ════════════════════════════════════════════
   1. THEME TOGGLE (Dark ↔ Light Cream)
════════════════════════════════════════════ */
function initTheme() {
  const root      = document.documentElement;
  const btn       = document.getElementById('theme-toggle');
  const label     = btn.querySelector('.theme-label');
  const icon      = btn.querySelector('.theme-icon');
  const STORAGE   = 'portfolio-theme';

  // Restore saved preference
  const saved = localStorage.getItem(STORAGE) || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE, theme);
    if (theme === 'dark') {
      label.textContent = 'LIGHT';
      icon.textContent  = '◑';
    } else {
      label.textContent = 'DARK';
      icon.textContent  = '◐';
    }
    // Rebuild canvas for theme
    rebuildCanvas(theme);
  }
}

/* ════════════════════════════════════════════
   2. ANIMATED CANVAS BACKGROUND
════════════════════════════════════════════ */
let canvasAnimId = null;

function rebuildCanvas(theme) {
  if (canvasAnimId) cancelAnimationFrame(canvasAnimId);
  initCanvas(theme);
}

function initCanvas(theme) {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');
  const isDark = (theme || document.documentElement.getAttribute('data-theme')) === 'dark';

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildParticles();
  }

  function buildParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => ({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.4 + 0.4,
      dx:  (Math.random() - 0.5) * 0.3,
      dy:  (Math.random() - 0.5) * 0.3,
      o:   Math.random() * 0.5 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw grid lines
    const gridColor = isDark ? 'rgba(0,255,231,0.03)' : 'rgba(10,122,110,0.04)';
    ctx.strokeStyle = gridColor;
    ctx.lineWidth   = 1;
    const STEP = 60;
    for (let x = 0; x < W; x += STEP) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += STEP) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Draw connecting lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.12;
          ctx.strokeStyle = isDark
            ? `rgba(0,255,231,${alpha})`
            : `rgba(10,122,110,${alpha * 0.6})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(0,255,231,${p.o})`
        : `rgba(10,122,110,${p.o * 0.7})`;
      ctx.fill();

      // Move
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    canvasAnimId = requestAnimationFrame(draw);
  }

  resize();
  window.removeEventListener('resize', resize);
  window.addEventListener('resize', resize);
  draw();
}

/* ════════════════════════════════════════════
   3. CUSTOM CURSOR (dark theme only)
════════════════════════════════════════════ */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
  });

  // Smooth ring follow
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  // Hover effect on interactive elements
  const targets = 'a, button, .cert-card, .project-card, .blog-card, .skill-tag';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'rgba(0,255,231,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(0,255,231,0.5)';
    });
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ════════════════════════════════════════════
   4. NAVBAR — scroll shrink + active links
════════════════════════════════════════════ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
  // Close on link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('open'));
  });
}

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
          if (l.getAttribute('href') === '#' + id) {
            l.style.color = 'var(--neon)';
          } else {
            l.style.color = '';
          }
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ════════════════════════════════════════════
   5. TYPED TEXT ANIMATION
════════════════════════════════════════════ */
function initTyped() {
  const el    = document.getElementById('typed-text');
  const lines = [
    'Cybersecurity Engineer',
    'Splunk SIEM / SOAR Specialist',
    'AI-Driven SOC Automation Expert',
    'Cloud Security Engineer',
    'Threat Hunter & Detection Engineer',
  ];
  let li = 0, ci = 0, deleting = false;
  const PAUSE_END = 1800, PAUSE_START = 400, SPEED_TYPE = 60, SPEED_DEL = 35;

  function tick() {
    const current = lines[li];
    if (!deleting) {
      el.textContent = current.slice(0, ci + 1);
      ci++;
      if (ci === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
    } else {
      el.textContent = current.slice(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        li = (li + 1) % lines.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
    }
    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }
  tick();
}

/* ════════════════════════════════════════════
   6. COUNTER ANIMATION
════════════════════════════════════════════ */
function initCounters() {
  const els = document.querySelectorAll('.stat-num[data-count]');
  let triggered = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      els.forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        let current  = 0;
        const step   = Math.ceil(target / 40);
        const timer  = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(timer);
        }, 40);
      });
    }
  }, { threshold: 0.5 });

  const hero = document.getElementById('hero');
  if (hero) observer.observe(hero);
}

/* ════════════════════════════════════════════
   7. SCROLL REVEAL
════════════════════════════════════════════ */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
        const delay    = siblings.indexOf(entry.target) * 80;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════
   8. SMOOTH SCROLL for anchor links
════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ════════════════════════════════════════════
   9. NAV CTA — scroll to contact
════════════════════════════════════════════ */
document.querySelector('.nav-cta')?.addEventListener('click', () => {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
});

/* ════════════════════════════════════════════
   10. TERMINAL TYPEWRITER (About section)
════════════════════════════════════════════ */
window.addEventListener('load', () => {
  const termLines = document.querySelectorAll('#terminal-body .t-line, #terminal-body .t-output');
  termLines.forEach((line, i) => {
    line.style.opacity = '0';
    line.style.transform = 'translateX(-10px)';
    line.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => {
      line.style.opacity  = '1';
      line.style.transform = 'translateX(0)';
    }, 200 + i * 150);
  });
});

/* ════════════════════════════════════════════
   11. CERT CARD — credly link guard
════════════════════════════════════════════ */
document.querySelectorAll('.cert-card').forEach(card => {
  card.addEventListener('click', e => {
    const href = card.getAttribute('href');
    // If URL is still the placeholder, prevent navigation
    if (!href || href.includes('your-cert-link')) {
      e.preventDefault();
      const body = card.querySelector('.cert-body h3');
      showToast(`Update the Credly URL for "${body?.textContent || 'this cert'}" in index.html`);
    }
  });
});

/* ════════════════════════════════════════════
   12. TOAST NOTIFICATION
════════════════════════════════════════════ */
function showToast(msg) {
  let toast = document.getElementById('portfolio-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '2rem',
      left:         '50%',
      transform:    'translateX(-50%) translateY(20px)',
      background:   'var(--card-bg)',
      color:        'var(--neon)',
      border:       '1px solid var(--card-border)',
      fontFamily:   "'Share Tech Mono', monospace",
      fontSize:     '0.78rem',
      padding:      '0.75rem 1.5rem',
      borderRadius: '6px',
      zIndex:       '9999',
      backdropFilter: 'blur(20px)',
      opacity:      '0',
      transition:   'all 0.3s',
      maxWidth:     '90vw',
      textAlign:    'center',
      letterSpacing: '0.05em',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = '⚠ ' + msg;
  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3500);
}
