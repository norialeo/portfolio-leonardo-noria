import type { L10n } from "./types";

// Experiências profissionais. Cada destaque vira uma linha de "log",
// com uma tag que diz o tipo de impacto.
export type LogTag = "FIX" | "SEC" | "FEAT" | "OPS" | "DATA" | "QA" | "A11Y" | "AI" | "API";

export type Experience = {
  id: string;
  company: string;
  url?: string;
  role: L10n;
  /** AAAA-MM */
  start: string;
  /** AAAA-MM ou null (atual) */
  end: string | null;
  mode: L10n;
  product: { name: L10n; text: L10n };
  metrics: { value: string; label: L10n }[];
  highlights: { tag: LogTag; title: L10n; text: L10n }[];
  stack: string[];
};

export const experiences: Experience[] = [
  {
    id: "exxata",
    company: "Exxata Engenharia",
    role: {
      pt: "Desenvolvedor Full Stack",
      en: "Full Stack Developer",
    },
    start: "2026-08",
    end: null,
    mode: { pt: "Presencial · Belo Horizonte", en: "On-site · Belo Horizonte" },
    product: {
      name: { pt: "OPTIKON", en: "OPTIKON" },
      text: {
        pt: "Plataforma multiempresa de monitoramento de obras e operações industriais por câmeras: dashboards de produtividade e segurança, alertas, visão computacional em tempo real, sensores IoT e controle de acesso por empresa.",
        en: "Multi-tenant platform for camera monitoring of construction sites and industrial operations: productivity and safety dashboards, alerts, real-time computer vision, IoT sensors and per-company access control.",
      },
    },
    metrics: [
      { value: "Vue 3", label: { pt: "SPA com dashboards", en: "SPA with dashboards" } },
      { value: "Python", label: { pt: "APIs com FastAPI", en: "FastAPI APIs" } },
      { value: "YOLO", label: { pt: "visão computacional", en: "computer vision" } },
    ],
    highlights: [
      {
        tag: "FEAT",
        title: { pt: "Front-end e IoT", en: "Front-end and IoT" },
        text: {
          pt: "SPA em Vue 3 com dashboards em Chart.js (alertas, disponibilidade de câmeras, CPU/RAM/GPU) e visualização 3D em Three.js a partir de leituras binárias de ESP32 com LiDAR.",
          en: "Vue 3 SPA with Chart.js dashboards (alerts, camera availability, CPU/RAM/GPU) and a Three.js 3D view built from binary ESP32 LiDAR readings.",
        },
      },
      {
        tag: "API",
        title: { pt: "APIs REST distribuídas", en: "Distributed REST APIs" },
        text: {
          pt: "FastAPI, SQLAlchemy e PostgreSQL em arquitetura distribuída: banco central, bancos locais por servidor de processamento e roteamento de dados e streams de vídeo entre servidores.",
          en: "FastAPI, SQLAlchemy and PostgreSQL in a distributed architecture: a central database, local databases per processing server, and data and video-stream routing between servers.",
        },
      },
      {
        tag: "SEC",
        title: { pt: "Controle de acesso multiempresa", en: "Multi-tenant access control" },
        text: {
          pt: "JWT com admin global, gestores por empresa e restrição por página e por câmera, validada no back-end e no front-end.",
          en: "JWT with a global admin, per-company managers and per-page and per-camera restrictions, enforced on both back-end and front-end.",
        },
      },
      {
        tag: "API",
        title: { pt: "Integração FindFace Multi", en: "FindFace Multi integration" },
        text: {
          pt: "Reconhecimento facial e veicular com paginação sob demanda, deduplicação temporal de eventos, renovação de token e filtro de câmeras por empresa.",
          en: "Face and vehicle recognition with on-demand pagination, temporal event deduplication, token renewal and per-company camera filtering.",
        },
      },
      {
        tag: "OPS",
        title: { pt: "Operação em servidores com GPU", en: "Operating GPU servers" },
        text: {
          pt: "Docker Compose e Nginx em servidores Linux com GPU. Recuperei um serviço de IA em produção corrigindo incompatibilidade de driver NVIDIA (DKMS) e escrevi a documentação técnica completa do sistema.",
          en: "Docker Compose and Nginx on Linux GPU servers. Brought a production AI service back by fixing an NVIDIA driver (DKMS) mismatch, and wrote the system's full technical documentation.",
        },
      },
      {
        tag: "AI",
        title: { pt: "Integração com IA", en: "AI integration" },
        text: {
          pt: "Integrei à plataforma um modelo de detecção de pessoas e um pipeline que classifica a produtividade de operários, substituindo um processo manual.",
          en: "Integrated a person-detection model and a pipeline that classifies worker productivity into the platform, replacing a manual process.",
        },
      },
    ],
    stack: ["Vue 3", "Python", "FastAPI", "Pinia", "Chart.js", "YOLO", "OpenCV", "Three.js", "SQLAlchemy", "PostgreSQL", "SQLite", "Supabase", "JWT", "Docker", "Nginx", "Linux"],
  },
  {
    id: "lits",
    company: "LITS",
    role: {
      pt: "Desenvolvedor Full Stack & Mobile",
      en: "Full Stack & Mobile Developer",
    },
    start: "2026-09",
    end: null,
    mode: { pt: "Remoto", en: "Remote" },
    product: {
      name: { pt: "App social de tênis", en: "Social tennis app" },
      text: {
        pt: "Reserva de quadras em academias parceiras, jogos abertos em mapa, comunidades, chat, ranking e pagamento dividido entre jogadores via PIX e cartão. Time enxuto, entregas por milestone, issues no Linear, code review em PR e deploys versionados por branch de integração.",
        en: "Court booking at partner clubs, open games on a map, communities, chat, rankings and split payments between players via PIX and card. Lean team, milestone-based delivery, Linear issues, PR code review and versioned deploys through an integration branch.",
      },
    },
    metrics: [
      { value: "Flutter", label: { pt: "app mobile", en: "mobile app" } },
      { value: "Go", label: { pt: "microsserviços gRPC", en: "gRPC microservices" } },
      { value: "3", label: { pt: "idiomas no app (pt/en/es)", en: "app languages (pt/en/es)" } },
    ],
    highlights: [
      {
        tag: "FEAT",
        title: { pt: "Funcionalidades ponta a ponta", en: "End-to-end features" },
        text: {
          pt: "Protobuf, microsserviço Go, migration, BFF e app Flutter: busca de comunidades \"perto de mim\" com cálculo de distância, motivo de cancelamento de jogos, eventos de analytics no servidor e redesenho do fluxo de criação de jogo.",
          en: "Protobuf, Go microservice, migration, BFF and Flutter app: \"near me\" community search with distance calculation, game cancellation reasons, server-side analytics events and a redesigned game-creation flow.",
        },
      },
      {
        tag: "A11Y",
        title: { pt: "UI mobile fiel e acessível", en: "Faithful, accessible mobile UI" },
        text: {
          pt: "Telas Flutter a partir do protótipo (tema claro/escuro, i18n pt/en/es), com leitor de tela, alvo de toque de 48dp, texto ampliado e movimento reduzido.",
          en: "Flutter screens built from the prototype (light/dark theme, pt/en/es i18n), with screen-reader support, 48dp touch targets, large text and reduced motion.",
        },
      },
      {
        tag: "FIX",
        title: { pt: "Evitei uma falha em produção nos pagamentos", en: "Prevented a production payments outage" },
        text: {
          pt: "Um evento de analytics emitido na mesma transação da confirmação de reserva, fora de uma allowlist, faria falhar toda confirmação de reserva paga. Corrigi com migration e ajuste do teto de deploy do ledger.",
          en: "An analytics event emitted in the same transaction as the booking confirmation, outside an allowlist, would have made every paid booking confirmation fail. Fixed it with a migration and an adjustment to the ledger's deploy ceiling.",
        },
      },
      {
        tag: "FIX",
        title: { pt: "Eliminei uma cobrança PIX indevida", en: "Eliminated a wrongful PIX charge" },
        text: {
          pt: "Rastreei entre microsserviços um fluxo de reoferta de jogo cancelado que abria cobrança para outro jogador, reverti o comportamento e cobri o caso com teste.",
          en: "Traced across microservices a cancelled-game re-offer flow that opened a charge for another player, reverted the behavior and covered the case with a test.",
        },
      },
      {
        tag: "SEC",
        title: { pt: "Banco least-privilege", en: "Least-privilege database" },
        text: {
          pt: "Migrations com permissões por coluna para cada serviço, pós-condições que validam o estado final das permissões dentro da própria migration e testes do acúmulo de grants entre migrations.",
          en: "Migrations with per-column permissions for each service, post-conditions that validate the final permission state inside the migration itself, and tests for grant accumulation across migrations.",
        },
      },
      {
        tag: "OPS",
        title: { pt: "Integridade do pipeline de produção", en: "Production pipeline integrity" },
        text: {
          pt: "Mantive o ledger de migrations (atlas.sum) e os pins de atestação de imagens assinadas (cosign/KMS), garantindo que só migrations revisadas cheguem ao banco de produção.",
          en: "Maintained the migrations ledger (atlas.sum) and signed-image attestation pins (cosign/KMS), ensuring only reviewed migrations reach the production database.",
        },
      },
      {
        tag: "DATA",
        title: { pt: "Dados de produto confiáveis", en: "Reliable product data" },
        text: {
          pt: "Eventos publicados no Amplitude e no CRM (Inngage) via padrão outbox transacional.",
          en: "Events published to Amplitude and the CRM (Inngage) through the transactional outbox pattern.",
        },
      },
      {
        tag: "QA",
        title: { pt: "Testes com prova por sabotagem", en: "Tests proven by sabotage" },
        text: {
          pt: "Testes guiados pelos critérios de aceite: quebro o comportamento de propósito e confirmo que o teste acusa. Testes de widget com as fontes reais da marca validam o layout pixel a pixel contra o protótipo.",
          en: "Acceptance-criteria-driven tests: I break the behavior on purpose and confirm the test catches it. Widget tests with the real brand fonts validate the layout pixel by pixel against the prototype.",
        },
      },
    ],
    stack: ["Flutter", "Dart", "Riverpod", "Firebase Auth", "Mapbox", "Go", "Connect-Go", "gRPC", "Protobuf", "Fiber v3", "Huma v2", "PostgreSQL", "pgx v5", "Atlas", "Kubernetes", "GKE", "ArgoCD", "GitHub Actions", "Mercado Pago", "Amplitude"],
  },
];

export const education = {
  institution: "PUC Minas",
  course: { pt: "Bacharelado em Engenharia de Software", en: "B.Sc. in Software Engineering" } satisfies L10n,
  start: "2026",
  end: "2029",
  status: { pt: "Em andamento · 2º período", en: "In progress · 2nd semester" } satisfies L10n,
};
