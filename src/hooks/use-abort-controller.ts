import { useCallback, useRef } from "react";

const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const abort = useCallback((reason?: string) => {
    if (!abortControllerRef.current) return;

    abortControllerRef.current.abort(reason);
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current = null;
  }, []);

  const abortify = useCallback(
    <Data>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      promiseFn: (...args: any[]) => Promise<Data>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): ((...args: any[]) => Promise<Data>) => {
      abortControllerRef.current = null;
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) =>
        new Promise<Data>((resolve, reject) => {
          if (signal.aborted) reject(signal.reason);

          promiseFn(...args)
            .then(resolve)
            .catch(reject);

          signal.addEventListener("abort", () => {
            reject(signal.reason);
          });
        });
    },
    []
  );

  return { abort, reset, abortify };
};

export default useAbortController;
