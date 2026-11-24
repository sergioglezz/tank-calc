# tank-calc

Calculadora de repostaje para el móvil: te dice cuánto pedir en caja antes de llenar el depósito, sin pasarte.

En muchas gasolineras hay que pagar **antes** de repostar. tank-calc calcula, a partir de la capacidad del depósito, el nivel actual y el precio por litro, cuántos litros faltan, cuánto cuesta llenarlo y qué importe en euros enteros puedes pedir sin pasarte.

## Estado
| Feature | Qué incluye | Estado |
|---|---|---|
| [001 — Llenar a tope (cálculo)](specs/001-llenar-a-tope/spec.md) | Lectura de números con coma o punto, validación con mensajes en español, cálculo exacto y formato en euros y litros | ✅ Hecha (sin interfaz) |
| Interfaz | Pantallas basadas en un diseño de Figma | Pendiente |

Todavía **no hay interfaz**: al ejecutar la app solo se ve el título. La lógica está en `src/lib/` y cubierta por tests.

**Ejemplo:** con un depósito de 50 l al 25 % y el precio a 1,579 €/l, faltan 37,50 l; llenarlo cuesta 59,21 € y puedes pedir **59 €** sin pasarte.

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
