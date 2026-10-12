import type { ReactNode } from "react";
import { useLang } from "../../hooks/useLang";
import { useNow } from "../../hooks/useNow";
import styles from "./PageHeader.module.css";

type Props = { channel: string; label: string; title: ReactNode; lead?: ReactNode; aside?: ReactNode };

// Cabeçalho de página no formato "canal de câmera": CH-02 ● REC + título grande.
export function PageHeader({ channel, label, title, lead, aside }: Props) {
  const { locale } = useLang();
  const now = useNow(1000);
  return (
    <header className={`container ${styles.header}`}>
      <div className={`mono ${styles.meta}`}>
        <span className={styles.rec}>
          <span className={styles.dot} aria-hidden="true" /> REC
        </span>
        <span>CH-{channel}</span>
        <span className={styles.sep} aria-hidden="true">/</span>
        <span>{label}</span>
        <span className={styles.clock}>
          {now.toLocaleDateString(locale, { timeZone: "America/Sao_Paulo" })} ·{" "}
          {now.toLocaleTimeString(locale, { timeZone: "America/Sao_Paulo", hour12: false })}
        </span>
      </div>
      <div className={styles.row}>
        <div>
          <h1 className={`display ${styles.title}`}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </div>
        {aside && <div className={styles.aside}>{aside}</div>}
      </div>
    </header>
  );
}
