import {
  dirname,
  globToRegExp,
  join,
} from "https://deno.land/std@0.176.0/path/mod.ts";
import { ensureDir, walk } from "https://deno.land/std@0.176.0/fs/mod.ts";
import { compile as compileMDX } from "https://esm.sh/@mdx-js/mdx@2.1.3/lib/compile.js";
import rehypeHighlight from "https://esm.sh/rehype-highlight@6.0.0";
import rehypeSlug from "https://esm.sh/rehype-slug@5.1.0";
import bash from "https://esm.sh/highlight.js@11.6.0/es/languages/bash.js";
import dockerfile from "https://esm.sh/highlight.js@11.6.0/es/languages/dockerfile.js";

export async function compile(path: string) {
  const MDX_MATCH = globToRegExp("**/*.mdx", {
    extended: true,
    globstar: true,
    caseInsensitive: false,
  });

  /**
   * Walk the ./content directory for every .mdx file compile it to Javascript
   * Save the output to ./src/content/[path]
   */
  for await (
    const entry of walk(path, {
      match: [MDX_MATCH],
    })
  ) {
    if (entry.isFile) {
      const content = await Deno.readTextFile(entry.path);

      const compiled = await compileMDX(content, {
        jsxRuntime: "automatic",
        jsxImportSource: "react",
        providerImportSource: "@mdx-js/react",
        rehypePlugins: [
          rehypeSlug,
          [rehypeHighlight, {
            languages: {
              "bash": bash,
              "dockerfile": dockerfile,
            },
          }],
        ],
      });

      const outputPath = join(
        Deno.cwd(),
        "src",
        entry.path.replace(".mdx", ".js"),
      );

      await ensureDir(dirname(outputPath));
      await Deno.writeTextFile(outputPath, compiled.value.toString());
    }
  }
}
