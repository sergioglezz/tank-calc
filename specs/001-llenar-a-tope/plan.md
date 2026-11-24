# Plan — Feature 001: Llenar a tope (cálculo)

Cómo se implementa la [spec](spec.md) respetando la [constitución](../00-constitution.md). Sin código todavía.

## 1. Arquitectura
Solo lógica, sin interfaz. Todo en `src/lib/`, en TypeScript puro y sin React, como pide la constitución. Es una cadena de funciones puras que la interfaz futura usará tal cual:

```
texto ──► parseDecimal ──► validation ──► fillUp ──► format ──► cadenas para mostrar
```

El proyecto Vite + React se crea ya, para tener lint, tests, build y CI desde el principio, pero `App.tsx` es un marcador mínimo (un título «tank-calc») que se sustituirá con la primera spec de interfaz.

## 2. Modelo de datos
```ts
// Resultado de validar un dato
type FieldResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'empty' | 'invalid'; message: string };

// Entrada del cálculo (ya validada)
interface FullTankInput { capacity: number; level: number; price: number } // l, %, €/l

// Salida del cálculo
type FullTankResult =
  | { status: 'full' }                                    // nivel 100 % (CA10)
  | { status: 'ok'; liters: number; exactCost: number; wholeEuros: number };
```
`wholeEuros === 0` con `status: 'ok'` es el caso «falta menos de 1 €»; el aviso lo decidirá la interfaz.

## 3. Módulos de `src/lib/`

### `parseDecimal.ts`
`parseDecimal(text): { value: number; decimals: number } | null`
- Quita los espacios del principio y del final (CA2).
- Acepta solo el patrón `^\d+([.,]\d+)?$`: dígitos y, como mucho, un separador. Cualquier otra cosa devuelve `null` (CA1 y CA3).
- Devuelve también cuántos decimales significativos se escribieron, sin contar los ceros a la derecha (`1,50` → 1), para validar el máximo de decimales sin depender de la coma flotante.

### `validation.ts`
`validateCapacity`, `validateLevel` y `validatePrice` (texto → `FieldResult`), con las reglas de CA4 y los mensajes exactos de la tabla de CA5. `reason: 'empty'` si el texto, sin espacios, está vacío; `'invalid'` en cualquier otro error.

### `fillUp.ts`
`calculateFullTank(input): FullTankResult`, calculado **en enteros** para que el truncado sea exacto (CA8 y CA9; ver D1):
- `capDl = round(capacity × 10)`: decilitros;
- `priceMil = round(price × 1000)`: milésimas de euro;
- `micro = capDl × (100 − level) × priceMil`: millonésimas de euro. El máximo es 2000 × 100 × 5000 = 10⁹, muy por debajo del límite de enteros exactos de JavaScript (CA12);
- `wholeEuros = floor(micro / 10⁶)`;
- `exactCost = round(micro / 10⁴) / 100`;
- `liters = capDl × (100 − level) / 1000`;
- `level === 100` → `{ status: 'full' }`.

Comprobación con CA7: 500 × 75 × 1579 = 59 212 500 → 59 €; exacto 59,21 €; 37,5 l. ✔

### `format.ts`
Con `Intl.NumberFormat('es-ES', …)` (CA13):
- `formatEuros(n)` → `59,21 €`;
- `formatWholeEuros(n)` → `59 €`;
- `formatLiters(n)` → `37,50 l`.

## 4. Setup y CI
- **Proyecto:** plantilla oficial `npm create vite@latest` con `react-ts` en la raíz del repo y TypeScript `strict`. Se quitan los archivos de ejemplo; `index.html` lleva `lang="es"` y el título «tank-calc».
- **Tests:** Vitest con el entorno `node` por defecto, porque aún no hay componentes.
- **Lint y formato:** oxlint, con la configuración `.oxlintrc.json` que trae la plantilla, y Prettier para el formato (ver D2). oxlint no trae reglas de estilo activadas, así que no choca con Prettier y no hace falta ninguna integración entre los dos.
- **Scripts de npm:** `dev`, `build`, `preview`, `lint`, `test` (`vitest run`), `test:watch` y `format`.
- **CI** (`.github/workflows/ci.yml`): en cada push y PR, con Node 24 LTS, ejecuta `npm ci`, `lint`, `test` y `build`.

**Dependencias nuevas:** react, react-dom, vite, @vitejs/plugin-react, typescript y los tipos (`@types/*`) que trae la plantilla, oxlint, vitest y prettier. Todas están en la constitución.

**Se dejan para la primera spec de interfaz:** Tailwind CSS, Testing Library, jsdom y el despliegue en Vercel. Instalarlos ahora sería añadir dependencias sin uso. El test de componente que la constitución pide por funcionalidad también irá ahí.

