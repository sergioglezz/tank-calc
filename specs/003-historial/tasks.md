# Tareas — Feature 003: Historial de repostajes (lógica)

> **Estado:** aprobadas el 24/11/2026.

Basadas en el [plan](plan.md). Se hacen en orden. Al cerrar cada tarea: `npm run lint`, `npm test` y `npm run build` en verde, marcarla `[x]` y proponer el commit.

## Base
- [x] T1: Implementar `dates.ts` (`todayIso`, `isValidIsoDate`, `daysBetween`) con sus tests: fecha local cerca de medianoche, fechas que no existen, 29 de febrero y días entre meses y años. (verificación: `npm test` | cubre: base de CA4 y CA16)
- [x] T2: Exportar `litersForEuros` desde `calculator.ts`, hacer que `resultForEuros` lo use y añadir sus tests (18 l, 25 l exactos y 0 l). Los tests de la 001 siguen en verde sin cambios. (verificación: `npm test` | cubre: CA3)
- [x] T3: Añadir `formatPrice` y `formatDate` a `format.ts` con sus tests. (verificación: `npm test` | cubre: CA14)

## Validación
- [x] T4: Añadir `validatePaidEuros` y `validateRefuelDate` a `validation.ts` con sus tests: extremos, vacío, fecha vacía (hoy), hace 365 y 366 días, mañana, fecha que no existe y mensajes exactos. (verificación: `npm test` | cubre: CA2, CA4, CA6)

## Historial
- [x] T5: Implementar en `refuels.ts` `sortRefuels` y `addRefuel`, con el coche seleccionado, todos los errores a la vez y el límite de 500, con sus tests. Incluye el test de que las etiquetas de la lista de modelos tienen como mucho 40 caracteres. (verificación: `npm test` | cubre: CA1, CA3, CA4, CA5, CA6, CA7, CA8, CA10)
- [x] T6: Añadir `removeRefuel`, `lastRefuel`, `dailySpending` y `monthTotal` con sus tests: borrar uno de dos idénticos, historial vacío, varios repostajes el mismo día, cambio de mes, fecha posterior a hoy e inmutabilidad. (verificación: `npm test` | cubre: CA9, CA11, CA12, CA13)

## Recordar entre visitas
- [x] T7: Añadir a `storage.ts` `loadRefuels` y `saveRefuels` con la clave `tank-calc:refuels` y sus tests con el almacenamiento falso: guardar y volver a cargar, primera visita, fallos al leer y al guardar, cada regla de descarte, más de 500, fechas antiguas o futuras que se conservan e independencia de los datos de la 002. (verificación: `npm test` | cubre: CA15, CA16, CA17, CA18)

## Cierre
- [ ] T8: Añadir D5 y D6 a `docs/decisiones.md`, actualizar el estado de la feature 003 en `README.md` y en la spec, y añadir al final del plan el repaso de los criterios de la spec. (verificación: revisión de los documentos y `npm run lint`, `npm test` y `npm run build` en verde | cubre: —)
