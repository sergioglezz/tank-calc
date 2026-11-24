# Plan — Feature 005: Interfaz del historial

> **Estado:** redactado el 25/11/2026 con autorización expresa del autor para seguir sin esperar la aprobación de cada fase (ver la spec). Tareas: [tasks.md](tasks.md).

Cómo se implementa la [spec](spec.md) respetando la [constitución](../00-constitution.md). Sigue la arquitectura de la [feature 004](../004-interfaz-calculadora/plan.md): estado en `App`, sin router y con la lógica en `src/lib/`.

## 1. Arquitectura
```
main.tsx ── App (estado: pantalla, coches, formulario, historial, aviso de guardado, «Repostaje guardado»)
             │
   ┌─────────┼──────────────────────┬──────────────────────────┐
CalculatorScreen               ChooseCarScreen              HistoryScreen
 └ SaveRefuelSheet (nuevo)                                   (nuevo: vacío, última vez,
                                                              este mes, gasto por día,
BottomNav (nuevo) ── en todas las pantallas                   repostajes y borrar)
```
- **Pantallas:** `Screen` pasa a ser `'calculator' | 'chooseCar' | 'history'` (D7).
- **Historial:** `App` lo carga una vez con `loadRefuels`, lo guarda en su estado y lo guarda en el dispositivo con `saveRefuels` en cada cambio. Si falla, se activa el mismo `saveFailed` de la 004 (CA22).
- **«Hoy»:** `App` recibe un parámetro opcional `getToday: () => IsoDate`, que por defecto es `todayIso`. Se llama en el momento de usarlo (al abrir la hoja, al guardar y al pintar el historial), así que un cambio de día con la app abierta se nota. Los tests pasan un día fijo (D6).
- **Aviso «Repostaje guardado»:** es un booleano en `App` (`justSaved`). Se activa al guardar y se apaga en `changeField`, `goTo` y al abrir la hoja (CA10).

## 2. Lógica (`src/lib/`)
- **`dates.ts` (se amplía):** `shiftDays(date, days): IsoDate` suma o resta días a una fecha en UTC, sin cambios de hora. Con él se calcula el `min` del campo de fecha (hoy − 365). Tiene tests: cambio de mes y de año, 29 de febrero y días negativos.
- Lo demás ya existe:
  - **para guardar y borrar:** `addRefuel`, `removeRefuel`, `validatePaidEuros`, `validatePrice` y `validateRefuelDate`;
  - **para la pantalla «Historial»:** `lastRefuel`, `dailySpending` y `monthTotal`;
  - **para mostrar las cifras:** `formatEuros`, `formatLiters`, `formatPrice` y `formatDate`.

## 3. Componentes
| Componente | Qué hace | CA |
|---|---|---|
| `BottomNav.tsx` (nuevo) | `<nav aria-label="Principal">` fija abajo, con dos botones y `aria-current="page"` en el activo. «Elige tu coche» cuenta como «Calculadora». | CA1, CA2 |
| `App.tsx` | Tercera pantalla y estado del historial. Añade `addRefuel` y `removeRefuel` con guardado, `justSaved` y `getToday`. El contenedor tiene margen inferior para que la barra no tape nada. | CA3, CA4, CA9, CA10, CA21, CA22 |
| `CalculatorScreen.tsx` | Botón «Guardar repostaje» (activo solo con `result.status === 'ok'`) y aviso «Repostaje guardado» (`role="status"`). Abre `SaveRefuelSheet` con los euros a pedir, el precio escrito y hoy. | CA5, CA9, CA10 |
| `SaveRefuelSheet.tsx` (nuevo) | `BottomSheet` con euros (`NumberField` entero), precio (`NumberField` decimal), fecha (`<input type="date">` con `min` y `max`) y el texto del coche. Errores al salir de cada campo y todos al «Guardar». | CA6–CA8, CA11, CA12 |
| `HistoryScreen.tsx` (nuevo) | Historial vacío con «Ir a la calculadora»; con repostajes: «La última vez gastaste», «Este mes» con «Gasto por día» y «Repostajes» con «Borrar» y su confirmación en `BottomSheet`. | CA13–CA20 |

Detalles:
- **Precio en la hoja (CA12):** el precio de la hoja es un estado propio de `SaveRefuelSheet` y no pasa por `changeField`, así que no se recuerda ni cambia la calculadora.
- **Foco (CA2 y CA19):** al navegar, el foco va al `h1` con `ScreenTitle`, como en la 004. Al borrar un repostaje, va al título de «Historial»; si la lista queda vacía, el título sigue ahí.
- **Clave de cada fila:** el `id` del repostaje (D5).
- **Número de repostajes:** «1 repostaje» o «N repostajes».
- **Fecha (D12):** `<input type="date">` da el valor como `AAAA-MM-DD`, el mismo formato que guarda la 003 (D6), y abre el selector del sistema en el móvil. `min` y `max` limitan el selector; si el navegador deja escribir otra cosa, la valida `validateRefuelDate`.

