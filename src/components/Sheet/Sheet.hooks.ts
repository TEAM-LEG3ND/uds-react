import { useCallback, useState } from "react";

export const useSheet = (defaultOpen: boolean = false) => {
  const [opened, setOpened] = useState(defaultOpen);

  const open = useCallback(() => {
    setOpened(true);
  }, []);

  const close = useCallback(() => {
    setOpened(false);
  }, []);

  const toggle = useCallback(() => {
    setOpened((o) => !o);
  }, []);

  return {
    opened,
    open,
    close,
    toggle,
  };
};
