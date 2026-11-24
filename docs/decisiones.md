# Decisiones técnicas

Registro de decisiones importantes: qué se decidió, por qué y qué alternativas se descartaron.

## D1 — Cálculo del dinero en enteros (feature 001)
**Decisión:** el coste se calcula en millonésimas de euro con enteros: capacidad en decilitros × porcentaje que falta × precio en milésimas de euro. El importe «sin pasarte» es la división entera entre 10⁶.
**Por qué:** en coma flotante, un importe que debería ser exactamente 48,00 € puede salir 47,9999…, y al truncarlo daría 47 €. Con los límites de la spec (200 l, 100 %, 5 €/l), el producto máximo es 10⁹, así que es exacto en JavaScript.
**Descartado:** redondear antes de truncar (oculta el error en vez de evitarlo) y usar una librería decimal (la constitución pide no añadir dependencias innecesarias).

## D2 — oxlint en lugar de ESLint (feature 001)
**Decisión:** el lint se hace con oxlint, con la configuración que trae la plantilla oficial de Vite (`react-ts`). Prettier se mantiene para el formato.
**Por qué:** la plantilla actual de Vite ya no trae ESLint, sino oxlint, configurado con las reglas de React y TypeScript. Es una sola dependencia, frente a las cinco o seis que haría falta para montar ESLint a mano, y es mucho más rápido.
**Descartado:** ESLint con typescript-eslint y los plugins de React. Es más conocido, pero añade dependencias y configuración que este proyecto no necesita.
**Cambio:** se ha actualizado la constitución (sección 1).
