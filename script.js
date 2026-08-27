/* =========================================================
   Script — Micro-interactions & Parallax
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     NAVBAR — Magnetic Sliding Pill Indicator
     ========================================================= */
  const navLinksList = document.getElementById('nav-links');
  const indicator    = document.getElementById('nav-pill-bg');
  const navLinks     = document.querySelectorAll('.nav__link');

  if (navLinksList && indicator && navLinks.length) {
    function moveToLink(linkEl) {
      if (!linkEl) return;
      const parentRect = navLinksList.getBoundingClientRect();
      const linkRect   = linkEl.getBoundingClientRect();
      const leftOffset = linkRect.left - parentRect.left;
      const width      = linkRect.width;

      indicator.style.transform = `translateX(${leftOffset}px)`;
      indicator.style.width     = `${width}px`;
      indicator.style.opacity   = '1';
    }

    function getActiveLink() {
      return document.querySelector('.nav__link.nav__link--active') || navLinks[0];
    }

    // Hover over any link: slide indicator to it
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        moveToLink(link);
      });

      link.addEventListener('click', () => {
        navLinks.forEach(l => l.classList.remove('nav__link--active'));
        link.classList.add('nav__link--active');
        moveToLink(link);
      });
    });

    // Mouse leave navbar: slide smoothly back to active link
    navLinksList.addEventListener('mouseleave', () => {
      const active = getActiveLink();
      moveToLink(active);
    });

    window.addEventListener('resize', () => moveToLink(getActiveLink()), { passive: true });
    setTimeout(() => moveToLink(getActiveLink()), 150);
  }

  // ── Parallax on floating elements ──────────────────────
  const floatEls = document.querySelectorAll('.float-el');

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx; // -1 to 1
    const dy = (e.clientY - cy) / cy; // -1 to 1

    floatEls.forEach((el, i) => {
      const depth = (i % 3 + 1) * 5; // staggered depth
      const tx = dx * depth;
      const ty = dy * depth;
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });
  });

  // ── Play button ripple effect ───────────────────────────
  const playBtn = document.getElementById('play-btn');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      // Create ripple ring
      const ring = document.createElement('span');
      ring.style.cssText = `
        position:absolute;
        width:58px; height:58px;
        border-radius:50%;
        border:2px solid rgba(255,215,0,0.7);
        top:50%; left:50%;
        transform:translate(-50%,-50%) scale(1);
        pointer-events:none;
        animation: rippleOut 0.7s ease-out forwards;
      `;
      playBtn.appendChild(ring);
      setTimeout(() => ring.remove(), 750);
    });
  }

  // Inject ripple keyframes dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rippleOut {
      from { transform: translate(-50%,-50%) scale(1); opacity:1; }
      to   { transform: translate(-50%,-50%) scale(2.5); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  // ── Glow card tilt on hover ─────────────────────────────
  const mediaCard = document.querySelector('.media-card__inner');
  if (mediaCard) {
    mediaCard.addEventListener('mousemove', (e) => {
      const rect = mediaCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      const rx = y * -8;
      const ry = x *  8;
      mediaCard.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01,1.01,1.01)`;
    });
    mediaCard.addEventListener('mouseleave', () => {
      mediaCard.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    });
    mediaCard.style.transition = 'transform 0.18s cubic-bezier(0.4,0,0.2,1)';
  }

  // ── Pricing: 3D tilt + mouse-follow shine ───────────────
  const pCards = document.querySelectorAll('.p-card[data-tilt]');
  pCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const cx    = rect.width  / 2;
      const cy    = rect.height / 2;
      const x     = e.clientX - rect.left - cx;
      const y     = e.clientY - rect.top  - cy;
      const rx    = (-y / cy) * 8;
      const ry    = ( x / cx) * 8;

      const isPopular = card.classList.contains('p-card--popular');
      const base = isPopular ? 'translateY(-18px) scale(1.02)' : '';
      card.style.transform = `${base} perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;

      // Shine spotlight
      const shine = card.querySelector('.p-card__shine');
      if (shine) {
        const mx = ((e.clientX - rect.left) / rect.width)  * 100;
        const my = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.setProperty('--mouse-x', mx + '%');
        shine.style.setProperty('--mouse-y', my + '%');
        card.style.setProperty('--mouse-x', mx + '%');
        card.style.setProperty('--mouse-y', my + '%');
      }
    });

    card.addEventListener('mouseleave', () => {
      const grid = card.closest('.pricing-grid');
      if (grid) grid.classList.remove('grid--hovering-other');

      const isPopular = card.classList.contains('p-card--popular');
      card.style.transform = isPopular ? 'translateY(-16px) scale(1.02)' : '';
      card.style.transition = 'transform 0.35s cubic-bezier(0.4,0,0.2,1)';
    });

    card.addEventListener('mouseenter', () => {
      const grid = card.closest('.pricing-grid');
      const isPopular = card.classList.contains('p-card--popular');
      if (grid) {
        if (!isPopular) {
          grid.classList.add('grid--hovering-other');
        } else {
          grid.classList.remove('grid--hovering-other');
        }
      }
      card.style.transition = 'transform 0.1s ease, box-shadow 0.2s ease, border-color 0.2s ease';
    });
  });

  // ── Pricing: Monthly / Annual toggle ───────────────────
  const toggleBtn = document.getElementById('toggle-btn');
  const amounts   = document.querySelectorAll('.p-amount');
  const lblMonth  = document.getElementById('toggle-monthly');
  const lblAnnual = document.getElementById('toggle-annual');

  if (toggleBtn) {
    let isAnnual = false;

    toggleBtn.addEventListener('click', () => {
      isAnnual = !isAnnual;
      toggleBtn.setAttribute('aria-checked', String(isAnnual));

      // Update label highlights
      if (isAnnual) {
        lblAnnual.classList.add('active');
        lblMonth.classList.remove('active');
      } else {
        lblMonth.classList.add('active');
        lblAnnual.classList.remove('active');
      }

      // Animate price numbers
      amounts.forEach((el) => {
        el.classList.add('flip');
        setTimeout(() => {
          el.textContent = isAnnual
            ? el.dataset.annual
            : el.dataset.monthly;
          el.classList.remove('flip');
        }, 200);
      });
    });

    // Set initial active state
    lblMonth.classList.add('active');
  }

})();

