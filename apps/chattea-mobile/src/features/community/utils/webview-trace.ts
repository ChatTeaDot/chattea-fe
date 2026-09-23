import {
  COMMUNITY_VITALS_MESSAGE_TYPE,
  WEBVIEW_TRACE_TAG,
  webviewTraceReportUrl,
} from "../constants";

export type WebviewTraceRecord = {
  schema: "webview-trace/1";
  screen: string;
  env: string;
  release: string;
  marks: Record<string, number>;
  segments: Record<string, number>;
  totalMs: number;
};

export type WebviewTraceTags = {
  screen: string;
  env: string;
  release: string;
};

export type WebviewTraceDeps = {
  now?: () => number;
  emit?: (record: WebviewTraceRecord) => void;
};

export type WebviewTrace = {
  mark: (name: string) => void;
  close: () => void;
};

export type WebviewVitalMessage = {
  name: string;
  value: number;
};

const defaultEmit = (record: WebviewTraceRecord) => {
  console.info(WEBVIEW_TRACE_TAG, JSON.stringify(record));
  if (webviewTraceReportUrl) {
    void fetch(webviewTraceReportUrl, {
      body: JSON.stringify(record),
      headers: { "content-type": "application/json" },
      method: "POST",
    }).catch(() => undefined);
  }
};

const buildRecord = (tags: WebviewTraceTags, marks: Record<string, number>): WebviewTraceRecord => {
  const entries = Object.entries(marks).sort((a, b) => a[1] - b[1]);
  const segments: Record<string, number> = {};
  for (let index = 1; index < entries.length; index += 1) {
    const [from, fromAt] = entries[index - 1]!;
    const [to, toAt] = entries[index]!;
    segments[`${from}->${to}`] = toAt - fromAt;
  }
  const totalMs = entries.length > 0 ? entries[entries.length - 1]![1] - entries[0]![1] : 0;
  return {
    env: tags.env,
    marks,
    release: tags.release,
    schema: "webview-trace/1",
    screen: tags.screen,
    segments,
    totalMs,
  };
};

export const createWebviewTrace = (
  tags: WebviewTraceTags,
  deps: WebviewTraceDeps = {},
): WebviewTrace => {
  const now = deps.now ?? (() => performance.now());
  const emit = deps.emit ?? defaultEmit;
  const marks: Record<string, number> = {};
  let closed = false;

  const mark = (name: string) => {
    if (closed || name in marks) return;
    marks[name] = now();
  };

  const close = () => {
    if (closed) return;
    closed = true;
    emit(buildRecord(tags, marks));
  };

  return { close, mark };
};

export const parseVitalsMessage = (raw: string): WebviewVitalMessage | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { name, type, value } = parsed as Record<string, unknown>;
    if (type !== COMMUNITY_VITALS_MESSAGE_TYPE) return null;
    if (typeof name !== "string" || typeof value !== "number") return null;
    return { name, value };
  } catch {
    return null;
  }
};
