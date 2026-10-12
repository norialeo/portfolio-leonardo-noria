// Regras do formulário de contato, usadas dos DOIS lados:
//   • no navegador, pelo React Hook Form (feedback imediato ao visitante)
//   • no servidor, em server/contact.ts (a validação que vale de verdade)
//
// As mensagens de erro são chaves de tradução (src/i18n/locales/*.json →
// contact.errors.*), para o front-end exibir no idioma do visitante.

import { z } from "zod";

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 254 },
  message: { min: 10, max: 2000 },
} as const;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.name.min, { error: "name_min" })
    .max(CONTACT_LIMITS.name.max, { error: "name_max" }),
  email: z
    .string()
    .trim()
    .min(1, { error: "email_required" })
    .max(CONTACT_LIMITS.email.max, { error: "email_invalid" })
    .pipe(z.email({ error: "email_invalid" })),
  message: z
    .string()
    .trim()
    .min(CONTACT_LIMITS.message.min, { error: "message_min" })
    .max(CONTACT_LIMITS.message.max, { error: "message_max" }),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactMessage = z.output<typeof contactSchema>;

// Campo "isca": fica escondido no formulário. Pessoas não o veem; robôs que
// preenchem tudo, sim. Se vier preenchido, o servidor finge sucesso e descarta.
export const HONEYPOT_FIELD = "website";
