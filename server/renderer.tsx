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
import { Readable, Transform } from "stream";
import { ReadableStream as NodeReadableStream } from "node:stream/web";

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

            // later read cookies here
          }),
        ],
      }),
    },
  });

  await router.load();

  const { renderToReadableStream } = await import("react-dom/server.browser");

  const tags = await head.resolveTags();

  const elements = tags.map((tag) =>
    React.createElement(tag.tag, {
      ...tag.props,
      children: tag.textContent,
    })
  );

  const stream: NodeReadableStream = await renderToReadableStream(
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

  // convert the web ReadableStream to Nodejs Readable, pipe it throw the
  // tanstack router transform and convert it back to a web ReadableStream
  // if we can convert between web and node streams,

  // we should prob use the pipeable streams api for react dom server to avoid
  // having to copy a load of data every request (does it work like that?)
  const transform = transformStreamWithRouter(router);
  const streamWithRouterData = Readable.fromWeb(stream).pipe(transform);
  return Transform.toWeb(streamWithRouterData).readable;
}
