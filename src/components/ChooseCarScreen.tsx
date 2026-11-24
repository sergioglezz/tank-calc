import { ScreenTitle } from './ScreenTitle'

interface ChooseCarScreenProps {
  onBack: () => void
}

export function ChooseCarScreen({ onBack }: ChooseCarScreenProps) {
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
    </>
  )
}
