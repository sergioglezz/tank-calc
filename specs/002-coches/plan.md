# Plan — Feature 002: Coches (lógica)

> **Estado:** aprobado el 24/11/2026. Tareas: [tasks.md](tasks.md).

Cómo se implementa la [spec](spec.md) respetando la [constitución](../00-constitution.md). Sin código todavía.

## 1. Arquitectura
Solo lógica, sin interfaz, en `src/lib/` y sin React, como en la feature 001. `App.tsx` no cambia.

```
cars.json ──► carCatalog ──┐
                           ├──► carSearch ──► opciones para mostrar (nombre + capacidad)
ownCars (añadir/borrar) ───┘
                  ▲
storage ── lee y guarda coches propios, coche seleccionado y precio
```

- **`text.ts`** normaliza textos para comparar (sin mayúsculas, tildes ni diéresis). Lo usan la búsqueda, los nombres repetidos y la identificación de coches.
- **`carCatalog.ts`** expone la lista incluida en la app, ya ordenada, y cómo se muestra cada coche.
- **`ownCars.ts`** contiene las reglas de los coches propios: validar el nombre, añadir, borrar y seleccionar.
- **`carSearch.ts`** junta propios y lista y filtra por el texto buscado.
- **`storage.ts`** es el único módulo que toca `localStorage`. Valida todo lo que lee y nunca lanza excepciones.

## 2. Modelo de datos
```ts
// Entrada de cars.json
interface CatalogCar { brand: string; model: string; variant?: string; capacity: number } // capacity: l

// Coche propio
interface OwnCar { name: string; capacity: number }

// Referencia a un coche (lo que se guarda como «coche seleccionado»)
type CarRef =
  | { source: 'catalog'; key: string }   // clave derivada de marca, modelo y variante (D3)
  | { source: 'own'; name: string }

// Lo que la búsqueda devuelve a la interfaz
interface CarOption { ref: CarRef; label: string; capacity: number }

// Estado de los coches del usuario
interface CarState { ownCars: OwnCar[]; selected: CarRef | null }

// Todo lo que se recuerda entre visitas
interface SavedData { cars: CarState; price: string | null } // price: texto listo para el campo, p. ej. «1,579»
```

## 3. Módulos de `src/lib/`

### `text.ts`
`normalizeText(text)`: descompone el texto (`normalize('NFD')`), quita las marcas diacríticas (U+0300–U+036F) y lo pasa a minúsculas. Así «León», «LEON» y «leon» son iguales (CA7 y CA12). Como efecto, la «ñ» se compara igual que la «n», lo que no afecta a ningún criterio.

### `cars.json` y `carCatalog.ts`
- **`cars.json`:** lista de `CatalogCar` (CA1). Contiene entre 90 y 110 modelos populares en España, sin eléctricos y con capacidades de fichas técnicas públicas (CA2 y CA3). La variante solo aparece si el modelo tiene depósitos distintos según la motorización.
- **`catalogKey(car)`:** `normalizeText` de marca, modelo y variante unidos por `|`, p. ej. `toyota|corolla|hibrido` (D3).
- **`catalogLabel(car)`:** «Marca Modelo» o «Marca Modelo (variante)» (CA4).
- **`catalogCars`:** la lista importada y ordenada con `Intl.Collator('es')` por marca, modelo y variante, con las entradas sin variante antes que las que la tienen (CA9).
- **`findCatalogCar(key)`:** el coche con esa clave, o `null`.

El JSON se importa directamente; en `tsconfig.app.json` se activa `resolveJsonModule` de forma explícita. Que los datos cumplen CA2 lo comprueba un test sobre el propio archivo.

