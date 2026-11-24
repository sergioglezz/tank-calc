# Feature 001: Calculadora (lógica)

> **Estado:** ampliación aprobada el 24/11/2026, en implementación.
> La primera versión («Llenar a tope», cálculo) se cerró el 24/11/2026 (PR: sergioglezz/tank-calc#1). Esta versión la amplía con los modos «Hasta X %» y «Tengo X €» y pasa todos los resultados a números enteros. Cómo se implementa: [plan.md](plan.md), sección 10.

## Resumen y objetivo
Toda la lógica de cálculo de tank-calc, sin interfaz. A partir de los datos tal como los escribiría el usuario, la app sabe:
- comprobar si los datos son válidos y, si no, explicar por qué en español;
- calcular, en tres modos, **cuántos euros pedir en caja**, **cuántos litros entran** con ese importe y **en qué nivel queda el depósito**;
- presentar esas cifras en formato español.

**Todos los resultados son números enteros:** euros redondos, litros redondos y porcentajes redondos, siempre redondeados a la baja para no pasarse. El único dato con decimales es el precio por litro que escribe el usuario, porque así lo marca el surtidor (`1,579 €/l`).

Objetivo: que lo que no puede fallar (los números) esté terminado y probado antes de construir la interfaz.

## Historias de usuario
- Como conductor quiero saber cuántos euros pedir para **llenar el depósito** sin pasarme.
- Como conductor quiero saber cuántos euros pedir para **llegar a un nivel** (p. ej. al 75 %).
- Como conductor quiero saber **hasta dónde me llega el dinero** que tengo y si me sobra.
- Como conductor quiero ver cifras redondas, sin céntimos ni decimales, para decirlas en caja sin pensar.
- Como conductor quiero que se me explique qué dato está mal para no fiarme de un resultado erróneo.

## Criterios de aceptación
**Lectura de los datos**
- CA1: Un número escrito con coma decimal (`1,579`) o con punto decimal (`1.579`) se interpreta como el mismo valor.
- CA2: Los espacios al principio y al final se ignoran.
- CA3: No se admiten como número: un texto vacío, letras, signos (`-3`, `+3`), notación científica (`1e3`), separadores de miles (`1.000,5`) ni más de un separador decimal.

**Validación**
- CA4: Datos válidos:
  - capacidad: entero entre 1 y 200 l;
  - nivel actual: entero entre 0 y 100 %;
  - precio: mayor que 0 y como máximo 5 €/l, con tres decimales como máximo;
  - nivel objetivo (modo «Hasta X %»): entero entre 1 y 100 %, y mayor que el nivel actual;
  - dinero (modo «Tengo X €»): entero entre 1 y 1000 €.
- CA5: Para cada dato no válido, la validación da un mensaje en español que distingue entre «está vacío» y «no es válido»:

| Dato | Vacío | No válido |
|---|---|---|
| Capacidad | «Introduce la capacidad del depósito.» | «Escribe una capacidad entera entre 1 y 200 litros.» |
| Nivel actual | «Introduce el nivel actual.» | «Escribe un porcentaje entero entre 0 y 100.» |
| Precio | «Introduce el precio por litro.» | «Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.» |
| Nivel objetivo | «Introduce el nivel al que quieres llegar.» | «Escribe un porcentaje entero entre 1 y 100.» |
| Dinero | «Introduce cuántos euros tienes.» | «Escribe un importe entero entre 1 y 1000 €.» |

- CA6: Si el nivel objetivo es válido por sí solo pero no es mayor que el nivel actual, el mensaje es «El objetivo debe ser mayor que el nivel actual.».

**Cálculo común**
- CA7: En los tres modos, el resultado tiene tres cifras enteras:
  - **euros a pedir**: importe en euros enteros, truncado (nunca redondeado hacia arriba);
  - **litros**: litros que entran con los euros a pedir, truncados;
  - **nivel final**: porcentaje en el que queda el depósito tras echar esos euros, truncado.
- CA8: Los cálculos son exactos: un importe que vale exactamente 48 € da 48 €, nunca 47 € por errores de precisión. Con cualquier combinación de datos válidos no aparecen valores no numéricos ni infinitos (`NaN`, `Infinity`).

**Modo «A tope»** (capacidad, nivel actual, precio)
- CA9: Euros a pedir = coste de llenar el depósito, truncado.
- CA10: Ejemplo: 50 l, 25 %, 1,579 €/l → **59 €**, **37 l**, nivel final **99 %**.

**Modo «Hasta X %»** (capacidad, nivel actual, precio, nivel objetivo)
- CA11: Euros a pedir = coste de pasar del nivel actual al objetivo, truncado.
- CA12: Ejemplo: 50 l, 25 %, 1,579 €/l, objetivo 75 % → **39 €**, **24 l**, nivel final **74 %**. (Al truncar se queda un poco por debajo del objetivo, nunca por encima.)

**Modo «Tengo X €»** (capacidad, nivel actual, precio, dinero)
- CA13: Si el dinero no supera el coste de llenar a tope (truncado), euros a pedir = el dinero.
- CA14: Ejemplo: 50 l, 25 %, 1,579 €/l, 30 € → **30 €**, **18 l**, nivel final **62 %**.
- CA15: Si el dinero supera el coste de llenar a tope, euros a pedir = el de «A tope» y el resultado indica además los **euros que sobran** (enteros). Ejemplo: mismos datos con 80 € → **59 €**, **37 l**, **99 %**, sobran **21 €**.

**Casos especiales (los tres modos)**
- CA16: Con el nivel actual al 100 %, el resultado indica que **el depósito está lleno**, sin cifras.
- CA17: Si los euros a pedir salen 0 € con el nivel por debajo del 100 % (lo que falta cuesta menos de 1 €), el resultado indica **«menos de 1 €»**, sin cifras. Ejemplo: 50 l, 99 %, 1,5 €/l en «A tope».

**Presentación de las cifras**
- CA18: Euros sin decimales y con el símbolo detrás (`59 €`), litros sin decimales (`37 l`) y porcentajes sin decimales (`99 %`), con el espacio de formato español entre número y unidad.

## Casos límite y errores
- **Extremos válidos:** 1 l y 200 l; 0 % y 100 % (nivel actual); 1 % y 100 % (objetivo); 0,001 €/l y 5 €/l; 1 € y 1000 €.
- **No válidos:** 0 l, 201 l, 40,5 l; −1 %, 101 %, 50,5 %; 5,001 €/l, 1,5799 €/l; 0 €, 1001 €, 20,5 €.
- **Ceros a la derecha:** no cuentan como decimales: `40,0` l y `50,0` % son enteros válidos; `1,5790` €/l equivale a `1,579`.
- **Sin parte entera o sin decimales:** `,5` y `5,` no se admiten.
- **Objetivo igual al nivel actual:** no válido (CA6).
- **Objetivo al 100 %:** da el mismo resultado que «A tope».
- **Dinero igual al coste de llenar a tope:** no sobra nada (CA13, sin aviso de CA15).
- **Litros truncados a 0 con euros a pedir de 1 € o más:** posible con precios muy altos (p. ej. 1 € a 2 €/l); se muestra `0 l`.

## Fuera de alcance
- **Cualquier interfaz:** pantallas, campos, cuándo se muestran los errores, teclado del móvil y publicación. Irán en las specs de interfaz, orientadas por el [mockup de Figma](https://www.figma.com/proto/hAq16LKqkVc1jL0ss69W8K/Tank-calc?node-id=0-1).
- Lista de modelos de coche, coches propios y recordar datos entre visitas: feature 002.
- Historial de repostajes: feature 003.

## Preguntas abiertas
Ninguna.
