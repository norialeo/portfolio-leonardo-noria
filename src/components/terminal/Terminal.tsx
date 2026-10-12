import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router";
import { profile } from "../../data/profile";
import { useLang } from "../../hooks/useLang";
import { ApiError, askAI, type ChatTurn } from "../../lib/api";
import { commandNames, findCommand, type CommandContext } from "./commands";
import styles from "./Terminal.module.css";
import { useTerminal } from "./TerminalContext";

type Entry = { id: number; kind: "input" | "output" | "error" | "system" | "ai"; content: ReactNode; streaming?: boolean };

let nextId = 1;

export function Terminal() {
  const { isOpen, close, consumePending } = useTerminal();
  const { t, lang, setLang } = useLang();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const historyRef = useRef<string[]>([]);
  const cursorRef = useRef(-1);
  const chatRef = useRef<ChatTurn[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const push = useCallback((entry: Omit<Entry, "id">) => {
    const id = nextId++;
    setEntries((list) => [...list, { ...entry, id }]);
    return id;
  }, []);

  const update = useCallback((id: number, patch: Partial<Entry>) => {
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const welcome = useCallback(() => {
    push({
      kind: "system",
      content: (
        <>
          <span className={styles.accent}>noria-sh 1.0</span> — {lang === "pt" ? "terminal do portfólio de" : "portfolio terminal of"} {profile.name}
          <br />
          <span className={styles.muted}>
            {lang === "pt" ? "digite " : "type "}
            <span className={styles.accent}>help</span>
            {lang === "pt" ? " para ver os comandos, ou faça uma pergunta em linguagem natural." : " to see the commands, or ask a question in plain language."}
          </span>
        </>
      ),
    });
  }, [lang, push]);

  const ask = useCallback(
    async (question: string) => {
      setBusy(true);
      const id = push({ kind: "ai", content: "", streaming: true });
      let text = "";
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const answer = await askAI(
          question,
          chatRef.current,
          (chunk) => {
            text += chunk;
            update(id, { content: text });
          },
          controller.signal,
        );
        chatRef.current = [...chatRef.current, { role: "user" as const, text: question }, { role: "model" as const, text: answer }].slice(-8);
        update(id, { streaming: false, content: answer || "…" });
      } catch (error) {
        const api = error instanceof ApiError ? error : null;
        let message: ReactNode;
        if (controller.signal.aborted) message = lang === "pt" ? "(cancelado)" : "(cancelled)";
        else if (api?.code === "not_configured")
          message =
            lang === "pt" ? (
              <>
                IA offline neste ambiente (falta a GEMINI_API_KEY). Enquanto isso: <span className={styles.accent}>whoami</span>, <span className={styles.accent}>neofetch</span>, <span className={styles.accent}>projects</span> e <span className={styles.accent}>experience</span> respondem quase tudo.
              </>
            ) : (
              <>
                AI is offline in this environment (missing GEMINI_API_KEY). Meanwhile, <span className={styles.accent}>whoami</span>, <span className={styles.accent}>neofetch</span>, <span className={styles.accent}>projects</span> and <span className={styles.accent}>experience</span> answer almost everything.
              </>
            );
        else if (api?.code === "overloaded")
          message = lang === "pt" ? "A IA do Google está sobrecarregada agora. Tente de novo em alguns segundos." : "Google's AI is overloaded right now. Try again in a few seconds.";
        else if (api?.status === 429) message = lang === "pt" ? `Calma! Muitas perguntas seguidas — tente em ${api.retryAfter ?? 60}s.` : `Easy! Too many questions — try again in ${api.retryAfter ?? 60}s.`;
        else message = lang === "pt" ? "Não consegui falar com a IA agora. Tente de novo ou use contact." : "Couldn't reach the AI right now. Try again or use contact.";
        update(id, { kind: "error", streaming: false, content: message });
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [lang, push, update],
  );

  const execute = useCallback(
    (raw: string) => {
      const line = raw.trim();
      push({ kind: "input", content: line });
      if (!line) return;
      historyRef.current = [line, ...historyRef.current.filter((h) => h !== line)].slice(0, 50);
      cursorRef.current = -1;

      const [name = "", ...args] = line.split(/\s+/);
      const ctx: CommandContext = {
        lang,
        print: (content, kind = "output") => push({ kind, content }),
        clear: () => setEntries([]),
        close,
        navigate: (to) => void navigate(to),
        setLang,
        ask: (q) => void ask(q),
      };
      const command = findCommand(name);
      if (command) return void command.run(args, ctx);

      // não é comando: se parece uma frase, vira pergunta para a IA
      if (args.length > 0 || line.endsWith("?")) return void ask(line);
      push({
        kind: "error",
        content: (
          <>
            {name}: {lang === "pt" ? "comando não encontrado. Tente " : "command not found. Try "}
            <span className={styles.accent}>help</span>
          </>
        ),
      });
    },
    [ask, close, lang, navigate, push, setLang],
  );

  // Abrir/fechar: foco, rolagem da página e comando pendente
  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    if (entries.length === 0) welcome();
    const pending = consumePending();
    if (pending) execute(pending);
    const id = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
      abortRef.current?.abort();
      returnFocusRef.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [entries]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (busy) return;
      execute(value);
      setValue("");
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (busy) abortRef.current?.abort();
      else close();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(cursorRef.current + 1, historyRef.current.length - 1);
      if (next >= 0) {
        cursorRef.current = next;
        setValue(historyRef.current[next] ?? "");
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = cursorRef.current - 1;
      cursorRef.current = Math.max(-1, next);
      setValue(next >= 0 ? (historyRef.current[next] ?? "") : "");
    } else if (event.key === "Tab") {
      event.preventDefault();
      const match = commandNames.filter((n) => n.startsWith(value.trim().toLowerCase()));
      if (value.trim() && match.length === 1) setValue(`${match[0]} `);
      else if (value.trim() && match.length > 1) push({ kind: "output", content: <span className={styles.muted}>{match.join("  ")}</span> });
    } else if (event.key.toLowerCase() === "l" && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  const suggestions = lang === "pt" ? ["help", "neofetch", "projects", "o que você faz na LITS?", "sudo hire leonardo"] : ["help", "neofetch", "projects", "what do you do at LITS?", "sudo hire leonardo"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className={styles.window}
            role="dialog"
            aria-modal="true"
            aria-label={t("terminal.label")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.bar}>
              <span className={styles.lights} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className={`mono ${styles.title}`}>{t("terminal.title")}</span>
              <button type="button" className={styles.close} onClick={close} aria-label={t("terminal.close")}>
                <FiX aria-hidden="true" />
              </button>
            </div>

            <div ref={bodyRef} className={styles.body} role="log" aria-live="polite" onClick={() => inputRef.current?.focus()}>
              {entries.map((entry) => (
                <div key={entry.id} className={`${styles.entry} ${styles[entry.kind]}`}>
                  {entry.kind === "input" ? (
                    <>
                      <span className={styles.prompt} aria-hidden="true">
                        noria@portfolio:~$
                      </span>{" "}
                      {entry.content}
                    </>
                  ) : entry.kind === "ai" ? (
                    <>
                      <span className={styles.aiTag}>leonardo.ai</span> {entry.content}
                      {entry.streaming && <span className={styles.caret} aria-hidden="true" />}
                    </>
                  ) : (
                    entry.content
                  )}
                </div>
              ))}
            </div>

            {entries.length <= 1 && (
              <div className={styles.chips}>
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => execute(s)} disabled={busy}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            <label className={styles.inputRow}>
              <span className={styles.prompt} aria-hidden="true">
                noria@portfolio:~$
              </span>
              <span className="sr-only">{t("terminal.placeholder")}</span>
              <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={busy ? "…" : t("terminal.placeholder")}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                maxLength={600}
              />
            </label>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
