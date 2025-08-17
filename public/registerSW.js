/* Custom SW registration (manual) */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('[pwa] service worker registered', reg.scope)
    }).catch(err => {
      console.warn('[pwa] service worker registration failed', err)
    })
  })
}