/* =========================================================
   BOOKING CALENDAR — Clock, Calendar, Time Picker
   ========================================================= */
(function () {
  'use strict';

  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── State ────────────────────────────────────────────────
  let selectedDate = null;
  let selectedTime = null;
  let calYear, calMonth;

  const now = new Date();
  calYear  = now.getFullYear();
  calMonth = now.getMonth();

  // ── Elements ─────────────────────────────────────────────
  const lcH     = document.getElementById('lc-h');
  const lcM     = document.getElementById('lc-m');
  const lcS     = document.getElementById('lc-s');
  const lcDate  = document.getElementById('lc-date');
  const lcAmpm  = document.getElementById('lc-ampm');

  const handH   = document.getElementById('hand-hour');
  const handM   = document.getElementById('hand-minute');
  const handS   = document.getElementById('hand-second');

  const calGrid      = document.getElementById('cal-grid');
  const calLabel     = document.getElementById('cal-month-label');
  const calPrev      = document.getElementById('cal-prev');
  const calNext      = document.getElementById('cal-next');
  const selDateLabel = document.getElementById('selected-date-label');

  const tsHour = document.getElementById('ts-hour');
  const tsMin  = document.getElementById('ts-min');
  const btnAM  = document.getElementById('btn-am');
  const btnPM  = document.getElementById('btn-pm');

  const bookBtn  = document.getElementById('book-btn');
  const bookNote = document.getElementById('booking-note');

  let pickerHour = 7, pickerMin = 0, pickerAMPM = 'AM';

  // ── Generate 60 tick marks ───────────────────────────────
  const tickContainer = document.getElementById('clock-ticks');
  if (tickContainer) {
    for (let i = 0; i < 60; i++) {
      const t = document.createElement('div');
      t.style.cssText = `
        position:absolute; bottom:50%; left:50%;
        width:${i % 5 === 0 ? '2' : '1'}px;
        height:${i % 5 === 0 ? '10' : '5'}px;
        background:rgba(255,215,0,${i % 5 === 0 ? '0.35' : '0.12'});
        transform-origin: bottom center;
        transform: translateX(-50%) rotate(${i * 6}deg) translateY(-86px);
        border-radius:1px;
      `;
      tickContainer.appendChild(t);
    }
  }

  // ── Live Clock Tick ──────────────────────────────────────
  function tickClock() {
    const d   = new Date();
    const h24 = d.getHours();
    const m   = d.getMinutes();
    const s   = d.getSeconds();
    const ms  = d.getMilliseconds();

    const h12 = h24 % 12 || 12;
    const ampm = h24 < 12 ? 'AM' : 'PM';

    // Digital
    if (lcH) lcH.textContent = String(h12).padStart(2,'0');
    if (lcM) lcM.textContent = String(m).padStart(2,'0');
    if (lcS) lcS.textContent = String(s).padStart(2,'0');
    if (lcDate) lcDate.textContent = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
    if (lcAmpm) lcAmpm.textContent = ampm;

    // Analog hands (smooth with ms)
    const secDeg  = (s + ms / 1000) * 6;
    const minDeg  = (m + (s + ms / 1000) / 60) * 6;
    const hourDeg = ((h24 % 12) + m / 60) * 30;

    if (handH) handH.style.transform = `translateX(-50%) rotate(${hourDeg}deg)`;
    if (handM) handM.style.transform = `translateX(-50%) rotate(${minDeg}deg)`;
    if (handS) handS.style.transform = `translateX(-50%) rotate(${secDeg}deg)`;
  }
  setInterval(tickClock, 50);
  tickClock();

  // ── Calendar Render ──────────────────────────────────────
  function renderCalendar() {
    if (!calGrid || !calLabel) return;
    calLabel.textContent = `${MONTHS[calMonth]} ${calYear}`;
    calGrid.innerHTML = '';

    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
    // Shift so Monday=0
    const startOffset = (firstDay + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayD = new Date();

    // Empty cells
    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day cal-day--empty';
      calGrid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cell = document.createElement('div');
      const cellDate = new Date(calYear, calMonth, day);
      const dayOfWeek = cellDate.getDay();
      const isToday   = day === todayD.getDate() && calMonth === todayD.getMonth() && calYear === todayD.getFullYear();
      const isPast    = cellDate < new Date(todayD.getFullYear(), todayD.getMonth(), todayD.getDate());
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let cls = 'cal-day';
      if (isToday)   cls += ' cal-day--today';
      if (isPast)    cls += ' cal-day--past';
      if (isWeekend && !isPast) cls += ' cal-day--weekend';
      if (selectedDate &&
          day === selectedDate.getDate() &&
          calMonth === selectedDate.getMonth() &&
          calYear  === selectedDate.getFullYear()) {
        cls += ' cal-day--selected';
      }

      cell.className   = cls;
      cell.textContent = day;
      cell.dataset.day = day;

      if (!isPast) {
        cell.addEventListener('click', () => selectDate(calYear, calMonth, day));
      }
      calGrid.appendChild(cell);
    }
  }

  function selectDate(y, mo, d) {
    selectedDate = new Date(y, mo, d);
    const dayName = DAYS[selectedDate.getDay()];
    if (selDateLabel) {
      selDateLabel.textContent = `${dayName}, ${MONTHS_SHORT[mo]} ${d}, ${y}`;
    }
    renderCalendar();
    updateBookBtn();
  }

  // Month navigation
  if (calPrev) calPrev.addEventListener('click', () => {
    calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  if (calNext) calNext.addEventListener('click', () => {
    calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });

  renderCalendar();

  // ── Time Slot Picker ─────────────────────────────────────
  const slots = document.querySelectorAll('.time-slot:not(.time-slot--booked)');
  slots.forEach(sl => {
    sl.addEventListener('click', () => {
      slots.forEach(s => s.classList.remove('time-slot--selected'));
      sl.classList.add('time-slot--selected');
      selectedTime = sl.dataset.time;

      // Sync time spinner
      const [timeStr, ap] = selectedTime.split(' ');
      const [hh, mm] = timeStr.split(':');
      pickerHour = parseInt(hh, 10);
      pickerMin  = parseInt(mm, 10);
      pickerAMPM = ap;
      updateTimeDisplay();
      updateBookBtn();
    });
  });

  // ── Time Spinner ─────────────────────────────────────────
  function updateTimeDisplay() {
    if (tsHour) tsHour.textContent = String(pickerHour).padStart(2,'0');
    if (tsMin)  tsMin.textContent  = String(pickerMin).padStart(2,'0');
    if (btnAM && btnPM) {
      btnAM.classList.toggle('ampm-btn--active', pickerAMPM === 'AM');
      btnPM.classList.toggle('ampm-btn--active', pickerAMPM === 'PM');
    }
  }

  document.getElementById('btn-hour-up')?.addEventListener('click', () => {
    pickerHour = pickerHour >= 12 ? 1 : pickerHour + 1; updateTimeDisplay();
  });
  document.getElementById('btn-hour-dn')?.addEventListener('click', () => {
    pickerHour = pickerHour <= 1 ? 12 : pickerHour - 1; updateTimeDisplay();
  });
  document.getElementById('btn-min-up')?.addEventListener('click', () => {
    pickerMin = pickerMin >= 55 ? 0 : pickerMin + 5; updateTimeDisplay();
  });
  document.getElementById('btn-min-dn')?.addEventListener('click', () => {
    pickerMin = pickerMin <= 0 ? 55 : pickerMin - 5; updateTimeDisplay();
  });
  if (btnAM) btnAM.addEventListener('click', () => { pickerAMPM = 'AM'; updateTimeDisplay(); });
  if (btnPM) btnPM.addEventListener('click', () => { pickerAMPM = 'PM'; updateTimeDisplay(); });

  updateTimeDisplay();

  // ── Book Button ──────────────────────────────────────────
  function updateBookBtn() {
    if (!bookBtn) return;
    const ready = selectedDate && selectedTime;
    bookBtn.disabled = !ready;
    if (ready && bookNote) {
      bookNote.textContent = `✅ ${selectedDate.toDateString()} at ${selectedTime}`;
    }
  }

  if (bookBtn) {
    bookBtn.addEventListener('click', () => {
      if (bookBtn.disabled) return;
      bookBtn.textContent = '✅ Booking Confirmed!';
      bookBtn.style.background = 'linear-gradient(135deg,#4ade80,#22c55e)';
      bookBtn.style.color = '#fff';
      bookBtn.style.boxShadow = '0 0 30px rgba(74,222,128,0.4)';
      bookBtn.disabled = true;
      if (bookNote) {
        bookNote.textContent = `🎉 See you on ${selectedDate.toDateString()} at ${selectedTime}!`;
        bookNote.classList.add('success');
      }
    });
  }

})();

/* =========================================================
   FAQs ACCORDION INTERACTION
   ========================================================= */
(function () {
  'use strict';
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const toggleIcon = item.querySelector('.faq-toggle-icon');

    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq-item--open');

      // Close all other items for clean accordion experience
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('faq-item--open');
          const otherBtn = other.querySelector('.faq-question');
          const otherIcon = other.querySelector('.faq-toggle-icon');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('faq-item--open');
        btn.setAttribute('aria-expanded', 'false');
        if (toggleIcon) toggleIcon.textContent = '+';
      } else {
        item.classList.add('faq-item--open');
        btn.setAttribute('aria-expanded', 'true');
        if (toggleIcon) toggleIcon.textContent = '−';
      }
    });
  });
})();

