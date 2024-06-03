import { ReactNode } from "react";

import classNames from "./GNB.module.css";

interface Props {
  rightSection: ReactNode;
}

export default function GNB({ rightSection }: Props) {
  return (
    <header className={classNames.container}>
      <nav className={classNames.nav}>
        <div className={classNames.right_section}>{rightSection}</div>
      </nav>
    </header>
  );
}
