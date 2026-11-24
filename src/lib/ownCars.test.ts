import { describe, expect, it } from 'vitest'
import {
  addOwnCar,
  MAX_OWN_CARS,
  removeOwnCar,
  resolveSelected,
  selectCar,
  validateCarName,
  type CarState,
  type OwnCar,
} from './ownCars'

const EMPTY: CarState = { ownCars: [], selected: null }

const stateWith = (...ownCars: OwnCar[]): CarState => ({
  ownCars,
  selected: null,
})

const tenCars = (): OwnCar[] =>
  Array.from({ length: MAX_OWN_CARS }, (_, i) => ({
    name: `Coche ${i + 1}`,
    capacity: 50,
  }))

/** Freezes the state and its cars to prove functions never mutate them. */
const frozen = (state: CarState): CarState =>
  Object.freeze({
    ...state,
    ownCars: Object.freeze(state.ownCars.map((car) => Object.freeze(car))),
  })

describe('validateCarName', () => {
  it('accepts a name and removes surrounding spaces', () => {
    expect(validateCarName('  Mi coche  ', [])).toEqual({
      ok: true,
      value: 'Mi coche',
    })
  })

  it('accepts 40 characters and rejects 41', () => {
    expect(validateCarName('a'.repeat(40), []).ok).toBe(true)
    expect(validateCarName('a'.repeat(41), [])).toEqual({
      ok: false,
      reason: 'invalid',
      message: 'Escribe un nombre de 40 caracteres como máximo.',
    })
  })

  it('does not count surrounding spaces as characters', () => {
    expect(validateCarName(`  ${'a'.repeat(40)}  `, []).ok).toBe(true)
  })

  it('counts accented letters and emojis as one character each', () => {
    expect(validateCarName('ñ'.repeat(40), []).ok).toBe(true)
    expect(validateCarName('🚗'.repeat(40), []).ok).toBe(true)
    expect(validateCarName('🚗'.repeat(41), []).ok).toBe(false)
  })

  it.each(['', '   '])('rejects an empty name (%j)', (text) => {
    expect(validateCarName(text, [])).toEqual({
      ok: false,
      reason: 'empty',
      message: 'Introduce un nombre para el coche.',
    })
  })

  it.each(['Mi león', 'MI LEON', ' mi leon '])(
    'rejects %j when «Mi León» already exists',
    (text) => {
      expect(
        validateCarName(text, [{ name: 'Mi León', capacity: 50 }]),
      ).toEqual({
        ok: false,
        reason: 'invalid',
        message: 'Ya tienes un coche con ese nombre.',
      })
    },
  )

  it('accepts a name equal to a catalog model', () => {
    expect(validateCarName('Toyota Corolla', []).ok).toBe(true)
  })
})

describe('addOwnCar', () => {
  it('adds the car at the end with the trimmed name', () => {
    const state = stateWith({ name: 'Primero', capacity: 40 })
    const result = addOwnCar(state, '  Furgo ', '70')
    expect(result).toEqual({
      ok: true,
      state: {
        ownCars: [
          { name: 'Primero', capacity: 40 },
          { name: 'Furgo', capacity: 70 },
        ],
        selected: null,
      },
    })
  })

  it('does not select the new car', () => {
    const selected = { source: 'catalog', key: 'toyota|corolla|' } as const
    const result = addOwnCar({ ownCars: [], selected }, 'Furgo', '70')
    expect(result.ok && result.state.selected).toEqual(selected)
  })

  it.each([
    ['', 'Introduce la capacidad del depósito.'],
    ['40,5', 'Escribe una capacidad entera entre 1 y 200 litros.'],
    ['0', 'Escribe una capacidad entera entre 1 y 200 litros.'],
    ['201', 'Escribe una capacidad entera entre 1 y 200 litros.'],
  ])('rejects the capacity %j with the 001 message', (capacity, message) => {
    expect(addOwnCar(EMPTY, 'Mi coche', capacity)).toEqual({
      ok: false,
      errors: { capacity: message },
    })
  })

  it('returns the name and capacity errors at once', () => {
    expect(addOwnCar(EMPTY, '', '')).toEqual({
      ok: false,
      errors: {
        name: 'Introduce un nombre para el coche.',
        capacity: 'Introduce la capacidad del depósito.',
      },
    })
  })

  it('rejects a repeated name', () => {
    const state = stateWith({ name: 'Mi León', capacity: 50 })
    expect(addOwnCar(state, 'mi leon', '45')).toEqual({
      ok: false,
      errors: { name: 'Ya tienes un coche con ese nombre.' },
    })
  })

  it('adds the tenth car', () => {
    const state = stateWith(...tenCars().slice(1))
    const result = addOwnCar(state, 'Décimo', '50')
    expect(result.ok && result.state.ownCars).toHaveLength(MAX_OWN_CARS)
  })

  it('rejects an eleventh car with only the limit error', () => {
    expect(addOwnCar(stateWith(...tenCars()), '', '')).toEqual({
      ok: false,
      errors: {
        limit: 'Ya tienes 10 coches guardados. Borra uno para añadir otro.',
      },
    })
  })

  it('does not modify the received state', () => {
    const state = frozen(stateWith({ name: 'Primero', capacity: 40 }))
    addOwnCar(state, 'Segundo', '50')
    expect(state.ownCars).toEqual([{ name: 'Primero', capacity: 40 }])
  })
})

