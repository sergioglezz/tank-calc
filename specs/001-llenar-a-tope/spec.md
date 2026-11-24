# Feature 001: Llenar a tope (cálculo)

## Resumen y objetivo
Base de tank-calc: el cálculo de «llenar a tope», sin interfaz. A partir de la capacidad del depósito, el nivel actual y el precio por litro (tal como los escribiría el usuario), la app sabe:
- comprobar si los datos son válidos y, si no lo son, explicar por qué en español;
- calcular cuántos litros faltan, cuánto cuesta llenar el depósito y qué importe en euros enteros se puede pedir sin pasarse;
- presentar esas cifras en formato español.

Objetivo: que lo que no puede fallar (los números) esté terminado y comprobado con tests antes de diseñar la interfaz. La pantalla se diseñará en Figma y tendrá sus propias specs, que usarán este cálculo.

## Historias de usuario
- Como conductor quiero saber cuántos euros cuesta llenar el depósito para poder pedirlo en caja.
- Como conductor quiero saber el importe en euros enteros que puedo pedir sin pasarme para que el surtidor no se corte antes de servir lo pagado.
- Como conductor quiero que se me explique qué dato está mal para no fiarme de un resultado erróneo.
- Como autor del proyecto quiero tener el cálculo cubierto por tests antes de construir la interfaz para poder diseñarla sin miedo a romper los números.

## Criterios de aceptación
**Lectura de los datos**
- CA1: Un número escrito con coma decimal (`1,579`) o con punto decimal (`1.579`) se interpreta como el mismo valor.
- CA2: Los espacios al principio y al final se ignoran.
- CA3: No se admiten como número: un texto vacío, letras, signos (`-3`, `+3`), notación científica (`1e3`), separadores de miles (`1.000,5`) ni más de un separador decimal.

**Validación**
- CA4: Datos válidos:
  - capacidad: mayor que 0 y como máximo 200 l, con un decimal como máximo;
  - nivel: entero entre 0 y 100 %, ambos incluidos;
  - precio: mayor que 0 y como máximo 5 €/l, con tres decimales como máximo.
- CA5: Para cada dato no válido, la validación da un mensaje en español que dice qué se espera, y distingue entre «está vacío» y «no es válido»:

| Dato | Vacío | No válido |
|---|---|---|
| Capacidad | «Introduce la capacidad del depósito.» | «Escribe una capacidad entre 0,1 y 200 litros, con un decimal como máximo.» |
| Nivel | «Introduce el nivel actual.» | «Escribe un porcentaje entero entre 0 y 100.» |
| Precio | «Introduce el precio por litro.» | «Escribe un precio entre 0,001 y 5 €/l, con tres decimales como máximo.» |

**Cálculo**
- CA6: Dados capacidad C, nivel N y precio P válidos:
  - litros que faltan = C × (100 − N) / 100;
  - importe exacto = litros que faltan × P, redondeado a céntimos;
  - importe sin pasarte = importe exacto **sin redondear**, truncado a euros enteros.
- CA7: Ejemplo de referencia: capacidad 50 l, nivel 25 %, precio 1,579 €/l → faltan 37,5 l; importe exacto 59,21 €; importe sin pasarte 59 €.
- CA8: El importe sin pasarte nunca se redondea hacia arriba: con un importe exacto de 47,83 € es 47 €, y con uno de 47,999 € (que se presenta como 48,00 €) sigue siendo 47 €.
- CA9: Si el importe exacto es un número entero de euros (p. ej. 60,00 €), el importe sin pasarte es ese mismo número (60 €), sin errores de precisión.
- CA10: Con el nivel al 100 %, el cálculo indica que el depósito está lleno en vez de devolver cifras a cero.
- CA11: Con el nivel al 0 %, el cálculo se hace con normalidad (faltan C litros).
- CA12: Con cualquier combinación de datos válidos, el resultado nunca contiene valores no numéricos ni infinitos (`NaN`, `Infinity`).

**Presentación de las cifras**
- CA13: Los euros se presentan en formato español con 2 decimales y el símbolo detrás (`59,21 €`); el importe sin pasarte, sin decimales (`59 €`); los litros con 2 decimales (`37,50 l`).

## Casos límite y errores
- **Falta menos de 1 € (nivel < 100 %):** el importe sin pasarte es 0 €. El cálculo devuelve igualmente los litros y el importe exacto; cómo se avisa al usuario lo decidirá la spec de interfaz.
- **Valores en los extremos:** 0,1 l y 200 l, 0 % y 100 %, 0,001 €/l y 5 €/l son válidos; 200,1 l, −1 %, 101 %, 50,5 % y 5,001 €/l no lo son.
- **Decimales de más:** `50,25` l o `1,5799` €/l no son válidos aunque estén dentro del rango.
- **Ceros a la derecha:** no cuentan como decimales. `50,0` % es un entero válido y `1,5790` €/l equivale a `1,579`.
- **Sin parte entera o sin decimales:** `,5` y `5,` no se admiten como número.

## Fuera de alcance
- **Cualquier interfaz:** pantallas, campos, botones, estilos, cuándo se muestran los errores, teclado del móvil, accesibilidad y diseño mobile-first. Irá en una o varias specs de interfaz basadas en el diseño de Figma del autor.
- **Publicación en una URL pública:** sin interfaz no hay nada que publicar; va con la primera spec de interfaz.
- Modos «Llenar hasta X %» y «Tengo X €» (feature posterior).
- Lista de coches, coches propios, recordar datos entre visitas e historial.

### Para tener en cuenta en las specs de interfaz
Comportamientos que estaban en el borrador anterior de esta spec y que se decidirán con el diseño de Figma:
- el resultado se actualiza al momento, sin botón;
- los errores aparecen junto al campo y no se muestran en campos que el usuario aún no ha tocado;
- mientras falten datos o haya errores, no se muestra resultado;
- avisos de «el depósito ya está lleno» y de «lo que falta cuesta menos de 1 €»;
- teclado numérico con tecla decimal en el móvil, sin desplazamiento horizontal a 360 px e interfaz en español.

## Preguntas abiertas
Ninguna.
