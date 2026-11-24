import type { ResultText } from '../lib/resultText'

interface ResultCardProps {
  text: ResultText
  /** Figures in big lime type; messages (full tank, missing data) in white. */
  emphasis: boolean
}

/** A live region, so screen readers announce every new result (CA9). */
export function ResultCard({ text, emphasis }: ResultCardProps) {
  return (
    <section
      aria-live="polite"
      aria-atomic="true"
      aria-label="Resultado"
      className="mt-6 rounded-3xl bg-ink p-6 text-white"
    >
      <p className="text-xs font-bold tracking-wide text-lime uppercase">
        {text.label}
      </p>
      <p
        className={
          emphasis
            ? 'mt-2 text-5xl leading-tight font-extrabold text-lime'
            : 'mt-2 text-3xl leading-tight font-bold'
        }
      >
        {text.headline}
      </p>
      <p className="mt-3 text-white/85">{text.detail}</p>
    </section>
  )
}