### `ownCars.ts`
- **Constantes:** `MAX_OWN_CARS = 10` y `MAX_NAME_LENGTH = 40`.
- **`validateCarName(text, ownCars)`:** devuelve un `FieldResult` (el tipo de la feature 001). Quita los espacios de los extremos y cuenta los caracteres por puntos de código (`[...name].length`), para que una tilde o un emoji no cuenten doble. Aplica las reglas de CA12 y da los mensajes de CA13. Compara con `normalizeText` contra los nombres de `ownCars`.
- **`addOwnCar(state, nameText, capacityText)`:** si ya hay 10 coches, devuelve solo el error de límite (CA14). Si no, valida el nombre y la capacidad con `validateCapacity` de la feature 001 (CA11) y devuelve todos los errores a la vez, para que la interfaz los muestre junto a cada campo:
  ```ts
  type AddCarResult =
    | { ok: true; state: CarState }
    | { ok: false; errors: { name?: string; capacity?: string; limit?: string } }
  ```
  El coche se añade al final con el nombre sin espacios en los extremos. No se selecciona automáticamente; eso lo decidirá la interfaz.
- **`removeOwnCar(state, name)`:** quita el coche con ese nombre. Si era el seleccionado, `selected` pasa a `null` (CA15). Un nombre que no existe no cambia nada.
- **`selectCar(state, ref)`** y **`resolveSelected(state)`:** el segundo devuelve el `CarOption` del coche seleccionado, o `null` si ya no existe. De ahí sale la capacidad para la calculadora.

Todas las funciones son puras: devuelven un estado nuevo y no modifican el recibido. Los coches de la lista no pasan nunca por estas funciones, así que no se pueden borrar ni modificar (CA16).

### `carSearch.ts`
`searchCars(query, ownCars): CarOption[]`
- Divide `normalizeText(query)` por espacios y descarta las palabras vacías. Si no queda ninguna, devuelve todos los coches (CA8).
- Un coche coincide si cada palabra está contenida en el texto normalizado de su etiqueta: el nombre en los propios; marca, modelo y variante en los de la lista (CA5 y CA6). Las palabras repetidas no cambian el resultado.
- Primero van los propios, ordenados por nombre con `Intl.Collator('es')`, y después los de la lista en el orden de `catalogCars` (CA9). Si ninguno coincide, devuelve una lista vacía (CA10).

### `storage.ts`
Recibe el almacenamiento como parámetro (`Pick<Storage, 'getItem' | 'setItem'>`), para poder probarlo en Node sin el navegador ni dependencias nuevas (D4). `getBrowserStorage()` devuelve `localStorage`, o `null` si el navegador no deja usarlo, porque acceder a él ya puede lanzar una excepción.

Cada dato se guarda en una clave propia, para que uno dañado no afecte a los demás (CA21):

| Clave | Contenido |
|---|---|
| `tank-calc:own-cars` | `OwnCar[]` en JSON |
| `tank-calc:selected-car` | `CarRef` en JSON |
| `tank-calc:price` | texto del precio, p. ej. `1,579` |

- **`loadSavedData(storage | null): SavedData`:** nunca lanza excepciones. Si el almacenamiento es `null`, falta una clave o una lectura falla, ese dato queda como en la primera visita (CA20 y CA21).
  - **Coches propios (CA22):** si el JSON no es un array, se usa `[]`. Si lo es, se recorre en orden y se descarta cada elemento que no sea un objeto con `name` de texto y `capacity` numérica, cuyo nombre no pase `validateCarName` frente a los ya aceptados (así, de los repetidos se queda el primero) o cuya capacidad no pase `validateCapacity(String(capacity))`. Se acepta como mucho a los 10 primeros válidos.
  - **Coche seleccionado:** se acepta si tiene la forma de `CarRef` y existe en la lista (`findCatalogCar`) o en los propios ya cargados. Si no, es `null`.
  - **Precio:** se acepta si pasa `validatePrice`. Si no, es `null`.
- **`saveCarState(storage | null, state): boolean`** y **`savePrice(storage | null, text): boolean`:** devuelven `false` si no se ha podido guardar: sin almacenamiento, `setItem` lanza una excepción o el almacenamiento está lleno (CA23). Mantener el cambio en memoria es cosa de la interfaz, que guarda el estado. `saveCarState` escribe las claves de los coches propios y del coche seleccionado.
- **`savePrice`** solo guarda un precio que pasa `validatePrice`. Uno no válido no se guarda y se devuelve `true`, porque no ha habido ningún fallo (CA18). Lo que se guarda es el valor validado en su forma canónica, con `formatPriceInput`.

