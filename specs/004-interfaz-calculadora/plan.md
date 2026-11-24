# Plan — Feature 004: Interfaz de la calculadora y los coches

> **Estado:** aprobado el 25/11/2026. Tareas: [tasks.md](tasks.md).

Cómo se implementa la [spec](spec.md) respetando la [constitución](../00-constitution.md). Sin código todavía.

## 1. Arquitectura
Primera interfaz en React. La lógica de las features 001–003 se usa tal cual. Lo poco que añade esta feature y no depende de React (evaluar el formulario, los textos del resultado y el filtro de cifras) va también en `src/lib/`, con tests unitarios, como pide la constitución.

```
main.tsx ── getBrowserStorage() ──► App (estado: pantalla, coches, precio, aviso de guardado)
                                     │
               ┌─────────────────────┴─────────────────────┐
     CalculatorScreen / Welcome                      ChooseCarScreen
   (campos, modo, ResultCard)                (búsqueda, filas, borrar, AddCarSheet)
               │                                           │
   calculatorForm ─► validation + calculator      carSearch, ownCars
   resultText ─► format                           storage (saveCarState)
   storage (savePrice)
```

- **Sin router** (constitución, sección 3): `App` guarda en su estado qué pantalla se ve (`'calculator' | 'chooseCar'`). Ver D7.
- **Estado en `App`**, sin librería de estado: `CarState` (coches propios y seleccionado), el texto del precio, la pantalla y si el último guardado falló. Los datos del formulario (nivel, modo, objetivo, dinero, campos tocados) viven en `CalculatorScreen`, pero `App` los conserva mientras se elige coche (ver 3.3).
- **Almacenamiento inyectado:** `main.tsx` hace `<App storage={getBrowserStorage()} />`. Los tests pasan un almacenamiento falso en memoria, también uno que falla (D4 y CA29).

## 2. Modelo de datos (interfaz)
```ts
type Screen = 'calculator' | 'chooseCar'
type Mode = 'fullTank' | 'toLevel' | 'withMoney'

// Lo que escribe el usuario, siempre como texto
interface CalculatorFields { level: string; price: string; target: string; money: string }
type TouchedFields = Partial<Record<keyof CalculatorFields, true>>

// src/lib/calculatorForm.ts
interface CalculatorEvaluation {
  level: FieldResult; price: FieldResult; target: FieldResult; money: FieldResult
  result: CalculationResult | null   // null → «FALTA UN PASO»
}

// src/lib/resultText.ts
interface ResultText { label: string; headline: string; detail: string }
```

## 3. Módulos

### 3.1 `src/lib/` (nuevos o ampliados, sin React)
- **`calculatorForm.ts` (nuevo):** `evaluateCalculator(capacity, mode, fields): CalculatorEvaluation`.
  - Valida los cuatro campos con `validation.ts`. El objetivo se valida con `validateTargetLevel(target, nivel válido o null)` (CA13).
  - Si el nivel es válido y vale 100, el resultado es `{ status: 'full' }`, sin mirar los demás campos (CA8).
  - Si no, calcula con `calculateFullTank`, `calculateToLevel` o `calculateWithMoney` cuando el nivel, el precio y el campo del modo son válidos; si alguno no lo es, devuelve `null`.
  - Siempre devuelve el resultado de los cuatro campos; qué errores se ven lo decide la interfaz (CA10 y CA14).
- **`resultText.ts` (nuevo):** `describeResult(mode, result, fields): ResultText`, con los textos exactos de la tabla de CA7. Usa `formatEuros`, `formatLiters` y `formatPercent`. Va en `lib` para probar la tabla entera sin DOM.
- **`text.ts` (se amplía):** `digitsOnly(text)` quita todo lo que no sea una cifra del 0 al 9 (CA16).
- **`ownCars.ts` (se amplía):**
  - se exporta el mensaje del límite de 10 coches, para mostrarlo en la hoja sin rellenar el formulario (CA27);
  - se añade `isSameCar(a, b)`, que compara dos `CarRef`, para marcar el coche seleccionado en la lista (CA19).

