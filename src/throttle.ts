export const throttle = (fn: Function, timeout: number) => {
  let lastRan = -1;
  let now;
  return function (...args: any[]) {
    now = Date.now();
    if (now - lastRan > timeout) {
      fn(...args);
      lastRan = now;
    }
  };
};
