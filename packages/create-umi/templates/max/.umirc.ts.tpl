import { defineConfig } from "@sortinox/umi-max"

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  tailwindcss: {},
  layout: {
    title: "@sortinox/umi-max",
  },
  routes: [
    {
      path: "/",
      redirect: "/home",
    },
    {
      name: "Home",
      path: "/home",
      component: "./Home",
    },
    {
      name: "Access",
      path: "/access",
      component: "./Access",
    },
  ],
  npmClient: "{{{ npmClient }}}",
})

