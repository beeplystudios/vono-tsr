import { createMemoryHistory } from "@tanstack/react-router";
import { StartServer } from "@tanstack/react-router-server/server";
import { renderSSRHead } from "@unhead/ssr";
import React from "react";
import { createHeadCore } from "unhead";
import { createRouter } from "../src/router";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "./trpc";

// @ts-expect-error idk
const dev = import.meta.env.DEV;

const reactRefresh = `
import RefreshRuntime from 'http://localhost:5173/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true`;

const Shell = (props: {
  head: string;
  scripts: React.ReactNode;
  children: React.ReactNode;
}) => (
  <html>
    <head dangerouslySetInnerHTML={{ __html: props.head }} />
    <body>
      <div id="app">{props.children}</div>
      {props.scripts}
    </body>
  </html>
);

export default async function render(url: string) {
  const head = createHeadCore();
  const router = createRouter(head);

  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
  });

  router.update({
    history: memoryHistory,
    context: {
      updateHead: (metadata) => {
        head.push(metadata);
      },
      client: createTRPCClient<AppRouter>({
        links: [
          httpBatchLink({
            url: "http://localhost:5173/trpc",
          }),
        ],
      }),
    },
  });

  await router.load();

  const { renderToReadableStream } = await import("react-dom/server.browser");

  let headTags = "";

  if (dev) {
    head.push({
      script: [{ type: "module", src: "/@vite/client" }],
    });
  }

  const payload = await renderSSRHead(head);

  headTags = payload.headTags;

  headTags += `<script type="module">${reactRefresh}</script>`;

  return renderToReadableStream(
    <Shell
      scripts={<script type="module" src={"src/entry.client.tsx"} />}
      head={headTags}
    >
      <StartServer router={router} />
    </Shell>
  );
}