## 4. Tests
- **`dates.test.ts`:** `shiftDays`.
- **`App.test.tsx`** (jsdom, con almacenamiento en memoria y `getToday` fijo en `2026-11-24`):
  - **barra:** cambiar de pantalla, `aria-current`, foco al título y conservar los datos de la calculadora (CA1–CA3);
  - **botón «Guardar repostaje»:** activo, desactivado con el depósito lleno, con datos incompletos y con menos de 1 €; ausente en la bienvenida (CA5);
  - **hoja de guardado:** valores rellenados, incluido «Tengo X €» con dinero de sobra; guardar, aviso y que desaparezca; errores a la vez; cancelar; el precio de la hoja no se recuerda; aviso si falla el guardado (CA6–CA12, CA22);
  - **historial vacío** e «Ir a la calculadora» (CA13);
  - **historial con datos** cargados del almacenamiento: última vez, este mes, gasto por día, lista, número de repostajes y repostaje sin coche (CA14–CA17, CA21);
  - **borrar:** cancelar, confirmar, borrar uno de dos idénticos, borrar el último → vacío y foco (CA18–CA20).
- **Comprobación manual en el navegador a 360 px:** desplazamiento horizontal, 44 px, la barra que no tapa contenido, el selector de fecha, la hoja con teclado y el contraste de los colores nuevos (CA4, CA23).

## 5. Archivos
- **Nuevos:**
  - `src/components/{BottomNav,SaveRefuelSheet,HistoryScreen}.tsx`.
- **Modificados:**
  - `src/App.tsx` y `src/App.test.tsx`;
  - `src/components/CalculatorScreen.tsx`;
  - `src/lib/dates.ts` y su test;
  - `README.md` y `docs/decisiones.md` (D12).
- **Dependencias nuevas:** ninguna.

## 6. Decisiones técnicas
- **D12 — Campo de fecha nativo.** `<input type="date">` con `min` y `max`. Da `AAAA-MM-DD` sin conversiones (D6), abre el selector del móvil y no añade dependencias. Descartados tres campos (día, mes y año), que son más trabajo y más errores, y una librería de calendario (constitución).

## 7. Comprobación manual (T6)
En el navegador a 360 × 800, sobre `npm run dev`:
- **Sin desplazamiento horizontal** (`scrollWidth` = 360) y **ningún botón ni campo por debajo de 44 px** en todas las pantallas y hojas nuevas:
  - la calculadora con el botón y el aviso;
  - la hoja «Guardar repostaje»;
  - el historial vacío y con datos (con un coche de 40 caracteres y un repostaje de 1000 €);
  - la confirmación de borrado;
  - «Elige tu coche» con la barra.
- **Barra inferior:** el final de cada pantalla queda por encima de ella. Al guardar, el aviso «Repostaje guardado» quedaba medio tapado por la barra; se corrigió desplazando la página hasta él al aparecer.
- **Teclado:** al abrir la hoja de guardado, el foco va a «Euros pagados» y, al guardar, vuelve a «Guardar repostaje»; Enter guarda. En el historial vacío, el tabulador lleva a «Ir a la calculadora», con el foco visible.
- **Campo de fecha:** Chrome muestra el selector en formato `25/11/2026`, con el mínimo en hace 365 días.
- **Contraste:** las combinaciones nuevas ya estaban calculadas en la 004 y cumplen AA:
  - texto secundario sobre blanco y sobre gris claro;
  - rojo de «Borrar» sobre blanco;
  - blanco sobre verde oscuro en el aviso;
  - verde oscuro sobre lima en la barra.

## 8. Cierre de la feature
Repaso de los criterios contra el código y los tests (613 en verde; lint y build en verde).