describe('removeOwnCar', () => {
  const first = { name: 'Primero', capacity: 40 }
  const second = { name: 'Segundo', capacity: 60 }

  it('removes the car and clears the selection if it was selected', () => {
    const state = selectCar(stateWith(first, second), {
      source: 'own',
      name: 'Segundo',
    })
    expect(removeOwnCar(state, 'Segundo')).toEqual({
      ownCars: [first],
      selected: null,
    })
  })

  it('keeps the selection when another car is removed', () => {
    const selected = { source: 'own', name: 'Segundo' } as const
    const state = selectCar(stateWith(first, second), selected)
    expect(removeOwnCar(state, 'Primero')).toEqual({
      ownCars: [second],
      selected,
    })
  })

  it('keeps a selected catalog car', () => {
    const selected = { source: 'catalog', key: 'primero||' } as const
    const state = selectCar(stateWith(first), selected)
    expect(removeOwnCar(state, 'Primero').selected).toEqual(selected)
  })

  it('leaves an empty list when the last car is removed', () => {
    expect(removeOwnCar(stateWith(first), 'Primero')).toEqual(EMPTY)
  })

  it('changes nothing when the name does not exist', () => {
    const state = stateWith(first)
    expect(removeOwnCar(state, 'Otro')).toEqual(state)
  })

  it('does not modify the received state', () => {
    const state = frozen(stateWith(first, second))
    removeOwnCar(state, 'Primero')
    expect(state.ownCars).toEqual([first, second])
  })
})

describe('selectCar', () => {
  it('sets and clears the selected car without touching the own cars', () => {
    const state = frozen(stateWith({ name: 'Furgo', capacity: 70 }))
    const ref = { source: 'own', name: 'Furgo' } as const
    const selected = selectCar(state, ref)
    expect(selected).toEqual({ ownCars: state.ownCars, selected: ref })
    expect(selectCar(selected, null).selected).toBeNull()
    expect(state.selected).toBeNull()
  })
})

describe('resolveSelected', () => {
  it('returns null when no car is selected', () => {
    expect(resolveSelected(EMPTY)).toBeNull()
  })

  it('resolves a catalog car', () => {
    const ref = { source: 'catalog', key: 'renault|clio|hibrido' } as const
    expect(resolveSelected(selectCar(EMPTY, ref))).toEqual({
      ref,
      label: 'Renault Clio (híbrido)',
      capacity: 39,
    })
  })

  it('resolves an own car', () => {
    const state = selectCar(stateWith({ name: 'Furgo', capacity: 70 }), {
      source: 'own',
      name: 'Furgo',
    })
    expect(resolveSelected(state)).toEqual({
      ref: { source: 'own', name: 'Furgo' },
      label: 'Furgo',
      capacity: 70,
    })
  })

  it('returns null for a catalog car that no longer exists', () => {
    const state = selectCar(EMPTY, { source: 'catalog', key: 'tesla|model 3|' })
    expect(resolveSelected(state)).toBeNull()
  })

  it('returns null for an own car that no longer exists', () => {
    const state = selectCar(EMPTY, { source: 'own', name: 'Borrado' })
    expect(resolveSelected(state)).toBeNull()
  })
})
