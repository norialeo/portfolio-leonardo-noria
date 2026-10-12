import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type TerminalState = {
  isOpen: boolean;
  open: (command?: string) => void;
  close: () => void;
  /** comando para executar assim que o terminal abrir (ex.: botão "pergunte à IA") */
  pending: string | null;
  consumePending: () => string | null;
};

const TerminalContext = createContext<TerminalState | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  const open = useCallback((command?: string) => {
    if (command) setPending(command);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  const consumePending = useCallback(() => {
    const value = pending;
    setPending(null);
    return value;
  }, [pending]);

  // Atalhos: Ctrl/⌘ + K abre e fecha; a crase (`) abre, como num console de jogo.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "`" && !typing) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ isOpen, open, close, pending, consumePending }),
    [isOpen, open, close, pending, consumePending],
  );
  return <TerminalContext.Provider value={value}>{children}</TerminalContext.Provider>;
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) throw new Error("useTerminal precisa estar dentro de <TerminalProvider>");
  return context;
}
