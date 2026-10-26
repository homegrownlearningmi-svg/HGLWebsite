    const FORM_HANDLER_URL = "https://script.google.com/macros/s/AKfycbydrJI0Fys5vSpcZhZoH4Nmuq3kBW-wqr1CEnUSgJz2LrHxKQKLAk3809pZiYHq-h_UZw/exec";

    const menuButton = document.querySelector('.menu-button');
    const navLinks = document.querySelector('.nav-links');
    menuButton.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      document.body.classList.remove('menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }));

    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    document.querySelectorAll('.date-field').forEach(field => field.min = localToday);
    document.getElementById('year').textContent = new Date().getFullYear();

    const toast = document.querySelector('.toast');
    let toastTimer;
    function showToast(title, message) {
      toast.querySelector('strong').textContent = title;
      toast.querySelector('span').textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 6500);
    }

    function activateTab(panelId) {
      const targetTab = document.querySelector(`.tab[data-tab="${panelId}"]`);
      const targetPanel = document.getElementById(panelId);
      if (!targetTab || !targetPanel) return;
      document.querySelectorAll('.tab').forEach(tab => {
        const active = tab === targetTab;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel === targetPanel));
    }

    document.querySelectorAll('[data-open-tab]').forEach(link => {
      link.addEventListener('click', () => activateTab(link.dataset.openTab));
    });

    const handlerReady = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(FORM_HANDLER_URL);
    const pendingSubmissions = new Map();

    function resetFormTiming(form) {
      form.elements.form_started.value = String(Date.now());
      form.elements.page_url.value = window.location.href;
      form.elements.submission_id.value = '';
    }

    document.querySelectorAll('.website-form').forEach(resetFormTiming);

    window.addEventListener('message', event => {
      let data = event.data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (error) { return; }
      }
      if (!data || data.source !== 'homegrown-learning-form' || !data.submissionId) return;
      const pending = pendingSubmissions.get(data.submissionId);
      if (!pending) return;

      clearTimeout(pending.timeout);
      pendingSubmissions.delete(data.submissionId);
      const { form, button, originalText, status } = pending;
      button.disabled = false;
      button.textContent = originalText;

      if (data.status === 'success') {
        status.textContent = data.message || 'Thank you. Your information was sent successfully.';
        status.className = 'form-status success';
        form.reset();
        resetFormTiming(form);
        showToast('Request sent.', 'Homegrown Learning received your information. Angel will follow up directly.');
      } else {
        status.textContent = data.message || 'The form could not be sent. Please try again or call 231-629-5981.';
        status.className = 'form-status error';
        showToast('Request not sent.', status.textContent);
      }
    });

    document.querySelectorAll('.website-form').forEach(form => {
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const status = form.querySelector('.form-status');
        if (!handlerReady) {
          status.textContent = 'This form still needs its Google Apps Script web-app URL. Please call 231-629-5981 until setup is complete.';
          status.className = 'form-status error';
          return;
        }

        const button = form.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        const submissionId = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
        form.elements.submission_id.value = submissionId;
        form.elements.page_url.value = window.location.href;
        form.action = FORM_HANDLER_URL;
        form.method = 'POST';
        form.target = 'form-submit-frame';

        button.disabled = true;
        button.textContent = 'Sending…';
        status.textContent = 'Sending your information securely…';
        status.className = 'form-status';

        const timeout = setTimeout(() => {
          const pending = pendingSubmissions.get(submissionId);
          if (!pending) return;
          pendingSubmissions.delete(submissionId);
          button.disabled = false;
          button.textContent = originalText;
          status.textContent = 'The server did not confirm the submission. Please try again or call 231-629-5981.';
          status.className = 'form-status error';
        }, 45000);

        pendingSubmissions.set(submissionId, { form, button, originalText, status, timeout });
        form.submit();
      });
    });

(() => {
  const carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.hero-carousel-track');
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const previous = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentIndex = 0;
  let timer = null;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, slideIndex) => {
      slide.setAttribute('aria-hidden', slideIndex === currentIndex ? 'false' : 'true');
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (reduceMotion || slides.length < 2 || document.hidden) return;
    timer = window.setInterval(() => showSlide(currentIndex + 1), 5200);
  }

  previous.addEventListener('click', () => {
    showSlide(currentIndex - 1);
    startAutoPlay();
  });

  next.addEventListener('click', () => {
    showSlide(currentIndex + 1);
    startAutoPlay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoPlay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoPlay);
  carousel.addEventListener('mouseleave', startAutoPlay);
  carousel.addEventListener('focusin', stopAutoPlay);
  carousel.addEventListener('focusout', event => {
    if (!carousel.contains(event.relatedTarget)) startAutoPlay();
  });

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoPlay() : startAutoPlay();
  });

  showSlide(0);
  startAutoPlay();
})();
