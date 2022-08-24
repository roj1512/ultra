import { createServer } from "ultra/server.ts";
import App from "./src/app.tsx";

const server = await createServer({
  importMapPath: import.meta.resolve("./importMap.json"),
  browserEntrypoint: import.meta.resolve("./client.tsx"),
});

server.get("*", async (context) => {
  /**
   * Render the request
   */
  const result = await server.render(<App />);

  return context.body(result, 200, {
    "content-type": "text/html",
  });
});

if (import.meta.main) {
  const { serve } = await import(
    "https://deno.land/std@0.152.0/http/server.ts"
  );
  serve(server.fetch);
}

export default server.fetch;
