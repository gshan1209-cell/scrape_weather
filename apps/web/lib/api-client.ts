export class ApiClientError extends Error {
  constructor(public code: "API_NOT_CONFIGURED" | "API_TIMEOUT" | "HTTP_ERROR", message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

function isLoopback(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, "");
  return host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || host === "[::]" || host === "0.0.0.0" || /^127\./.test(host) || /^\[::(?:ffff:)?(?:7f[\da-f]{2}:[\da-f]{1,4}|0:0)\]$/.test(host);
}

function apiBaseUrl(): string {
  const localDevelopment = process.env.NODE_ENV === "development" && typeof window !== "undefined" && isLoopback(window.location.hostname);
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured && localDevelopment) return "http://localhost:8000/api/v1";
  try {
    if (!configured) throw new Error();
    const url = new URL(configured);
    if (!localDevelopment && (url.protocol !== "https:" || isLoopback(url.hostname))) throw new Error();
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.href.includes("?") || url.href.includes("#")) throw new Error();
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new ApiClientError("API_NOT_CONFIGURED", "尚未設定有效的正式天氣後端，暫時無法取得預報資料。");
  }
}

export async function apiGet<T>(path: string, timeoutMs = 15000): Promise<T> {
  const baseUrl = apiBaseUrl();
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new ApiClientError("API_TIMEOUT", "天氣服務回應逾時，請稍後重試。"));
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      fetch(`${baseUrl}${path}`, {headers: {Accept: "application/json"}, cache: "no-store", signal: controller.signal})
        .then(async response => {
          if (!response.ok) throw new ApiClientError("HTTP_ERROR", `天氣服務暫時無法使用（${response.status}）。`);
          return await response.json() as T;
        }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
