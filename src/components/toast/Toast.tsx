import { ReactNode } from "react";
import { createPortal } from "react-dom";

import classNames from "@/components/toast/Toast.module.css";
import usePresence from "@/hooks/use-presence";

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
