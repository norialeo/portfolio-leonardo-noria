import type { L10n } from "./types";

// Competências técnicas, agrupadas como no currículo.
export type SkillGroup = { id: string; label: L10n; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    id: "lang",
    label: { pt: "Linguagens", en: "Languages" },
    items: ["Go", "Dart", "TypeScript", "JavaScript", "SQL", "HTML/CSS", "Python", "Java"],
  },
  {
    id: "backend",
    label: { pt: "Back-end", en: "Back-end" },
    items: ["Microservices", "gRPC", "Connect-Go", "Protobuf", "REST/OpenAPI", "Fiber", "Huma", "FastAPI", "SQLAlchemy", "Spring Boot", "JWT", "BFF", "Outbox"],
  },
  {
    id: "data",
    label: { pt: "Dados", en: "Data" },
    items: ["PostgreSQL", "pgx", "Atlas", "SQLite", "Supabase"],
  },
  {
    id: "infra",
    label: { pt: "Infra e DevOps", en: "Infra & DevOps" },
    items: ["Kubernetes", "GKE", "ArgoCD", "GitHub Actions", "Docker", "Nginx", "Linux", "cosign", "NVIDIA GPU"],
  },
  {
    id: "ai",
    label: { pt: "IA (projetos)", en: "AI (projects)" },
    items: ["YOLO", "OpenCV", "PyTorch", "scikit-learn"],
  },
  {
    id: "front",
    label: { pt: "Front-end e mobile", en: "Front-end & mobile" },
    items: ["Flutter", "Riverpod", "go_router", "React", "Vue 3", "Pinia", "TypeScript", "Chart.js", "Three.js", "i18n", "a11y"],
  },
  {
    id: "integrations",
    label: { pt: "Integrações", en: "Integrations" },
    items: ["Mercado Pago", "PIX", "Firebase Auth", "Mapbox", "Amplitude", "FindFace", "ESP32", "LiDAR"],
  },
];

// Rótulos que o "detector" da home rastreia (classe estilo YOLO → skill).
export const heroDetections = [
  "flutter", "go", "react", "dart", "typescript", "vue", "postgresql", "grpc",
  "firebase", "kubernetes", "riverpod", "docker", "python", "fastapi", "yolo", "protobuf",
];
