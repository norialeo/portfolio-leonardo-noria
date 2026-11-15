import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useLocation, useOutlet } from "react-router";
import { useLang } from "../../hooks/useLang";
import { Terminal } from "../terminal/Terminal";
import { TerminalProvider } from "../terminal/TerminalContext";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./Layout.module.css";

// Mantém a página antiga renderizada enquanto ela anima a saída.
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

export function Layout() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const { t } = useLang();

  return (
    <TerminalProvider>
      <a className="skip-link" href="#conteudo">
        {t("a11y.skip")}
      </a>
      <Header />
      <div className={styles.stage}>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
          <motion.main
            key={location.pathname}
            id="conteudo"
            tabIndex={-1}
            className={styles.main}
            // só opacidade e deslocamento: animar blur na página inteira derrubava os quadros
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            // Depois da troca de página, leva o foco (e o leitor de tela) para o conteúdo novo
            onAnimationComplete={() => document.getElementById("conteudo")?.focus({ preventScroll: true })}
          >
            <FrozenOutlet />
          </motion.main>
        </AnimatePresence>
        {!reduce && <div key={location.pathname} className={styles.scan} aria-hidden="true" />}
      </div>
      <Footer />
      <Terminal />
    </TerminalProvider>
  );
}
