import { useCallback, useState } from "react";

export const useSheet = (defaultVisibility: number = 0) => {
  const [visibility, setVisibility] = useState(defaultVisibility);

  const open = useCallback((visibility: number) => {
    setVisibility(visibility);
  }, []);

  const close = useCallback(() => {
    setVisibility(0);
  }, []);

  return {
    visibility,
    open,
    close,
  };
};
