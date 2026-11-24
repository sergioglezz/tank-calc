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
- Devuelve también cuántos decimales se escribieron, para validar el máximo de decimales sin depender de la coma flotante.

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
- **Lint y formato:** el ESLint (flat config) de la plantilla, más Prettier y `eslint-config-prettier`.
- **Scripts de npm:** `dev`, `build`, `preview`, `lint`, `test` (`vitest run`), `test:watch` y `format`.
- **CI** (`.github/workflows/ci.yml`): en cada push y PR, con Node 24 LTS, ejecuta `npm ci`, `lint`, `test` y `build`.

**Dependencias nuevas:** react, react-dom, vite, @vitejs/plugin-react, typescript, eslint (y los plugins de la plantilla), vitest, prettier y eslint-config-prettier. Todas están en la constitución salvo `eslint-config-prettier`, que es la integración estándar para que ESLint y Prettier no choquen.

**Se dejan para la primera spec de interfaz:** Tailwind CSS, Testing Library, jsdom y el despliegue en Vercel. Instalarlos ahora sería añadir dependencias sin uso. El test de componente que la constitución pide por funcionalidad también irá ahí.

## 5. Tests
- **`parseDecimal.test.ts`:** coma, punto, espacios, vacío, letras, `-3`, `+3`, `1e3`, `1.000,5`, `1,2,3` y número de decimales.
- **`validation.test.ts`:** cada extremo de CA4 y los casos de la sección de casos límite, y el texto exacto de cada mensaje de CA5.
- **`fillUp.test.ts`:** CA7; 0 % (CA11); 100 % (CA10); menos de 1 €; importe exacto entero (CA9); un caso de 47,999 € → 47 (CA8); y la combinación con los valores máximos (200 l, 0 %, 5 €/l), que debe dar un número finito (CA12).
- **`format.test.ts`:** los tres formatos de CA13.

## 6. Archivos
**Nuevos:** `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `src/main.tsx`, `src/App.tsx` (marcador), `src/lib/{parseDecimal,validation,fillUp,format}.ts` y sus `.test.ts`, `.github/workflows/ci.yml`, `docs/decisiones.md`.
**Modificados:** `README.md` (qué hay hecho y comandos) y `AGENTS.md` (tabla de comandos).
**Eliminados:** los archivos de ejemplo de la plantilla (`App.css`, `index.css`, logos y assets).

## 7. Decisiones técnicas
Registradas en [docs/decisiones.md](../../docs/decisiones.md):
- D1: Cálculo del dinero en enteros para un truncado exacto.
