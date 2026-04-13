export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const serviceWorkerUrl = `${import.meta.env.BASE_URL}sw.js`
      navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {})
    })
  }
}
