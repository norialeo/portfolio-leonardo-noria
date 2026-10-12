import type { IconType } from "react-icons";
import { FaDiscord, FaGithub, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { FiMail } from "react-icons/fi";
import { profile, whatsappLink } from "../data/profile";

export type Social = {
  id: "email" | "whatsapp" | "linkedin" | "github" | "instagram" | "discord";
  label: string;
  handle: string;
  href: string;
  icon: IconType;
};

// Canais de contato — usados no rodapé, na página de contato e no terminal.
export const socials: Social[] = [
  { id: "email", label: "E-mail", handle: profile.email, href: `mailto:${profile.email}`, icon: FiMail },
  { id: "whatsapp", label: "WhatsApp", handle: profile.phoneDisplay, href: whatsappLink(), icon: FaWhatsapp },
  { id: "linkedin", label: "LinkedIn", handle: "in/leonardonoria", href: profile.linkedin, icon: FaLinkedinIn },
  { id: "github", label: "GitHub", handle: "@norialeo", href: profile.github, icon: FaGithub },
  { id: "instagram", label: "Instagram", handle: "@norialeo_", href: profile.instagram, icon: FaInstagram },
  { id: "discord", label: "Discord", handle: "leoftn", href: profile.discord, icon: FaDiscord },
];
