/* Take the shot — landing page behaviour.
   No framework, no inline code (the Content-Security-Policy allows only 'self'). */

;(function () {
  'use strict'

  var CONFIG = {
    repoUrl: 'https://github.com/Jayhub27/photo-sharing-app',
    releasesUrl: 'https://github.com/Jayhub27/photo-sharing-app/releases',
    sourceUrl: 'https://github.com/Jayhub27/photo-sharing-app/archive/refs/heads/main.zip',
    apkUrl:
      'https://github.com/Jayhub27/photo-sharing-app/releases/latest/download/take-the-shot-android.apk',
    iosUrl: 'https://docs.expo.dev/build/introduction/',
    deployUrl: 'https://vercel.com/new/clone?repository-url=https://github.com/Jayhub27/photo-sharing-app',
    guideUrl: 'https://github.com/Jayhub27/photo-sharing-app/blob/main/docs/GETTING_STARTED.md',
    webAppUrl: null,
  }

  function setLink(key, url, label) {
    var nodes = document.querySelectorAll('[data-link="' + key + '"]')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      if (!url) {
        el.remove()
        continue
      }
      el.href = url
      if (label) el.textContent = label
      if (/^https?:/i.test(url) && url.indexOf(location.host) === -1) {
        el.target = '_blank'
        el.rel = 'noopener noreferrer'
      }
    }
  }

  setLink('apk', CONFIG.apkUrl)
  setLink('ios', CONFIG.iosUrl)
  setLink('deploy', CONFIG.deployUrl)
  setLink('source', CONFIG.sourceUrl)
  setLink('repo', CONFIG.repoUrl)
  setLink('releases', CONFIG.releasesUrl)
  setLink('guide', CONFIG.guideUrl)
  if (CONFIG.webAppUrl) setLink('web', CONFIG.webAppUrl)

  /* Hand-drawn skin: the header toggle swaps the surface without changing the
     layout. The handwriting fonts are self-hosted and load with the stylesheet. */
  var THEME_KEY = 'tts.theme'

  var toggle = document.getElementById('themeToggle')
  var toggleLabel = document.getElementById('themeToggleLabel')

  function setTheme(name, remember) {
    var sketch = name === 'sketch'
    if (sketch) {
      document.documentElement.dataset.theme = 'sketch'
    } else {
      delete document.documentElement.dataset.theme
    }
    if (toggle) toggle.setAttribute('aria-pressed', String(sketch))
    if (toggleLabel) toggleLabel.textContent = sketch ? 'Clean' : 'Sketch'
    if (toggle) toggle.setAttribute('aria-label', sketch ? 'Switch to the clean look' : 'Switch to the hand-drawn look')
    if (remember) {
      try { localStorage.setItem(THEME_KEY, sketch ? 'sketch' : 'clean') } catch (e) {}
    }
  }

  var wanted = new URLSearchParams(location.search).get('theme')
  if (!wanted) {
    try { wanted = localStorage.getItem(THEME_KEY) } catch (e) {}
  }
  /* The hand-drawn skin is the default; only an explicit choice switches to clean. */
  setTheme(wanted === 'clean' ? 'clean' : 'sketch', false)

  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(document.documentElement.dataset.theme === 'sketch' ? 'clean' : 'sketch', true)
    })
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear())
  })

  // A sticky header only earns its rule once the page has moved.
  var top = document.getElementById('top')
  if (top && 'IntersectionObserver' in window) {
    var sentinel = document.createElement('div')
    sentinel.setAttribute('aria-hidden', 'true')
    top.parentNode.insertBefore(sentinel, top)
    new IntersectionObserver(
      function (entries) {
        top.classList.toggle('is-stuck', !entries[0].isIntersecting)
      },
      { rootMargin: '0px' }
    ).observe(sentinel)
  }

  // Point the Android buttons at the newest release, falling back to the releases page.
  var repo = CONFIG.repoUrl.replace(/^https?:\/\/github\.com\//, '')
  fetch('https://api.github.com/repos/' + repo + '/releases/latest')
    .then(function (res) {
      if (res.status === 404) {
        setLink('apk', CONFIG.releasesUrl, 'See releases')
        return null
      }
      return res.ok ? res.json() : null
    })
    .then(function (release) {
      if (!release) return
      var apk = (release.assets || []).filter(function (a) {
        return /\.apk$/i.test(a.name)
      })[0]
      if (apk) {
        setLink('apk', apk.browser_download_url, 'Download APK')
        document.querySelectorAll('[data-status]').forEach(function (el) {
          el.textContent = 'APK ready'
        })
      }
    })
    .catch(function () {})
})()

