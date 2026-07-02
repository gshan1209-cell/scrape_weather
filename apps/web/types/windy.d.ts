declare global {
  interface Window {
    windyInit?: (
      options: Record<string, unknown>,
      callback: (windyAPI: {
        map: unknown;
        store: {
          get: (key: string) => unknown;
          set: (key: string, value: unknown, opts?: Record<string, unknown>) => void;
          on: (key: string, callback: (...args: unknown[]) => void) => void;
          off: (key: string, callback: (...args: unknown[]) => void) => void;
        };
        picker?: {
          open: (params: { lat: number; lon: number }) => void;
          close: () => void;
          getParams: () => unknown;
        };
      }) => void,
    ) => void;
  }
}

export {};
