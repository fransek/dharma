// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Dharma",
      logo: {
        src: "./src/assets/dharma.svg",
        alt: "Dharma Logo",
      },
      favicon: "/dharma.svg",
      customCss: ["./src/styles/custom.css"],
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
          label: "Core",
          items: ["core/quick-start", "core/createstore", "core/merge"],
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
      ],
    }),
  ],
});
