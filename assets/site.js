(function () {
  var page = (document.documentElement.lang || 'en').slice(0, 2);
  function get() { try { return localStorage.getItem('tlp_lang'); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem('tlp_lang', v); } catch (e) {} }

  // Manual switch always wins and is remembered.
  document.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () { set(a.getAttribute('data-setlang')); });
  });

  var q = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (q === 'en' || q === 'fr') set(q);
  var pref = get();
  var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
  var browserFr = nav.indexOf('fr') === 0;

  // English page: send French readers to /fr/ unless they chose English.
  if (page === 'en' && document.body.hasAttribute('data-home')) {
    var wantFr = pref ? pref === 'fr' : browserFr;
    if (wantFr && q !== 'en') { location.replace('/fr/' + location.hash); return; }
  }

  // French page: if the reader looks English-speaking, offer a switch (no redirect).
  if (page === 'fr' && document.body.hasAttribute('data-home')) {
    var dismissed = false;
    try { dismissed = sessionStorage.getItem('tlp_banner') === '1'; } catch (e) {}
    var wantEn = pref ? pref === 'en' : !browserFr;
    var banner = document.getElementById('langBanner');
    if (banner && wantEn && !dismissed) {
      banner.classList.add('show');
      document.body.classList.add('has-banner');
      var x = banner.querySelector('button');
      if (x) x.addEventListener('click', function () {
        banner.classList.remove('show');
        document.body.classList.remove('has-banner');
        try { sessionStorage.setItem('tlp_banner', '1'); } catch (e) {}
      });
    }
  }

  // Notify form
  var form = document.getElementById('notifyForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('notifyEmail').value;
      var btn = form.querySelector('.notify-btn');
      var sending = btn.getAttribute('data-sending');
      btn.textContent = sending; btn.disabled = true;
      fetch('https://formsubmit.co/ajax/ThinLinePress@pm.me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: email, language: page, _subject: form.getAttribute('data-subject') })
      }).catch(function () {}).then(function () {
        form.style.display = 'none';
        document.getElementById('notifySuccess').style.display = 'block';
      });
    });
  }

  // Nav / float button / fade-in
  var navEl = document.querySelector('nav');
  var floatBuy = document.getElementById('floatBuy');
  var heroH = window.innerHeight * 0.7;
  function onScroll() {
    var y = window.scrollY;
    if (navEl) navEl.classList.toggle('scrolled', y > 60);
    if (floatBuy) floatBuy.classList.toggle('visible', y > heroH);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var els = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
    setTimeout(function () {
      document.querySelectorAll('.hero .fade-in').forEach(function (el) { el.classList.add('visible'); });
    }, 100);
  } else {
    els.forEach(function (el) { el.classList.add('visible'); });
  }
})();
