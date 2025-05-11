import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  
  vite: {
    plugins: [tailwindcss()]
  },

  runtimeConfig: {
    baseFingerprintDBPath: "./db",
    databaseURL: "postgres://foundnerds-general:f0undnerdsf0undnerdsf0undnerds@119.59.103.72:5433/fingerprint"
  }
})