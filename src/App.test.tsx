// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEYS, type KeyValueStore } from './lib/storage'
import { MemoryStore } from './test/memoryStore'

/** A store with one own car, already selected. */
const storeWithCar = (name = 'Prueba', capacity = 50): MemoryStore =>
  new MemoryStore({
    [STORAGE_KEYS.ownCars]: JSON.stringify([{ name, capacity }]),
    [STORAGE_KEYS.selectedCar]: JSON.stringify({ source: 'own', name }),
  })

function renderApp(storage: KeyValueStore | null = new MemoryStore()) {
  const user = userEvent.setup()
  render(<App storage={storage} />)
  return { user }
}

const heading = (name: string) =>
  screen.getByRole('heading', { name, level: 1 })

describe('App', () => {
  describe('first visit and selected car', () => {
    it('shows the welcome without a selected car (CA1)', () => {
      renderApp()
      heading('Calculadora')
      expect(screen.getByText('Solo paga lo que cabe.')).toBeTruthy()
      expect(screen.getByText('Tu cálculo aparecerá aquí')).toBeTruthy()
      expect(screen.queryByRole('textbox')).toBeNull()
    })

    it('shows the selected car with its capacity (CA2)', () => {
      renderApp(storeWithCar('Mi furgoneta', 60))
      const card = screen.getByRole('region', { name: 'Tu coche' })
      expect(card.textContent).toContain('Mi furgoneta · 60\u00a0l')
      expect(screen.queryByText('Solo paga lo que cabe.')).toBeNull()
    })

    it('treats a saved car that no longer exists as none (CA1)', () => {
      renderApp(
        new MemoryStore({
          [STORAGE_KEYS.selectedCar]: JSON.stringify({
            source: 'own',
            name: 'Borrado',
          }),
        }),
      )
      expect(screen.getByText('Solo paga lo que cabe.')).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('goes from the welcome to «Elige tu coche» and back', async () => {
      const { user } = renderApp()
      await user.click(screen.getByRole('button', { name: 'Elegir coche' }))
      expect(document.activeElement).toBe(heading('Elige tu coche'))

      await user.click(screen.getByRole('button', { name: 'Volver' }))
      expect(document.activeElement).toBe(heading('Calculadora'))
    })

    it('opens «Elige tu coche» from «Cambiar»', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: 'Cambiar coche' }))
      heading('Elige tu coche')
    })

    it('does not move the focus on load', () => {
      renderApp()
      expect(document.activeElement).toBe(document.body)
    })
  })
})
