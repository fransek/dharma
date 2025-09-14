// @ts-check
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Dharma",
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
          label: "Core API",
          items: ["core/createstore", "core/merge"],
        },
        {
          label: "React",
          items: [
            "react/quick-start",
            {
              label: "API",
              items: [
                "react/api/usestore",
                "react/api/createstorecontext",
                "react/api/usestorecontext",
              ],
            },
          ],
        },
      ],
    }),
  ],
});
