# Tareas — Feature 004: Interfaz de la calculadora y los coches

> **Estado:** aprobadas el 25/11/2026.

Basadas en el [plan](plan.md). Se hacen en orden. Al cerrar cada tarea: `npm run lint`, `npm test` y `npm run build` en verde, marcarla `[x]` y proponer el commit. Los tests de componentes se van añadiendo a `src/App.test.tsx` en la tarea que crea cada comportamiento.

## Setup y publicación
- [ ] T1: **(Autor)** Importar el repositorio en Vercel con la rama de producción `main`. Después, comprobar que la URL pública muestra la app actual (el título «tank-calc»). (verificación: abrir la URL en el móvil | cubre: base de CA36 y CA37)
- [x] T2: Instalar `tailwindcss` y `@tailwindcss/vite`, añadir el plugin a `vite.config.ts` y crear `src/index.css` con `@import "tailwindcss"`, los colores del mockup en `@theme` y la fuente del sistema. Importarlo en `main.tsx`. (verificación: `npm run dev` muestra el título con el fondo y la fuente nuevos; `npm run build` en verde | cubre: base de CA30 y CA35)
- [x] T3: Instalar `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event` y `jsdom`. Crear `src/test/setup.ts`, que limpia el DOM y añade la versión mínima de `<dialog>` solo si jsdom no la trae, y añadir `test.setupFiles` a `vite.config.ts`. Hacer que `App` reciba `storage` desde `main.tsx` y crear `src/App.test.tsx` con un primer test que monta la app con un almacenamiento falso. Los tests de `lib` siguen en Node. (verificación: `npm test` | cubre: base de los tests de componentes)

## Lógica de la interfaz
- [x] T4: Añadir `digitsOnly` a `text.ts`, e `isSameCar` y la exportación del mensaje del límite a `ownCars.ts`, con sus tests. (verificación: `npm test` | cubre: CA16, CA19, CA27)
- [x] T5: Implementar `calculatorForm.ts` (`evaluateCalculator`) con sus tests:
  - los tres modos con los ejemplos de la spec;
  - `null` con datos vacíos o no válidos;
  - nivel 100 con el objetivo o el dinero vacíos o no válidos;
  - objetivo con nivel no válido;
  - objetivo no mayor que el nivel.

  (verificación: `npm test` | cubre: CA6, CA8, CA13)
- [x] T6: Implementar `resultText.ts` (`describeResult`) con un test por cada fila de la tabla de CA7, con los textos exactos. (verificación: `npm test` | cubre: CA7)

## Calculadora
- [x] T7: Sustituir el marcador de `App.tsx`:
  - cabecera con la etiqueta «Reposta con cabeza»;
  - carga con `loadSavedData`;
  - estado de pantalla;
  - `Welcome.tsx` sin coche seleccionado;
  - tarjeta «Tu coche» con «Cambiar»;
  - una primera `ChooseCarScreen` con solo «Volver» y el título;
  - foco en el `h1` al cambiar de pantalla.

  Tests: bienvenida en la primera visita; tarjeta del coche con un coche guardado; «Elegir coche», «Cambiar» y «Volver» llevan a la pantalla correcta. (verificación: `npm test` y revisión en `npm run dev` | cubre: CA1, CA2, CA31, parte de CA18 y CA33)
- [ ] T8: Crear `NumberField.tsx`, `ModeSelector.tsx` y `ResultCard.tsx`, y montar la calculadora. Incluye:
  - nivel con botones rápidos, precio, selector de modo, objetivo y dinero;
  - `inputMode`, filtro de cifras, `aria-pressed` y `aria-live`;
  - el estado del formulario guardado en `App`.

  Tests:
  - con un coche de 50 l, 25 % y 1,579 → «Pide 59 €» sin pulsar ningún botón;
  - cambiar a «Hasta X %» y a «Tengo X €» conservando los datos;
  - un botón rápido rellena el nivel;
  - pegar «1.000» deja «1000»;
  - nivel 100 → «Tu depósito ya está lleno».

  (verificación: `npm test` y revisión en `npm run dev` | cubre: CA3–CA9, CA15, CA16, parte de CA34)
