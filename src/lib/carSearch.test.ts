import { describe, expect, it } from 'vitest'
import { catalogCars } from './carCatalog'
import { searchCars } from './carSearch'
import type { OwnCar } from './ownCars'

const labels = (query: string, ownCars: OwnCar[] = []): string[] =>
  searchCars(query, ownCars).map((option) => option.label)

const ownCars: OwnCar[] = [
  { name: 'Furgo del curro', capacity: 70 },
  { name: 'Coche de mamá', capacity: 45 },
  { name: 'Ático', capacity: 40 },
]

describe('searchCars', () => {
  it('finds a catalog car with words in any order', () => {
    expect(labels('corolla toy')).toEqual(['Toyota Corolla'])
  })

  it('matches parts of words', () => {
    expect(labels('coroll')).toEqual(['Toyota Corolla'])
  })

  it('ignores case, accents and diaereses', () => {
    expect(labels('citroen c4')).toEqual(['Citroën C4'])
    expect(labels('LEON')).toEqual([
      'Seat León',
      'Seat León (híbrido enchufable)',
    ])
  })

  it('searches by variant', () => {
    expect(labels('clio hibrido')).toEqual(['Renault Clio (híbrido)'])
  })

  it('searches own cars by name', () => {
    expect(labels('mama', ownCars)).toEqual(['Coche de mamá'])
  })

  it('needs every word to match', () => {
    expect(labels('toyota clio')).toEqual([])
  })

  it('ignores extra spaces', () => {
    expect(labels('  corolla   toy ')).toEqual(labels('corolla toy'))
  })

  it('gives the same result with a repeated word', () => {
    expect(labels('toyota toyota')).toEqual(labels('toyota'))
  })

  it.each(['', '   '])('returns every car for %j', (query) => {
    const result = searchCars(query, ownCars)
    expect(result).toHaveLength(ownCars.length + catalogCars.length)
  })

  it('returns an empty list when nothing matches', () => {
    expect(searchCars('zzz', ownCars)).toEqual([])
  })

  it('lists own cars first, alphabetically, then the catalog in order', () => {
    const all = labels('', ownCars)
    expect(all.slice(0, 3)).toEqual([
      'Ático',
      'Coche de mamá',
      'Furgo del curro',
    ])
    expect(all[3]).toBe('Audi A1')
  })

  it('puts a matching own car before matching catalog cars', () => {
    const corolla = { name: 'Mi Corolla', capacity: 43 }
    expect(labels('corolla', [corolla])).toEqual([
      'Mi Corolla',
      'Toyota Corolla',
    ])
  })

  it('returns references and capacities ready to select', () => {
    expect(searchCars('furgo', ownCars)).toEqual([
      {
        ref: { source: 'own', name: 'Furgo del curro' },
        label: 'Furgo del curro',
        capacity: 70,
      },
    ])
    expect(searchCars('clio hibrido', [])).toEqual([
      {
        ref: { source: 'catalog', key: 'renault|clio|hibrido' },
        label: 'Renault Clio (híbrido)',
        capacity: 39,
      },
    ])
  })

  it('does not reorder the received own cars', () => {
    const received = Object.freeze([...ownCars])
    searchCars('', received)
    expect(received).toEqual(ownCars)
  })
})