### 3.2 Componentes (`src/components/`)
| Componente | Qué hace | CA |
|---|---|---|
| `App.tsx` (en `src/`) | Cabecera («tank-calc» y la etiqueta «Reposta con cabeza»), aviso de guardado, pantalla activa. Carga con `loadSavedData` una sola vez y guarda con `saveCarState` y `savePrice`. | CA1, CA17, CA29 |
| `Welcome.tsx` | Bienvenida de la captura 07, con el botón «Elegir coche». | CA1 |
| `CalculatorScreen.tsx` | Tarjeta «Tu coche», campos, botones rápidos, selector de modo y tarjeta de resultado. Llama a `evaluateCalculator` en cada render. | CA2–CA6, CA8, CA10–CA14 |
| `NumberField.tsx` | Campo con etiqueta visible, unidad a la derecha y error debajo. Opción `integer`: teclado sin separador y `digitsOnly` en cada cambio. Marca el campo como tocado al salir. | CA11, CA12, CA15, CA16, CA32 |
| `ModeSelector.tsx` | Tres botones con `aria-pressed`. | CA3, CA34 |
| `ResultCard.tsx` | Muestra el `ResultText` en una región `aria-live="polite"`. | CA7, CA9 |
| `ChooseCarScreen.tsx` | «Volver», buscador, «Mis coches», «Explorar modelos», sin resultados, «+ Añadir mi coche», nota final, botón «Borrar» y su confirmación. | CA18–CA23 |
| `AddCarSheet.tsx` | Formulario de nombre y capacidad, o el mensaje del límite. | CA24–CA28 |
| `BottomSheet.tsx` | Hoja inferior sobre `<dialog>` nativo, que usan `AddCarSheet` y la confirmación de borrado (dos usos reales). Escape, tocar fuera y devolver el foco. | CA28, CA33 |

### 3.3 Detalles de comportamiento
- **Errores (CA10–CA14):** cada campo tiene un indicador de «tocado» que se activa al salir de él (`onBlur`) o, en el nivel, al pulsar un botón rápido. Un campo muestra el error de `evaluateCalculator` solo si está tocado y visible en el modo actual. Como la evaluación se hace en cada render, el error desaparece o cambia en cada tecla.
- **Conservar el formulario (CA5 y casos límite):** `App` guarda `fields`, `mode` y `touched` y se los pasa a `CalculatorScreen`. Así no se pierden al ir a «Elige tu coche» y volver.
- **Precio (CA17):** en cada cambio del precio, si `validatePrice` es válido, `App` llama a `savePrice` y actualiza el aviso según el resultado. Un precio no válido no toca el aviso (`savePrice` devuelve `true` sin guardar, y eso no cuenta como guardado correcto).
- **Coches:** seleccionar, añadir (con `addOwnCar` y después `selectCar` con el nombre ya recortado, CA26) y borrar (`removeOwnCar`) pasan por una función de `App` que actualiza el estado y llama a `saveCarState`.
- **Aviso de guardado (CA29):** `saveFailed` pasa a `true` cuando un guardado devuelve `false` y a `false` cuando uno funciona. El aviso es un `role="status"` encima de la pantalla.
- **Foco (CA33):** `<dialog>` con `showModal()` lleva el foco dentro, cierra con Escape y devuelve el foco al botón que lo abrió. Al cambiar de pantalla (elegir o añadir un coche, «Volver»), el foco va al título `h1` de la nueva pantalla (`tabIndex={-1}`). Al borrar un coche, cuya fila desaparece, el foco va al título de «Elige tu coche».
- **Tocar fuera de la hoja (CA28):** un clic cuyo destino es el propio `<dialog>` (el fondo) la cierra.
- **Campos (CA15 y CA16):** todos son `type="text"`, nunca `type="number"`, que acepta `e` y `-` y cambia el valor a su manera. Los enteros llevan `inputMode="numeric"` y `pattern="[0-9]*"`, y el precio `inputMode="decimal"`. Todos tienen `autoComplete="off"` y letra de 16 px como mínimo, para que iOS no haga zoom.
- **Búsqueda (CA21 y CA22):** `searchCars(query, ownCars)` en cada tecla. El resultado se separa en propios y de la lista por `ref.source`. Unos 110 elementos se pintan sin problema y no hace falta virtualizar.

### 3.4 Estilo (Tailwind CSS)
- Tailwind v4 con su plugin de Vite (`@tailwindcss/vite`) y un único `src/index.css` con `@import "tailwindcss"` y los colores del mockup como variables de `@theme`: fondo claro, verde oscuro de la tarjeta de resultado, verde lima de las cifras y del botón principal, gris de los botones secundarios y rojo de error. Al implementar se comprueba que cada pareja de colores de texto cumple el contraste 4,5:1 (CA35) y se ajusta el tono si no llega.
- Tipografía: la fuente del sistema (`system-ui`), sin descargar fuentes (ver D8).
- Diseño: una columna `max-w-md` centrada, botones y filas con un alto mínimo de 44 px (CA30 y CA34), y `break-words` / `min-w-0` en los nombres de coche (CA30).

