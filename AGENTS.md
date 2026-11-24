# AGENTS.md

Instrucciones para agentes de IA que trabajen en este repositorio. Este proyecto sigue **Spec-Driven Development**.

## Antes de nada
Lee, en este orden:
1. `specs/00-vision.md` — qué es el proyecto y qué queda fuera.
2. `specs/00-constitution.md` — reglas no negociables (stack, calidad, seguridad, definición de hecho).
3. La spec de la feature activa: `specs/NNN-nombre-feature/spec.md`, junto con su `plan.md` y `tasks.md` si existen.

Si no sabes cuál es la feature activa, pregunta.

## Flujo obligatorio
**spec → plan → tasks → implementar una tarea cada vez.**

- `spec.md`: qué y por qué (comportamiento, criterios de aceptación). Sin detalles técnicos.
- `plan.md`: cómo (componentes, módulos, datos, dependencias justificadas).
- `tasks.md`: lista de tareas pequeñas y verificables con casillas `[ ]`.
- No pases a la siguiente fase sin que la anterior esté aprobada por el usuario.

## Reglas
- **No implementes nada que no esté en `tasks.md`.** Nada de extras, refactors o mejoras no pedidas.
- **Si algo no está claro o falta en la spec, pregunta en vez de inventar.**
- **Si una decisión cambia la spec o el plan, actualiza primero el documento** y pide confirmación; después, el código.
- Una tarea cada vez. No empieces la siguiente hasta cerrar la actual.
- Respeta `specs/00-constitution.md`; si una tarea la contradice, avisa antes de seguir.

## Al terminar una tarea
1. Ejecuta lint, tests, build y la comprobación del formato (comandos abajo) y corrige lo que falle.
2. Marca la tarea como `[x]` en `tasks.md`.
3. Propón un mensaje de commit (en español, imperativo, p. ej. `Añadir cálculo de llenado a tope`). No hagas commit sin confirmación.

## Comandos del proyecto
| Acción | Comando |
|---|---|
| Instalar dependencias | `npm install` |
| Ejecutar en local | `npm run dev` |
| Tests | `npm test` (en modo vigilancia: `npm run test:watch`) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Formatear código | `npm run format` |
| Comprobar el formato | `npm run format:check` |

## Estructura
- `specs/` — visión, constitución y una carpeta por feature (`NNN-nombre-feature/`).
- `src/` — código fuente. Lógica pura en `src/lib/`.
