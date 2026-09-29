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
  if (CONFIG.webAppUrl) setLink('web', CONFIG.webAppUrl)

  /* Hand-drawn skin: the header toggle swaps the surface without changing the
     layout. The handwriting fonts are fetched only when the skin is on. */
  var THEME_KEY = 'tts.theme'
  var FONTS = 'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Permanent+Marker&display=swap'
  var fontsLoaded = false

  function loadHandwriting() {
    if (fontsLoaded) return
    fontsLoaded = true
    ;['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(function (href, i) {
      var pre = document.createElement('link')
      pre.rel = 'preconnect'
      pre.href = href
      if (i === 1) pre.crossOrigin = 'anonymous'
      document.head.appendChild(pre)
    })
    var css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = FONTS
    document.head.appendChild(css)
  }

  var toggle = document.getElementById('themeToggle')
  var toggleLabel = document.getElementById('themeToggleLabel')

  function setTheme(name, remember) {
    var sketch = name === 'sketch'
    if (sketch) {
      document.documentElement.dataset.theme = 'sketch'
      loadHandwriting()
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
  setTheme(wanted === 'sketch' ? 'sketch' : 'clean', false)

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
