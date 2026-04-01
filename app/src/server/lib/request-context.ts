interface RequestContext {
  waitUntil: (promise: Promise<unknown>) => void;
}

let currentContext: RequestContext | undefined;

export function runWithContext<T>(
  ctx: RequestContext,
  fn: () => T | Promise<T>,
): T | Promise<T> {
  const prev = currentContext;
  currentContext = ctx;
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.finally(() => {
        currentContext = prev;
      });
    }
    currentContext = prev;
    return result;
  } catch (err) {
    currentContext = prev;
    throw err;
  }
}

export function getRequestContext(): RequestContext | undefined {
  return currentContext;
}
