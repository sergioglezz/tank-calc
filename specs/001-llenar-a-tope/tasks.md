# Tareas — Feature 001: Llenar a tope (cálculo)

Basadas en el [plan](plan.md). Se hacen en orden y de una en una. Al cerrar cada tarea: `npm run lint`, `npm test` y `npm run build` en verde, marcarla `[x]` y proponer el commit.

## Setup
- [x] T1: Crear el proyecto Vite `react-ts` en la raíz del repo, quitar los archivos de ejemplo de la plantilla, dejar `App.tsx` como marcador con el título «tank-calc» y poner `lang="es"` y el título en `index.html`. (verificación: `npm run dev` muestra «tank-calc»; `npm run build` pasa | cubre: —)
- [x] T2: Configurar Vitest (entorno `node`), Prettier, y los scripts `test`, `test:watch` y `format`. Rellenar la tabla de comandos de `AGENTS.md`. (verificación: `npm run lint`, `npm test` y `npm run build` pasan | cubre: —)
- [x] T3: Añadir la CI en `.github/workflows/ci.yml` (Node 24: `npm ci`, lint, test y build en cada push y PR). (verificación: tras el push de la rama, el workflow sale en verde en GitHub | cubre: —)

## Lógica (`src/lib/`)
- [x] T4: Implementar `parseDecimal.ts` con sus tests. (verificación: `npm test` | cubre: CA1, CA2, CA3)
- [x] T5: Implementar `validation.ts` (`validateCapacity`, `validateLevel`, `validatePrice`) con tests de cada extremo, de los decimales de más y del texto de cada mensaje. (verificación: `npm test` | cubre: CA4, CA5)
- [x] T6: Implementar `fillUp.ts` (`calculateFullTank`, en enteros según D1) con tests: CA7, 0 %, 100 %, menos de 1 €, importe exacto entero, 47,999 € → 47 y valores máximos. (verificación: `npm test` | cubre: CA6–CA12)
- [x] T7: Implementar `format.ts` (`formatEuros`, `formatWholeEuros`, `formatLiters`) con tests. (verificación: `npm test` | cubre: CA13)

## Cierre
- [x] T8: Actualizar `README.md`: qué es tank-calc, qué hay hecho (el cálculo, todavía sin interfaz) y cómo instalar, ejecutar los tests y hacer el build en local. (verificación: revisión del README | cubre: —)
