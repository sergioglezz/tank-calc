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
