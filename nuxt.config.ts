// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  modules: ["shadcn-nuxt", "@nuxtjs/tailwindcss", "@nuxt/image", "@nuxt/icon"],

  runtimeConfig: {
    serpApiKey: "",
    googleApiKey: "",
    googleCx: "",
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: "./app/components/ui",
  },
});
