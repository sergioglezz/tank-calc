# Plan — Feature 003: Historial de repostajes (lógica)

> **Estado:** aprobado el 24/11/2026. Tareas: [tasks.md](tasks.md).

Cómo se implementa la [spec](spec.md) respetando la [constitución](../00-constitution.md). Sin código todavía.

## 1. Arquitectura
Solo lógica, sin interfaz, en `src/lib/` y sin React, como en las features 001 y 002. `App.tsx` no cambia.

```
texto de euros, precio y fecha ─┐
coche seleccionado (002) ───────┼──► refuels.addRefuel ──► historial (ordenado)
hoy (dates.todayIso) ───────────┘                              │
                                     ┌─────────────────────────┼──────────────┐
                                     ▼                         ▼              ▼
                               lastRefuel             dailySpending     monthTotal
storage ── lee y guarda el historial (clave propia)
```

- **`dates.ts`** (nuevo): fechas de calendario sin hora. Saber qué día es hoy, comprobar que una fecha existe y contar días entre dos fechas.
- **`validation.ts`** (se amplía): validación de los euros pagados y de la fecha del repostaje.
- **`calculator.ts`** (se amplía): el cálculo exacto de los litros que compran unos euros, que ya existe dentro del módulo, se exporta para reutilizarlo.
- **`refuels.ts`** (nuevo): reglas del historial. Añadir, borrar, ordenar y las consultas (última vez, gasto por día y total del mes).
- **`storage.ts`** (se amplía): carga y guardado del historial en su propia clave.
- **`format.ts`** (se amplía): presentación del precio y de la fecha.

Las funciones reciben «hoy» como parámetro en vez de leer el reloj por dentro. Así son puras y los tests no dependen del día en que se ejecutan (D6).

## 2. Modelo de datos
```ts
// Fecha de calendario sin hora, en formato AAAA-MM-DD (D6)
type IsoDate = string

// Un repostaje
interface Refuel {
  id: number          // entero ≥ 1; también indica el orden en que se guardó (D5)
  date: IsoDate
  euros: number       // entero 1–1000
  price: number       // €/l, como mucho 3 decimales
  liters: number      // calculado: euros ÷ precio, truncado
  car: string | null  // nombre del coche tal como se mostraba al guardar
}

// El historial, siempre ordenado como pide CA10
type RefuelHistory = readonly Refuel[]

// Lo que escribe el usuario para guardar un repostaje
interface RefuelInput {
  eurosText: string
  priceText: string
  dateText: string    // AAAA-MM-DD, o vacío para «hoy»
}

type AddRefuelResult =
  | { ok: true; history: RefuelHistory }
  | { ok: false; errors: { euros?: string; price?: string; date?: string } }

// Una entrada del gasto por día
interface DailySpending { date: IsoDate; euros: number }
```

## 3. Módulos de `src/lib/`

### `dates.ts` (nuevo)
- **`todayIso(now = new Date())`:** el día del dispositivo en formato `AAAA-MM-DD`, con la fecha local (no UTC), para que a las 00:30 en España ya sea el día nuevo (CA4).
- **`isValidIsoDate(text)`:** `true` si el texto tiene la forma `AAAA-MM-DD` y la fecha existe. Se comprueba creando la fecha con `Date.UTC` y viendo que el día, el mes y el año no cambian (así `2026-02-30` no es válida y `2028-02-29` sí).
- **`daysBetween(from, to)`:** días naturales de `from` a `to`. Se calcula con `Date.UTC`, que no tiene cambios de hora, dividiendo la diferencia entre 86 400 000 ms.

### `validation.ts` (se amplía)
- **`validatePaidEuros(text)`:** misma regla que `validateMoney` (entero entre 1 y 1000 €) y el mismo mensaje de «no válido», pero con su propio mensaje de vacío, «Introduce el importe pagado.» (CA2 y CA6).
- **`validateRefuelDate(text, today): FieldResult<IsoDate>`:** vacío → `today` (CA4). Si no, en este orden: fecha que no existe o mal escrita → «Introduce una fecha válida.»; posterior a hoy → «La fecha no puede ser posterior a hoy.»; más de 365 días antes de hoy → «La fecha no puede ser de hace más de un año.» (CA6). Se quitan los espacios de los extremos. Las fechas con la forma `AAAA-MM-DD` se pueden comparar como texto.

