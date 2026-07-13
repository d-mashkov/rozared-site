/* ══════════════════════════════════════════
   ROZARED
══════════════════════════════════════════ */

/* ─── LANG ─── */
let currentLang = 'en';
function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-en]').forEach(function(el) {
    // innerHTML — сохраняем &nbsp;, <strong> и прочую разметку внутри переводов
    el.innerHTML = el.getAttribute('data-' + lang);
  });
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  try { localStorage.setItem('rozared-lang', lang); } catch (e) {}
}
document.querySelectorAll('.lang-btn').forEach(function(b) {
  b.addEventListener('click', function() { setLanguage(b.dataset.lang); });
});

/* Восстанавливаем выбранный язык; для новых посетителей — по языку браузера */
(function() {
  var saved = null;
  try { saved = localStorage.getItem('rozared-lang'); } catch (e) {}
  var lang = saved || (navigator.language && navigator.language.indexOf('zh') === 0 ? 'zh' : 'en');
  if (lang !== 'en') setLanguage(lang);
})();

/* ─── HEADER ─── */
var header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', function() {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ─── NAV ACTIVE ─── */
function updateNav() {
  var y = window.scrollY + 140;
  document.querySelectorAll('section[id]').forEach(function(s) {
    if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
      document.querySelectorAll('.nav a, .mobile-nav a').forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + s.id);
      });
    }
  });
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

/* ─── BURGER ─── */
var burger    = document.getElementById('burger');
var mobileNav = document.getElementById('mobileNav');
if (burger && mobileNav) {
  burger.addEventListener('click', function() {
    burger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
    });
  });
}

/* ─── SMOOTH SCROLL ─── */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 68, behavior: 'smooth' });
  });
});

/* ─── HERO PARALLAX (только десктоп) ─── */
var heroCenter = document.querySelector('.hero-center');
var heroSlogan = document.querySelector('.hero-slogan');
if (window.matchMedia('(min-width: 901px) and (hover: hover)').matches) {
  window.addEventListener('scroll', function() {
    var y = window.scrollY;
    if (y > window.innerHeight) return;
    var p = y / window.innerHeight;
    if (heroCenter) {
      heroCenter.style.transform = 'translateY(' + (y * 0.18) + 'px)';
      heroCenter.style.opacity   = String(Math.max(0, 1 - p * 1.4));
    }
    if (heroSlogan) {
      heroSlogan.style.opacity = String(Math.max(0, 1 - p * 2.2));
    }
  }, { passive: true });
}

/* ─── SCROLL REVEAL ─── */
var ro = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    ro.unobserve(e.target);
  });
}, { threshold: 0.1 });

var delays = ['reveal-d1', 'reveal-d2', 'reveal-d3', 'reveal-d4', 'reveal-d5'];

function addReveal(el, dir, delayIndex) {
  if (!el) return;
  el.classList.add(dir);
  if (delayIndex > 0 && delays[delayIndex - 1]) el.classList.add(delays[delayIndex - 1]);
  ro.observe(el);
}

document.querySelectorAll('.about-text > *').forEach(function(el, i) {
  addReveal(el, 'reveal-left', i + 1);
});
document.querySelectorAll('.stat-card').forEach(function(el, i) {
  addReveal(el, 'reveal', i + 1);
});

['.catalog .section-label', '.catalog h2', '.catalog-intro', '.format-switcher'].forEach(function(sel, i) {
  addReveal(document.querySelector(sel), 'reveal', i + 1);
});
document.querySelectorAll('.product-card').forEach(function(el, i) {
  addReveal(el, 'reveal', (i % 3) + 1);
});
document.querySelectorAll('.format-card').forEach(function(el, i) {
  addReveal(el, 'reveal', i + 1);
});
document.querySelectorAll('.contact-text > *').forEach(function(el, i) {
  addReveal(el, 'reveal-left', i + 1);
});
document.querySelectorAll('.media-card').forEach(function(el, i) {
  addReveal(el, 'reveal', i + 1);
});
document.querySelectorAll('.form-group, .contact-form .btn').forEach(function(el, i) {
  addReveal(el, 'reveal', i + 1);
});

/* ─── COUNTER ─── */
var co = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (!e.isIntersecting) return;
    var el = e.target;
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) { co.unobserve(el); return; }
    var duration = target === 0 ? 400 : 1800;
    var startTime = null;
    function tick(t) {
      if (!startTime) startTime = t;
      var p = Math.min((t - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    co.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num[data-target]').forEach(function(el) { co.observe(el); });

/* ─── FORMAT SWITCHER (250g / 50g / mixes) ─── */
function switchFormat(format) {
  var grid    = document.getElementById('catalogGrid');
  var mixes   = document.getElementById('mixesScreen');
  var formats = document.querySelector('.catalog-formats');

  document.querySelectorAll('.format-tab').forEach(function(t) {
    t.classList.toggle('active', t.dataset.format === format);
  });

  // Скрываем всё
  var toHide = [grid, formats, mixes].filter(Boolean);
  toHide.forEach(function(el) {
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity = '0';
  });

  setTimeout(function() {
    if (grid)    grid.style.display = 'none';
    if (formats) formats.style.display = 'none';
    if (mixes)   mixes.style.display = 'none';

    if (format === 'mixes' && mixes) {
      mixes.style.display = 'block';
      setTimeout(function() { mixes.style.opacity = '1'; }, 30);
    } else {
      // 250g / 50g: один и тот же каталог, меняем изображения
      if (grid) {
        grid.querySelectorAll('img[data-img250]').forEach(function(img) {
          var src = format === '50g' ? img.dataset.img50 : img.dataset.img250;
          if (src && img.getAttribute('src') !== src) img.setAttribute('src', src);
        });
        grid.style.display = '';
        setTimeout(function() { grid.style.opacity = '1'; }, 30);
      }
      if (formats) {
        formats.style.display = '';
        setTimeout(function() { formats.style.opacity = '1'; }, 30);
      }
    }
  }, 420);
}

document.querySelectorAll('.format-tab').forEach(function(tab) {
  tab.addEventListener('click', function() { switchFormat(tab.dataset.format); });
});

// Карточка Mixes внизу каталога → переключаем вкладку и скроллим к ней
var mixesCard = document.getElementById('mixesFormatCard');
if (mixesCard) {
  mixesCard.addEventListener('click', function() {
    switchFormat('mixes');
    var switcher = document.querySelector('.format-switcher');
    if (switcher) window.scrollTo({ top: switcher.offsetTop - 90, behavior: 'smooth' });
  });
}

/* ─── FORM ─── */
var form    = document.getElementById('contactForm');
var success = document.getElementById('formSuccess');

if (form && success) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var btn  = form.querySelector('button[type="submit"]');
    var orig = btn ? btn.textContent : '';

    if (btn) {
      btn.textContent = currentLang === 'zh' ? '发送中…' : 'Sending…';
      btn.style.opacity = '0.6';
      btn.disabled = true;
    }

    var data = new FormData(form);

    fetch('https://formsubmit.co/ajax/dmashkovjob@gmail.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: data
    })
    .then(function(res) { return res.json(); })
    .then(function(json) {
      if (json.success === 'true' || json.success === true) {
        form.reset();
        success.textContent = success.getAttribute('data-' + currentLang);
        success.classList.add('show');
        setTimeout(function() { success.classList.remove('show'); }, 6000);
      } else {
        alert('Something went wrong. Please try again.');
      }
    })
    .catch(function() {
      alert('Network error. Please try again.');
    })
    .finally(function() {
      if (btn) { btn.textContent = orig; btn.style.opacity = '1'; btn.disabled = false; }
    });
  });
}
