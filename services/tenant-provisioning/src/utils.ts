export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  fn: () => Promise<T>,
  attempts: number,
  delayMs: number,
  label: string
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw new Error(
    `Failed ${label} after ${attempts} attempts: ${String(lastError)}`
  );
};

export const safeIdentifier = (value: string): string =>
  value.replace(/"/g, '');
