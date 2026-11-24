const DIACRITICS = /[̀-ͯ]/g

/**
 * Lowercases and strips accents and diaereses so texts can be compared
 * loosely ("León", "LEON" and "leon" are equal).
 */
export const normalizeText = (text: string): string =>
  text.normalize('NFD').replace(DIACRITICS, '').toLowerCase()

/** Keeps only the digits 0–9, for whole-number fields (CA16 of spec 004). */
export const digitsOnly = (text: string): string => text.replace(/[^0-9]/g, '')
