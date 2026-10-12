// Navegação principal: cada página é um "canal" da sala de controle.
export const navItems = [
  { to: "/sobre", key: "about", ch: "01" },
  { to: "/projetos", key: "projects", ch: "02" },
  { to: "/experiencias", key: "experience", ch: "03" },
  { to: "/contato", key: "contact", ch: "04" },
] as const;

export type NavKey = (typeof navItems)[number]["key"];
