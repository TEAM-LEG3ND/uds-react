import { ComponentPropsWithoutRef } from "react";

import classNames from "@/ui/avatar/Avatar.module.css";

interface Props extends ComponentPropsWithoutRef<"div"> {
  src: string;
}

export default function Avatar({ src, className, ...props }: Props) {
  return (
    <div className={`${classNames.container} ${className}`} {...props}>
      <img src={src} alt="내 정보 아바타" className={classNames.avatar} />
    </div>
  );
}
