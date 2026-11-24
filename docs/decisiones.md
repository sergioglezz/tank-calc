# Decisiones técnicas

Registro de decisiones importantes: qué se decidió, por qué y qué alternativas se descartaron.

## D1 — Cálculo del dinero en enteros (feature 001)
**Decisión:** el coste se calcula en millonésimas de euro con enteros: capacidad en decilitros × porcentaje que falta × precio en milésimas de euro. El importe «sin pasarte» es la división entera entre 10⁶.
**Por qué:** en coma flotante, un importe que debería ser exactamente 48,00 € puede salir 47,9999…, y al truncarlo daría 47 €. Con los límites de la spec (200 l, 100 %, 5 €/l), el producto máximo es 10⁹, así que es exacto en JavaScript.
**Descartado:** redondear antes de truncar (oculta el error en vez de evitarlo) y usar una librería decimal (la constitución pide no añadir dependencias innecesarias).