/* =========================================================
   FOOTER — High Performance Vector Spotlight Illumination (60FPS)
   ========================================================= */
(function () {
  'use strict';

  const footer       = document.getElementById('footer');
  const spotlight    = document.getElementById('footer-spotlight');
  const svgSpotlight = document.getElementById('footerTextSpotlight');
  const giantBrand   = document.getElementById('footer-giant-brand');

  if (!footer) return;

  let currentX = 0, currentY = 0;
  let targetX  = 0, targetY  = 0;
  let rafId    = null;
  let isInside = false;

  footer.addEventListener('mouseenter', () => {
    isInside = true;
    if (spotlight) spotlight.style.opacity = '1';
    if (!rafId) animateSpotlight();
  });

  footer.addEventListener('mouseleave', () => {
    isInside = false;
    if (spotlight) spotlight.style.opacity = '0';
    if (svgSpotlight) {
      svgSpotlight.setAttribute('cx', '50%');
      svgSpotlight.setAttribute('cy', '50%');
      svgSpotlight.setAttribute('fx', '50%');
      svgSpotlight.setAttribute('fy', '50%');
    }
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  });

  footer.addEventListener('mousemove', (e) => {
    const rect = footer.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;

    if (svgSpotlight && giantBrand) {
      const brandRect = giantBrand.getBoundingClientRect();
      // Calculate cursor position relative to the brand text container
      const brandX = e.clientX - brandRect.left;
      const brandY = e.clientY - brandRect.top;
      const pctX = Math.max(0, Math.min(100, (brandX / brandRect.width) * 100)).toFixed(1);
      const pctY = Math.max(0, Math.min(100, (brandY / brandRect.height) * 100)).toFixed(1);

      svgSpotlight.setAttribute('cx', `${pctX}%`);
      svgSpotlight.setAttribute('cy', `${pctY}%`);
      svgSpotlight.setAttribute('fx', `${pctX}%`);
      svgSpotlight.setAttribute('fy', `${pctY}%`);
    }
  });

  function animateSpotlight() {
    currentX += (targetX - currentX) * 0.15;
    currentY += (targetY - currentY) * 0.15;

    if (spotlight) {
      spotlight.style.left = currentX + 'px';
      spotlight.style.top  = currentY + 'px';
    }

    if (isInside) {
      rafId = requestAnimationFrame(animateSpotlight);
    } else {
      rafId = null;
    }
  }

  if (spotlight) {
    spotlight.style.opacity = '0';
    spotlight.style.transition = 'opacity 0.3s ease';
  }
})();

