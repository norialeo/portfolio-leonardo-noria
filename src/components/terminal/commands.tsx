import type { ReactNode } from "react";
import { experiences } from "../../data/experience";
import { profile } from "../../data/profile";
import { projects } from "../../data/projects";
import { skillGroups } from "../../data/skills";
import type { L10n, Lang } from "../../data/types";
import { fetchGitHub } from "../../lib/api";
import { formatDate, formatMonth } from "../../lib/format";
import { socials } from "../../lib/socials";
import styles from "./Terminal.module.css";

export type CommandContext = {
  lang: Lang;
  print: (node: ReactNode, kind?: "output" | "error" | "system") => void;
  clear: () => void;
  close: () => void;
  navigate: (to: string) => void;
  setLang: (lang: Lang) => void;
  ask: (question: string) => void;
};

type Command = {
  name: string;
  aliases?: string[];
  args?: string;
  description: L10n;
  run: (args: string[], ctx: CommandContext) => void | Promise<void>;
  hidden?: boolean;
};

const A = ({ children }: { children: ReactNode }) => <span className={styles.accent}>{children}</span>;
const M = ({ children }: { children: ReactNode }) => <span className={styles.muted}>{children}</span>;
const W = ({ children }: { children: ReactNode }) => <span className={styles.warn}>{children}</span>;

const pages: Record<string, string> = {
  "~": "/",
  "/": "/",
  home: "/",
  inicio: "/",
  sobre: "/sobre",
  about: "/sobre",
  projetos: "/projetos",
  projects: "/projetos",
  experiencias: "/experiencias",
  experience: "/experiencias",
  contato: "/contato",
  contact: "/contato",
};

const tr = (text: L10n, lang: Lang) => text[lang];