- [ ] T9: Mostrar los errores con el indicador de «tocado»: al salir del campo, error debajo, marca roja, `aria-invalid` y `aria-describedby`. Solo se muestran los campos visibles.

  Tests:
  - sin error antes de salir del campo;
  - error al salir;
  - desaparece al corregir;
  - el mensaje cambia de «vacío» a «no válido»;
  - el error del objetivo cambia al cambiar el nivel;
  - el error del dinero se oculta en «A tope».

  (verificación: `npm test` | cubre: CA10–CA14, CA32)
- [ ] T10: Rellenar el precio recordado y recordar cada precio válido con `savePrice`. Añadir `saveFailed` en `App` y el aviso de que no se ha podido guardar.

  Tests:
  - el precio sigue al volver a montar la app con el mismo almacenamiento;
  - un precio no válido no sustituye al recordado;
  - con un almacenamiento que falla aparece el aviso y la app sigue calculando.

  (verificación: `npm test` | cubre: CA4, CA17, CA29)

## Coches
- [ ] T11: Completar `ChooseCarScreen.tsx`:
  - buscador que filtra mientras se escribe;
  - secciones «Mis coches» y «Explorar modelos» (se ocultan si están vacías);
  - filas con nombre, capacidad, «Seleccionado» ✓ y «Añadido por ti»;
  - elegir un coche vuelve a la calculadora;
  - mensaje sin resultados, «+ Añadir mi coche» (todavía sin hoja) y nota final;
  - nombres largos que no desbordan.

  Tests:
  - «corolla toy» encuentra «Toyota Corolla»;
  - elegir un coche lo selecciona y la calculadora usa su capacidad;
  - búsqueda sin resultados;
  - el coche seleccionado aparece marcado.

  (verificación: `npm test` y revisión a 360 px en `npm run dev` | cubre: CA18–CA22, CA30)
- [ ] T12: Crear `BottomSheet.tsx` sobre `<dialog>`, con Escape, clic en el fondo y devolución del foco. Añadir «Borrar» a los coches propios, con la confirmación en la hoja, y guardar con `saveCarState` (y el aviso si falla).

  Tests:
  - cancelar no borra;
  - confirmar borra;
  - borrar el seleccionado lleva a la bienvenida al volver;
  - los coches de la lista no tienen «Borrar».

  (verificación: `npm test` y revisión con teclado en `npm run dev` | cubre: CA23, parte de CA29 y CA33)
- [ ] T13: Crear `AddCarSheet.tsx`:
  - nombre y capacidad (solo cifras);
  - errores al salir del campo y todos a la vez al «Guardar»;
  - un coche válido se añade, queda seleccionado, se cierra la hoja y se vuelve a la calculadora;
  - con 10 coches, el mensaje del límite y «Cerrar»;
  - «Cancelar», Escape o un clic fuera la cierran sin añadir nada.

  Tests:
  - añadir «Mi furgoneta» de 60 l y verla en la tarjeta «Tu coche»;
  - errores de nombre vacío y repetido;
  - límite de 10;
  - cancelar no añade.

  (verificación: `npm test` | cubre: CA24–CA28)

## Cierre
- [ ] T14: Comprobación manual sobre la URL de vista previa de la rama, corrigiendo lo que falle:
  - 360 px sin desplazamiento horizontal en todas las pantallas y la hoja, con un nombre de 40 caracteres;
  - **(Autor)** teclados en un Android y un iPhone reales;
  - navegación completa con teclado y foco visible;
  - botones de al menos 44 px;
  - contraste AA;
  - Lighthouse móvil ≥ 90 en accesibilidad.

  Anotar los resultados. (verificación: lista de comprobaciones anotada en el plan | cubre: CA15, CA30, CA31, CA33–CA36)
- [ ] T15: Cerrar la feature:
  - añadir D7–D11 a `docs/decisiones.md`;
  - actualizar `README.md` (estado de la 004, enlace a la app publicada, stack y quitar «Todavía no hay interfaz») y el estado de la spec;
  - añadir al final del plan el repaso de los criterios.

  CA37 se comprueba tras el merge a `main`. (verificación: revisión de los documentos y `npm run lint`, `npm test` y `npm run build` en verde | cubre: CA37, CA38)
