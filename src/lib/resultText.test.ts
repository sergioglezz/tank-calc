import { describe, expect, it } from 'vitest'
import {
  evaluateCalculator,
  type CalculatorFields,
  type Mode,
} from './calculatorForm'
import { describeResult } from './resultText'

// Intl and the formatters use a non-breaking space between number and unit.
const nbsp = (text: string): string => text.replace(/(\d) /g, '$1 ')

const describe50 = (mode: Mode, overrides: Partial<CalculatorFields> = {}) =>
  describeResult(
    mode,
    evaluateCalculator(50, mode, {
      level: '25',
      price: '1,579',
      target: '',
      money: '',
      ...overrides,
    }),
  )

describe('describeResult (CA7 of spec 004)', () => {
  it('«A tope»', () => {
    expect(describe50('fullTank')).toEqual({
      label: 'Para llenar el depósito',
      headline: nbsp('Pide 59 €'),
      detail: nbsp(
        '37 l · el depósito queda al 99 %. Redondeado a la baja para no pasarte.',
      ),
    })
  })

  it('«Hasta X %»', () => {
    expect(describe50('toLevel', { target: '75' })).toEqual({
      label: nbsp('Para llegar al 75 %'),
      headline: nbsp('Pide 39 €'),
      detail: nbsp(
        '24 l · el depósito queda al 74 %. Redondeado a la baja para no pasarte.',
      ),
    })
  })

  it('«Tengo X €» without leftover money', () => {
    expect(describe50('withMoney', { money: '30' })).toEqual({
      label: nbsp('Con 30 € puedes añadir'),
      headline: nbsp('18 l'),
      detail: nbsp('Pide 30 € · el depósito queda al 62 %.'),
    })
  })

  it('«Tengo X €» with leftover money', () => {
    expect(describe50('withMoney', { money: '80' })).toEqual({
      label: nbsp('Con 80 € te sobra'),
      headline: nbsp('Pide 59 €'),
      detail: nbsp('Llenas el depósito: 37 l · te sobran 21 €.'),
    })
  })

  it.each(['fullTank', 'toLevel', 'withMoney'] as const)(
    'full tank in %s',
    (mode) => {
      expect(describe50(mode, { level: '100' })).toEqual({
        label: 'Todo listo',
        headline: 'Tu depósito ya está lleno',
        detail: 'No necesitas añadir gasolina.',
      })
    },
  )

  it('less than one euro', () => {
    expect(describe50('fullTank', { level: '99', price: '1,5' })).toEqual({
      label: 'Casi lleno',
      headline: nbsp('Falta menos de 1 €'),
      detail: nbsp('Lo que cabe cuesta menos de 1 €.'),
    })
  })

  it.each([
    ['fullTank', { level: '' }],
    ['fullTank', { price: 'abc' }],
    ['toLevel', { target: '20' }],
    ['withMoney', { money: '' }],
  ] as const)('incomplete or invalid data in %s with %j', (mode, overrides) => {
    expect(describe50(mode, overrides)).toEqual({
      label: 'Falta un paso',
      headline: 'Revisa los datos',
      detail: 'Completa o corrige los campos para calcular.',
    })
  })

  it('shows 0 l when the money buys less than a liter', () => {
    expect(describe50('withMoney', { price: '2', money: '1' }).headline).toBe(
      nbsp('0 l'),
    )
  })
})
