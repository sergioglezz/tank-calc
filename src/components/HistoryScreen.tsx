import type { IsoDate } from '../lib/dates'
import {
  formatDate,
  formatEuros,
  formatLiters,
  formatPrice,
} from '../lib/format'
import {
  dailySpending,
  lastRefuel,
  monthTotal,
  type Refuel,
  type RefuelHistory,
} from '../lib/refuels'
import { ScreenTitle } from './ScreenTitle'

interface HistoryScreenProps {
  history: RefuelHistory
  today: IsoDate
  focusOnMount: boolean
  onGoToCalculator: () => void
}

export function HistoryScreen({
  history,
  today,
  focusOnMount,
  onGoToCalculator,
}: HistoryScreenProps) {
  const last = lastRefuel(history)
  return (
    <>
      <ScreenTitle focusOnMount={focusOnMount}>Tu historial</ScreenTitle>
      {last === null ? (
        <EmptyHistory onGoToCalculator={onGoToCalculator} />
      ) : (
        <>
          <LastRefuel refuel={last} />
          <ThisMonth history={history} today={today} />
          <RefuelList history={history} />
        </>
      )}
    </>
  )
}

/** Capture 11 (CA13 of spec 005). */
function EmptyHistory({ onGoToCalculator }: { onGoToCalculator: () => void }) {
  return (
    <>
      <section className="mt-6 rounded-3xl bg-card p-6">
        <p className="text-xs font-bold tracking-wide text-muted uppercase">
          Tu próxima parada cuenta
        </p>
        <h2 className="mt-3 text-3xl leading-tight font-extrabold">
          Aún no has guardado ningún repostaje
        </h2>
        <p className="mt-3 text-lg text-muted">
          Guarda tu primer cálculo y empieza a ver cuánto gastas en gasolina.
        </p>
        <button
          type="button"
          onClick={onGoToCalculator}
          className="mt-6 min-h-14 w-full rounded-2xl bg-lime px-4 text-lg font-bold hover:bg-lime-dark"
        >
          Ir a la calculadora
        </button>
      </section>
      <div className="mt-6 rounded-3xl bg-mist p-6">
        <p className="text-lg font-semibold">Todos tus repostajes, a mano</p>
        <p className="mt-1 text-muted">
          Aquí verás el último importe, tu gasto por día y los litros de cada
          repostaje.
        </p>
      </div>
    </>
  )
}

/** «18 l · 1,579 €/l», plus the car when there is one. */
const refuelDetails = ({ liters, price, car }: Refuel): string =>
  [formatLiters(liters), formatPrice(price), car].filter(Boolean).join(' · ')

/** CA14 of spec 005. */
function LastRefuel({ refuel }: { refuel: Refuel }) {
  return (
    <section
      aria-labelledby="last-refuel"
      className="mt-6 rounded-3xl bg-ink p-6 text-white"
    >
      <h2
        id="last-refuel"
        className="text-xs font-bold tracking-wide text-lime uppercase"
      >
        La última vez gastaste
      </h2>
      <p className="mt-2 text-5xl leading-tight font-extrabold text-lime">
        {formatEuros(refuel.euros)}
      </p>
      <p className="mt-3 break-words">
        {[formatDate(refuel.date), refuel.car].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-1 text-white/85">
        {formatLiters(refuel.liters)} · {formatPrice(refuel.price)}
      </p>
    </section>
  )
}

/** CA15 of spec 005: the month total and the euros of each day. */
function ThisMonth({
  history,
  today,
}: {
  history: RefuelHistory
  today: IsoDate
}) {
  return (
    <section
      aria-labelledby="this-month"
      className="mt-6 rounded-3xl border border-line bg-card p-6"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="this-month" className="text-xl font-bold">
          Este mes
        </h2>
        <p className="text-2xl font-extrabold">
          {formatEuros(monthTotal(history, today))}
        </p>
      </div>
      <h3 className="mt-4 text-sm font-bold tracking-wide text-muted uppercase">
        Gasto por día
      </h3>
      <ul className="mt-2 divide-y divide-line">
        {dailySpending(history).map(({ date, euros }) => (
          <li key={date} className="flex justify-between gap-3 py-2">
            <span>{formatDate(date)}</span>
            <span className="font-semibold">{formatEuros(euros)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** CA16 of spec 005. */
function RefuelList({ history }: { history: RefuelHistory }) {
  const count = history.length
  return (
    <section aria-labelledby="refuels" className="mt-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="refuels" className="text-xl font-bold">
          Repostajes
        </h2>
        <p className="text-muted">
          {count} {count === 1 ? 'repostaje' : 'repostajes'}
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line rounded-3xl border border-line bg-card px-5">
        {history.map((refuel) => (
          <li key={refuel.id} className="flex items-center gap-3 py-4">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">{formatDate(refuel.date)}</p>
              <p className="text-sm break-words text-muted">
                {refuelDetails(refuel)}
              </p>
            </div>
            <p className="shrink-0 text-xl font-extrabold">
              {formatEuros(refuel.euros)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