## 5. Tests
- **`parseDecimal.test.ts`:** coma, punto, espacios, vacío, letras, `-3`, `+3`, `1e3`, `1.000,5`, `1,2,3` y número de decimales.
- **`validation.test.ts`:** cada extremo de CA4 y los casos de la sección de casos límite, y el texto exacto de cada mensaje de CA5.
- **`fillUp.test.ts`:** CA7; 0 % (CA11); 100 % (CA10); menos de 1 €; importe exacto entero en el que la coma flotante fallaría (11,2 l al 25 % con 2,5 €/l → 21 €, CA9); 47,995794 € → 47 (CA8); y las combinaciones con los valores máximos y mínimos, que deben dar números finitos (CA12).
- **`format.test.ts`:** los tres formatos de CA13.

## 6. Archivos
**Nuevos:** `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json`, `.prettierrc`, `.prettierignore`, `.gitignore`, `src/main.tsx`, `src/App.tsx` (marcador), `src/lib/{parseDecimal,validation,fillUp,format}.ts` y sus `.test.ts`, `.github/workflows/ci.yml`, `docs/decisiones.md`.
**Modificados:** `README.md` (qué hay hecho y comandos) y `AGENTS.md` (tabla de comandos).
**Eliminados:** los archivos de ejemplo de la plantilla (`App.css`, `index.css`, logos y assets).

## 7. Decisiones técnicas
Registradas en [docs/decisiones.md](../../docs/decisiones.md):
- D1: Cálculo del dinero en enteros para un truncado exacto.
- D2: oxlint en lugar de ESLint.

## 9. Cierre de la feature
Repaso de los criterios de aceptación contra el código y los tests (74 en verde, lint, build y CI en verde).

| CA | Se cumple | Dónde se comprueba |
|---|---|---|
| CA1 — coma y punto | ✅ | `parseDecimal.test.ts` (coma y punto); `validation.test.ts` (`1,579` y `1.579`) |
| CA2 — espacios en los extremos | ✅ | `parseDecimal.test.ts`; `validation.test.ts` (` 60.0 `) |
| CA3 — formatos no admitidos | ✅ | `parseDecimal.test.ts`: vacío, letras, `-3`, `+3`, `1e3`, `1.000,5`, `1,2,3`, `,5`, `5,`, espacios internos |
| CA4 — rangos y decimales | ✅ | `validation.test.ts`: extremos aceptados y rechazados de los tres datos |
| CA5 — mensajes vacío / no válido | ✅ | `validation.test.ts` compara el texto exacto de los seis mensajes y el `reason` |
| CA6 — fórmulas | ✅ | `fillUp.test.ts`, mediante los casos de CA7–CA11 |
| CA7 — ejemplo de referencia | ✅ | `fillUp.test.ts`: 37,5 l; 59,21 €; 59 € |
| CA8 — nunca redondea hacia arriba | ✅ | `fillUp.test.ts` (47,995794 € → 47 €); `format.test.ts` (47,99 → `47 €`) |
| CA9 — importe entero exacto | ✅ | `fillUp.test.ts`: 11,2 l, 25 %, 2,5 €/l → 21 € (en coma flotante saldría 20 €) |
| CA10 — depósito lleno | ✅ | `fillUp.test.ts`: `status: 'full'` |
| CA11 — depósito vacío | ✅ | `fillUp.test.ts`: 40 l al 0 % → 40 l |
| CA12 — nunca `NaN` ni `Infinity` | ✅ | `fillUp.test.ts` en los extremos máximo y mínimo; con datos válidos todo es aritmética entera de 10⁹ como máximo, sin divisiones entre datos |
| CA13 — formato español | ✅ | `format.test.ts`: `59,21 €`, `59 €`, `37,50 l` |

### Cambios durante la implementación
- **Linter:** oxlint en lugar de ESLint, porque la plantilla actual de Vite ya lo trae. Se actualizó la constitución (D2).
- **Decimales significativos:** los ceros a la derecha no cuentan como decimales (`50,0` % es válido). `,5` y `5,` no se admiten. Se añadió a los casos límite de la spec.
- **Ejemplo de CA8:** 47,999 € no se puede obtener con datos válidos, así que se usa 47,995794 € (9,7 l, 1 %, 4,998 €/l). Se actualizó la spec.
- **`.prettierignore`:** excluye los `.md` para que Prettier no reformatee las specs.
- **`"strict": true` explícito en los `tsconfig`:** TypeScript 7 ya lo activa por defecto, pero así se ve que se cumple la constitución.
- **Vitest sin configuración:** su entorno por defecto ya es `node`, así que `vite.config.ts` queda como en la plantilla.
- **Formato:** `Intl` separa el número de la unidad con un espacio que no se parte (U+00A0), y `formatLiters` hace lo mismo. `formatWholeEuros` trunca su entrada por seguridad.
- **Plantilla:** tampoco se copiaron el favicon ni la carpeta `public/`, que solo tenían logos de ejemplo.

### Pendiente para otras features
- Interfaz, publicación en Vercel y el test de componente que pide la constitución: specs de interfaz basadas en Figma (ver la spec, «Para tener en cuenta en las specs de interfaz»).
- Modos «Llenar hasta X %» y «Tengo X €».
