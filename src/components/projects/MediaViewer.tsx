import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from "react-icons/fi";
import type { ProjectMedia } from "../../data/projects";
import { useLang } from "../../hooks/useLang";
import { Detection } from "../ui/Detection";
import styles from "./MediaViewer.module.css";

// Galeria de um projeto: imagem/GIF/prévia animada + ampliação em <dialog>.
export function MediaViewer({ media, title, trackId }: { media: ProjectMedia[]; title: string; trackId: string }) {
  const { t, tr } = useLang();
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const current = media[index];
  const many = media.length > 1;

  const go = (delta: number) => setIndex((i) => (i + delta + media.length) % media.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (event: KeyboardEvent) => {
      if (!many) return;
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  });

  if (!current) return null;
  const kindLabel = current.kind === "capture" ? t("projects.capture") : t("projects.preview");

  return (
    <div className={styles.viewer}>
      <Detection label={`${current.kind} ${index + 1}/${media.length}`} trackId={trackId} className={styles.frame}>
        <button type="button" className={styles.open} onClick={() => dialogRef.current?.showModal()} aria-label={`${t("projects.enlarge")}: ${tr(current.alt)}`}>
          <img
            key={current.src}
            src={current.src}
            alt={tr(current.alt)}
            loading="lazy"
            decoding="async"
            className={current.kind === "capture" ? styles.capture : styles.preview}
          />
          <span className={styles.zoom} aria-hidden="true">
            <FiMaximize2 />
          </span>
        </button>
        <span className={`mono ${styles.kind} ${current.kind === "preview" ? styles.kindPreview : ""}`} title={current.kind === "preview" ? t("projects.previewNote") : undefined}>
          {kindLabel}
        </span>
      </Detection>

      {many && (
        <div className={styles.pager}>
          <button type="button" onClick={() => go(-1)} aria-label={t("projects.prev")}>
            <FiChevronLeft aria-hidden="true" />
          </button>
          <ol className={styles.dots}>
            {media.map((m, i) => (
              <li key={m.src}>
                <button type="button" aria-label={`${i + 1}: ${tr(m.alt)}`} aria-current={i === index} onClick={() => setIndex(i)} />
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => go(1)} aria-label={t("projects.next")}>
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
      )}

      <dialog ref={dialogRef} className={styles.dialog} aria-label={title} onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}>
        <div className={styles.dialogInner}>
          <div className={`mono ${styles.dialogBar}`}>
            <span>
              {title} · {kindLabel} {index + 1}/{media.length}
            </span>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label={t("common.close")} autoFocus>
              <FiX aria-hidden="true" />
            </button>
          </div>
          <img src={current.src} alt={tr(current.alt)} className={styles.dialogImg} />
          <p className={styles.dialogCaption}>
            {tr(current.alt)}
            {current.kind === "preview" && <span className="muted"> — {t("projects.previewNote")}</span>}
          </p>
          {many && (
            <div className={styles.dialogNav}>
              <button type="button" className="btn" onClick={() => go(-1)}>
                <FiChevronLeft aria-hidden="true" /> {t("projects.prev")}
              </button>
              <button type="button" className="btn" onClick={() => go(1)}>
                {t("projects.next")} <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
