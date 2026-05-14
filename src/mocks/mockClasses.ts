class LocalStorageMock {
  store: Record<string, string>
  length: number

  constructor() {
    this.store = {}
    this.length = 0
  }
  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

export const createMockLocalStorage = () => new LocalStorageMock()
