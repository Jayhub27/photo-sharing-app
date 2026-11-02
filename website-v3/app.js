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
  }

  function setLink(key, url) {
    var nodes = document.querySelectorAll('[data-link="' + key + '"]')
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      el.href = url
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
})()
