// @ts-check
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://dharma.fransek.dev",
  integrations: [
    starlight({
      title: "Dharma",
      logo: {
        src: "./src/assets/logo.svg",
        alt: "Dharma Logo",
      },
      favicon: "/favicon.svg",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/fransek/dharma",
        },
      ],
      sidebar: [
        {
          slug: "getting-started",
        },
        {
          slug: "core-concepts",
        },
        {
          label: "Core",
          items: [
            "core/quick-start",
            "core/createstore",
            "core/createeffect",
            "core/derive",
            "core/merge",
          ],
        },
        {
          label: "React",
          items: [
            "react/quick-start",
            "react/usestore",
            "react/createstorecontext",
            "react/usestorecontext",
          ],
        },
        {
          label: "Changelogs",
          collapsed: true,
          items: [
            {
              link: "https://github.com/fransek/dharma/blob/main/packages/dharma-core/CHANGELOG.md",
              label: "dharma-core",
            },
            {
              link: "https://github.com/fransek/dharma/blob/main/packages/dharma-react/CHANGELOG.md",
              label: "dharma-react",
            },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "meta",
          attrs: {
            name: "keywords",
            content:
              "Dharma, code, JavaScript, js, TypeScript, ts, web development, frontend development, node, bun, deno, state management, store, Redux, Flux, Zustand, MobX, Recoil, Jotai, XState, React",
          },
        },
      ],
    }),
    sitemap(),
  ],
});
