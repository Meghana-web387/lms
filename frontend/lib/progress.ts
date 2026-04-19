export function createDebouncedProgress(
  fn: (seconds: number, completed?: boolean) => Promise<void>,
  delayMs: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return {
    schedule(seconds: number) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        void fn(seconds);
      }, delayMs);
    },
    async flush(seconds: number, completed?: boolean) {
      if (timer) clearTimeout(timer);
      timer = null;
      await fn(seconds, completed);
    },
  };
}
