import { afterEach, describe, expect, it } from 'vitest'
import type { CarState, OwnCar } from './ownCars'
import {
  getBrowserStorage,
  loadSavedData,
  saveCarState,
  savePrice,
  STORAGE_KEYS,
  type KeyValueStore,
  type SavedData,
} from './storage'

class MemoryStore implements KeyValueStore {
  private readonly values = new Map<string, string>()

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.values.set(key, value)
    }
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

const brokenStore: KeyValueStore = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

const FIRST_VISIT: SavedData = {
  cars: { ownCars: [], selected: null },
  price: null,
}

const withOwnCars = (value: unknown) =>
  new MemoryStore({ [STORAGE_KEYS.ownCars]: JSON.stringify(value) })

const loadOwnCars = (value: unknown): readonly OwnCar[] =>
  loadSavedData(withOwnCars(value)).cars.ownCars

const furgo: OwnCar = { name: 'Furgo', capacity: 70 }

const loadSelected = (selected: unknown, ownCars: OwnCar[] = [furgo]) =>
  loadSavedData(
    new MemoryStore({
      [STORAGE_KEYS.ownCars]: JSON.stringify(ownCars),
      [STORAGE_KEYS.selectedCar]: JSON.stringify(selected),
    }),
  ).cars.selected

const loadPrice = (text: string): string | null =>
  loadSavedData(new MemoryStore({ [STORAGE_KEYS.price]: text })).price

describe('getBrowserStorage', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')

  afterEach(() => {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else Reflect.deleteProperty(globalThis, 'localStorage')
  })

  it('returns localStorage when it is available', () => {
    const store = new MemoryStore()
    Object.defineProperty(globalThis, 'localStorage', {
      value: store,
      configurable: true,
    })
    expect(getBrowserStorage()).toBe(store)
  })

  it('returns null when the browser does not allow using it', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      get: () => {
        throw new Error('SecurityError')
      },
      configurable: true,
    })
    expect(getBrowserStorage()).toBeNull()
  })
})

describe('loadSavedData', () => {
  it('starts empty on the first visit', () => {
    expect(loadSavedData(new MemoryStore())).toEqual(FIRST_VISIT)
  })

  it('starts empty without storage', () => {
    expect(loadSavedData(null)).toEqual(FIRST_VISIT)
  })

  it('starts empty when reading throws', () => {
    expect(loadSavedData(brokenStore)).toEqual(FIRST_VISIT)
  })

  it('keeps the other values when one is damaged', () => {
    const store = new MemoryStore({
      [STORAGE_KEYS.ownCars]: '[{"name": "Furgo", ',
      [STORAGE_KEYS.selectedCar]:
        '{"source":"catalog","key":"toyota|corolla|"}',
      [STORAGE_KEYS.price]: '1,579',
    })
    expect(loadSavedData(store)).toEqual({
      cars: {
        ownCars: [],
        selected: { source: 'catalog', key: 'toyota|corolla|' },
      },
      price: '1,579',
    })
  })

  describe('own cars', () => {
    it.each([null, 'Furgo', 42, { name: 'Furgo', capacity: 70 }])(
      'ignores %j when it is not a list',
      (value) => {
        expect(loadOwnCars(value)).toEqual([])
      },
    )

    it('discards invalid cars and keeps the valid ones in order', () => {
      expect(
        loadOwnCars([
          { name: 'Primero', capacity: 40 },
          null,
          'Furgo',
          [],
          { capacity: 50 },
          { name: 'Sin capacidad' },
          { name: 7, capacity: 50 },
          { name: 'Texto', capacity: '50' },
          { name: 'Decimal', capacity: 40.5 },
          { name: 'Cero', capacity: 0 },
          { name: 'Enorme', capacity: 201 },
          { name: 'Infinito', capacity: 1e21 },
          { name: '   ', capacity: 50 },
          { name: 'a'.repeat(41), capacity: 50 },
          { name: '  Segundo  ', capacity: 60 },
        ]),
      ).toEqual([
        { name: 'Primero', capacity: 40 },
        { name: 'Segundo', capacity: 60 },
      ])
    })

    it('keeps the first of repeated names', () => {
      expect(
        loadOwnCars([
          { name: 'Mi León', capacity: 50 },
          { name: 'MI LEON', capacity: 45 },
        ]),
      ).toEqual([{ name: 'Mi León', capacity: 50 }])
    })

    it('keeps only the first 10 valid cars', () => {
      const cars = Array.from({ length: 12 }, (_, i) => ({
        name: `Coche ${i + 1}`,
        capacity: 50,
      }))
      expect(loadOwnCars([{ name: '', capacity: 1 }, ...cars])).toEqual(
        cars.slice(0, 10),
      )
    })
  })

  describe('selected car', () => {
    it('keeps a catalog car that exists', () => {
      const ref = { source: 'catalog', key: 'renault|clio|hibrido' }
      expect(loadSelected(ref)).toEqual(ref)
    })

    it('keeps an own car that exists', () => {
      expect(loadSelected({ source: 'own', name: 'Furgo' })).toEqual({
        source: 'own',
        name: 'Furgo',
      })
    })

    it('uses the saved spelling of an own car name', () => {
      expect(loadSelected({ source: 'own', name: 'FURGO' })).toEqual({
        source: 'own',
        name: 'Furgo',
      })
    })

    it.each([
      [
        'a catalog car no longer in the list',
        { source: 'catalog', key: 'x||' },
      ],
      ['a deleted own car', { source: 'own', name: 'Borrado' }],
      ['nothing selected', null],
      ['a text', 'Furgo'],
      ['an unknown source', { source: 'other', name: 'Furgo' }],
      ['a key that is not text', { source: 'catalog', key: 3 }],
      ['a name that is not text', { source: 'own', name: ['Furgo'] }],
    ])('is none for %s', (_case, selected) => {
      expect(loadSelected(selected)).toBeNull()
    })

    it('is none when its own car was discarded as invalid', () => {
      const invalid = { name: 'Furgo', capacity: 500 }
      expect(loadSelected({ source: 'own', name: 'Furgo' }, [invalid])).toBe(
        null,
      )
    })

    it('is none when the saved text is damaged', () => {
      const store = new MemoryStore({ [STORAGE_KEYS.selectedCar]: '{"sou' })
      expect(loadSavedData(store).cars.selected).toBeNull()
    })
  })

  describe('price', () => {
    it.each([
      ['1,579', '1,579'],
      ['1.579', '1,579'],
      ['1,50', '1,5'],
      ['0,001', '0,001'],
      ['5', '5'],
    ])('loads %j as %j', (saved, expected) => {
      expect(loadPrice(saved)).toBe(expected)
    })

    it.each(['', 'abc', '0', '5,001', '1,5799', '-1', '"1,579"'])(
      'ignores the invalid price %j',
      (saved) => {
        expect(loadPrice(saved)).toBeNull()
      },
    )
  })
})

