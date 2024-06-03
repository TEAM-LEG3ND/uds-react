import { ReactNode } from "react";
import { createPortal } from "react-dom";

import usePresence from "@/hooks/use-presence";

import classNames from "./index.module.css";

interface Props {
  visible: boolean;
  content: ReactNode;
}

function Toast({ visible, content }: Props) {
  const { isPresent, ref } = usePresence<HTMLDivElement>(visible);

  return (
    <>
      {createPortal(
        isPresent ? (
          <div ref={ref} className={classNames.container}>
            {content}
          </div>
        ) : null,
        document.body
      )}
    </>
  );
}

export default Toast;
