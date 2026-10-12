import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation } from "react-router";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLang } from "../hooks/useLang";
import styles from "./NotFound.module.css";

// Chiado de TV fora do ar, desenhado em baixa resolução e ampliado pelo CSS.
function Static({ still }: { still: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = 160;
    canvas.height = 90;
    const image = ctx.createImageData(160, 90);
    let raf = 0;
    const frame = () => {
      for (let i = 0; i < image.data.length; i += 4) {
        const v = Math.random() * 255;
        image.data[i] = v;
        image.data[i + 1] = v;
        image.data[i + 2] = v;
        image.data[i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
      if (!still) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [still]);
  return <canvas ref={ref} className={styles.static} aria-hidden="true" />;
}

export function NotFound() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const reduce = useReducedMotion() ?? false;
  useDocumentTitle("404");

  return (
    <section className={styles.wrap}>
      <Static still={reduce} />
      <div className={`container ${styles.content}`}>
        <p className={`mono ${styles.ch}`}>
          <span className={styles.dot} aria-hidden="true" /> CH-404 · NO SIGNAL
        </p>
        <h1 className={`display ${styles.title}`}>{t("notFound.title")}</h1>
        <p className={styles.text}>{t("notFound.text", { path: pathname })}</p>
        <Link to="/" className="btn btn--primary">
          <FiArrowLeft aria-hidden="true" /> {t("notFound.back")}
        </Link>
      </div>
    </section>
  );
}
