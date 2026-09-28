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

  // Style switch: brutal -> flat -> swiss -> sketch -> neon -> cyber -> neonflat.
  // The chosen style is kept in localStorage; ?style=<name> overrides it without saving.
  const STYLE_KEY = 'tts.style'
  const STYLES = ['brutal', 'flat', 'swiss', 'sketch', 'neon', 'cyber', 'neonflat', 'neonsketch']
  const STYLE_LABELS = {
    brutal: 'Brutal', flat: 'Flat', swiss: 'Swiss', sketch: 'Sketch', neon: 'Neon', cyber: 'Cyber', neonflat: 'Neon Flat', neonsketch: 'Neon Sketch',
  }
  const STYLE_THEME_COLORS = {
    brutal: '#0b0b0b', flat: '#f7f8fa', swiss: '#ffffff', sketch: '#fdfaf1',
    neon: '#05010f', cyber: '#0a0a12', neonflat: '#070b18', neonsketch: '#0b0a14',
  }
  const STYLE_FONTS = {
    sketch: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Permanent+Marker&display=swap',
    neonsketch: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Permanent+Marker&display=swap',
    neon: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Share+Tech+Mono&display=swap',
  }
  const toggle = document.getElementById('styleToggle')
  const toggleName = document.getElementById('styleName')
  const themeMeta = document.querySelector('meta[name="theme-color"]')

  // Handwriting / techno fonts are only fetched when their style is active.
  const fontsInjected = new Set()
  function ensureStyleFonts(style) {
    const href = STYLE_FONTS[style]
    if (!href || fontsInjected.has(style)) return
    fontsInjected.add(style)
    const preconnect = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']
    preconnect.forEach(function (url, i) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = url
      if (i === 1) link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = href
    document.head.appendChild(css)
  }

  function currentStyle() {
    const style = document.documentElement.dataset.style
    return STYLES.indexOf(style) === -1 ? 'brutal' : style
  }

  function applyStyle(style, persist) {
    const next = STYLES[(STYLES.indexOf(style) + 1) % STYLES.length]
    document.documentElement.dataset.style = style
    ensureStyleFonts(style)
    if (style === 'neonflat') start3dBackground()
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


  /* three.js particle wave for the "neon flat" style. The module is imported
     from a CDN on demand; if it fails (offline) the CSS gradient stays. */
  let bg3dStarted = false
  function start3dBackground() {
    if (bg3dStarted) return
    const canvas = document.getElementById('bg3d')
    if (!canvas) return
    bg3dStarted = true
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js')
      .then(function (THREE) { init3dScene(THREE, canvas, reduce) })
      .catch(function () { canvas.remove() })
  }

  function init3dScene(THREE, canvas, reduce) {
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 120)
    camera.position.set(0, 1.2, 8.8)
    camera.lookAt(0, 0, 0)

    const COLS = 104, ROWS = 56
    const count = COLS * ROWS
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const cyan = new THREE.Color('#22d3ee')
    const indigo = new THREE.Color('#818cf8')
    const magenta = new THREE.Color('#e879f9')
    const mixed = new THREE.Color()
    let i = 0
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        positions[i] = (x / (COLS - 1) - 0.5) * 27
        positions[i + 1] = (y / (ROWS - 1) - 0.5) * 15
        positions[i + 2] = 0
        const t = x / (COLS - 1)
        mixed.copy(cyan).lerp(indigo, Math.min(1, t * 2)).lerp(magenta, Math.max(0, t * 2 - 1))
        colors[i] = mixed.r; colors[i + 1] = mixed.g; colors[i + 2] = mixed.b
        i += 3
      }
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.65,
      depthWrite: false, blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geometry, material)
    points.rotation.x = -0.42
    scene.add(points)

    function resize() {
      const w = window.innerWidth, h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const attribute = geometry.getAttribute('position')
    const base = positions.slice()
    let t = 0

    function frame() {
      const active = document.documentElement.dataset.style === 'neonflat' && !document.hidden
      if (!active) { setTimeout(frame, 600); return }
      t += 0.012
      const arr = attribute.array
      for (let k = 0; k < arr.length; k += 3) {
        const x = base[k], y = base[k + 1]
        arr[k + 2] = Math.sin(x * 0.42 + t) * 0.34 + Math.cos(y * 0.55 + t * 0.8) * 0.24
      }
      attribute.needsUpdate = true
      points.rotation.z = Math.sin(t * 0.05) * 0.05
      renderer.render(scene, camera)
      if (!reduce) requestAnimationFrame(frame)
    }
    frame()
  }

  applyStyle(currentStyle(), false)
  if (toggle) {
    toggle.addEventListener('click', function () {
      applyStyle(STYLES[(STYLES.indexOf(currentStyle()) + 1) % STYLES.length], true)
    })
  }
})()