## 4. Publicación (Vercel)
- **Paso manual del autor (una vez):** en vercel.com, importar el repositorio de GitHub con su cuenta. Vercel detecta Vite y usa `npm run build` y `dist/` sin configuración. La rama de producción es `main`, y cada PR recibe además una URL de vista previa.
- No hace falta `vercel.json` ni variables de entorno. La CI de GitHub Actions no cambia.
- Se hace al principio (T1), para que la URL exista desde el primer día y cada merge a `main` se publique solo (CA36 y CA37).

## 5. Tests
- **Unitarios (Node):**
  - `calculatorForm.test.ts`: CA8 con objetivo y dinero vacíos o no válidos, CA13 (objetivo con nivel no válido), `null` con datos incompletos y los tres modos con los ejemplos de la spec;
  - `resultText.test.ts`: las siete filas de CA7 con sus textos exactos;
  - `text.test.ts`: `digitsOnly`;
  - `ownCars.test.ts`: `isSameCar`.
- **De componentes (jsdom, Testing Library y user-event):** `App.test.tsx`, con el almacenamiento falso, cubre el flujo principal y los casos clave:
  - bienvenida (CA1); añadir un coche de 50 l y que quede seleccionado (CA24–CA26);
  - nivel y precio → «Pide 59 €» sin botón (CA6 y CA7); cambiar de modo conservando los datos (CA5);
  - error al salir del campo y que desaparezca al corregirlo (CA10–CA12); «1.000» → «1000» (CA16);
  - precio recordado al volver a montar la app (CA4 y CA17); aviso con un almacenamiento que falla (CA29);
  - búsqueda sin resultados (CA22); borrar el coche seleccionado → bienvenida (CA23); límite de 10 (CA27).

  El entorno jsdom se activa solo en los archivos `.test.tsx`, con el comentario `// @vitest-environment jsdom`. Los tests de `lib` siguen en Node.
- **Configuración:** `vite.config.ts` gana `test.setupFiles` con un `src/test/setup.ts` que limpia el DOM tras cada test. Si jsdom no implementa `showModal` y `close` de `<dialog>`, el mismo archivo añade una versión mínima que solo pone y quita el atributo `open`.
- **Comprobación manual** (se anota en el cierre):
  - 360 px sin desplazamiento horizontal (CA30), con las herramientas del navegador;
  - teclados en un Android y un iPhone reales (CA15, CA36);
  - navegación solo con teclado (CA33);
  - Lighthouse móvil ≥ 90 en la URL pública (CA35);
  - un merge a `main` aparece en la URL en menos de 10 minutos (CA37).

## 6. Archivos
**Nuevos:**
- `src/index.css`;
- `src/components/{Welcome,CalculatorScreen,NumberField,ModeSelector,ResultCard,ChooseCarScreen,AddCarSheet,BottomSheet}.tsx`;
- `src/lib/{calculatorForm,resultText}.ts` y sus tests;
- `src/App.test.tsx`;
- `src/test/setup.ts`.

**Modificados:**
- `src/App.tsx` (sustituye al marcador) y `src/main.tsx` (CSS y almacenamiento);
- `src/lib/text.ts` y `src/lib/ownCars.ts`, y sus tests;
- `vite.config.ts` (plugin de Tailwind y configuración de tests);
- `package.json` y `package-lock.json`;
- `README.md` (estado, enlace a la demo, stack) y `docs/decisiones.md`.

**Dependencias nuevas** (todas están en la constitución):
| Paquete | Tipo | Por qué |
|---|---|---|
| `tailwindcss`, `@tailwindcss/vite` | dev | Estilos mobile-first; el plugin de Vite es la instalación oficial de Tailwind v4 y no necesita PostCSS. |
| `@testing-library/react`, `@testing-library/dom` | dev | Tests de componentes desde el punto de vista del usuario; `dom` es una dependencia *peer* obligatoria de la primera. |
| `@testing-library/user-event` | dev | Simula teclear, pegar, tabular y salir de un campo como un usuario real, que es justo lo que piden CA10–CA16. |
| `jsdom` | dev | DOM para los tests de componentes. |

No se añade `@testing-library/jest-dom`: basta con las consultas por rol y los atributos del DOM, y es una dependencia menos.

