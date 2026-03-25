import { claudeAdapter } from "./claude";
import { codexAdapter } from "./codex";
import type { AgentAdapter } from "./types";

const adapters: Map<string, AgentAdapter> = new Map();

function register(adapter: AgentAdapter) {
  adapters.set(adapter.name, adapter);
}

register(claudeAdapter);
register(codexAdapter);

export function getAdapter(name: string): AgentAdapter | null {
  return adapters.get(name) ?? null;
}

export function listAdapters(): string[] {
  return Array.from(adapters.keys()).sort();
}
