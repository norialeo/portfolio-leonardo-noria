import type { CSSProperties, ElementType, ReactNode } from "react";
import styles from "./Detection.module.css";

type Props = {
  /** rótulo da "detecção", ex.: "person 0.99" */
  label?: ReactNode;
  /** texto no canto inferior direito, ex.: "#001" */
  trackId?: ReactNode;
  tone?: "lime" | "amber" | "muted";
  /** mostra os cantos só no hover/foco */
  hoverOnly?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

// Moldura de "caixa de detecção" (cantos + rótulo) — o motivo visual do site.
export function Detection({ label, trackId, tone = "lime", hoverOnly = false, as: Tag = "div", className = "", style, children }: Props) {
  return (
    <Tag className={`${styles.box} ${styles[tone]} ${hoverOnly ? styles.hoverOnly : ""} ${className}`} style={style}>
      <span className={styles.corners} aria-hidden="true" />
      {label && (
        <span className={styles.label} aria-hidden="true">
          {label}
        </span>
      )}
      {trackId && (
        <span className={styles.track} aria-hidden="true">
          {trackId}
        </span>
      )}
      {children}
    </Tag>
  );
}
