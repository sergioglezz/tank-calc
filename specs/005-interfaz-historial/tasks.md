# Tareas — Feature 005: Interfaz del historial

> **Estado:** redactadas el 25/11/2026 con autorización expresa del autor para implementarlas sin esperar aprobación (ver la spec).

Basadas en el [plan](plan.md). Se hacen en orden. Al cerrar cada tarea: `npm run lint`, `npm test` y `npm run build` en verde, marcarla `[x]` y hacer el commit.

## Base
- [x] T1: Añadir `shiftDays` a `dates.ts` con sus tests. Hacer que `App` reciba `getToday` (por defecto `todayIso`) y que los tests le pasen un día fijo. (verificación: `npm test` | cubre: base de CA7 y CA15)

## Navegación e historial
- [x] T2: Crear `BottomNav.tsx` y la pantalla `history` con su título y un margen inferior para que la barra no tape nada.

  Tests:
  - ir al historial y volver;
  - `aria-current`;
  - foco en el título;
  - «Elige tu coche» marca «Calculadora»;
  - los datos de la calculadora se conservan.

  (verificación: `npm test` y revisión en `npm run dev` | cubre: CA1–CA4)
- [ ] T3: Crear `HistoryScreen.tsx` y cargar el historial en `App` con `loadRefuels`:
  - historial vacío con «Ir a la calculadora»;
  - «La última vez gastaste»;
  - «Este mes» con «Gasto por día»;
  - «Repostajes» con su número.

  Tests:
  - vacío;
  - datos cargados del almacenamiento con dos repostajes el mismo día, uno de otro mes y uno sin coche;
  - formatos;
  - datos dañados.

  (verificación: `npm test` | cubre: CA13–CA17, CA21)
- [ ] T4: Añadir «Borrar» a cada repostaje, con la confirmación en `BottomSheet`, y `removeRefuel` con `saveRefuels` en `App` (y el aviso si falla).

  Tests:
  - cancelar;
  - confirmar;
  - uno de dos idénticos;
  - el último → vacío;
  - foco en «Cancelar» y en el título;
  - se guarda en el almacenamiento.

  (verificación: `npm test` | cubre: CA18–CA20, parte de CA22)

## Guardar un repostaje
- [ ] T5: Añadir a la calculadora el botón «Guardar repostaje» y el aviso «Repostaje guardado», crear `SaveRefuelSheet.tsx` y conectar `addRefuel` con `saveRefuels` en `App`.

  Tests:
  - estado del botón en cada caso;
  - valores rellenados (incluido «Tengo X €» con sobrante) y el texto del coche;
  - guardar y verlo en el historial;
  - el aviso aparece y desaparece;
  - errores al salir del campo y todos a la vez;
  - fecha posterior a hoy;
  - cancelar;
  - el precio de la hoja no se recuerda;
  - aviso con un almacenamiento que falla.

  (verificación: `npm test` y revisión en `npm run dev` | cubre: CA5–CA12, CA22)

## Cierre
- [ ] T6: Comprobación manual en el navegador a 360 px de la calculadora con el botón y el aviso, la hoja de guardado, el historial vacío y con datos, y la confirmación de borrado:
  - sin desplazamiento horizontal;
  - 44 px;
  - la barra no tapa nada;
  - foco y Escape;
  - contraste de los colores nuevos.

  Corregir lo que falle. (verificación: resultados anotados en el plan | cubre: CA4, CA23)
- [ ] T7: Cerrar la feature:
  - añadir D12 a `docs/decisiones.md`;
  - actualizar `README.md` (MVP completo, estado de la 005, Vercel pendiente) y el estado de la spec;
  - añadir al final del plan el repaso de los criterios y la revisión de la spec (comprobable, sin detalles técnicos, alcance y casos límite).

  (verificación: revisión de los documentos y `npm run lint`, `npm test` y `npm run build` en verde | cubre: CA24)