### `calculator.ts` (se amplía)
**`litersForEuros(euros, price)`:** `Math.floor((euros × 1000) ÷ precio en milésimas)`, el cálculo exacto que ya hace `resultForEuros` (D1). Se exporta y `resultForEuros` pasa a usarlo, para que la calculadora y el historial calculen los litros igual (CA3). Es un cambio sin efecto en la feature 001: sus tests deben seguir en verde sin tocarlos.

### `refuels.ts` (nuevo)
- **Constante:** `MAX_REFUELS = 500`.
- **`sortRefuels(history)`:** de más reciente a más antiguo por fecha y, dentro del mismo día, por `id` de mayor a menor (CA10).
- **`addRefuel(history, input, cars, today): AddRefuelResult`:**
  - Valida los euros (`validatePaidEuros`), el precio (`validatePrice`, de la 001) y la fecha (`validateRefuelDate`) y devuelve todos los errores a la vez (CA6), como `addOwnCar` en la 002.
  - Si todo es válido, crea el repostaje con `id` = el mayor `id` del historial + 1 (o 1 si está vacío), los litros de `litersForEuros` (CA3) y el coche de `resolveSelected(cars)?.label ?? null` (CA5, con la función de la 002).
  - Si ya hay 500, quita antes el último del historial ordenado, que es el más antiguo; si hay varios ese día, el de menor `id` (CA8).
  - Devuelve el historial nuevo ya ordenado.
- **`removeRefuel(history, id)`:** quita el repostaje con ese `id`. Uno que no existe no cambia nada (CA9).
- **`lastRefuel(history)`:** el primero del historial, o `null` si está vacío (CA11).
- **`dailySpending(history): DailySpending[]`:** agrupa por fecha y suma los euros, en el orden del historial (CA12).
- **`monthTotal(history, today)`:** suma los euros de los repostajes con el mismo año y mes que `today` y fecha no posterior a `today` (CA13).

Todas las funciones son puras: devuelven un historial nuevo y no modifican el recibido.

### `storage.ts` (se amplía)
Nueva clave `tank-calc:refuels`, con el historial en JSON (CA18). Se reutilizan las funciones internas de lectura y escritura que ya existen.

- **`loadRefuels(storage | null): RefuelHistory`:** nunca lanza excepciones. Sin almacenamiento, sin la clave, con una lectura que falla o con un JSON que no es un array, el historial está vacío (CA15 y CA16). Si es un array, se descarta cada elemento que (CA16):
  - no sea un objeto;
  - no tenga un `id` entero ≥ 1 (y entero seguro, `Number.isSafeInteger`; añadido en la segunda revisión, plan de la 005, sección 10) o repita el `id` de uno anterior;
  - no tenga una `date` que pase `isValidIsoDate` (no se aplica el límite de un año ni el de hoy);
  - no tenga unos `euros` que pasen `validatePaidEuros(String(euros))` o un `price` que pase `validatePrice(String(price))`;
  - no tenga unos `liters` iguales a `litersForEuros(euros, price)`;
  - no tenga un `car` que sea `null` o un texto de 1 a 40 caracteres sin espacios en los extremos.

  Después se ordena con `sortRefuels` y se conservan los 500 primeros, que son los más recientes.
- **`saveRefuels(storage | null, history): boolean`:** devuelve `false` si no se ha podido guardar (CA17), igual que `saveCarState`.

### `format.ts` (se amplía)
- **`formatPrice(price)`** → `1,579 €/l`: `formatPriceInput` y la unidad, con el mismo espacio de no separación que el resto de cifras (CA14).
- **`formatDate(date)`** → `24/11/2026`: reordena las partes de `AAAA-MM-DD`, que ya tienen dos cifras (CA14).

Los euros y los litros usan `formatEuros` y `formatLiters`, que ya existen.

