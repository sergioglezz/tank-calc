const DIACRITICS = /[̀-ͯ]/g

/**
 * Lowercases and strips accents and diaereses so texts can be compared
 * loosely ("León", "LEON" and "leon" are equal).
 */
export const normalizeText = (text: string): string =>
  text.normalize('NFD').replace(DIACRITICS, '').toLowerCase()
