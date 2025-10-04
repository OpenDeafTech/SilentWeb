// packages/core/src/text.ts
export function normalizeText(input: string): string {
  if (!input) return "";
  let s = input;
  // Espaces Unicode → espace ASCII
  s = s.replace(/[\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/g, " ");
  // Guillemets doubles intelligents → "
  s = s
    .replace(/[«»]/g, '"')
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  // Guillemets simples intelligents → '
  s = s.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  // Condense et trim
  s = s.replace(/\s+/g, " ").trim();
  return s;
}
