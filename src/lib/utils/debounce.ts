/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was invoked.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced function
 */
export function debounce<T extends unknown[]>(func: (...args: T) => unknown, wait: number): (...args: T) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: T) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
