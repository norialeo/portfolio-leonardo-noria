import type { L10n } from "./types";

// Conteúdo da página "Sobre Mim", em português e inglês.

export const intro: { lead: L10n; body: L10n[] } = {
  lead: {
    pt: "Sou desenvolvedor full stack. Transito entre apps mobile em Flutter, APIs em Python e Go, front-end em Vue e visão computacional — e gosto de entender por que as coisas quebram em produção.",
    en: "I'm a full stack developer. I move between Flutter mobile apps, Python and Go APIs, Vue front-ends and computer vision — and I like understanding why things break in production.",
  },
  body: [
    {
      pt: "Moro em Belo Horizonte, estou no 2º período de Engenharia de Software na PUC Minas e já trabalho em dois produtos em produção. Na LITS, desenvolvo um app social de tênis: telas em Flutter e microsserviços em Go com gRPC e PostgreSQL, com pagamentos via PIX e cartão. Na Exxata Engenharia, trabalho no OPTIKON, uma plataforma de monitoramento por câmeras: APIs REST em Python/FastAPI, front-end em Vue 3 com dashboards e modelos de visão computacional (YOLO, OpenCV) rodando em tempo real em produção.",
      en: "I live in Belo Horizonte, Brazil. I'm in my second semester of Software Engineering at PUC Minas and already work on two products in production. At LITS, I build a social tennis app: Flutter screens and Go microservices with gRPC and PostgreSQL, with PIX and card payments. At Exxata Engenharia, I work on OPTIKON, a camera monitoring platform: Python/FastAPI REST APIs, a Vue 3 front-end with dashboards and computer vision models (YOLO, OpenCV) running in real time in production.",
    },
    {
      pt: "Entrego funcionalidades ponta a ponta — do banco de dados à interface, seja no app ou na web — com ênfase em integridade de dados, segurança e testes. Em code review, já encontrei e corrigi bugs que teriam quebrado todas as confirmações de reservas pagas e gerado cobranças PIX indevidas.",
      en: "I ship features end to end — from the database to the interface, on mobile or the web — with a strong focus on data integrity, security and testing. In code review, I've caught and fixed bugs that would have broken every paid booking confirmation and triggered wrongful PIX charges.",
    },
  ],
};

export type AboutFact = { id: string; label: L10n; title: L10n; text: L10n };

export const facts: AboutFact[] = [
  {
    id: "education",
    label: { pt: "Formação", en: "Education" },
    title: { pt: "Engenharia de Software · PUC Minas", en: "B.Sc. Software Engineering · PUC Minas" },
    text: {
      pt: "Bacharelado em andamento, 2º período, com conclusão prevista para 2029. Os trabalhos da faculdade estão na linha do tempo de projetos.",
      en: "Bachelor's degree in progress — 2nd semester, expected to graduate in 2029. My university projects are on the projects timeline.",
    },
  },
  {
    id: "field",
    label: { pt: "Área de atuação", en: "What I do" },
    title: { pt: "Full stack e mobile", en: "Full stack and mobile" },
    text: {
      pt: "Apps mobile em Flutter, interfaces web em Vue e React, e o back-end que sustenta tudo: APIs e microsserviços em Go e Python, PostgreSQL e deploy com Kubernetes e GitOps — além de visão computacional (YOLO, OpenCV) aplicada a produtos.",
      en: "Flutter mobile apps, Vue and React web interfaces, and the back-end behind them: Go and Python APIs and microservices, PostgreSQL and deploys with Kubernetes and GitOps — plus computer vision (YOLO, OpenCV) applied to products.",
    },
  },
  {
    id: "interests",
    label: { pt: "Interesses", en: "Interests" },
    title: { pt: "Produto, mobile e arquitetura", en: "Product, mobile and architecture" },
    text: {
      pt: "Construir produtos que as pessoas usam no dia a dia, UX e acessibilidade no mobile, arquitetura de sistemas e automação. Fora do código: jogos online, esportes, filmes e séries — e o Cruzeiro, desde criança.",
      en: "Building products people use every day, mobile UX and accessibility, systems architecture and automation. Away from the keyboard: online games, sports, movies and TV shows — and Cruzeiro, my football club since I was a kid.",
    },
  },
  {
    id: "goals",
    label: { pt: "Objetivos", en: "Goals" },
    title: { pt: "Crescer como full stack", en: "Grow as a full stack engineer" },
    text: {
      pt: "Me tornar um desenvolvedor full stack e mobile de referência, que entrega produtos completos com qualidade — do app ao banco de dados. No curto prazo: aprofundar em arquitetura mobile, sistemas distribuídos e testes.",
      en: "Become a go-to full stack and mobile developer who ships complete, high-quality products — from the app to the database. Short term: go deeper into mobile architecture, distributed systems and testing.",
    },
  },
];

export const languages: { name: L10n; level: L10n; value: number }[] = [
  { name: { pt: "Português", en: "Portuguese" }, level: { pt: "Nativo", en: "Native" }, value: 1 },
  { name: { pt: "Inglês", en: "English" }, level: { pt: "Intermediário avançado", en: "Upper intermediate" }, value: 0.72 },
];
