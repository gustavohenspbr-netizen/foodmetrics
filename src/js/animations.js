import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(pointer: fine)").matches;
  const isDesktop = window.matchMedia("(min-width: 901px)").matches;

  // ============================================================
  // 1. Lenis Smooth Scroll
  // ============================================================
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // ============================================================
  // 2. CUSTOM CURSOR — RAF puro, sem GSAP, sem delay
  // ============================================================
  if (isFinePointer && !prefersReducedMotion) {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let rafId = null;
      let hasMoved = false;

      // Posiciona o cursor com translate3d direto — máxima performance
      function updateCursor() {
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        rafId = null;
      }

      // mousemove é nativo e síncrono — não passa pelo Lenis
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!hasMoved) {
          cursor.style.opacity = '1';
          hasMoved = true;
        }
        // RAF coalesce — atualiza no próximo frame, sem queue
        if (rafId === null) {
          rafId = requestAnimationFrame(updateCursor);
        }
      }, { passive: true });

      // Esconder quando sai da janela
      document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
      });
      document.addEventListener('mouseenter', () => {
        cursor.style.opacity = hasMoved ? '1' : '0';
      });

      // Hover states em elementos interativos
      const interactives = document.querySelectorAll('a, button, .btn, summary, [role="button"]');
      interactives.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
      });

      // Click feedback
      document.addEventListener('mousedown', () => cursor.classList.add('click'));
      document.addEventListener('mouseup', () => cursor.classList.remove('click'));

      cursor.style.opacity = '0';
      cursor.style.willChange = 'transform';

      // Magnetic buttons — efeito sutil no botão (não no cursor)
      const magneticBtns = document.querySelectorAll('.btn--primary, .btn--xl, .btn--xxl');
      magneticBtns.forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
          gsap.to(btn, { x, y, duration: 0.4, ease: 'power3.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        });
      });
    }
  }

  // ============================================================
  // 3. SCROLL PROGRESS BAR
  // ============================================================
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.min(100, (window.scrollY / max) * 100);
    progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // ============================================================
  // 4. FLOATING FOOD ICONS — parallax sutil
  // ============================================================
  const foodFloats = document.querySelector('.food-floats');
  if (foodFloats && !prefersReducedMotion && isDesktop) {
    requestAnimationFrame(() => foodFloats.classList.add('ready'));

    const floats = foodFloats.querySelectorAll('.food-float');
    floats.forEach((el, i) => {
      const speed = 0.05 + (i % 3) * 0.04;
      const rotateRange = 90 + i * 40;
      const direction = i % 2 === 0 ? 1 : -1;

      gsap.to(el, {
        y: -200 * speed * 10,
        rotation: rotateRange * direction,
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });

      // Float idle animation
      gsap.to(el, {
        y: '+=20',
        duration: 3 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });
  }

  // ============================================================
  // 5. GIANT BG TYPOGRAPHY (mantém o efeito atual)
  // ============================================================
  const injectGiantText = (selector, text) => {
    const section = document.querySelector(selector);
    if (section) {
      const bgText = document.createElement('div');
      bgText.className = 'bg-giant-text';
      bgText.textContent = text;
      section.appendChild(bgText);
      if (!prefersReducedMotion) {
        gsap.to(bgText, {
          yPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    }
  };
  injectGiantText('#solucao', 'METODOLOGIA');
  injectGiantText('#metodo-mc', 'MÁQUINA DE CLIENTES');

  // ============================================================
  // 6. LOADER
  // ============================================================
  const tlLoader = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
  tlLoader
    .to('.loader-logo', { opacity: 1, duration: 0.5, ease: 'power2.out' })
    .to('.loader-bar', { width: '100%', duration: 0.8, ease: 'power2.inOut' }, '-=0.2')
    .to('.page-loader', { yPercent: -100, duration: 0.8, ease: 'power3.inOut' })
    .fromTo(
      '#hero .hero__portrait-wrap',
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      '-=0.4'
    );

  // ============================================================
  // 7. HERO — pin scroll (mantém o atual, melhorado)
  // ============================================================
  if (!prefersReducedMotion) {
    const heroLeft = document.querySelector('.hero__left');
    const heroPortrait = document.querySelector('.hero__portrait-wrap');
    const heroSection = document.querySelector('#hero');

    const mm = gsap.matchMedia();

    if (heroSection && heroLeft && heroPortrait) {
      mm.add('(min-width: 901px)', () => {
        gsap.set(heroLeft, { opacity: 0, x: -50 });
        gsap.set(heroPortrait, { scale: 1.5, left: '50%', xPercent: -50, yPercent: -50 });

        ScrollTrigger.create({
          trigger: heroSection,
          start: 'top top',
          end: '+=120%',
          pin: true,
          animation: gsap.timeline()
            .to(heroPortrait, { left: '75%', scale: 1, xPercent: -50, yPercent: -50, ease: 'power2.inOut' }, 0)
            .to(heroLeft, { opacity: 1, x: 0, ease: 'power2.inOut' }, 0),
          scrub: 1,
        });
      });

      mm.add('(max-width: 900px)', () => {
        gsap.set(heroLeft, { opacity: 1, x: 0 });
        gsap.set(heroPortrait, { scale: 1, left: '50%', xPercent: -50, yPercent: 0 });
      });
    }

    // ============================================================
    // 8. MANIFESTO — parallax suave do burger (sem pin)
    // ============================================================
    const manifestoSection = document.querySelector('.manifesto');
    const manifestoBurger = document.querySelector('.manifesto__burger-wrap');
    const manifestoTextWrap = document.querySelector('.manifesto__text-wrap');
    const manifestoNotifs = document.querySelectorAll('.ifood-notif');

    if (manifestoSection && manifestoBurger && manifestoTextWrap) {
      mm.add('(min-width: 901px)', () => {
        // Burger entra com scale + fade conforme rola
        gsap.set(manifestoBurger, { opacity: 0, scale: 0.7, rotation: -15 });
        gsap.set(manifestoNotifs, { opacity: 0, y: 30, scale: 0.8 });

        // Burger reveal (acontece quando entra na viewport)
        gsap.to(manifestoBurger, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          ease: 'power3.out',
          duration: 1.4,
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        });

        // Parallax suave do burger conforme rola pela seção
        gsap.to(manifestoBurger, {
          yPercent: -15,
          rotation: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });

        // Texto desliza por baixo
        gsap.to(manifestoTextWrap, {
          opacity: 1,
          y: 0,
          ease: 'power3.out',
          duration: 1.2,
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 55%',
            toggleActions: 'play none none reverse',
          },
        });

        // Notifs aparecem em sequência depois do burger
        gsap.to(manifestoNotifs, {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.18,
          ease: 'back.out(1.6)',
          duration: 0.7,
          scrollTrigger: {
            trigger: manifestoSection,
            start: 'top 50%',
            toggleActions: 'play none none reverse',
          },
        });

        // Float idle no burger (sutil)
        gsap.to(manifestoBurger, {
          y: '+=15',
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 1.5,
        });
      });

      mm.add('(max-width: 900px)', () => {
        gsap.set(manifestoBurger, { opacity: 1, scale: 1, rotation: 0 });
        gsap.set(manifestoTextWrap, { opacity: 1, y: 0 });
        gsap.to(manifestoNotifs, {
          opacity: 1, y: 0, scale: 1, stagger: 0.15, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: manifestoBurger, start: 'top 60%' },
        });
      });
    }

    // ============================================================
    // 9. SCROLL REVEALS — mask + stagger fluido
    // ============================================================
    const sections = document.querySelectorAll('.section');
    sections.forEach((sec) => {
      gsap.set(sec, { opacity: 1 });
      const elementsToStagger = sec.querySelectorAll(
        '.section__title, .section__sub, .dore-card, .pilar, .estrategia-card, .estrategia-wide, .numero, .solucao__content > *, .glass-card.depoimento, .glass-card.faq__item'
      );
      if (elementsToStagger.length) {
        gsap.fromTo(
          elementsToStagger,
          { y: 60, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: sec, start: 'top 82%' },
          }
        );
      }
    });

    // ============================================================
    // 10. PARALLAX BG ORBS
    // ============================================================
    const bgOrbs = document.querySelectorAll('.orb');
    bgOrbs.forEach((orb) => {
      gsap.to(orb, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom top', scrub: true },
      });
    });

    // ============================================================
    // 11. CHART BARS
    // ============================================================
    const chartBars = document.querySelectorAll('.chart-bars .bar');
    if (chartBars.length) {
      gsap.fromTo(
        chartBars,
        { scaleY: 0, transformOrigin: 'bottom center' },
        {
          scaleY: 1,
          duration: 1,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: '.solucao__chart-wrap', start: 'top 80%' },
        }
      );
    }
  }

  // ============================================================
  // 12. NUMBER COUNTERS
  // ============================================================
  const counters = document.querySelectorAll('.numero__val, .solucao__img-badge-num, .stat__num');
  counters.forEach((counter) => {
    const targetText = counter.textContent;
    const targetNum = parseInt(targetText.replace(/\D/g, ''));
    if (!isNaN(targetNum)) {
      counter.textContent = '0';
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerHTML: targetNum,
            duration: 1.5,
            ease: 'power2.out',
            snap: { innerHTML: 1 },
            onUpdate: function () {
              counter.innerHTML =
                Math.round(this.targets()[0].innerHTML) +
                (targetText.includes('+') ? '+' : '') +
                (targetText.includes('%') ? '%' : '');
            },
          });
        },
      });
    }
  });
});
