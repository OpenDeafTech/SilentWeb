// packages/core/src/normalize.ts
export function normalizeText(input: string): string {
  let s = input;

  // espaces insécables → espace normal
  s = s.replace(/[\u00A0\u202F\u2007]/g, " ");

  // guillemets courbes → ASCII
  s = s
    // doubles
    .replace(/[«»“”„‟]/g, '"')
    // simples
    .replace(/[‘’‚‛]/g, "'");

  // compacter espaces et trim
  s = s.replace(/\s+/g, " ").trim();

  return s;
}
