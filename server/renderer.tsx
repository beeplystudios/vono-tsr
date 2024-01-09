import { createMemoryHistory } from "@tanstack/react-router";
import {
  StartServer,
  transformStreamWithRouter,
} from "@tanstack/react-router-server/server";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import React from "react";
import { createHeadCore } from "unhead";
import { createRouter } from "../src/router";
import { AppRouter } from "./trpc";
// @ts-expect-error idk
import manifest from "#vono/manifest";
import { renderToPipeableStream } from "react-dom/server";
import { Transform } from "stream";
import { Context as HonoContext } from "hono";

const dev = true;

const reactRefresh = `
import RefreshRuntime from 'http://localhost:5173/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;

const Shell = (props: {
  head: React.ReactNode;
  scripts: React.ReactNode;
  children: React.ReactNode;
}) => (
  <html>
    <head>
      <script type="module" src="/@vite/client" />
      {dev && (
        <script
          type="module"
          dangerouslySetInnerHTML={{ __html: reactRefresh }}
        />
      )}
      {props.head}
    </head>
    <body>
      <div id="app">{props.children}</div>
      {props.scripts}
    </body>
  </html>
);

export async function render(ctx: HonoContext) {
  const url = ctx.req.path;

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

            // later read cookies here
          }),
        ],
      }),
    },
  });

  await router.load();

  const tags = await head.resolveTags();

  const elements = tags.map((tag) =>
    React.createElement(tag.tag, {
      ...tag.props,
      children: tag.textContent,
    })
  );

  const stream = renderToPipeableStream(
    <Shell
      scripts={
        <script
          type="module"
          src={"/" + manifest["src/entry.client.tsx"].file}
        />
      }
      head={
        <>
          {elements.map((e) => (
            <>{e}</>
          ))}
        </>
      }
    >
      <StartServer router={router} />
    </Shell>
  );

  const transform = transformStreamWithRouter(router);
  const streamWithRouterData = stream.pipe(transform);
  // this is probably fine
  return Transform.toWeb(streamWithRouterData).readable as ReadableStream;
}
