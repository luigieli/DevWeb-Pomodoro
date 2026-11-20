import "@testing-library/jest-dom";

class ArmazenamentoLocalSimulado implements Storage {
  private memoria: Map<string, string> = new Map();

  public get length(): number {
    return this.memoria.size;
  }

  public clear(): void {
    this.memoria.clear();
  }

  public getItem(chave: string): string | null {
    const valor = this.memoria.get(chave);
    if (typeof valor === "undefined") {
      return null;
    }
    return valor;
  }

  public key(index: number): string | null {
    const chaves = Array.from(this.memoria.keys());
    return chaves[index] ?? null;
  }

  public removeItem(chave: string): void {
    this.memoria.delete(chave);
  }

  public setItem(chave: string, valor: string): void {
    this.memoria.set(chave, String(valor));
  }
}

const simulado = new ArmazenamentoLocalSimulado();

Object.defineProperty(window, "localStorage", {
  value: simulado,
  writable: true,
});

Object.defineProperty(globalThis, "localStorage", {
  value: simulado,
  writable: true,
});

if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
