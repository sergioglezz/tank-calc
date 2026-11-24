import type { KeyValueStore } from '../lib/storage'

/** In-memory stand-in for `localStorage` in component tests (D4). */
export class MemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>()

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.values.set(key, value)
    }
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

/** A store that can be read but where every write fails. */
export class FailingStore extends MemoryStore {
  override setItem(): void {
    throw new Error('QuotaExceededError')
  }
}