/* =========================================================
   SCROLL TO TOP BUTTON WITH CIRCULAR PROGRESS RING (LEFT BOTTOM)
   ========================================================= */
(function () {
  'use strict';

  const scrollTopBtn = document.getElementById('scroll-top');
  const progressBar  = document.getElementById('scroll-progress-bar');
  const circumference = 132; // 2 * Math.PI * 21 ≈ 131.95

  if (!scrollTopBtn || !progressBar) return;

  function updateScrollProgress() {
    const scrollY      = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Reveal button after scrolling down 250px
    if (scrollY > 250) {
      scrollTopBtn.classList.add('scroll-top--visible');
    } else {
      scrollTopBtn.classList.remove('scroll-top--visible');
    }

    if (scrollHeight > 0) {
      const progress = Math.min(Math.max(scrollY / scrollHeight, 0), 1);
      const offset   = circumference - (progress * circumference);
      progressBar.style.strokeDashoffset = offset;
    }
  }

  // Smooth scroll to top on click
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();
})();

/* =========================================================
   LIVE STATS NUMBER COUNT-UP INFINITE LOOP ANIMATION
   ========================================================= */
(function () {
  'use strict';

  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let isVisible = false;
  let loopTimeout = null;

  function runStatsLoop() {
    if (!isVisible) return;

    const duration = 1600;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(1 - progress, 3);

      statNumbers.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 100;
        let val = Math.floor(ease * target);

        // Step rounding for authentic 10, 20, 30... 100 counting feel
        if (target === 100 && val > 0 && val < 100) {
          val = Math.round(val / 5) * 5;
        } else if (target === 500 && val > 0 && val < 500) {
          val = Math.round(val / 10) * 10;
        }

        el.textContent = Math.min(val, target).toLocaleString();
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Complete target values
        statNumbers.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10) || 100;
          el.textContent = target.toLocaleString();
        });

        // Hold at 100+ / 500+ / $100M+ for 2.5 seconds, then restart loop!
        loopTimeout = setTimeout(() => {
          if (isVisible) {
            runStatsLoop();
          }
        }, 2500);
      }
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!isVisible) {
          isVisible = true;
          runStatsLoop();
        }
      } else {
        isVisible = false;
        if (loopTimeout) clearTimeout(loopTimeout);
      }
    });
  }, { threshold: 0.2 });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }
})();

