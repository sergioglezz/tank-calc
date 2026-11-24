import { catalogCars } from './carCatalog'
import {
  catalogCarOption,
  ownCarOption,
  type CarOption,
  type OwnCar,
} from './ownCars'
import { normalizeText } from './text'

interface Searchable {
  option: CarOption
  text: string
}

const searchable = (option: CarOption): Searchable => ({
  option,
  text: normalizeText(option.label),
})

const catalogEntries = catalogCars.map((car) =>
  searchable(catalogCarOption(car)),
)

const collator = new Intl.Collator('es')

/**
 * Own cars first (alphabetically) and then catalog cars, keeping those whose
 * text contains every word of the query, in any order. An empty query
 * returns every car.
 */
export function searchCars(
  query: string,
  ownCars: readonly OwnCar[],
): CarOption[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  const ownEntries = [...ownCars]
    .sort((a, b) => collator.compare(a.name, b.name))
    .map((car) => searchable(ownCarOption(car)))

  return [...ownEntries, ...catalogEntries]
    .filter(({ text }) => words.every((word) => text.includes(word)))
    .map(({ option }) => option)
}
