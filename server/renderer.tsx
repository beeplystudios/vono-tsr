import { createMemoryHistory } from "@tanstack/react-router";
import {
  StartServer,
  transformStreamWithRouter,
} from "@tanstack/react-router-server/server";
import React from "react";
import { createHeadCore } from "unhead";
import { createRouter } from "../src/router";
import { AppRouter } from "./trpc";
// @ts-expect-error idk
import manifest from "#vono/manifest";
import { createTRPCQueryUtils } from "@trpc/react-query";
import { Context as HonoContext } from "hono";
import { renderToPipeableStream } from "react-dom/server";
import { Transform } from "stream";
import {
  createLinks,
  createQueryClient,
  createTRPCClient,
} from "../src/lib/trpc";
import { getCookie } from "hono/cookie";

const dev = import.meta.env.DEV;

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
      {dev && (
        <>
          <script type="module" src="/@vite/client" />
          <script
            type="module"
            dangerouslySetInnerHTML={{ __html: reactRefresh }}
          />
        </>
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
  const queryClient = createQueryClient();
  const trpcClient = createTRPCClient(
    createLinks(() => {
      const authCookie = getCookie(ctx, "auth");

      return {
        cookie: `auth=${authCookie ?? ""}`,
      };
    })
  );

  const head = createHeadCore();
  const router = createRouter({
    head,
    queryClient,
    trpcClient,
  });

  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
  });

  router.update({
    history: memoryHistory,
    context: {
      updateHead: (metadata) => {
        head.push(metadata);
      },
      queryUtils: createTRPCQueryUtils<AppRouter>({
        queryClient,
        client: trpcClient,
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
