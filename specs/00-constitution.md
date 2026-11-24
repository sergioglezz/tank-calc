# Constitución

Principios no negociables de tank-calc. Si una spec, plan o tarea contradice este documento, manda este documento (o se cambia aquí primero, de forma explícita).

## 1. Stack técnico
| Elección | Por qué |
|---|---|
| **TypeScript** (modo `strict`) | Los tipos evitan errores en cálculos y datos, que es lo que no puede fallar. |
| **React** | Librería de UI más demandada; suficiente para una app de una pantalla. |
| **Vite** | Arranque y build rápidos con plantilla oficial React + TS. |
| **Tailwind CSS** | Estilos mobile-first sin mantener hojas CSS propias. |
| **Vitest** | Integrado con Vite; tests de la lógica de cálculo. |
| **Testing Library** | Tests de componentes desde el punto de vista del usuario. |
| **oxlint + Prettier** | Convenciones automáticas, no discutibles. oxlint es el linter de la plantilla oficial de Vite: una sola dependencia y muy rápido. |
| **localStorage** | Persistencia local sin backend, como exige la visión. |
| **Vercel** | Despliegue público automático desde `main`. |
| **GitHub Actions** | CI: lint, tests y build en cada push y PR. |
| **npm** | Gestor de paquetes por defecto. |

## 2. Calidad
- **Tests mínimos:** toda función de cálculo y de validación tiene tests unitarios, incluidos casos límite (0 %, 100 %, objetivo < actual, dinero > capacidad, entradas vacías o negativas). Cada funcionalidad del MVP tiene al menos un test de componente de su flujo principal.
- **Lógica separada de la UI:** cálculos, validación y acceso a `localStorage` viven en funciones puras/módulos en `src/lib/`, sin React.
- **Convenciones:** código en inglés, textos de la interfaz en español. Componentes en `PascalCase`, funciones y variables en `camelCase`. Nada de `any`. Sin código muerto ni comentarios que repitan el código.
- **Errores:** las entradas no válidas se muestran al usuario con un mensaje claro junto al campo, nunca como excepción ni `NaN`. Si `localStorage` falla o tiene datos corruptos, la app sigue funcionando con valores por defecto.
- **Dinero:** importes en euros redondeados a 2 decimales para mostrar; "sin pasarte" = importe truncado a euros enteros.

## 3. Simplicidad
- Ninguna dependencia nueva sin justificarla en el `plan.md` de la feature.
- Sin router, sin librería de estado, sin librería de componentes, de gráficos ni de validación, sin backend.
- Sin abstracciones "por si acaso": se generaliza cuando haya un segundo uso real.

## 4. Seguridad básica
- Ningún secreto (claves, tokens) en el código ni en el repositorio; si algún día hace falta, va en variables de entorno.
- Toda entrada del usuario y todo dato leído de `localStorage` se valida antes de usarse.
- Nada de `dangerouslySetInnerHTML` ni de evaluar texto del usuario.

## 5. Definición de "hecho" (por tarea)
Una tarea está hecha cuando:
1. Cumple lo descrito en su entrada de `tasks.md`, y nada más.
2. `npm run lint`, `npm test` y `npm run build` pasan sin errores.
3. Tiene los tests que exige la sección 2.
4. Está marcada `[x]` en `tasks.md` y tiene un commit con mensaje descriptivo.
