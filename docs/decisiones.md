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
