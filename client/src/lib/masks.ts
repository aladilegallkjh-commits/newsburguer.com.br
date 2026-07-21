/**
 * Funções de máscara automática para inputs
 */

/** Máscara de telefone: (41) 99999-9999 ou (41) 9999-9999 */
export function maskPhone(value: string): string {
  const raw = value.replace(/\D/g, '').slice(0, 11);
  if (raw.length <= 2) return raw.length ? `(${raw}` : '';
  if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
  if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
  // celular: 11 dígitos
  return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
}

/** Remove tudo que não é dígito do telefone */
export function unmaskedPhone(value: string): string {
  return value.replace(/\D/g, '');
}

/** Máscara de CEP: 00000-000 */
export function maskCep(value: string): string {
  const raw = value.replace(/\D/g, '').slice(0, 8);
  if (raw.length <= 5) return raw;
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

/** Remove tudo que não é dígito do CEP */
export function unmaskedCep(value: string): string {
  return value.replace(/\D/g, '');
}
