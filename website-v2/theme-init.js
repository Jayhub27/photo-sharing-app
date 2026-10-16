/* Runs before the stylesheets so the page never flashes the wrong skin.
   The hand-drawn look is the default; ?theme=clean or the header toggle switch
   back to it, and the choice is remembered in localStorage. */
;(function () {
  'use strict'
  var wanted = null
  try {
    wanted = new URLSearchParams(location.search).get('theme') || localStorage.getItem('tts.theme')
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', wanted === 'clean' ? 'clean' : 'sketch')
})()
