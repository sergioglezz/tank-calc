import type { CalculatorEvaluation, Mode } from './calculatorForm'
import { formatEuros, formatLiters, formatPercent } from './format'

/**
 * The texts of the result card (CA7 of spec 004). The label is written in
 * sentence case; the card shows it in capitals with CSS so screen readers
 * read it as words.
 */
export interface ResultText {
  label: string
  headline: string
  detail: string
}

const ROUNDED_DOWN = 'Redondeado a la baja para no pasarte.'

const INCOMPLETE: ResultText = {
  label: 'Falta un paso',
  headline: 'Revisa los datos',
  detail: 'Completa o corrige los campos para calcular.',
}

const FULL: ResultText = {
  label: 'Todo listo',
  headline: 'Tu depósito ya está lleno',
  detail: 'No necesitas añadir gasolina.',
}

const LESS_THAN_ONE_EURO: ResultText = {
  label: 'Casi lleno',
  headline: `Falta menos de ${formatEuros(1)}`,
  detail: `Lo que cabe cuesta menos de ${formatEuros(1)}.`,
}

export function describeResult(
  mode: Mode,
  { result, target, money }: CalculatorEvaluation,
): ResultText {
  if (result === null) return INCOMPLETE
  if (result.status === 'full') return FULL
  if (result.status === 'lessThanOneEuro') return LESS_THAN_ONE_EURO

  const { euros, liters, finalLevel, leftoverEuros } = result
  const ask = `Pide ${formatEuros(euros)}`
  const reaches = `el depósito queda al ${formatPercent(finalLevel)}`

  if (mode === 'withMoney' && money.ok) {
    const cash = formatEuros(money.value)
    return leftoverEuros > 0
      ? {
          label: `Con ${cash} te sobra`,
          headline: ask,
          detail: `Llenas el depósito: ${formatLiters(liters)} · te sobran ${formatEuros(leftoverEuros)}.`,
        }
      : {
          label: `Con ${cash} puedes añadir`,
          headline: formatLiters(liters),
          detail: `${ask} · ${reaches}.`,
        }
  }

  return {
    label:
      mode === 'toLevel' && target.ok
        ? `Para llegar al ${formatPercent(target.value)}`
        : 'Para llenar el depósito',
    headline: ask,
    detail: `${formatLiters(liters)} · ${reaches}. ${ROUNDED_DOWN}`,
  }
}