## 4. Tests
- **`dates.test.ts`:** `todayIso` con una fecha fija, incluida una hora cercana a medianoche; fechas que existen y que no (`2026-02-29`, `2026-02-30`, `2026-13-01`, `2026-1-5`, texto vacío, letras); 29 de febrero de un año bisiesto; `daysBetween` dentro del mes, entre meses, entre años y en un año bisiesto.
- **`validation.test.ts`:** `validatePaidEuros` con vacío, 1, 1000, 0, 1001 y 20,5 y sus mensajes exactos. `validateRefuelDate` con vacío (hoy), hoy, hace 365 días, hace 366 días, mañana, una fecha que no existe y espacios en los extremos.
- **`calculator.test.ts`:** `litersForEuros` con 30 € a 1,579 €/l (18 l), 28 € a 1,12 €/l (25 l exactos) y 1 € a 2 €/l (0 l). Los tests que ya existen siguen pasando sin cambios.
- **`refuels.test.ts`:** guardar uno válido con y sin coche seleccionado (de la lista y propio); fecha vacía (hoy); los tres errores a la vez; el coche se conserva tras borrarlo de los coches propios; el repostaje 500 (sin descartar) y el 501 (se descarta el más antiguo, incluso si el nuevo es más antiguo que todos); borrar uno de dos idénticos, uno que no existe y el último; orden del historial con varios el mismo día; `lastRefuel` con y sin historial; `dailySpending` con varios repostajes el mismo día y días sin repostajes; `monthTotal` el día 1, con repostajes del mes anterior, con una fecha posterior a hoy y sin repostajes (0); inmutabilidad del historial recibido. También que todas las etiquetas de la lista de modelos de la 002 tienen como mucho 40 caracteres, para que ningún coche guardado se descarte al cargar.
- **`storage.test.ts`**, con el almacenamiento falso de la 002: guardar y volver a cargar el historial (CA15); primera visita; almacenamiento `null`; `getItem` y `setItem` que fallan (CA16 y CA17); JSON dañado; cada una de las reglas de descarte de CA16; más de 500 (se quedan los más recientes); repostajes de hace más de un año y con fecha futura (se conservan); un historial dañado no afecta a los coches ni al precio, y al revés (CA18).
- **`format.test.ts`:** `formatPrice` con `1.579`, `1.5`, `5` y `0.001`; `formatDate` con `2026-11-24` y `2026-01-05`.

## 5. Archivos
**Nuevos:** `src/lib/dates.ts`, `src/lib/refuels.ts` y sus `.test.ts`.
**Modificados:** `src/lib/{validation,calculator,storage,format}.ts` y sus tests; `docs/decisiones.md` (D5 y D6); `README.md` (estado de la feature 003).
**Dependencias nuevas:** ninguna.

## 6. Decisiones técnicas
Se registran en [docs/decisiones.md](../../docs/decisiones.md):
- **D5 — Identificar los repostajes con un número correlativo.** Cada repostaje lleva un `id` entero: el mayor del historial más 1. Sirve para borrar uno aunque haya otro con los mismos datos (CA9) y para saber cuál se guardó antes el mismo día (CA8 y CA10). Si se borra el último guardado, el siguiente puede reutilizar su número, lo que no es un problema, porque el anterior ya no existe. Se descarta `crypto.randomUUID()`, porque no indica el orden de guardado y los tests tendrían que simularlo; y la posición en el array, porque cambia al borrar.
- **D6 — Fechas como texto `AAAA-MM-DD` y «hoy» como parámetro.** Un repostaje es de un día, no de un instante: guardar la hora traería problemas de zonas horarias y cambios de hora. Con ese formato las fechas se ordenan y comparan como texto, y es el mismo que da un campo de fecha del navegador. Las funciones reciben «hoy» en vez de leer el reloj, para que sean puras y los tests no dependan del día en que se ejecutan. Se descarta guardar marcas de tiempo (`Date.now()`) y añadir una librería de fechas (la constitución pide no añadir dependencias innecesarias).

