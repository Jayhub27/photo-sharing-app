/* Wires config.js values into the page, resolves the newest APK from GitHub Releases,
   and powers the brutal / flat style switch. */
;(function () {
  const cfg = window.TTS_CONFIG || {}

  function setLink(key, url, label) {
    document.querySelectorAll('[data-link="' + key + '"]').forEach(function (el) {
      if (!url) {
        el.classList.add('is-disabled')
        el.setAttribute('aria-disabled', 'true')
        el.removeAttribute('href')
        if (label) el.textContent = label
        return
      }
      el.href = url
      if (label) el.textContent = label
      if (/^https?:/i.test(url) && url.indexOf(location.host) === -1) {
        el.target = '_blank'
        el.rel = 'noopener'
      }
    })
  }

  setLink('apk', cfg.apkUrl)
  setLink('source', cfg.sourceUrl)
  setLink('deploy', cfg.deployUrl)
  setLink('repo', cfg.repoUrl)
  setLink('releases', cfg.releasesUrl)
  setLink('ios', cfg.iosUrl || cfg.iosGuideUrl, cfg.iosUrl ? null : 'Build for iOS \u2197')
  if (cfg.webAppUrl) {
    setLink('web', cfg.webAppUrl)
  } else {
    document.querySelectorAll('[data-link="web"]').forEach(function (el) {
      el.remove()
    })
  }

  document.querySelectorAll('[data-cfg]').forEach(function (el) {
    const value = cfg[el.getAttribute('data-cfg')]
    if (value !== undefined && value !== null) el.textContent = value
  })

  // GitHub's API sends CORS headers, so the page can point the Android button at
  // whatever the newest release actually contains (built by the APK workflow).
  const repo = String(cfg.repoUrl || '').replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '')
  if (repo) {
    fetch('https://api.github.com/repos/' + repo + '/releases/latest')
      .then(function (res) {
        if (res.status === 404) {
          setLink('apk', cfg.releasesUrl, 'Get APK \u2197')
          return null
        }
        return res.ok ? res.json() : null
      })
      .then(function (release) {
        if (!release) return
        const apk = (release.assets || []).filter(function (a) {
          return /\.apk$/i.test(a.name)
        })[0]
        if (apk) {
          setLink('apk', apk.browser_download_url, '\u25BC Download APK')
          document.querySelectorAll('[data-cfg="status"]').forEach(function (el) {
            el.textContent = 'APK ready'
          })
        }
      })
      .catch(function () {})
  }

  // Style switch: brutal -> flat -> swiss -> sketch. The chosen style is kept in
  // localStorage; ?style=brutal|flat|swiss|sketch overrides it without saving.
  const STYLE_KEY = 'tts.style'
  const STYLES = ['brutal', 'flat', 'swiss', 'sketch']
  const STYLE_LABELS = { brutal: 'Brutal', flat: 'Flat', swiss: 'Swiss', sketch: 'Sketch' }
  const STYLE_THEME_COLORS = { brutal: '#0b0b0b', flat: '#f7f8fa', swiss: '#ffffff', sketch: '#faf6ec' }
  const toggle = document.getElementById('styleToggle')
  const toggleName = document.getElementById('styleName')
  const themeMeta = document.querySelector('meta[name="theme-color"]')

  // Handwriting fonts are only fetched when the sketch style is active.
  let sketchFontsInjected = false
  function ensureSketchFonts() {
    if (sketchFontsInjected) return
    sketchFontsInjected = true
    const preconnect = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']
    preconnect.forEach(function (href, i) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      if (i === 1) link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href =
      'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Permanent+Marker&display=swap'
    document.head.appendChild(css)
  }

  function currentStyle() {
    const style = document.documentElement.dataset.style
    return STYLES.indexOf(style) === -1 ? 'brutal' : style
  }

  function applyStyle(style, persist) {
    const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length]
    document.documentElement.dataset.style = style
    if (style === 'sketch') ensureSketchFonts()
    if (toggleName) toggleName.textContent = STYLE_LABELS[next]
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        'Switch visual style. Current: ' + STYLE_LABELS[style] + '. Next: ' + STYLE_LABELS[next]
      )
    }
    if (themeMeta) themeMeta.setAttribute('content', STYLE_THEME_COLORS[style])
    if (persist) {
      try { localStorage.setItem(STYLE_KEY, style) } catch (e) {}
    }
  }

  applyStyle(currentStyle(), false)
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyStyle(STYLES[(STYLES.indexOf(currentStyle()) + 1) % STYLES.length], true)
    })
  }
})()
