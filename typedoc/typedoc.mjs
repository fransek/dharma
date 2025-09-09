import { PageEvent } from "typedoc";

/**
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  app.renderer.on(PageEvent.END, (event) => {
    if (event.contents) {
      event.contents = event.contents.replace(
        /<pre(.*?)>([\s\S]*?)<\/pre>/g,
        '<div class="pre-wrapper"><pre$1>$2</pre></div>'
      );
    }
  });
}