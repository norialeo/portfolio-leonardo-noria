import type { L10n } from "./types";

// Dados de contato e identidade, usados em todo o site.
// Para trocar algo (ex.: o link do site depois do deploy), mude só aqui.
export const profile = {
  name: "Leonardo Noria",
  firstName: "Leonardo",
  lastName: "Noria",
  handle: "norialeo",
  role: {
    pt: "Desenvolvedor Full Stack & Mobile",
    en: "Full Stack & Mobile Developer",
  } satisfies L10n,
  focus: "Full Stack · Mobile · Go · Flutter",
  city: "Belo Horizonte, MG",
  coords: { lat: -19.9167, lng: -43.9345 },
  timezone: "America/Sao_Paulo",

  email: "leonoria09@gmail.com",
  phoneDisplay: "+55 (31) 99853-1810",
  whatsapp: "5531998531810",
  linkedin: "https://www.linkedin.com/in/leonardonoria/",
  github: "https://github.com/norialeo",
  instagram: "https://www.instagram.com/norialeo_/",
  discord: "https://discord.com/users/273844782948810753",

  photo: "/images/leonardo.webp",
  repoUrl: "https://github.com/norialeo/portfolio-leonardo-noria",
  siteUrl: "https://leonardonoria.vercel.app",

  cv: {
    pt: "/cv/curriculo-leonardo-noria-pt.pdf",
    en: "/cv/resume-leonardo-noria-en.pdf",
  } satisfies L10n,
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${profile.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