## 7. Cierre de la feature
Repaso de los criterios de la [spec](spec.md) contra el código y los tests (488 en verde, 145 nuevos en esta feature; lint y build en verde).

| CA | Se cumple | Dónde se comprueba |
|---|---|---|
| CA1 — datos de un repostaje | ✅ | `refuels.test.ts`: repostaje guardado con fecha, euros, precio, litros y coche |
| CA2 — reglas de euros y precio de la 001 | ✅ | `validation.test.ts`: `validatePaidEuros` (1, 1000, 0, 1001, 20,5, 47,83); `refuels.test.ts`: precio con punto y espacios, extremos 1 €/1000 € y 0,001/5 €/l |
| CA3 — litros truncados y exactos | ✅ | `calculator.test.ts`: `litersForEuros` (18 l, 25 l exactos, 0 l); `refuels.test.ts` |
| CA4 — hoy por defecto y últimos 365 días | ✅ | `dates.test.ts`: día local cerca de medianoche; `validation.test.ts`: vacío, hoy, hace 365 y 366 días, mañana, año con 29 de febrero |
| CA5 — nombre del coche seleccionado | ✅ | `refuels.test.ts`: coche de la lista con variante, coche propio, coche que ya no existe y nombre conservado tras borrar el coche |
| CA6 — mensajes, todos a la vez | ✅ | `validation.test.ts` y `refuels.test.ts` comparan el texto exacto de cada mensaje; los tres errores a la vez y uno solo |
| CA7 — se añade al historial | ✅ | `refuels.test.ts` |
| CA8 — máximo 500, se descarta el más antiguo | ✅ | `refuels.test.ts`: el 500 sin descartar; el 501 descarta el primero guardado del día más antiguo, también si el nuevo es más antiguo que todos |
| CA9 — borrar uno | ✅ | `refuels.test.ts`: uno de dos idénticos, uno que no existe y el último |
| CA10 — orden | ✅ | `refuels.test.ts`: fecha más reciente primero y, el mismo día, el último guardado |
| CA11 — la última vez | ✅ | `refuels.test.ts`: con y sin historial |
| CA12 — gasto por día | ✅ | `refuels.test.ts`: varios el mismo día, días sin repostajes, historial vacío |
| CA13 — total del mes | ✅ | `refuels.test.ts`: el día 1, mes anterior, mismo mes de otro año, fecha posterior a hoy y 0 € |
| CA14 — presentación | ✅ | `format.test.ts`: `formatPrice` (`1,579 €/l`) y `formatDate` (`24/11/2026`, `05/01/2026`); euros y litros con las funciones de la 001 |
| CA15 — se conserva entre visitas | ✅ | `storage.test.ts`: guardar y volver a cargar; primera visita vacía |
| CA16 — datos dañados | ✅ | `storage.test.ts`: sin almacenamiento, lectura que falla, JSON dañado, cada regla de descarte, `id` repetido, más de 500, fechas antiguas y futuras que se conservan |
| CA17 — aviso si no se puede guardar | ✅ | `storage.test.ts`: `false` sin almacenamiento y cuando `setItem` falla |
| CA18 — independiente de la 002 | ✅ | `storage.test.ts`: historial dañado con coches y precio bien, y al revés; guardar el historial no toca lo demás |

Los casos límite de la spec están cubiertos por los mismos tests.

### Cambios durante la implementación
- **`id` repetidos al cargar:** solo cuentan los de los repostajes ya aceptados, para que uno no válido no impida cargar otro válido con el mismo número. Se añade a D5.
- **Al cargar solo se conservan los campos conocidos** del repostaje; cualquier otro se ignora.
- **`isValidIsoDate` es estricta** (sin espacios); los espacios de los extremos los quita `validateRefuelDate`.
- **`dailySpending`** recorre el historial en su orden y junta los días seguidos, porque el historial siempre está ordenado.
- La spec no ha cambiado.

### Pendiente para otras features
- **Interfaz (004+):** cómo se elige la fecha, si los euros y el precio se rellenan con el resultado de la calculadora, cuándo se llama a `todayIso`, cómo se muestra el historial y cómo se avisa de que no se ha podido guardar.
