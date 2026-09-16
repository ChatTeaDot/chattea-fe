import { PassThrough, type Writable } from "node:stream";

import type { ReactNode } from "react";
import { renderToPipeableStream } from "react-dom/server";

type StreamReactOptions = {
  end?: boolean;
};

export const streamReact = (
  element: ReactNode,
  writable: Writable,
  { end = true }: StreamReactOptions = {},
) =>
  new Promise<void>((resolve, reject) => {
    const { pipe } = renderToPipeableStream(element, {
      onShellReady: () => {
        const through = new PassThrough();
        through.on("end", resolve);
        pipe(through);
        through.pipe(writable, { end });
      },
      onError: reject,
    });
  });