/* =========================================================
   HERO VIDEO LIGHTBOX POPUP PLAYER
   ========================================================= */
(function () {
  'use strict';

  const mediaTrigger  = document.getElementById('hero-media-trigger');
  const playBtn       = document.getElementById('play-btn');
  const videoModal    = document.getElementById('video-modal');
  const modalClose    = document.getElementById('video-modal-close');
  const modalBackdrop = document.getElementById('video-modal-backdrop');
  const modalVideo    = document.getElementById('modal-video-player');

  if (!videoModal || !modalVideo) return;

  function openVideoModal() {
    videoModal.classList.add('video-modal--open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    modalVideo.currentTime = 0;
    const playPromise = modalVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  }

  function closeVideoModal() {
    videoModal.classList.remove('video-modal--open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalVideo.pause();
  }

  if (mediaTrigger) {
    mediaTrigger.addEventListener('click', openVideoModal);
    mediaTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openVideoModal();
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openVideoModal();
    });
  }

  if (modalClose)    modalClose.addEventListener('click', closeVideoModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeVideoModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('video-modal--open')) {
      closeVideoModal();
    }
  });
})();

/* =========================================================
   LIVE CHAT AGENT WIDGET (INTERACTIVE BOT & CHIPS)
   ========================================================= */
(function () {
  'use strict';

  const chatWidget    = document.getElementById('chat-widget');
  const chatTrigger   = document.getElementById('chat-trigger');
  const chatGreeting  = document.getElementById('chat-greeting');
  const greetingClose = document.getElementById('chat-greeting-close');
  const chatMinimize  = document.getElementById('chat-minimize-btn');
  const chatForm      = document.getElementById('chat-form');
  const chatInput     = document.getElementById('chat-input');
  const chatMessages  = document.getElementById('chat-messages');
  const chatTyping    = document.getElementById('chat-typing');
  const quickChips    = document.querySelectorAll('.quick-chip');

  if (!chatWidget || !chatTrigger) return;

  // Show greeting bubble after 2.5s
  setTimeout(() => {
    if (!chatWidget.classList.contains('chat-widget--open') && chatGreeting) {
      chatGreeting.classList.add('chat-greeting--show');
    }
  }, 2500);

  if (greetingClose) {
    greetingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      chatGreeting.classList.remove('chat-greeting--show');
    });
  }

  // Toggle chat window
  function toggleChat() {
    const isOpen = chatWidget.classList.toggle('chat-widget--open');
    chatTrigger.setAttribute('aria-expanded', String(isOpen));
    if (chatGreeting) chatGreeting.classList.remove('chat-greeting--show');

    if (isOpen && chatInput) {
      setTimeout(() => chatInput.focus(), 300);
      scrollToBottom();
    }
  }

  chatTrigger.addEventListener('click', toggleChat);
  if (chatMinimize) chatMinimize.addEventListener('click', toggleChat);

  function scrollToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Knowledge base automated replies
  const botKnowledge = [
    {
      keywords: ['ad', 'hook', 'meta', 'tiktok', 'facebook', 'creative'],
      reply: "We craft high-converting ad hooks, primary copy, and short-form video scripts tailored to your target audience. Most ad deliverables are ready within 24 hours! ⚡"
    },
    {
      keywords: ['landing', 'page', 'sales', 'vsl', 'website'],
      reply: "Our top writers build full sales pages, landing page copy, and direct-response VSL scripts engineered for maximum conversion. Want us to review your existing page? 📄"
    },
    {
      keywords: ['email', 'sequence', 'newsletter', 'klaviyo'],
      reply: "We write automated welcome sequences, abandoned cart flows, and daily/weekly newsletters with verified high open and click-through rates! 📧"
    },
    {
      keywords: ['price', 'pricing', 'cost', 'plan', 'month'],
      reply: "We offer flexible plans starting at $97/mo (Starter), $297/mo (Pro - Most Popular), and $697/mo (Agency). No contracts, cancel anytime! Check the Pricing section for full details. 💰"
    },
    {
      keywords: ['book', 'call', 'schedule', 'meeting', 'talk', 'human'],
      reply: "You can schedule a free 1-on-1 strategy call with our team directly in the Booking section above! 📅 We match you with your vetted writer in 24 hours."
    },
    {
      keywords: ['hello', 'hi', 'hey', 'start', 'help'],
      reply: "Hey! What kind of copywriting projects are you looking to scale this week? I'm here to match you with the right specialist! 👋"
    }
  ];

  function getBotReply(userText) {
    const lower = userText.toLowerCase();
    for (const item of botKnowledge) {
      if (item.keywords.some(k => lower.includes(k))) {
        return item.reply;
      }
    }
    return "Great question! Our dedicated writers specialize in high-converting copy across every niche. Feel free to book a free call or choose a plan above to get started immediately! 🚀";
  }

  function appendMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${isUser ? 'chat-msg--user' : 'chat-msg--bot'}`;

    if (!isUser) {
      msg.innerHTML = `
        <div class="chat-msg__avatar">
          <img src="Logo/Asset 4@4x.png" alt="Bot" />
        </div>
        <div class="chat-msg__bubble">
          <p>${text}</p>
        </div>
      `;
    } else {
      msg.innerHTML = `
        <div class="chat-msg__bubble">
          <p>${text}</p>
        </div>
      `;
    }

    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  function handleUserSend(text) {
    if (!text.trim()) return;

    appendMessage(text, true);

    // Show typing animation
    if (chatTyping) {
      chatTyping.classList.add('chat-typing--active');
      scrollToBottom();
    }

    setTimeout(() => {
      if (chatTyping) chatTyping.classList.remove('chat-typing--active');
      const botResponse = getBotReply(text);
      appendMessage(botResponse, false);
    }, 700);
  }

  // Handle Form Submit
  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatInput.value;
      chatInput.value = '';
      handleUserSend(val);
    });
  }

  // Handle Quick Chips
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query') || chip.textContent;
      handleUserSend(q);
    });
  });

})();

/* =========================================================
   EXPANDING VIDEO SHOWCASE ACCORDION (HOVER EXPAND)
   ========================================================= */
(function () {
  'use strict';

  const vCards     = document.querySelectorAll('.v-card');
  const videoModal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video-player');

  if (!vCards.length) return;

  // Auto-play the initial active card
  const activeInitial = document.querySelector('.v-card.v-card--active video');
  if (activeInitial) {
    activeInitial.play().catch(() => {});
  }

  vCards.forEach(card => {
    const video    = card.querySelector('video');
    const videoSrc = card.getAttribute('data-video');

    // Hover expand & auto-play
    card.addEventListener('mouseenter', () => {
      vCards.forEach(c => {
        c.classList.remove('v-card--active');
        const v = c.querySelector('video');
        if (v && v !== video) v.pause();
      });

      card.classList.add('v-card--active');
      if (video) {
        video.play().catch(() => {});
      }
    });

    // Click to open in Fullsize Lightbox Modal
    card.addEventListener('click', () => {
      if (!videoModal || !modalVideo || !videoSrc) return;
      modalVideo.src = videoSrc;
      videoModal.classList.add('video-modal--open');
      videoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
})();







