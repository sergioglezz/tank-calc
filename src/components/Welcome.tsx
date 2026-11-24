interface WelcomeProps {
  onChooseCar: () => void
}

const STEPS = [
  ['Elige tu coche', 'O añade el tuyo con su capacidad.'],
  ['Indica nivel y precio', 'Tal como los ves en el coche y el surtidor.'],
  ['Mira cuánto pedir', 'Un importe claro antes de pagar.'],
] as const

/** First visit, or no car selected (CA1). */
export function Welcome({ onChooseCar }: WelcomeProps) {
  return (
    <>
      <section className="mt-6 rounded-3xl bg-ink p-6 text-white">
        <p className="text-xs font-bold tracking-wide text-lime uppercase">
          Antes de pasar por caja
        </p>
        <p className="mt-3 text-4xl leading-tight font-extrabold text-lime">
          Solo paga lo que cabe.
        </p>
        <p className="mt-3 text-lg">
          Calcula cuánto pedir en la gasolinera, sin hacer cuentas de cabeza.
        </p>
        <button
          type="button"
          onClick={onChooseCar}
          className="mt-6 min-h-14 w-full rounded-2xl bg-lime px-4 text-lg font-bold text-ink hover:bg-lime-dark"
        >
          Elegir coche
        </button>
      </section>

      <h2 className="mt-8 text-xl font-bold">Empieza en tres pasos</h2>
      <ol className="mt-3 space-y-4 rounded-3xl bg-card p-6">
        {STEPS.map(([title, text], index) => (
          <li key={title} className="flex gap-4">
            <span aria-hidden="true" className="text-2xl font-extrabold">
              {index + 1}
            </span>
            <div>
              <p className="text-lg font-semibold">{title}</p>
              <p className="text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-3xl bg-mist p-6">
        <p className="text-lg font-semibold">Tu cálculo aparecerá aquí</p>
        <p className="mt-1 text-muted">Elige un coche para empezar.</p>
      </div>
    </>
  )
}
