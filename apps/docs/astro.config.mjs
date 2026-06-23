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
          slug: "testing",
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
            {
              label: "Playground",
              link: "https://stackblitz.com/~/github.com/fransek/dharma-playground?file=src/App.tsx",
              attrs: { target: "_blank" },
            },
          ],
        },
        {
          label: "Changelogs",
          collapsed: true,
          items: [
            {
              link: "https://github.com/fransek/dharma/blob/main/packages/dharma-core/CHANGELOG.md",
              label: "dharma-core",
              attrs: { target: "_blank" },
            },
            {
              link: "https://github.com/fransek/dharma/blob/main/packages/dharma-react/CHANGELOG.md",
              label: "dharma-react",
              attrs: { target: "_blank" },
            },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.ico",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "keywords",
            content:
              "Dharma, code, JavaScript, js, TypeScript, ts, web development, frontend development, node, bun, deno, state management, store, Redux, Flux, Zustand, MobX, Recoil, Jotai, XState, React",
          },
        },
        {
          tag: "script",
          content: `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('phc_xR9stEYp6atXwt4sRnZirQG0GmyXMUewI7gpJZsqCt1',{api_host:'https://eu.i.posthog.com', defaults:'2025-05-24'})`,
        },
      ],
    }),
    sitemap(),
  ],
});
