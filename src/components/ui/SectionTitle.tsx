import type { ReactNode } from "react";
import styles from "./SectionTitle.module.css";

export function SectionTitle({ index, children, id, aside }: { index: string; children: ReactNode; id?: string; aside?: ReactNode }) {
  return (
    <div className={styles.wrap}>
      <h2 id={id} className={styles.title}>
        <span className={`mono ${styles.index}`}>{index}</span>
        {children}
      </h2>
      {aside && <div className={styles.aside}>{aside}</div>}
    </div>
  );
}
