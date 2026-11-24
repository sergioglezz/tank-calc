# tank-calc

Calculadora de repostaje para el móvil: te dice cuánto pedir en caja antes de llenar el depósito, sin pasarte.

En muchas gasolineras hay que pagar **antes** de repostar. A partir de la capacidad del depósito, el nivel actual y el precio por litro, tank-calc te dice cuántos euros pedir en caja, cuántos litros entran y en qué nivel queda el depósito, en tres modos:
- **A tope:** llenar el depósito.
- **Hasta X %:** llegar a un nivel concreto.
- **Tengo X €:** hasta dónde te llega el dinero y cuánto te sobra.

Todos los resultados son números enteros, redondeados a la baja para no pasarte.

No hace falta saber la capacidad del depósito: puedes buscar tu coche en una lista de unos 100 modelos populares en España o añadir el tuyo con su nombre y capacidad. La app recuerda tu coche y el último precio en tu dispositivo.

Cada repostaje se puede guardar en un historial para saber cuánto gastaste la última vez, cada día y en lo que va de mes.

## Estado y hoja de ruta
| Feature | Qué incluye | Estado |
|---|---|---|
| [001 — Calculadora (lógica)](specs/001-calculadora/spec.md) | Validación con mensajes en español y cálculo en euros, litros y porcentajes enteros de los tres modos: «A tope», «Hasta X %» y «Tengo X €» | ✅ Hecha (sin interfaz) |
| [002 — Coches (lógica)](specs/002-coches/spec.md) | Lista de 106 modelos con su capacidad, búsqueda sin tildes ni mayúsculas, hasta 10 coches propios y recordar en el dispositivo los coches, el coche seleccionado y el último precio | ✅ Hecha (sin interfaz) |
| [003 — Historial (lógica)](specs/003-historial/spec.md) | Guardar y borrar repostajes (fecha, euros, precio, litros y coche), lo que gastaste la última vez, el gasto por día y el total del mes, y recordar en el dispositivo hasta 500 repostajes | ✅ Hecha (sin interfaz) |
| [004 — Interfaz de la calculadora y los coches](specs/004-interfaz-calculadora/spec.md) | Calculadora con los tres modos y resultado al momento, errores al salir de cada campo, teclado numérico, elegir, añadir y borrar coches, y accesibilidad básica, mobile-first | ✅ Hecha · publicación en Vercel pendiente |
| [005 — Interfaz del historial](specs/005-interfaz-historial/spec.md) | Guardar el repostaje desde la calculadora (con otro importe, precio o día), pantalla «Historial» con la última vez, el gasto del mes y por día y la lista de repostajes, borrar repostajes y barra de navegación inferior | ✅ Hecha · publicación en Vercel pendiente |

**El MVP está completo:** puedes elegir o añadir tu coche, calcular en los tres modos, guardar el repostaje y verlo en el historial. Solo falta publicarlo en una URL pública de Vercel (paso manual del autor; ver la feature 004). La lógica está en `src/lib/` y cubierta por tests unitarios; la interfaz, por tests de componentes.

**Ejemplo:** con un depósito de 50 l al 25 % y el precio a 1,579 €/l:

| Modo | Pide | Entran | El depósito queda al |
|---|---|---|---|
| A tope | **59 €** | 37 l | 99 % |
| Hasta 75 % | **39 €** | 24 l | 74 % |
| Tengo 30 € | **30 €** | 18 l | 62 % |
| Tengo 80 € | **59 €** (te sobran 21 €) | 37 l | 99 % |

## Cómo se usa
1. **Elige tu coche** en la lista o añade el tuyo con su nombre y la capacidad del depósito. La app lo recuerda para la próxima vez.
2. **Escribe el nivel actual** del depósito (en %, o con los botones 25, 50 y 75 %) y **el precio por litro** del surtidor.
3. **Elige el modo** («A tope», «Hasta X %» o «Tengo X €»). El resultado aparece al momento: lo que dices en caja, los litros y el nivel en que queda el depósito.
4. **Pulsa «Guardar repostaje»** si quieres apuntarlo. Puedes cambiar el importe, el precio o el día antes de guardarlo.
5. **Abre «Historial»** en la barra de abajo para ver cuánto gastaste la última vez, lo que llevas este mes, el gasto de cada día y todos tus repostajes, que puedes borrar uno a uno.

Los datos se guardan solo en tu navegador: no hay cuentas ni servidor.

## Diseño
El diseño es un mockup de orientación: la interfaz toma de él el estilo, la estructura y la navegación, pero las cifras, los mensajes y los formatos son los de las specs. Las capturas de cada pantalla están en [docs/design/](docs/design/).

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
React + TypeScript (Vite), Tailwind CSS, Vitest con Testing Library, oxlint y Prettier. CI con GitHub Actions: lint, tests y build en cada push y PR. Los detalles y su porqué están en la [constitución](specs/00-constitution.md) y en [docs/decisiones.md](docs/decisiones.md).

## Cómo se desarrolla
El proyecto sigue *Spec-Driven Development*: cada feature tiene su `spec.md` (qué y por qué), su `plan.md` (cómo) y su `tasks.md` (tareas) en `specs/`. Las instrucciones para agentes de IA están en [AGENTS.md](AGENTS.md).

## Estructura
- `specs/` — visión, constitución y una carpeta por feature
- `docs/decisiones.md` — registro de decisiones técnicas
- `src/lib/` — lógica pura y sus tests: lectura de números, validación, cálculo de los tres modos, formato, lista de coches (`cars.json`), búsqueda, coches propios, fechas, historial de repostajes y guardado en el dispositivo
- `src/components/` — pantallas y componentes de la interfaz
- `src/` — aplicación React (`App.tsx`) y sus tests de componentes
