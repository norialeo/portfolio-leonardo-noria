import type { L10n } from "./types";

// Projetos da linha do tempo, do mais antigo ao mais recente.
//
// Mídia:
//   kind "capture" → print/GIF real do projeto rodando
//   kind "preview" → prévia animada (SVG) reconstruída a partir do código do
//                    repositório. Para trocar por uma gravação real, salve o
//                    GIF em public/projects/<slug>/, rode `npm run media` e
//                    troque o src aqui (e o kind para "capture").

export type ProjectCategory = "python" | "java" | "web" | "api" | "ai" | "vision" | "automation" | "security";

export type ProjectMedia = { src: string; alt: L10n; kind: "capture" | "preview" };

export type Project = {
  slug: string;
  /** nome do repositório em github.com/norialeo (liga as estatísticas ao vivo) */
  repo: string;
  github: string;
  title: L10n;
  /** AAAA-MM-DD — data de criação do repositório */
  date: string;
  summary: L10n;
  details: L10n[];
  tech: string[];
  categories: ProjectCategory[];
  media: ProjectMedia[];
  context?: L10n;
};

const gh = (repo: string) => `https://github.com/norialeo/${repo}`;

export const projects: Project[] = [
  {
    slug: "automacao-cadastro",
    repo: "automacao-python",
    github: gh("automacao-python"),
    title: { pt: "Automação de Cadastro de Produtos", en: "Product Registration Bot" },
    date: "2026-03-12",
    summary: {
      pt: "Robô em Python que faz login em um sistema web e cadastra sozinho cada produto de uma planilha CSV.",
      en: "A Python bot that logs into a web system and registers every product from a CSV spreadsheet on its own.",
    },
    details: [
      {
        pt: "Lê a base com Pandas e, para cada linha, simula cliques, digitação e navegação entre campos com PyAutoGUI — código, marca, tipo, categoria, preço, custo e observações.",
        en: "Reads the dataset with Pandas and, for each row, simulates clicks, typing and field navigation with PyAutoGUI — code, brand, type, category, price, cost and notes.",
      },
      {
        pt: "Inclui um utilitário auxiliar que mostra a posição do mouse para calibrar os pontos de clique.",
        en: "Includes a helper script that prints the mouse position to calibrate click targets.",
      },
    ],
    tech: ["Python", "PyAutoGUI", "Pandas", "CSV"],
    categories: ["python", "automation"],
    media: [
      {
        src: "/projects/automacao-cadastro/preview.svg",
        alt: {
          pt: "Prévia: o robô lê produtos.csv e preenche o formulário de cadastro campo a campo",
          en: "Preview: the bot reads produtos.csv and fills in the registration form field by field",
        },
        kind: "preview",
      },
    ],
  },
  {
    slug: "score-credito",
    repo: "machine-learning-python",
    github: gh("machine-learning-python"),
    title: { pt: "Previsão de Score de Crédito", en: "Credit Score Prediction" },
    date: "2026-03-13",
    summary: {
      pt: "Machine learning que prevê o score de crédito de clientes e compara dois modelos para escolher o melhor.",
      en: "Machine learning that predicts customers' credit scores and compares two models to pick the best one.",
    },
    details: [
      {
        pt: "Pré-processamento com LabelEncoder, divisão 70/30 entre treino e teste e comparação entre Random Forest (82,4% de acurácia) e KNN (73,4%).",
        en: "Preprocessing with LabelEncoder, a 70/30 train/test split and a comparison between Random Forest (82.4% accuracy) and KNN (73.4%).",
      },
      {
        pt: "O modelo vencedor classifica automaticamente uma base de novos clientes.",
        en: "The winning model automatically classifies a dataset of new customers.",
      },
    ],
    tech: ["Python", "Pandas", "scikit-learn", "Random Forest", "KNN", "Jupyter"],
    categories: ["python", "ai"],
    media: [
      {
        src: "/projects/score-credito/preview.svg",
        alt: {
          pt: "Prévia: notebook treinando Random Forest e KNN e exibindo as acurácias 0.8245 e 0.7336",
          en: "Preview: notebook training Random Forest and KNN and printing accuracies 0.8245 and 0.7336",
        },
        kind: "preview",
      },
    ],
  },
  {
    slug: "chatbot-ia",
    repo: "Chatbot-com-IA",
    github: gh("Chatbot-com-IA"),
    title: { pt: "Chatbot com IA", en: "AI Chatbot" },
    date: "2026-03-13",
    summary: {
      pt: "Chat web em Streamlit integrado à API da OpenAI (GPT-4o), com histórico da conversa mantido na sessão.",
      en: "A Streamlit web chat wired to the OpenAI API (GPT-4o), keeping the conversation history in the session.",
    },
    details: [
      {
        pt: "Cada mensagem entra no st.session_state e vai com todo o histórico para chat.completions, então o modelo mantém o contexto da conversa.",
        en: "Each message is stored in st.session_state and sent with the full history to chat.completions, so the model keeps the conversation context.",
      },
    ],
    tech: ["Python", "Streamlit", "OpenAI API", "GPT-4o"],
    categories: ["python", "ai", "web"],
    media: [
      {
        src: "/projects/chatbot-ia/preview.svg",
        alt: {
          pt: "Prévia: interface do chatbot em Streamlit com perguntas e respostas da IA",
          en: "Preview: Streamlit chatbot interface with questions and AI answers",
        },
        kind: "preview",
      },
    ],
  },
  {
    slug: "handvision",
    repo: "gesture-recognition-app",
    github: gh("gesture-recognition-app"),
    title: { pt: "HandVision — Reconhecimento de Gestos", en: "HandVision — Gesture Recognition" },
    date: "2026-03-19",
    summary: {
      pt: "Reconhece gestos de mão em tempo real pela webcam e mostra o resultado numa interface web.",
      en: "Recognizes hand gestures in real time through the webcam and shows the result in a web interface.",
    },
    details: [
      {
        pt: "MediaPipe detecta os landmarks da mão, um modelo scikit-learn classifica 7 gestos (joinha, paz, rock, coração, hang loose, olá e spock) e o servidor FastHTML devolve os quadros via WebSocket.",
        en: "MediaPipe detects the hand landmarks, a scikit-learn model classifies 7 gestures (thumbs up, peace, rock, heart, hang loose, hello and spock) and a FastHTML server streams frames back over WebSocket.",
      },
      {
        pt: "A interface mostra FPS, controle de qualidade da imagem e liga/desliga o desenho dos landmarks.",
        en: "The interface shows FPS, an image-quality control and a toggle for drawing the landmarks.",
      },
    ],
    tech: ["Python", "OpenCV", "MediaPipe", "scikit-learn", "FastHTML", "WebSocket"],
    categories: ["python", "ai", "vision", "web"],
    context: {
      pt: "Feito a partir da base de um intensivo da Rocketseat (NLW).",
      en: "Built on top of the starter code from a Rocketseat intensive (NLW).",
    },
    media: [
      {
        src: "/projects/handvision/preview.svg",
        alt: {
          pt: "Prévia: landmarks da mão sendo rastreados enquanto o app identifica os gestos",
          en: "Preview: hand landmarks being tracked while the app identifies gestures",
        },
        kind: "preview",
      },
    ],
  },
  {
    slug: "api-clima",
    repo: "clima-rest-api",
    github: gh("clima-rest-api"),
    title: { pt: "API REST de Clima — BH", en: "Weather REST API — BH" },
    date: "2026-08-27",
    summary: {
      pt: "API em Spring Boot que consulta a Open-Meteo e devolve o clima de Belo Horizonte em JSON.",
      en: "A Spring Boot API that queries Open-Meteo and returns Belo Horizonte's weather as JSON.",
    },
    details: [
      {
        pt: "GET /clima/belo-horizonte devolve temperatura, umidade, vento, máxima e mínima do dia e a condição do tempo traduzida a partir do weather_code.",
        en: "GET /clima/belo-horizonte returns temperature, humidity, wind, the day's high and low and the weather condition translated from the weather_code.",
      },
      {
        pt: "Arquitetura em camadas (controller → service) com RestTemplate e Jackson.",
        en: "Layered architecture (controller → service) with RestTemplate and Jackson.",
      },
    ],
    tech: ["Java 21", "Spring Boot", "REST", "Jackson", "Open-Meteo"],
    categories: ["java", "api"],
    context: { pt: "Trabalho em dupla · PUC Minas", en: "Pair project · PUC Minas" },
    media: [
      {
        src: "/projects/api-clima/preview.svg",
        alt: {
          pt: "Prévia: requisição GET /clima/belo-horizonte e a resposta JSON da API",
          en: "Preview: GET /clima/belo-horizonte request and the API's JSON response",
        },
        kind: "preview",
      },
    ],
  },
  {
    slug: "candidatos-tse",
    repo: "AV1-DIAW",
    github: gh("AV1-DIAW"),
    title: { pt: "Candidatos TSE 2026", en: "TSE 2026 Candidates" },
    date: "2026-09-24",
    summary: {
      pt: "Aplicação Spring Boot que lê o CSV oficial do TSE e mostra os candidatos de MG com foto e filtros.",
      en: "A Spring Boot app that reads the official TSE CSV and lists Minas Gerais candidates with photos and filters.",
    },
    details: [
      {
        pt: "Carrega e trata os 1.832 candidatos das eleições de 2026 em MG, com busca por nome ou número e filtros por cargo e partido, numa tela única com a foto oficial de cada um.",
        en: "Loads and cleans the 1,832 candidates of Minas Gerais' 2026 elections, with search by name or number and filters by office and party, on a single page with each candidate's official photo.",
      },
    ],
    tech: ["Java", "Spring Boot", "CSV", "HTML", "CSS"],
    categories: ["java", "web"],
    context: { pt: "Avaliação de DIAW · PUC Minas", en: "DIAW course assessment · PUC Minas" },
    media: [
      {
        src: "/projects/candidatos-tse/index.webp",
        alt: { pt: "Tela inicial com a grade de candidatos e os filtros", en: "Home screen with the candidates grid and filters" },
        kind: "capture",
      },
      {
        src: "/projects/candidatos-tse/governador.webp",
        alt: { pt: "Filtro por cargo: governador", en: "Filtered by office: governor" },
        kind: "capture",
      },
      {
        src: "/projects/candidatos-tse/senador.webp",
        alt: { pt: "Filtro por cargo: senador", en: "Filtered by office: senator" },
        kind: "capture",
      },
    ],
  },
  {
    slug: "portfolio",
    repo: "portfolio-leonardo-noria",
    github: "https://github.com/norialeo/portfolio-leonardo-noria",
    title: { pt: "Este portfólio", en: "This portfolio" },
    date: "2026-10-12",
    summary: {
      pt: "O site que você está vendo: front-end em React com back-end serverless e uma IA que responde por mim.",
      en: "The site you're looking at: a React front-end with a serverless back-end and an AI that answers for me.",
    },
    details: [
      {
        pt: "React 19, TypeScript e Vite no front; funções serverless na Vercel para o contato por e-mail (Resend), a IA do terminal (Gemini, com streaming) e os dados do GitHub ao vivo com cache na CDN.",
        en: "React 19, TypeScript and Vite on the front; Vercel serverless functions for the contact email (Resend), the terminal AI (Gemini, streamed) and live GitHub data cached at the CDN.",
      },
      {
        pt: "Validação compartilhada entre navegador e servidor (Zod), limite de requisições por IP, PT/EN com i18next e um detector estilo YOLO desenhado em canvas.",
        en: "Validation shared between browser and server (Zod), per-IP rate limiting, PT/EN with i18next and a YOLO-style detector drawn on canvas.",
      },
    ],
    tech: ["React", "TypeScript", "Vite", "Vercel Functions", "i18next", "Motion", "Zod", "Gemini API"],
    categories: ["web", "api", "ai"],
    media: [
      {
        src: "/projects/portfolio/home.webp",
        alt: { pt: "Home do portfólio com o detector em tempo real", en: "Portfolio home with the real-time detector" },
        kind: "capture",
      },
    ],
  },
];

export const categoryLabels: Record<ProjectCategory, L10n> = {
  python: { pt: "Python", en: "Python" },
  java: { pt: "Java", en: "Java" },
  web: { pt: "Web", en: "Web" },
  api: { pt: "APIs", en: "APIs" },
  ai: { pt: "IA & ML", en: "AI & ML" },
  vision: { pt: "Visão computacional", en: "Computer vision" },
  automation: { pt: "Automação", en: "Automation" },
  security: { pt: "Segurança", en: "Security" },
};
