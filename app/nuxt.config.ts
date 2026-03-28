// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: false,

  modules: ['@pinia/nuxt'],

  build: {
    transpile: ['ably'],
  },

  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default(),
    ],
    define: {
      global: 'globalThis',
    },
    optimizeDeps: {
      include: ['ably'],
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'TaskSpace',
      script: [
        // Ably's UMD bundle checks `typeof global` which esbuild skips when
        // applying the `define: { global: 'globalThis' }` replacement, so the
        // library receives `undefined` and crashes. Injecting this inline script
        // in <head> ensures `global` is defined before any bundled code runs.
        { innerHTML: 'window.global = window', tagPosition: 'head' },
      ],
      meta: [
        { name: 'description', content: 'Internal Collaboration Platform' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://taskspace-be.rizan.app/api/v1',
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'https://taskspace-be.rizan.app',
      hubUrl: process.env.NUXT_PUBLIC_HUB_URL || 'https://unified-portal.rizan.app',
    },
  },
})
