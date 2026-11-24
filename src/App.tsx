import { useState } from 'react'
import { CalculatorScreen } from './components/CalculatorScreen'
import { ChooseCarScreen } from './components/ChooseCarScreen'
import { resolveSelected, type CarState } from './lib/ownCars'
import { loadSavedData, type KeyValueStore } from './lib/storage'

export interface AppProps {
  /** Where data is remembered; null when the browser does not allow it (D4). */
  storage: KeyValueStore | null
}

/** No router: the screen is part of the state (D7). */
type Screen = 'calculator' | 'chooseCar'

function App({ storage }: AppProps) {
  const [saved] = useState(() => loadSavedData(storage))
  const [cars] = useState<CarState>(saved.cars)
  const [screen, setScreen] = useState<Screen>('calculator')
  // The focus only moves to a screen title after navigating, not on load.
  const [hasNavigated, setHasNavigated] = useState(false)

  const goTo = (next: Screen) => {
    setScreen(next)
    setHasNavigated(true)
  }

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pt-6 pb-12">
      <header className="flex items-center justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight">tank-calc</p>
        <p className="rounded-lg bg-lime px-2 py-1 text-xs font-bold tracking-wide uppercase">
          Reposta con cabeza
        </p>
      </header>

      <main>
        {screen === 'calculator' ? (
          <CalculatorScreen
            car={resolveSelected(cars)}
            focusOnMount={hasNavigated}
            onChooseCar={() => goTo('chooseCar')}
          />
        ) : (
          <ChooseCarScreen onBack={() => goTo('calculator')} />
        )}
      </main>
    </div>
  )
}

export default App