## 7. Decisiones técnicas
Se añadirán a [docs/decisiones.md](../../docs/decisiones.md):
- **D7 — Navegación con estado, sin router.** Solo hay dos pantallas y ninguna necesita su propia URL. Un `useState` en `App` basta y cumple la constitución. Descartados React Router o la History API: el botón «Atrás» del móvil queda fuera de alcance (spec).
- **D8 — Tailwind v4 con tokens del mockup y fuente del sistema.** Los colores del mockup van como variables de `@theme`, para usar clases como `bg-ink` o `text-lime`. La fuente del sistema evita descargar fuentes: no hace falta una dependencia ni una petición a Google Fonts, y el texto aparece al instante. Descartados Inter con `@fontsource`, que sería una dependencia más para un cambio pequeño, y Google Fonts, que hace una petición a un tercero.
- **D9 — `<dialog>` nativo para las hojas.** Da gratis el foco dentro, Escape, el fondo y devolver el foco (CA28 y CA33). Descartados una hoja hecha a mano, que obliga a programar todo eso, y una librería de componentes, que la constitución no permite.
- **D10 — Campos de texto con `inputMode` y filtro de cifras.** `type="number"` admite `e`, `-` y decimales, y su valor no coincide con lo escrito. Con `type="text"` y `inputMode`, el teclado es el correcto y la lógica de la 001 recibe el texto tal cual. El filtro de cifras resuelve «1.000» sin tocar la 001. Descartado cambiar la validación de la 001.
- **D11 — Tests de componentes con jsdom por archivo.** Solo los `.test.tsx` usan jsdom, de modo que los tests de `lib` siguen en Node, más rápidos y sin un `localStorage` real que interfiera con D4.

## 8. Riesgos
- **`<dialog>` en jsdom:** si no está implementado, se añade la versión mínima de la sección 5. El comportamiento real del foco y de Escape se comprueba a mano en el navegador.
- **Lighthouse por debajo de 90:** casi siempre se debe al contraste o a etiquetas. Se revisa en la tarea de cierre antes de dar CA35 por cumplido.
- **Vercel depende de la cuenta del autor:** si no se conecta en T1, las tareas siguientes pueden avanzar y CA36–CA38 se comprueban al final.

## 9. Cierre de la feature
Repaso de los criterios de la spec contra el código, los tests (577 en verde; lint y build en verde) y las comprobaciones manuales hechas en el navegador a 360 px. Lo que depende de la cuenta de Vercel del autor y de móviles reales queda **pendiente** y se marca con ⏳.