export const commands: Command[] = [
  {
    name: "help",
    aliases: ["ajuda", "?"],
    description: { pt: "lista os comandos", en: "lists the commands" },
    run: (_, { print, lang }) =>
      print(
        <div className={styles.table}>
          {commands
            .filter((c) => !c.hidden)
            .map((c) => (
              <div key={c.name} className={styles.row}>
                <A>
                  {c.name}
                  {c.args ? ` ${c.args}` : ""}
                </A>
                <M>{tr(c.description, lang)}</M>
              </div>
            ))}
          <div className={styles.gapLine}>
            <M>{lang === "pt" ? "Dica: escreva uma pergunta qualquer e a IA responde por mim. ↑/↓ histórico · Tab completa · Esc fecha" : "Tip: type any question and the AI answers for me. ↑/↓ history · Tab completes · Esc closes"}</M>
          </div>
        </div>,
      ),
  },
  {
    name: "whoami",
    description: { pt: "quem sou eu, em uma linha", en: "who I am, in one line" },
    run: (_, { print, lang }) =>
      print(
        <>
          <A>{profile.name}</A> — {tr(profile.role, lang)} · {profile.city}
          <br />
          <M>Flutter · Go · React/Vue · TypeScript · PostgreSQL · gRPC</M>
        </>,
      ),
  },
  {
    name: "neofetch",
    aliases: ["fetch"],
    description: { pt: "ficha do sistema (eu)", en: "system info (me)" },
    run: (_, { print, lang }) => {
      const pt = lang === "pt";
      const info: [string, string][] = [
        ["OS", `${profile.city} · BR`],
        ["Host", pt ? "PUC Minas · Eng. de Software (2º período)" : "PUC Minas · Software Engineering (2nd sem.)"],
        ["Kernel", "Flutter · Go · TypeScript"],
        ["Uptime", pt ? "2 empresas em paralelo" : "2 companies in parallel"],
        ["Services", pt ? "LITS (app Flutter + Go) · Exxata (Vue 3 + APIs)" : "LITS (Flutter app + Go) · Exxata (Vue 3 + APIs)"],
        ["Shell", "noria-sh 1.0"],
        ["Stack", "PostgreSQL · Kubernetes · ArgoCD · Docker"],
        ["Mobile", "Flutter · Riverpod · Firebase Auth · a11y"],
        ["Locale", pt ? "pt-BR (nativo) · en (intermediário avançado)" : "pt-BR (native) · en (upper intermediate)"],
      ];
      print(
        <div className={styles.fetch}>
          <pre className={styles.logo} aria-hidden="true">{`┌─┐    ┌─┐
│ L    N │
│        │
└─┘    └─┘`}</pre>
          <div>
            <div>
              <A>noria</A>@<A>portfolio</A>
            </div>
            <div>
              <M>───────────────</M>
            </div>
            {info.map(([k, v]) => (
              <div key={k}>
                <A>{k}</A>: {v}
              </div>
            ))}
            <div className={styles.swatches} aria-hidden="true">
              <span style={{ background: "#c8ff3d" }} />
              <span style={{ background: "#ffb224" }} />
              <span style={{ background: "#ff4d3d" }} />
              <span style={{ background: "#4ade80" }} />
              <span style={{ background: "#e9ede7" }} />
              <span style={{ background: "#6f7a73" }} />
            </div>
          </div>
        </div>,
      );
    },
  },
  {
    name: "ls",
    description: { pt: "lista as páginas", en: "lists the pages" },
    run: (_, { print }) =>
      print(
        <>
          <A>sobre/</A> &nbsp; <A>projetos/</A> &nbsp; <A>experiencias/</A> &nbsp; <A>contato/</A> &nbsp; curriculo.pdf &nbsp; resume.pdf
        </>,
      ),
  },
  {
    name: "cd",
    args: "<pg>",
    description: { pt: "vai para uma página (cd projetos)", en: "goes to a page (cd projects)" },
    run: ([target = "~"], { print, navigate, close, lang }) => {
      const to = pages[target.replace(/\/$/, "").toLowerCase()];
      if (!to) return print(<W>cd: {target}: {lang === "pt" ? "diretório não encontrado" : "no such directory"}</W>, "error");
      navigate(to);
      close();
    },
  },
  {
    name: "about",
    aliases: ["sobre"],
    description: { pt: "abre a página Sobre", en: "opens the About page" },
    run: (_, ctx) => commands.find((c) => c.name === "cd")!.run(["sobre"], ctx),
  },
  {
    name: "projects",
    aliases: ["projetos"],
    description: { pt: "lista os projetos (do mais antigo ao mais novo)", en: "lists projects (oldest to newest)" },
    run: (_, { print, lang }) =>
      print(
        <div className={styles.table}>
          {[...projects]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((p, i) => (
              <div key={p.slug} className={styles.row}>
                <M>
                  {String(i + 1).padStart(2, "0")} · {formatDate(p.date, lang)}
                </M>
                <span>
                  <a href={p.github} target="_blank" rel="noreferrer" className={styles.link}>
                    {tr(p.title, lang)}
                  </a>{" "}
                  <M>[{p.tech.slice(0, 3).join(", ")}]</M>
                </span>
              </div>
            ))}
          <div className={styles.gapLine}>
            <M>{lang === "pt" ? "→ cd projetos para ver a linha do tempo" : "→ cd projects to see the timeline"}</M>
          </div>
        </div>,
      ),
  },
  {
    name: "experience",
    aliases: ["exp", "experiencias"],
    description: { pt: "onde trabalho hoje", en: "where I work today" },
    run: (_, { print, lang }) =>
      print(
        <div className={styles.table}>
          {[...experiences]
            .sort((a, b) => b.start.localeCompare(a.start))
            .map((job) => (
              <div key={job.id} className={styles.row}>
                <span className={styles.ok}>● RUNNING</span>
                <span>
                  <A>{job.company}</A> — {tr(job.role, lang)} <M>({formatMonth(job.start, lang)} → {lang === "pt" ? "atual" : "present"})</M>
                </span>
              </div>
            ))}
        </div>,
      ),
  },
  {
    name: "skills",
    aliases: ["stack"],
    description: { pt: "minha stack por área", en: "my stack by area" },
    run: (_, { print, lang }) =>
      print(
        <div className={styles.table}>
          {skillGroups.map((g) => (
            <div key={g.id} className={styles.row}>
              <A>{tr(g.label, lang)}</A>
              <span>{g.items.join(" · ")}</span>
            </div>
          ))}
        </div>,
      ),
  },
  {
    name: "contact",
    aliases: ["contato"],
    description: { pt: "canais de contato", en: "contact channels" },
    run: (_, { print }) =>
      print(
        <div className={styles.table}>
          {socials.map((s) => (
            <div key={s.id} className={styles.row}>
              <A>{s.label}</A>
              <a href={s.href} target={s.id === "email" ? undefined : "_blank"} rel="noreferrer" className={styles.link}>
                {s.handle}
              </a>
            </div>
          ))}
        </div>,
      ),
  },
  {
    name: "github",
    description: { pt: "estatísticas ao vivo do GitHub", en: "live GitHub stats" },
    run: async (_, { print, lang }) => {
      try {
        const data = await fetchGitHub();
        print(
          <>
            <A>@{data.profile.login}</A> · {data.profile.publicRepos} repos · {data.profile.followers} {lang === "pt" ? "seguidores" : "followers"}
            <br />
            <M>{data.languages.map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(" · ")}</M>
            <br />
            <a href={profile.github} target="_blank" rel="noreferrer" className={styles.link}>
              {profile.github}
            </a>
          </>,
        );
      } catch {
        print(<W>{lang === "pt" ? "GitHub indisponível agora." : "GitHub unavailable right now."}</W>, "error");
      }
    },
  },
  {
    name: "cv",
    aliases: ["curriculo", "resume"],
    description: { pt: "baixa meu currículo (PDF)", en: "downloads my résumé (PDF)" },
    run: (_, { print, lang }) => {
      const link = document.createElement("a");
      link.href = profile.cv[lang];
      link.download = "";
      link.click();
      print(<>{lang === "pt" ? "baixando" : "downloading"} <A>{profile.cv[lang].split("/").pop()}</A>…</>);
    },
  },
  {
    name: "cat",
    args: "<arq>",
    hidden: true,
    description: { pt: "lê um arquivo", en: "reads a file" },
    run: ([file = ""], ctx) => {
      if (/curriculo|resume|cv/i.test(file)) return commands.find((c) => c.name === "cv")!.run([], { ...ctx, lang: /resume/i.test(file) ? "en" : ctx.lang });
      ctx.print(<W>cat: {file || "?"}: {ctx.lang === "pt" ? "arquivo não encontrado" : "no such file"}</W>, "error");
    },
  },
  {
    name: "lang",
    args: "pt|en",
    description: { pt: "troca o idioma do site", en: "switches the site language" },
    run: ([next], { print, setLang, lang }) => {
      if (next !== "pt" && next !== "en") return print(<W>{lang === "pt" ? "uso: lang pt | lang en" : "usage: lang pt | lang en"}</W>, "error");
      setLang(next);
      print(<>{next === "pt" ? "idioma: português 🇧🇷" : "language: English 🇺🇸"}</>);
    },
  },
  {
    name: "ask",
    args: "<?>",
    description: { pt: "pergunta para a IA (ou só escreva a pergunta)", en: "asks the AI (or just type the question)" },
    run: (args, { ask, print, lang }) => {
      const question = args.join(" ").trim();
      if (!question) return print(<W>{lang === "pt" ? "uso: ask <pergunta>" : "usage: ask <question>"}</W>, "error");
      ask(question);
    },
  },
  {
    name: "date",
    hidden: true,
    description: { pt: "data e hora em BH", en: "date and time in BH" },
    run: (_, { print, lang }) => print(new Date().toLocaleString(lang === "pt" ? "pt-BR" : "en-US", { timeZone: profile.timezone, dateStyle: "full", timeStyle: "medium" })),
  },
  {
    name: "sudo",
    hidden: true,
    description: { pt: "", en: "" },
    run: (args, { print, navigate, close, lang }) => {
      if (args.join(" ").toLowerCase().includes("hire")) {
        print(<span className={styles.ok}>[sudo] {lang === "pt" ? "permissão concedida ✓ abrindo canal de contato…" : "permission granted ✓ opening contact channel…"}</span>);
        window.setTimeout(() => {
          navigate("/contato");
          close();
        }, 900);
        return;
      }
      print(<W>{lang === "pt" ? "boa tentativa. experimente: sudo hire leonardo" : "nice try. try: sudo hire leonardo"}</W>, "error");
    },
  },
  {
    name: "clear",
    aliases: ["cls"],
    description: { pt: "limpa a tela", en: "clears the screen" },
    run: (_, { clear }) => clear(),
  },
  {
    name: "exit",
    aliases: ["quit", "q"],
    description: { pt: "fecha o terminal", en: "closes the terminal" },
    run: (_, { close }) => close(),
  },
];

export function findCommand(name: string) {
  const key = name.toLowerCase();
  return commands.find((c) => c.name === key || c.aliases?.includes(key));
}

export const commandNames = commands.flatMap((c) => [c.name, ...(c.aliases ?? [])]);
