// Ably (and some other Node-style libs) reference `global` which doesn't
// exist in the browser. Polyfill it before any Ably code runs.
export default defineNuxtPlugin(() => {
  if (typeof window !== 'undefined' && typeof (window as any).global === 'undefined') {
    (window as any).global = window
  }
})
