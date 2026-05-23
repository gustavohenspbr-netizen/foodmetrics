import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  // 2. Giant Typography Injection
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
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      }
    }
  };
  injectGiantText('#solucao', 'METODOLOGIA');
  injectGiantText('#metodo-mc', 'MÁQUINA DE CLIENTES');

  // 3. Custom Cursor & Magnetic Buttons
  if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      // Follow cursor
      window.addEventListener('mousemove', (e) => {
        gsap.set(cursor, { x: e.clientX, y: e.clientY });
      });

      // Hover states for links and buttons
      const interactives = document.querySelectorAll('a, button, .btn');
      interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
      });

      // Magnetic Buttons
      const magneticBtns = document.querySelectorAll('.btn');
      magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
          gsap.to(btn, { x, y, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
      });
    }
  }

  // 4. Loader & Hero Entry
  const tlLoader = gsap.timeline({
    onComplete: () => ScrollTrigger.refresh()
  });
  tlLoader.to(".loader-logo", { opacity: 1, duration: 0.5, ease: "power2.out" })
          .to(".loader-bar", { width: "100%", duration: 0.8, ease: "power2.inOut" }, "-=0.2")
          .to(".page-loader", { yPercent: -100, duration: 0.8, ease: "power3.inOut" })
          .fromTo("#hero .hero__portrait-wrap", { opacity: 0 }, { opacity: 1, duration: 1, ease: "power3.out" }, "-=0.4");

  // 5. Hero Pinned & Scroll Effects
  if (!prefersReducedMotion) {
    const heroLeft = document.querySelector('.hero__left');
    const heroPortrait = document.querySelector('.hero__portrait-wrap');
    const heroSection = document.querySelector('#hero');

    let mm = gsap.matchMedia();

    if (heroSection && heroLeft && heroPortrait) {
      mm.add("(min-width: 901px)", () => {
        // Desktop: Start hidden/centered, animate to side
        gsap.set(heroLeft, { opacity: 0, x: -50 });
        gsap.set(heroPortrait, { scale: 1.5, left: "50%", xPercent: -50, yPercent: -50 });

        ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "+=120%",
          pin: true,
          animation: gsap.timeline()
            .to(heroPortrait, { left: "75%", scale: 1, xPercent: -50, yPercent: -50, ease: "power2.inOut" }, 0)
            .to(heroLeft, { opacity: 1, x: 0, ease: "power2.inOut" }, 0),
          scrub: 1
        });
      });

      mm.add("(max-width: 900px)", () => {
        // Mobile: Just normal layout, no pinning
        gsap.set(heroLeft, { opacity: 1, x: 0 });
        gsap.set(heroPortrait, { scale: 1, left: "50%", xPercent: -50, yPercent: 0 });
      });
    }

    // 5.5 Manifesto Animation
    const manifestoSection = document.querySelector('.manifesto');
    const manifestoBurger = document.querySelector('.manifesto__burger-wrap');
    const manifestoTextWrap = document.querySelector('.manifesto__text-wrap');

    if (manifestoSection && manifestoBurger && manifestoTextWrap) {
      mm.add("(min-width: 901px)", () => {
        ScrollTrigger.create({
          trigger: manifestoSection,
          start: "top top",
          end: "+=120%",
          pin: true,
          animation: gsap.timeline()
            .to(manifestoBurger, { left: "25%", ease: "power2.inOut" }, 0)
            .to(manifestoTextWrap, { opacity: 1, x: 0, ease: "power2.inOut" }, 0),
          scrub: 1
        });
      });
    }

    // 6. Scroll Reveals
    const sections = document.querySelectorAll('.section');
    sections.forEach((sec, i) => {
      // Ensure opacity is 1 and mask is reset initially just in case
      gsap.set(sec, { opacity: 1 });
      
      const elementsToStagger = sec.querySelectorAll('.section__title, .section__sub, .dore-card, .pilar, .estrategia-card, .numero, .solucao__content > *');
      
      if(elementsToStagger.length) {
        gsap.fromTo(elementsToStagger, 
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sec,
              start: "top 80%"
            }
          }
        );
      }
    });

    // 7. Parallax Backgrounds
    const bgOrbs = document.querySelectorAll('.orb');
    bgOrbs.forEach(orb => {
      gsap.to(orb, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });

    // Chart Bars Animation
    const chartBars = document.querySelectorAll('.chart-bars .bar');
    if (chartBars.length) {
      gsap.fromTo(chartBars, 
        { scaleY: 0, transformOrigin: "bottom center" },
        {
          scaleY: 1,
          duration: 1,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: ".solucao__chart-wrap",
            start: "top 80%"
          }
        }
      );
    }
  }

  // 8. Number Counters
  const counters = document.querySelectorAll('.numero__val, .solucao__img-badge-num, .stat__num');
  counters.forEach(counter => {
    const targetText = counter.textContent;
    const targetNum = parseInt(targetText.replace(/\D/g, ''));
    if (!isNaN(targetNum)) {
      counter.textContent = '0';
      ScrollTrigger.create({
        trigger: counter,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            innerHTML: targetNum,
            duration: 1.5,
            ease: "power2.out",
            snap: { innerHTML: 1 },
            onUpdate: function() {
              counter.innerHTML = Math.round(this.targets()[0].innerHTML) + (targetText.includes('+') ? '+' : '') + (targetText.includes('%') ? '%' : '');
            }
          });
        }
      });
    }
  });

  // 9. Lateral Ticker Updates
  const ticker = document.querySelector('.lateral-ticker');
  const sectionsArr = Array.from(document.querySelectorAll('section[id]'));
  
  if (ticker && sectionsArr.length) {
    gsap.to(ticker, { opacity: 1, duration: 1, delay: 2 });
    
    sectionsArr.forEach((sec, index) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => updateTicker(index, sec.id),
        onEnterBack: () => updateTicker(index, sec.id)
      });
    });

    function updateTicker(index, id) {
      const idxStr = String(index + 1).padStart(2, '0');
      const totalStr = String(sectionsArr.length).padStart(2, '0');
      const name = id.replace(/-/g, ' ').toUpperCase();
      ticker.textContent = `${idxStr}/${totalStr} — ${name}`;
      
      gsap.fromTo(ticker, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }

});