/* Floating camera doodles: each sketch drifts in any direction, bounces off
   the viewport edges and off the other cameras. The stylesheet owns the
   starting scatter and the tilt; here transform takes over once the images
   are loaded. CSSOM writes are used on purpose: the Content-Security-Policy
   allows no inline styles or scripts. */
;(function () {
  'use strict'

  var layer = document.querySelector('.bg-cameras')
  if (!layer) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var nodes = [].slice.call(layer.querySelectorAll('.bg-camera'))
  if (nodes.length < 2) return

  var bodies = []
  var raf = 0
  var last = 0

  function measure(el) {
    var rect = el.getBoundingClientRect()
    if (!rect.width) return null
    el.style.left = '0'
    el.style.top = '0'
    el.style.right = 'auto'
    el.style.bottom = 'auto'
    el.style.willChange = 'transform'
    var speed = 34 + Math.random() * 36
    var angle = Math.random() * Math.PI * 2
    return {
      el: el,
      x: rect.left,
      y: rect.top,
      w: rect.width,
      r: rect.width * 0.36,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    }
  }

  function tick(now) {
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
    last = now
    var vw = window.innerWidth
    var vh = window.innerHeight

    var i
    for (i = 0; i < bodies.length; i++) {
      var b = bodies[i]
      b.x += b.vx * dt
      b.y += b.vy * dt
      var minX = -b.w * 0.35
      var maxX = vw - b.w * 0.65
      var minY = -b.w * 0.35
      var maxY = vh - b.w * 0.65
      if (b.x < minX) { b.x = minX; b.vx = Math.abs(b.vx) }
      else if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx) }
      if (b.y < minY) { b.y = minY; b.vy = Math.abs(b.vy) }
      else if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy) }
    }

    /* elastic two-body bounce in a circle approximation */
    for (i = 0; i < bodies.length; i++) {
      for (var j = i + 1; j < bodies.length; j++) {
        var a = bodies[i]
        var c = bodies[j]
        var dx = c.x - a.x
        var dy = c.y - a.y
        var dist = Math.sqrt(dx * dx + dy * dy) || 0.001
        var min = a.r + c.r
        if (dist >= min) continue
        var nx = dx / dist
        var ny = dy / dist
        var push = (min - dist) / 2
        a.x -= nx * push
        a.y -= ny * push
        c.x += nx * push
        c.y += ny * push
        var rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
        if (rel < 0) {
          a.vx += rel * nx
          a.vy += rel * ny
          c.vx -= rel * nx
          c.vy -= rel * ny
        }
      }
    }

    for (i = 0; i < bodies.length; i++) {
      var t = bodies[i]
      t.el.style.transform = 'translate3d(' + t.x.toFixed(1) + 'px,' + t.y.toFixed(1) + 'px,0)'
    }
    raf = requestAnimationFrame(tick)
  }

  function start() {
    for (var i = 0; i < nodes.length; i++) {
      var body = measure(nodes[i])
      if (body) bodies.push(body)
    }
    if (bodies.length < 2) return
    raf = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        last = 0
        raf = requestAnimationFrame(tick)
      }
    })
  }

  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start)
})()
