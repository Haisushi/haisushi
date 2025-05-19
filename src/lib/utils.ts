import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número de telefone para exibição
 * Ex: "554398237354@s.whatsapp.net" -> "(43) 9823-7354"
 */
export const formatPhone = (raw: string | null | undefined): string => {
  if (!raw) return '';
  // 1) tira tudo que vier depois de "@"
  let digits = raw.split('@')[0];
  // 2) tira qualquer não-dígito e remove o "55" inicial
  digits = digits.replace(/\D/g, '').replace(/^55/, '');
  // 3) separa DDD (2 dígitos) do restante
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (!ddd || !rest) return raw;
  // 4) formata o local:
  //    - se míticos 8 dígitos, faz 4-4
  //    - se tiver >8 (celular 9 dígitos), agrupa tudo antes dos últimos 4
  let firstPart: string;
  let secondPart: string;
  if (rest.length === 8) {
    firstPart  = rest.slice(0, 4);
    secondPart = rest.slice(4);
  } else {
    firstPart  = rest.slice(0, rest.length - 4);
    secondPart = rest.slice(-4);
  }
  return `(${ddd}) ${firstPart}-${secondPart}`;
};
