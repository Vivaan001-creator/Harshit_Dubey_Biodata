(function () {
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Scroll progress bar ---- */
  var progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    var doc = document.documentElement;
    var scrollTop = window.scrollY || doc.scrollTop;
    var max = (doc.scrollHeight - doc.clientHeight) || 1;
    var pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    if (progressBar) progressBar.style.width = pct + '%';
  }
  if (progressBar) {
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ---- Scroll reveal for sections ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('in'); }, i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Save as PDF button ---- */
  var printBtn = document.getElementById('printBtn');
  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }

  /* ---- Falling petals ambient animation ---- */
  var canvas = document.getElementById('petal-canvas');
  if (!canvas || reduceMotion) return;
  var ctx = canvas.getContext('2d');
  var W, H, petals = [];
  var COLORS = ['#F1CFC8', '#E3ABAC', '#C97B84', '#F6E3D6'];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makePetal(spawnAtTop) {
    return {
      x: Math.random() * W,
      y: spawnAtTop ? -20 - Math.random() * 100 : Math.random() * H,
      size: 6 + Math.random() * 7,
      speedY: .35 + Math.random() * .55,
      drift: .4 + Math.random() * .6,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - .5) * .8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: .55 + Math.random() * .4
    };
  }

  var count = window.innerWidth < 600 ? 14 : 24;
  for (var i = 0; i < count; i++) { petals.push(makePetal(false)); }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot * Math.PI / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size / 2);
    ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size / 2, p.size / 2, 0, p.size / 1.6);
    ctx.bezierCurveTo(-p.size / 2, p.size / 2, -p.size / 2, -p.size / 2, 0, -p.size / 2);
    ctx.fill();
    ctx.restore();
  }

  var t = 0;
  function tick() {
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.y += p.speedY;
      p.x += Math.sin(t + p.phase) * p.drift * 0.6;
      p.rot += p.rotSpeed;
      if (p.y > H + 30) {
        petals[i] = makePetal(true);
        continue;
      }
      drawPetal(p);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
