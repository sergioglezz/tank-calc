# Tareas — Feature 002: Coches (lógica)

> **Estado:** aprobadas el 24/11/2026.

Basadas en el [plan](plan.md). Se hacen en orden. Al cerrar cada tarea: `npm run lint`, `npm test` y `npm run build` en verde, marcarla `[x]` y proponer el commit.

## Base
- [x] T1: Implementar `text.ts` (`normalizeText`) con sus tests. (verificación: `npm test` | cubre: base de CA7 y CA12)
- [x] T2: Añadir `formatPriceInput` a `format.ts` con sus tests (`1,579`, `1,5`, `5`, `0,001`). (verificación: `npm test` | cubre: CA19)

## Lista de modelos
- [x] T3: Activar `resolveJsonModule` en `tsconfig.app.json`, crear `cars.json` con entre 90 y 110 modelos populares en España (sin eléctricos y con variante solo cuando cambie la capacidad) y el test que comprueba los datos. (verificación: `npm test` y `npm run build`; el autor revisa la lista y da su visto bueno | cubre: CA1, CA2, CA3)
- [x] T4: Implementar `carCatalog.ts` (`catalogKey`, `catalogLabel`, `catalogCars` ordenada y `findCatalogCar`) con sus tests. (verificación: `npm test` | cubre: CA1, CA4, orden de la lista de CA9)

## Coches propios
- [x] T5: Implementar en `ownCars.ts` `validateCarName` y `addOwnCar`, con el límite de 10 y todos los errores a la vez, con sus tests. (verificación: `npm test` | cubre: CA11, CA12, CA13, CA14)
- [x] T6: Añadir `removeOwnCar`, `selectCar` y `resolveSelected` con sus tests, incluido borrar el coche seleccionado y la inmutabilidad del estado. (verificación: `npm test` | cubre: CA15, CA16)

## Búsqueda
- [x] T7: Implementar `carSearch.ts` (`searchCars`) con sus tests: palabras en cualquier orden, sin tildes ni mayúsculas, texto vacío, sin coincidencias y orden de los resultados. (verificación: `npm test` | cubre: CA5, CA6, CA7, CA8, CA9, CA10)

## Recordar entre visitas
- [x] T8: Implementar en `storage.ts` `getBrowserStorage` y `loadSavedData`, con el saneado de coches propios, coche seleccionado y precio, y sus tests con un almacenamiento falso. (verificación: `npm test` | cubre: CA20, CA21, CA22)
- [x] T9: Añadir `saveCarState` y `savePrice` con sus tests: guardar y volver a cargar, precio no válido que no sustituye al anterior y fallos al guardar. (verificación: `npm test` | cubre: CA17, CA18, CA19, CA23)

## Cierre
- [ ] T10: Añadir D3 y D4 a `docs/decisiones.md`, actualizar el estado de la feature 002 en `README.md` y en la spec, y añadir al final del plan el repaso de los criterios de la spec. (verificación: revisión de los documentos y `npm run lint`, `npm test` y `npm run build` en verde | cubre: —)
