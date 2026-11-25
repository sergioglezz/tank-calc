// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEYS, type KeyValueStore } from './lib/storage'
import { FailingStore, MemoryStore } from './test/memoryStore'

/** A store with one own car, already selected. */
const storeWithCar = (name = 'Prueba', capacity = 50): MemoryStore =>
  new MemoryStore({
    [STORAGE_KEYS.ownCars]: JSON.stringify([{ name, capacity }]),
    [STORAGE_KEYS.selectedCar]: JSON.stringify({ source: 'own', name }),
  })

/** Every component test runs on the same day. */
const TODAY = '2026-11-24'

function renderApp(storage: KeyValueStore | null = new MemoryStore()) {
  const user = userEvent.setup()
  render(<App storage={storage} getToday={() => TODAY} />)
  return { user }
}

/** The result card text, with every kind of space as a plain one. */
const resultText = () =>
  screen
    .getByRole('region', { name: 'Resultado' })
    .textContent.replace(/\s+/g, ' ')

const input = (name: string) =>
  screen.getByRole('textbox', { name }) as HTMLInputElement

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

  describe('calculator', () => {
    it('calculates as soon as the data is typed, without a button (CA6, CA7)', async () => {
      const { user } = renderApp(storeWithCar())
      expect(resultText()).toContain('Revisa los datos')
      await user.type(input('Nivel actual (%)'), '25')
      await user.type(input('Precio por litro (€/l)'), '1,579')
      expect(resultText()).toContain('Pide 59 €')
      expect(resultText()).toContain('37 l · el depósito queda al 99 %')
      expect(screen.queryByRole('button', { name: /calcular/i })).toBeNull()
    })

    it('shows the fields in order, with the result card last (CA3)', async () => {
      const { user } = renderApp(storeWithCar())
      const isInOrder = (...elements: HTMLElement[]) =>
        elements.every(
          (element, index) =>
            index === 0 ||
            (elements[index - 1].compareDocumentPosition(element) &
              Node.DOCUMENT_POSITION_FOLLOWING) !==
              0,
        )
      const common = () => [
        input('Nivel actual (%)'),
        screen.getByRole('button', { name: '25 %' }),
        screen.getByRole('button', { name: '50 %' }),
        screen.getByRole('button', { name: '75 %' }),
        input('Precio por litro (€/l)'),
        screen.getByRole('group', { name: 'Modo de cálculo' }),
      ]
      const card = () => screen.getByRole('region', { name: 'Resultado' })

      expect(isInOrder(...common(), card())).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(isInOrder(...common(), input('% objetivo'), card())).toBe(true)
      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      expect(isInOrder(...common(), input('Euros que tienes'), card())).toBe(
        true,
      )
    })

    it('keeps every value when switching modes (CA5)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '25')
      await user.type(input('Precio por litro (€/l)'), '1,579')

      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(
        screen
          .getByRole('button', { name: 'Hasta X %' })
          .getAttribute('aria-pressed'),
      ).toBe('true')
      await user.type(input('% objetivo'), '75')
      expect(resultText()).toContain('Pide 39 €')

      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      expect(screen.queryByRole('textbox', { name: '% objetivo' })).toBeNull()
      await user.type(input('Euros que tienes'), '30')
      expect(resultText()).toContain('Con 30 € puedes añadir')
      expect(resultText()).toContain('18 l')

      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(input('% objetivo').value).toBe('75')
      expect(input('Nivel actual (%)').value).toBe('25')
    })

    it('keeps the data while choosing a car (CA5)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '40')
      await user.click(screen.getByRole('button', { name: 'Cambiar coche' }))
      await user.click(screen.getByRole('button', { name: 'Volver' }))
      expect(input('Nivel actual (%)').value).toBe('40')
    })

    it('fills the level with a quick button', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: '50 %' }))
      expect(input('Nivel actual (%)').value).toBe('50')
    })

    it('keeps only digits in whole-number fields (CA16)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      await user.click(input('Euros que tienes'))
      await user.paste('1.000')
      expect(input('Euros que tienes').value).toBe('1000')
      await user.type(input('Nivel actual (%)'), '-3a')
      expect(input('Nivel actual (%)').value).toBe('3')
    })

    it('lets the price have a decimal comma', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Precio por litro (€/l)'), '1,579')
      expect(input('Precio por litro (€/l)').value).toBe('1,579')
    })

    it('asks for the right keypad in each field (CA15)', async () => {
      const { user } = renderApp(storeWithCar())
      expect(input('Nivel actual (%)').inputMode).toBe('numeric')
      expect(input('Precio por litro (€/l)').inputMode).toBe('decimal')
      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(input('% objetivo').inputMode).toBe('numeric')
      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      expect(input('Euros que tienes').inputMode).toBe('numeric')
    })

    it('says the tank is full at 100 % in any mode (CA8)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '100')
      expect(resultText()).toContain('Tu depósito ya está lleno')
      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(resultText()).toContain('Tu depósito ya está lleno')
    })

    it('announces the result to screen readers (CA9)', () => {
      renderApp(storeWithCar())
      const card = screen.getByRole('region', { name: 'Resultado' })
      expect(card.getAttribute('aria-live')).toBe('polite')
    })
  })

  describe('field errors', () => {
    const errorOf = (name: string) => {
      const field = input(name)
      const id = field.getAttribute('aria-describedby')
      return id === null ? null : document.getElementById(id)?.textContent
    }

    it('shows no error before leaving the field (CA10)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '105')
      expect(errorOf('Nivel actual (%)')).toBe(null)
      expect(input('Nivel actual (%)').getAttribute('aria-invalid')).toBe(null)
    })

    it('shows the error when leaving the field and hides it once fixed (CA11, CA12, CA32)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(input('Nivel actual (%)'))
      await user.tab()
      expect(errorOf('Nivel actual (%)')).toBe('Introduce el nivel actual.')
      expect(input('Nivel actual (%)').getAttribute('aria-invalid')).toBe(
        'true',
      )

      await user.type(input('Nivel actual (%)'), '105')
      expect(errorOf('Nivel actual (%)')).toBe(
        'Escribe un porcentaje entero entre 0 y 100.',
      )

      await user.type(input('Nivel actual (%)'), '{Backspace}')
      expect(errorOf('Nivel actual (%)')).toBe(null)
      expect(input('Nivel actual (%)').getAttribute('aria-invalid')).toBe(null)
    })

    it('marks the level as left when a quick button is used', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: '25 %' }))
      await user.clear(input('Nivel actual (%)'))
      expect(errorOf('Nivel actual (%)')).toBe('Introduce el nivel actual.')
    })

    it('shows the price errors', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Precio por litro (€/l)'), '1,5799')
      await user.tab()
      expect(errorOf('Precio por litro (€/l)')).toBe(
        'Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.',
      )
    })

    it('checks the target again when the level changes (CA13)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '80')
      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      await user.type(input('% objetivo'), '75')
      await user.tab()
      expect(errorOf('% objetivo')).toBe(
        'El objetivo debe ser mayor que el nivel actual.',
      )

      await user.clear(input('Nivel actual (%)'))
      await user.type(input('Nivel actual (%)'), '50')
      expect(errorOf('% objetivo')).toBe(null)

      // With an invalid level only the target's own rule applies.
      await user.clear(input('Nivel actual (%)'))
      await user.type(input('Nivel actual (%)'), '105')
      expect(errorOf('% objetivo')).toBe(null)
    })

    it('only shows the errors of the visible fields (CA14)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      await user.click(input('Euros que tienes'))
      await user.tab()
      expect(screen.getByText('Introduce cuántos euros tienes.')).toBeTruthy()

      await user.click(screen.getByRole('button', { name: 'A tope' }))
      expect(screen.queryByText('Introduce cuántos euros tienes.')).toBeNull()

      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      expect(screen.getByText('Introduce cuántos euros tienes.')).toBeTruthy()
    })
  })

  describe('remembered price', () => {
    const SAVE_FAILED =
      'No se han podido guardar tus datos en este dispositivo. Se mantendrán hasta que cierres la app.'

    it('fills in the remembered price (CA4)', () => {
      const store = storeWithCar()
      store.setItem(STORAGE_KEYS.price, '1.579')
      renderApp(store)
      expect(input('Precio por litro (€/l)').value).toBe('1,579')
    })

    it('starts with an empty price on the first visit (CA4)', () => {
      renderApp(storeWithCar())
      expect(input('Precio por litro (€/l)').value).toBe('')
    })

    it('remembers every valid price for the next visit (CA17)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await user.type(input('Precio por litro (€/l)'), '1.50')
      cleanup()

      renderApp(store)
      expect(input('Precio por litro (€/l)').value).toBe('1,5')
    })

    it('does not replace the remembered price with an invalid one (CA17)', async () => {
      const store = storeWithCar()
      store.setItem(STORAGE_KEYS.price, '1,579')
      const { user } = renderApp(store)
      await user.clear(input('Precio por litro (€/l)'))
      await user.type(input('Precio por litro (€/l)'), '9')
      cleanup()

      renderApp(store)
      expect(input('Precio por litro (€/l)').value).toBe('1,579')
    })

    it('warns when it cannot save and keeps calculating (CA29)', async () => {
      const store = new FailingStore({
        [STORAGE_KEYS.ownCars]: JSON.stringify([
          { name: 'Prueba', capacity: 50 },
        ]),
        [STORAGE_KEYS.selectedCar]: JSON.stringify({
          source: 'own',
          name: 'Prueba',
        }),
      })
      const { user } = renderApp(store)
      expect(screen.queryByText(SAVE_FAILED)).toBeNull()

      await user.type(input('Nivel actual (%)'), '25')
      await user.type(input('Precio por litro (€/l)'), '1,579')
      expect(screen.getByText(SAVE_FAILED)).toBeTruthy()
      expect(resultText()).toContain('Pide 59 €')
    })
  })

  describe('choose a car', () => {
    const openChooseCar = async (store = storeWithCar()) => {
      const result = renderApp(store)
      await result.user.click(
        screen.getByRole('button', { name: 'Cambiar coche' }),
      )
      return result
    }

    const carButton = (name: RegExp) => screen.getByRole('button', { name })

    it('lists own cars first and then the catalog (CA18, CA19)', async () => {
      await openChooseCar()
      const own = screen.getByRole('region', { name: 'Mis coches' })
      expect(own.textContent).toContain('Prueba')
      expect(own.textContent).toContain('Seleccionado')
      expect(
        screen.getByRole('region', { name: 'Explorar modelos' }).textContent,
      ).toContain('Toyota Corolla')
      expect(screen.getByText(/Compruébala en el manual/)).toBeTruthy()
    })

    it('marks own cars that are not selected as added by the user (CA19)', async () => {
      const store = storeWithCar()
      store.setItem(
        STORAGE_KEYS.selectedCar,
        JSON.stringify({ source: 'catalog', key: 'toyota|corolla|' }),
      )
      await openChooseCar(store)
      expect(carButton(/^Prueba/).textContent).toContain('Añadido por ti')
      expect(carButton(/^Toyota Corolla/).textContent).toContain('Seleccionado')
    })

    it('filters while typing, by every word in any order (CA21)', async () => {
      const { user } = await openChooseCar()
      await user.type(
        screen.getByRole('searchbox', { name: 'Busca marca o modelo' }),
        'corolla toy',
      )
      expect(carButton(/^Toyota Corolla/)).toBeTruthy()
      expect(screen.queryByRole('button', { name: /^Seat Ibiza/ })).toBeNull()
      expect(screen.queryByRole('region', { name: 'Mis coches' })).toBeNull()
    })

    it('says when no car matches (CA22)', async () => {
      const { user } = await openChooseCar()
      await user.type(
        screen.getByRole('searchbox', { name: 'Busca marca o modelo' }),
        '  zzz ',
      )
      expect(
        screen.getByText('No hay coches que coincidan con «zzz».'),
      ).toBeTruthy()
      expect(
        screen.queryByRole('region', { name: 'Explorar modelos' }),
      ).toBeNull()
    })

    it('selects a car, goes back and calculates with it (CA20)', async () => {
      const store = storeWithCar()
      const { user } = await openChooseCar(store)
      await user.click(carButton(/^Toyota Corolla/))

      expect(document.activeElement).toBe(heading('Calculadora'))
      expect(
        screen.getByRole('region', { name: 'Tu coche' }).textContent,
      ).toContain('Toyota Corolla · 43')
      await user.type(input('Nivel actual (%)'), '0')
      await user.type(input('Precio por litro (€/l)'), '1')
      expect(resultText()).toContain('Pide 43 €')
      expect(store.getItem(STORAGE_KEYS.selectedCar)).toBe(
        JSON.stringify({ source: 'catalog', key: 'toyota|corolla|' }),
      )
    })

    it('chooses the first car from the welcome', async () => {
      const { user } = renderApp()
      await user.click(screen.getByRole('button', { name: 'Elegir coche' }))
      expect(screen.queryByRole('region', { name: 'Mis coches' })).toBeNull()
      await user.click(carButton(/^Seat Ibiza/))
      expect(
        screen.getByRole('region', { name: 'Tu coche' }).textContent,
      ).toContain('Seat Ibiza')
    })
  })

  describe('delete an own car', () => {
    const storeWithTwoCars = () =>
      new MemoryStore({
        [STORAGE_KEYS.ownCars]: JSON.stringify([
          { name: 'Prueba', capacity: 50 },
          { name: 'Mi furgoneta', capacity: 60 },
        ]),
        [STORAGE_KEYS.selectedCar]: JSON.stringify({
          source: 'own',
          name: 'Prueba',
        }),
      })

    const openChooseCar = async (store: MemoryStore) => {
      const result = renderApp(store)
      await result.user.click(
        screen.getByRole('button', { name: 'Cambiar coche' }),
      )
      return result
    }

    it('asks before deleting and cancelling keeps the car (CA23)', async () => {
      const { user } = await openChooseCar(storeWithTwoCars())
      await user.click(
        screen.getByRole('button', { name: 'Borrar Mi furgoneta' }),
      )
      const dialog = screen.getByRole('dialog', {
        name: '¿Borrar «Mi furgoneta»?',
      })
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: 'Cancelar' }),
      )
      await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('button', { name: /^Mi furgoneta/ })).toBeTruthy()
    })

    it('deletes the car once confirmed and remembers it (CA23)', async () => {
      const store = storeWithTwoCars()
      const { user } = await openChooseCar(store)
      await user.click(
        screen.getByRole('button', { name: 'Borrar Mi furgoneta' }),
      )
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Borrar',
        }),
      )
      expect(screen.queryByRole('button', { name: /^Mi furgoneta/ })).toBeNull()
      expect(document.activeElement).toBe(heading('Elige tu coche'))
      expect(store.getItem(STORAGE_KEYS.ownCars)).toBe(
        JSON.stringify([{ name: 'Prueba', capacity: 50 }]),
      )
    })

    it('goes back to the welcome after deleting the selected car (CA23)', async () => {
      const { user } = await openChooseCar(storeWithTwoCars())
      await user.click(screen.getByRole('button', { name: 'Borrar Prueba' }))
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: 'Borrar',
        }),
      )
      await user.click(screen.getByRole('button', { name: 'Volver' }))
      expect(screen.getByText('Solo paga lo que cabe.')).toBeTruthy()
    })

    it('has no delete button for catalog cars (CA23)', async () => {
      await openChooseCar(storeWithTwoCars())
      expect(
        screen.queryByRole('button', { name: 'Borrar Toyota Corolla' }),
      ).toBeNull()
      expect(screen.getAllByRole('button', { name: /^Borrar / })).toHaveLength(
        2,
      )
    })
  })

  describe('add my car', () => {
    const openAddCar = async (store: MemoryStore = new MemoryStore()) => {
      const result = renderApp(store)
      await result.user.click(
        screen.queryByRole('button', { name: 'Elegir coche' }) ??
          screen.getByRole('button', { name: 'Cambiar coche' }),
      )
      await result.user.click(
        screen.getByRole('button', { name: 'Añadir mi coche' }),
      )
      return {
        ...result,
        dialog: screen.getByRole('dialog', { name: 'Añadir mi coche' }),
      }
    }

    it('adds the car, selects it and goes back to the calculator (CA24, CA26)', async () => {
      const store = new MemoryStore()
      const { user, dialog } = await openAddCar(store)
      await user.type(
        within(dialog).getByRole('textbox', { name: 'Nombre' }),
        '  Mi furgoneta ',
      )
      await user.type(
        within(dialog).getByRole('textbox', {
          name: 'Capacidad del depósito (l)',
        }),
        '60',
      )
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

      expect(document.activeElement).toBe(heading('Calculadora'))
      expect(
        screen.getByRole('region', { name: 'Tu coche' }).textContent,
      ).toContain('Mi furgoneta · 60')
      expect(store.getItem(STORAGE_KEYS.ownCars)).toBe(
        JSON.stringify([{ name: 'Mi furgoneta', capacity: 60 }]),
      )
      expect(store.getItem(STORAGE_KEYS.selectedCar)).toBe(
        JSON.stringify({ source: 'own', name: 'Mi furgoneta' }),
      )
    })

    it('shows every error at once when saving invalid data (CA25)', async () => {
      const { user, dialog } = await openAddCar()
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
      expect(
        within(dialog).getByText('Introduce un nombre para el coche.'),
      ).toBeTruthy()
      expect(
        within(dialog).getByText('Introduce la capacidad del depósito.'),
      ).toBeTruthy()
      expect(screen.getByRole('dialog', { name: 'Añadir mi coche' })).toBe(
        dialog,
      )
    })

    it('shows an error when leaving a field and for a repeated name (CA25)', async () => {
      const { user, dialog } = await openAddCar(storeWithCar('Mi León'))
      const name = within(dialog).getByRole('textbox', { name: 'Nombre' })
      await user.type(name, 'MI LEON')
      expect(
        within(dialog).queryByText('Ya tienes un coche con ese nombre.'),
      ).toBeNull()
      await user.tab()
      expect(
        within(dialog).getByText('Ya tienes un coche con ese nombre.'),
      ).toBeTruthy()
      expect(name.getAttribute('aria-invalid')).toBe('true')

      await user.type(
        within(dialog).getByRole('textbox', {
          name: 'Capacidad del depósito (l)',
        }),
        '40,5',
      )
      await user.tab()
      expect(
        within(dialog).getByText(
          'Escribe una capacidad entera entre 1 y 200 litros.',
        ),
      ).toBeTruthy()
    })

    it('shows the limit message with 10 own cars (CA27)', async () => {
      const store = new MemoryStore({
        [STORAGE_KEYS.ownCars]: JSON.stringify(
          Array.from({ length: 10 }, (_, i) => ({
            name: `Coche ${i + 1}`,
            capacity: 50,
          })),
        ),
      })
      const { user, dialog } = await openAddCar(store)
      expect(
        within(dialog).getByText(
          'Ya tienes 10 coches guardados. Borra uno para añadir otro.',
        ),
      ).toBeTruthy()
      expect(within(dialog).queryByRole('textbox')).toBeNull()
      await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('cancelling adds nothing and starts empty next time (CA28)', async () => {
      const store = new MemoryStore()
      const { user, dialog } = await openAddCar(store)
      await user.type(
        within(dialog).getByRole('textbox', { name: 'Nombre' }),
        'Borrador',
      )
      await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.queryByRole('region', { name: 'Mis coches' })).toBeNull()
      expect(store.getItem(STORAGE_KEYS.ownCars)).toBe(null)

      await user.click(screen.getByRole('button', { name: 'Añadir mi coche' }))
      expect(
        (screen.getByRole('textbox', { name: 'Nombre' }) as HTMLInputElement)
          .value,
      ).toBe('')
    })

    it('keeps the add button when no car matches (CA22)', async () => {
      const { user } = renderApp()
      await user.click(screen.getByRole('button', { name: 'Elegir coche' }))
      await user.type(
        screen.getByRole('searchbox', { name: 'Busca marca o modelo' }),
        'zzz',
      )
      expect(
        screen.getByRole('button', { name: 'Añadir mi coche' }),
      ).toBeTruthy()
    })
  })

  describe('bottom navigation', () => {
    const nav = () => screen.getByRole('navigation', { name: 'Principal' })
    const navButton = (name: string) =>
      within(nav()).getByRole('button', { name })

    it('goes to the history and back, moving the focus (CA1, CA2)', async () => {
      const { user } = renderApp(storeWithCar())
      expect(navButton('Calculadora').getAttribute('aria-current')).toBe('page')
      expect(navButton('Historial').getAttribute('aria-current')).toBe(null)

      await user.click(navButton('Historial'))
      expect(document.activeElement).toBe(heading('Tu historial'))
      expect(navButton('Historial').getAttribute('aria-current')).toBe('page')

      await user.click(navButton('Calculadora'))
      expect(document.activeElement).toBe(heading('Calculadora'))
    })

    it('does nothing when the active section is pressed (CA2)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(navButton('Calculadora'))
      expect(document.activeElement).toBe(navButton('Calculadora'))
    })

    it('marks «Calculadora» while choosing a car and goes back with it (CA1, CA2)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.click(screen.getByRole('button', { name: 'Cambiar coche' }))
      heading('Elige tu coche')
      expect(navButton('Calculadora').getAttribute('aria-current')).toBe('page')

      await user.click(navButton('Calculadora'))
      expect(document.activeElement).toBe(heading('Calculadora'))
    })

    it('keeps the calculator data after visiting the history (CA3)', async () => {
      const { user } = renderApp(storeWithCar())
      await user.type(input('Nivel actual (%)'), '105')
      await user.tab()
      await user.click(navButton('Historial'))
      await user.click(navButton('Calculadora'))
      expect(input('Nivel actual (%)').value).toBe('105')
      expect(
        screen.getByText('Escribe un porcentaje entero entre 0 y 100.'),
      ).toBeTruthy()
    })
  })

  describe('history screen', () => {
    // Saved as `addRefuel` would: liters = euros / price, truncated.
    const REFUELS = [
      {
        id: 1,
        date: '2026-10-30',
        euros: 40,
        price: 1.6,
        liters: 25,
        car: null,
      },
      {
        id: 2,
        date: '2026-11-20',
        euros: 30,
        price: 1.579,
        liters: 18,
        car: 'Seat Ibiza',
      },
      {
        id: 3,
        date: '2026-11-24',
        euros: 20,
        price: 1.5,
        liters: 13,
        car: 'Seat Ibiza',
      },
      {
        id: 4,
        date: '2026-11-24',
        euros: 25,
        price: 1.5,
        liters: 16,
        car: null,
      },
    ]

    const storeWithRefuels = (refuels: unknown = REFUELS) => {
      const store = storeWithCar()
      store.setItem(STORAGE_KEYS.refuels, JSON.stringify(refuels))
      return store
    }

    const openHistory = async (store: MemoryStore) => {
      const result = renderApp(store)
      await result.user.click(
        within(screen.getByRole('navigation', { name: 'Principal' })).getByRole(
          'button',
          { name: 'Historial' },
        ),
      )
      return result
    }

    const region = (name: string) =>
      screen.getByRole('region', { name }).textContent.replace(/\s+/g, ' ')

    it('shows the empty history and goes to the calculator (CA13)', async () => {
      const { user } = await openHistory(storeWithCar())
      expect(
        screen.getByRole('heading', {
          name: 'Aún no has guardado ningún repostaje',
        }),
      ).toBeTruthy()
      expect(screen.getByText('Todos tus repostajes, a mano')).toBeTruthy()
      await user.click(
        screen.getByRole('button', { name: 'Ir a la calculadora' }),
      )
      expect(document.activeElement).toBe(heading('Calculadora'))
    })

    it('shows the last refuel (CA14, CA17)', async () => {
      await openHistory(storeWithRefuels())
      expect(region('La última vez gastaste')).toBe(
        'La última vez gastaste25 €24/11/202616 l · 1,5 €/l',
      )
    })

    it('shows the car of the last refuel when it has one (CA14)', async () => {
      await openHistory(storeWithRefuels(REFUELS.slice(0, 3)))
      expect(region('La última vez gastaste')).toContain(
        '24/11/2026 · Seat Ibiza',
      )
    })

    it('shows the month total and the euros of each day (CA15)', async () => {
      await openHistory(storeWithRefuels())
      const month = region('Este mes')
      expect(month).toContain('Este mes75 €')
      expect(month).toContain('24/11/202645 €')
      expect(month).toContain('20/11/202630 €')
      expect(month).toContain('30/10/202640 €')
    })

    it('lists every refuel, newest first, with its count (CA16, CA17)', async () => {
      await openHistory(storeWithRefuels())
      expect(region('Repostajes')).toContain('4 repostajes')
      const rows = within(screen.getByRole('region', { name: 'Repostajes' }))
        .getAllByRole('listitem')
        .map((row) => row.textContent.replace(/\s+/g, ' '))
      expect(rows).toEqual([
        '24/11/202616 l · 1,5 €/l25 €Borrar',
        '24/11/202613 l · 1,5 €/l · Seat Ibiza20 €Borrar',
        '20/11/202618 l · 1,579 €/l · Seat Ibiza30 €Borrar',
        '30/10/202625 l · 1,6 €/l40 €Borrar',
      ])
    })

    it('says «1 repostaje» with a single one (CA16)', async () => {
      await openHistory(storeWithRefuels(REFUELS.slice(0, 1)))
      expect(region('Repostajes')).toContain('1 repostaje')
      expect(region('Repostajes')).not.toContain('1 repostajes')
    })

    it('keeps the valid refuels of damaged data (CA21)', async () => {
      await openHistory(
        storeWithRefuels([REFUELS[1], { id: 9, date: 'ayer' }, 'basura']),
      )
      expect(region('Repostajes')).toContain('1 repostaje')
      expect(region('La última vez gastaste')).toContain('30 €')
    })

    const confirmIn = () =>
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Borrar',
      })

    it('asks before deleting a refuel; cancelling keeps it (CA18)', async () => {
      const { user } = await openHistory(storeWithRefuels())
      await user.click(
        screen.getByRole('button', {
          name: 'Borrar el repostaje del 20/11/2026 de 30\u00a0€',
        }),
      )
      const dialog = screen.getByRole('dialog', {
        name: '¿Borrar el repostaje del 20/11/2026 de 30\u00a0€?',
      })
      expect(document.activeElement).toBe(
        within(dialog).getByRole('button', { name: 'Cancelar' }),
      )
      await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(region('Repostajes')).toContain('4 repostajes')
    })

    it('deletes the refuel and updates everything (CA19, CA22)', async () => {
      const store = storeWithRefuels()
      const { user } = await openHistory(store)
      await user.click(
        screen.getByRole('button', {
          name: 'Borrar el repostaje del 24/11/2026 de 25\u00a0€',
        }),
      )
      await user.click(confirmIn())

      expect(document.activeElement).toBe(heading('Tu historial'))
      expect(region('Repostajes')).toContain('3 repostajes')
      expect(region('La última vez gastaste')).toContain('20 €')
      expect(region('Este mes')).toContain('Este mes50 €')
      expect(region('Este mes')).toContain('24/11/202620 €')
      const saved = JSON.parse(store.getItem(STORAGE_KEYS.refuels) ?? '[]')
      expect(saved.map((refuel: { id: number }) => refuel.id)).toEqual([
        3, 2, 1,
      ])
    })

    it('deletes only the chosen one of two identical refuels (CA19)', async () => {
      const twin = { ...REFUELS[1], id: 5 }
      const { user } = await openHistory(storeWithRefuels([REFUELS[1], twin]))
      const buttons = screen.getAllByRole('button', {
        name: 'Borrar el repostaje del 20/11/2026 de 30\u00a0€',
      })
      expect(buttons).toHaveLength(2)
      await user.click(buttons[1])
      await user.click(confirmIn())
      expect(region('Repostajes')).toContain('1 repostaje')
    })

    it('shows the empty history after deleting the last refuel (CA20)', async () => {
      const { user } = await openHistory(storeWithRefuels(REFUELS.slice(0, 1)))
      await user.click(
        screen.getByRole('button', {
          name: 'Borrar el repostaje del 30/10/2026 de 40\u00a0€',
        }),
      )
      await user.click(confirmIn())
      expect(
        screen.getByRole('heading', {
          name: 'Aún no has guardado ningún repostaje',
        }),
      ).toBeTruthy()
      expect(document.activeElement).toBe(heading('Tu historial'))
    })

    it('warns when the history cannot be saved (CA22)', async () => {
      const store = new FailingStore({
        [STORAGE_KEYS.refuels]: JSON.stringify(REFUELS.slice(0, 1)),
      })
      const { user } = await openHistory(store)
      await user.click(
        screen.getByRole('button', {
          name: 'Borrar el repostaje del 30/10/2026 de 40\u00a0€',
        }),
      )
      await user.click(confirmIn())
      expect(screen.getByRole('status').textContent).toContain(
        'No se han podido guardar tus datos',
      )
      expect(
        screen.getByRole('heading', {
          name: 'Aún no has guardado ningún repostaje',
        }),
      ).toBeTruthy()
    })

    it('treats unreadable data as an empty history (CA21)', async () => {
      const store = storeWithCar()
      store.setItem(STORAGE_KEYS.refuels, '{no es json')
      await openHistory(store)
      expect(
        screen.getByRole('heading', {
          name: 'Aún no has guardado ningún repostaje',
        }),
      ).toBeTruthy()
    })
  })

  describe('save a refuel', () => {
    const saveButton = () =>
      screen.getByRole('button', {
        name: 'Guardar repostaje',
      }) as HTMLButtonElement

    const fillCalculator = async (
      user: ReturnType<typeof userEvent.setup>,
      level = '25',
      price = '1,579',
    ) => {
      await user.type(input('Nivel actual (%)'), level)
      await user.type(input('Precio por litro (€/l)'), price)
    }

    const openSheet = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(saveButton())
      return screen.getByRole('dialog', { name: 'Guardar repostaje' })
    }

    const field = (dialog: HTMLElement, name: string) =>
      within(dialog).getByLabelText(name) as HTMLInputElement

    it('enables the button only when the card shows figures (CA5)', async () => {
      const { user } = renderApp(storeWithCar())
      expect(saveButton().disabled).toBe(true)
      await fillCalculator(user)
      expect(saveButton().disabled).toBe(false)

      await user.clear(input('Nivel actual (%)'))
      await user.type(input('Nivel actual (%)'), '100')
      expect(saveButton().disabled).toBe(true)

      await user.clear(input('Nivel actual (%)'))
      await user.type(input('Nivel actual (%)'), '99')
      await user.clear(input('Precio por litro (€/l)'))
      await user.type(input('Precio por litro (€/l)'), '1,5')
      expect(resultText()).toContain('Falta menos de 1 €')
      expect(saveButton().disabled).toBe(true)
    })

    it('has no button on the welcome (CA5)', () => {
      renderApp()
      expect(
        screen.queryByRole('button', { name: 'Guardar repostaje' }),
      ).toBeNull()
    })

    it('fills in the euros to ask for, the price, today and the car (CA6)', async () => {
      const { user } = renderApp(storeWithCar())
      await fillCalculator(user)
      await user.click(screen.getByRole('button', { name: 'Tengo X €' }))
      await user.type(input('Euros que tienes'), '80')

      const dialog = await openSheet(user)
      expect(field(dialog, 'Euros pagados (€)').value).toBe('59')
      expect(field(dialog, 'Euros pagados (€)').inputMode).toBe('numeric')
      expect(field(dialog, 'Precio por litro (€/l)').value).toBe('1,579')
      expect(field(dialog, 'Fecha').value).toBe(TODAY)
      expect(field(dialog, 'Fecha').min).toBe('2025-11-24')
      expect(field(dialog, 'Fecha').max).toBe(TODAY)
      expect(
        within(dialog).getByText('Se guardará con tu coche: Prueba.'),
      ).toBeTruthy()
    })

    it('saves the refuel, shows the notice and lists it (CA9)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByText('Repostaje guardado')).toBeTruthy()
      heading('Calculadora')
      expect(JSON.parse(store.getItem(STORAGE_KEYS.refuels) ?? '[]')).toEqual([
        {
          id: 1,
          date: TODAY,
          euros: 59,
          price: 1.579,
          liters: 37,
          car: 'Prueba',
        },
      ])

      await user.click(
        within(screen.getByRole('navigation', { name: 'Principal' })).getByRole(
          'button',
          { name: 'Historial' },
        ),
      )
      expect(
        screen.getByRole('region', { name: 'Repostajes' }).textContent,
      ).toContain('24/11/2026')
    })

    it('saves the edited values, including another day (CA7)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)
      await user.clear(field(dialog, 'Euros pagados (€)'))
      await user.type(field(dialog, 'Euros pagados (€)'), '4a0')
      expect(field(dialog, 'Euros pagados (€)').value).toBe('40')
      await user.clear(field(dialog, 'Precio por litro (€/l)'))
      await user.type(field(dialog, 'Precio por litro (€/l)'), '1.6')
      fireEvent.change(field(dialog, 'Fecha'), {
        target: { value: '2026-11-20' },
      })
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

      expect(JSON.parse(store.getItem(STORAGE_KEYS.refuels) ?? '[]')).toEqual([
        {
          id: 1,
          date: '2026-11-20',
          euros: 40,
          price: 1.6,
          liters: 25,
          car: 'Prueba',
        },
      ])
    })

    it('shows errors when leaving a field and all of them when saving (CA8)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)

      await user.clear(field(dialog, 'Euros pagados (€)'))
      await user.tab()
      expect(
        within(dialog).getByText('Introduce el importe pagado.'),
      ).toBeTruthy()

      await user.type(field(dialog, 'Euros pagados (€)'), '1001')
      expect(
        within(dialog).getByText('Escribe un importe entero entre 1 y 1000 €.'),
      ).toBeTruthy()

      await user.clear(field(dialog, 'Precio por litro (€/l)'))
      fireEvent.change(field(dialog, 'Fecha'), {
        target: { value: '2026-11-25' },
      })
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

      expect(
        within(dialog).getByText('Introduce el precio por litro.'),
      ).toBeTruthy()
      expect(
        within(dialog).getByText('La fecha no puede ser posterior a hoy.'),
      ).toBeTruthy()
      expect(field(dialog, 'Fecha').getAttribute('aria-invalid')).toBe('true')
      expect(screen.getByRole('dialog', { name: 'Guardar repostaje' })).toBe(
        dialog,
      )
      expect(store.getItem(STORAGE_KEYS.refuels)).toBe(null)
    })

    it('cancelling saves nothing (CA11)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)
      await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.queryByText('Repostaje guardado')).toBeNull()
      expect(store.getItem(STORAGE_KEYS.refuels)).toBe(null)
    })

    it('hides the notice when data changes, on navigating or reopening (CA10)', async () => {
      const { user } = renderApp(storeWithCar())
      await fillCalculator(user)
      const save = async () => {
        const dialog = await openSheet(user)
        await user.click(
          within(dialog).getByRole('button', { name: 'Guardar' }),
        )
        expect(screen.getByText('Repostaje guardado')).toBeTruthy()
      }

      await save()
      await user.type(input('Nivel actual (%)'), '{Backspace}')
      expect(screen.queryByText('Repostaje guardado')).toBeNull()

      await user.type(input('Nivel actual (%)'), '5')
      await save()
      await user.click(screen.getByRole('button', { name: 'Hasta X %' }))
      expect(screen.queryByText('Repostaje guardado')).toBeNull()

      await user.click(screen.getByRole('button', { name: 'A tope' }))
      await save()
      await openSheet(user)
      expect(screen.queryByText('Repostaje guardado')).toBeNull()
      await user.keyboard('{Escape}')
    })

    it('keeps the calculator and the remembered price (CA12)', async () => {
      const store = storeWithCar()
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)
      await user.clear(field(dialog, 'Precio por litro (€/l)'))
      await user.type(field(dialog, 'Precio por litro (€/l)'), '1,7')
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

      expect(input('Precio por litro (€/l)').value).toBe('1,579')
      expect(input('Nivel actual (%)').value).toBe('25')
      expect(store.getItem(STORAGE_KEYS.price)).toBe('1,579')
    })

    it('warns when the refuel cannot be saved and keeps it (CA22)', async () => {
      const store = new FailingStore({
        [STORAGE_KEYS.ownCars]: JSON.stringify([
          { name: 'Prueba', capacity: 50 },
        ]),
        [STORAGE_KEYS.selectedCar]: JSON.stringify({
          source: 'own',
          name: 'Prueba',
        }),
      })
      const { user } = renderApp(store)
      await fillCalculator(user)
      const dialog = await openSheet(user)
      await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
      expect(
        screen.getByText(/No se han podido guardar tus datos/),
      ).toBeTruthy()

      await user.click(
        within(screen.getByRole('navigation', { name: 'Principal' })).getByRole(
          'button',
          { name: 'Historial' },
        ),
      )
      expect(
        screen.getByRole('region', { name: 'Repostajes' }).textContent,
      ).toContain('1 repostaje')
    })
  })
})
