import { useState } from 'react'
import {
  CalculatorScreen,
  type CalculatorFormState,
  type Field,
} from './components/CalculatorScreen'
import { ChooseCarScreen } from './components/ChooseCarScreen'
import {
  addOwnCar,
  removeOwnCar,
  resolveSelected,
  selectCar,
  type CarRef,
  type CarState,
} from './lib/ownCars'
import {
  loadSavedData,
  saveCarState,
  savePrice,
  type KeyValueStore,
} from './lib/storage'
import { validatePrice } from './lib/validation'

export interface AppProps {
  /** Where data is remembered; null when the browser does not allow it (D4). */
  storage: KeyValueStore | null
}

/** No router: the screen is part of the state (D7). */
type Screen = 'calculator' | 'chooseCar'

function App({ storage }: AppProps) {
  const [saved] = useState(() => loadSavedData(storage))
  const [cars, setCars] = useState<CarState>(saved.cars)
  const [form, setForm] = useState<CalculatorFormState>(() => ({
    mode: 'fullTank',
    fields: { level: '', price: saved.price ?? '', target: '', money: '' },
    touched: {},
  }))
  const [screen, setScreen] = useState<Screen>('calculator')
  // The focus only moves to a screen title after navigating, not on load.
  const [hasNavigated, setHasNavigated] = useState(false)
  // Whether the last attempt to remember something failed (CA29).
  const [saveFailed, setSaveFailed] = useState(false)

  const goTo = (next: Screen) => {
    setScreen(next)
    setHasNavigated(true)
  }

  /** Every change to the cars is remembered at once (CA17 of spec 002). */
  const updateCars = (next: CarState) => {
    setCars(next)
    setSaveFailed(!saveCarState(storage, next))
  }

  const chooseCar = (ref: CarRef) => {
    updateCars(selectCar(cars, ref))
    goTo('calculator')
  }

  /** A new car is selected straight away (CA26). */
  const addCar = (name: string, capacity: string) => {
    const result = addOwnCar(cars, name, capacity)
    if (!result.ok) return
    updateCars(selectCar(result.state, { source: 'own', name: name.trim() }))
    goTo('calculator')
  }

  const changeField = (field: Field, value: string) => {
    setForm((current) => ({
      ...current,
      fields: { ...current.fields, [field]: value },
    }))
    // Every valid price is remembered; an invalid one is not a save (CA17).
    if (field === 'price' && validatePrice(value).ok) {
      setSaveFailed(!savePrice(storage, value))
    }
  }

  const touchField = (field: Field) =>
    setForm((current) => ({
      ...current,
      touched: { ...current.touched, [field]: true },
    }))

  return (
    <div className="mx-auto min-h-dvh max-w-md px-5 pt-6 pb-12">
      <header className="flex items-center justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight">tank-calc</p>
        <p className="rounded-lg bg-lime px-2 py-1 text-xs font-bold tracking-wide uppercase">
          Reposta con cabeza
        </p>
      </header>

      <div role="status">
        {saveFailed && (
          <p className="mt-4 rounded-2xl bg-danger-soft p-4 text-danger">
            No se han podido guardar tus datos en este dispositivo. Se
            mantendrán hasta que cierres la app.
          </p>
        )}
      </div>

      <main>
        {screen === 'calculator' ? (
          <CalculatorScreen
            car={resolveSelected(cars)}
            form={form}
            focusOnMount={hasNavigated}
            onChooseCar={() => goTo('chooseCar')}
            onFieldChange={changeField}
            onTouch={touchField}
            onModeChange={(mode) =>
              setForm((current) => ({ ...current, mode }))
            }
          />
        ) : (
          <ChooseCarScreen
            cars={cars}
            onBack={() => goTo('calculator')}
            onSelect={chooseCar}
            onDelete={(name) => updateCars(removeOwnCar(cars, name))}
            onAdd={addCar}
          />
        )}
      </main>
    </div>
  )
}

export default App
