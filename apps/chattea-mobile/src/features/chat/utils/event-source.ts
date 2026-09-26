export type SseEvent = {
  data: string;
  event?: string;
  id?: string;
};

export type EventSourceOptions = {
  headers?: Record<string, string>;
};

export class EventSource {
  onclose?: () => void;
  onerror?: () => void;
  onmessage?: (event: SseEvent) => void;
  onopen?: () => void;

  private closed = false;
  private currentData = "";
  private currentEvent = "";
  private currentId = "";
  private lastIndex = 0;
  private xhr: XMLHttpRequest;

  constructor(url: string, options: EventSourceOptions = {}) {
    this.xhr = new XMLHttpRequest();
    this.xhr.open("GET", url, true);
    this.xhr.setRequestHeader("Accept", "text/event-stream");
    for (const [key, value] of Object.entries(options.headers ?? {})) {
      this.xhr.setRequestHeader(key, value);
    }
    this.xhr.onloadstart = () => this.onopen?.();
    this.xhr.onprogress = () => this.process();
    this.xhr.onload = () => {
      this.process();
      this.close();
    };
    this.xhr.onerror = () => {
      this.onerror?.();
      this.close();
    };
    this.xhr.onabort = () => this.close();
    this.xhr.send();
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.xhr.abort();
    this.onclose?.();
  }

  private process() {
    const text = this.xhr.responseText;
    while (this.lastIndex < text.length) {
      const nextNewline = text.indexOf("\n", this.lastIndex);
      if (nextNewline === -1) break;
      const rawLine = text.slice(this.lastIndex, nextNewline);
      this.lastIndex = nextNewline + 1;
      const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
      if (line === "") {
        this.dispatch();
        this.currentId = "";
        this.currentEvent = "";
        this.currentData = "";
      } else if (line.startsWith(":")) {
        continue;
      } else {
        const colon = line.indexOf(":");
        const field = colon === -1 ? line : line.slice(0, colon);
        const value = colon === -1 ? "" : line.slice(colon + 1).startsWith(" ") ? line.slice(colon + 2) : line.slice(colon + 1);
        if (field === "id") this.currentId = value;
        else if (field === "event") this.currentEvent = value;
        else if (field === "data") this.currentData = this.currentData ? `${this.currentData}\n${value}` : value;
      }
    }
  }

  private dispatch() {
    if (this.currentData === "" && this.currentId === "" && this.currentEvent === "") return;
    this.onmessage?.({ data: this.currentData, event: this.currentEvent, id: this.currentId });
  }
}
