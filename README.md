# tank-calc

Calculadora de repostaje para el móvil: te dice cuánto pedir en caja antes de llenar el depósito, sin pasarte.

En muchas gasolineras hay que pagar **antes** de repostar. tank-calc calcula, a partir de la capacidad del depósito, el nivel actual y el precio por litro, cuántos litros faltan, cuánto cuesta llenarlo y qué importe en euros enteros puedes pedir sin pasarte.

## Estado y hoja de ruta
| Feature | Qué incluye | Estado |
|---|---|---|
| [001 — Calculadora (lógica)](specs/001-calculadora/spec.md) | Validación con mensajes en español y cálculo en euros, litros y porcentajes enteros de los tres modos: «A tope», «Hasta X %» y «Tengo X €» | 🔄 «A tope» hecho; ampliación en spec |
| 002 — Coches (lógica) | Lista de modelos con su capacidad, búsqueda, coches propios y recordar el coche y el precio | Pendiente |
| 003 — Historial (lógica) | Guardar repostajes, último gasto y gasto de los últimos 7 días | Pendiente |
| 004+ — Interfaz | Pantallas basadas en el mockup de Figma y publicación en una URL | Pendiente |

Todavía **no hay interfaz**: al ejecutar la app solo se ve el título. La lógica está en `src/lib/` y cubierta por tests.

**Ejemplo:** con un depósito de 50 l al 25 % y el precio a 1,579 €/l, para llenarlo puedes pedir **59 €** sin pasarte.

## Diseño
El diseño es un mockup de orientación: las pantallas se ajustarán a la lógica cuando lleguen las specs de interfaz.

- [Prototipo en Figma](https://www.figma.com/proto/hAq16LKqkVc1jL0ss69W8K/Tank-calc?node-id=0-1) — las pantallas previstas de la app.
- [Diseño en Figma](https://www.figma.com/design/hAq16LKqkVc1jL0ss69W8K/Tank-calc?node-id=0-1)
- [Flujo de usuario en FigJam](https://www.figma.com/board/2doVbViaHmKMjFWHlxYXOv/User-Flow-Diagram-Template-for-FigJam--Community-?node-id=0-1) — qué hace el usuario desde que abre la app hasta guardar un repostaje.

## Ejecutar en local
Requisitos: Node.js 24 o superior y npm.

```sh
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo en http://localhost:5173
npm test         # tests (npm run test:watch para modo vigilancia)
npm run lint     # lint con oxlint
npm run build    # comprobación de tipos y build de producción en dist/
npm run format   # formatear el código con Prettier
```

## Stack
React + TypeScript (Vite), Vitest, oxlint y Prettier. CI con GitHub Actions: lint, tests y build en cada push y PR. Los detalles y su porqué están en la [constitución](specs/00-constitution.md) y en [docs/decisiones.md](docs/decisiones.md).

## Cómo se desarrolla
El proyecto sigue *Spec-Driven Development*: cada feature tiene su `spec.md` (qué y por qué), su `plan.md` (cómo) y su `tasks.md` (tareas) en `specs/`. Las instrucciones para agentes de IA están en [AGENTS.md](AGENTS.md).

## Estructura
- `specs/` — visión, constitución y una carpeta por feature
- `docs/decisiones.md` — registro de decisiones técnicas
- `src/lib/` — lógica pura (cálculo, validación y formato) y sus tests
- `src/` — aplicación React