### `format.ts` (se amplía)
`formatPriceInput(value)` → `1,579`: el número con coma decimal y sin ceros a la derecha (CA19). Con los precios válidos (como mucho 3 decimales y entre 0,001 y 5), `String(value)` nunca usa notación científica, así que basta con cambiar el punto por la coma.

## 4. Tests
- **`text.test.ts`:** mayúsculas, tildes, diéresis («Citroën» → `citroen`) y texto sin cambios.
- **`carCatalog.test.ts`:** comprobación de los datos de `cars.json` según CA2: número de entradas, capacidades enteras entre 1 y 200, marca y modelo no vacíos, variante no vacía cuando aparece y claves sin repetir. También las dos formas de etiqueta (CA4), el orden de `catalogCars` y `findCatalogCar` con una clave que existe y otra que no.
- **`ownCars.test.ts`:** nombre de 40 y de 41 caracteres; espacios en los extremos; vacío; repetido por mayúsculas o tildes («Mi león» y «MI LEON»); nombre igual que un modelo de la lista (válido); capacidad no válida con los mensajes de la 001; los dos errores a la vez; el décimo coche (sí) y el undécimo (error de límite); borrar el seleccionado, otro distinto, el último y uno que no existe; inmutabilidad del estado recibido; `resolveSelected` con un coche de la lista, uno propio y uno que ya no existe.
- **`carSearch.test.ts`:** «corolla toy», «citroen», «LEON», espacios sobrantes, palabra repetida, texto vacío (todos), sin coincidencias (vacío), búsqueda por variante y orden de los resultados (propios primero y alfabético).
- **`storage.test.ts`**, con un almacenamiento falso en memoria: guardar y volver a cargar los tres datos (CA17); primera visita (CA20); almacenamiento `null`; `getItem` y `setItem` que lanzan excepciones (CA21 y CA23); JSON dañado y tipos incorrectos; coches propios con elementos no válidos, repetidos y más de 10 (CA22); coche seleccionado que ya no existe; precio guardado no válido; precio no válido que no sustituye al anterior (CA18); precios en los extremos.
- **`format.test.ts`:** `1.579` → `1,579`; `1.5` → `1,5`; `5` → `5`; `0.001` → `0,001` (CA19).

## 5. Archivos
**Nuevos:** `src/lib/{text,carCatalog,ownCars,carSearch,storage}.ts` y sus `.test.ts`, y `src/lib/cars.json`.
**Modificados:** `src/lib/format.ts` y su test; `tsconfig.app.json` (`resolveJsonModule`); `docs/decisiones.md` (D3 y D4); `README.md` (estado de la feature 002).
**Dependencias nuevas:** ninguna.

## 6. Decisiones técnicas
Se registran en [docs/decisiones.md](../../docs/decisiones.md):
- **D3 — Identificar los coches por su nombre normalizado.** Los de la lista, por `marca|modelo|variante`; los propios, por su nombre, que es único. Así no hace falta mantener identificadores a mano en el JSON ni generar identificadores aleatorios. Si un modelo cambia de nombre en una versión futura de la lista, el coche seleccionado deja de existir y se aplica CA21. Se descarta un campo `id` en el JSON, porque es más trabajo de mantener y propenso a errores.
- **D4 — El almacenamiento como parámetro y una clave por dato.** `storage.ts` recibe el almacenamiento en lugar de usar `localStorage` directamente. Así se prueba en Node con un objeto en memoria, sin jsdom, y se pueden simular los fallos. Se descarta jsdom en esta feature, porque sería una dependencia que la interfaz todavía no usa. Se usa una clave por dato para que uno dañado no arrastre a los demás.
