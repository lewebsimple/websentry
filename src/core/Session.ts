export interface Session {
  readonly state: Map<string, unknown>;

  getHeaders(url: string): Record<string, string>;
  setHeader(name: string, value: string): void;
  setCookies(url: string, cookieHeader: string): void;
  dispose(): Promise<void>;
}

type Origin = string;

export class DefaultSession implements Session {
  readonly state = new Map<string, unknown>();

  private readonly headers = new Map<string, string>();
  private readonly cookies = new Map<Origin, string>();

  getHeaders(url: string): Record<string, string> {
    const result: Record<string, string> = {};

    // static headers (Authorization, etc.)
    for (const [key, value] of this.headers) {
      result[key] = value;
    }

    // cookie header (origin scoped)
    const origin = this.getOrigin(url);
    const cookie = this.cookies.get(origin);
    if (cookie) {
      result["cookie"] = cookie;
    }

    return result;
  }

  setHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  setCookies(url: string, cookieHeader: string): void {
    const origin = this.getOrigin(url);
    this.cookies.set(origin, cookieHeader);
  }

  async dispose(): Promise<void> {
    this.state.clear();
    this.headers.clear();
    this.cookies.clear();
  }

  private getOrigin(url: string): Origin {
    return new URL(url).origin;
  }
}
