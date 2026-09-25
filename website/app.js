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

  // Style switch: brutal (default) <-> flat. The chosen style is kept in
  // localStorage; ?style=flat / ?style=brutal overrides without saving.
  const STYLE_KEY = 'tts.style'
  const toggle = document.getElementById('styleToggle')
  const toggleName = document.getElementById('styleName')
  const themeMeta = document.querySelector('meta[name="theme-color"]')

  function applyStyle(flat, persist) {
    document.documentElement.dataset.style = flat ? 'flat' : 'brutal'
    if (toggleName) toggleName.textContent = flat ? 'Brutal' : 'Flat'
    if (toggle) toggle.setAttribute('aria-pressed', String(flat))
    if (themeMeta) themeMeta.setAttribute('content', flat ? '#f7f8fa' : '#0b0b0b')
    if (persist) {
      try { localStorage.setItem(STYLE_KEY, flat ? 'flat' : 'brutal') } catch (e) {}
    }
  }

  applyStyle(document.documentElement.dataset.style === 'flat', false)
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyStyle(document.documentElement.dataset.style !== 'flat', true)
    })
  }
})()
