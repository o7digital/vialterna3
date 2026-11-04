/** Known Spanish copy markers used to catch untranslated site and CMS text. */
export function findSpanishCopy(text) {
  const pattern = /\b(?:conectividad|soluciones|operaci[oó]n|operaciones|monitoreo|multioperador|gesti[oó]n|respaldo|sensores|gobierno|financieros|franquicias|privacidad|enviar|escribe|cerrar|navegaci[oó]n|fibra|satelital|combinamos|nuestro|nuestras|conoce|abrir men[uú]|sitio realizado|datos personales|en l[ií]nea)\b/giu;
  return [...new Set([...text.matchAll(pattern)].map((match) => match[0]))];
}
