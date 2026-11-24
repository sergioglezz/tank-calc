import { useState } from 'react'
import { searchCars } from '../lib/carSearch'
import { formatLiters } from '../lib/format'
import {
  isSameCar,
  resolveSelected,
  type CarOption,
  type CarRef,
  type CarState,
} from '../lib/ownCars'
import { ScreenTitle } from './ScreenTitle'

interface ChooseCarScreenProps {
  cars: CarState
  onBack: () => void
  onSelect: (ref: CarRef) => void
}

export function ChooseCarScreen({
  cars,
  onBack,
  onSelect,
}: ChooseCarScreenProps) {
  const [query, setQuery] = useState('')
  // Filtered on every key; own cars first, as the search returns them (CA21).
  const options = searchCars(query, cars.ownCars)
  const own = options.filter(({ ref }) => ref.source === 'own')
  const catalog = options.filter(({ ref }) => ref.source === 'catalog')
  const selected = resolveSelected(cars)?.ref ?? null

  const rows = (list: CarOption[]) => (
    <ul className="mt-3 space-y-3">
      {list.map((option) => (
        <CarRow
          key={option.label}
          option={option}
          selected={selected !== null && isSameCar(selected, option.ref)}
          onSelect={() => onSelect(option.ref)}
        />
      ))}
    </ul>
  )

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 -ml-2 min-h-11 rounded-xl px-2 font-semibold hover:bg-mist"
      >
        <span aria-hidden="true">← </span>Volver
      </button>
      <ScreenTitle focusOnMount>Elige tu coche</ScreenTitle>
      <p className="mt-2 text-muted">
        La capacidad nos ayuda a hacer los cálculos.
      </p>

      <label htmlFor="car-search" className="mt-6 block text-lg font-semibold">
        Busca marca o modelo
      </label>
      <input
        id="car-search"
        type="search"
        autoComplete="off"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mt-2 h-14 w-full rounded-2xl border border-line bg-card px-4 text-lg focus:ring-2 focus:ring-ink focus:outline-none"
      />

      {own.length > 0 && (
        <section aria-labelledby="own-cars">
          <h2 id="own-cars" className="mt-8 text-xl font-bold">
            Mis coches
          </h2>
          {rows(own)}
        </section>
      )}
      {catalog.length > 0 && (
        <section aria-labelledby="catalog-cars">
          <h2 id="catalog-cars" className="mt-8 text-xl font-bold">
            Explorar modelos
          </h2>
          {rows(catalog)}
        </section>
      )}
      {options.length === 0 && (
        <p className="mt-8 rounded-2xl bg-mist p-4 break-words">
          No hay coches que coincidan con «{query.trim()}».
        </p>
      )}

      <p className="mt-6 text-sm text-muted">
        La capacidad puede variar según el año y la versión. Compruébala en el
        manual de tu coche.
      </p>
    </>
  )
}

interface CarRowProps {
  option: CarOption
  selected: boolean
  onSelect: () => void
}

function CarRow({ option, selected, onSelect }: CarRowProps) {
  const note = selected
    ? 'Seleccionado'
    : option.ref.source === 'own'
      ? 'Añadido por ti'
      : null
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-4 text-left ${
          selected
            ? 'border-selected-line bg-selected'
            : 'border-line bg-card hover:bg-mist'
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold break-words">
            {option.label}
          </span>
          {note !== null && (
            <span className="block text-sm text-muted">{note}</span>
          )}
        </span>
        <span className="shrink-0 text-lg font-bold">
          {formatLiters(option.capacity)}
        </span>
        <span aria-hidden="true" className="shrink-0 text-lg">
          {selected ? '✓' : '›'}
        </span>
      </button>
    </li>
  )
}
