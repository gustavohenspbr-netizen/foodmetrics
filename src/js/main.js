// ===== HEADER SCROLL =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
hamburger?.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('.nav__link').forEach(l => l.addEventListener('click', () => nav.classList.remove('open')));

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (i % 4) * 120);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
const easeOut = t => 1 - Math.pow(1 - t, 3);
const animateCounter = (el) => {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(easeOut(p) * target).toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      e.target._obs?.unobserve(e.target);
    }
  });
}, { threshold: 0.5 }).observe = (() => {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.numero__val').forEach(el => obs.observe(el));
  return obs.observe.bind(obs);
})();

// ===== TESTIMONIALS SLIDER (3 visible) =====
const slider = document.getElementById('depoimentos-slider');
const dotsContainer = document.getElementById('dep-dots');
const prevBtn = document.getElementById('dep-prev');
const nextBtn = document.getElementById('dep-next');

if (slider) {
  const slides = Array.from(slider.querySelectorAll('.slide'));
  let current = 0;
  let autoTimer;

  function getVisible() {
    return window.innerWidth < 768 ? 1 : 3;
  }

  function getMax() {
    return Math.max(0, slides.length - getVisible());
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    const total = getMax() + 1;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) =>
      d.classList.toggle('active', i === current));
  }

  function goTo(n) {
    const max = getMax();
    current = Math.max(0, Math.min(n, max));
    const slideW = slides[0].offsetWidth;
    const gap = 24;
    slider.style.transform = `translateX(-${current * (slideW + gap)}px)`;
    updateDots();
  }

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= getMax() ? 0 : current + 1);
    }, 5000);
  }

  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  // Touch/swipe
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
  });

  // Resize recalculate
  window.addEventListener('resize', () => {
    current = Math.min(current, getMax());
    buildDots();
    goTo(current);
  });

  buildDots();
  goTo(0);
  startAuto();
}

// ===== ICON HOVER ANIMATIONS =====
document.querySelectorAll('.icon-anim').forEach(icon => {
  icon.addEventListener('mouseenter', () => icon.classList.add('icon-anim--play'));
  icon.addEventListener('mouseleave', () => {
    icon.classList.remove('icon-anim--play');
    // Force reflow so animation restarts next hover
    void icon.offsetWidth;
  });
});

// ===== PARALLAX ON HERO IMAGE =====
const heroImg = document.querySelector('.hero__img');
if (heroImg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroImg.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });
}

// ===== FAQ ACCORDION LOGIC =====
const faqItems = document.querySelectorAll('.faq__item');
faqItems.forEach(item => {
  item.addEventListener('toggle', (e) => {
    if (item.open) {
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.open) {
          otherItem.open = false;
        }
      });
    }
  });
});
