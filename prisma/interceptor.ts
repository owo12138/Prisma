const originalFetch = window.fetch;
let googleProxyBaseUrl: string | null = null;
let customProxyTargetUrl: string | null = null;

const applyFetch = (fn: typeof window.fetch) => {
  try {
    Object.defineProperty(window, 'fetch', {
      value: fn,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (e) {
    try {
      (window as any).fetch = fn;
    } catch (err) {
      console.error("[Prisma] Critical: Failed to intercept fetch.", err);
    }
  }
};

const buildRequestInfo = (input: RequestInfo | URL, init: RequestInit | undefined, headers: Headers) => {
  if (input instanceof Request) {
    const requestData: RequestInit = {
      method: input.method,
      headers: input.headers,
      body: input.body,
      mode: input.mode,
      credentials: input.credentials,
      cache: input.cache,
      redirect: input.redirect,
      referrer: input.referrer,
      integrity: input.integrity,
    };

    return { ...requestData, ...init, headers };
  }

  return { ...init, headers };
};

const applyInterceptor = () => {
  if (!googleProxyBaseUrl && !customProxyTargetUrl) {
    applyFetch(originalFetch);
    return;
  }

  const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let urlString: string;

    if (typeof input === 'string') {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    } else {
      urlString = input.url;
    }

    const headers = new Headers(init?.headers);
    if (customProxyTargetUrl && urlString.includes('/custom-api')) {
      headers.set('X-Target-URL', customProxyTargetUrl);
    }

    if (googleProxyBaseUrl) {
      const defaultHost = 'generativelanguage.googleapis.com';
      if (urlString.includes(defaultHost)) {
        try {
          const url = new URL(urlString);
          const proxy = new URL(googleProxyBaseUrl);

          url.protocol = proxy.protocol;
          url.host = proxy.host;

          if (proxy.pathname !== '/') {
            const cleanPath = proxy.pathname.endsWith('/') ? proxy.pathname.slice(0, -1) : proxy.pathname;
            url.pathname = cleanPath + url.pathname;
          }

          const newUrl = url.toString();
          const mergedInit = buildRequestInfo(input, init, headers);
          return originalFetch(new URL(newUrl), mergedInit);
        } catch (e) {
          console.error("[Prisma Interceptor] Failed to redirect request:", e);
        }
      }
    }

    const mergedInit = buildRequestInfo(input, init, headers);
    return originalFetch(input, mergedInit);
  };

  applyFetch(interceptedFetch);
};

export const setInterceptorUrl = (baseUrl: string | null) => {
  if (!baseUrl) {
    googleProxyBaseUrl = null;
    applyInterceptor();
    return;
  }

  let normalizedBase = baseUrl.trim();
  try {
    new URL(normalizedBase);
  } catch (e) {
    console.warn("[Prisma] Invalid Base URL provided:", normalizedBase);
    return;
  }

  if (normalizedBase.endsWith('/')) {
    normalizedBase = normalizedBase.slice(0, -1);
  }

  googleProxyBaseUrl = normalizedBase;
  applyInterceptor();
};

export const setCustomProxyTarget = (baseUrl: string | null) => {
  if (!baseUrl) {
    customProxyTargetUrl = null;
    applyInterceptor();
    return;
  }

  try {
    new URL(baseUrl);
  } catch (e) {
    console.warn("[Prisma] Invalid Custom API URL provided:", baseUrl);
    return;
  }

  customProxyTargetUrl = baseUrl.trim();
  applyInterceptor();
};
