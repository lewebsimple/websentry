import type { RuntimeSource, SourceState } from "./source";

export class SourceRegistry {
  private readonly sources = new Map<string, RuntimeSource>();

  register(source: RuntimeSource) {
    this.sources.set(source.name, source);
  }

  unregister(name: string) {
    this.sources.delete(name);
  }

  get(name: string) {
    return this.sources.get(name);
  }

  list() {
    return [...this.sources.values()];
  }

  setState(name: string, state: SourceState) {
    const source = this.sources.get(name);
    if (!source) return;
    source.state = state;
  }
}