| CA | Se cumple | Dónde se comprueba |
|---|---|---|
| CA1 — barra inferior en todas las pantallas | ✅ | `App.test.tsx`: `aria-current="page"`; «Elige tu coche» marca «Calculadora» |
| CA2 — foco al navegar y pantalla activa | ✅ | `App.test.tsx`: foco en el título; pulsar la activa no hace nada; desde «Elige tu coche», «Calculadora» vuelve |
| CA3 — se conservan los datos | ✅ | `App.test.tsx`: nivel y error tras ir al historial y volver |
| CA4 — la barra no tapa nada | ✅ | Comprobación manual (sección 7) |
| CA5 — estado del botón «Guardar repostaje» | ✅ | `App.test.tsx`: desactivado con datos incompletos, lleno y menos de 1 €; ausente en la bienvenida |
| CA6 — hoja rellenada | ✅ | `App.test.tsx`: 59 € en «Tengo 80 €», precio, hoy, `min` y `max` de la fecha y texto del coche |
| CA7 — datos editables y teclados | ✅ | `App.test.tsx`: euros solo cifras, precio con punto, otro día; `inputMode` numérico |
| CA8 — errores | ✅ | `App.test.tsx`: al salir del campo, 1001 €, precio vacío y fecha futura a la vez, sin guardar |
| CA9 — guardar | ✅ | `App.test.tsx`: repostaje guardado con litros y coche, aviso y fila en el historial |
| CA10 — el aviso desaparece | ✅ | `App.test.tsx`: al cambiar un dato, al cambiar de modo y al reabrir la hoja; `goTo` lo apaga al cambiar de pantalla |
| CA11 — cancelar | ✅ | `App.test.tsx`; Escape y tocar fuera, por `BottomSheet` (comprobado en la 004) |
| CA12 — no cambia la calculadora ni el precio recordado | ✅ | `App.test.tsx`: precio de la hoja 1,7 y el recordado sigue en 1,579 |
| CA13 — historial vacío | ✅ | `App.test.tsx`: textos e «Ir a la calculadora» |
| CA14 — la última vez | ✅ | `App.test.tsx`: con y sin coche |
| CA15 — este mes y gasto por día | ✅ | `App.test.tsx`: total del mes sin el repostaje de octubre; dos repostajes el mismo día sumados |
| CA16 — lista y número | ✅ | `App.test.tsx`: orden, detalles, «4 repostajes» y «1 repostaje» |
| CA17 — formatos | ✅ | `App.test.tsx`: `25 €`, `16 l`, `1,5 €/l`, `1,579 €/l` y `24/11/2026` |
| CA18 — confirmación de borrado | ✅ | `App.test.tsx`: texto de la hoja, foco en «Cancelar» y cancelar |
| CA19 — borrar y actualizar | ✅ | `App.test.tsx`: última vez, mes y número actualizados; uno de dos idénticos; foco en el título |
| CA20 — borrar el último | ✅ | `App.test.tsx`: pasa al historial vacío |
| CA21 — recordar entre visitas | ✅ | `App.test.tsx`: datos cargados del almacenamiento, dañados y no legibles |
| CA22 — aviso si no se puede guardar | ✅ | `App.test.tsx`: al guardar y al borrar con un almacenamiento que falla |
| CA23 — móvil y accesibilidad | ✅ | Comprobación manual (sección 7) y tests de etiquetas, `aria-invalid` y foco |
| CA24 — README del MVP | ✅ | `README.md`: MVP completo y Vercel pendiente |

### Revisión de la spec
- **Detalles técnicos:** la spec describe comportamiento y textos. Las únicas referencias de implementación («hoja desde abajo», «selector de fecha del dispositivo») son de interfaz, no de código.
- **Criterios comprobables:** todos se comprueban con un test o con una medida concreta (360 px, 44 px, contraste AA). CA4 y CA23 son manuales.
- **Fuera de alcance:** definido, incluido lo que el mockup muestra y no entra (gráfico de 7 días, guardar desde el historial).
- **Casos límite que no estaban en la spec:**
  - **Los euros rellenados siempre son válidos:** el resultado con cifras nunca pasa de 1000 € (200 l × 100 % × 5 €/l), y el precio de la calculadora ya es válido para tener cifras.
  - **Cambio de día con la app abierta:** «hoy» se lee cada vez que se pinta la pantalla o se abre la hoja, así que el día nuevo se nota sin recargar.
  - Ninguno de los dos cambia el comportamiento descrito.
- **Tamaño:** cabe en una feature de 7 tareas; no hace falta dividirla.
- **Lo que debe revisar el autor:** las seis «Decisiones tomadas sin consulta» de la spec.

### Cambios durante la implementación
- **CA2 se amplió:** desde «Elige tu coche», «Calculadora» vuelve a la calculadora. Si no, el botón activo de la barra no hacía nada en esa pantalla y solo quedaba «Volver».
- **`getToday` pasó de T1 a T3,** que es donde `App` lo usa por primera vez, para no dejar un parámetro sin usar.
- **El aviso «Repostaje guardado» se desplaza a la vista** al aparecer, porque la barra inferior lo tapaba (sección 7).
- **«Borrar» va debajo de los euros** en cada fila, para que la fecha y los detalles tengan sitio a 360 px.
- **Un test de la 004** busca el aviso de guardado por su texto, porque ahora hay dos regiones `role="status"` (ese aviso y «Repostaje guardado»).
- Sin dependencias nuevas.

### Pendiente
- **T1 de la 004 (autor):** importar el repositorio en Vercel y, después, el enlace en el README, Lighthouse móvil y la prueba en un Android y un iPhone reales.
- **Revisión por el autor** de las decisiones tomadas sin consulta.

## 9. Revisión del proyecto
Tras cerrar la 005 se revisaron todas las specs, el código y los documentos. El autor aprobó estos cambios:
- **Constitución, sección 2:** decía «importes en euros redondeados a 2 decimales para mostrar», pero desde la ampliación de la 001 todas las cifras son enteras. Ahora lo dice así, con el precio por litro como única excepción.
- **README:** sección «Cómo se usa», que pide la visión en «Terminado significa». El enlace a la demo se añadirá cuando exista la URL de Vercel.
- **`.gitattributes` con `eol=lf`:** en Windows, `core.autocrlf` dejaba algunos archivos con CRLF en la copia de trabajo y `prettier --check` fallaba. En el repositorio ya estaban en LF, así que su contenido no cambia.
- **Favicon** (`public/favicon.svg`): una gota lima sobre el verde oscuro del mockup. Evita el 404 en cada carga.
