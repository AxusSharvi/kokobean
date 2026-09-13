// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-auth-utils', '@nuxtjs/google-fonts'],
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css'
  },
  googleFonts: {
    families: {
      Fraunces: { wght: [500, 600, 700], ital: [500, 600] },
      Karla: [400, 500, 700],
      'Space Mono': [700]
    },
    display: 'swap',
    download: true
  }
})