describe('saveCarState', () => {
  const state: CarState = {
    ownCars: [furgo, { name: 'Coche de mamá', capacity: 45 }],
    selected: { source: 'own', name: 'Coche de mamá' },
  }

  it('saves the cars so they are loaded on the next visit', () => {
    const store = new MemoryStore()
    expect(saveCarState(store, state)).toBe(true)
    expect(loadSavedData(store).cars).toEqual(state)
  })

  it('saves a cleared selection', () => {
    const store = new MemoryStore()
    saveCarState(store, state)
    saveCarState(store, { ...state, selected: null })
    expect(loadSavedData(store).cars.selected).toBeNull()
  })

  it('returns false without storage', () => {
    expect(saveCarState(null, state)).toBe(false)
  })

  it('returns false when saving throws', () => {
    expect(saveCarState(brokenStore, state)).toBe(false)
  })
})

describe('savePrice', () => {
  it('saves a valid price so it is loaded on the next visit', () => {
    const store = new MemoryStore()
    expect(savePrice(store, '1,579')).toBe(true)
    expect(loadSavedData(store).price).toBe('1,579')
  })

  it.each([
    ['1.579', '1,579'],
    ['1,50', '1,5'],
    [' 0,001 ', '0,001'],
    ['5', '5'],
  ])('saves %j and loads it as %j', (text, expected) => {
    const store = new MemoryStore()
    savePrice(store, text)
    expect(loadSavedData(store).price).toBe(expected)
  })

  it.each(['', 'abc', '0', '5,5', '1,5799'])(
    'does not replace the previous price with %j',
    (text) => {
      const store = new MemoryStore()
      savePrice(store, '1,579')
      expect(savePrice(store, text)).toBe(true)
      expect(loadSavedData(store).price).toBe('1,579')
    },
  )

  it('returns false without storage', () => {
    expect(savePrice(null, '1,579')).toBe(false)
  })

  it('returns false when saving throws', () => {
    expect(savePrice(brokenStore, '1,579')).toBe(false)
  })
})