| CA | Se cumple | Dónde se comprueba |
|---|---|---|
| CA1 — bienvenida sin coche | ✅ | `App.test.tsx`: primera visita y coche guardado que ya no existe |
| CA2 — tarjeta «Tu coche» | ✅ | `App.test.tsx`: nombre y capacidad; «Cambiar» abre «Elige tu coche» |
| CA3 — campos, botones rápidos y modos | ✅ | `App.test.tsx`: botón rápido, campos de cada modo |
| CA4 — modo «A tope» y precio recordado al abrir | ✅ | `App.test.tsx`: precio `1.579` recuperado como `1,579`; vacío en la primera visita |
| CA5 — se conservan los valores | ✅ | `App.test.tsx`: al cambiar de modo y al ir a «Elige tu coche» y volver |
| CA6 — resultado al momento | ✅ | `App.test.tsx`: «Pide 59 €» sin botón de calcular |
| CA7 — textos de la tarjeta | ✅ | `resultText.test.ts`: las siete filas con su texto exacto |
| CA8 — lleno al 100 % en los tres modos | ✅ | `calculatorForm.test.ts` y `App.test.tsx` |
| CA9 — se anuncia el resultado | ✅ | `App.test.tsx`: región `aria-live="polite"` |
| CA10–CA12 — errores al salir y al corregir | ✅ | `App.test.tsx`: sin error antes de salir, al salir, cambio de motivo y desaparición |
| CA13 — objetivo y nivel actual | ✅ | `calculatorForm.test.ts` y `App.test.tsx`: se recomprueba al cambiar el nivel y con nivel no válido solo su regla |
| CA14 — solo campos visibles | ✅ | `App.test.tsx`: el error del dinero se oculta en «A tope» y vuelve |
| CA15 — teclado numérico | ✅ / ⏳ | `App.test.tsx`: `inputMode` de cada campo. ⏳ Probar en un Android y un iPhone reales |
| CA16 — solo cifras | ✅ | `text.test.ts` y `App.test.tsx`: pegar `1.000` deja `1000` |
| CA17 — recordar el precio | ✅ | `App.test.tsx`: cada precio válido se recuerda y uno no válido no lo sustituye |
| CA18–CA19 — «Elige tu coche» | ✅ | `App.test.tsx`: secciones, nota final, «Seleccionado» y «Añadido por ti» |
| CA20 — elegir un coche | ✅ | `App.test.tsx`: se selecciona, se recuerda y la calculadora usa su capacidad |
| CA21–CA22 — búsqueda | ✅ | `App.test.tsx`: «corolla toy», secciones vacías ocultas, sin resultados y «Añadir mi coche» visible |
| CA23 — borrar un coche propio | ✅ | `App.test.tsx`: cancelar, confirmar, borrar el seleccionado y sin «Borrar» en la lista |
| CA24–CA28 — «Añadir mi coche» | ✅ | `App.test.tsx`: añadir y seleccionar, errores a la vez, al salir y repetido, límite de 10, cancelar. Escape y tocar fuera, comprobados en el navegador |
| CA29 — aviso de guardado | ✅ | `App.test.tsx`: con un almacenamiento que falla aparece el aviso y la app sigue calculando |
| CA30 — 360 px sin desplazamiento horizontal | ✅ | Navegador a 360 × 800: calculadora en los tres modos, «Pide 1000 €» (200 l a 5 €/l), «Elige tu coche» con un nombre de 40 caracteres y las dos hojas: `scrollWidth` = 360 |
| CA31 — español | ✅ | `index.html` con `lang="es"`; todos los textos en español |
| CA32 — etiquetas y errores accesibles | ✅ | `App.test.tsx`: `aria-invalid` y `aria-describedby` con el mensaje |
| CA33 — teclado y foco | ✅ | `App.test.tsx`: foco al título al cambiar de pantalla y tras borrar. En el navegador: foco dentro de la hoja, en «Cancelar» al confirmar un borrado, Escape y vuelta al botón que la abrió |
| CA34 — 44 × 44 px y modo activo | ✅ | Navegador: ningún botón ni campo visible mide menos de 44 px; `aria-pressed` en el selector |
| CA35 — contraste AA y Lighthouse ≥ 90 | ✅ / ⏳ | Contraste calculado para cada pareja de colores: el mínimo es 4,97:1 (gris secundario sobre borde). ⏳ Lighthouse móvil en la URL pública |
| CA36 — URL pública en Android e iOS | ⏳ | Depende de T1 (importar el repositorio en Vercel) |
| CA37 — publicación automática desde `main` | ⏳ | Se comprueba con el merge de esta rama |
| CA38 — enlace en el README | ⏳ | Se añade cuando exista la URL |

### Cambios durante la implementación
- **`ScreenTitle.tsx`:** componente pequeño, no previsto en el plan, para el `h1` de cada pantalla que recibe el foco al navegar (CA33).
- **`describeResult(mode, evaluation)`:** recibe el resultado de `evaluateCalculator` en lugar de los textos de los campos, porque ya trae el objetivo y el dinero validados.
- **Etiquetas de la tarjeta en minúscula inicial:** el texto se guarda como «Para llenar el depósito» y se muestra en mayúsculas con CSS, para que un lector de pantalla lo lea como palabras.
- **Foco en «Cancelar» al confirmar un borrado:** `BottomSheet` enfoca el control marcado con `data-autofocus` para que la hoja empiece en la opción segura.
- **Etiqueta visible del buscador** («Busca marca o modelo») en lugar de solo un texto de ejemplo, por CA32.
- **«+ Añadir mi coche»** se añadió en T13, junto con su hoja, en vez de en T11, para no dejar un botón sin función.
- **`src/test/memoryStore.ts`:** almacenamiento falso compartido por los tests de componentes, con una variante que falla al guardar.
- **jsdom no implementa `<dialog>` modal:** `src/test/setup.ts` añade la versión mínima prevista; el foco y Escape se comprobaron en el navegador.
- **Formato:** `npx prettier --check src` avisa de 12 archivos antiguos de `src/lib` por tener finales de línea CRLF en la copia de trabajo de Windows (`core.autocrlf`). En el repositorio están bien y no se han tocado.
- La spec no ha cambiado.

### Pendiente
- **T1 (autor):** importar el repositorio en Vercel. Después: añadir el enlace al README (CA38), Lighthouse móvil en la URL (CA35), probar los teclados y la app en un Android y un iPhone reales (CA15, CA36) y comprobar que el merge a `main` se publica solo (CA37).
- **Feature 005:** historial (guardar repostaje, pantalla «Historial», borrar repostajes y navegación inferior).
