# Decisiones técnicas

Registro de decisiones importantes: qué se decidió, por qué y qué alternativas se descartaron.

## D1 — Cálculo del dinero en enteros (feature 001)
**Decisión:** todos los cálculos se hacen con números enteros: litros enteros × puntos de porcentaje × precio en milésimas de euro. Los euros a pedir son la división entera de ese producto entre 100 000; los litros y el nivel final se obtienen de los euros con otra división entera.
**Por qué:** en coma flotante, un importe que debería ser exactamente 57 € puede salir 56,999…, y al truncarlo daría 56 €; lo mismo pasa con los litros (28 € a 1,12 €/l son 25 l exactos, no 24). Con los límites de la spec (200 l, 100 %, 5 €/l y 1000 €), los productos no pasan de 10⁸, así que son exactos en JavaScript.
**Descartado:** redondear antes de truncar (oculta el error en vez de evitarlo) y usar una librería decimal (la constitución pide no añadir dependencias innecesarias).
**Cambio (ampliación de la feature 001):** la primera versión trabajaba con decilitros y millonésimas de euro, porque la capacidad admitía un decimal y se mostraba el importe exacto con céntimos. Al pasar la capacidad y todos los resultados a enteros, se trabaja con litros y basta con milésimas de euro.

## D2 — oxlint en lugar de ESLint (feature 001)
**Decisión:** el lint se hace con oxlint, con la configuración que trae la plantilla oficial de Vite (`react-ts`). Prettier se mantiene para el formato.
**Por qué:** la plantilla actual de Vite ya no trae ESLint, sino oxlint, configurado con las reglas de React y TypeScript. Es una sola dependencia, frente a las cinco o seis que haría falta para montar ESLint a mano, y es mucho más rápido.
**Descartado:** ESLint con typescript-eslint y los plugins de React. Es más conocido, pero añade dependencias y configuración que este proyecto no necesita.
**Cambio:** se ha actualizado la constitución (sección 1).

## D3 — Identificar los coches por su nombre normalizado (feature 002)
**Decisión:** un coche de la lista se identifica por su marca, modelo y variante normalizados (sin mayúsculas ni tildes) y unidos por `|`, p. ej. `toyota|corolla|hibrido` o `toyota|corolla|` si no tiene variante. Un coche propio se identifica por su nombre, que no se puede repetir. Esa referencia es lo que se guarda como «coche seleccionado».
**Por qué:** no hace falta mantener identificadores a mano en `cars.json` ni generar identificadores aleatorios. Si un modelo cambia de nombre en una versión futura de la lista, el coche seleccionado deja de existir y la app empieza sin coche (CA21 de la spec 002), sin errores.
**Descartado:** un campo `id` en el JSON, porque es más trabajo de mantener y es fácil equivocarse al añadir modelos.

## D4 — El almacenamiento como parámetro y una clave por dato (feature 002)
**Decisión:** `storage.ts` recibe el almacenamiento como parámetro (`Pick<Storage, 'getItem' | 'setItem'>`) en vez de usar `localStorage` directamente; `getBrowserStorage()` devuelve `localStorage` o `null` si el navegador no deja usarlo. Cada dato va en su propia clave: `tank-calc:own-cars`, `tank-calc:selected-car` y `tank-calc:price`.
**Por qué:** así los tests corren en Node con un almacenamiento falso en memoria, que además permite simular lecturas y escrituras que fallan. Con una clave por dato, uno dañado no arrastra a los demás.
**Descartado:** jsdom en esta feature, porque sería una dependencia que todavía no usa ningún componente; y guardar todo en una sola clave, porque un error en un dato haría perder todos.

## D5 — Identificar los repostajes con un número correlativo (feature 003)
**Decisión:** cada repostaje lleva un `id` entero: el mayor del historial más 1, o 1 si está vacío.
**Por qué:** sirve para borrar un repostaje aunque haya otro con los mismos datos (CA9 de la spec 003) y para saber cuál se guardó antes el mismo día (CA8 y CA10). Si se borra el último guardado, el siguiente puede reutilizar su número, lo que no es un problema, porque el anterior ya no existe. Al cargar, de dos repostajes con el mismo número se queda el primero válido.
**Descartado:** `crypto.randomUUID()`, porque no indica el orden de guardado y los tests tendrían que simularlo; y la posición en el array, porque cambia al borrar.

## D6 — Fechas como texto `AAAA-MM-DD` y «hoy» como parámetro (feature 003)
**Decisión:** la fecha de un repostaje se guarda como texto `AAAA-MM-DD`, sin hora. «Hoy» es el día local del dispositivo (`todayIso`) y las funciones lo reciben como parámetro en vez de leer el reloj.
**Por qué:** un repostaje es de un día, no de un instante; guardar la hora traería problemas de zonas horarias y cambios de hora. Con ese formato las fechas se ordenan y comparan como texto, y es el mismo que da un campo de fecha del navegador. Recibir «hoy» hace las funciones puras y los tests no dependen del día en que se ejecutan. Los días entre dos fechas se cuentan con `Date.UTC`, que no tiene cambios de hora.
**Descartado:** guardar marcas de tiempo (`Date.now()`) y añadir una librería de fechas (la constitución pide no añadir dependencias innecesarias).
